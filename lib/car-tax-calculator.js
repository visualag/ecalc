// Car Tax Calculator Engine - Romania
// Calculează impozitul auto bazat pe capacitate cilindrică, tip vehicul, coeficient regional

export class CarTaxCalculator {
  constructor(fiscalRules) {
    this.rules = fiscalRules.car_tax;
  }

  // Coeficienți pentru localități
  static LOCATION_COEFFICIENTS = {
    'bucurești': 1.0,
    'cluj-napoca': 1.0,
    'timișoara': 1.0,
    'iași': 0.95,
    'constanța': 1.0,
    'craiova': 0.90,
    'brașov': 1.0,
    'galați': 0.85,
    'ploiești': 0.90,
    'oradea': 0.90,
    'brăila': 0.85,
    'arad': 0.90,
    'pitești': 0.90,
    'sibiu': 0.95,
    'bacău': 0.85,
    'târgu mureș': 0.90,
    'baia mare': 0.85,
    'buzău': 0.85,
    'botoșani': 0.80,
    'satu mare': 0.85,
    'rural': 0.70,
    'oraș mic': 0.80,
    'municipiu': 0.90,
    'reședință': 1.0,
  };

  // Tipuri de vehicule
  static VEHICLE_TYPES = {
    'autoturism': { name: 'Autoturism', multiplier: 1.0 },
    'suv': { name: 'SUV / Crossover', multiplier: 1.1 },
    'autoutilitar': { name: 'Autoutilitară', multiplier: 0.8 },
    'motocicletă': { name: 'Motocicletă', multiplier: 0.5 },
    'atv': { name: 'ATV', multiplier: 0.6 },
    'remorcă': { name: 'Remorcă', multiplier: 0.3 },
    'electric': { name: 'Electric', multiplier: 0.0 },
    'hibrid': { name: 'Hibrid', multiplier: 0.5 },
  };

  // Calculează taxa de bază pe capacitate cilindrică
  calculateBaseTax(engineCC) {
    if (engineCC <= 1600) {
      return this.rules?.under_1600 || 72;
    } else if (engineCC <= 2000) {
      return this.rules?.from_1601_to_2000 || 144;
    } else if (engineCC <= 2600) {
      return this.rules?.from_2001_to_2600 || 288;
    } else if (engineCC <= 3000) {
      return this.rules?.from_2601_to_3000 || 432;
    } else {
      return this.rules?.over_3000 || 576;
    }
  }

  // Calculează taxa pentru motociclete
  calculateMotorcycleTax(engineCC) {
    if (engineCC <= 1600) {
      return this.rules?.motorcycle_under_1600 || 25;
    } else {
      return this.rules?.motorcycle_over_1600 || 50;
    }
  }

  // Calcul complet impozit auto
  calculate(options) {
    const {
      engineCC = 1600,
      vehicleType = 'autoturism',
      location = 'bucurești',
      registrationYear = new Date().getFullYear(),
      isCompany = false,
    } = options;

    // Verifică dacă e electric (scutit)
    if (vehicleType === 'electric' && this.rules?.electric_exempt) {
      return {
        engineCC,
        vehicleType,
        vehicleTypeName: CarTaxCalculator.VEHICLE_TYPES[vehicleType]?.name || vehicleType,
        location,
        baseTax: 0,
        locationCoefficient: 0,
        typeMultiplier: 0,
        finalTax: 0,
        taxExempt: true,
        exemptReason: 'Vehicul electric - scutit de impozit',
        quarterly: 0,
        monthly: 0,
      };
    }

    // Taxa de bază
    let baseTax;
    if (vehicleType === 'motocicletă') {
      baseTax = this.calculateMotorcycleTax(engineCC);
    } else {
      baseTax = this.calculateBaseTax(engineCC);
    }

    // Coeficient locație
    const locationCoeff = CarTaxCalculator.LOCATION_COEFFICIENTS[location.toLowerCase()] || 0.9;

    // Multiplicator tip vehicul
    const typeInfo = CarTaxCalculator.VEHICLE_TYPES[vehicleType] || { multiplier: 1.0 };
    let typeMultiplier = typeInfo.multiplier;

    // Reducere hibrid
    if (vehicleType === 'hibrid' && this.rules?.hybrid_reduction) {
      typeMultiplier = (100 - this.rules.hybrid_reduction) / 100;
    }

    // Vechime auto (scădere pentru vehicule vechi - opțional per localitate)
    const currentYear = new Date().getFullYear();
    const age = currentYear - registrationYear;
    let ageReduction = 0;
    if (age > 15) ageReduction = 0.1; // 10% reducere pentru >15 ani
    if (age > 20) ageReduction = 0.15; // 15% reducere pentru >20 ani

    // Calcul final
    const taxBeforeLocation = baseTax * typeMultiplier * (1 - ageReduction);
    const finalTax = Math.round(taxBeforeLocation * locationCoeff);

    return {
      engineCC,
      vehicleType,
      vehicleTypeName: typeInfo.name || vehicleType,
      location,
      registrationYear,
      vehicleAge: age,
      baseTax,
      locationCoefficient: locationCoeff,
      typeMultiplier,
      ageReduction,
      taxBeforeLocation,
      finalTax,
      taxExempt: false,
      quarterly: Math.round(finalTax / 4),
      monthly: Math.round(finalTax / 12),
      // Info detalii
      breakdown: {
        step1_base: `Baza: ${baseTax} RON (capacitate ${engineCC} cmc)`,
        step2_type: `× Tip vehicul: ${typeMultiplier.toFixed(2)}`,
        step3_age: age > 15 ? `× Reducere vechime: ${((1 - ageReduction) * 100).toFixed(0)}%` : null,
        step4_location: `× Coef. locație: ${locationCoeff.toFixed(2)}`,
        step5_final: `= Impozit anual: ${finalTax} RON`,
      },
    };
  }

  // Comparație între diferite localități
  compareLocations(engineCC, vehicleType = 'autoturism') {
    const locations = ['bucurești', 'cluj-napoca', 'rural', 'oraș mic', 'municipiu'];
    const results = locations.map(location => {
      const calc = this.calculate({ engineCC, vehicleType, location });
      return {
        location,
        tax: calc.finalTax,
        coefficient: calc.locationCoefficient,
      };
    });
    
    results.sort((a, b) => a.tax - b.tax);
    
    return {
      engineCC,
      vehicleType,
      results,
      cheapest: results[0],
      mostExpensive: results[results.length - 1],
      savings: results[results.length - 1].tax - results[0].tax,
    };
  }

  // Calculează impozit pentru flotă de vehicule
  calculateFleet(vehicles) {
    let totalTax = 0;
    const breakdown = vehicles.map((v, index) => {
      const result = this.calculate(v);
      totalTax += result.finalTax;
      return {
        index: index + 1,
        ...v,
        tax: result.finalTax,
        result,
      };
    });

    return {
      vehicles: breakdown,
      totalTax,
      averageTax: totalTax / vehicles.length,
      quarterlyTotal: Math.round(totalTax / 4),
    };
  }

  // Estimare cost total de proprietate (TCO) anual
  estimateTCO(options) {
    const { engineCC, fuelType = 'benzină', kmPerYear = 15000, fuelPrice = 7, consumption = 8 } = options;
    
    const taxResult = this.calculate(options);
    
    // Estimări costuri
    const fuelCost = (kmPerYear / 100) * consumption * fuelPrice;
    const insuranceRCA = engineCC > 2000 ? 1500 : engineCC > 1600 ? 1200 : 800;
    const insuranceCASCO = engineCC > 2000 ? 3000 : engineCC > 1600 ? 2000 : 1200; // opțional
    const itp = engineCC > 2000 ? 200 : 150;
    const maintenance = kmPerYear * 0.15; // ~0.15 RON/km
    const tires = 1500; // estimare anualizată
    const parking = 1200; // estimare

    const totalWithCASCO = taxResult.finalTax + fuelCost + insuranceRCA + insuranceCASCO + itp + maintenance + tires + parking;
    const totalWithoutCASCO = taxResult.finalTax + fuelCost + insuranceRCA + itp + maintenance + tires + parking;

    return {
      tax: taxResult.finalTax,
      fuelCost: Math.round(fuelCost),
      insuranceRCA,
      insuranceCASCO,
      itp,
      maintenance: Math.round(maintenance),
      tires,
      parking,
      totalWithCASCO: Math.round(totalWithCASCO),
      totalWithoutCASCO: Math.round(totalWithoutCASCO),
      monthlyWithCASCO: Math.round(totalWithCASCO / 12),
      monthlyWithoutCASCO: Math.round(totalWithoutCASCO / 12),
      costPerKm: (totalWithoutCASCO / kmPerYear).toFixed(2),
    };
  }
}

// Export constante pentru UI
export const VEHICLE_TYPES = CarTaxCalculator.VEHICLE_TYPES;
export const LOCATION_COEFFICIENTS = CarTaxCalculator.LOCATION_COEFFICIENTS;
