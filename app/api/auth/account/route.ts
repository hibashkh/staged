import { NextResponse } from "next/server";
import { requireUser, clearSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteUserFiles } from "@/lib/storage";

export async function DELETE() {
  let session;
  try {
    session = await requireUser();
  } catch {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  try {
    // Cascades to delete the user's rooms and projects (see prisma/schema.prisma).
    await prisma.user.delete({ where: { id: session.sub } });
    await deleteUserFiles(session.sub);
    clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("account deletion failed:", err);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
