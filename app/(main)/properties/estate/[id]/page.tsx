import { redirect } from 'next/navigation';

// Estate activation alone does not make a marketplace listing public.
export default function EstateDetailPage() {
  redirect('/properties');
}
