// Zile libere legale în România - configurabile din Admin
// Acest fișier conține datele default care pot fi suprascrise din baza de date

export const defaultHolidays = {
  2025: [
    { date: '2025-01-01', name: 'Anul Nou', type: 'legal' },
    { date: '2025-01-02', name: 'Anul Nou (zi 2)', type: 'legal' },
    { date: '2025-01-06', name: 'Boboteaza', type: 'legal' },
    { date: '2025-01-07', name: 'Sf. Ioan Botezătorul', type: 'legal' },
    { date: '2025-01-24', name: 'Unirea Principatelor Române', type: 'legal' },
    { date: '2025-04-18', name: 'Vinerea Mare (Ortodoxă)', type: 'legal' },
    { date: '2025-04-20', name: 'Paștele (Ortodox)', type: 'legal' },
    { date: '2025-04-21', name: 'A doua zi de Paște', type: 'legal' },
    { date: '2025-05-01', name: 'Ziua Muncii', type: 'legal' },
    { date: '2025-06-01', name: 'Ziua Copilului', type: 'legal' },
    { date: '2025-06-08', name: 'Rusalii (Ortodoxe)', type: 'legal' },
    { date: '2025-06-09', name: 'A doua zi de Rusalii', type: 'legal' },
    { date: '2025-08-15', name: 'Adormirea Maicii Domnului', type: 'legal' },
    { date: '2025-11-30', name: 'Sf. Andrei', type: 'legal' },
    { date: '2025-12-01', name: 'Ziua Națională', type: 'legal' },
    { date: '2025-12-25', name: 'Crăciunul', type: 'legal' },
    { date: '2025-12-26', name: 'A doua zi de Crăciun', type: 'legal' },
  ],
  2026: [
    { date: '2026-01-01', name: 'Anul Nou', type: 'legal' },
    { date: '2026-01-02', name: 'Anul Nou (zi 2)', type: 'legal' },
    { date: '2026-01-06', name: 'Boboteaza', type: 'legal' },
    { date: '2026-01-07', name: 'Sf. Ioan Botezătorul', type: 'legal' },
    { date: '2026-01-24', name: 'Unirea Principatelor Române', type: 'legal' },
    { date: '2026-04-10', name: 'Vinerea Mare (Ortodoxă)', type: 'legal' },
    { date: '2026-04-12', name: 'Paștele (Ortodox)', type: 'legal' },
    { date: '2026-04-13', name: 'A doua zi de Paște', type: 'legal' },
    { date: '2026-05-01', name: 'Ziua Muncii', type: 'legal' },
    { date: '2026-05-31', name: 'Rusalii (Ortodoxe)', type: 'legal' },
    { date: '2026-06-01', name: 'Ziua Copilului / A doua zi de Rusalii', type: 'legal' },
    { date: '2026-08-15', name: 'Adormirea Maicii Domnului', type: 'legal' },
    { date: '2026-11-30', name: 'Sf. Andrei', type: 'legal' },
    { date: '2026-12-01', name: 'Ziua Națională', type: 'legal' },
    { date: '2026-12-25', name: 'Crăciunul', type: 'legal' },
    { date: '2026-12-26', name: 'A doua zi de Crăciun', type: 'legal' },
  ],
  2027: [
    { date: '2027-01-01', name: 'Anul Nou', type: 'legal' },
    { date: '2027-01-02', name: 'Anul Nou (zi 2)', type: 'legal' },
    { date: '2027-01-06', name: 'Boboteaza', type: 'legal' },
    { date: '2027-01-07', name: 'Sf. Ioan Botezătorul', type: 'legal' },
    { date: '2027-01-24', name: 'Unirea Principatelor Române', type: 'legal' },
    { date: '2027-04-30', name: 'Vinerea Mare (Ortodoxă)', type: 'legal' },
    { date: '2027-05-01', name: 'Ziua Muncii', type: 'legal' },
    { date: '2027-05-02', name: 'Paștele (Ortodox)', type: 'legal' },
    { date: '2027-05-03', name: 'A doua zi de Paște', type: 'legal' },
    { date: '2027-06-01', name: 'Ziua Copilului', type: 'legal' },
    { date: '2027-06-20', name: 'Rusalii (Ortodoxe)', type: 'legal' },
    { date: '2027-06-21', name: 'A doua zi de Rusalii', type: 'legal' },
    { date: '2027-08-15', name: 'Adormirea Maicii Domnului', type: 'legal' },
    { date: '2027-11-30', name: 'Sf. Andrei', type: 'legal' },
    { date: '2027-12-01', name: 'Ziua Națională', type: 'legal' },
    { date: '2027-12-25', name: 'Crăciunul', type: 'legal' },
    { date: '2027-12-26', name: 'A doua zi de Crăciun', type: 'legal' },
  ],
};

// Funcție pentru calculul zilelor lucratoare
export function calculateWorkingDays(year, month, holidays = []) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);
  
  let workingDays = 0;
  let weekendDays = 0;
  let holidayDays = 0;
  const totalDays = endDate.getDate();
  
  const holidayDates = holidays.map(h => h.date);
  
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().split('T')[0];
    
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Weekend
      weekendDays++;
    } else if (holidayDates.includes(dateStr)) {
      // Sărbătoare legală
      holidayDays++;
    } else {
      // Zi lucrătoare
      workingDays++;
    }
  }
  
  return {
    totalDays,
    workingDays,
    weekendDays,
    holidayDays,
    holidays: holidays.filter(h => {
      const hDate = new Date(h.date);
      return hDate.getMonth() === month - 1;
    })
  };
}

// Funcție pentru calculul anual
export function calculateYearlyWorkingDays(year, holidays = []) {
  const months = [];
  let totalWorkingDays = 0;
  let totalHolidays = 0;
  let totalWeekends = 0;
  
  const monthNames = [
    'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
  ];
  
  for (let month = 1; month <= 12; month++) {
    const result = calculateWorkingDays(year, month, holidays);
    months.push({
      month,
      name: monthNames[month - 1],
      ...result
    });
    totalWorkingDays += result.workingDays;
    totalHolidays += result.holidayDays;
    totalWeekends += result.weekendDays;
  }
  
  return {
    year,
    months,
    totalWorkingDays,
    totalHolidays,
    totalWeekends,
    totalDays: new Date(year, 11, 31).getDate() === 31 ? 365 : 366
  };
}
