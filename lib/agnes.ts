import products from "@/data/products.json";
import type { ListingCopy, MatchedItem, Product, Style } from "./types";

const BASE_URL = process.env.AGNES_BASE_URL ?? "https://apihub.agnes-ai.com/v1";
const API_KEY = process.env.AGNES_API_KEY;

function authHeaders(extra?: Record<string, string>) {
  return {
    Authorization: `Bearer ${API_KEY}`,
    ...extra,
  };
}

export const STYLE_PROMPTS: Record<Style, string> = {
  scandi:
    "Restyle this room in a Scandinavian interior design style: light oak wood tones, white and cream walls, cozy linen textiles, rattan accents, minimal clutter, soft natural daylight.",
  muji:
    "Restyle this room in a Muji-inspired minimalist style: neutral unbleached cotton and pine tones, low-profile furniture, clean lines, hidden storage, calm uncluttered atmosphere, soft diffused light.",
  luxe:
    "Restyle this room in a luxe modern style: velvet upholstery in jewel tones, brass and gold accents, marble surfaces, statement lighting, layered rugs, sophisticated and glamorous atmosphere.",
  industrial:
    "Restyle this room in an industrial loft style: exposed brick or concrete textures, black metal fixtures, reclaimed wood furniture, leather accents, Edison bulb lighting, raw and edgy atmosphere.",
};

/**
 * Vision call to identify the room type, so the restyle prompt can explicitly
 * preserve the room's function and built-in fixtures (e.g. don't turn a kitchen into a bedroom).
 */
export async function detectRoomType(imageDataUrl: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      model: "agnes-2.0-flash",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "What type of room is shown in this photo? Respond with ONLY one or two words " +
                "(e.g. kitchen, bedroom, living room, bathroom, home office, dining room, hallway).",
            },
            {
              type: "image_url",
              image_url: { url: imageDataUrl },
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) return "room";

  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content ?? "room";
  return String(raw).trim().toLowerCase().replace(/[^a-z\s]/g, "") || "room";
}

function buildRestylePrompt(style: Style, roomType: string, additions: string[] = []): string {
  const additionsText =
    additions.length > 0
      ? ` Also add the following to the room, styled to match: ${additions.join(", ")}.`
      : "";

  return (
    `This photo shows a ${roomType}. ${STYLE_PROMPTS[style]} ` +
    `This must remain a ${roomType} — keep all built-in fixtures, appliances, plumbing, and the room's function exactly as they are ` +
    `(do not add furniture or fixtures belonging to a different room type, e.g. do not add a bed, sofa, or dining table to a ${roomType} unless it normally has one).` +
    `${additionsText} ` +
    `Keep the room's exact layout, walls, windows, doors, and camera angle unchanged. Only restyle finishes, furniture, decor, and lighting.`
  );
}

async function fetchAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") ?? "image/png";
  return `data:${contentType};base64,${buf.toString("base64")}`;
}

/**
 * Image-to-image restyle via /v1/images/generations (agnes-image-2.1-flash).
 * Falls back to text-to-image generation (no source room geometry) if the
 * image-to-image request fails, so the pipeline still produces an "after" image.
 */
export interface RestyleResult {
  /** Data URL of the restyled image, for display in the browser. */
  image: string;
  /** Publicly accessible URL of the restyled image, if the API returned one (required for video generation). */
  sourceUrl: string | null;
}

export async function restyleRoom(
  imageDataUrl: string,
  style: Style,
  roomType?: string,
  additions: string[] = []
): Promise<RestyleResult> {
  const resolvedRoomType = roomType || (await detectRoomType(imageDataUrl));
  const prompt = buildRestylePrompt(style, resolvedRoomType, additions);

  const editRes = await fetch(`${BASE_URL}/images/generations`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      model: "agnes-image-2.1-flash",
      prompt,
      size: "1024x768",
      extra_body: {
        image: [imageDataUrl],
        response_format: "url",
      },
    }),
  });

  if (editRes.ok) {
    const data = await editRes.json();
    const item = data?.data?.[0];
    if (item?.url) return { image: await fetchAsDataUrl(item.url), sourceUrl: item.url };
    if (item?.b64_json) return { image: `data:image/png;base64,${item.b64_json}`, sourceUrl: null };
  }

  // Fallback: text-to-image generation (loses original room geometry).
  const genRes = await fetch(`${BASE_URL}/images/generations`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      model: "agnes-image-2.1-flash",
      prompt: `${prompt} A photo of an interior room.`,
      size: "1024x768",
      extra_body: {
        response_format: "url",
      },
    }),
  });

  if (!genRes.ok) {
    throw new Error(`Image generation failed: ${genRes.status} ${await genRes.text()}`);
  }

  const genData = await genRes.json();
  const item = genData?.data?.[0];
  if (item?.url) return { image: await fetchAsDataUrl(item.url), sourceUrl: item.url };
  if (item?.b64_json) return { image: `data:image/png;base64,${item.b64_json}`, sourceUrl: null };

  throw new Error("No image returned from generation response");
}

/**
 * Vision call over the "after" image to extract a list of furniture/decor items.
 */
export async function extractItems(
  imageDataUrl: string
): Promise<{ name: string; category: string }[]> {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      model: "agnes-2.0-flash",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "List the furniture and decor items visible in this room photo. " +
                'Respond with ONLY a JSON array of objects, each with "name" (short item name) ' +
                'and "category" (one of: sofa, armchair, coffee table, side table, dining table, ' +
                "bed frame, shelf, rug, cushion, curtains, pendant lamp, floor lamp, mirror, stool, mattress). " +
                "List at most 8 items. No prose, just the JSON array.",
            },
            {
              type: "image_url",
              image_url: { url: imageDataUrl },
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Item extraction failed: ${res.status} ${await res.text()}`);

  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content ?? "[]";
  const jsonMatch = String(raw).match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.name === "string")
      .map((item) => ({
        name: item.name,
        category: typeof item.category === "string" ? item.category : "",
      }));
  } catch {
    return [];
  }
}

/**
 * Match extracted items to the mock product catalog by style + category/keyword overlap.
 */
export function matchItemsToCatalog(
  items: { name: string; category: string }[],
  style: Style
): MatchedItem[] {
  const catalog = products as Product[];

  if (items.length === 0) {
    return catalog
      .filter((p) => p.style === style)
      .slice(0, 4)
      .map((product) => ({ name: product.name, category: product.category, product }));
  }

  return items.map((item) => {
    const category = item.category.toLowerCase().trim();
    const name = item.name.toLowerCase();

    let product =
      catalog.find((p) => p.style === style && p.category === category) ??
      catalog.find((p) => p.category === category) ??
      catalog.find(
        (p) =>
          p.style === style &&
          (name.includes(p.category) || p.category.includes(category))
      ) ??
      catalog.find((p) => p.style === style) ??
      null;

    return { name: item.name, category: item.category, product };
  });
}

/**
 * Generate a short listing title + description for the restyled room.
 */
export async function generateListingCopy(
  style: Style,
  items: { name: string; category: string }[]
): Promise<ListingCopy> {
  const itemList = items.map((i) => i.name).join(", ");

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      model: "agnes-2.0-flash",
      messages: [
        {
          role: "user",
          content:
            `Write a short property listing blurb for a room freshly staged in ${style} style, ` +
            `featuring: ${itemList || "tasteful matching furniture"}. ` +
            `Respond with ONLY JSON: {"title": "...", "description": "..."}. ` +
            `Title under 8 words. Description is 2-3 sentences, warm and inviting.`,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error(`Listing copy generation failed: ${res.status} ${await res.text()}`);

  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content ?? "{}";
  const jsonMatch = String(raw).match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { title: `${capitalize(style)} Styled Room`, description: "A beautifully staged space." };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      title: typeof parsed.title === "string" ? parsed.title : `${capitalize(style)} Styled Room`,
      description:
        typeof parsed.description === "string"
          ? parsed.description
          : "A beautifully staged space.",
    };
  } catch {
    return { title: `${capitalize(style)} Styled Room`, description: "A beautifully staged space." };
  }
}

/**
 * Kick off a video walkthrough generation from the "after" image, polling until ready.
 * Returns a playable URL to the generated video.
 */
export async function generateWalkthroughVideo(
  sourceImageUrl: string,
  style: Style
): Promise<string> {
  const createRes = await fetch(`${BASE_URL}/videos`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      model: "agnes-video-v2.0",
      prompt: `Slow, smooth camera pan and gentle zoom across this ${style}-styled room, like a real-estate walkthrough. Keep motion subtle and steady.`,
      image: sourceImageUrl,
      num_frames: 121,
      frame_rate: 24,
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Video generation failed: ${createRes.status} ${await createRes.text()}`);
  }

  const created = await createRes.json();
  const videoId: string | undefined = created?.video_id;
  if (!videoId) throw new Error("No video_id returned");

  const apiHost = BASE_URL.replace(/\/v1\/?$/, "");

  const maxAttempts = 60;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, 5000));

    const statusRes = await fetch(
      `${apiHost}/agnesapi?video_id=${encodeURIComponent(videoId)}&model_name=agnes-video-v2.0`,
      { headers: authHeaders() }
    );
    if (!statusRes.ok) continue;

    const result = await statusRes.json();
    const state = result?.status;

    if (state === "completed") {
      const url = result?.url ?? result?.video_url ?? result?.remixed_from_video_id;
      if (url) return url;
      throw new Error("Video completed but no video URL was returned");
    }
    if (state === "failed") {
      throw new Error(`Video generation failed: ${result?.error?.message ?? result?.error ?? "unknown error"}`);
    }
  }

  throw new Error("Video generation timed out");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
