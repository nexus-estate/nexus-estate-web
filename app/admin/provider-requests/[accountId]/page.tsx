'use client';

import { useParams } from 'next/navigation';
import { ProviderReviewWorkspace } from '@/components/administration/provider-review-workspace';

export default function ProviderRequestDetailPage() {
  const { accountId } = useParams<{ accountId: string }>();
  return (
    <ProviderReviewWorkspace key={accountId} initialAccountId={accountId} />
  );
}
