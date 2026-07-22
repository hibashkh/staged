import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeProject } from "@/lib/serializers";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let session;
  try {
    session = await requireUser();
  } catch {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const existing = await prisma.project.findUnique({ where: { id: params.id } });
  if (!existing || existing.userId !== session.sub) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { style, roomType, budget } = await req.json();
  const project = await prisma.project.update({
    where: { id: params.id },
    data: {
      style: typeof style === "string" ? style : existing.style,
      roomType: typeof roomType === "string" ? roomType : existing.roomType,
      budget: typeof budget === "number" ? budget : existing.budget,
    },
  });

  return NextResponse.json({ project: serializeProject(project) });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  let session;
  try {
    session = await requireUser();
  } catch {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const existing = await prisma.project.findUnique({ where: { id: params.id } });
  if (!existing || existing.userId !== session.sub) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  await prisma.project.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
