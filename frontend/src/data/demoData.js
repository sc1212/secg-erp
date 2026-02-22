// ═══ SECG DEMO DATA — Single source of truth ═══

export const TEAM = {
  owner: { name: 'Matt Seibert', role: 'Owner', rate: 85, hoursThisWeek: 45 },
  finance: { name: 'Samuel Carson', role: 'Director of Finance', rate: 72, hoursThisWeek: 42 },
  operations: { name: 'Cole Notgrass', role: 'Director of Operations', rate: 72, hoursThisWeek: 44 },
  multifamily: { name: 'Colton', role: 'Director of Multifamily', rate: 68, hoursThisWeek: 40 },
  pm1: { name: 'Connor', role: 'Project Manager', rate: 55, hoursThisWeek: 46 },
  pm2: { name: 'Joseph', role: 'Project Manager', rate: 55, hoursThisWeek: 43 },
  pm3: { name: 'Abi Darnell', role: 'Project Manager', rate: 55, hoursThisWeek: 40 },
  pm4: { name: 'Alex', role: 'Project Manager', rate: 55, hoursThisWeek: 44 },
  mechanical: { name: 'Zach', role: 'Mechanical Services Lead', rate: 52, hoursThisWeek: 38 },
};

export const TEAM_LIST = Object.values(TEAM);

export const PROJECTS = [
  { id: 1, name: 'Riverside Custom', address: '123 Oak St, Murfreesboro', pm: 'Connor', contract: 497500, phase: 'Framing', pct: 72, budgetStatus: 'on_budget', spent: 287400, margin: 16.2, code: 'RSC-001' },
  { id: 2, name: 'Oak Creek', address: '456 Elm Dr, La Vergne', pm: 'Connor', contract: 328500, phase: 'Foundation', pct: 42, budgetStatus: 'watch', spent: 142000, margin: 14.8, code: 'OAK-002' },
  { id: 3, name: 'Smith Residence', address: '789 Pine Ln, Murfreesboro', pm: 'Abi Darnell', contract: 485000, phase: 'Pre-Con', pct: 5, budgetStatus: 'on_budget', spent: 12000, margin: 18.5, code: 'SMR-003' },
  { id: 4, name: 'Magnolia Spec', address: '321 Magnolia Way, Smyrna', pm: 'Joseph', contract: 290000, phase: 'Finishes', pct: 62, budgetStatus: 'on_budget', spent: 164500, margin: 15.1, code: 'MAG-004' },
  { id: 5, name: 'Johnson Office TI', address: '100 Main St, Murfreesboro', pm: 'Joseph', contract: 180000, phase: 'Punch List', pct: 95, budgetStatus: 'over_budget', spent: 178200, margin: 1.0, code: 'JOT-005' },
  { id: 6, name: 'Elm St Multifamily', address: '500 Elm St, Nashville', pm: 'Alex', contract: 1200000, phase: 'Framing', pct: 38, budgetStatus: 'watch', spent: 478000, margin: 12.2, code: 'ELM-006' },
  { id: 7, name: 'Walnut Spec', address: '88 Walnut Cir, Murfreesboro', pm: 'Connor', contract: 275000, phase: 'MEP Rough-in', pct: 55, budgetStatus: 'on_budget', spent: 138200, margin: 17.4, code: 'WAL-007' },
  { id: 8, name: 'Zion Mechanical', address: '200 Church St, Nashville', pm: 'Zach', contract: 48000, phase: 'Closeout', pct: 90, budgetStatus: 'on_budget', spent: 41200, margin: 14.2, code: 'ZMC-008' },
];

export const VENDORS = [
  { id: 1, name: 'Miller Concrete', trade: 'Concrete', rating: 4.8, totalJobs: 12, activeJobs: 3, coiStatus: 'expiring', coiExpiry: '2026-02-28', avgInvoice: 8400, contact: 'Tom Miller', phone: '(615) 555-0101', email: 'tom@millerconcrete.com' },
  { id: 2, name: 'Williams Electric', trade: 'Electrical', rating: 4.5, totalJobs: 8, activeJobs: 2, coiStatus: 'current', coiExpiry: '2026-06-15', avgInvoice: 12200, contact: 'Dave Williams', phone: '(615) 555-0102', email: 'dave@williamselectric.com' },
  { id: 3, name: 'Thompson Framing', trade: 'Framing', rating: 4.9, totalJobs: 15, activeJobs: 4, coiStatus: 'current', coiExpiry: '2026-09-20', avgInvoice: 18500, contact: 'Jim Thompson', phone: '(615) 555-0103', email: 'jim@thompsonframing.com' },
  { id: 4, name: 'Davis Plumbing', trade: 'Plumbing', rating: 4.3, totalJobs: 6, activeJobs: 2, coiStatus: 'current', coiExpiry: '2026-04-10', avgInvoice: 6800, contact: 'Rick Davis', phone: '(615) 555-0104', email: 'rick@davisplumbing.com' },
  { id: 5, name: 'Clark HVAC', trade: 'HVAC', rating: 4.7, totalJobs: 9, activeJobs: 3, coiStatus: 'current', coiExpiry: '2026-08-01', avgInvoice: 9200, contact: 'Steve Clark', phone: '(615) 555-0105', email: 'steve@clarkhvac.com' },
  { id: 6, name: 'Martinez Drywall', trade: 'Drywall', rating: 4.1, totalJobs: 5, activeJobs: 1, coiStatus: 'expired', coiExpiry: '2026-01-15', avgInvoice: 7400, contact: 'Carlos Martinez', phone: '(615) 555-0106', email: 'carlos@martinezdrywall.com' },
  { id: 7, name: 'Brown Roofing', trade: 'Roofing', rating: 4.6, totalJobs: 7, activeJobs: 2, coiStatus: 'current', coiExpiry: '2026-07-22', avgInvoice: 11800, contact: 'Mike Brown', phone: '(615) 555-0107', email: 'mike@brownroofing.com' },
  { id: 8, name: 'Anderson Paint', trade: 'Painting', rating: 4.4, totalJobs: 11, activeJobs: 3, coiStatus: 'current', coiExpiry: '2026-11-05', avgInvoice: 4200, contact: 'Lisa Anderson', phone: '(615) 555-0108', email: 'lisa@andersonpaint.com' },
];

export const TRADES = ['Sitework', 'Concrete', 'Framing', 'Roofing', 'Plumbing', 'HVAC', 'Electrical', 'Drywall', 'Painting', 'Insulation'];

// Cost breakdown by trade for each project (used in Project Detail > Overview)
export function getProjectCostBreakdown(projectId) {
  const p = PROJECTS.find(pr => pr.id === projectId) || PROJECTS[0];
  const total = p.spent;
  const budget = p.contract * (1 - p.margin / 100);
  const ratios = [0.08, 0.12, 0.20, 0.08, 0.10, 0.10, 0.12, 0.08, 0.06, 0.06];
  return TRADES.map((trade, i) => ({
    trade,
    budget: Math.round(budget * ratios[i]),
    committed: Math.round(budget * ratios[i] * 0.95),
    spent: Math.round(total * ratios[i] * (0.8 + Math.random() * 0.4)),
    get variance() { return this.budget - this.spent; },
  }));
}

// Transactions for each project (Cost Detail tab)
export function getProjectTransactions(projectId) {
  const p = PROJECTS.find(pr => pr.id === projectId) || PROJECTS[0];
  const vendors = ['Miller Concrete', 'Williams Electric', 'Thompson Framing', 'Davis Plumbing', 'Clark HVAC', 'Martinez Drywall', 'Brown Roofing', 'Anderson Paint', '84 Lumber', 'HD Supply'];
  const descriptions = ['Material delivery', 'Labor - rough in', 'Progress payment', 'Material order', 'Equipment rental', 'Inspection fee', 'Permit fee', 'Labor - finish work', 'Hardware supplies', 'Cleanup services', 'Concrete pour', 'Framing package', 'Electrical rough', 'Plumbing fixtures', 'HVAC install', 'Drywall hanging', 'Paint - interior', 'Roofing materials', 'Insulation R-38', 'Foundation forms'];
  const codes = ['01-100', '02-200', '03-300', '04-400', '05-500', '06-600', '07-700', '08-800', '09-900', '10-100'];
  const statuses = ['Paid', 'Pending', 'Approved', 'Paid', 'Paid', 'Pending', 'Paid', 'Approved', 'Paid', 'Paid'];
  const txns = [];
  const count = 15 + (projectId % 5);
  for (let i = 0; i < count; i++) {
    const d = new Date(2025, 8 + Math.floor(i / 4), 1 + (i * 3) % 28);
    txns.push({
      id: projectId * 100 + i,
      date: d.toISOString().split('T')[0],
      vendor: vendors[i % vendors.length],
      description: descriptions[i % descriptions.length],
      amount: Math.round((p.spent / count) * (0.5 + Math.random())),
      costCode: codes[i % codes.length],
      status: statuses[i % statuses.length],
    });
  }
  return txns;
}

// Milestones for Schedule tab
export function getProjectMilestones(projectId) {
  const p = PROJECTS.find(pr => pr.id === projectId) || PROJECTS[0];
  const milestones = [
    'Permitting', 'Site Prep', 'Foundation', 'Framing', 'Rough MEP',
    'Insulation', 'Drywall', 'Finishes', 'Punch List', 'C/O', 'Closeout', 'Final Walkthrough',
  ];
  const pctComplete = p.pct;
  return milestones.map((name, i) => {
    const planned = new Date(2025, 6 + i, 1 + (projectId * 3) % 15);
    const milestonePct = ((i + 1) / milestones.length) * 100;
    const done = milestonePct <= pctComplete;
    const inProgress = !done && milestonePct <= pctComplete + 15;
    const actual = done ? new Date(planned.getTime() + (Math.random() > 0.5 ? 1 : -1) * Math.random() * 7 * 86400000) : null;
    return {
      id: i + 1,
      name,
      plannedDate: planned.toISOString().split('T')[0],
      actualDate: actual ? actual.toISOString().split('T')[0] : null,
      status: done ? 'Complete' : inProgress ? 'In Progress' : 'Upcoming',
      durationDays: 14 + Math.floor(Math.random() * 21),
    };
  });
}

// Daily Logs
export function getProjectDailyLogs(projectId) {
  const p = PROJECTS.find(pr => pr.id === projectId) || PROJECTS[0];
  const weathers = ['Sunny 72F', 'Partly Cloudy 65F', 'Overcast 58F', 'Rain 54F', 'Clear 70F', 'Sunny 68F', 'Cloudy 60F', 'Clear 75F'];
  const summaries = [
    'Framing crew completed second floor joists. Passed rough inspection.',
    'Concrete pour for footings completed. Waiting 48hr cure.',
    'Electrical rough-in started in basement. 2 circuits complete.',
    'Plumbing rough-in progress. Main stack installed.',
    'HVAC ductwork installation 60% complete. Trunk lines done.',
    'Drywall hanging started on first floor. 8 sheets installed.',
    'Exterior paint prep - pressure washing and scraping complete.',
    'Roofing crew installed underlayment. Shingles tomorrow.',
    'Insulation blown in attic. R-38 throughout.',
    'Final grading and drainage work. Silt fence installed.',
  ];
  const workDetails = [
    'Installed 24 floor joists, 2x12 at 16" OC. All connections Simpson Strong-Tie.',
    'Poured 18 CY concrete, 4000 PSI mix. Finished by 2PM. Set anchor bolts.',
    'Pulled wire for 2 20-amp circuits in basement. Installed 4 junction boxes.',
    'Set 4" cast iron main stack, 3 floor penetrations. No leaks on test.',
    'Ran 8" main trunk, 6 branch lines. Return air plenum framed.',
    'Hung 32 sheets 5/8" Type X on first floor walls. Ceiling tomorrow.',
    'Power washed all exterior surfaces. Scraped loose paint from trim.',
    'Installed ice & water shield at eaves and valleys. 30# felt on field.',
    'Blown cellulose insulation R-38 in attic, R-13 in exterior walls.',
    'Graded front and side yards to drain away from foundation. 2% slope.',
  ];
  const logs = [];
  for (let i = 0; i < 10; i++) {
    const d = new Date(2026, 1, 22 - i);
    logs.push({
      id: projectId * 100 + i,
      date: d.toISOString().split('T')[0],
      author: p.pm,
      weather: weathers[i % weathers.length],
      crewSize: 4 + Math.floor(Math.random() * 8),
      summary: summaries[i % summaries.length],
      workPerformed: workDetails[i % workDetails.length],
      materialsUsed: i % 3 === 0 ? '2x12x16 lumber (24), Simpson hangers (48), 16d nails (5 lbs)' : i % 3 === 1 ? '4000 PSI concrete (18 CY), rebar #4 (200 LF), anchor bolts (12)' : '12/2 Romex (250ft), junction boxes (4), wire nuts (1 bag)',
      issues: i % 4 === 0 ? 'Delivery delayed 2 hours - adjusted schedule accordingly' : i % 4 === 1 ? 'Minor grade issue at NE corner - will regrade tomorrow' : null,
    });
  }
  return logs;
}

// Change Orders
export function getProjectChangeOrders(projectId) {
  const p = PROJECTS.find(pr => pr.id === projectId) || PROJECTS[0];
  const cos = [
    { num: 'CO-001', desc: 'Owner requested upgraded kitchen countertops - quartz vs granite', requestedBy: 'Owner', amount: 4200, status: 'Approved', date: '2025-11-15' },
    { num: 'CO-002', desc: 'Additional electrical outlets in garage per owner request', requestedBy: 'Owner', amount: 1800, status: 'Approved', date: '2025-12-02' },
    { num: 'CO-003', desc: 'Unforeseen rock removal during foundation excavation', requestedBy: 'Contractor', amount: 6500, status: 'Pending', date: '2026-01-10' },
    { num: 'CO-004', desc: 'Upgraded HVAC system - 2-stage vs single stage', requestedBy: 'Owner', amount: 3200, status: 'Rejected', date: '2026-01-28' },
  ];
  return cos.slice(0, 2 + (projectId % 3)).map((co, i) => ({ ...co, id: projectId * 10 + i, projectId }));
}

// Documents
export function getProjectDocuments(projectId) {
  const docs = [
    { name: 'General Contract', type: 'Contract', uploadedBy: 'Matt Seibert', date: '2025-06-15', size: '2.4 MB' },
    { name: 'Architectural Plans v3', type: 'Plans', uploadedBy: 'Connor', date: '2025-07-01', size: '18.2 MB' },
    { name: 'Building Permit', type: 'Permits', uploadedBy: 'Abi Darnell', date: '2025-08-10', size: '1.1 MB' },
    { name: 'Foundation Submittal', type: 'Submittals', uploadedBy: 'Joseph', date: '2025-09-05', size: '4.8 MB' },
    { name: 'Site Photos - Week 12', type: 'Photos', uploadedBy: 'Connor', date: '2025-10-20', size: '32.5 MB' },
    { name: 'Soil Report', type: 'Reports', uploadedBy: 'Alex', date: '2025-06-22', size: '3.2 MB' },
    { name: 'Structural Engineering Plans', type: 'Plans', uploadedBy: 'Matt Seibert', date: '2025-07-15', size: '12.8 MB' },
    { name: 'Electrical Permit', type: 'Permits', uploadedBy: 'Joseph', date: '2025-08-28', size: '890 KB' },
    { name: 'Framing Inspection Report', type: 'Reports', uploadedBy: 'Connor', date: '2025-11-02', size: '1.5 MB' },
    { name: 'Insurance Certificate', type: 'Contract', uploadedBy: 'Samuel Carson', date: '2025-06-10', size: '520 KB' },
    { name: 'MEP Coordination Drawings', type: 'Plans', uploadedBy: 'Zach', date: '2025-09-18', size: '8.4 MB' },
    { name: 'Progress Photos - Month 4', type: 'Photos', uploadedBy: 'Abi Darnell', date: '2025-12-15', size: '28.1 MB' },
  ];
  return docs.map((d, i) => ({ ...d, id: projectId * 100 + i }));
}

// ═══ FINANCIAL DATA ═══
export const FINANCIAL = {
  cash: 284320,
  effectiveCash: 127840,
  arOutstanding: 312400,
  apOutstanding: 184560,
  revenueMTD: 248600,
  grossMargin: 16.8,
  backlog: 1420000,
  locAvailable: 150000,
};

export const TRANSACTIONS = (() => {
  const txns = [];
  const projects = PROJECTS;
  const types = ['Invoice', 'Payment', 'Draw', 'Expense', 'Payroll'];
  let id = 1;
  for (const p of projects) {
    const count = 4 + (p.id % 3);
    for (let i = 0; i < count; i++) {
      const d = new Date(2026, 0 + Math.floor(i / 2), 5 + i * 4 + (p.id * 2));
      txns.push({
        id: id++,
        date: d.toISOString().split('T')[0],
        project: p.name,
        vendor: VENDORS[i % VENDORS.length].name,
        description: ['Material delivery', 'Progress payment', 'Draw request', 'Equipment rental', 'Labor payment', 'Permit fee', 'Inspection'][i % 7],
        amount: Math.round(p.spent / count * (0.6 + Math.random() * 0.8)),
        type: types[i % types.length],
      });
    }
  }
  return txns.sort((a, b) => b.date.localeCompare(a.date));
})();

export const AR_AGING = [
  { project: 'Riverside Custom', invoiceOrDraw: 'Draw #3', amount: 58000, dateIssued: '2026-02-10', ageDays: 12, status: 'Outstanding' },
  { project: 'Magnolia Spec', invoiceOrDraw: 'Draw #2', amount: 58000, dateIssued: '2026-02-08', ageDays: 14, status: 'Outstanding' },
  { project: 'Oak Creek', invoiceOrDraw: 'Draw #2', amount: 42000, dateIssued: '2026-01-28', ageDays: 25, status: 'Outstanding' },
  { project: 'Johnson Office TI', invoiceOrDraw: 'Invoice #1042', amount: 58000, dateIssued: '2026-01-15', ageDays: 38, status: 'Past Due' },
  { project: 'Elm St Multifamily', invoiceOrDraw: 'Draw #4', amount: 72000, dateIssued: '2025-12-20', ageDays: 64, status: 'Past Due' },
  { project: 'Walnut Spec', invoiceOrDraw: 'Draw #2', amount: 24400, dateIssued: '2026-02-05', ageDays: 17, status: 'Outstanding' },
];

export const AP_ITEMS = [
  { vendor: 'Thompson Framing', amount: 18500, dueDate: '2026-02-25', project: 'Riverside Custom', status: 'Due Soon' },
  { vendor: 'Miller Concrete', amount: 12400, dueDate: '2026-02-28', project: 'Oak Creek', status: 'Due Soon' },
  { vendor: 'Williams Electric', amount: 8200, dueDate: '2026-03-05', project: 'Johnson Office TI', status: 'Upcoming' },
  { vendor: 'Clark HVAC', amount: 14600, dueDate: '2026-03-01', project: 'Walnut Spec', status: 'Due Soon' },
  { vendor: 'Davis Plumbing', amount: 6800, dueDate: '2026-03-10', project: 'Magnolia Spec', status: 'Upcoming' },
  { vendor: 'Brown Roofing', amount: 11800, dueDate: '2026-02-24', project: 'Riverside Custom', status: 'Due Soon' },
  { vendor: 'Martinez Drywall', amount: 9200, dueDate: '2026-03-08', project: 'Magnolia Spec', status: 'Upcoming' },
  { vendor: 'Anderson Paint', amount: 4200, dueDate: '2026-03-15', project: 'Johnson Office TI', status: 'Upcoming' },
  { vendor: '84 Lumber', amount: 22400, dueDate: '2026-02-26', project: 'Elm St Multifamily', status: 'Due Soon' },
  { vendor: 'HD Supply', amount: 3800, dueDate: '2026-03-12', project: 'Walnut Spec', status: 'Upcoming' },
];

export const CASH_FLOW_WEEKLY = (() => {
  const weeks = [];
  let balance = 284320;
  for (let i = 0; i < 12; i++) {
    const d = new Date(2026, 1, 22 + i * 7);
    const inflow = 45000 + Math.round(Math.random() * 75000);
    const outflow = 50000 + Math.round(Math.random() * 40000);
    balance += inflow - outflow;
    weeks.push({
      week: `W${i + 1}`,
      weekStart: d.toISOString().split('T')[0],
      inflow,
      outflow,
      net: inflow - outflow,
      balance,
    });
  }
  return weeks;
})();

// ═══ OPERATIONS DATA ═══
export const SCHEDULE_EVENTS = [
  { id: 1, date: '2026-02-23', time: '8:00 AM', event: 'Foundation Inspection', project: 'Oak Creek', assignedTo: 'Connor' },
  { id: 2, date: '2026-02-23', time: '10:00 AM', event: 'Lumber Delivery', project: 'Riverside Custom', assignedTo: 'Connor' },
  { id: 3, date: '2026-02-23', time: '1:00 PM', event: 'Client Meeting', project: 'Smith Residence', assignedTo: 'Abi Darnell' },
  { id: 4, date: '2026-02-24', time: '9:00 AM', event: 'Framing Inspection', project: 'Riverside Custom', assignedTo: 'Connor' },
  { id: 5, date: '2026-02-24', time: '11:00 AM', event: 'HVAC Rough-in Start', project: 'Walnut Spec', assignedTo: 'Zach' },
  { id: 6, date: '2026-02-24', time: '2:00 PM', event: 'Draw Meeting', project: 'Elm St Multifamily', assignedTo: 'Alex' },
  { id: 7, date: '2026-02-25', time: '8:30 AM', event: 'Concrete Pour', project: 'Oak Creek', assignedTo: 'Connor' },
  { id: 8, date: '2026-02-25', time: '10:00 AM', event: 'Electrical Walk', project: 'Johnson Office TI', assignedTo: 'Joseph' },
  { id: 9, date: '2026-02-25', time: '3:00 PM', event: 'Safety Training', project: 'All Projects', assignedTo: 'Cole Notgrass' },
  { id: 10, date: '2026-02-26', time: '9:00 AM', event: 'Drywall Delivery', project: 'Magnolia Spec', assignedTo: 'Joseph' },
  { id: 11, date: '2026-02-26', time: '1:00 PM', event: 'Punch List Walk', project: 'Johnson Office TI', assignedTo: 'Joseph' },
  { id: 12, date: '2026-02-27', time: '8:00 AM', event: 'Roofing Start', project: 'Riverside Custom', assignedTo: 'Connor' },
  { id: 13, date: '2026-02-27', time: '10:30 AM', event: 'Owner Walkthrough', project: 'Magnolia Spec', assignedTo: 'Joseph' },
  { id: 14, date: '2026-02-28', time: '9:00 AM', event: 'Mechanical Closeout', project: 'Zion Mechanical', assignedTo: 'Zach' },
  { id: 15, date: '2026-02-28', time: '2:00 PM', event: 'Pre-Con Meeting', project: 'Smith Residence', assignedTo: 'Abi Darnell' },
];

export const PUNCH_LIST = (() => {
  const items = [
    { item: 'Touch up paint - master bedroom wall', project: 'Johnson Office TI', location: 'Suite 200', assignedTo: 'Anderson Paint', priority: 'Medium', status: 'Open' },
    { item: 'Fix cabinet door alignment - kitchen', project: 'Johnson Office TI', location: 'Break Room', assignedTo: 'Joseph', priority: 'High', status: 'In Progress' },
    { item: 'Caulk gap at window trim - office 3', project: 'Johnson Office TI', location: 'Office 3', assignedTo: 'Anderson Paint', priority: 'Low', status: 'Open' },
    { item: 'HVAC register not blowing - conference room', project: 'Johnson Office TI', location: 'Conf Room A', assignedTo: 'Clark HVAC', priority: 'High', status: 'Open' },
    { item: 'Drywall crack above door frame', project: 'Magnolia Spec', location: 'Living Room', assignedTo: 'Martinez Drywall', priority: 'Medium', status: 'Open' },
    { item: 'Light switch plate crooked', project: 'Magnolia Spec', location: 'Hallway', assignedTo: 'Williams Electric', priority: 'Low', status: 'Complete' },
    { item: 'Grout missing in shower tile', project: 'Riverside Custom', location: 'Master Bath', assignedTo: 'Connor', priority: 'High', status: 'In Progress' },
    { item: 'Exterior trim paint peeling', project: 'Riverside Custom', location: 'South Elevation', assignedTo: 'Anderson Paint', priority: 'Medium', status: 'Open' },
    { item: 'Door sticking - bedroom 2', project: 'Riverside Custom', location: 'Bedroom 2', assignedTo: 'Thompson Framing', priority: 'Medium', status: 'Open' },
    { item: 'Outlet cover missing', project: 'Walnut Spec', location: 'Garage', assignedTo: 'Williams Electric', priority: 'Low', status: 'Complete' },
    { item: 'Concrete crack in garage floor', project: 'Walnut Spec', location: 'Garage', assignedTo: 'Miller Concrete', priority: 'High', status: 'Open' },
    { item: 'Gutter downspout disconnected', project: 'Riverside Custom', location: 'NW Corner', assignedTo: 'Brown Roofing', priority: 'Medium', status: 'In Progress' },
    { item: 'Cabinet hardware loose', project: 'Magnolia Spec', location: 'Kitchen', assignedTo: 'Joseph', priority: 'Low', status: 'Open' },
    { item: 'Baseboard gap at hallway', project: 'Elm St Multifamily', location: 'Unit 201', assignedTo: 'Thompson Framing', priority: 'Low', status: 'Open' },
    { item: 'Plumbing leak under sink', project: 'Elm St Multifamily', location: 'Unit 105', assignedTo: 'Davis Plumbing', priority: 'High', status: 'In Progress' },
    { item: 'Thermostat not responding', project: 'Walnut Spec', location: 'Main Floor', assignedTo: 'Clark HVAC', priority: 'High', status: 'Open' },
    { item: 'Window screen torn', project: 'Magnolia Spec', location: 'Bedroom 1', assignedTo: 'Joseph', priority: 'Low', status: 'Open' },
    { item: 'Stair railing wobble', project: 'Elm St Multifamily', location: 'Stairwell B', assignedTo: 'Thompson Framing', priority: 'High', status: 'Open' },
    { item: 'Landscape grading issue', project: 'Riverside Custom', location: 'Front Yard', assignedTo: 'Connor', priority: 'Medium', status: 'Open' },
    { item: 'Fire caulk missing at penetration', project: 'Elm St Multifamily', location: 'Unit 302', assignedTo: 'Martinez Drywall', priority: 'High', status: 'Open' },
    { item: 'Final clean needed', project: 'Zion Mechanical', location: 'Mechanical Room', assignedTo: 'Zach', priority: 'Medium', status: 'Open' },
  ];
  return items.map((item, i) => ({ ...item, id: i + 1 }));
})();

export const TASKS = (() => {
  const tasks = [
    { task: 'Submit Draw #4', project: 'Riverside Custom', assignedTo: 'Connor', dueDate: '2026-02-24', priority: 'High', status: 'In Progress' },
    { task: 'Order framing lumber', project: 'Oak Creek', assignedTo: 'Connor', dueDate: '2026-02-23', priority: 'High', status: 'Overdue' },
    { task: 'Schedule foundation inspection', project: 'Oak Creek', assignedTo: 'Connor', dueDate: '2026-02-25', priority: 'High', status: 'Pending' },
    { task: 'Review architectural plans', project: 'Smith Residence', assignedTo: 'Abi Darnell', dueDate: '2026-02-26', priority: 'Medium', status: 'In Progress' },
    { task: 'Finalize subcontractor bids', project: 'Smith Residence', assignedTo: 'Abi Darnell', dueDate: '2026-02-28', priority: 'High', status: 'Pending' },
    { task: 'Process CO-003 approval', project: 'Magnolia Spec', assignedTo: 'Joseph', dueDate: '2026-02-22', priority: 'High', status: 'Overdue' },
    { task: 'Complete punch list items', project: 'Johnson Office TI', assignedTo: 'Joseph', dueDate: '2026-02-20', priority: 'High', status: 'Overdue' },
    { task: 'Request COI from Miller Concrete', project: 'All Projects', assignedTo: 'Samuel Carson', dueDate: '2026-02-24', priority: 'High', status: 'Pending' },
    { task: 'Update cost projections', project: 'Elm St Multifamily', assignedTo: 'Alex', dueDate: '2026-02-27', priority: 'Medium', status: 'Pending' },
    { task: 'Schedule MEP coordination', project: 'Walnut Spec', assignedTo: 'Zach', dueDate: '2026-02-25', priority: 'Medium', status: 'In Progress' },
    { task: 'Close out permits', project: 'Zion Mechanical', assignedTo: 'Zach', dueDate: '2026-02-28', priority: 'Medium', status: 'In Progress' },
    { task: 'Weekly safety meeting', project: 'All Projects', assignedTo: 'Cole Notgrass', dueDate: '2026-02-24', priority: 'Medium', status: 'Pending' },
    { task: 'Send AR follow-up emails', project: 'All Projects', assignedTo: 'Samuel Carson', dueDate: '2026-02-23', priority: 'High', status: 'Overdue' },
    { task: 'Review framing progress photos', project: 'Elm St Multifamily', assignedTo: 'Colton', dueDate: '2026-02-24', priority: 'Medium', status: 'Pending' },
    { task: 'Order HVAC equipment', project: 'Walnut Spec', assignedTo: 'Zach', dueDate: '2026-02-26', priority: 'High', status: 'In Progress' },
    { task: 'Process payroll', project: 'All Projects', assignedTo: 'Samuel Carson', dueDate: '2026-02-28', priority: 'High', status: 'Pending' },
    { task: 'Update project schedule', project: 'Riverside Custom', assignedTo: 'Connor', dueDate: '2026-02-25', priority: 'Medium', status: 'Pending' },
    { task: 'Client progress meeting', project: 'Elm St Multifamily', assignedTo: 'Alex', dueDate: '2026-02-24', priority: 'Medium', status: 'Pending' },
    { task: 'Verify concrete strength tests', project: 'Oak Creek', assignedTo: 'Connor', dueDate: '2026-02-23', priority: 'High', status: 'Overdue' },
    { task: 'Final walkthrough prep', project: 'Zion Mechanical', assignedTo: 'Zach', dueDate: '2026-03-01', priority: 'Medium', status: 'Pending' },
    { task: 'Insurance renewal follow-up', project: 'All Projects', assignedTo: 'Matt Seibert', dueDate: '2026-02-27', priority: 'Low', status: 'Pending' },
    { task: 'Material takeoff review', project: 'Smith Residence', assignedTo: 'Abi Darnell', dueDate: '2026-03-02', priority: 'Medium', status: 'Pending' },
    { task: 'Coordinate utility hookups', project: 'Oak Creek', assignedTo: 'Connor', dueDate: '2026-03-01', priority: 'Medium', status: 'Pending' },
    { task: 'Review monthly P&L', project: 'All Projects', assignedTo: 'Samuel Carson', dueDate: '2026-02-28', priority: 'High', status: 'Pending' },
    { task: 'Drywall delivery coordination', project: 'Magnolia Spec', assignedTo: 'Joseph', dueDate: '2026-02-26', priority: 'Medium', status: 'In Progress' },
  ];
  return tasks.map((t, i) => ({ ...t, id: i + 1 }));
})();

export const FLEET = [
  { id: 1, vehicle: 'Ford F-250 Super Duty', year: 2023, assignedTo: 'Connor', mileage: 34200, nextService: '2026-03-15', status: 'Active', plate: 'TN-4521' },
  { id: 2, vehicle: 'Ford F-150 XLT', year: 2022, assignedTo: 'Joseph', mileage: 48100, nextService: '2026-02-28', status: 'Service Due', plate: 'TN-3892' },
  { id: 3, vehicle: 'Chevy Silverado 2500', year: 2024, assignedTo: 'Alex', mileage: 18400, nextService: '2026-05-01', status: 'Active', plate: 'TN-5567' },
  { id: 4, vehicle: 'Ram 1500 Tradesman', year: 2021, assignedTo: 'Abi Darnell', mileage: 62300, nextService: '2026-03-01', status: 'Active', plate: 'TN-2214' },
  { id: 5, vehicle: 'Ford Transit Van', year: 2023, assignedTo: 'Zach', mileage: 28900, nextService: '2026-04-10', status: 'Active', plate: 'TN-6678' },
  { id: 6, vehicle: 'Chevy Express Cargo', year: 2020, assignedTo: 'Cole Notgrass', mileage: 71200, nextService: '2026-02-25', status: 'Service Due', plate: 'TN-1190' },
  { id: 7, vehicle: 'Equipment Trailer 20ft', year: 2019, assignedTo: 'Shop', mileage: null, nextService: '2026-06-01', status: 'Active', plate: 'TN-T-0442' },
  { id: 8, vehicle: 'Dump Trailer 14ft', year: 2021, assignedTo: 'Shop', mileage: null, nextService: '2026-04-15', status: 'Active', plate: 'TN-T-0518' },
];

export const PERMITS = [
  { id: 1, permitNum: 'BP-2025-1842', project: 'Riverside Custom', type: 'Building', status: 'Active', inspectionDate: '2026-02-24', result: 'Pending' },
  { id: 2, permitNum: 'EP-2025-0934', project: 'Riverside Custom', type: 'Electrical', status: 'Active', inspectionDate: '2026-02-26', result: 'Pending' },
  { id: 3, permitNum: 'BP-2025-2103', project: 'Oak Creek', type: 'Building', status: 'Active', inspectionDate: '2026-02-23', result: 'Pending' },
  { id: 4, permitNum: 'PP-2025-0412', project: 'Oak Creek', type: 'Plumbing', status: 'Active', inspectionDate: '2026-03-02', result: 'Pending' },
  { id: 5, permitNum: 'BP-2025-0088', project: 'Smith Residence', type: 'Building', status: 'Applied', inspectionDate: null, result: null },
  { id: 6, permitNum: 'BP-2024-3291', project: 'Magnolia Spec', type: 'Building', status: 'Active', inspectionDate: '2026-02-10', result: 'Pass' },
  { id: 7, permitNum: 'MP-2025-0567', project: 'Magnolia Spec', type: 'Mechanical', status: 'Active', inspectionDate: '2026-02-12', result: 'Pass' },
  { id: 8, permitNum: 'BP-2024-2847', project: 'Johnson Office TI', type: 'Building', status: 'Active', inspectionDate: '2026-02-18', result: 'Pass' },
  { id: 9, permitNum: 'FP-2024-0193', project: 'Johnson Office TI', type: 'Fire', status: 'Active', inspectionDate: '2026-02-19', result: 'Conditional' },
  { id: 10, permitNum: 'BP-2025-2890', project: 'Elm St Multifamily', type: 'Building', status: 'Active', inspectionDate: '2026-02-27', result: 'Pending' },
  { id: 11, permitNum: 'MP-2025-0723', project: 'Walnut Spec', type: 'Mechanical', status: 'Active', inspectionDate: '2026-03-01', result: 'Pending' },
  { id: 12, permitNum: 'BP-2024-1456', project: 'Zion Mechanical', type: 'Mechanical', status: 'Closed', inspectionDate: '2026-02-15', result: 'Pass' },
];

// Vendor job history for vendor detail
export function getVendorHistory(vendorId) {
  const v = VENDORS.find(x => x.id === vendorId);
  if (!v) return [];
  const history = [];
  const projectSubset = PROJECTS.filter((_, i) => (i + vendorId) % 3 === 0 || i % vendorId === 0).slice(0, v.totalJobs > 5 ? 5 : v.totalJobs);
  projectSubset.forEach((p, i) => {
    history.push({
      project: p.name,
      amount: v.avgInvoice * (1 + (i % 3) * 0.3),
      startDate: `2025-${String(6 + i).padStart(2, '0')}-01`,
      endDate: i < v.activeJobs ? null : `2025-${String(8 + i).padStart(2, '0')}-15`,
      status: i < v.activeJobs ? 'Active' : 'Complete',
    });
  });
  return history;
}

export function getVendorInvoices(vendorId) {
  const v = VENDORS.find(x => x.id === vendorId);
  if (!v) return [];
  return [
    { id: 1, invoiceNum: `INV-${1000 + vendorId * 10}`, amount: v.avgInvoice, date: '2026-02-10', project: PROJECTS[vendorId % 8].name, status: 'Outstanding' },
    { id: 2, invoiceNum: `INV-${1000 + vendorId * 10 + 1}`, amount: Math.round(v.avgInvoice * 0.8), date: '2026-01-28', project: PROJECTS[(vendorId + 1) % 8].name, status: 'Paid' },
    { id: 3, invoiceNum: `INV-${1000 + vendorId * 10 + 2}`, amount: Math.round(v.avgInvoice * 1.2), date: '2026-01-15', project: PROJECTS[(vendorId + 2) % 8].name, status: 'Paid' },
  ];
}
