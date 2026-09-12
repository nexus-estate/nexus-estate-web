export type ListingStatus =
  'draft' | 'pending_review' | 'published' | 'expired' | 'rejected' | string;

export interface Listing {
  id: string;
  propertyId: string;
  brokerId?: string;
  status: ListingStatus;
  viewCount: number;
  isFeatured?: boolean;
  createdAt: string;
}

export interface CreateListingInput {
  property: Record<string, unknown>;
}
