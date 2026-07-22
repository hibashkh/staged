import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  restyleRoom,
  extractItems,
  matchItemsToCatalog,
} from "@/lib/agnes";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveDataUrlAsFile } from "@/lib/storage";
import { serializeRoom } from "@/lib/serializers";
import type { Style } from "@/lib/types";

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireUser();
  } catch {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  const userId = session.sub;

  try {
    const {
      image,
      style,
      roomType,
      additions,
      budget,
      inspirationImage,
      projectId,
      existingRoomId,
    } = await req.json();

    if (typeof image !== "string" || !image.startsWith("data:image")) {
      return NextResponse.json({ error: "Missing or invalid 'image' data URL" }, { status: 400 });
    }
    if (!["scandi", "muji", "luxe", "industrial", "inspiration"].includes(style)) {
      return NextResponse.json({ error: "Invalid 'style'" }, { status: 400 });
    }

    const safeInspirationImage =
      typeof inspirationImage === "string" && inspirationImage.startsWith("data:image")
        ? inspirationImage
        : undefined;

    const safeRoomType = typeof roomType === "string" && roomType ? roomType : undefined;
    const safeAdditions = Array.isArray(additions)
      ? additions.filter((a): a is string => typeof a === "string" && a.trim().length > 0)
      : [];
    const safeBudget = typeof budget === "number" && budget > 0 ? budget : undefined;

    let safeProjectId: string | null = null;
    if (typeof projectId === "string" && projectId) {
      const project = await prisma.project.findUnique({ where: { id: projectId } });
      if (!project || project.userId !== userId) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      safeProjectId = projectId;
    }

    let roomId: string;
    if (typeof existingRoomId === "string" && existingRoomId) {
      const existing = await prisma.room.findUnique({ where: { id: existingRoomId } });
      if (!existing || existing.userId !== userId) {
        return NextResponse.json({ error: "Room not found" }, { status: 404 });
      }
      roomId = existingRoomId;
    } else {
      roomId = randomUUID();
    }

    const { image: afterImageDataUrl, sourceUrl } = await restyleRoom(
      image,
      style as Style,
      safeRoomType,
      safeAdditions,
      safeInspirationImage
    );
    const rawItems = await extractItems(afterImageDataUrl);
    const { items, totalCost } = matchItemsToCatalog(rawItems, style as Style, safeBudget);

    const beforePath = await saveDataUrlAsFile(image, userId, `${roomId}-before`);
    const afterPath = await saveDataUrlAsFile(afterImageDataUrl, userId, `${roomId}-after`);

    const room = await prisma.room.upsert({
      where: { id: roomId },
      create: {
        id: roomId,
        userId,
        projectId: safeProjectId,
        beforeImage: beforePath,
        afterImage: afterPath,
        style,
        itemsJson: JSON.stringify(items),
        sourceUrl: sourceUrl ?? null,
        budget: safeBudget ?? null,
        totalCost,
      },
      update: {
        projectId: safeProjectId,
        beforeImage: beforePath,
        afterImage: afterPath,
        style,
        itemsJson: JSON.stringify(items),
        sourceUrl: sourceUrl ?? null,
        budget: safeBudget ?? null,
        totalCost,
        videoUrl: null,
        videoError: null,
        videoLoading: false,
      },
    });

    if (safeProjectId) {
      await prisma.project.update({
        where: { id: safeProjectId },
        data: { style, roomType: safeRoomType ?? null, budget: safeBudget ?? null },
      });
    }

    return NextResponse.json({ room: serializeRoom(room) });
  } catch (err: any) {
    console.error("generate room failed:", err);
    return NextResponse.json(
      { error: err?.message ?? "Generation failed" },
      { status: 500 }
    );
  }
}
