// Comprehensive demo data with full drill-down hierarchy
// Job → Phases → Cost Codes → Line Items → Transactions

export const demoProject = {
  id: 1,
  code: 'PRJ-042',
  name: '2847 Elm Street Renovation',
  status: 'active',
  project_type: 'remodel',
  budget_total: 120000,
  contract_amount: 145000,
  estimated_cost: 118000,
  original_budget: 112000,
  approved_cos: 8000,
  revised_budget: 120000,
  project_manager: 'Matt S.',
  superintendent: 'Jake R.',
  start_date: '2025-09-15',
  target_completion: '2026-04-01',

  phases: [
    {
      id: 'general', code: '01', name: 'General Conditions',
      budget: 12000, committed: 11200, actual: 9800, forecast: 11500, variance: 500,
      status: 'on_track', percentComplete: 85,
      costCodes: [
        {
          id: 'cc-01-100', code: '01-100', description: 'Project Management',
          budget: 6000, committed: 5800, actual: 5200, forecast: 5900, variance: 100, status: 'on_track',
          lineItems: [
            { id: 'li-1', date: '2025-10-01', vendor: 'Internal', description: 'PM Hours - Oct', type: 'labor', amount: 1800, status: 'paid' },
            { id: 'li-2', date: '2025-11-01', vendor: 'Internal', description: 'PM Hours - Nov', type: 'labor', amount: 1700, status: 'paid' },
            { id: 'li-3', date: '2025-12-01', vendor: 'Internal', description: 'PM Hours - Dec', type: 'labor', amount: 1700, status: 'paid' },
          ],
        },
        {
          id: 'cc-01-200', code: '01-200', description: 'Temporary Facilities',
          budget: 3500, committed: 3200, actual: 2800, forecast: 3300, variance: 200, status: 'on_track',
          lineItems: [
            { id: 'li-4', date: '2025-09-20', vendor: 'United Rentals', description: 'Portable toilet rental', type: 'rental', amount: 900, status: 'paid' },
            { id: 'li-5', date: '2025-09-20', vendor: 'United Rentals', description: 'Dumpster rental (3 month)', type: 'rental', amount: 1200, status: 'paid' },
            { id: 'li-6', date: '2026-01-05', vendor: 'United Rentals', description: 'Dumpster rental extension', type: 'rental', amount: 700, status: 'approved' },
          ],
        },
        {
          id: 'cc-01-300', code: '01-300', description: 'Permits & Fees',
          budget: 2500, committed: 2200, actual: 1800, forecast: 2300, variance: 200, status: 'on_track',
          lineItems: [
            { id: 'li-7', date: '2025-09-10', vendor: 'City of Austin', description: 'Building permit', type: 'permit', amount: 1200, status: 'paid' },
            { id: 'li-8', date: '2025-09-10', vendor: 'City of Austin', description: 'Plumbing permit', type: 'permit', amount: 350, status: 'paid' },
            { id: 'li-9', date: '2025-09-10', vendor: 'City of Austin', description: 'Electrical permit', type: 'permit', amount: 250, status: 'paid' },
          ],
        },
      ],
    },
    {
      id: 'sitework', code: '02', name: 'Site Work',
      budget: 8000, committed: 7800, actual: 7800, forecast: 7800, variance: 200,
      status: 'complete', percentComplete: 100,
      costCodes: [
        {
          id: 'cc-02-100', code: '02-100', description: 'Demolition',
          budget: 5000, committed: 4800, actual: 4800, forecast: 4800, variance: 200, status: 'complete',
          lineItems: [
            { id: 'li-10', date: '2025-09-16', vendor: 'Demo Kings LLC', description: 'Interior demo - kitchen/bath', type: 'subcontract', amount: 3200, status: 'paid' },
            { id: 'li-11', date: '2025-09-22', vendor: 'Demo Kings LLC', description: 'Haul-off debris', type: 'subcontract', amount: 1600, status: 'paid' },
          ],
        },
        {
          id: 'cc-02-200', code: '02-200', description: 'Grading & Excavation',
          budget: 3000, committed: 3000, actual: 3000, forecast: 3000, variance: 0, status: 'complete',
          lineItems: [
            { id: 'li-12', date: '2025-09-25', vendor: 'Martinez Excavation', description: 'Foundation excavation', type: 'subcontract', amount: 3000, status: 'paid' },
          ],
        },
      ],
    },
    {
      id: 'concrete', code: '03', name: 'Concrete & Foundation',
      budget: 18000, committed: 17500, actual: 17500, forecast: 17500, variance: 500,
      status: 'complete', percentComplete: 100,
      costCodes: [
        {
          id: 'cc-03-100', code: '03-100', description: 'Foundation',
          budget: 12000, committed: 11800, actual: 11800, forecast: 11800, variance: 200, status: 'complete',
          lineItems: [
            { id: 'li-13', date: '2025-10-02', vendor: 'ABC Concrete Co', description: 'Form & pour footings', type: 'subcontract', amount: 4800, status: 'paid' },
            { id: 'li-14', date: '2025-10-08', vendor: 'ABC Concrete Co', description: 'Foundation walls', type: 'subcontract', amount: 5200, status: 'paid' },
            { id: 'li-15', date: '2025-10-10', vendor: 'Rebar Supply Inc', description: 'Rebar #4 & #5', type: 'material', amount: 1800, status: 'paid' },
          ],
        },
        {
          id: 'cc-03-200', code: '03-200', description: 'Flatwork',
          budget: 6000, committed: 5700, actual: 5700, forecast: 5700, variance: 300, status: 'complete',
          lineItems: [
            { id: 'li-16', date: '2025-10-15', vendor: 'ABC Concrete Co', description: 'Garage slab pour', type: 'subcontract', amount: 3200, status: 'paid' },
            { id: 'li-17', date: '2025-10-18', vendor: 'ABC Concrete Co', description: 'Patio flatwork', type: 'subcontract', amount: 2500, status: 'paid' },
          ],
        },
      ],
    },
    {
      id: 'framing', code: '06', name: 'Wood & Framing',
      budget: 25000, committed: 24200, actual: 24200, forecast: 24200, variance: 800,
      status: 'complete', percentComplete: 100,
      costCodes: [
        {
          id: 'cc-06-100', code: '06-100', description: 'Rough Framing',
          budget: 18000, committed: 17500, actual: 17500, forecast: 17500, variance: 500, status: 'complete',
          lineItems: [
            { id: 'li-18', date: '2025-10-25', vendor: 'Texas Framing Co', description: 'Wall framing - first floor', type: 'subcontract', amount: 6500, status: 'paid' },
            { id: 'li-19', date: '2025-11-02', vendor: 'Texas Framing Co', description: 'Wall framing - second floor', type: 'subcontract', amount: 5800, status: 'paid' },
            { id: 'li-20', date: '2025-11-08', vendor: 'Texas Framing Co', description: 'Roof framing', type: 'subcontract', amount: 5200, status: 'paid' },
          ],
        },
        {
          id: 'cc-06-200', code: '06-200', description: 'Lumber & Materials',
          budget: 7000, committed: 6700, actual: 6700, forecast: 6700, variance: 300, status: 'complete',
          lineItems: [
            { id: 'li-21', date: '2025-10-22', vendor: '84 Lumber', description: '2x4, 2x6 framing lumber', type: 'material', amount: 3800, status: 'paid' },
            { id: 'li-22', date: '2025-10-22', vendor: '84 Lumber', description: 'Plywood sheathing', type: 'material', amount: 1900, status: 'paid' },
            { id: 'li-23', date: '2025-11-01', vendor: '84 Lumber', description: 'Misc hardware & fasteners', type: 'material', amount: 1000, status: 'paid' },
          ],
        },
      ],
    },
    {
      id: 'plumbing', code: '22', name: 'Plumbing',
      budget: 15000, committed: 14200, actual: 8500, forecast: 14800, variance: 200,
      status: 'in_progress', percentComplete: 60,
      costCodes: [
        {
          id: 'cc-22-100', code: '22-100', description: 'Plumbing Rough-In',
          budget: 9000, committed: 8500, actual: 8500, forecast: 8500, variance: 500, status: 'complete',
          lineItems: [
            { id: 'li-24', date: '2025-11-25', vendor: 'Lone Star Plumbing', description: 'Rough-in water lines', type: 'subcontract', amount: 4200, status: 'paid' },
            { id: 'li-25', date: '2025-12-02', vendor: 'Lone Star Plumbing', description: 'Rough-in drain/waste', type: 'subcontract', amount: 3500, status: 'paid' },
            { id: 'li-26', date: '2025-12-05', vendor: 'Ferguson Supply', description: 'PVC pipe & fittings', type: 'material', amount: 800, status: 'paid' },
          ],
        },
        {
          id: 'cc-22-200', code: '22-200', description: 'Plumbing Fixtures',
          budget: 6000, committed: 5700, actual: 0, forecast: 6300, variance: -300,
          status: 'over_budget', needsBidSelection: true, lineItems: [],
        },
      ],
    },
    {
      id: 'electrical', code: '26', name: 'Electrical',
      budget: 14000, committed: 13800, actual: 12100, forecast: 14200, variance: -200,
      status: 'at_risk', percentComplete: 75,
      costCodes: [
        {
          id: 'cc-26-100', code: '26-100', description: 'Electrical Rough-In',
          budget: 8000, committed: 7800, actual: 7800, forecast: 7800, variance: 200, status: 'complete',
          lineItems: [
            { id: 'li-27', date: '2025-11-28', vendor: 'Spark Electric', description: 'Rough-in wiring first floor', type: 'subcontract', amount: 3800, status: 'paid' },
            { id: 'li-28', date: '2025-12-05', vendor: 'Spark Electric', description: 'Rough-in wiring second floor', type: 'subcontract', amount: 2800, status: 'paid' },
            { id: 'li-29', date: '2025-12-08', vendor: 'Graybar Electric', description: 'Wire & conduit', type: 'material', amount: 1200, status: 'paid' },
          ],
        },
        {
          id: 'cc-26-200', code: '26-200', description: 'Panel & Service',
          budget: 3500, committed: 3800, actual: 3200, forecast: 4100, variance: -600, status: 'over_budget',
          lineItems: [
            { id: 'li-30', date: '2026-01-15', vendor: 'Spark Electric', description: '400A panel upgrade (CO-002)', type: 'subcontract', amount: 3200, status: 'approved' },
          ],
        },
        {
          id: 'cc-26-300', code: '26-300', description: 'Fixtures & Devices',
          budget: 2500, committed: 2200, actual: 1100, forecast: 2300, variance: 200, status: 'on_track',
          lineItems: [
            { id: 'li-31', date: '2026-01-20', vendor: 'Graybar Electric', description: 'Switches, outlets, covers', type: 'material', amount: 1100, status: 'paid' },
          ],
        },
      ],
    },
    {
      id: 'finishes', code: '09', name: 'Drywall & Finishes',
      budget: 16000, committed: 0, actual: 0, forecast: 15800, variance: 200,
      status: 'not_started', percentComplete: 0,
      costCodes: [
        { id: 'cc-09-100', code: '09-100', description: 'Drywall', budget: 8000, committed: 0, actual: 0, forecast: 7800, variance: 200, status: 'needs_bids', needsBidSelection: true, lineItems: [] },
        { id: 'cc-09-200', code: '09-200', description: 'Paint', budget: 5000, committed: 0, actual: 0, forecast: 5000, variance: 0, status: 'needs_bids', needsBidSelection: true, lineItems: [] },
        { id: 'cc-09-300', code: '09-300', description: 'Tile & Flooring', budget: 3000, committed: 0, actual: 0, forecast: 3000, variance: 0, status: 'pending', lineItems: [] },
      ],
    },
    {
      id: 'specialties', code: '10', name: 'Specialties & Equipment',
      budget: 12000, committed: 8400, actual: 4200, forecast: 11800, variance: 200,
      status: 'in_progress', percentComplete: 35,
      costCodes: [
        {
          id: 'cc-10-100', code: '10-100', description: 'Cabinets & Countertops',
          budget: 8000, committed: 7200, actual: 3600, forecast: 7800, variance: 200, status: 'in_progress',
          lineItems: [
            { id: 'li-32', date: '2026-01-10', vendor: 'Austin Cabinet Works', description: 'Kitchen cabinets deposit (50%)', type: 'material', amount: 3600, status: 'paid' },
          ],
        },
        {
          id: 'cc-10-200', code: '10-200', description: 'Appliances',
          budget: 4000, committed: 1200, actual: 600, forecast: 4000, variance: 0, status: 'in_progress',
          lineItems: [
            { id: 'li-33', date: '2026-02-01', vendor: 'Home Depot Pro', description: 'Range deposit', type: 'material', amount: 600, status: 'paid' },
          ],
        },
      ],
    },
  ],

  // ─── BIDS & QUOTES ───
  bids: {
    'cc-03-100': {
      costCode: '03-100', description: 'Foundation', budget: 12000, status: 'awarded', awardedVendor: 'v-abc',
      vendors: [
        {
          id: 'v-abc', name: 'ABC Concrete Co', baseBid: 11800, status: 'awarded', submittedDate: '2025-09-05', recommended: true,
          breakdown: [
            { item: 'Foundation Forms', qty: '120 LF', unitPrice: 28, amount: 3360 },
            { item: 'Rebar Supply & Install', qty: '2,400 lbs', unitPrice: 1.20, amount: 2880 },
            { item: 'Concrete Pour', qty: '18 CY', unitPrice: 185, amount: 3330 },
            { item: 'Finish & Cure', qty: '1 LS', unitPrice: 2230, amount: 2230 },
          ],
          notes: 'Includes 28-day break testing. 3-week lead time.', exclusions: 'Excludes dewatering if required.',
          insurance: { gl: true, wc: true, auto: true, expiry: '2026-08-15' }, rating: 4.5,
        },
        {
          id: 'v-smith', name: 'Smith Masonry', baseBid: 13200, status: 'rejected', submittedDate: '2025-09-07', recommended: false,
          breakdown: [
            { item: 'Foundation Forms', qty: '120 LF', unitPrice: 32, amount: 3840 },
            { item: 'Rebar Supply & Install', qty: '2,400 lbs', unitPrice: 1.35, amount: 3240 },
            { item: 'Concrete Pour', qty: '18 CY', unitPrice: 195, amount: 3510 },
            { item: 'Finish & Cure', qty: '1 LS', unitPrice: 2610, amount: 2610 },
          ],
          notes: '4-week lead time. Price valid 30 days.', exclusions: 'Excludes dewatering and winter protection.',
          insurance: { gl: true, wc: true, auto: false, expiry: '2026-05-01' }, rating: 3.8,
        },
        {
          id: 'v-foundation', name: 'Foundation Pro LLC', baseBid: 12500, status: 'rejected', submittedDate: '2025-09-08', recommended: false,
          breakdown: [
            { item: 'Foundation Forms', qty: '120 LF', unitPrice: 30, amount: 3600 },
            { item: 'Rebar Supply & Install', qty: '2,400 lbs', unitPrice: 1.25, amount: 3000 },
            { item: 'Concrete Pour', qty: '18 CY', unitPrice: 190, amount: 3420 },
            { item: 'Finish & Cure', qty: '1 LS', unitPrice: 2480, amount: 2480 },
          ],
          notes: '2-week lead time. Crew of 6.', exclusions: 'Excludes engineered backfill.',
          insurance: { gl: true, wc: true, auto: true, expiry: '2026-11-30' }, rating: 4.2,
        },
      ],
    },
    'cc-09-100': {
      costCode: '09-100', description: 'Drywall', budget: 8000, status: 'pending_selection', awardedVendor: null,
      vendors: [
        {
          id: 'v-drywall-pro', name: 'DryWall Pro', baseBid: 7800, status: 'submitted', submittedDate: '2026-01-20', recommended: true,
          breakdown: [
            { item: 'Hang Drywall', qty: '3,200 SF', unitPrice: 1.10, amount: 3520 },
            { item: 'Tape & Mud (Level 4)', qty: '3,200 SF', unitPrice: 0.85, amount: 2720 },
            { item: 'Ceiling Texture', qty: '1,400 SF', unitPrice: 0.65, amount: 910 },
            { item: 'Cleanup & Haul', qty: '1 LS', unitPrice: 650, amount: 650 },
          ],
          notes: 'Level 4 finish throughout. 2-week timeline.', exclusions: 'Excludes scaffolding above 10ft.',
          insurance: { gl: true, wc: true, auto: true, expiry: '2026-09-01' }, rating: 4.6,
        },
        {
          id: 'v-interior-finish', name: 'Interior Finish Co', baseBid: 8200, status: 'submitted', submittedDate: '2026-01-22', recommended: false,
          breakdown: [
            { item: 'Hang Drywall', qty: '3,200 SF', unitPrice: 1.20, amount: 3840 },
            { item: 'Tape & Mud (Level 4)', qty: '3,200 SF', unitPrice: 0.90, amount: 2880 },
            { item: 'Ceiling Texture', qty: '1,400 SF', unitPrice: 0.55, amount: 770 },
            { item: 'Cleanup & Haul', qty: '1 LS', unitPrice: 710, amount: 710 },
          ],
          notes: 'Level 4 finish. Can start within 1 week.', exclusions: 'Excludes patching existing walls.',
          insurance: { gl: true, wc: true, auto: true, expiry: '2026-12-15' }, rating: 4.1,
        },
        {
          id: 'v-apex', name: 'Apex Drywall', baseBid: 7400, status: 'submitted', submittedDate: '2026-01-25', recommended: false,
          breakdown: [
            { item: 'Hang Drywall', qty: '3,200 SF', unitPrice: 1.05, amount: 3360 },
            { item: 'Tape & Mud (Level 3)', qty: '3,200 SF', unitPrice: 0.75, amount: 2400 },
            { item: 'Ceiling Texture', qty: '1,400 SF', unitPrice: 0.60, amount: 840 },
            { item: 'Cleanup & Haul', qty: '1 LS', unitPrice: 800, amount: 800 },
          ],
          notes: 'NOTE: Level 3 finish only. 3-week timeline.', exclusions: 'Excludes Level 4/5 finish, scaffolding.',
          insurance: { gl: true, wc: false, auto: true, expiry: '2026-06-01' }, rating: 3.5,
        },
      ],
    },
    'cc-09-200': {
      costCode: '09-200', description: 'Paint', budget: 5000, status: 'pending_selection', awardedVendor: null,
      vendors: [
        {
          id: 'v-colorcraft', name: 'ColorCraft Painting', baseBid: 4800, status: 'submitted', submittedDate: '2026-01-28', recommended: true,
          breakdown: [
            { item: 'Interior Walls (2 coats)', qty: '3,200 SF', unitPrice: 0.95, amount: 3040 },
            { item: 'Trim & Doors', qty: '1 LS', unitPrice: 1100, amount: 1100 },
            { item: 'Ceilings', qty: '1,400 SF', unitPrice: 0.47, amount: 660 },
          ],
          notes: 'Sherwin-Williams Duration line. 1-week schedule.', exclusions: 'Excludes exterior, wallpaper removal.',
          insurance: { gl: true, wc: true, auto: true, expiry: '2026-10-01' }, rating: 4.4,
        },
        {
          id: 'v-allpro', name: 'All-Pro Painters', baseBid: 5200, status: 'submitted', submittedDate: '2026-01-30', recommended: false,
          breakdown: [
            { item: 'Interior Walls (2 coats)', qty: '3,200 SF', unitPrice: 1.05, amount: 3360 },
            { item: 'Trim & Doors', qty: '1 LS', unitPrice: 1200, amount: 1200 },
            { item: 'Ceilings', qty: '1,400 SF', unitPrice: 0.46, amount: 640 },
          ],
          notes: 'Benjamin Moore Regal Select. 10-day schedule.', exclusions: 'Excludes exterior and accent walls.',
          insurance: { gl: true, wc: true, auto: true, expiry: '2027-01-15' }, rating: 4.0,
        },
      ],
    },
    'cc-22-200': {
      costCode: '22-200', description: 'Plumbing Fixtures', budget: 6000, status: 'pending_selection', awardedVendor: null,
      vendors: [
        {
          id: 'v-lonestar', name: 'Lone Star Plumbing', baseBid: 5700, status: 'submitted', submittedDate: '2026-02-05', recommended: true,
          breakdown: [
            { item: 'Kitchen Sink & Faucet Install', qty: '1 EA', unitPrice: 850, amount: 850 },
            { item: 'Master Bath Fixtures', qty: '1 LS', unitPrice: 2100, amount: 2100 },
            { item: 'Guest Bath Fixtures', qty: '1 LS', unitPrice: 1400, amount: 1400 },
            { item: 'Powder Room (CO-001)', qty: '1 LS', unitPrice: 1350, amount: 1350 },
          ],
          notes: 'Kohler fixtures included. 2-week install.', exclusions: 'Excludes fixture procurement if owner-supplied.',
          insurance: { gl: true, wc: true, auto: true, expiry: '2026-08-20' }, rating: 4.3,
        },
        {
          id: 'v-reliable', name: 'Reliable Plumbing', baseBid: 6300, status: 'submitted', submittedDate: '2026-02-08', recommended: false,
          breakdown: [
            { item: 'Kitchen Sink & Faucet Install', qty: '1 EA', unitPrice: 950, amount: 950 },
            { item: 'Master Bath Fixtures', qty: '1 LS', unitPrice: 2400, amount: 2400 },
            { item: 'Guest Bath Fixtures', qty: '1 LS', unitPrice: 1500, amount: 1500 },
            { item: 'Powder Room (CO-001)', qty: '1 LS', unitPrice: 1450, amount: 1450 },
          ],
          notes: 'Moen fixtures. 3-week install.', exclusions: 'Excludes gas line work.',
          insurance: { gl: true, wc: true, auto: true, expiry: '2026-07-15' }, rating: 3.9,
        },
      ],
    },
  },

  // ─── COMMITMENTS ───
  commitments: [
    {
      id: 'cmt-1', type: 'subcontract', number: 'SC-001', vendor: 'Demo Kings LLC', costCode: '02-100', phase: 'Site Work',
      description: 'Interior demolition & haul-off', originalAmount: 4800, approvedCOs: 0, revisedAmount: 4800,
      invoiced: 4800, paid: 4800, remaining: 0, status: 'closed', date: '2025-09-12', retainage: 0,
      invoices: [{ id: 'inv-1', number: 'DK-2025-0847', date: '2025-09-30', amount: 4800, status: 'paid', paidDate: '2025-10-15' }],
    },
    {
      id: 'cmt-2', type: 'subcontract', number: 'SC-002', vendor: 'ABC Concrete Co', costCode: '03-100', phase: 'Concrete & Foundation',
      description: 'Foundation & flatwork', originalAmount: 17500, approvedCOs: 0, revisedAmount: 17500,
      invoiced: 17500, paid: 17500, remaining: 0, status: 'closed', date: '2025-09-18', retainage: 0,
      invoices: [
        { id: 'inv-2', number: 'ABC-1042', date: '2025-10-15', amount: 8000, status: 'paid', paidDate: '2025-10-30' },
        { id: 'inv-3', number: 'ABC-1065', date: '2025-10-25', amount: 9500, status: 'paid', paidDate: '2025-11-10' },
      ],
    },
    {
      id: 'cmt-3', type: 'subcontract', number: 'SC-003', vendor: 'Texas Framing Co', costCode: '06-100', phase: 'Wood & Framing',
      description: 'Rough framing - complete', originalAmount: 17500, approvedCOs: 0, revisedAmount: 17500,
      invoiced: 17500, paid: 17500, remaining: 0, status: 'closed', date: '2025-10-15', retainage: 0,
      invoices: [
        { id: 'inv-4', number: 'TFC-3321', date: '2025-11-01', amount: 6500, status: 'paid', paidDate: '2025-11-15' },
        { id: 'inv-5', number: 'TFC-3348', date: '2025-11-10', amount: 5800, status: 'paid', paidDate: '2025-11-25' },
        { id: 'inv-6', number: 'TFC-3372', date: '2025-11-20', amount: 5200, status: 'paid', paidDate: '2025-12-05' },
      ],
    },
    {
      id: 'cmt-4', type: 'subcontract', number: 'SC-004', vendor: 'Lone Star Plumbing', costCode: '22-100', phase: 'Plumbing',
      description: 'Plumbing rough-in', originalAmount: 7700, approvedCOs: 800, revisedAmount: 8500,
      invoiced: 8500, paid: 7650, remaining: 0, status: 'closed', date: '2025-11-10', retainage: 850,
      invoices: [
        { id: 'inv-7', number: 'LSP-0921', date: '2025-12-01', amount: 4200, status: 'paid', paidDate: '2025-12-18' },
        { id: 'inv-8', number: 'LSP-0945', date: '2025-12-10', amount: 4300, status: 'paid', paidDate: '2025-12-28' },
      ],
    },
    {
      id: 'cmt-5', type: 'subcontract', number: 'SC-005', vendor: 'Spark Electric', costCode: '26-100', phase: 'Electrical',
      description: 'Electrical rough-in & panel', originalAmount: 10000, approvedCOs: 3800, revisedAmount: 13800,
      invoiced: 11000, paid: 9900, remaining: 2800, status: 'active', date: '2025-11-15', retainage: 1100,
      invoices: [
        { id: 'inv-9', number: 'SE-7820', date: '2025-12-10', amount: 3800, status: 'paid', paidDate: '2025-12-28' },
        { id: 'inv-10', number: 'SE-7851', date: '2025-12-20', amount: 4000, status: 'paid', paidDate: '2026-01-05' },
        { id: 'inv-11', number: 'SE-7889', date: '2026-01-20', amount: 3200, status: 'approved', paidDate: null },
      ],
    },
    {
      id: 'cmt-6', type: 'purchase_order', number: 'PO-001', vendor: '84 Lumber', costCode: '06-200', phase: 'Wood & Framing',
      description: 'Framing lumber & materials', originalAmount: 6700, approvedCOs: 0, revisedAmount: 6700,
      invoiced: 6700, paid: 6700, remaining: 0, status: 'closed', date: '2025-10-18', retainage: 0,
      invoices: [
        { id: 'inv-12', number: '84L-88201', date: '2025-10-25', amount: 5700, status: 'paid', paidDate: '2025-11-08' },
        { id: 'inv-13', number: '84L-88245', date: '2025-11-05', amount: 1000, status: 'paid', paidDate: '2025-11-20' },
      ],
    },
    {
      id: 'cmt-7', type: 'purchase_order', number: 'PO-002', vendor: 'Austin Cabinet Works', costCode: '10-100', phase: 'Specialties & Equipment',
      description: 'Kitchen cabinets & countertops', originalAmount: 7200, approvedCOs: 0, revisedAmount: 7200,
      invoiced: 3600, paid: 3600, remaining: 3600, status: 'active', date: '2025-12-20', retainage: 0,
      invoices: [{ id: 'inv-14', number: 'ACW-4410', date: '2026-01-10', amount: 3600, status: 'paid', paidDate: '2026-01-25' }],
    },
    {
      id: 'cmt-8', type: 'purchase_order', number: 'PO-003', vendor: 'United Rentals', costCode: '01-200', phase: 'General Conditions',
      description: 'Temporary facilities rental', originalAmount: 2100, approvedCOs: 1100, revisedAmount: 3200,
      invoiced: 2800, paid: 2800, remaining: 400, status: 'active', date: '2025-09-15', retainage: 0,
      invoices: [
        { id: 'inv-15', number: 'UR-550182', date: '2025-10-01', amount: 900, status: 'paid', paidDate: '2025-10-15' },
        { id: 'inv-16', number: 'UR-550340', date: '2025-10-01', amount: 1200, status: 'paid', paidDate: '2025-10-15' },
        { id: 'inv-17', number: 'UR-551002', date: '2026-01-05', amount: 700, status: 'approved', paidDate: null },
      ],
    },
  ],

  // ─── SOV ───
  sov_lines: [
    { id: 1, line_number: 1, description: 'General Conditions', scheduled_value: 12000, previous_billed: 9800, current_billed: 0, stored_materials: 0, percent_complete: 81.7, balance_to_finish: 2200 },
    { id: 2, line_number: 2, description: 'Site Work & Demolition', scheduled_value: 8000, previous_billed: 7800, current_billed: 0, stored_materials: 0, percent_complete: 97.5, balance_to_finish: 200 },
    { id: 3, line_number: 3, description: 'Concrete & Foundation', scheduled_value: 18000, previous_billed: 17500, current_billed: 0, stored_materials: 0, percent_complete: 97.2, balance_to_finish: 500 },
    { id: 4, line_number: 4, description: 'Framing', scheduled_value: 25000, previous_billed: 24200, current_billed: 0, stored_materials: 0, percent_complete: 96.8, balance_to_finish: 800 },
    { id: 5, line_number: 5, description: 'Plumbing', scheduled_value: 15000, previous_billed: 8500, current_billed: 0, stored_materials: 0, percent_complete: 56.7, balance_to_finish: 6500 },
    { id: 6, line_number: 6, description: 'Electrical', scheduled_value: 14000, previous_billed: 12100, current_billed: 0, stored_materials: 0, percent_complete: 86.4, balance_to_finish: 1900 },
    { id: 7, line_number: 7, description: 'Drywall & Finishes', scheduled_value: 16000, previous_billed: 0, current_billed: 0, stored_materials: 0, percent_complete: 0, balance_to_finish: 16000 },
    { id: 8, line_number: 8, description: 'Specialties & Equipment', scheduled_value: 12000, previous_billed: 4200, current_billed: 0, stored_materials: 0, percent_complete: 35.0, balance_to_finish: 7800 },
    { id: 9, line_number: 9, description: 'CO #1 - Powder Room', scheduled_value: 4200, previous_billed: 0, current_billed: 0, stored_materials: 0, percent_complete: 0, balance_to_finish: 4200 },
    { id: 10, line_number: 10, description: 'CO #2 - Panel Upgrade', scheduled_value: 3800, previous_billed: 3200, current_billed: 0, stored_materials: 0, percent_complete: 84.2, balance_to_finish: 600 },
  ],

  // ─── PAY APPS ───
  pay_apps: [
    {
      id: 1, pay_app_number: 1, period: 'Oct 2025', amount_requested: 30000, amount_approved: 30000, retainage_held: 3000, net_payment: 27000, status: 'paid', submitted_date: '2025-10-15', paid_date: '2025-10-28',
      lines: [
        { sovLine: 2, description: 'Site Work & Demolition', thisperiod: 7800, retainage: 780 },
        { sovLine: 3, description: 'Concrete & Foundation', thisperiod: 14200, retainage: 1420 },
        { sovLine: 4, description: 'Framing', thisperiod: 8000, retainage: 800 },
      ],
    },
    {
      id: 2, pay_app_number: 2, period: 'Dec 2025', amount_requested: 38500, amount_approved: 38500, retainage_held: 3850, net_payment: 34650, status: 'paid', submitted_date: '2025-12-01', paid_date: '2025-12-18',
      lines: [
        { sovLine: 1, description: 'General Conditions', thisperiod: 5200, retainage: 520 },
        { sovLine: 4, description: 'Framing', thisperiod: 16200, retainage: 1620 },
        { sovLine: 5, description: 'Plumbing', thisperiod: 8500, retainage: 850 },
        { sovLine: 6, description: 'Electrical', thisperiod: 8600, retainage: 860 },
      ],
    },
    {
      id: 3, pay_app_number: 3, period: 'Feb 2026', amount_requested: 41400, amount_approved: 41400, retainage_held: 4140, net_payment: 37260, status: 'approved', submitted_date: '2026-02-01', approved_date: '2026-02-15',
      lines: [
        { sovLine: 1, description: 'General Conditions', thisperiod: 4600, retainage: 460 },
        { sovLine: 6, description: 'Electrical', thisperiod: 3500, retainage: 350 },
        { sovLine: 8, description: 'Specialties & Equipment', thisperiod: 4200, retainage: 420 },
        { sovLine: 10, description: 'CO #2 - Panel Upgrade', thisperiod: 3200, retainage: 320 },
      ],
    },
  ],

  // ─── CHANGE ORDERS ───
  change_orders: [
    {
      id: 1, co_number: 'CO-001', title: 'Add powder room plumbing', amount: 4200, status: 'approved',
      date_submitted: '2025-11-20', date_approved: '2025-11-25', reason: 'Owner requested additional powder room on first floor', impact_days: 5,
      cost_impact: [
        { costCode: '22-200', description: 'Plumbing Fixtures', amount: 3200 },
        { costCode: '09-100', description: 'Drywall (additional)', amount: 600 },
        { costCode: '26-300', description: 'Electrical (outlet/fan)', amount: 400 },
      ],
    },
    {
      id: 2, co_number: 'CO-002', title: 'Upgrade electrical panel to 400A', amount: 3800, status: 'pending_approval',
      date_submitted: '2026-02-10', reason: 'Engineer requires 400A service for added load from EV charger prep', impact_days: 3,
      cost_impact: [{ costCode: '26-200', description: 'Panel & Service upgrade', amount: 3800 }],
    },
  ],

  // ─── MILESTONES ───
  milestones: [
    { id: 1, task_name: 'Demolition', status: 'completed', planned_start: '2025-09-15', planned_end: '2025-09-30', actual_start: '2025-09-15', actual_end: '2025-09-28', dependencies: [] },
    { id: 2, task_name: 'Foundation', status: 'completed', planned_start: '2025-10-01', planned_end: '2025-10-20', actual_start: '2025-10-01', actual_end: '2025-10-22', dependencies: [1] },
    { id: 3, task_name: 'Framing', status: 'completed', planned_start: '2025-10-23', planned_end: '2025-11-20', actual_start: '2025-10-23', actual_end: '2025-11-18', dependencies: [2] },
    { id: 4, task_name: 'MEP Rough-In', status: 'in_progress', planned_start: '2025-11-21', planned_end: '2026-01-15', actual_start: '2025-11-20', dependencies: [3], percentComplete: 75 },
    { id: 5, task_name: 'Insulation & Drywall', status: 'not_started', planned_start: '2026-01-16', planned_end: '2026-02-15', dependencies: [4] },
    { id: 6, task_name: 'Interior Finishes', status: 'not_started', planned_start: '2026-02-16', planned_end: '2026-03-15', dependencies: [5] },
    { id: 7, task_name: 'Cabinets & Counters', status: 'not_started', planned_start: '2026-03-01', planned_end: '2026-03-20', dependencies: [5] },
    { id: 8, task_name: 'Final MEP Trim', status: 'not_started', planned_start: '2026-03-10', planned_end: '2026-03-25', dependencies: [6, 7] },
    { id: 9, task_name: 'Punch List', status: 'not_started', planned_start: '2026-03-25', planned_end: '2026-04-01', dependencies: [8] },
  ],

  // ─── CASHFLOW / WIP ───
  cashflow: {
    months: ['Sep 25', 'Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26'],
    budgetedSpend: [5000, 28000, 22000, 18000, 15000, 16000, 12000, 4000],
    actualSpend:   [4800, 27500, 23800, 19200, 8400, 0, 0, 0],
    billings:      [0, 27000, 0, 34650, 0, 37260, 0, 0],
  },
  wip: {
    totalContractValue: 145000, totalBilled: 98910, totalCost: 83700, estimatedCostAtCompletion: 117300,
    percentComplete: 71.4, earnedRevenue: 103530, overUnderBilled: -4620, retainageHeld: 10990,
    grossProfit: 27700, grossProfitPct: 19.1,
  },

  // ─── WHAT CHANGED LOG ───
  changeLog: [
    { id: 'cl-1', date: '2026-02-15', user: 'Matt S.', type: 'budget_revision', description: 'Revised budget for CO-002 panel upgrade', before: '$116,200', after: '$120,000', category: 'Electrical', costCode: '26-200' },
    { id: 'cl-2', date: '2026-02-10', user: 'Matt S.', type: 'change_order', description: 'Submitted CO-002: 400A panel upgrade', before: null, after: '$3,800', category: 'Electrical', costCode: '26-200' },
    { id: 'cl-3', date: '2026-02-05', user: 'Jake R.', type: 'bid_received', description: 'Received bid from Lone Star Plumbing for fixtures', before: null, after: '$5,700', category: 'Plumbing', costCode: '22-200' },
    { id: 'cl-4', date: '2026-02-01', user: 'Matt S.', type: 'pay_app', description: 'Submitted Pay App #3', before: null, after: '$41,400', category: 'Billing', costCode: null },
    { id: 'cl-5', date: '2026-01-25', user: 'Jake R.', type: 'bid_received', description: 'Received bid from Apex Drywall', before: null, after: '$7,400', category: 'Finishes', costCode: '09-100' },
    { id: 'cl-6', date: '2026-01-22', user: 'Jake R.', type: 'bid_received', description: 'Received bid from Interior Finish Co', before: null, after: '$8,200', category: 'Finishes', costCode: '09-100' },
    { id: 'cl-7', date: '2026-01-20', user: 'Jake R.', type: 'bid_received', description: 'Received bid from DryWall Pro', before: null, after: '$7,800', category: 'Finishes', costCode: '09-100' },
    { id: 'cl-8', date: '2026-01-15', user: 'Matt S.', type: 'commitment', description: 'Approved invoice SE-7889 for panel work', before: null, after: '$3,200', category: 'Electrical', costCode: '26-200' },
    { id: 'cl-9', date: '2025-12-20', user: 'Matt S.', type: 'commitment', description: 'Issued PO-002 to Austin Cabinet Works', before: null, after: '$7,200', category: 'Specialties', costCode: '10-100' },
    { id: 'cl-10', date: '2025-11-25', user: 'Matt S.', type: 'change_order', description: 'Approved CO-001: Powder room plumbing', before: '$112,000', after: '$116,200', category: 'Plumbing', costCode: '22-200' },
    { id: 'cl-11', date: '2025-11-18', user: 'Jake R.', type: 'milestone', description: 'Framing completed — 2 days early', before: 'In Progress', after: 'Completed', category: 'Schedule', costCode: '06-100' },
    { id: 'cl-12', date: '2025-10-22', user: 'Jake R.', type: 'milestone', description: 'Foundation completed — 2 days late', before: 'In Progress', after: 'Completed (2d late)', category: 'Schedule', costCode: '03-100' },
  ],
};

// ─── DECISION QUEUE ───
export const decisionQueue = [
  { id: 'dq-1', type: 'needs_bid_selection', priority: 'high', title: 'Select Drywall Subcontractor', description: '3 bids received for 09-100 Drywall. Budget: $8,000.', costCode: '09-100', bidRef: 'cc-09-100', date: '2026-01-25', actionLabel: 'Review Bids' },
  { id: 'dq-2', type: 'needs_bid_selection', priority: 'high', title: 'Select Paint Subcontractor', description: '2 bids received for 09-200 Paint. Budget: $5,000.', costCode: '09-200', bidRef: 'cc-09-200', date: '2026-01-30', actionLabel: 'Review Bids' },
  { id: 'dq-3', type: 'needs_bid_selection', priority: 'medium', title: 'Select Plumbing Fixtures Installer', description: '2 bids received for 22-200 Plumbing Fixtures. Budget: $6,000.', costCode: '22-200', bidRef: 'cc-22-200', date: '2026-02-08', actionLabel: 'Review Bids' },
  { id: 'dq-4', type: 'over_budget', priority: 'high', title: 'Over Budget: Panel & Service', description: '26-200 forecast $4,100 exceeds budget $3,500 by $600.', costCode: '26-200', date: '2026-02-15', actionLabel: 'Review Variance' },
  { id: 'dq-5', type: 'pending_approval', priority: 'medium', title: 'Pending CO: 400A Panel Upgrade', description: 'CO-002 for $3,800 awaiting owner approval.', costCode: '26-200', coRef: 'CO-002', date: '2026-02-10', actionLabel: 'View CO' },
  { id: 'dq-6', type: 'invoice_pending', priority: 'low', title: 'Invoice Pending Payment', description: 'Spark Electric SE-7889 ($3,200) approved, awaiting payment.', costCode: '26-100', date: '2026-01-20', actionLabel: 'View Invoice' },
];
