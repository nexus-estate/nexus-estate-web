export interface CreateLeadInput {
  name: string;
  phone: string;
  email?: string;
  message?: string;
}

export interface Lead {
  id: string;
  listingId: string;
  status: 'NEW' | 'CONTACTED' | 'CLOSED';
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  createdAt: string;
}
