import type { Room as PrismaRoom, Project as PrismaProject } from "@prisma/client";
import type { Room, Project, Style } from "@/lib/types";

export function serializeRoom(row: PrismaRoom): Room {
  return {
    id: row.id,
    createdAt: row.createdAt.getTime(),
    beforeImage: row.beforeImage,
    style: row.style as Style,
    afterImage: row.afterImage,
    items: JSON.parse(row.itemsJson),
    listingCopy: row.listingCopyJson ? JSON.parse(row.listingCopyJson) : null,
    videoUrl: row.videoUrl,
    videoError: row.videoError,
    sourceUrl: row.sourceUrl,
    videoLoading: row.videoLoading,
    budget: row.budget,
    totalCost: row.totalCost ?? undefined,
    projectId: row.projectId,
  };
}

export function serializeProject(row: PrismaProject): Project {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.createdAt.getTime(),
    style: (row.style as Style | null) ?? undefined,
    roomType: row.roomType ?? undefined,
    budget: row.budget,
  };
}
