const currentYear = new Date().getFullYear();

export async function generateMetadata({ params }) {
  // Aici tragem anul direct din URL-ul [year]
  const year = params.year; 

  return {
    title: `Calculator PFA ${year} - Norma de Venit vs Sistem Real`,
    description: `Calculeaza taxele pentru PFA in ${year}: CAS, CASS si Impozit pe venit. Compara sistemul real cu norma de venit si vezi simularea PFA vs SRL.`,
    alternates: { 
      canonical: `/calculator-pfa/${year}` 
    }
  };
}

export default function Layout({ children }) {
  return <>{children}</>;
}
