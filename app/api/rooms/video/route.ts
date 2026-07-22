import { NextRequest, NextResponse } from "next/server";
import { generateWalkthroughVideo } from "@/lib/agnes";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Style } from "@/lib/types";

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireUser();
  } catch {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { roomId } = await req.json();
  if (typeof roomId !== "string" || !roomId) {
    return NextResponse.json({ error: "Missing 'roomId'" }, { status: 400 });
  }

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room || room.userId !== session.sub) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (!room.sourceUrl) {
    const updated = await prisma.room.update({
      where: { id: roomId },
      data: { videoUrl: null, videoError: "No image URL available for video generation", videoLoading: false },
    });
    return NextResponse.json({ videoUrl: updated.videoUrl, videoError: updated.videoError });
  }

  try {
    const videoUrl = await generateWalkthroughVideo(room.sourceUrl, room.style as Style);
    const updated = await prisma.room.update({
      where: { id: roomId },
      data: { videoUrl, videoError: null, videoLoading: false },
    });
    return NextResponse.json({ videoUrl: updated.videoUrl, videoError: null });
  } catch (err: any) {
    console.error("video walkthrough generation failed:", err);
    const errorMessage = err?.message ?? "Video generation failed";
    await prisma.room
      .update({ where: { id: roomId }, data: { videoUrl: null, videoError: errorMessage, videoLoading: false } })
      .catch(() => {});
    return NextResponse.json({ videoUrl: null, videoError: errorMessage });
  }
}
