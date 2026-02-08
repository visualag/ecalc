const currentYear = new Date().getFullYear();

export const metadata = {
  title: `Calculator Impozit Auto ${currentYear} - Calcul Capacitate Cilindrica`,
  description: `Afla cat este impozitul auto in ${currentYear} conform noilor reglementari fiscale pentru masini hibride, electrice si diesel/benzina.`,
  alternates: { 
    canonical: '/impozit-auto' 
  }
};

export default function Layout({ children }) {
  return <>{children}</>;
}
