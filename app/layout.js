import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

// Automatizarea anului - se schimbă singur la fiecare revelion
const currentYear = new Date().getFullYear();

export const metadata = {
  metadataBase: new URL('https://ecalc.ro'),
  alternates: {
    canonical: '/',
  },
  title: {
    // Titlul Magnet pentru Home Page cu an automat
    default: `Calculator Salarii ${currentYear} PRO - Brut la Net & PFA vs SRL | eCalc.ro`,
    // Șablonul pentru paginile secundare
    template: `%s | eCalc.ro`
  },
  description: `Sistem profesional de calcul fiscal ${currentYear}. Calculator Salarii Brut/Net, PFA, e-Factura, Impozit Auto și Rentabilitate Imobiliară. Actualizat la zi conform legislației din România.`,
  // Keywords dinamice - includem și Vremea pe care ai adăugat-o
  keywords: `calculator salariu ${currentYear}, brut net ${currentYear}, calculator pfa ${currentYear}, pfa vs srl, impozit auto ${currentYear}, e-factura romania, prognoza meteo, vremea azi, starea vremii romania, vremea la munte, vremea la mare, vremea litoral, vremea munte, vremea ski`,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <body className={inter.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'eCalc RO',
              applicationCategory: 'FinanceApplication',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'RON',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '1250',
              },
            }),
          }}
        />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
