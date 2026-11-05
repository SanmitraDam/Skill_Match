'use client';
import { useState } from 'react';

/* ─────────────────────────────────────────────────────────────
   EnterpriseWorkforceGraph.tsx — SkillMatch DNA v19.0
   5 Sub-Tabs:
     1. Internal Talent Mobility
     2. ATS / HRIS Integration Hub
     3. Smart Offer Workshop
     4. RLAHF Calibration Console
     5. Executive Capability Matrix
   ───────────────────────────────────────────────────────────── */

// ── Types ──────────────────────────────────────────────────────
type SubTab = 'mobility' | 'ats' | 'offer' | 'rlahf' | 'exec';

interface InternalCandidate {
  employee_id: string; name: string; department: string;
  current_role: string; match_score_pct: number;
  gap_skills: Record<string, number>; upskilling_roadmap: string[];
  estimated_upskilling_weeks: number;
  internal_vs_external_cost_savings_inr: number;
  hire_recommendation: string;
}
interface ATSConfig { integration_id: string; ats_provider: string; status: string; last_event_at: number | null; }
interface OfferResult {
  offer_id: string; role_title: string; base_salary_inr: number;
  signing_bonus_inr: number; annual_bonus_pct: number; equity_shares: number;
  pre_onboarding_goals: string[]; on_chain_commitment: string; status: string;
}
interface CalibrationResult {
  calibration_id: string; skill_domain: string;
  items_recalibrated: number; items_retired: number;
  vector_matcher_drift_pct: number; model_version: string;
}
interface ModelWeights { skill_weights: Record<string, number>; global_ccrs_prediction_accuracy_pct: number; total_telemetry_samples: number; }

const BASE = 'http://localhost:8000';

// ── Helper ─────────────────────────────────────────────────────
const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n);

// ── Sub-Tab: Internal Talent Mobility ──────────────────────────
function MobilityTab() {
  const [targetRole, setTargetRole] = useState('Senior MLOps Engineer');
  const [minMatch, setMinMatch] = useState(70);
  const [results, setResults] = useState<InternalCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const DEMO_EMPLOYEES = [
    { employee_id: 'EMP-001', name: 'Alex Chen', department: 'ML Platform', current_role: 'ML Engineer', years_experience: 5, skill_vector: { python_proficiency: 0.92, transformer_fine_tuning: 0.80, vllm_paged_attention: 0.65, system_design: 0.72, kubernetes: 0.60, distributed_systems: 0.70 }, ccrs_baseline: 84.5 },
    { employee_id: 'EMP-002', name: 'Maria Santos', department: 'Data Engineering', current_role: 'Data Engineer', years_experience: 4, skill_vector: { spark_dbt: 0.88, sql_analytics: 0.90, python_proficiency: 0.82, distributed_systems: 0.75, devops_cicd: 0.60, system_design: 0.65 }, ccrs_baseline: 79.2 },
    { employee_id: 'EMP-003', name: 'James Liu', department: 'Backend Engineering', current_role: 'Senior Backend Engineer', years_experience: 7, skill_vector: { python_proficiency: 0.90, system_design: 0.85, distributed_systems: 0.88, devops_cicd: 0.80, communication: 0.82 }, ccrs_baseline: 88.1 },
    { employee_id: 'EMP-004', name: 'Yuki Tanaka', department: 'ML Platform', current_role: 'Research Scientist', years_experience: 6, skill_vector: { transformer_fine_tuning: 0.92, python_proficiency: 0.88, vllm_paged_attention: 0.75, system_design: 0.68, distributed_systems: 0.65 }, ccrs_baseline: 91.3 },
  ];

  const runMatch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/mobility/internal-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employees: DEMO_EMPLOYEES, target_role: targetRole, min_match_pct: minMatch }),
      });
      if (res.ok) setResults(await res.json());
    } finally { setLoading(false); }
  };

  const badgeColor = (rec: string) =>
    rec === 'internal_promote' ? '#10b981' : rec === 'upskill_then_promote' ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,.15), rgba(168,85,247,.10))', border: '1px solid rgba(99,102,241,.3)', borderRadius: '16px', padding: '1.5rem' }}>
        <h3 style={{ margin: 0, marginBottom: '1rem', color: '#a78bfa', fontSize: '1rem', fontWeight: 700 }}>🔍 Internal Job Matching Engine</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '.75rem', color: '#94a3b8', marginBottom: '.4rem' }}>Target Role</label>
            <select value={targetRole} onChange={e => setTargetRole(e.target.value)}
              style={{ width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border-subtle)', borderRadius: '8px', color: 'var(--fg-color)', padding: '.55rem .75rem', fontSize: '.875rem' }}>
              {['Senior MLOps Engineer', 'Staff Data Engineer', 'Senior ML Engineer', 'Tech Lead'].map(r => (
                <option key={r} style={{ background: 'var(--glass-card)', color: 'var(--fg-color)' }}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '.75rem', color: '#94a3b8', marginBottom: '.4rem' }}>Min Match %: <b style={{ color: '#a78bfa' }}>{minMatch}%</b></label>
            <input type="range" min={50} max={95} value={minMatch} onChange={e => setMinMatch(+e.target.value)}
              style={{ width: '120px', accentColor: '#a78bfa' }} />
          </div>
          <button onClick={runMatch} disabled={loading}
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', borderRadius: '10px', color: '#fff', padding: '.6rem 1.4rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1 }}>
            {loading ? '⟳ Scanning…' : '▶ Find Internal Candidates'}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {results.map(c => (
            <div key={c.employee_id} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border-subtle)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', padding: '1rem 1.25rem', gap: '1rem', cursor: 'pointer' }}
                onClick={() => setExpanded(expanded === c.employee_id ? null : c.employee_id)}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--fg-color)', marginBottom: '.2rem' }}>{c.name}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--fg-muted)' }}>{c.current_role} · {c.department}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: c.match_score_pct >= 85 ? '#10b981' : '#f59e0b' }}>{c.match_score_pct.toFixed(1)}%</div>
                  <div style={{ fontSize: '.7rem', color: 'var(--fg-muted)' }}>Match Score</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '.9rem', fontWeight: 700, color: '#22d3ee' }}>{c.estimated_upskilling_weeks}w</div>
                  <div style={{ fontSize: '.7rem', color: 'var(--fg-muted)' }}>Upskill</div>
                </div>
                <span style={{ background: badgeColor(c.hire_recommendation) + '22', color: badgeColor(c.hire_recommendation), border: `1px solid ${badgeColor(c.hire_recommendation)}55`, borderRadius: '20px', padding: '.25rem .75rem', fontSize: '.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {c.hire_recommendation.replace(/_/g, ' ')}
                </span>
              </div>
              {expanded === c.employee_id && (
                <div style={{ borderTop: '1px solid var(--glass-border-subtle)', padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '.8rem', fontWeight: 700, color: '#a78bfa', marginBottom: '.5rem' }}>Gap Skills</div>
                    {Object.entries(c.gap_skills).map(([skill, gap]) => (
                      <div key={skill} style={{ marginBottom: '.4rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', color: 'var(--fg-muted)', marginBottom: '.2rem' }}>
                          <span>{skill.replace(/_/g, ' ')}</span><span>+{gap.toFixed(2)}</span>
                        </div>
                        <div style={{ height: '5px', background: 'var(--bg-subtle)', borderRadius: '3px' }}>
                          <div style={{ height: '100%', width: `${gap * 100}%`, background: '#f59e0b', borderRadius: '3px' }} />
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: '.75rem', padding: '.6rem .9rem', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.25)', borderRadius: '8px', fontSize: '.8rem', color: '#10b981' }}>
                      💰 Saves <b>₹{fmt(c.internal_vs_external_cost_savings_inr)}</b> vs external hire
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '.8rem', fontWeight: 700, color: '#a78bfa', marginBottom: '.5rem' }}>4-Week Upskilling Roadmap</div>
                    {c.upskilling_roadmap.map((step, i) => (
                      <div key={i} style={{ display: 'flex', gap: '.6rem', marginBottom: '.5rem', alignItems: 'flex-start' }}>
                        <span style={{ background: 'rgba(99,102,241,.2)', color: '#a78bfa', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.7rem', flexShrink: 0, marginTop: '.1rem' }}>{i + 1}</span>
                        <span style={{ fontSize: '.78rem', color: 'var(--fg-muted)', lineHeight: 1.4 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--fg-muted)', background: 'var(--glass-bg)', borderRadius: '12px', border: '1px dashed var(--glass-border-subtle)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '.75rem' }}>🏢</div>
          <div style={{ fontWeight: 600, marginBottom: '.4rem' }}>Click "Find Internal Candidates" to scan your org</div>
          <div style={{ fontSize: '.85rem' }}>Employees with ≥{minMatch}% skill vector overlap will appear here</div>
        </div>
      )}
    </div>
  );
}

// ── Sub-Tab: ATS / HRIS Integration Hub ───────────────────────
function ATSTab() {
  const PROVIDERS = [
    { id: 'greenhouse', label: 'Greenhouse', icon: '🌱', color: '#10b981' },
    { id: 'lever', label: 'Lever', icon: '⚙️', color: '#3b82f6' },
    { id: 'workday', label: 'Workday', icon: '☁️', color: '#6366f1' },
    { id: 'bamboohr', label: 'BambooHR', icon: '🎋', color: '#22c55e' },
    { id: 'sap_successfactors', label: 'SAP SuccessFactors', icon: '🏭', color: '#f59e0b' },
    { id: 'ashby', label: 'Ashby', icon: '🔷', color: '#a855f7' },
  ];

  const [selected, setSelected] = useState('greenhouse');
  const [testResult, setTestResult] = useState<{ latency_ms: number; success: boolean } | null>(null);
  const [configuring, setConfiguring] = useState(false);
  const [configured, setConfigured] = useState<ATSConfig[]>([
    { integration_id: 'INT-GREENHOUSE-A1B2', ats_provider: 'greenhouse', status: 'active', last_event_at: Date.now() / 1000 - 3600 },
    { integration_id: 'INT-WORKDAY-C3D4', ats_provider: 'workday', status: 'active', last_event_at: Date.now() / 1000 - 1800 },
  ]);
  const [events, setEvents] = useState<{ id: string; type: string; provider: string; ts: number }[]>([]);
  const [triggering, setTriggering] = useState(false);

  const testConn = async () => {
    setConfiguring(true);
    try {
      const res = await fetch(`${BASE}/ats/test-connection?integration_id=INT-TEST-001`, { method: 'POST' });
      if (res.ok) setTestResult(await res.json());
    } finally { setConfiguring(false); }
  };

  const simulateWebhook = async () => {
    setTriggering(true);
    try {
      const res = await fetch(`${BASE}/ats/webhook/inbound`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ats_provider: selected, event_type: 'stage_changed', candidate_id: `CAND-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, candidate_email: 'candidate@example.com', stage_name: 'Technical Screen', application_id: `APP-${Date.now()}`, hmac_signature: 'sha256=test' }),
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(prev => [{ id: data.event_id, type: data.should_trigger_assessment ? '✅ Assessment Triggered' : '📥 Received', provider: selected, ts: Date.now() }, ...prev.slice(0, 9)]);
      }
    } finally { setTriggering(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '.75rem' }}>
        {PROVIDERS.map(p => (
          <button key={p.id} onClick={() => setSelected(p.id)}
            style={{ background: selected === p.id ? `${p.color}18` : 'var(--glass-bg)', border: `1px solid ${selected === p.id ? p.color : 'var(--glass-border-subtle)'}`, borderRadius: '12px', padding: '.9rem', cursor: 'pointer', textAlign: 'left', transition: 'all .2s' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '.4rem' }}>{p.icon}</div>
            <div style={{ fontWeight: 700, color: selected === p.id ? p.color : 'var(--fg-color)', fontSize: '.875rem' }}>{p.label}</div>
            <div style={{ fontSize: '.72rem', color: 'var(--fg-subtle)', marginTop: '.2rem' }}>
              {configured.find(c => c.ats_provider === p.id) ? '🟢 Connected' : '⚪ Not configured'}
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <button onClick={testConn} disabled={configuring}
          style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', border: 'none', borderRadius: '10px', color: '#fff', padding: '.7rem 1.2rem', fontWeight: 700, cursor: configuring ? 'not-allowed' : 'pointer', opacity: configuring ? .6 : 1 }}>
          {configuring ? '⟳ Testing…' : '🔌 Test Connection'}
        </button>
        <button onClick={simulateWebhook} disabled={triggering}
          style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '10px', color: '#fff', padding: '.7rem 1.2rem', fontWeight: 700, cursor: triggering ? 'not-allowed' : 'pointer', opacity: triggering ? .6 : 1 }}>
          {triggering ? '⟳ Sending…' : '📡 Simulate Inbound Webhook'}
        </button>
      </div>

      {testResult && (
        <div style={{ background: testResult.success ? 'rgba(16,185,129,.08)' : 'rgba(239,68,68,.08)', border: `1px solid ${testResult.success ? 'rgba(16,185,129,.3)' : 'rgba(239,68,68,.3)'}`, borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: testResult.success ? '#10b981' : '#ef4444', fontWeight: 700 }}>{testResult.success ? '✅ Connection Successful' : '❌ Connection Failed'}</span>
          <span style={{ color: '#94a3b8', fontSize: '.875rem' }}>Latency: <b style={{ color: '#22d3ee' }}>{testResult.latency_ms.toFixed(1)} ms</b></span>
        </div>
      )}

      {events.length > 0 && (
        <div>
          <div style={{ fontSize: '.8rem', color: '#94a3b8', marginBottom: '.6rem', fontWeight: 700 }}>📋 Recent Webhook Events</div>
          {events.map(ev => (
            <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.55rem .9rem', marginBottom: '.4rem', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--glass-border-subtle)', fontSize: '.8rem' }}>
              <span style={{ color: '#a78bfa', fontFamily: 'monospace' }}>{ev.id}</span>
              <span style={{ color: 'var(--fg-muted)' }}>{ev.type}</span>
              <span style={{ color: 'var(--fg-subtle)' }}>{new Date(ev.ts).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}

      <div>
        <div style={{ fontSize: '.8rem', color: 'var(--fg-muted)', marginBottom: '.6rem', fontWeight: 700 }}>🔗 Outbound Payload Preview (HMAC-SHA256 Signed)</div>
        <pre style={{ background: 'var(--bg-subtle)', border: '1px solid var(--glass-border-subtle)', borderRadius: '10px', padding: '1rem', color: 'var(--accent-primary)', fontSize: '.75rem', overflow: 'auto', margin: 0, lineHeight: 1.5 }}>
{`{
  "greenhouse_field": {
    "cf_skill_match_score": 87.42,
    "cf_proctoring_trust_score": 93.1,
    "cf_zk_proof_hash": "a3f9d2...c8e1b4",
    "cf_forensic_report_url": "https://app.skillmatch.ai/reports/.../forensic.pdf"
  },
  "skillmatch_recruiter_hud": "https://app.skillmatch.ai/recruiter/hud?candidate=...",
  "skillmatch_ccrs_breakdown": { "S_match": 88.0, "A_quiz": 91.5, "I_voice": 82.8 },
  "X-SkillMatch-Signature": "sha256=hmac_signature_here"
}`}
        </pre>
      </div>
    </div>
  );
}

// ── Sub-Tab: Smart Offer Workshop ─────────────────────────────
function OfferTab() {
  const [ccrs, setCcrs] = useState(84.5);
  const [pts, setPts] = useState(92.0);
  const [yoe, setYoe] = useState(5);
  const [role, setRole] = useState('Senior ML Engineer');
  const [offer, setOffer] = useState<OfferResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const generate = async () => {
    setLoading(true); setOffer(null); setAccepted(false);
    try {
      const res = await fetch(`${BASE}/hiring/offer/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate_id: 'CAND-DEMO-001', application_id: 'APP-DEMO-001', employer_id: 'EMP-DEMO', role_title: role, ccrs, pts, skill_vector: { python_proficiency: 0.92, transformer_fine_tuning: 0.80, system_design: 0.75 }, years_of_experience: yoe }),
      });
      if (res.ok) setOffer(await res.json());
    } finally { setLoading(false); }
  };

  const accept = async () => {
    if (!offer) return;
    setAccepting(true);
    try {
      const res = await fetch(`${BASE}/hiring/offer/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: offer.offer_id, candidate_id: 'CAND-DEMO-001', signature_payload: 'e-sig-demo-payload', accept_timestamp: Math.floor(Date.now() / 1000) }),
      });
      if (res.ok) setAccepted(true);
    } finally { setAccepting(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,.1), rgba(239,68,68,.08))', border: '1px solid rgba(245,158,11,.25)', borderRadius: '16px', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', color: '#fbbf24', fontSize: '1rem', fontWeight: 700 }}>💼 Dynamic Offer Generator · Skill-Weighted Salary Oracle</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '.75rem', color: 'var(--fg-muted)', marginBottom: '.4rem' }}>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              style={{ width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border-subtle)', borderRadius: '8px', color: 'var(--fg-color)', padding: '.55rem .75rem', fontSize: '.875rem' }}>
              {['Senior ML Engineer', 'Senior MLOps Engineer', 'Staff Data Engineer', 'Tech Lead'].map(r => <option key={r} style={{ background: 'var(--glass-card)', color: 'var(--fg-color)' }}>{r}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '.75rem', color: '#94a3b8', marginBottom: '.4rem' }}>Years of Experience: <b style={{ color: '#fbbf24' }}>{yoe}</b></label>
            <input type="range" min={1} max={15} value={yoe} onChange={e => setYoe(+e.target.value)} style={{ width: '100%', accentColor: '#fbbf24' }} />
          </div>
          <button onClick={generate} disabled={loading}
            style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', border: 'none', borderRadius: '10px', color: '#fff', padding: '.65rem 1.3rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1 }}>
            {loading ? '⟳ Computing…' : '⚡ Generate Offer'}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <label style={{ fontSize: '.75rem', color: '#94a3b8' }}>CCRS: <b style={{ color: ccrs >= 80 ? '#10b981' : '#f59e0b' }}>{ccrs.toFixed(1)}</b></label>
            <input type="range" min={60} max={100} step={0.5} value={ccrs} onChange={e => setCcrs(+e.target.value)} style={{ width: '100%', accentColor: '#10b981', display: 'block', marginTop: '.4rem' }} />
          </div>
          <div>
            <label style={{ fontSize: '.75rem', color: '#94a3b8' }}>PTS: <b style={{ color: '#22d3ee' }}>{pts.toFixed(1)}</b></label>
            <input type="range" min={60} max={100} step={0.5} value={pts} onChange={e => setPts(+e.target.value)} style={{ width: '100%', accentColor: '#22d3ee', display: 'block', marginTop: '.4rem' }} />
          </div>
        </div>
      </div>

      {offer && (
        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border-subtle)', borderRadius: '14px', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,.15), rgba(239,68,68,.08))', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '1rem' }}>{offer.role_title}</div>
              <div style={{ fontSize: '.78rem', color: 'var(--fg-subtle)', fontFamily: 'monospace' }}>{offer.offer_id}</div>
            </div>
            <span style={{ background: 'rgba(245,158,11,.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,.3)', borderRadius: '20px', padding: '.3rem .9rem', fontSize: '.8rem', fontWeight: 700 }}>
              {offer.status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
          <div style={{ padding: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', borderBottom: '1px solid var(--glass-border-subtle)' }}>
            {[
              { label: 'Base Salary', value: `₹${fmt(offer.base_salary_inr)}`, color: '#10b981' },
              { label: 'Signing Bonus', value: `₹${fmt(offer.signing_bonus_inr)}`, color: '#22d3ee' },
              { label: 'Annual Bonus', value: `${offer.annual_bonus_pct}%`, color: '#a78bfa' },
              { label: 'Equity Shares', value: fmt(offer.equity_shares), color: '#f59e0b' },
              { label: 'Offer Letter', value: '📄 Ready', color: '#6366f1' },
              { label: 'Commitment Hash', value: offer.on_chain_commitment.slice(0, 14) + '…', color: 'var(--fg-muted)' },
            ].map(item => (
              <div key={item.label} style={{ background: 'var(--bg-subtle)', borderRadius: '8px', padding: '.75rem' }}>
                <div style={{ fontSize: '.7rem', color: 'var(--fg-subtle)', marginBottom: '.3rem' }}>{item.label}</div>
                <div style={{ fontWeight: 700, color: item.color, fontSize: '.9rem' }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '1rem 1.25rem' }}>
            <div style={{ fontSize: '.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '.6rem' }}>Pre-Onboarding Goals</div>
            {offer.pre_onboarding_goals.map((g, i) => (
              <div key={i} style={{ display: 'flex', gap: '.6rem', marginBottom: '.4rem', alignItems: 'flex-start' }}>
                <span style={{ color: '#fbbf24', fontWeight: 700, flexShrink: 0 }}>→</span>
                <span style={{ fontSize: '.8rem', color: '#94a3b8', lineHeight: 1.4 }}>{g}</span>
              </div>
            ))}
          </div>
          {!accepted ? (
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(245,158,11,.15)' }}>
              <button onClick={accept} disabled={accepting}
                style={{ width: '100%', background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '10px', color: '#fff', padding: '.75rem', fontWeight: 700, cursor: accepting ? 'not-allowed' : 'pointer', fontSize: '1rem', opacity: accepting ? .6 : 1 }}>
                {accepting ? '⟳ Processing on-chain…' : '✍️ Accept Offer & Trigger IT Provisioning'}
              </button>
            </div>
          ) : (
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(16,185,129,.25)', background: 'rgba(16,185,129,.05)', textAlign: 'center' }}>
              <div style={{ color: '#10b981', fontWeight: 700, marginBottom: '.4rem' }}>✅ Offer Accepted — On-Chain Commitment Anchored</div>
              <div style={{ fontSize: '.8rem', color: '#64748b' }}>Okta SSO · GitHub Org · Slack · Hardware Shipping — all provisioned automatically</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-Tab: RLAHF Calibration Console ────────────────────────
function RLAHFTab() {
  const DOMAINS = ['vllm_paged_attention', 'system_design', 'spark_dbt', 'transformer_fine_tuning', 'python_proficiency'];
  const [domain, setDomain] = useState(DOMAINS[0]);
  const [result, setResult] = useState<CalibrationResult | null>(null);
  const [weights, setWeights] = useState<ModelWeights | null>(null);
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [ingestDone, setIngestDone] = useState(false);

  const ingestTelemetry = async () => {
    setIngesting(true); setIngestDone(false);
    try {
      await fetch(`${BASE}/rlahf/performance/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: 'EMP-DEMO-001', candidate_id: 'CAND-DEMO-001', employer_id: 'EMP-DEMO', assessment_ccrs: 84.5, assessment_quiz_score: 7.2, day_30_prs_merged: 8, day_30_tickets_closed: 12, day_30_manager_rating: 4.2, day_60_prs_merged: 11, day_60_tickets_closed: 18, day_60_manager_rating: 4.5, day_90_prs_merged: 14, day_90_tickets_closed: 22, day_90_manager_rating: 4.7, skill_domain: domain }),
      });
      setIngestDone(true);
    } finally { setIngesting(false); }
  };

  const calibrate = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await fetch(`${BASE}/rlahf/calibrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill_domain: domain }),
      });
      if (res.ok) setResult(await res.json());
      const wRes = await fetch(`${BASE}/rlahf/model-weights`);
      if (wRes.ok) setWeights(await wRes.json());
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ background: 'linear-gradient(135deg, rgba(34,211,238,.08), rgba(99,102,241,.12))', border: '1px solid rgba(34,211,238,.25)', borderRadius: '16px', padding: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem', color: '#22d3ee', fontSize: '1rem', fontWeight: 700 }}>🔁 RLAHF Model Auto-Calibration — CAT Item Difficulty (b_i) & Vector Weights</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '.75rem', color: 'var(--fg-muted)', marginBottom: '.4rem' }}>Skill Domain</label>
            <select value={domain} onChange={e => setDomain(e.target.value)}
              style={{ width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border-subtle)', borderRadius: '8px', color: 'var(--fg-color)', padding: '.55rem .75rem', fontSize: '.875rem' }}>
              {DOMAINS.map(d => <option key={d} style={{ background: 'var(--glass-card)', color: 'var(--fg-color)' }}>{d}</option>)}
            </select>
          </div>
          <button onClick={ingestTelemetry} disabled={ingesting}
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #22d3ee)', border: 'none', borderRadius: '10px', color: '#fff', padding: '.65rem 1.1rem', fontWeight: 700, cursor: ingesting ? 'not-allowed' : 'pointer', opacity: ingesting ? .6 : 1, whiteSpace: 'nowrap' }}>
            {ingesting ? '⟳ Ingesting…' : '📥 Ingest 90-Day Telemetry'}
          </button>
          <button onClick={calibrate} disabled={loading}
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', borderRadius: '10px', color: '#fff', padding: '.65rem 1.1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1, whiteSpace: 'nowrap' }}>
            {loading ? '⟳ Calibrating…' : '⚡ Run Calibration'}
          </button>
        </div>
        {ingestDone && (
          <div style={{ marginTop: '.75rem', padding: '.6rem .9rem', background: 'rgba(34,211,238,.08)', border: '1px solid rgba(34,211,238,.3)', borderRadius: '8px', fontSize: '.8rem', color: '#22d3ee' }}>
            ✅ 30/60/90-day telemetry ingested — PRs, Jira tickets & manager ratings recorded
          </div>
        )}
      </div>

      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#22d3ee', marginBottom: '1rem' }}>CAT Item Difficulty Adjustments</div>
            {result.items_recalibrated > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', color: 'var(--fg-muted)', padding: '0 .5rem', fontWeight: 700 }}>
                  <span>Item ID</span><span>Δ b_i</span>
                </div>
                {[{ id: 'CAT-001', delta: 0.05 }, { id: 'CAT-002', delta: -0.05 }, { id: 'CAT-003', delta: 0.00 }, { id: 'CAT-004', delta: 0.05 }].map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.45rem .7rem', background: 'var(--bg-subtle)', borderRadius: '6px', fontSize: '.8rem' }}>
                    <span style={{ color: '#a78bfa', fontFamily: 'monospace' }}>{item.id}</span>
                    <span style={{ color: item.delta > 0 ? '#f59e0b' : item.delta < 0 ? '#22d3ee' : 'var(--fg-subtle)', fontWeight: 700 }}>
                      {item.delta > 0 ? `+${item.delta.toFixed(2)}` : item.delta.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : <div style={{ color: 'var(--fg-subtle)', fontSize: '.85rem' }}>No items required recalibration</div>}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '.78rem', color: 'var(--fg-subtle)' }}>
              <span>Recalibrated: <b style={{ color: '#10b981' }}>{result.items_recalibrated}</b></span>
              <span>Retired: <b style={{ color: '#ef4444' }}>{result.items_retired}</b></span>
              <span>Drift: <b style={{ color: '#f59e0b' }}>{result.vector_matcher_drift_pct}%</b></span>
            </div>
          </div>
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
            <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#22d3ee', marginBottom: '1rem' }}>Calibration Metadata</div>
            <div style={{ fontFamily: 'monospace', fontSize: '.75rem', color: '#a78bfa', background: 'var(--bg-subtle)', borderRadius: '8px', padding: '.75rem', wordBreak: 'break-all' }}>{result.model_version}</div>
            <div style={{ fontSize: '.78rem', color: 'var(--fg-muted)', marginTop: '.75rem' }}>
              Domain: <b style={{ color: '#22d3ee' }}>{result.skill_domain}</b><br />
              Calibration ID: <span style={{ fontFamily: 'monospace', color: 'var(--fg-subtle)' }}>{result.calibration_id}</span>
            </div>
          </div>
        </div>
      )}

      {weights && (
        <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border-subtle)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#a78bfa' }}>Skill Vector Weights (w_criticality)</div>
            <div style={{ fontSize: '.8rem', color: 'var(--fg-muted)' }}>
              Accuracy: <b style={{ color: '#10b981' }}>{weights.global_ccrs_prediction_accuracy_pct}%</b> · Samples: <b style={{ color: '#22d3ee' }}>{fmt(weights.total_telemetry_samples)}</b>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
            {Object.entries(weights.skill_weights).sort((a, b) => b[1] - a[1]).map(([skill, w]) => (
              <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <span style={{ fontSize: '.75rem', color: 'var(--fg-muted)', width: '160px', flexShrink: 0 }}>{skill.replace(/_/g, ' ')}</span>
                <div style={{ flex: 1, height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px' }}>
                  <div style={{ height: '100%', width: `${((w - 1) / 1.0) * 100}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)', borderRadius: '4px', transition: 'width .4s' }} />
                </div>
                <span style={{ fontSize: '.78rem', fontWeight: 700, color: '#a78bfa', width: '35px', textAlign: 'right' }}>{w.toFixed(2)}×</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-Tab: Executive Capability Matrix ─────────────────────
function ExecTab() {
  const [loading, setLoading] = useState(false);
  const [heatmap, setHeatmap] = useState<{ org_ai_readiness_score?: number; department_scores?: Record<string, number>; total_employees_mapped?: number; avg_ccrs_baseline?: number | null; skill_deficit_alerts?: { skill: string; avg_proficiency: number; severity: string }[] } | null>(null);
  const [roi, setRoi] = useState<{ net_roi_inr?: number; total_agency_fees_saved_inr?: number; avg_upskilling_cost_per_employee_inr?: number; internal_fills?: number; payback_period_months?: number } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [readRes, heatRes, roiRes] = await Promise.all([
        fetch(`${BASE}/mobility/org-ai-readiness?employer_id=DEMO-CORP`),
        fetch(`${BASE}/mobility/workforce-heatmap?employer_id=DEMO-CORP`),
        fetch(`${BASE}/mobility/roi-analytics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employer_id: 'DEMO-CORP', open_roles: [{ role_title: 'Senior MLOps Engineer' }, { role_title: 'Staff Data Engineer' }], internal_candidates_found: 3, external_agency_fee_pct: 20, avg_salary_inr: 14940000 }),
        }),
      ]);
      const [readData, heatData, roiData] = await Promise.all([readRes.json(), heatRes.json(), roiRes.json()]);
      setHeatmap({ ...readData, ...heatData });
      setRoi(roiData);
    } finally { setLoading(false); }
  };

  const deptColors: Record<string, string> = { 'ML Platform': '#6366f1', 'Data Engineering': '#22d3ee', 'Backend Engineering': '#10b981', 'Product': '#f59e0b', 'Operations': '#ef4444' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: '#e2e8f0', fontWeight: 700 }}>🏛 C-Suite Workforce Intelligence Dashboard</h3>
        <button onClick={fetchData} disabled={loading}
          style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', border: 'none', borderRadius: '10px', color: '#fff', padding: '.65rem 1.3rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .6 : 1 }}>
          {loading ? '⟳ Loading…' : '📊 Load Enterprise Analytics'}
        </button>
      </div>

      {heatmap && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            {[
              { label: 'Org AI Readiness', value: `${heatmap.org_ai_readiness_score?.toFixed(1) ?? '—'}/100`, color: '#6366f1' },
              { label: 'Employees Mapped', value: fmt(heatmap.total_employees_mapped ?? 0), color: '#22d3ee' },
              { label: 'Avg CCRS Baseline', value: heatmap.avg_ccrs_baseline ? `${heatmap.avg_ccrs_baseline.toFixed(1)}%` : '—', color: '#10b981' },
              { label: 'Net ROI', value: roi ? `₹${fmt(roi.net_roi_inr ?? 0)}` : '—', color: '#f59e0b' },
            ].map(kpi => (
              <div key={kpi.label} style={{ background: 'var(--glass-bg)', border: `1px solid ${kpi.color}33`, borderRadius: '12px', padding: '1.1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: kpi.color, marginBottom: '.3rem' }}>{kpi.value}</div>
                <div style={{ fontSize: '.75rem', color: 'var(--fg-subtle)' }}>{kpi.label}</div>
              </div>
            ))}
          </div>

          {heatmap.department_scores && (
            <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border-subtle)', borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--fg-color)', marginBottom: '1rem' }}>Department AI Readiness Scores</div>
              {Object.entries(heatmap.department_scores).sort((a, b) => b[1] - a[1]).map(([dept, score]) => (
                <div key={dept} style={{ marginBottom: '.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.3rem' }}>
                    <span style={{ fontSize: '.82rem', color: 'var(--fg-muted)' }}>{dept}</span>
                    <span style={{ fontSize: '.82rem', fontWeight: 700, color: deptColors[dept] ?? '#a78bfa' }}>{score.toFixed(1)}</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: '4px' }}>
                    <div style={{ height: '100%', width: `${score}%`, background: deptColors[dept] ?? '#6366f1', borderRadius: '4px', transition: 'width .6s' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {roi && (
            <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,.08), rgba(34,211,238,.06))', border: '1px solid rgba(16,185,129,.25)', borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ fontSize: '.9rem', fontWeight: 700, color: '#10b981', marginBottom: '1rem' }}>💰 Upskilling ROI Analytics vs. External Agency</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {[
                  { label: 'Agency Fees Saved', value: `₹${fmt(roi.total_agency_fees_saved_inr ?? 0)}`, color: '#10b981' },
                  { label: 'Avg Upskilling Cost', value: `₹${fmt(roi.avg_upskilling_cost_per_employee_inr ?? 0)}`, color: '#f59e0b' },
                  { label: 'Payback Period', value: `${roi.payback_period_months ?? 0} months`, color: '#22d3ee' },
                ].map(item => (
                  <div key={item.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: item.color }}>{item.value}</div>
                    <div style={{ fontSize: '.72rem', color: '#64748b', marginTop: '.3rem' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {heatmap.skill_deficit_alerts && heatmap.skill_deficit_alerts.length > 0 && (
            <div style={{ background: 'rgba(239,68,68,.05)', border: '1px solid rgba(239,68,68,.2)', borderRadius: '12px', padding: '1rem 1.25rem' }}>
              <div style={{ fontSize: '.85rem', fontWeight: 700, color: '#ef4444', marginBottom: '.75rem' }}>⚠️ Critical Skill Deficit Alerts</div>
              {heatmap.skill_deficit_alerts.map((alert) => (
                <div key={alert.skill} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.45rem 0', borderBottom: '1px solid rgba(239,68,68,.1)' }}>
                  <span style={{ fontSize: '.82rem', color: '#fca5a5' }}>{alert.skill.replace(/_/g, ' ')}</span>
                  <span style={{ fontSize: '.78rem', color: '#64748b' }}>Avg proficiency: <b style={{ color: '#f87171' }}>{(alert.avg_proficiency * 100).toFixed(0)}%</b></span>
                  <span style={{ background: alert.severity === 'critical' ? 'rgba(239,68,68,.15)' : 'rgba(245,158,11,.15)', color: alert.severity === 'critical' ? '#ef4444' : '#f59e0b', borderRadius: '12px', padding: '.2rem .6rem', fontSize: '.72rem', fontWeight: 700 }}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!heatmap && !loading && (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--fg-muted)', background: 'var(--glass-bg)', borderRadius: '14px', border: '1px dashed var(--glass-border-subtle)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '.75rem' }}>📊</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '.5rem', color: 'var(--fg-color)' }}>Executive Workforce Intelligence</div>
          <div style={{ fontSize: '.875rem' }}>Click "Load Enterprise Analytics" to view organizational skill readiness, internal mobility, and talent metrics</div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────
const TABS: { id: SubTab; label: string; icon: string }[] = [
  { id: 'mobility', label: 'Internal Talent Mobility', icon: '🏢' },
  { id: 'ats',      label: 'ATS / HRIS Hub',           icon: '🔗' },
  { id: 'offer',    label: 'Smart Offer Workshop',      icon: '💼' },
  { id: 'rlahf',    label: 'RLAHF Calibration',         icon: '🔁' },
  { id: 'exec',     label: 'Executive Matrix',          icon: '🏛' },
];

export function EnterpriseWorkforceGraph() {
  const [activeTab, setActiveTab] = useState<SubTab>('mobility');

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: 'var(--fg-color)', minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,.12), rgba(168,85,247,.08), rgba(34,211,238,.06))', border: '1px solid rgba(99,102,241,.25)', borderRadius: '20px', padding: '1.75rem 2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, marginBottom: '.4rem', fontSize: '1.35rem', fontWeight: 900, background: 'linear-gradient(90deg, #6366f1, #a855f7, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Enterprise Workforce Intelligence
            </h2>
            <p style={{ margin: 0, fontSize: '.875rem', color: 'var(--fg-muted)' }}>
              ATS/HRIS Integration · Smart Offer Clearance · RLAHF Calibration · Internal Talent Mobility Graph
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', textAlign: 'center' }}>
            {[{ n: '6', l: 'ATS Providers' }, { n: '90-Day', l: 'Calibration' }, { n: '≥70%', l: 'Internal Match' }].map(s => (
              <div key={s.l}>
                <div style={{ fontWeight: 900, color: 'var(--accent-primary)', fontSize: '1.1rem' }}>{s.n}</div>
                <div style={{ fontSize: '.68rem', color: 'var(--fg-subtle)' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-Tab Nav */}
      <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '.25rem' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.6rem 1.1rem', borderRadius: '10px', border: `1px solid ${activeTab === t.id ? 'var(--accent-primary)' : 'var(--glass-border-subtle)'}`, background: activeTab === t.id ? 'var(--pill-bg)' : 'transparent', color: activeTab === t.id ? 'var(--accent-primary)' : 'var(--fg-muted)', fontWeight: activeTab === t.id ? 700 : 500, cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '.82rem', transition: 'all .2s' }}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ background: 'var(--glass-card)', border: '1px solid var(--glass-border-subtle)', borderRadius: '16px', padding: '1.5rem' }}>
        {activeTab === 'mobility' && <MobilityTab />}
        {activeTab === 'ats'      && <ATSTab />}
        {activeTab === 'offer'    && <OfferTab />}
        {activeTab === 'rlahf'   && <RLAHFTab />}
        {activeTab === 'exec'     && <ExecTab />}
      </div>
    </div>
  );
}

export default EnterpriseWorkforceGraph;
