'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Briefcase, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function PFACalculatorPage() {
  const params = useParams();
  const year = parseInt(params?.year) || 2026;
  const [fiscalRules, setFiscalRules] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [system, setSystem] = useState('real');
  const [annualRevenue, setAnnualRevenue] = useState('');
  const [expenses, setExpenses] = useState('');
  const [normValue, setNormValue] = useState('30000');
  const [result, setResult] = useState(null);
  const [comparison, setComparison] = useState(null);

  useEffect(() => {
    loadFiscalRules();
  }, [year]);

  const loadFiscalRules = async () => {
    try {
      const response = await fetch(`/api/fiscal-rules/${year}`);
      const data = await response.json();
      setFiscalRules(data);
      setLoading(false);
    } catch (error) {
      toast.error('Eroare la încărcarea regulilor fiscale');
      setLoading(false);
    }
  };

  const calculateReal = () => {
    const revenue = parseFloat(annualRevenue);
    const exp = parseFloat(expenses) || 0;
    const netIncome = revenue - exp;
    
    const minSalary = fiscalRules.pfa.minimum_salary || 4050;
    const incomeTaxRate = (fiscalRules.pfa.income_tax_rate || 10) / 100;
    const cassRate = (fiscalRules.pfa.cass_rate || 10) / 100;
    const casRate = (fiscalRules.pfa.cas_rate || 25) / 100;
    
    const incomeTax = netIncome * incomeTaxRate;
    
    const minThresholdCASS = minSalary * (fiscalRules.pfa.cass_min_threshold || 6);
    const maxThresholdCASS = minSalary * (fiscalRules.pfa.cass_max_threshold || 60);
    let cassBase = Math.max(netIncome, minThresholdCASS);
    cassBase = Math.min(cassBase, maxThresholdCASS);
    const cass = cassBase * cassRate;
    
    const threshold12 = minSalary * (fiscalRules.pfa.cas_min_optional || 12);
    const threshold24 = minSalary * (fiscalRules.pfa.cas_obligatory_24 || 24);
    let cas = 0;
    let casStatus = 'Optional';
    
    if (netIncome < threshold12) {
      cas = 0;
      casStatus = 'Optional (sub 12 salarii minime)';
    } else if (netIncome < threshold24) {
      cas = threshold12 * casRate;
      casStatus = 'Obligatoriu la 12 salarii minime';
    } else {
      cas = threshold24 * casRate;
      casStatus = 'Obligatoriu la 24 salarii minime';
    }
    
    const totalTaxes = incomeTax + cass + cas;
    const netRemaining = revenue - exp - totalTaxes;
    const effectiveRate = (totalTaxes / revenue) * 100;
    
    return {
      system: 'Sistem Real',
      revenue,
      expenses: exp,
      netIncome,
      incomeTax,
      cass,
      cassBase,
      cas,
      casStatus,
      totalTaxes,
      netRemaining,
      effectiveRate,
      thresholds: {
        cassMin: minThresholdCASS,
        cassMax: maxThresholdCASS,
        cas12: threshold12,
        cas24: threshold24,
      },
    };
  };

  const calculateNorm = () => {
    const revenue = parseFloat(annualRevenue);
    const norm = parseFloat(normValue);
    
    const minSalary = fiscalRules.pfa.minimum_salary || 4050;
    const incomeTaxRate = (fiscalRules.pfa.income_tax_rate || 10) / 100;
    const cassRate = (fiscalRules.pfa.cass_rate || 10) / 100;
    const casRate = (fiscalRules.pfa.cas_rate || 25) / 100;
    
    const incomeTax = norm * incomeTaxRate;
    
    const minThresholdCASS = minSalary * (fiscalRules.pfa.cass_min_threshold || 6);
    const maxThresholdCASS = minSalary * (fiscalRules.pfa.cass_max_threshold || 60);
    let cassBase = Math.max(norm, minThresholdCASS);
    cassBase = Math.min(cassBase, maxThresholdCASS);
    const cass = cassBase * cassRate;
    
    const threshold12 = minSalary * (fiscalRules.pfa.cas_min_optional || 12);
    let cas = 0;
    let casStatus = 'Optional';
    
    if (norm < threshold12) {
      cas = 0;
      casStatus = 'Optional (normă sub 12 salarii)';
    } else {
      cas = threshold12 * casRate;
      casStatus = 'Obligatoriu la 12 salarii minime';
    }
    
    const totalTaxes = incomeTax + cass + cas;
    const netRemaining = revenue - totalTaxes;
    const effectiveRate = (totalTaxes / revenue) * 100;
    
    const normLimit = fiscalRules.pfa.norm_limit_eur || 25000;
    const overLimit = revenue > normLimit * 4.98;
    
    return {
      system: 'Normă de Venit',
      revenue,
      normValue: norm,
      incomeTax,
      cass,
      cassBase,
      cas,
      casStatus,
      totalTaxes,
      netRemaining,
      effectiveRate,
      normLimit: normLimit * 4.98,
      overLimit,
      thresholds: {
        cassMin: minThresholdCASS,
        cassMax: maxThresholdCASS,
        cas12: threshold12,
      },
    };
  };

  const calculate = () => {
    if (!fiscalRules || !annualRevenue || parseFloat(annualRevenue) <= 0) {
      toast.error('Introduceți venitul anual');
      return;
    }

    const realResult = calculateReal();
    const normResult = calculateNorm();
    
    setResult(system === 'real' ? realResult : normResult);
    setComparison({ real: realResult, norm: normResult });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Calculator PFA {year}</h1>
            <p className="text-sm text-slate-600">Sistem Real vs Normă de Venit • Plafoane CAS/CASS</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Date Intrare</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Sistem Impunere</Label>
                  <Select value={system} onValueChange={setSystem}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real">Sistem Real</SelectItem>
                      <SelectItem value="norm">Normă de Venit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Venit Brut Anual (RON)</Label>
                  <Input
                    type="number"
                    value={annualRevenue}
                    onChange={(e) => setAnnualRevenue(e.target.value)}
                    placeholder="ex: 150000"
                  />
                </div>

                {system === 'real' && (
                  <div>
                    <Label>Cheltuieli Deductibile (RON)</Label>
                    <Input
                      type="number"
                      value={expenses}
                      onChange={(e) => setExpenses(e.target.value)}
                      placeholder="ex: 40000"
                    />
                  </div>
                )}

                {system === 'norm' && (
                  <div>
                    <Label>Valoare Normă Anuală (RON)</Label>
                    <Input
                      type="number"
                      value={normValue}
                      onChange={(e) => setNormValue(e.target.value)}
                      placeholder="ex: 30000"
                    />
                    <p className="text-xs text-slate-500 mt-1">Depinde de județ și CAEN</p>
                  </div>
                )}

                <Button onClick={calculate} className="w-full">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Calculează
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {result ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{result.system} {year}</CardTitle>
                    <CardDescription>
                      Calcul complet cu plafoane CAS și CASS
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Venit Brut:</span>
                            <span className="font-bold">{result.revenue.toFixed(2)} RON</span>
                          </div>
                          {result.expenses !== undefined && (
                            <div className="flex justify-between text-red-600">
                              <span>- Cheltuieli:</span>
                              <span>-{result.expenses.toFixed(2)} RON</span>
                            </div>
                          )}
                          {result.netIncome !== undefined && (
                            <div className="flex justify-between font-medium">
                              <span>= Venit Net:</span>
                              <span>{result.netIncome.toFixed(2)} RON</span>
                            </div>
                          )}
                          {result.normValue !== undefined && (
                            <div className="flex justify-between font-medium">
                              <span>Valoare Normă:</span>
                              <span>{result.normValue.toFixed(2)} RON</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-red-600">
                            <span>- Impozit Venit (10%):</span>
                            <span>-{result.incomeTax.toFixed(2)} RON</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>- CASS (10%):</span>
                            <span>-{result.cass.toFixed(2)} RON</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            Bază: {result.cassBase.toFixed(2)} RON
                          </div>
                          <div className="flex justify-between text-red-600">
                            <span>- CAS (25%):</span>
                            <span>-{result.cas.toFixed(2)} RON</span>
                          </div>
                          <div className="text-xs text-slate-500">
                            {result.casStatus}
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-3 space-y-2">
                        <div className="flex justify-between text-lg">
                          <span className="font-semibold">Total Taxe:</span>
                          <span className="font-bold text-red-600">{result.totalTaxes.toFixed(2)} RON</span>
                        </div>
                        <div className="flex justify-between text-xl">
                          <span className="font-bold">NET Rămas:</span>
                          <span className="font-bold text-green-600">{result.netRemaining.toFixed(2)} RON</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600">
                          <span>Rată Efectivă:</span>
                          <span>{result.effectiveRate.toFixed(2)}%</span>
                        </div>
                      </div>

                      {result.overLimit && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div className="text-sm text-red-800">
                              <strong>ATENȚIE:</strong> Venitul depășește limita de {result.normLimit.toFixed(2)} RON pentru normă de venit!
                              Obligatoriu sistem real din anul următor.
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                        <h4 className="font-semibold mb-2 text-sm">Plafoane {year}:</h4>
                        <div className="text-xs space-y-1 text-slate-700">
                          <div>• CASS Min: {result.thresholds.cassMin.toFixed(2)} RON (6 salarii)</div>
                          <div>• CASS Max: {result.thresholds.cassMax.toFixed(2)} RON (60 salarii)</div>
                          <div>• CAS Optional sub: {result.thresholds.cas12.toFixed(2)} RON (12 salarii)</div>
                          {result.thresholds.cas24 && (
                            <div>• CAS Obligatoriu peste: {result.thresholds.cas24.toFixed(2)} RON (24 salarii)</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {comparison && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Comparație Sistem Real vs Normă</CardTitle>
                      <CardDescription>Care sistem este mai avantajos?</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Sistem</th>
                              <th className="text-right p-2">Taxe Totale</th>
                              <th className="text-right p-2">NET Rămas</th>
                              <th className="text-right p-2">Rată Efectivă</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className={`border-b ${comparison.real.netRemaining > comparison.norm.netRemaining ? 'bg-green-50' : ''}`}>
                              <td className="p-2 font-medium">Sistem Real</td>
                              <td className="text-right p-2 text-red-600">{comparison.real.totalTaxes.toFixed(2)} RON</td>
                              <td className="text-right p-2 font-bold text-green-600">{comparison.real.netRemaining.toFixed(2)} RON</td>
                              <td className="text-right p-2">{comparison.real.effectiveRate.toFixed(2)}%</td>
                            </tr>
                            <tr className={comparison.norm.netRemaining > comparison.real.netRemaining ? 'bg-green-50' : ''}>
                              <td className="p-2 font-medium">Normă de Venit</td>
                              <td className="text-right p-2 text-red-600">{comparison.norm.totalTaxes.toFixed(2)} RON</td>
                              <td className="text-right p-2 font-bold text-green-600">{comparison.norm.netRemaining.toFixed(2)} RON</td>
                              <td className="text-right p-2">{comparison.norm.effectiveRate.toFixed(2)}%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm text-green-800">
                          <strong>Recomandare:</strong> {comparison.real.netRemaining > comparison.norm.netRemaining ? 'Sistem Real' : 'Normă de Venit'} este mai avantajos.
                          Economisești {Math.abs(comparison.real.netRemaining - comparison.norm.netRemaining).toFixed(2)} RON anual.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-slate-500">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Introduceți datele și apăsați "Calculează"</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
