import { useState } from 'react';
import { money } from '../lib/format';

// ─── DATA ────────────────────────────────────────────────────────────────────

const PIPELINE = [
  { id:1,  name:'Westside Custom Home',           client:'Jennifer Adams',        type:'Custom Home',    value:580000,  stage:'bid_submitted',  prob:75,  deadline:'2026-03-01', estimator:'Connor Mitchell', daysInStage:12, priority:'hot',  notes:'Bid submitted 2/10. Site walk scheduled 2/28. Client comparing 2 bids.' },
  { id:2,  name:'Riverstone Multifamily Ph.2',    client:'Riverstone Dev LLC',    type:'Multifamily',    value:2100000, stage:'estimating',     prob:40,  deadline:'2026-03-15', estimator:'Colton H.',       daysInStage:8,  priority:'warm', notes:'RFP received 2/14. Full estimate in progress. 18 units, 3-story.' },
  { id:3,  name:'Oak Creek Remodel',              client:'Robert Chen',           type:'Remodel',        value:92000,   stage:'under_review',   prob:65,  deadline:'2026-03-01', estimator:'Joseph Kowalski', daysInStage:7,  priority:'warm', notes:'Bid submitted 2/14. Decision expected 3/1. Competing with 1 other.' },
  { id:4,  name:'Crestview Office Build-Out',     client:'Crestview Corp',        type:'Commercial TI',  value:320000,  stage:'lead',           prob:20,  deadline:'2026-04-01', estimator:'Alex Reyes',      daysInStage:5,  priority:'cold', notes:'Initial inquiry. Site meeting 3/5. Early stage, no plans yet.' },
  { id:5,  name:'Magnolia Custom Addition',       client:'David & Karen Park',    type:'Remodel',        value:145000,  stage:'bid_submitted',  prob:80,  deadline:'2026-03-10', estimator:'Connor Mitchell', daysInStage:4,  priority:'hot',  notes:'Client selected us pending final pricing review. Very warm lead.' },
  { id:6,  name:'Downtown Loft Renovation',       client:'Sarah Mitchell',        type:'Remodel',        value:124000,  stage:'under_review',   prob:55,  deadline:'2026-02-28', estimator:'Abi Darnell',     daysInStage:9,  priority:'warm', notes:'Competing against 2 other bids. Client values our portfolio.' },
  { id:7,  name:'Sunrise Spec — Lot 4',           client:'SECG Internal',         type:'Spec Home',      value:460000,  stage:'estimating',     prob:90,  deadline:'2026-03-20', estimator:'Connor Mitchell', daysInStage:3,  priority:'hot',  notes:'Internal spec. Lot purchased. Budget estimate in progress.' },
  { id:8,  name:'Franklin Commercial Renovation', client:'Franklin Props LLC',    type:'Commercial TI',  value:280000,  stage:'lead',           prob:15,  deadline:'2026-05-01', estimator:'Alex Reyes',      daysInStage:2,  priority:'cold', notes:'Referral from Crestview. No plans. Budget unknown.' },
  { id:9,  name:'Brentwood Custom Home',          client:'Thomas & Amy Reeves',   type:'Custom Home',    value:680000,  stage:'won',            prob:100, deadline:'2026-02-15', estimator:'Joseph Kowalski', daysInStage:0,  priority:'hot',  notes:'Contract signed 2/15. Starting pre-con phase March 1.' },
  { id:10, name:'Green Hills Addition',           client:'Paul & Dana Williams',  type:'Remodel',        value:88000,   stage:'lost',           prob:0,   deadline:'2026-02-10', estimator:'Abi Darnell',     daysInStage:0,  priority:'cold', notes:'Lost to lower bid. Competitor came in $14K under our price.' },
];

const LEADS = [
  { id:1, name:'Westside Custom Home',       source:'Referral - Marcus Webb',  type:'Custom Home',   contact:'Jennifer Adams',     phone:'(615) 441-8820', email:'jadams@email.com',   value:580000,  status:'qualified',     assigned:'Matt S.', received:'2026-02-01', lastContact:'2026-02-18', nextAction:'Follow up after site walk 2/28', budget:'$550-620K stated',  sqft:3400,  financing:'Construction loan approved', score:82,
    qualScores:{ budget:4, timeline:4, decision:4, fit:5, payment:4 },
    activity:[
      { date:'2026-02-18', type:'Phone call',  notes:'Discussed budget range. Client very interested in our portfolio. Confirmed site walk 2/28.' },
      { date:'2026-02-10', type:'Bid sent',    notes:'Full estimate delivered via email. Connor reviewed line-by-line with client.' },
      { date:'2026-02-01', type:'Initial call',notes:'Referral from Marcus Webb. Custom home 3,400 SF. Construction loan already approved.' },
    ]
  },
  { id:2, name:'Oak Creek Remodel',          source:'Google Ads',              type:'Remodel',       contact:'Robert Chen',        phone:'(615) 882-4401', email:'rchen@email.com',    value:92000,   status:'proposal_sent', assigned:'Matt S.', received:'2026-01-28', lastContact:'2026-02-14', nextAction:'Call for decision by 3/1',       budget:'$80-100K stated',   sqft:1200,  financing:'Cash',                       score:68,
    qualScores:{ budget:4, timeline:3, decision:3, fit:4, payment:5 },
    activity:[
      { date:'2026-02-14', type:'Proposal sent', notes:'Final proposal emailed. Competing with one other local GC.' },
      { date:'2026-02-05', type:'Site visit',    notes:'Toured Oak Creek property. Scope confirmed: kitchen, master bath, deck.' },
      { date:'2026-01-28', type:'Web inquiry',   notes:'Google Ads lead. Responded within 1 hour. Scheduled site visit.' },
    ]
  },
  { id:3, name:'Magnolia Custom Addition',   source:'Repeat client',           type:'Remodel',       contact:'David & Karen Park', phone:'(615) 220-5510', email:'dpark@email.com',    value:145000,  status:'qualified',     assigned:'Matt S.', received:'2026-02-05', lastContact:'2026-02-20', nextAction:'Final pricing review call',      budget:'$130-160K stated',  sqft:800,   financing:'Home equity approved',       score:88,
    qualScores:{ budget:4, timeline:4, decision:5, fit:5, payment:4 },
    activity:[
      { date:'2026-02-20', type:'Phone call',  notes:'Reviewed draft budget. Parks are ready to move forward pending final number.' },
      { date:'2026-02-12', type:'Site visit',  notes:'Addition scope walk. 800 SF master suite addition with vaulted ceiling.' },
      { date:'2026-02-05', type:'Inbound',     notes:'Repeat client from 2022 bath remodel. Called directly to request estimate.' },
    ]
  },
  { id:4, name:'Downtown Loft Renovation',   source:'Real estate referral',    type:'Remodel',       contact:'Sarah Mitchell',     phone:'(615) 331-7700', email:'smitch@email.com',   value:124000,  status:'proposal_sent', assigned:'Matt S.', received:'2026-01-20', lastContact:'2026-02-16', nextAction:'Decision expected 2/28',         budget:'$110-130K stated',  sqft:1800,  financing:'Cash',                       score:61,
    qualScores:{ budget:3, timeline:3, decision:3, fit:4, payment:5 },
    activity:[
      { date:'2026-02-16', type:'Email',       notes:'Client acknowledged receipt. Reviewing with her designer before deciding.' },
      { date:'2026-02-08', type:'Proposal',    notes:'Sent full scope proposal. Two competing bids also submitted.' },
      { date:'2026-01-20', type:'Referral',    notes:'Referred by agent Donna Bray. Condo renovation, open concept conversion.' },
    ]
  },
  { id:5, name:'Riverstone Phase 2',         source:'Existing client',         type:'Multifamily',   contact:'Riverstone Dev LLC', phone:'(615) 448-9900', email:'dev@riverstone.com', value:2100000, status:'new',           assigned:'Matt S.', received:'2026-02-14', lastContact:'2026-02-14', nextAction:'Intro call this week',           budget:'Budget TBD',        sqft:14000, financing:'Developer financing',         score:45,
    qualScores:{ budget:2, timeline:2, decision:2, fit:5, payment:4 },
    activity:[
      { date:'2026-02-14', type:'RFP received', notes:'Formal RFP from Riverstone for Phase 2 of Elm St. project. 18 units, 3 stories.' },
    ]
  },
  { id:6, name:'Crestview Office Build-Out', source:'Cold outreach',           type:'Commercial TI', contact:'Crestview Corp',     phone:'(615) 788-2200', email:'fm@crestview.com',   value:320000,  status:'contacted',     assigned:'Matt S.', received:'2026-02-17', lastContact:'2026-02-17', nextAction:'Site meeting 3/5',               budget:'$300K approved',    sqft:4200,  financing:'Corporate cash',              score:38,
    qualScores:{ budget:4, timeline:2, decision:2, fit:3, payment:5 },
    activity:[
      { date:'2026-02-17', type:'Cold call',   notes:'Outreach from Alex Reyes. FM director agreed to site meeting 3/5. Budget already approved.' },
    ]
  },
  { id:7, name:'Sunrise Spec Lot 4',         source:'Internal',                type:'Spec Home',     contact:'SECG Internal',      phone:'—',              email:'—',                  value:460000,  status:'qualified',     assigned:'Matt S.', received:'2026-02-19', lastContact:'2026-02-19', nextAction:'Finalize budget estimate',       budget:'Internal target',   sqft:2600,  financing:'Internal',                   score:95,
    qualScores:{ budget:5, timeline:5, decision:5, fit:5, payment:5 },
    activity:[
      { date:'2026-02-19', type:'Internal',    notes:'Lot 4 purchased. Connor beginning budget estimate. Target $460K construction cost.' },
    ]
  },
];

const WON_LOST = [
  { id:1,  name:'Elm St Multifamily Phase 1',  client:'Elm St Holdings',      type:'Multifamily',   value:2800000, result:'won',  date:'2025-06-01', margin:12.4, bidMargin:14.0, estimator:'Colton H.',       sealedBy:'Relationship + competitive price',                lossReason:null,                                     competitor:null,             competitorBid:null,   lesson:'Phase 1 relationship led directly to Phase 2 opportunity.' },
  { id:2,  name:'Summerfield Custom Home',      client:'The Johnson Family',   type:'Custom Home',   value:510000,  result:'won',  date:'2025-08-15', margin:17.2, bidMargin:17.5, estimator:'Connor Mitchell', sealedBy:'Quality reputation + referral',                    lossReason:null,                                     competitor:null,             competitorBid:null,   lesson:'Repeat referral — client visited Riverside site and loved it.' },
  { id:3,  name:'Gallatin Commercial Pad',      client:'Gallatin Invest.',     type:'Commercial',    value:680000,  result:'lost', date:'2025-09-22', margin:null, bidMargin:14.8, estimator:'Alex Reyes',      sealedBy:null,                                               lossReason:'Price too high',                         competitor:'Titan Build',    competitorBid:618000, lesson:'Our GC overhead is not competitive on pure commercial. Stick to residential.' },
  { id:4,  name:'Heritage Pointe Spec',         client:'SECG Internal',        type:'Spec Home',     value:420000,  result:'won',  date:'2025-11-10', margin:19.8, bidMargin:18.0, estimator:'Joseph Kowalski', sealedBy:'Internal spec — above estimate',                   lossReason:null,                                     competitor:null,             competitorBid:null,   lesson:'Sold $22K above estimate due to market conditions. Review spec pricing.' },
  { id:5,  name:'Crossroads Retail TI',         client:'Crossroads LLC',       type:'Commercial TI', value:240000,  result:'lost', date:'2025-12-05', margin:null, bidMargin:16.2, estimator:'Abi Darnell',     sealedBy:null,                                               lossReason:'Client went with existing relationship', competitor:'Franklin Builders', competitorBid:228000, lesson:'Client had pre-existing relationship with competitor. Better qualification needed.' },
  { id:6,  name:'Smith Residence Addition',     client:'Mark & Lisa Smith',    type:'Remodel',       value:88000,   result:'won',  date:'2026-01-20', margin:21.4, bidMargin:18.5, estimator:'Abi Darnell',     sealedBy:'Timeline commitment + price',                      lossReason:null,                                     competitor:'Self-GC',        competitorBid:72000,  lesson:'Won against self-GC approach by demonstrating risk and project management value.' },
  { id:7,  name:'Brentwood Custom Home',        client:'Thomas & Amy Reeves',  type:'Custom Home',   value:680000,  result:'won',  date:'2026-02-15', margin:null, bidMargin:17.8, estimator:'Joseph Kowalski', sealedBy:'Portfolio tour + reputation',                      lossReason:null,                                     competitor:'2 others',       competitorBid:null,   lesson:'Portfolio visit was decisive. Invest in model home or photo library.' },
  { id:8,  name:'Green Hills Addition',         client:'Paul & Dana Williams', type:'Remodel',       value:88000,   result:'lost', date:'2026-02-10', margin:null, bidMargin:18.0, estimator:'Abi Darnell',     sealedBy:null,                                               lossReason:'Price too high — $14K over winning bid', competitor:'Local GC',       competitorBid:74000,  lesson:'Remodel market is hyper-competitive. Review labor rates for small jobs.' },
];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const STAGES = [
  { key:'lead',          label:'Lead' },
  { key:'estimating',    label:'Estimating' },
  { key:'bid_submitted', label:'Bid Submitted' },
  { key:'under_review',  label:'Under Review' },
  { key:'won',           label:'Won' },
  { key:'lost',          label:'Lost' },
];

const STATUS_COLORS = {
  new:           'var(--text-tertiary)',
  contacted:     '#4b9cf5',
  qualified:     '#f5a623',
  proposal_sent: 'var(--status-profit)',
  negotiating:   '#9b59b6',
};

const PRIORITY_COLORS = {
  hot:  'var(--status-loss)',
  warm: 'var(--status-warning)',
  cold: 'var(--text-tertiary)',
};

const PROB_FACTOR_ROWS = [
  { factor:'Client relationship',   weight:25 },
  { factor:'Project type match',    weight:20 },
  { factor:'Price competitiveness', weight:20 },
  { factor:'Capacity available',    weight:20 },
  { factor:'Timeline fit',          weight:15 },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function daysUntil(dateStr) {
  const today = new Date('2026-02-22');
  const target = new Date(dateStr);
  return Math.round((target - today) / 86400000);
}

function daysSince(dateStr) {
  const today = new Date('2026-02-22');
  const target = new Date(dateStr);
  return Math.round((today - target) / 86400000);
}

function probColor(p) {
  if (p > 70) return 'var(--status-profit)';
  if (p > 40) return 'var(--status-warning)';
  return 'var(--status-loss)';
}

function weightedValue(bid) {
  return bid.value * (bid.prob / 100);
}

// Deterministic pseudo-scores for probability breakdown per bid
function getBidProbScores(bid) {
  const seed = bid.id;
  return PROB_FACTOR_ROWS.map((row, i) => {
    const raw = ((seed * (i + 3) * 7) % 5) + 1;
    return { ...row, score: raw, contribution: ((raw / 5) * row.weight).toFixed(1) };
  });
}

function computeTotalProb(rows) {
  return rows.reduce((acc, r) => acc + parseFloat(r.contribution), 0).toFixed(0);
}

// ─── SHARED STYLES ───────────────────────────────────────────────────────────

const S = {
  page: {
    padding: '24px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: 'var(--text-primary)',
    minHeight: '100vh',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--text-primary)',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 12,
    color: 'var(--text-tertiary)',
    marginBottom: 20,
  },
  tabBar: {
    display: 'flex',
    gap: 4,
    marginBottom: 20,
    borderBottom: '1px solid var(--color-brand-border)',
    paddingBottom: 0,
  },
  tab: (active) => ({
    padding: '8px 18px',
    fontSize: 13,
    fontWeight: active ? 700 : 400,
    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
    background: 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid #4b9cf5' : '2px solid transparent',
    cursor: 'pointer',
    marginBottom: -1,
    transition: 'color 0.15s',
  }),
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
    marginBottom: 24,
  },
  kpiCard: {
    background: 'var(--color-brand-card)',
    border: '1px solid var(--color-brand-border)',
    borderRadius: 10,
    padding: '14px 16px',
  },
  kpiLabel: {
    fontSize: 11,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: 700,
    fontFamily: 'monospace',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  kpiSub: {
    fontSize: 11,
    color: 'var(--text-tertiary)',
    marginTop: 4,
  },
  card: {
    background: 'var(--color-brand-card)',
    border: '1px solid var(--color-brand-border)',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 13,
  },
  th: {
    textAlign: 'left',
    fontSize: 11,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '6px 10px',
    borderBottom: '1px solid var(--color-brand-border)',
    fontWeight: 600,
  },
  td: {
    padding: '9px 10px',
    borderBottom: '1px solid var(--color-brand-border)',
    color: 'var(--text-primary)',
    verticalAlign: 'top',
  },
  badge: (color) => ({
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    background: color + '22',
    color: color,
    textTransform: 'capitalize',
  }),
  mono: {
    fontFamily: 'monospace',
    fontSize: 13,
  },
  clickable: {
    cursor: 'pointer',
    textDecoration: 'underline dotted',
    textUnderlineOffset: 2,
  },
};

// ─── DRILL MODAL ─────────────────────────────────────────────────────────────

function DrillModal({ drill, onClose }) {
  if (!drill) return null;
  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={onClose}
    >
      <div
        style={{ background:'var(--color-brand-card)', border:'1px solid var(--color-brand-border)', borderRadius:12, padding:24, width:480, maxWidth:'90vw' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:16 }}>{drill.title}</div>
        {drill.rows.map((r, i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderTop: i === 0 ? 'none' : '1px solid var(--color-brand-border)' }}>
            <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{r.label}</span>
            <span style={{ fontSize:13, fontWeight:600, fontFamily:'monospace', color:'var(--text-primary)' }}>{r.value}</span>
          </div>
        ))}
        <button
          onClick={onClose}
          style={{ marginTop:16, padding:'7px 16px', borderRadius:6, border:'1px solid var(--color-brand-border)', background:'transparent', color:'var(--text-secondary)', cursor:'pointer', fontSize:12 }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ─── BID DETAIL MODAL ────────────────────────────────────────────────────────

function BidDetailModal({ bid, onClose }) {
  const [wonMsg, setWonMsg] = useState(false);
  if (!bid) return null;

  const probRows = getBidProbScores(bid);
  const totalProb = computeTotalProb(probRows);
  const days = daysUntil(bid.deadline);

  function handleMarkWon() {
    setWonMsg(true);
    setTimeout(() => {
      alert('Moved to Won — great work!');
      onClose();
    }, 200);
  }

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={onClose}
    >
      <div
        style={{ background:'var(--color-brand-card)', border:'1px solid var(--color-brand-border)', borderRadius:12, padding:24, width:560, maxWidth:'92vw', maxHeight:'88vh', overflowY:'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 }}>
            <div>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)' }}>{bid.name}</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2 }}>{bid.client}</div>
            </div>
            <span style={S.badge('#4b9cf5')}>{bid.type}</span>
          </div>
        </div>

        {/* Key fields */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
          {[
            { label:'Bid Value',   value: money(bid.value) },
            { label:'Probability', value: `${bid.prob}%` },
            { label:'Stage',       value: STAGES.find(s => s.key === bid.stage)?.label || bid.stage },
            { label:'Estimator',   value: bid.estimator },
            { label:'Deadline',    value: `${bid.deadline} (${days > 0 ? `in ${days} days` : days === 0 ? 'today' : `${Math.abs(days)}d ago`})` },
            { label:'Priority',    value: bid.priority.charAt(0).toUpperCase() + bid.priority.slice(1) },
          ].map((row, i) => (
            <div key={i} style={{ background:'rgba(255,255,255,0.03)', borderRadius:6, padding:'8px 10px' }}>
              <div style={{ fontSize:10, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>{row.label}</div>
              <div style={{ fontSize:13, fontWeight:600, fontFamily:'monospace', color:'var(--text-primary)' }}>{row.value}</div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:11, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Scope Notes</div>
          <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6, padding:'10px 12px', background:'rgba(255,255,255,0.03)', borderRadius:6, border:'1px solid var(--color-brand-border)' }}>
            {bid.notes}
          </div>
        </div>

        {/* Probability breakdown */}
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:11, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Probability Breakdown</div>
          <table style={{ ...S.table, fontSize:12 }}>
            <thead>
              <tr>
                {['Factor','Score (1–5)','Weight','Contribution'].map(h => (
                  <th key={h} style={{ ...S.th, fontSize:10 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {probRows.map((row, i) => (
                <tr key={i}>
                  <td style={{ ...S.td, fontSize:12, color:'var(--text-secondary)' }}>{row.factor}</td>
                  <td style={{ ...S.td, fontFamily:'monospace', fontSize:12 }}>{row.score}</td>
                  <td style={{ ...S.td, fontFamily:'monospace', fontSize:12 }}>{row.weight}%</td>
                  <td style={{ ...S.td, fontFamily:'monospace', fontSize:12, color: parseFloat(row.contribution) >= 10 ? 'var(--status-profit)' : 'var(--text-primary)' }}>
                    {row.contribution}%
                  </td>
                </tr>
              ))}
              <tr style={{ background:'rgba(255,255,255,0.04)' }}>
                <td colSpan={3} style={{ ...S.td, fontSize:12, fontWeight:700 }}>Total Probability</td>
                <td style={{ ...S.td, fontFamily:'monospace', fontSize:13, fontWeight:700, color: probColor(parseInt(totalProb)) }}>{totalProb}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Actions */}
        {wonMsg && (
          <div style={{ padding:'8px 12px', background:'var(--status-profit)22', border:'1px solid var(--status-profit)', borderRadius:6, fontSize:12, color:'var(--status-profit)', marginBottom:12 }}>
            Moving to Won...
          </div>
        )}
        <div style={{ display:'flex', gap:8, marginTop:4 }}>
          <button
            onClick={handleMarkWon}
            style={{ padding:'8px 16px', borderRadius:6, border:'none', background:'var(--status-profit)', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600 }}
          >
            Mark Won
          </button>
          <button
            onClick={onClose}
            style={{ padding:'8px 16px', borderRadius:6, border:'none', background:'var(--status-loss)', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600 }}
          >
            Mark Lost
          </button>
          <button
            onClick={onClose}
            style={{ padding:'8px 16px', borderRadius:6, border:'1px solid var(--color-brand-border)', background:'transparent', color:'var(--text-secondary)', cursor:'pointer', fontSize:12 }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LEAD DETAIL MODAL ───────────────────────────────────────────────────────

function LeadDetailModal({ lead, onClose }) {
  if (!lead) return null;

  const qs = lead.qualScores;
  const QUAL_FACTORS = [
    { label:'Budget reality',      key:'budget',   weight:25 },
    { label:'Timeline reality',    key:'timeline', weight:20 },
    { label:'Decision readiness',  key:'decision', weight:25 },
    { label:'Project fit',         key:'fit',      weight:20 },
    { label:'Payment reliability', key:'payment',  weight:10 },
  ];
  const composite = QUAL_FACTORS.reduce((acc, f) => acc + ((qs[f.key] / 5) * f.weight), 0).toFixed(0);

  const statusColor = STATUS_COLORS[lead.status] || 'var(--text-secondary)';

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={onClose}
    >
      <div
        style={{ background:'var(--color-brand-card)', border:'1px solid var(--color-brand-border)', borderRadius:12, padding:24, width:580, maxWidth:'94vw', maxHeight:'90vh', overflowY:'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)' }}>{lead.name}</div>
            <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2 }}>{lead.type} &bull; {lead.source}</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6 }}>
            <span style={S.badge(statusColor)}>{lead.status.replace('_', ' ')}</span>
            <div style={{ fontSize:11, color:'var(--text-tertiary)' }}>
              Score: <span style={{ fontFamily:'monospace', fontWeight:700, color: lead.score >= 70 ? 'var(--status-profit)' : lead.score >= 50 ? 'var(--status-warning)' : 'var(--status-loss)' }}>{lead.score}</span>
            </div>
          </div>
        </div>

        {/* Contact + Project info */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:18 }}>
          <div>
            <div style={{ fontSize:11, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Contact</div>
            {[
              { label:'Name',    value: lead.contact },
              { label:'Phone',   value: lead.phone },
              { label:'Email',   value: lead.email },
              { label:'Source',  value: lead.source },
            ].map((row, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid var(--color-brand-border)' }}>
                <span style={{ fontSize:11, color:'var(--text-tertiary)' }}>{row.label}</span>
                <span style={{ fontSize:12, color:'var(--text-primary)', fontFamily:'monospace' }}>{row.value}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize:11, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Project Details</div>
            {[
              { label:'Type',       value: lead.type },
              { label:'Size',       value: `${lead.sqft.toLocaleString()} SF` },
              { label:'Budget',     value: lead.budget },
              { label:'Financing',  value: lead.financing },
              { label:'Est. Value', value: money(lead.value) },
            ].map((row, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid var(--color-brand-border)' }}>
                <span style={{ fontSize:11, color:'var(--text-tertiary)' }}>{row.label}</span>
                <span style={{ fontSize:12, color:'var(--text-primary)', fontFamily:'monospace' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Qualification Scoring */}
        <div style={{ marginBottom:18 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <div style={{ fontSize:11, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Qualification Scoring</div>
            <div style={{ fontSize:12, color:'var(--text-secondary)' }}>
              Overall: <span style={{ fontFamily:'monospace', fontWeight:700, color: parseInt(composite) >= 70 ? 'var(--status-profit)' : parseInt(composite) >= 50 ? 'var(--status-warning)' : 'var(--status-loss)' }}>{composite}%</span>
            </div>
          </div>
          {QUAL_FACTORS.map((f, i) => {
            const score = qs[f.key];
            const pct = (score / 5) * 100;
            const barColor = pct >= 70 ? 'var(--status-profit)' : pct >= 40 ? 'var(--status-warning)' : 'var(--status-loss)';
            return (
              <div key={i} style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{f.label}</span>
                  <span style={{ fontSize:12, fontFamily:'monospace', color:'var(--text-primary)' }}>{score}/5 &bull; {f.weight}% weight</span>
                </div>
                <div style={{ height:6, background:'rgba(255,255,255,0.07)', borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:barColor, borderRadius:3, transition:'width 0.3s' }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Activity Timeline */}
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:11, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Activity Timeline</div>
          {lead.activity.map((a, i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'8px 0', borderBottom:'1px solid var(--color-brand-border)' }}>
              <div style={{ minWidth:90, fontSize:11, fontFamily:'monospace', color:'var(--text-tertiary)' }}>{a.date}</div>
              <div style={{ minWidth:80, fontSize:11, fontWeight:600, color:'#4b9cf5' }}>{a.type}</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)', lineHeight:1.5 }}>{a.notes}</div>
            </div>
          ))}
        </div>

        {/* Next Action */}
        <div style={{ padding:'10px 12px', background:'rgba(75,156,245,0.08)', border:'1px solid rgba(75,156,245,0.25)', borderRadius:6, marginBottom:16 }}>
          <div style={{ fontSize:10, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>Next Action</div>
          <div style={{ fontSize:13, color:'var(--text-primary)' }}>{lead.nextAction}</div>
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:8 }}>
          <button
            onClick={onClose}
            style={{ padding:'8px 16px', borderRadius:6, border:'none', background:'var(--status-profit)', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600 }}
          >
            Convert to Bid
          </button>
          <button
            onClick={onClose}
            style={{ padding:'8px 16px', borderRadius:6, border:'none', background:'var(--status-loss)', color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600 }}
          >
            Mark Dead
          </button>
          <button
            onClick={onClose}
            style={{ padding:'8px 16px', borderRadius:6, border:'1px solid var(--color-brand-border)', background:'rgba(255,255,255,0.05)', color:'var(--text-secondary)', cursor:'pointer', fontSize:12 }}
          >
            Add Activity
          </button>
          <button
            onClick={onClose}
            style={{ padding:'8px 16px', borderRadius:6, border:'1px solid var(--color-brand-border)', background:'transparent', color:'var(--text-secondary)', cursor:'pointer', fontSize:12, marginLeft:'auto' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── WIN/LOSS DETAIL MODAL ───────────────────────────────────────────────────

function WinLossDetailModal({ record, onClose }) {
  if (!record) return null;
  const isWon = record.result === 'won';
  const accentColor = isWon ? 'var(--status-profit)' : 'var(--status-loss)';

  return (
    <div
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={onClose}
    >
      <div
        style={{ background:'var(--color-brand-card)', border:`1px solid ${accentColor}55`, borderRadius:12, padding:24, width:540, maxWidth:'92vw', maxHeight:'88vh', overflowY:'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ borderLeft:`3px solid ${accentColor}`, paddingLeft:12, marginBottom:16 }}>
          <div style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)' }}>{record.name}</div>
          <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2 }}>
            {record.client} &bull; {record.type} &bull; {record.date}
          </div>
        </div>

        {/* Key metrics */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:18 }}>
          {[
            { label:'Contract Value',   value: money(record.value) },
            { label:'Result',           value: isWon ? 'Won' : 'Lost' },
            { label:'Bid Margin',       value: `${record.bidMargin}%` },
            { label:'Actual Margin',    value: record.margin != null ? `${record.margin}%` : 'TBD' },
            { label:'Estimator',        value: record.estimator },
            { label:'Competitor',       value: record.competitor || 'Unknown' },
            ...(record.competitorBid ? [{ label:'Competitor Bid', value: money(record.competitorBid) }] : []),
            ...(record.competitorBid ? [{ label:'Price Diff',     value: money(Math.abs(record.value - record.competitorBid)) + (record.value > record.competitorBid ? ' over' : ' under') }] : []),
          ].map((row, i) => (
            <div key={i} style={{ background:'rgba(255,255,255,0.03)', borderRadius:6, padding:'8px 10px' }}>
              <div style={{ fontSize:10, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>{row.label}</div>
              <div style={{ fontSize:13, fontWeight:600, fontFamily:'monospace', color:'var(--text-primary)' }}>{row.value}</div>
            </div>
          ))}
        </div>

        {/* Sealed by / Loss reason */}
        {isWon ? (
          <div style={{ padding:'10px 12px', background:'var(--status-profit)11', border:'1px solid var(--status-profit)44', borderRadius:6, marginBottom:14 }}>
            <div style={{ fontSize:10, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>What Sealed the Deal</div>
            <div style={{ fontSize:13, color:'var(--text-primary)' }}>{record.sealedBy}</div>
          </div>
        ) : (
          <div style={{ padding:'10px 12px', background:'var(--status-loss)11', border:'1px solid var(--status-loss)44', borderRadius:6, marginBottom:14 }}>
            <div style={{ fontSize:10, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Loss Reason</div>
            <div style={{ fontSize:13, color:'var(--text-primary)' }}>{record.lossReason}</div>
          </div>
        )}

        {/* Lesson */}
        <div style={{ padding:'10px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid var(--color-brand-border)', borderRadius:6, marginBottom:18 }}>
          <div style={{ fontSize:10, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Post-Mortem Lesson</div>
          <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6 }}>{record.lesson}</div>
        </div>

        <button
          onClick={onClose}
          style={{ padding:'8px 16px', borderRadius:6, border:'1px solid var(--color-brand-border)', background:'transparent', color:'var(--text-secondary)', cursor:'pointer', fontSize:12 }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ─── TAB 1: PIPELINE KANBAN ──────────────────────────────────────────────────

function PipelineTab({ setDrill }) {
  const [selectedBid, setSelectedBid] = useState(null);

  const activePipeline = PIPELINE.filter(b => b.stage !== 'won' && b.stage !== 'lost');
  const totalValue     = activePipeline.reduce((a, b) => a + b.value, 0);
  const weightedVal    = activePipeline.reduce((a, b) => a + weightedValue(b), 0);
  const activeLeads    = activePipeline.length;
  const wonBids        = WON_LOST.filter(w => w.result === 'won').length;
  const allBids        = WON_LOST.length;
  const winRate        = allBids > 0 ? Math.round((wonBids / allBids) * 100) : 0;

  return (
    <div>
      {/* KPI Cards */}
      <div style={S.kpiGrid}>
        <div style={S.kpiCard}>
          <div style={S.kpiLabel}>Pipeline Value</div>
          <div
            style={S.kpiValue}
            onClick={() => setDrill({
              title: 'Pipeline Value Breakdown',
              rows: activePipeline.map(b => ({ label: b.name, value: money(b.value) }))
            })}
          >
            {money(totalValue, true)}
          </div>
          <div style={S.kpiSub}>{activeLeads} active opportunities</div>
        </div>
        <div style={S.kpiCard}>
          <div style={S.kpiLabel}>Weighted Value</div>
          <div
            style={S.kpiValue}
            onClick={() => setDrill({
              title: 'Weighted Pipeline Value',
              rows: activePipeline.map(b => ({ label: `${b.name} (${b.prob}%)`, value: money(weightedValue(b)) }))
            })}
          >
            {money(weightedVal, true)}
          </div>
          <div style={S.kpiSub}>Probability-adjusted</div>
        </div>
        <div style={S.kpiCard}>
          <div style={S.kpiLabel}>Active Leads</div>
          <div
            style={{ ...S.kpiValue, fontSize:28 }}
            onClick={() => setDrill({
              title: 'Active Leads',
              rows: activePipeline.map(b => ({ label: b.name, value: STAGES.find(s => s.key === b.stage)?.label || b.stage }))
            })}
          >
            {activeLeads}
          </div>
          <div style={S.kpiSub}>across all stages</div>
        </div>
        <div style={S.kpiCard}>
          <div style={S.kpiLabel}>Win Rate (12mo)</div>
          <div
            style={{ ...S.kpiValue, color: winRate >= 50 ? 'var(--status-profit)' : winRate >= 35 ? 'var(--status-warning)' : 'var(--status-loss)' }}
            onClick={() => setDrill({
              title: 'Win Rate Detail — Last 12 Months',
              rows: [
                { label:'Total submitted', value: String(allBids) },
                { label:'Won',             value: String(wonBids) },
                { label:'Lost',            value: String(allBids - wonBids) },
                { label:'Win rate',        value: `${winRate}%` },
              ]
            })}
          >
            {winRate}%
          </div>
          <div style={S.kpiSub}>{wonBids} of {allBids} bids</div>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ overflowX:'auto', paddingBottom:16 }}>
        <div style={{ display:'flex', gap:12, minWidth: `${STAGES.length * 230}px` }}>
          {STAGES.map(stage => {
            const cards = PIPELINE.filter(b => b.stage === stage.key);
            const colValue = cards.reduce((a, b) => a + b.value, 0);
            const isWon  = stage.key === 'won';
            const isLost = stage.key === 'lost';
            const colAccent = isWon ? 'var(--status-profit)' : isLost ? 'var(--status-loss)' : 'var(--color-brand-border)';
            return (
              <div
                key={stage.key}
                style={{ flex: '0 0 220px', background:'var(--color-brand-card)', border:`1px solid ${colAccent}44`, borderRadius:10, overflow:'hidden' }}
              >
                {/* Column header */}
                <div style={{ padding:'10px 12px', borderBottom:`1px solid ${colAccent}44`, background: isWon ? 'var(--status-profit)11' : isLost ? 'var(--status-loss)11' : 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:12, fontWeight:700, color: isWon ? 'var(--status-profit)' : isLost ? 'var(--status-loss)' : 'var(--text-primary)' }}>{stage.label}</span>
                    <span style={{ fontSize:11, fontFamily:'monospace', color:'var(--text-tertiary)', background:'rgba(255,255,255,0.06)', padding:'2px 6px', borderRadius:10 }}>{cards.length}</span>
                  </div>
                  {colValue > 0 && (
                    <div style={{ fontSize:11, fontFamily:'monospace', color:'var(--text-tertiary)', marginTop:3 }}>{money(colValue, true)}</div>
                  )}
                </div>

                {/* Cards */}
                <div style={{ padding:8, display:'flex', flexDirection:'column', gap:8, minHeight:120 }}>
                  {cards.length === 0 && (
                    <div style={{ fontSize:11, color:'var(--text-tertiary)', textAlign:'center', padding:'20px 0' }}>No bids</div>
                  )}
                  {cards.map(bid => {
                    const days = daysUntil(bid.deadline);
                    const deadlineColor = days <= 7 ? 'var(--status-loss)' : 'var(--text-tertiary)';
                    const priorityColor = PRIORITY_COLORS[bid.priority];
                    const pc = probColor(bid.prob);
                    return (
                      <div
                        key={bid.id}
                        onClick={() => setSelectedBid(bid)}
                        style={{ background:'rgba(255,255,255,0.04)', border:'1px solid var(--color-brand-border)', borderRadius:8, padding:'10px 10px 8px', cursor:'pointer', transition:'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      >
                        {/* Priority + name */}
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
                          <div style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)', lineHeight:1.4, flex:1 }}>{bid.name}</div>
                          <span style={{ fontSize:10, fontWeight:700, color:priorityColor, marginLeft:6, flexShrink:0 }}>{bid.priority.toUpperCase()}</span>
                        </div>
                        {/* Client */}
                        <div style={{ fontSize:11, color:'var(--text-tertiary)', marginBottom:6 }}>{bid.client}</div>
                        {/* Value + prob */}
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                          <span style={{ fontSize:13, fontWeight:700, fontFamily:'monospace', color:'var(--text-primary)' }}>{money(bid.value, true)}</span>
                          <span style={{ fontSize:11, fontFamily:'monospace', fontWeight:600, color:pc, background:pc + '22', padding:'1px 6px', borderRadius:4 }}>
                            <span style={{ display:'inline-block', width:6, height:6, borderRadius:'50%', background:pc, marginRight:3, verticalAlign:'middle' }} />
                            {bid.prob}%
                          </span>
                        </div>
                        {/* Deadline + estimator */}
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text-tertiary)' }}>
                          <span style={{ color:deadlineColor }}>
                            {days > 0 ? `in ${days}d` : days === 0 ? 'today' : `${Math.abs(days)}d ago`}
                          </span>
                          <span>{bid.estimator.split(' ')[0]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BidDetailModal bid={selectedBid} onClose={() => setSelectedBid(null)} />
    </div>
  );
}

// ─── TAB 2: LEADS ────────────────────────────────────────────────────────────

function LeadsTab({ setDrill }) {
  const [selectedLead, setSelectedLead] = useState(null);

  const totalLeadValue  = LEADS.reduce((a, l) => a + l.value, 0);
  const qualifiedLeads  = LEADS.filter(l => l.status === 'qualified' || l.status === 'proposal_sent').length;
  const avgScore        = Math.round(LEADS.reduce((a, l) => a + l.score, 0) / LEADS.length);

  return (
    <div>
      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        <div style={S.kpiCard}>
          <div style={S.kpiLabel}>Total Lead Value</div>
          <div
            style={S.kpiValue}
            onClick={() => setDrill({ title:'Lead Value Breakdown', rows: LEADS.map(l => ({ label:l.name, value:money(l.value) })) })}
          >
            {money(totalLeadValue, true)}
          </div>
          <div style={S.kpiSub}>{LEADS.length} leads tracked</div>
        </div>
        <div style={S.kpiCard}>
          <div style={S.kpiLabel}>Qualified / Proposal Sent</div>
          <div
            style={{ ...S.kpiValue, fontSize:28 }}
            onClick={() => setDrill({ title:'Qualified Leads', rows: LEADS.filter(l => l.status === 'qualified' || l.status === 'proposal_sent').map(l => ({ label:l.name, value:l.status.replace('_',' ') })) })}
          >
            {qualifiedLeads}
          </div>
          <div style={S.kpiSub}>of {LEADS.length} total</div>
        </div>
        <div style={S.kpiCard}>
          <div style={S.kpiLabel}>Avg Lead Score</div>
          <div
            style={{ ...S.kpiValue, color: avgScore >= 70 ? 'var(--status-profit)' : avgScore >= 50 ? 'var(--status-warning)' : 'var(--status-loss)' }}
            onClick={() => setDrill({ title:'Lead Scores', rows: LEADS.map(l => ({ label:l.name, value:String(l.score) })) })}
          >
            {avgScore}
          </div>
          <div style={S.kpiSub}>out of 100</div>
        </div>
      </div>

      {/* Leads table */}
      <div style={{ background:'var(--color-brand-card)', border:'1px solid var(--color-brand-border)', borderRadius:10, overflow:'hidden' }}>
        <table style={S.table}>
          <thead>
            <tr>
              {['Lead Name','Source','Type','Value','Received','Status','Assigned','Days Since Contact','Score','Next Action'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LEADS.map((lead, i) => {
              const sc = STATUS_COLORS[lead.status] || 'var(--text-secondary)';
              const dsc = daysSince(lead.lastContact);
              const dscColor = dsc > 7 ? 'var(--status-loss)' : dsc > 3 ? 'var(--status-warning)' : 'var(--status-profit)';
              const scoreColor = lead.score >= 70 ? 'var(--status-profit)' : lead.score >= 50 ? 'var(--status-warning)' : 'var(--status-loss)';
              return (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  style={{ cursor:'pointer', transition:'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...S.td, fontWeight:600, color:'var(--text-primary)' }}>{lead.name}</td>
                  <td style={{ ...S.td, color:'var(--text-secondary)', fontSize:12 }}>{lead.source}</td>
                  <td style={{ ...S.td, fontSize:12 }}><span style={S.badge('#4b9cf5')}>{lead.type}</span></td>
                  <td style={{ ...S.td, fontFamily:'monospace' }}>{money(lead.value, true)}</td>
                  <td style={{ ...S.td, fontFamily:'monospace', fontSize:11, color:'var(--text-tertiary)' }}>{lead.received}</td>
                  <td style={S.td}><span style={S.badge(sc)}>{lead.status.replace('_',' ')}</span></td>
                  <td style={{ ...S.td, fontSize:12, color:'var(--text-secondary)' }}>{lead.assigned}</td>
                  <td style={{ ...S.td, fontFamily:'monospace', fontSize:12, color:dscColor }}>{dsc}d</td>
                  <td style={{ ...S.td, fontFamily:'monospace', fontWeight:700, color:scoreColor }}>{lead.score}</td>
                  <td style={{ ...S.td, fontSize:11, color:'var(--text-secondary)', maxWidth:200 }}>{lead.nextAction}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <LeadDetailModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </div>
  );
}

// ─── TAB 3: WIN / LOSS ───────────────────────────────────────────────────────

function WinLossTab({ setDrill }) {
  const [selectedRecord, setSelectedRecord] = useState(null);

  const wonRecords  = WON_LOST.filter(r => r.result === 'won');
  const lostRecords = WON_LOST.filter(r => r.result === 'lost');

  const winRate     = Math.round((wonRecords.length / WON_LOST.length) * 100);
  const totalWonVal = wonRecords.reduce((a, r) => a + r.value, 0);
  const totalLostVal= lostRecords.reduce((a, r) => a + r.value, 0);

  const avgWinMargin = wonRecords.filter(r => r.margin != null).reduce((a, r) => a + r.margin, 0) /
    (wonRecords.filter(r => r.margin != null).length || 1);

  // Loss price gap (where we know competitor bid)
  const lossGaps = lostRecords.filter(r => r.competitorBid != null).map(r => r.value - r.competitorBid);
  const avgLossGap = lossGaps.length > 0 ? lossGaps.reduce((a, v) => a + v, 0) / lossGaps.length : 0;

  // Last 90 days: within 90 days of 2026-02-22
  const cutoff90 = new Date('2025-11-24');
  const recent   = WON_LOST.filter(r => new Date(r.date) >= cutoff90);
  const recentWon= recent.filter(r => r.result === 'won').length;
  const recentWinRate = recent.length > 0 ? Math.round((recentWon / recent.length) * 100) : 0;

  // Win rate by type
  const TYPES_LIST = ['Custom Home','Remodel','Commercial','Commercial TI','Multifamily','Spec Home'];
  const byType = TYPES_LIST.map(t => {
    const subset = WON_LOST.filter(r => r.type === t || (t === 'Commercial' && r.type === 'Commercial'));
    const w = subset.filter(r => r.result === 'won');
    const l = subset.filter(r => r.result === 'lost');
    const margins = w.filter(r => r.margin != null).map(r => r.margin);
    const avgM = margins.length ? (margins.reduce((a, v) => a + v, 0) / margins.length).toFixed(1) : '—';
    return { type:t, submitted:subset.length, won:w.length, lost:l.length, winPct: subset.length ? Math.round((w.length/subset.length)*100) : 0, avgMargin:avgM };
  }).filter(r => r.submitted > 0);

  const sorted = [...WON_LOST].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div>
      {/* KPI row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
        <div style={S.kpiCard}>
          <div style={S.kpiLabel}>Win Rate (Overall)</div>
          <div
            style={{ ...S.kpiValue, color: winRate >= 50 ? 'var(--status-profit)' : winRate >= 35 ? 'var(--status-warning)' : 'var(--status-loss)' }}
            onClick={() => setDrill({ title:'Win Rate Detail', rows:[
              { label:'Total bids', value:String(WON_LOST.length) },
              { label:'Won', value:String(wonRecords.length) },
              { label:'Lost', value:String(lostRecords.length) },
              { label:'Win rate', value:`${winRate}%` },
            ]})}
          >
            {winRate}%
          </div>
          <div style={S.kpiSub}>{wonRecords.length}/{WON_LOST.length} bids won</div>
        </div>
        <div style={S.kpiCard}>
          <div style={S.kpiLabel}>Win Rate (Last 90 Days)</div>
          <div
            style={{ ...S.kpiValue, color: recentWinRate >= 50 ? 'var(--status-profit)' : recentWinRate >= 35 ? 'var(--status-warning)' : 'var(--status-loss)' }}
            onClick={() => setDrill({ title:'Last 90 Days', rows:[
              { label:'Bids in period', value:String(recent.length) },
              { label:'Won', value:String(recentWon) },
              { label:'Win rate', value:`${recentWinRate}%` },
            ]})}
          >
            {recentWinRate}%
          </div>
          <div style={S.kpiSub}>{recentWon}/{recent.length} since Nov 24</div>
        </div>
        <div style={S.kpiCard}>
          <div style={S.kpiLabel}>Avg Winning Margin</div>
          <div
            style={{ ...S.kpiValue, color:'var(--status-profit)' }}
            onClick={() => setDrill({ title:'Winning Margins', rows: wonRecords.filter(r => r.margin != null).map(r => ({ label:r.name, value:`${r.margin}%` })) })}
          >
            {avgWinMargin.toFixed(1)}%
          </div>
          <div style={S.kpiSub}>on closed contracts</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:24 }}>
        <div style={S.kpiCard}>
          <div style={S.kpiLabel}>Avg Loss Price Gap</div>
          <div
            style={{ ...S.kpiValue, color:'var(--status-loss)' }}
            onClick={() => setDrill({ title:'Loss Price Gaps', rows: lostRecords.filter(r => r.competitorBid).map(r => ({ label:r.name, value:`+${money(r.value - r.competitorBid)}` })) })}
          >
            +{money(avgLossGap, true)}
          </div>
          <div style={S.kpiSub}>over winning bid</div>
        </div>
        <div style={S.kpiCard}>
          <div style={S.kpiLabel}>Total Won Value</div>
          <div
            style={{ ...S.kpiValue, color:'var(--status-profit)' }}
            onClick={() => setDrill({ title:'Won Bids', rows: wonRecords.map(r => ({ label:r.name, value:money(r.value) })) })}
          >
            {money(totalWonVal, true)}
          </div>
          <div style={S.kpiSub}>{wonRecords.length} contracts</div>
        </div>
        <div style={S.kpiCard}>
          <div style={S.kpiLabel}>Total Lost Value</div>
          <div
            style={{ ...S.kpiValue, color:'var(--status-loss)' }}
            onClick={() => setDrill({ title:'Lost Bids', rows: lostRecords.map(r => ({ label:r.name, value:money(r.value) })) })}
          >
            {money(totalLostVal, true)}
          </div>
          <div style={S.kpiSub}>{lostRecords.length} lost opportunities</div>
        </div>
      </div>

      {/* Trailing summary */}
      <div style={{ ...S.card, marginBottom:20 }}>
        <div style={{ fontSize:13, color:'var(--text-secondary)' }}>
          Trailing 12 months: <span style={{ fontFamily:'monospace', fontWeight:700, color:'var(--status-profit)' }}>{wonRecords.length} wins</span>,{' '}
          <span style={{ fontFamily:'monospace', fontWeight:700, color:'var(--status-loss)' }}>{lostRecords.length} losses</span>,{' '}
          <span style={{ fontFamily:'monospace', fontWeight:700, color: winRate >= 50 ? 'var(--status-profit)' : 'var(--status-warning)' }}>{winRate}% win rate</span>
        </div>
      </div>

      {/* Win Rate by Type */}
      <div style={{ ...S.card, marginBottom:24 }}>
        <div style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', marginBottom:12 }}>Win Rate by Project Type</div>
        <table style={S.table}>
          <thead>
            <tr>
              {['Type','Submitted','Won','Lost','Win %','Avg Margin on Wins'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {byType.map((row, i) => (
              <tr key={i}>
                <td style={{ ...S.td, fontWeight:600 }}>{row.type}</td>
                <td style={{ ...S.td, fontFamily:'monospace' }}>{row.submitted}</td>
                <td style={{ ...S.td, fontFamily:'monospace', color:'var(--status-profit)' }}>{row.won}</td>
                <td style={{ ...S.td, fontFamily:'monospace', color:'var(--status-loss)' }}>{row.lost}</td>
                <td style={{ ...S.td, fontFamily:'monospace', fontWeight:700, color: row.winPct >= 50 ? 'var(--status-profit)' : row.winPct >= 35 ? 'var(--status-warning)' : 'var(--status-loss)' }}>
                  {row.winPct}%
                </td>
                <td style={{ ...S.td, fontFamily:'monospace', color:'var(--status-profit)' }}>{row.avgMargin !== '—' ? `${row.avgMargin}%` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Win/Loss History */}
      <div style={{ background:'var(--color-brand-card)', border:'1px solid var(--color-brand-border)', borderRadius:10, overflow:'hidden' }}>
        <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--color-brand-border)', fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>
          Win / Loss History
        </div>
        <table style={S.table}>
          <thead>
            <tr>
              {['Date','Project','Type','Value','Result','Margin','Estimator','Sealed By / Loss Reason'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => {
              const isWon = r.result === 'won';
              const accentColor = isWon ? 'var(--status-profit)' : 'var(--status-loss)';
              return (
                <tr
                  key={r.id}
                  onClick={() => setSelectedRecord(r)}
                  style={{
                    cursor: 'pointer',
                    borderLeft: `3px solid ${accentColor}`,
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...S.td, fontFamily:'monospace', fontSize:11, color:'var(--text-tertiary)', paddingLeft:10 }}>{r.date}</td>
                  <td style={{ ...S.td, fontWeight:600 }}>
                    {r.name}
                    <div style={{ fontSize:11, color:'var(--text-tertiary)' }}>{r.client}</div>
                  </td>
                  <td style={S.td}><span style={S.badge('#4b9cf5')}>{r.type}</span></td>
                  <td style={{ ...S.td, fontFamily:'monospace' }}>{money(r.value, true)}</td>
                  <td style={S.td}><span style={S.badge(accentColor)}>{r.result}</span></td>
                  <td style={{ ...S.td, fontFamily:'monospace', color: r.margin != null ? 'var(--status-profit)' : 'var(--text-tertiary)' }}>
                    {r.margin != null ? `${r.margin}%` : '—'}
                  </td>
                  <td style={{ ...S.td, fontSize:12, color:'var(--text-secondary)' }}>{r.estimator}</td>
                  <td style={{ ...S.td, fontSize:11, color:'var(--text-secondary)', maxWidth:220 }}>
                    {isWon
                      ? <span style={{ color:'var(--status-profit)' }}>Sealed by: {r.sealedBy}</span>
                      : (
                        <div>
                          <div style={{ color:'var(--status-loss)' }}>{r.lossReason}</div>
                          {r.competitor && <div style={{ color:'var(--text-tertiary)', marginTop:2 }}>Competitor: {r.competitor}</div>}
                        </div>
                      )
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <WinLossDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function CRM() {
  const [tab, setTab]   = useState('pipeline');
  const [drill, setDrill] = useState(null);

  const TABS = [
    { key:'pipeline', label:'Pipeline (Kanban)' },
    { key:'leads',    label:'Leads' },
    { key:'winloss',  label:'Win / Loss' },
  ];

  return (
    <div style={S.page}>
      <div style={S.pageTitle}>CRM & Pipeline</div>
      <div style={S.pageSubtitle}>Bid management, lead tracking, and win/loss analysis</div>

      {/* Tab bar */}
      <div style={S.tabBar}>
        {TABS.map(t => (
          <button key={t.key} style={S.tab(tab === t.key)} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'pipeline' && <PipelineTab setDrill={setDrill} />}
      {tab === 'leads'    && <LeadsTab    setDrill={setDrill} />}
      {tab === 'winloss'  && <WinLossTab  setDrill={setDrill} />}

      {/* Drill modal */}
      <DrillModal drill={drill} onClose={() => setDrill(null)} />
    </div>
  );
}
