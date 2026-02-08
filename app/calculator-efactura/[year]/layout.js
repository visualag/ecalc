const currentYear = new Date().getFullYear();

export async function generateMetadata({ params }) {
  // Verificam daca ai segment de an in URL, daca nu, folosim currentYear
  const year = params.year || currentYear;

  return {
    title: `Calculator Termene e-Factura ${year} - Evita Amenzile ANAF`,
    description: `Verifica termenele limita pentru e-Factura in ${year}. Calculator B2B si B2C pentru a trimite facturile la timp si a evita sanctiunile ANAF.`,
    alternates: { 
      canonical: '/e-factura' 
    }
  };
}

export default function Layout({ children }) {
  return <>{children}</>;
}
