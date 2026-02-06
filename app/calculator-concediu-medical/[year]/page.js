'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { HeartPulse, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function MedicalLeaveCalculatorPage() {
  const params = useParams();
  const year = parseInt(params?.year) || 2026;
  const [fiscalRules, setFiscalRules] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [codeType, setCodeType] = useState('01');
  const [daysTotal, setDaysTotal] = useState('');
  const [salaries, setSalaries] = useState([
    { month: 1, gross: '', days: '' },
    { month: 2, gross: '', days: '' },
    { month: 3, gross: '', days: '' },
    { month: 4, gross: '', days: '' },
    { month: 5, gross: '', days: '' },
    { month: 6, gross: '', days: '' },
  ]);
  const [result, setResult] = useState(null);

  const codes = {
    '01': { name: 'Boala obisnuita', rate: 75 },
    '06': { name: 'Urgenta medico-chirurgicala', rate: 100 },
    '08': { name: 'Maternitate', rate: 85 },
    '09': { name: 'Risc maternal', rate: 85 },
    '15': { name: 'Ingrijire copil', rate: 85 },
    '05': { name: 'Boala infectocontagioasa/carantina', rate: 100 },
  };

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

  const updateSalary = (index, field, value) => {
    const newSalaries = [...salaries];
    newSalaries[index][field] = value;
    setSalaries(newSalaries);
  };

  const calculate = () => {
    if (!fiscalRules || !daysTotal || parseInt(daysTotal) <= 0) {
      toast.error('Introduceți numărul de zile de concediu');
      return;
    }

    const validSalaries = salaries.filter(s => s.gross && parseFloat(s.gross) > 0);
    if (validSalaries.length < (fiscalRules.medical_leave?.minimum_months || 6)) {
      toast.error(`Trebuie să aveți minimum ${fiscalRules.medical_leave?.minimum_months || 6} luni de cotizare`);
      return;
    }

    const totalGross = validSalaries.reduce((sum, s) => sum + parseFloat(s.gross), 0);
    const totalDays = validSalaries.reduce((sum, s) => sum + (parseFloat(s.days) || 22), 0);
    const averageGross = totalGross / validSalaries.length;
    
    const minSalary = fiscalRules.salary?.minimum_salary || 4050;
    const maxBase = minSalary * (fiscalRules.medical_leave?.max_base_salaries || 12);
    const calculationBase = Math.min(averageGross, maxBase);
    
    const dailyAverage = calculationBase / (totalDays / validSalaries.length);
    
    const codeData = codes[codeType];
    const rate = (fiscalRules.medical_leave?.[`code_${codeType}_rate`] || codeData.rate) / 100;
    
    const dailyBenefit = dailyAverage * rate;
    
    const days = parseInt(daysTotal);
    const employerDays = Math.min(days, fiscalRules.medical_leave?.employer_days || 5);
    const stateDays = Math.max(0, days - employerDays);
    
    const employerAmount = dailyBenefit * employerDays;
    const stateAmount = dailyBenefit * stateDays;
    const totalGross = employerAmount + stateAmount;
    
    const casRate = 0.25;
    const cassRate = fiscalRules.medical_leave?.apply_cass ? 0.10 : 0;
    const taxRate = 0.10;
    
    const cas = totalGross * casRate;
    const cass = totalGross * cassRate;
    const personalDeduction = 510;
    const taxBase = Math.max(0, totalGross - cas - cass - personalDeduction);
    const tax = taxBase * taxRate;
    
    const netAmount = totalGross - cas - cass - tax;
    
    setResult({
      codeType: codeData.name,
      rate: rate * 100,
      calculationBase,
      averageGross,
      dailyAverage,
      dailyBenefit,
      totalDays: days,
      employerDays,
      stateDays,
      employerAmount,
      stateAmount,
      totalGross,
      cas,
      cass,
      tax,
      netAmount,
      capped: averageGross > maxBase,
      maxBase,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <HeartPulse className="h-12 w-12 animate-spin mx-auto mb-4 text-green-600" />
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
            <h1 className="text-2xl font-bold text-slate-900">Calculator Concediu Medical {year}</h1>
            <p className="text-sm text-slate-600">Conform OUG 158/2005 • 5 zile angajator + rest stat</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Venituri Ultimele 6 Luni</CardTitle>
                <CardDescription>Introduceți salariile brute și zilele lucrate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salaries.map((salary, index) => (
                    <div key={index} className="grid grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Luna {salary.month}</Label>
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Salariu brut"
                          value={salary.gross}
                          onChange={(e) => updateSalary(index, 'gross', e.target.value)}
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          placeholder="Zile lucrate"
                          value={salary.days}
                          onChange={(e) => updateSalary(index, 'days', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Configurare</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Cod Indemnizație</Label>
                  <Select value={codeType} onValueChange={setCodeType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(codes).map(([code, data]) => (
                        <SelectItem key={code} value={code}>
                          {code} - {data.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-1">
                    Procent: {codes[codeType].rate}%
                  </p>
                </div>

                <div>
                  <Label>Zile Concediu Medical</Label>
                  <Input
                    type="number"
                    value={daysTotal}
                    onChange={(e) => setDaysTotal(e.target.value)}
                    placeholder="ex: 15"
                  />
                </div>

                <Button onClick={calculate} className="w-full">
                  <HeartPulse className="h-4 w-4 mr-2" />
                  Calculează
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {result && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Rezultate Calcul</CardTitle>
                <CardDescription>{result.codeType} - {result.rate}%</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold border-b pb-2">Calcul Indemnizație</h3>
                    <div className="flex justify-between text-sm">
                      <span>Salariu mediu brut:</span>
                      <span>{result.averageGross.toFixed(2)} RON</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Bază de calcul:</span>
                      <span>{result.calculationBase.toFixed(2)} RON</span>
                    </div>
                    {result.capped && (
                      <div className="text-xs text-orange-600">
                        * Plafonat la {result.maxBase.toFixed(2)} RON (12 salarii minime)
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Medie zilnică:</span>
                      <span>{result.dailyAverage.toFixed(2)} RON</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Indemnizație zilnică ({result.rate}%):</span>
                      <span>{result.dailyBenefit.toFixed(2)} RON</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold border-b pb-2">Sursă Plată</h3>
                    <div className="flex justify-between text-sm">
                      <span>Zile suportate de angajator:</span>
                      <span className="font-medium">{result.employerDays} zile</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Sumă angajator:</span>
                      <span>{result.employerAmount.toFixed(2)} RON</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Zile suportate de stat (FNUASS):</span>
                      <span className="font-medium">{result.stateDays} zile</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Sumă stat:</span>
                      <span>{result.stateAmount.toFixed(2)} RON</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Total Indemnizație Brută:</span>
                    <span className="font-bold">{result.totalGross.toFixed(2)} RON</span>
                  </div>
                  <div className="flex justify-between text-red-600 text-sm">
                    <span>- CAS (25%):</span>
                    <span>-{result.cas.toFixed(2)} RON</span>
                  </div>
                  {result.cass > 0 && (
                    <div className="flex justify-between text-red-600 text-sm">
                      <span>- CASS (10%):</span>
                      <span>-{result.cass.toFixed(2)} RON</span>
                    </div>
                  )}
                  <div className="flex justify-between text-red-600 text-sm">
                    <span>- Impozit (10%):</span>
                    <span>-{result.tax.toFixed(2)} RON</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-green-600 pt-3 border-t">
                    <span>Indemnizație NET:</span>
                    <span>{result.netAmount.toFixed(2)} RON</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold">Notă:</p>
                      <p>Angajatorul plătește primele {result.employerDays} zile calendaristice.
                      Începând cu ziua {result.employerDays + 1}, plata este asigurată de FNUASS (stat).</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
