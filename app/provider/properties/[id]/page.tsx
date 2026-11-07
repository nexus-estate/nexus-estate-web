'use client';
import { useParams } from 'next/navigation';
import { PropertyDetail } from '@/components/provider/property/property-detail';
export default function ProviderPropertyPage() {
  const { id } = useParams<{ id: string }>();
  return <PropertyDetail id={id} />;
}
