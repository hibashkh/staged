import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteRoomFiles } from "@/lib/storage";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  let session;
  try {
    session = await requireUser();
  } catch {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const room = await prisma.room.findUnique({ where: { id: params.id } });
  if (!room || room.userId !== session.sub) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  await prisma.room.delete({ where: { id: params.id } });
  await deleteRoomFiles(session.sub, params.id);

  return NextResponse.json({ ok: true });
}
