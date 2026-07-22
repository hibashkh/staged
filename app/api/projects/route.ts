import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeProject } from "@/lib/serializers";

export async function GET() {
  let session;
  try {
    session = await requireUser();
  } catch {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ projects: projects.map(serializeProject) });
}

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await requireUser();
  } catch {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { name } = await req.json();
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Missing 'name'" }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: { userId: session.sub, name: name.trim() },
  });

  return NextResponse.json({ project: serializeProject(project) });
}
