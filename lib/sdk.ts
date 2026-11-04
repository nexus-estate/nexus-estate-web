/** Display model used by the legacy featured-properties component. */
export interface Property {
  id: string;
  title: string;
  type: string;
  purpose: string;
  price?: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  city?: string;
  district?: string;
  images?: string[];
}
