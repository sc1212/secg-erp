# SECG ERP — Interaction Standards

**Date**: 2026-02-21
**Purpose**: Define universal rules for how every interactive element in the system behaves. These are non-negotiable standards — every component must comply.

---

## Standard 1: Every KPI Is Clickable

### Rule
Every number, metric, or KPI displayed on any screen must be clickable and must drill to a filtered view that explains that number.

### Requirements
- Click a KPI → Navigate to the module that produces that number
- The destination view must be **pre-filtered** to show exactly the records that compose the KPI value
- A "back" action returns to the source view in its previous state
- If a KPI is computed (e.g., average, sum), the destination shows the individual records being aggregated

### Anti-Pattern (what we do NOT allow)
- A KPI card that shows "$184,500 AR Outstanding" but clicking it goes to a generic AR page with no filter
- A percentage that can't be broken into its numerator/denominator records
- A chart segment that is decorative and not interactive

### Implementation Pattern
```
<KPICard
  label="AR Outstanding"
  value={formatCurrency(data.ar_outstanding)}
  onClick={() => navigate('/financials/ar', { filter: { status: ['sent','overdue','partial'] }})}
  drillTarget="/financials/ar"
/>
```

---

## Standard 2: Every Chart Segment Is Interactive

### Rule
Every bar, pie slice, line point, area, or segment in any chart must respond to click/tap and navigate to a filtered view of the data it represents.

### Requirements
- Click a bar in a bar chart → Navigate to filtered list (e.g., click "PRJ-042" bar → Project detail for PRJ-042)
- Click a pie slice → Navigate to filtered list (e.g., click "Structure" slice → cost codes in Structure category)
- Click a line chart point → Navigate to time-filtered view (e.g., click Week 6 → cash flow detail for that week)
- Hover shows tooltip with the exact values
- Tooltip includes a "View Details →" link

### Anti-Pattern
- A chart that looks nice but clicking does nothing
- A chart where only the legend is interactive but the data segments aren't
- A chart that opens a modal with the same aggregated data instead of drilling to source records

### Implementation Pattern
```jsx
<BarChart data={projects} onClick={(data) => navigate(`/projects/${data.id}`)}>
  <Bar dataKey="spent" cursor="pointer" />
</BarChart>
```

---

## Standard 3: Every Filtered View Supports Sort, Filter, Compare, Export, Action

### 3.1 Sort
- Every column in every table must be sortable (ascending/descending)
- Current sort indicated by arrow icon in column header
- Default sort is defined per-view (e.g., AR defaults to "oldest first", projects default to "worst variance first")
- Sort persists during the session (navigating away and back preserves sort)

### 3.2 Filter
- Every list view must have a filter bar
- Minimum filters: text search (across name/description/code fields)
- Additional filters based on data type:
  - **Enum fields**: Dropdown/multiselect (e.g., status, type, category)
  - **Date fields**: Date range picker (from/to)
  - **Numeric fields**: Range (min/max) or threshold (greater than, less than)
  - **Related entities**: Dropdown (e.g., filter by project, vendor, PM)
- Active filters shown as removable chips
- "Clear all filters" button
- Filter state preserved in URL (shareable)

### 3.3 Compare
- Where applicable, enable side-by-side comparison:
  - **Projects**: Compare two projects' budget/actual/margin
  - **Vendors**: Compare scorecard ratings for same trade
  - **Periods**: Compare this month vs last month (P&L, cashflow)
  - **Forecasts**: Compare this week's forecast vs last week's
- Compare mode: select items → click "Compare" → side-by-side view

### 3.4 Export
- Every list/table view must have an "Export" button
- Export formats:
  - **CSV**: Raw data for spreadsheet analysis
  - **PDF**: Formatted report with headers, totals, company branding
- Export respects current filters and sort order
- Export filename includes: module, date, filter description (e.g., `AR_Aging_Over60Days_2026-02-21.csv`)

### 3.5 Action
- Every list view where actions are possible must show action buttons:
  - **Row-level actions**: Inline or on click/hover (e.g., [Edit] [Flag] [Approve])
  - **Bulk actions**: Select multiple rows → action bar appears (e.g., [Bulk Approve] [Bulk Assign] [Bulk Export])
  - **Page-level actions**: Primary action button in header (e.g., [Create New] [Import] [Generate Report])

---

## Standard 4: Drilldown Depth Rules

### Minimum Drill Depth by Module

| Module | Minimum Depth | Terminal Node |
|--------|--------------|---------------|
| Dashboard KPI | 3 levels | Source record (invoice, transaction, cost event) |
| Job Costing | 5 levels | Transaction + approval history |
| Cash Flow | 4 levels | Scheduled transaction + confidence |
| AR/Billing | 4 levels | Invoice + payment + draw source |
| Change Orders | 4 levels | Budget + billing + margin impact chain |
| Vendor Management | 3 levels | Commitment + invoice + payment |
| Team/Workforce | 3 levels | Employee + project + cost allocation |

### Drill Behavior
1. **Click** main content (name, code, amount) → Navigate to detail view
2. **Hover** → Show summary tooltip with key fields
3. **Right-click / long-press** → Context menu with: Open, Open in New Tab, Copy Link
4. **Breadcrumb trail** always visible showing full drill path
5. **Back button** returns to exact previous state (scroll position, filters, sort)

---

## Standard 5: Action Standards

### Every Terminal Drilldown Has Actions

When a user reaches the deepest level of a drill (e.g., a specific cost event, invoice, or commitment), the following actions must be available (as applicable):

#### Data Actions
| Action | When Available | Effect |
|--------|--------------|--------|
| Edit | Record is editable (not locked) | Opens edit form |
| Delete/Void | Record is deletable + user has permission | Soft delete with confirmation |
| Recode | Cost event assigned to wrong project/code | Move to correct project/cost code |
| Duplicate | Creating similar record | Pre-fills form with existing data |

#### Workflow Actions
| Action | When Available | Effect |
|--------|--------------|--------|
| Approve | Record in "pending" status + user has authority | Changes status, triggers downstream updates |
| Reject | Record in "pending" status + user has authority | Changes status, sends notification to submitter |
| Escalate | User doesn't have authority or decision is complex | Assigns to higher authority with notes |
| Flag for Review | Any record that looks wrong | Creates workflow task, adds visual indicator |

#### Communication Actions
| Action | When Available | Effect |
|--------|--------------|--------|
| Add Note | Always | Attaches timestamped note to record |
| Assign | Record needs someone's attention | Creates task assigned to specific user |
| Notify | Someone needs to know about this | Sends in-app notification (future: email) |

#### Financial Actions
| Action | When Available | Effect |
|--------|--------------|--------|
| Update Forecast | Cost code or project level | Updates EAC/ETC values |
| Create CO | Variance identified that needs formal change | Opens CO creation form pre-linked |
| Request Draw | Project has billable work | Opens draw creation flow |
| Record Payment | AR invoice or AP commitment | Opens payment form |
| Release Retainage | Project complete or milestone met | Opens retainage release flow |

### Action Confirmation Rules
| Risk Level | Confirmation |
|-----------|-------------|
| Low (add note, flag) | No confirmation needed |
| Medium (edit, update, assign) | Inline confirmation ("Are you sure?") |
| High (approve, reject, void) | Modal with summary of what will happen |
| Critical (delete, release retainage >$10K) | Modal + type-to-confirm |

---

## Standard 6: Loading, Empty, and Error States

### Loading States
- **First load**: Full-page skeleton that mimics the layout of the actual content
- **Refresh/filter change**: Inline loading indicator (spinner on the data area, not the whole page)
- **Background refresh**: Silent — only show indicator if > 3 seconds

### Empty States
- **No data in database**: Onboarding message ("Import your masterfile to get started" + [Import] button)
- **No results for filter**: "No records match your filters" + [Clear Filters] button
- **No items in this category**: Contextual message ("No overdue invoices" — positive framing)

### Error States
- **API error**: Retry button + error detail (expandable)
- **Permission denied**: "You don't have access to this action. Contact your administrator."
- **Validation error**: Inline field-level messages (not alerts/toasts)
- **Conflict (stale data)**: "This record was updated by someone else. Review changes and try again."

---

## Standard 7: Data Freshness and Confidence

### Every aggregated number must show:
1. **Last updated**: When the underlying data was last imported/synced
2. **Record count**: How many source records compose this number (shown on hover or in drill view)
3. **Confidence level** (for forecasts): High/Medium/Low with color coding

### Freshness Indicators
| Age | Indicator | Color |
|-----|-----------|-------|
| < 1 hour | "Live" | Green |
| 1-24 hours | "Updated today" | Default |
| 1-7 days | "Updated X days ago" | Yellow |
| > 7 days | "Stale — reimport recommended" | Red |

### Forecast Confidence
| Confidence | Basis | Color |
|-----------|-------|-------|
| High | Approved/committed (signed contracts, approved draws) | Green |
| Medium | Expected (sent invoices, pending draws, verbal commitments) | Yellow |
| Low | Projected (trend-based, estimated, no commitment) | Red/Gray |

---

## Standard 8: URL Structure & Deep Linking

Every view in the system must have a unique, shareable URL.

### URL Pattern
```
/[module]/[entity-type]/[id]?[filters]

Examples:
/projects                              → Project list
/projects/42                           → Project #42 overview
/projects/42/costs                     → Project #42 cost codes tab
/projects/42/costs/103                 → Cost code #103 detail
/projects/42/costs/103/events          → Cost events for code #103
/projects/42/draws/5                   → Draw #5 detail
/projects/42/cos/8                     → Change order #8 detail

/financials/ar?status=overdue&age=60+  → AR filtered to 60+ days overdue
/financials/cash-forecast?week=2026-03-02 → Cash forecast for specific week

/vendors/15                            → Vendor #15 detail
/vendors/15/commitments                → Vendor #15 commitments
/vendors?trade=plumbing&score_min=3    → Vendors filtered by trade and score

/crm/pipeline?stage=bid_submitted      → Pipeline filtered to bids submitted
/crm/leads/234                         → Lead #234 detail

/team/crew?week=2026-02-24             → Crew allocation for week of Feb 24
/team/employees/7                      → Employee #7 detail
```

### Filter Persistence
- All filter selections are encoded in URL query parameters
- Sharing a URL gives the recipient the exact same filtered view
- Browser back/forward navigates filter history
- "Reset" clears all filters and returns to default URL

---

## Standard 9: Keyboard Navigation & Power User Support

### Global Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+K` / `Cmd+K` | Global search |
| `Ctrl+/` | Show keyboard shortcuts |
| `Escape` | Close modal/drawer, clear search |
| `?` | Help/documentation |

### Table Shortcuts
| Shortcut | Action |
|----------|--------|
| `↑` / `↓` | Navigate rows |
| `Enter` | Open selected row detail |
| `Space` | Select/deselect row (for bulk actions) |
| `Ctrl+A` | Select all visible rows |
| `Ctrl+E` | Export current view |

### Navigation
| Shortcut | Action |
|----------|--------|
| `Alt+1` | Dashboard |
| `Alt+2` | Projects |
| `Alt+3` | Financials |
| `Alt+4` | Vendors |
| `Alt+5` | CRM |
| `Alt+6` | Team |

---

## Standard 10: Mobile Responsiveness Rules

### Priority Views (must work on mobile)
1. Dashboard KPIs (stack vertically)
2. Alert queue
3. Project list (simplified columns)
4. Daily log / field reporting
5. Crew allocation (today only)

### Deferred to Desktop
1. Full cost code tables (too wide for phone)
2. G702/G703 PDF generation
3. 13-week cash forecast grid
4. Side-by-side comparisons
5. Bulk operations

### Mobile Interaction Adjustments
- Tap replaces click
- Long-press replaces right-click
- Swipe left on list item → quick actions (flag, approve)
- Swipe down → refresh
- Bottom navigation bar for main modules
- Cards replace tables where possible

---

## Compliance Checklist

Before any page/component is considered "done," verify:

- [ ] Every KPI/metric is clickable and drills to source records
- [ ] Every chart segment is interactive
- [ ] Tables support sort on every column
- [ ] Filter bar with relevant filters exists
- [ ] Export button works (CSV minimum)
- [ ] Actions are available at the terminal drilldown level
- [ ] Loading state exists (skeleton, not just spinner)
- [ ] Empty state exists with contextual message
- [ ] Error state exists with retry option
- [ ] URL is unique and shareable with filter state
- [ ] Breadcrumb trail shows drill path
- [ ] Back button preserves previous state
- [ ] Data freshness indicator is visible
- [ ] Mobile layout is functional (for priority views)
- [ ] Permission checks prevent unauthorized actions
- [ ] Action confirmations exist for medium/high/critical operations
