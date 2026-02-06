// Rights Calculator Engine - Romania
// e-Factura deadlines & penalties + EU261 flight compensation

export class RightsCalculator {
  constructor(fiscalRules) {
    this.efacturaRules = fiscalRules?.efactura || {};
    this.flightRules = fiscalRules?.flight || {};
  }

  // e-Factura: Calculează deadline-ul de transmitere
  calculateEfacturaDeadline(invoiceDate, companyType = 'micro') {
    const date = new Date(invoiceDate);
    const businessDays = this.efacturaRules.business_days || 5;
    
    // Adăugăm zilele lucrătoare
    let daysAdded = 0;
    const deadline = new Date(date);
    
    while (daysAdded < businessDays) {
      deadline.setDate(deadline.getDate() + 1);
      const dayOfWeek = deadline.getDay();
      // Excludem weekend
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // TODO: Excludem și sărbătorile legale din România
        daysAdded++;
      }
    }

    const now = new Date();
    const isOverdue = now > deadline;
    const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

    return {
      invoiceDate: date,
      deadline,
      deadlineFormatted: deadline.toLocaleDateString('ro-RO'),
      businessDays,
      isOverdue,
      daysUntilDeadline,
      daysOverdue: isOverdue ? Math.abs(daysUntilDeadline) : 0,
      status: isOverdue ? 'ÎNTÂRZIAT' : daysUntilDeadline <= 1 ? 'URGENT' : 'OK',
    };
  }

  // e-Factura: Calculează amenzile potențiale
  calculateEfacturaPenalty(companyType = 'micro', invoiceCount = 1) {
    let minFine, maxFine;
    
    switch(companyType) {
      case 'micro':
        minFine = this.efacturaRules.fine_min_micro || 1000;
        maxFine = this.efacturaRules.fine_max_micro || 5000;
        break;
      case 'medium':
        minFine = this.efacturaRules.fine_min_medium || 5000;
        maxFine = this.efacturaRules.fine_max_medium || 10000;
        break;
      case 'large':
        minFine = this.efacturaRules.fine_min_large || 10000;
        maxFine = this.efacturaRules.fine_max_large || 25000;
        break;
      default:
        minFine = 1000;
        maxFine = 5000;
    }

    return {
      companyType,
      invoiceCount,
      fineRange: {
        min: minFine,
        max: maxFine,
      },
      // Estimare medie pentru mai multe facturi
      totalEstimatedFine: {
        min: minFine * invoiceCount,
        max: maxFine * invoiceCount,
      },
      warning: invoiceCount > 3 
        ? 'ATENȚIE: Amenzile se pot cumula pentru fiecare factură netransmisă!'
        : null,
    };
  }

  // e-Factura: Verifică mai multe facturi
  checkMultipleInvoices(invoices) {
    const results = invoices.map((inv, index) => ({
      index: index + 1,
      invoiceNumber: inv.number || `Factura #${index + 1}`,
      ...this.calculateEfacturaDeadline(inv.date, inv.companyType),
    }));

    const overdue = results.filter(r => r.isOverdue);
    const urgent = results.filter(r => !r.isOverdue && r.daysUntilDeadline <= 1);
    const ok = results.filter(r => !r.isOverdue && r.daysUntilDeadline > 1);

    return {
      invoices: results,
      summary: {
        total: results.length,
        overdue: overdue.length,
        urgent: urgent.length,
        ok: ok.length,
      },
      warnings: overdue.length > 0 
        ? `ATENȚIE: ${overdue.length} facturi au depășit termenul!`
        : urgent.length > 0 
        ? `${urgent.length} facturi au termen mâine!`
        : 'Toate facturile sunt în termen.',
    };
  }

  // EU261: Calculează compensația pentru zbor
  calculateFlightCompensation(options) {
    const {
      flightDistance, // în km
      delayHours = 0,
      isCancelled = false,
      isDeniedBoarding = false,
      isEUDeparture = true,
      isEUCarrier = true,
      flightDate = new Date(),
    } = options;

    // Verifică eligibilitatea - zborul trebuie să fie din UE sau cu o companie UE
    const isEligible = isEUDeparture || isEUCarrier;
    
    if (!isEligible) {
      return {
        eligible: false,
        compensation: 0,
        reason: 'Zborul nu este acoperit de Regulamentul EU261 (nici plecarea nu e din UE, nici compania nu e europeană)',
      };
    }

    // Verifică întârzierea minimă
    const minDelayHours = this.flightRules.minimum_delay_hours || 3;
    if (!isCancelled && !isDeniedBoarding && delayHours < minDelayHours) {
      return {
        eligible: false,
        compensation: 0,
        reason: `Întârzierea de ${delayHours} ore este sub minimul de ${minDelayHours} ore necesar pentru compensație`,
      };
    }

    // Calculează compensația bazată pe distanță
    let compensation;
    if (flightDistance < 1500) {
      compensation = this.flightRules.under_1500km || 250;
    } else if (flightDistance <= 3500) {
      compensation = this.flightRules.from_1500_to_3500km || 400;
    } else {
      compensation = this.flightRules.over_3500km || 600;
    }

    // Reducere 50% pentru întârzieri medii la destinație
    let reductionApplied = false;
    if (!isCancelled && !isDeniedBoarding) {
      // Dacă întârzierea la sosire e între 3-4 ore pentru <1500km, 50% reducere
      if (delayHours >= 3 && delayHours < 4 && flightDistance < 1500) {
        compensation = compensation * 0.5;
        reductionApplied = true;
      }
    }

    // Calculează termenul de prescripție (3 ani în România)
    const prescriptionYears = 3;
    const flightDateObj = new Date(flightDate);
    const prescriptionDate = new Date(flightDateObj);
    prescriptionDate.setFullYear(prescriptionDate.getFullYear() + prescriptionYears);
    
    const now = new Date();
    const isPrescribed = now > prescriptionDate;
    const daysUntilPrescription = Math.ceil((prescriptionDate - now) / (1000 * 60 * 60 * 24));

    return {
      eligible: !isPrescribed,
      compensation,
      reductionApplied,
      details: {
        flightDistance,
        delayHours,
        isCancelled,
        isDeniedBoarding,
        isEUDeparture,
        isEUCarrier,
      },
      prescription: {
        flightDate: flightDateObj,
        prescriptionDate,
        isPrescribed,
        daysUntilPrescription: isPrescribed ? 0 : daysUntilPrescription,
        yearsRemaining: isPrescribed ? 0 : (daysUntilPrescription / 365).toFixed(1),
      },
      reason: isCancelled 
        ? 'Zbor anulat - aveți dreptul la compensație'
        : isDeniedBoarding 
        ? 'Refuz îmbarcare - aveți dreptul la compensație'
        : `Întârziere de ${delayHours} ore - aveți dreptul la compensație`,
      nextSteps: [
        'Păstrați biletul de avion și confirmarea rezervării',
        'Obțineți confirmare scrisă a întârzierii/anulării de la companie',
        'Trimiteți o cerere scrisă companiei aeriene',
        'Dacă refuză, puteți depune plângere la AACR sau puteți acționa în instanță',
      ],
    };
  }

  // EU261: Ajutor pentru estimarea distanței
  static COMMON_ROUTES = {
    'bucurești-londra': 2100,
    'bucurești-paris': 1850,
    'bucurești-berlin': 1300,
    'bucurești-roma': 1150,
    'bucurești-madrid': 2500,
    'bucurești-amsterdam': 1900,
    'bucurești-viena': 650,
    'bucurești-dubai': 3500,
    'bucurești-new-york': 8000,
    'cluj-londra': 2000,
    'cluj-munchen': 900,
    'timișoara-dortmund': 1200,
  };

  getRouteDistance(departure, arrival) {
    const key = `${departure.toLowerCase()}-${arrival.toLowerCase()}`;
    const reverseKey = `${arrival.toLowerCase()}-${departure.toLowerCase()}`;
    
    return RightsCalculator.COMMON_ROUTES[key] || 
           RightsCalculator.COMMON_ROUTES[reverseKey] || 
           null;
  }

  // Calculează compensații pentru mai multe zboruri (grup)
  calculateGroupCompensation(flights) {
    const results = flights.map((flight, index) => ({
      index: index + 1,
      ...flight,
      result: this.calculateFlightCompensation(flight),
    }));

    const eligible = results.filter(r => r.result.eligible);
    const totalCompensation = eligible.reduce((sum, r) => sum + r.result.compensation, 0);

    return {
      flights: results,
      summary: {
        totalFlights: flights.length,
        eligibleFlights: eligible.length,
        totalCompensation,
      },
    };
  }
}

// Export pentru UI
export const COMPANY_TYPES = {
  'micro': 'Microîntreprindere (< 500.000 EUR)',
  'medium': 'Întreprindere medie (500.000 - 1.000.000 EUR)',
  'large': 'Întreprindere mare (> 1.000.000 EUR)',
};

export const COMMON_ROUTES = RightsCalculator.COMMON_ROUTES;
