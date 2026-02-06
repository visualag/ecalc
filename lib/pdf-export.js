// PDF Export utility using browser's print functionality
// Creates professional-looking printable documents

export const generatePDFContent = (title, data, options = {}) => {
  const { 
    subtitle = '',
    footer = 'Generat de eCalc.ro - Calculatoare Fiscale Profesionale',
    year = new Date().getFullYear(),
    showLogo = true,
  } = options;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Generate table rows from data
  const generateRows = (items) => {
    return items.map(item => {
      if (item.type === 'header') {
        return `<tr class="header-row"><td colspan="2" style="background: #f1f5f9; font-weight: 600; padding: 10px;">${item.label}</td></tr>`;
      }
      if (item.type === 'total') {
        return `<tr class="total-row" style="background: #10b981; color: white;"><td style="padding: 12px; font-weight: 600;">${item.label}</td><td style="padding: 12px; font-weight: 700; text-align: right;">${typeof item.value === 'number' ? formatCurrency(item.value) + ' RON' : item.value}</td></tr>`;
      }
      if (item.type === 'subtotal') {
        return `<tr style="background: #e0f2fe;"><td style="padding: 10px; font-weight: 600;">${item.label}</td><td style="padding: 10px; font-weight: 600; text-align: right;">${typeof item.value === 'number' ? formatCurrency(item.value) + ' RON' : item.value}</td></tr>`;
      }
      const valueStyle = item.negative ? 'color: #dc2626;' : item.positive ? 'color: #16a34a;' : '';
      return `<tr><td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.label}</td><td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; ${valueStyle}">${typeof item.value === 'number' ? formatCurrency(item.value) + ' RON' : item.value}</td></tr>`;
    }).join('');
  };

  const html = `
    <!DOCTYPE html>
    <html lang="ro">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #1e293b;
          padding: 40px;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-start;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .logo { 
          display: flex; 
          align-items: center; 
          gap: 12px;
        }
        .logo-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
        }
        .logo-text h1 { font-size: 24px; color: #1e293b; }
        .logo-text p { font-size: 12px; color: #64748b; }
        .date { text-align: right; color: #64748b; font-size: 12px; }
        .title-section { text-align: center; margin-bottom: 30px; }
        .title-section h2 { font-size: 28px; color: #1e293b; margin-bottom: 8px; }
        .title-section p { color: #64748b; font-size: 14px; }
        .content { margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-box { 
          background: #f8fafc; 
          border: 1px solid #e2e8f0; 
          border-radius: 8px; 
          padding: 16px; 
          margin-bottom: 20px;
        }
        .info-box h4 { color: #3b82f6; margin-bottom: 8px; font-size: 14px; }
        .info-box p { font-size: 12px; color: #64748b; }
        .footer { 
          border-top: 1px solid #e2e8f0; 
          padding-top: 20px; 
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
          color: #64748b;
          font-size: 11px;
        }
        .disclaimer {
          background: #fef3c7;
          border: 1px solid #fcd34d;
          border-radius: 8px;
          padding: 12px;
          margin-top: 20px;
          font-size: 11px;
          color: #92400e;
        }
        @media print {
          body { padding: 20px; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${showLogo ? `
          <div class="logo">
            <div class="logo-icon">e</div>
            <div class="logo-text">
              <h1>eCalc.ro</h1>
              <p>Calculatoare Fiscale Profesionale</p>
            </div>
          </div>
          ` : ''}
          <div class="date">
            <p>Data generării:</p>
            <p><strong>${formatDate()}</strong></p>
            <p style="margin-top: 8px;">An fiscal: <strong>${year}</strong></p>
          </div>
        </div>

        <div class="title-section">
          <h2>${title}</h2>
          ${subtitle ? `<p>${subtitle}</p>` : ''}
        </div>

        <div class="content">
          <table>
            ${generateRows(data)}
          </table>
        </div>

        <div class="disclaimer">
          <strong>Notă:</strong> Acest document are caracter informativ și nu constituie consiliere fiscală sau juridică. 
          Calculele sunt orientative și pot diferi de situația reală. Pentru situații complexe, consultați un specialist.
        </div>

        <div class="footer">
          <span>${footer}</span>
          <span>© ${year} eCalc.ro</span>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
};

// Open print dialog with formatted content
export const printPDF = (title, data, options = {}) => {
  const html = generatePDFContent(title, data, options);
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }
};

// Generate salary slip (Fluturaș de salariu)
export const generateSalarySlip = (result, options = {}) => {
  const { employeeName = 'Angajat', month = 'Curent', year = 2026 } = options;
  
  const data = [
    { type: 'header', label: 'INFORMAȚII ANGAJAT' },
    { label: 'Nume angajat', value: employeeName },
    { label: 'Perioada', value: `${month} ${year}` },
    
    { type: 'header', label: 'VENITURI' },
    { label: 'Salariu Brut', value: result.gross },
    result.voucherValue > 0 ? { label: 'Tichete de masă', value: result.voucherValue, positive: true } : null,
    
    { type: 'header', label: 'REȚINERI ANGAJAT' },
    { label: `CAS (${options.casRate || 25}%)`, value: result.cas, negative: true },
    { label: `CASS (${options.cassRate || 10}%)`, value: result.cass, negative: true },
    { label: `Impozit pe venit (${options.taxRate || 10}%)`, value: result.incomeTax, negative: true },
    result.personalDeduction > 0 ? { label: 'Deducere personală aplicată', value: result.personalDeduction, positive: true } : null,
    
    { type: 'subtotal', label: 'Total Rețineri', value: result.cas + result.cass + result.incomeTax },
    
    { type: 'total', label: 'SALARIU NET DE PLATĂ', value: result.net },
    
    { type: 'header', label: 'COSTURI ANGAJATOR' },
    { label: 'Salariu Brut', value: result.gross },
    { label: `CAM (${options.camRate || 2.25}%)`, value: result.cam },
    result.voucherValue > 0 ? { label: 'Tichete de masă', value: result.voucherValue } : null,
    
    { type: 'subtotal', label: 'Cost Total Angajator', value: result.totalCost },
  ].filter(Boolean);

  return data;
};

// Generate PFA comparison report
export const generatePFAReport = (comparison, options = {}) => {
  const data = [
    { type: 'header', label: 'DATE INTRODUCERE' },
    { label: 'Venit Anual Brut', value: comparison.sistemReal.yearlyIncome },
    { label: 'Cheltuieli Anuale', value: comparison.sistemReal.yearlyExpenses },
    
    { type: 'header', label: 'SISTEM REAL' },
    { label: 'Venit Net', value: comparison.sistemReal.netIncome },
    { label: 'CAS', value: comparison.sistemReal.cas, negative: true },
    { label: 'CASS', value: comparison.sistemReal.cass, negative: true },
    { label: 'Impozit', value: comparison.sistemReal.incomeTax, negative: true },
    { type: 'subtotal', label: 'Net Anual (Sistem Real)', value: comparison.sistemReal.finalNet },
    
    { type: 'header', label: 'NORMĂ DE VENIT' },
    { label: 'Normă aplicată', value: comparison.normaVenit.normAmount },
    { label: 'CAS', value: comparison.normaVenit.cas, negative: true },
    { label: 'CASS', value: comparison.normaVenit.cass, negative: true },
    { label: 'Impozit pe Normă', value: comparison.normaVenit.incomeTax, negative: true },
    { type: 'subtotal', label: 'Net Anual (Normă)', value: comparison.normaVenit.finalNet },
    
    { type: 'header', label: 'RECOMANDARE' },
    { type: 'total', label: comparison.comparison.betterOption === 'norma_venit' ? 'NORMĂ DE VENIT' : 'SISTEM REAL', value: `Economie: ${comparison.comparison.yearlySavings.toFixed(2)} RON/an` },
  ];

  return data;
};

// Generate medical leave report
export const generateMedicalLeaveReport = (result, options = {}) => {
  const data = [
    { type: 'header', label: 'DATE CONCEDIU MEDICAL' },
    { label: 'Cod indemnizație', value: `${result.sickCode} - ${result.sickInfo.name}` },
    { label: 'Număr zile', value: `${result.days} zile` },
    { label: 'Procent aplicat', value: `${result.rate}%` },
    
    { type: 'header', label: 'CALCUL INDEMNIZAȚIE' },
    { label: 'Salariu mediu', value: result.baseInfo.averageSalary },
    { label: 'Bază zilnică', value: result.baseInfo.base },
    { label: 'Indemnizație zilnică', value: result.dailyIndemnity },
    
    { type: 'header', label: 'PLĂTITORI' },
    { label: `Angajator (${result.split.employerDays} zile)`, value: result.split.employerAmount },
    { label: `FNUASS (${result.split.fnuassDays} zile)`, value: result.split.fnuassAmount },
    
    { type: 'total', label: 'TOTAL INDEMNIZAȚIE', value: result.netIndemnity },
  ];

  return data;
};
