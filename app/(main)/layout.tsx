import { getTranslations } from 'next-intl/server';
import Footer from '@/components/Footer';
import Header from '@/components/Header';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('common');

  return (
    <>
      <a href="#main-content" className="skip-link">
        {t('a11y.skipToContent')}
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
