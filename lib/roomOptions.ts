export const ROOM_TYPES = [
  "living room",
  "bedroom",
  "kitchen",
  "bathroom",
  "dining room",
  "home office",
  "hallway",
] as const;

export type RoomType = (typeof ROOM_TYPES)[number];

export const FURNITURE_SUGGESTIONS: Record<RoomType, string[]> = {
  "living room": ["Sofa", "Armchair", "Coffee table", "TV stand", "Rug", "Floor lamp", "Bookshelf"],
  bedroom: ["Bed frame", "Nightstand", "Wardrobe", "Dresser", "Reading chair", "Mirror", "Rug"],
  kitchen: ["Bar stools", "Kitchen island", "Open shelving", "Pendant lighting", "Dining nook table", "Fruit bowl / decor"],
  bathroom: ["Storage cabinet", "Bath mat", "Mirror", "Towel rack", "Plant", "Stool"],
  "dining room": ["Dining table", "Dining chairs", "Sideboard", "Pendant lamp", "Rug", "Wall art"],
  "home office": ["Desk", "Office chair", "Bookshelf", "Desk lamp", "Storage cabinet", "Rug"],
  hallway: ["Console table", "Mirror", "Coat rack", "Bench", "Runner rug", "Wall art"],
};
