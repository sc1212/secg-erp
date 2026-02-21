# BRAND & DESIGN SYSTEM — SECG ERP

**Date:** 2026-02-21
**Tone:** Premium Executive
**Logo Source:** SE circular mark — gold & silver metallic

---

## 1. BRAND IDENTITY

### Company
- **Name:** Southeast Enterprise (SE)
- **Divisions:** Lending | Construction | Development | Multi-Family | Plumbing | HVAC | Electrical
- **Logo:** Circular "SE" monogram — gold metallic on dark background
- **Tagline Position:** Below logo, small caps

### Logo Usage

```
PRIMARY (Dark backgrounds):
┌─────────────────────────────────┐
│                                 │
│        ┌───────────┐            │
│        │           │            │
│        │    SE     │  ← Gold metallic on dark
│        │           │
│        └───────────┘            │
│    SOUTHEAST ENTERPRISE         │
│                                 │
└─────────────────────────────────┘

COMPACT (Sidebar/nav):
┌────┐
│ SE │  ← 32px circle, gold on charcoal
└────┘

FAVICON:
SE in gold on dark circle, 16x16 / 32x32
```

---

## 2. COLOR PALETTE

### Primary Colors (From Logo)

```
GOLD (Primary Brand)
  ┌──────────────────────┐
  │  #C9A84C             │  ← Primary gold
  │  Warm metallic gold  │
  └──────────────────────┘
  Lighter:  #D4B86A  (hover states)
  Darker:   #A88B3D  (pressed states)
  Subtle:   #C9A84C15 (gold tint backgrounds)

SILVER / CHROME (Secondary Brand)
  ┌──────────────────────┐
  │  #B8B8B8             │  ← Chrome silver
  │  Metallic silver     │
  └──────────────────────┘
  Lighter:  #D0D0D0
  Darker:   #8A8A8A

CHARCOAL (Primary Background)
  ┌──────────────────────┐
  │  #1A1A2E             │  ← Deep charcoal navy
  │  Premium dark base   │
  └──────────────────────┘

DARK SURFACE
  ┌──────────────────────┐
  │  #16213E             │  ← Card/panel background
  │  Slightly lighter    │
  └──────────────────────┘

NEAR BLACK
  ┌──────────────────────┐
  │  #0F0F1A             │  ← Deepest background
  │  Sidebar / nav       │
  └──────────────────────┘
```

### Functional Colors

```
SUCCESS     #22C55E   (Green — paid, complete, on-budget)
WARNING     #F59E0B   (Amber — approaching limit, needs attention)
DANGER      #EF4444   (Red — overdue, over-budget, critical)
INFO        #3B82F6   (Blue — informational, links, interactive)
```

### Text Colors

```
TEXT PRIMARY     #F1F1F1   (Near white — headings, primary text)
TEXT SECONDARY   #A0A0B0   (Muted — labels, secondary info)
TEXT TERTIARY    #6B6B80   (Dim — timestamps, metadata)
TEXT ON GOLD     #1A1A2E   (Dark text on gold buttons/badges)
```

---

## 3. TYPOGRAPHY

```
HEADING FONT:    Inter (weight 600-700)
  → Clean, professional, excellent readability
  → Used for: page titles, section headers, KPI numbers

BODY FONT:       Inter (weight 400-500)
  → Consistent with headings
  → Used for: body text, form labels, descriptions

MONO FONT:       JetBrains Mono (weight 400)
  → Used for: dollar amounts, project codes, account numbers

SIZE SCALE:
  text-xs     12px   → Metadata, timestamps
  text-sm     14px   → Labels, secondary text
  text-base   16px   → Body text, form inputs
  text-lg     18px   → Section titles
  text-xl     20px   → Page subtitles
  text-2xl    24px   → Page titles
  text-3xl    30px   → Dashboard KPI numbers
  text-4xl    36px   → Hero numbers (total cash, total revenue)

DOLLAR FORMATTING:
  Always use: $127,342.18 (comma separated, 2 decimal)
  Use mono font for all currency values
  Color: green for positive, red for negative, white for neutral
```

---

## 4. COMPONENT DESIGN TOKENS

### Spacing
```
SPACING SCALE (Tailwind-compatible):
  space-1     4px     → Tight: icon padding
  space-2     8px     → Compact: between form elements
  space-3    12px     → Default: list item padding
  space-4    16px     → Standard: card padding
  space-6    24px     → Section gap
  space-8    32px     → Large section gap
  space-12   48px     → Page section spacing
```

### Border Radius
```
  rounded-sm    4px    → Buttons, inputs
  rounded-md    8px    → Cards, panels
  rounded-lg   12px    → Modals, large cards
  rounded-xl   16px    → Feature cards
  rounded-full  9999px → Avatars, badges, logo circle
```

### Shadows
```
  shadow-sm     0 1px 2px rgba(0,0,0,0.3)           → Subtle lift
  shadow-md     0 4px 6px rgba(0,0,0,0.4)           → Card hover
  shadow-lg     0 10px 15px rgba(0,0,0,0.5)         → Modals
  shadow-gold   0 0 20px rgba(201,168,76,0.15)      → Gold glow on focus
  shadow-glow   0 0 30px rgba(201,168,76,0.25)      → Gold glow on hover
```

### Borders
```
  border-subtle    1px solid #2A2A3E    → Card borders
  border-strong    1px solid #3A3A50    → Focused inputs
  border-gold      1px solid #C9A84C    → Active/selected
  border-divider   1px solid #1F1F30    → Section dividers
```

---

## 5. UI COMPONENT LIBRARY

### Buttons

```
PRIMARY (Gold):
┌──────────────────────────┐
│   Approve & Send →       │  bg: #C9A84C  text: #1A1A2E
└──────────────────────────┘  hover: #D4B86A  shadow-gold
                              active: #A88B3D

SECONDARY (Outline):
┌──────────────────────────┐
│   Save Draft             │  bg: transparent  border: #3A3A50
└──────────────────────────┘  text: #F1F1F1  hover: bg #2A2A3E

DANGER (Red):
┌──────────────────────────┐
│   Delete Project         │  bg: #EF4444  text: white
└──────────────────────────┘  hover: #DC2626

GHOST (Minimal):
┌──────────────────────────┐
│   Cancel                 │  bg: transparent  text: #A0A0B0
└──────────────────────────┘  hover: text #F1F1F1

ICON BUTTON:
┌────┐
│ ⊕  │  bg: transparent  hover: bg #2A2A3E
└────┘  border-radius: full
```

### Cards

```
STANDARD CARD:
┌──────────────────────────────────────────┐
│  Card Title                    ● Status  │  bg: #16213E
│  ─────────────────────────────────────── │  border: #2A2A3E
│                                          │  rounded: 8px
│  Card content goes here.                │  padding: 24px
│  With metrics, tables, or forms.        │
│                                          │
│  [ Action Button ]                       │
└──────────────────────────────────────────┘

KPI CARD:
┌──────────────────────────┐
│  Cash on Hand            │  bg: #16213E
│                          │  gold left border accent
│  $277,911                │  ← text-3xl mono, white
│  ↑ 12.3% vs last month  │  ← text-sm, green
└──────────────────────────┘

ALERT CARD:
┌──────────────────────────────────────────┐
│  ⚠  3 invoices overdue (total $45,200) │  bg: #EF444415
│     [ View Overdue → ]                   │  border-left: red
└──────────────────────────────────────────┘
```

### Tables

```
DATA TABLE:
┌──────────────────────────────────────────────────────────────────┐
│  Project          Status       Budget        Spent      Var     │ ← header: #0F0F1A
├──────────────────────────────────────────────────────────────────┤
│  PRJ-042 Elm St   ● Active    $450,000    $312,847   $137,153 │ ← row: #16213E
│  PRJ-038 Oak Ave  ● Active    $280,000    $195,220    $84,780 │ ← alt: #1A1A2E
│  PRJ-051 Pine Dr  ⚠ At Risk   $180,000    $172,443     $7,557 │ ← warning row
│  PRJ-033 Maple    ✓ Complete  $320,000    $298,100    $21,900 │
├──────────────────────────────────────────────────────────────────┤
│  Showing 1-4 of 47              [ < Prev ]  1 2 3 ... 12  [ Next > ] │
└──────────────────────────────────────────────────────────────────┘

Row hover: bg #2A2A3E with subtle gold left border
Selected row: bg #C9A84C10 with gold left border
Sortable columns: header text with ▲▼ indicators
```

### Forms

```
INPUT FIELD:
┌─ Project Name ──────────────────────────┐
│  2847 Elm Street Renovation             │  bg: #0F0F1A
└─────────────────────────────────────────┘  border: #3A3A50
                                             focus: border #C9A84C + shadow-gold
                                             text: #F1F1F1
                                             label: #A0A0B0

SELECT DROPDOWN:
┌─ Status ────────────────────── ▾ ───────┐
│  Active                                  │
└─────────────────────────────────────────┘

SEARCH:
┌─ 🔍 Search projects, vendors, invoices... ──┐
│                                              │  bg: #0F0F1A
└──────────────────────────────────────────────┘  Cmd+K shortcut
```

### Status Badges

```
● Active     bg: #22C55E20  text: #22C55E  border: #22C55E40
● Pending    bg: #F59E0B20  text: #F59E0B  border: #F59E0B40
● Overdue    bg: #EF444420  text: #EF4444  border: #EF444440
● Paid       bg: #3B82F620  text: #3B82F6  border: #3B82F640
● Draft      bg: #6B6B8020  text: #6B6B80  border: #6B6B8040
● Complete   bg: #C9A84C20  text: #C9A84C  border: #C9A84C40  (gold!)
```

---

## 6. LAYOUT SYSTEM

### App Shell

```
┌──────────────────────────────────────────────────────────────────────┐
│ ┌──────┐                                          🔍  🔔  👤 Matt │
│ │  SE  │  SOUTHEAST ENTERPRISE                                      │
│ └──────┘                                                            │
├──────────┬───────────────────────────────────────────────────────────┤
│          │                                                           │
│ MAIN     │   Page Title                                             │
│          │   Breadcrumb > Trail > Here                              │
│ Dashboard│   ────────────────────────────────────────               │
│ Projects │                                                           │
│ Financials│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│ Payments │   │  KPI Card   │  │  KPI Card   │  │  KPI Card   │   │
│ Vendors  │   └─────────────┘  └─────────────┘  └─────────────┘   │
│ CRM      │                                                           │
│ Team     │   ┌──────────────────────────────────────────────────┐   │
│ Field Ops│   │                                                  │   │
│ Materials│   │              Main Content Area                   │   │
│ Safety   │   │              (Tables, forms, charts)             │   │
│ Documents│   │                                                  │   │
│ Reports  │   │                                                  │   │
│          │   └──────────────────────────────────────────────────┘   │
│ ──────── │                                                           │
│ Settings │                                                           │
│ Help     │                                                           │
│          │                                                           │
├──────────┴───────────────────────────────────────────────────────────┤
│  © 2026 Southeast Enterprise                                        │
└──────────────────────────────────────────────────────────────────────┘

Sidebar:     240px wide, bg #0F0F1A, collapsible to 64px (icon-only)
Header:      64px tall, bg #0F0F1A, border-bottom #2A2A3E
Content:     bg #1A1A2E, padding 32px
Active nav:  Gold left border + gold text + subtle gold bg tint
Hover nav:   bg #1A1A2E
```

### Responsive Breakpoints

```
MOBILE:     < 768px    → Sidebar hidden, hamburger menu, stacked cards
TABLET:     768-1024px → Sidebar collapsed (icons only), 2-col grid
DESKTOP:    1024-1440px → Full sidebar, 3-col grid, standard layout
WIDESCREEN: > 1440px   → Full sidebar, 4-col grid, expanded tables
```

---

## 7. ANIMATION & INTERACTION

```
TRANSITIONS:
  All:          150ms ease-out (snappy, professional)
  Page change:  200ms fade-in
  Modal open:   200ms scale(0.95→1) + fade
  Sidebar:      200ms slide

HOVER EFFECTS:
  Cards:        Subtle lift (translate-y -1px) + shadow increase
  Rows:         Background shift + gold left border appears
  Buttons:      Color shift (defined per variant)
  Nav items:    Background + gold accent

LOADING STATES:
  Skeleton:     Animated gradient shimmer (dark → slightly lighter → dark)
  Spinner:      Gold circle spinner
  Progress:     Gold progress bar with glow

MICRO-INTERACTIONS:
  Success:      Brief green checkmark flash
  Error:        Brief red shake
  Save:         Brief gold pulse
  Notification: Slide in from right, gold accent
```

---

## 8. DARK MODE

**Default: DARK mode (matches premium executive feel)**

The entire app is dark-first. The color palette above IS the dark theme.

Light mode can be added later as an option, but the primary brand experience is the dark premium look with gold accents. This matches the "SE" logo's gold-on-dark aesthetic perfectly.

---

## 9. ICON SYSTEM

```
Library: Lucide React (clean, consistent, MIT licensed)

Navigation Icons:
  Dashboard     → LayoutDashboard
  Projects      → FolderKanban
  Financials    → TrendingUp
  Payments      → CreditCard
  Vendors       → Users
  CRM           → Target
  Team          → UserCheck
  Field Ops     → HardHat
  Materials     → Package
  Safety        → ShieldCheck
  Documents     → FileText
  Reports       → BarChart3
  Settings      → Settings

Status Icons:
  Active        → Circle (filled green)
  Warning       → AlertTriangle (amber)
  Error         → XCircle (red)
  Complete      → CheckCircle (gold)
  Pending       → Clock (gray)

Action Icons:
  Add           → Plus
  Edit          → Pencil
  Delete        → Trash2
  Search        → Search
  Filter        → SlidersHorizontal
  Export        → Download
  Upload        → Upload
  More          → MoreHorizontal
```

---

## 10. TAILWIND CONFIG EXCERPT

```javascript
// tailwind.config.ts
{
  theme: {
    extend: {
      colors: {
        // Brand
        gold: {
          50:  '#FDF8E8',
          100: '#F8EDCC',
          200: '#EDD99A',
          300: '#E2C568',
          400: '#D4B86A',
          500: '#C9A84C',  // PRIMARY GOLD
          600: '#A88B3D',
          700: '#876E31',
          800: '#665225',
          900: '#44371A',
        },
        surface: {
          900: '#0F0F1A',  // Deepest (sidebar)
          800: '#1A1A2E',  // Default background
          700: '#16213E',  // Cards / panels
          600: '#2A2A3E',  // Hover / borders
          500: '#3A3A50',  // Strong borders
          400: '#4A4A60',  // Disabled state
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'gold': '0 0 20px rgba(201,168,76,0.15)',
        'gold-lg': '0 0 30px rgba(201,168,76,0.25)',
      },
    },
  },
}
```
