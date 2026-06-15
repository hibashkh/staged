export type Style = "scandi" | "muji" | "luxe" | "industrial";

export interface Product {
  name: string;
  category: string;
  style: Style;
  retailer: string;
  price: number;
  url: string;
  thumbnail: string;
}

export interface MatchedItem {
  name: string;
  category: string;
  product: Product | null;
}

export interface ListingCopy {
  title: string;
  description: string;
}

export interface Room {
  id: string;
  createdAt: number;
  beforeImage: string;
  style: Style;
  afterImage: string | null;
  items: MatchedItem[];
  listingCopy: ListingCopy | null;
  videoUrl: string | null;
  videoError?: string | null;
  sourceUrl?: string | null;
  videoLoading?: boolean;
  budget?: number | null;
  totalCost?: number;
  projectId?: string | null;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
  style?: Style;
  roomType?: string;
  budget?: number | null;
}

export interface RoomVariant {
  afterImage: string;
  sourceUrl: string | null;
  items: MatchedItem[];
  totalCost: number;
}
