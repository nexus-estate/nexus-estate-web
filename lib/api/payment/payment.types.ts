export interface PostingPackage {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  maxListings: number;
}

export interface PaymentOrder {
  id: string;
  listingId: string;
  amount: number;
  provider: string;
  status: string;
}
