import Footer from '@/components/Footer';
import Header from '@/components/Header';
import './marketplace.css';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketplace flex min-h-screen flex-1 flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
