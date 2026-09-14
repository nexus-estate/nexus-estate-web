export interface CreateLeadInput {
  listingId: string;
  name: string;
  phone: string;
  message?: string;
}

export interface Lead {
  id: string;
  listingId: string;
  brokerId?: string;
  name: string;
  phone: string;
  type?: string;
  status?: string;
}
