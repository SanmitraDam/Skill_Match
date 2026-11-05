'use client';
import { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  Zap,
  ShieldCheck,
  Cpu,
  Coins,
  Building,
  Atom,
  Gavel,
  RefreshCw,
  Search,
  CheckCircle2,
  IndianRupee,
  ChevronRight,
  Target
} from 'lucide-react';

type SingularityTab = 'cda' | 'quantum' | 'consortia' | 'meritocracy' | 'redteam';

export default function AutonomousTalentExchange() {
  const [activeTab, setActiveTab] = useState<SingularityTab>('cda');

  // Pillar 1: CDA State
  const [selectedSkill, setSelectedSkill] = useState('Rust');
  const [stakeTokens, setStakeTokens] = useState(2500);
  const [stakedDone, setStakedDone] = useState(false);

  // Pillar 2: Quantum Hilbert & Photonic QKE State
  const [targetSkillQuery, setTargetSkillQuery] = useState('Rust, eBPF, WebAssembly, Kubernetes');
  const [isComputingQKE, setIsComputingQKE] = useState(false);
  const [qkeResult, setQkeResult] = useState<{
    affinity: number;
    latencyNs: number;
    overlap: number;
    synergy: number;
  } | null>({
    affinity: 98.4,
    latencyNs: 0.38,
    overlap: 0.984,
    synergy: 14.5
  });

  // Pillar 3: Consortia State
  const [ventureName, setVentureName] = useState('Sub-Nanosecond Photonic AI Mesh DAO');
  const [marketGap, setMarketGap] = useState('Sub-millisecond real-time distributed neural model routing');
  const [liquidityInr, setLiquidityInr] = useState(500000);
  const [ventureCreated, setVentureCreated] = useState(true);
  const [arbitrationResult, setArbitrationResult] = useState<string | null>(null);

  // Pillar 4: Universal Meritocracy State
  const [candidateZkdid, setCandidateZkdid] = useState('zkdid:plonky3:eth:0x9a8f2c1b');
  const [isGeneratingSTARK, setIsGeneratingSTARK] = useState(false);
  const [starkGenerated, setStarkGenerated] = useState(true);
  const [biasFreeVerified, setBiasFreeVerified] = useState(true);

  // Handlers
  const handleComputeQKE = () => {
    setIsComputingQKE(true);
    setTimeout(() => {
      setQkeResult({
        affinity: 98.6,
        latencyNs: 0.38,
        overlap: 0.986,
        synergy: 15.2
      });
      setIsComputingQKE(false);
    }, 600);
  };

  const handleArbitrate = () => {
    setArbitrationResult('RESPONDENT_CLEARED — 184ms Latency. 100% Milestone Funds Disbursed to Candidate Wallet.');
  };

  return (
    <div className="w-full min-h-screen bg-[var(--bg-color)] text-[var(--fg-color)] p-6 md:p-8 space-y-8">
      {/* ── Top Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--glass-border-subtle)] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--pill-bg)] border border-[var(--glass-border-subtle)] text-[var(--accent-primary)] text-xs font-semibold tracking-wide uppercase mb-2">
            <Sparkles size={14} className="animate-spin-slow" />
            SkillMatch DNA — Talent Mobility &amp; Exchange
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--fg-color)]">
            Talent Mobility &amp; Skill Exchange Hub
          </h1>
          <p className="text-[var(--fg-muted)] text-sm mt-1">
            Skill marketplace, role requirement order matching, and verified credential clearance.
          </p>
        </div>

        {/* Live Metrics */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl border border-[var(--glass-border-subtle)] bg-[var(--glass-card)] flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap size={18} />
            </div>
            <div>
              <div className="text-xs text-[var(--fg-muted)] font-medium">Matching Latency</div>
              <div className="text-sm font-bold text-cyan-500">Fast</div>
            </div>
          </div>

          <div className="px-4 py-2 rounded-xl border border-[var(--glass-border-subtle)] bg-[var(--glass-card)] flex items-center gap-3 shadow-sm">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="text-xs text-[var(--fg-muted)] font-medium">Bias-Free Privacy</div>
              <div className="text-sm font-bold text-emerald-500">100% Masked</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub-Navigation Tabs ──────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[var(--glass-border-subtle)] custom-scrollbar">
        {[
          { id: 'cda', label: 'Order Book & Spot Market', icon: TrendingUp },
          { id: 'quantum', label: 'Talent Routing', icon: Atom },
          { id: 'consortia', label: 'Enterprise Ventures', icon: Building },
          { id: 'meritocracy', label: 'Verified Credential Ledger', icon: ShieldCheck },
          { id: 'redteam', label: 'Integrity Audit', icon: Gavel }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SingularityTab)}
              className={`
                px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap
                ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-fuchsia-500/20 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
                }
              `}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: Continuous Double Auction Order Book & Spot Market ── */}
      {activeTab === 'cda' && (
        <div className="space-y-6">
          {/* Dynamic Spot Prices Ticker */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { skill: 'Rust Systems', spot: '₹12,865/h', change: '+4.8%', volume: '1,420h', status: 'HIGH_DEMAND' },
              { skill: 'Cloud Infrastructure', spot: '₹14,525/h', change: '+6.5%', volume: '980h', status: 'ACTIVE' },
              { skill: 'AI & Data Engineering', spot: '₹15,355/h', change: '+11.4%', volume: '2,100h', status: 'SURGING' },
              { skill: 'Frontend & Web Systems', spot: '₹12,284/h', change: '+3.2%', volume: '1,150h', status: 'BALANCED' }
            ].map((s, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[var(--glass-card)] border border-[var(--glass-border-subtle)] space-y-1 shadow-sm">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--fg-color)] font-bold">{s.skill}</span>
                  <span className="text-emerald-500 font-bold">{s.change}</span>
                </div>
                <div className="text-2xl font-black text-cyan-500">{s.spot}</div>
                <div className="flex justify-between text-[11px] text-[var(--fg-subtle)] pt-1">
                  <span>Vol: {s.volume}</span>
                  <span className="text-[var(--fg-muted)]">{s.status}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live CDA Order Book */}
            <div className="lg:col-span-2 p-6 rounded-2xl border border-[var(--glass-border-subtle)] bg-[var(--glass-card)] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[var(--fg-color)]">Live Role &amp; Skill Matching Order Book</h3>
                  <p className="text-xs text-[var(--fg-muted)]">Market-clearing equilibrium matching organization demand and candidate capabilities.</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-xs font-bold">
                  Order Book Active
                </span>
              </div>

              {/* Order Book Depth Table */}
              <div className="space-y-2">
                <div className="grid grid-cols-5 text-xs text-[var(--fg-subtle)] px-3 pb-1 border-b border-[var(--glass-border-subtle)]">
                  <span>Order Type</span>
                  <span>Entity / Role</span>
                  <span>Skill Requirements</span>
                  <span>Compensation / Rate</span>
                  <span className="text-right">Hours</span>
                </div>

                {[
                  { type: 'DEMAND (Bid)', entity: 'Apex Labs', skills: 'Rust + Cloud Infra', rate: '₹13,695/h max', hours: '80h', color: 'text-cyan-500' },
                  { type: 'SUPPLY (Ask)', entity: 'Candidate #41F9', skills: 'Rust + Cloud + WASM', rate: '₹12,450/h min', hours: '40h', color: 'text-emerald-500' },
                  { type: 'DEMAND (Bid)', entity: 'Apex FinTech', skills: 'Python / ML Engineering', rate: '₹15,770/h max', hours: '120h', color: 'text-cyan-500' },
                  { type: 'SUPPLY (Ask)', entity: 'Candidate #7B2E', skills: 'Python / ML / FastAPI', rate: '₹14,525/h min', hours: '35h', color: 'text-emerald-500' }
                ].map((row, idx) => (
                  <div key={idx} className="grid grid-cols-5 text-xs px-3 py-2.5 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] items-center">
                    <span className={`font-bold ${row.color}`}>{row.type}</span>
                    <span className="font-mono text-[var(--fg-muted)] text-[11px]">{row.entity}</span>
                    <span className="text-[var(--fg-color)]">{row.skills}</span>
                    <span className="font-bold text-[var(--fg-color)]">{row.rate}</span>
                    <span className="text-right font-mono text-[var(--fg-muted)]">{row.hours}</span>
                  </div>
                ))}
              </div>

              {/* Recent Cleared Trade Banner */}
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-cyan-600 dark:text-cyan-300">⚡ Cleared Match: </span>
                  <span className="text-[var(--fg-color)]">Apex Labs matched with Candidate #41F9 at <b className="text-emerald-500">₹13,072.50/h</b></span>
                </div>
                <span className="font-mono text-[var(--fg-muted)] text-[11px]">Ref: Match-9a2b</span>
              </div>
            </div>

            {/* Skill Reward Pool */}
            <div className="p-6 rounded-2xl border border-[var(--glass-border-subtle)] bg-[var(--glass-card)] space-y-4 shadow-sm">
              <h4 className="text-sm font-bold text-[var(--fg-color)] flex items-center gap-2">
                <Coins size={16} className="text-amber-500" /> Skill Capability Staking
              </h4>
              <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
                Commit your verified skill proficiencies to enterprise priority pools to receive prioritized interview callbacks and direct recruiter invitations.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--fg-muted)] mb-1">Select Skill Domain</label>
                  <select
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)]"
                  >
                    <option>Rust Systems (High Demand)</option>
                    <option>Cloud Infrastructure (Active)</option>
                    <option>AI &amp; Data Engineering (Surging)</option>
                    <option>Frontend &amp; Web Systems (Steady)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[var(--fg-muted)] mb-1">
                    <span>Target Weekly Allocation</span>
                    <span className="text-amber-500 font-bold">{stakeTokens} Hours / Mo</span>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={10000}
                    step={250}
                    value={stakeTokens}
                    onChange={(e) => setStakeTokens(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-xs space-y-1">
                  <div className="text-[var(--fg-muted)]">Priority Tier: <span className="text-emerald-500 font-bold">Top 5%</span></div>
                  <div className="text-[var(--fg-muted)]">Recruiter Visibility: <span className="text-[var(--fg-color)] font-bold">Active Search Direct</span></div>
                </div>

                <button
                  onClick={() => setStakedDone(true)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 font-bold text-slate-950 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Coins size={14} /> Commit Skill Availability
                </button>

                {stakedDone && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-500 font-medium text-center">
                    Availability Confirmed: Active in priority talent network
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: Multi-Dimensional Skill Graph ── */}
      {activeTab === 'quantum' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Simulation Controls */}
            <div className="p-6 rounded-2xl border border-[var(--glass-border-subtle)] bg-[var(--glass-card)] space-y-4 shadow-sm">
              <h3 className="font-bold text-[var(--fg-color)] text-base flex items-center gap-2">
                <Atom size={18} className="text-cyan-500" /> Multi-Dimensional Skill Graph
              </h3>
              <p className="text-xs text-[var(--fg-muted)]">
                Maps candidate technical competencies across multi-dimensional role requirements to find optimal career path matches.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--fg-muted)] mb-1">Target Skill Stack</label>
                  <input
                    type="text"
                    value={targetSkillQuery}
                    onChange={(e) => setTargetSkillQuery(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)] focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-xs space-y-1.5">
                  <div className="text-[var(--fg-muted)]">Model Architecture: <span className="text-[var(--fg-color)] font-bold">Semantic Vector Search</span></div>
                  <div className="text-[var(--fg-muted)]">Vector Dimension: <span className="text-cyan-500 font-bold">384 Dimensions</span></div>
                  <div className="text-[var(--fg-muted)]">Search Latency: <span className="text-emerald-500 font-bold">&lt; 15ms Query Response</span></div>
                </div>

                <button
                  onClick={handleComputeQKE}
                  disabled={isComputingQKE}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-xs text-white shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isComputingQKE ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                  Run Skill Correlation Analysis
                </button>
              </div>
            </div>

            {/* QKE Results & Quantum Manifold Display */}
            {qkeResult && (
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-[var(--glass-card)] border border-[var(--glass-border-subtle)]">
                    <div className="text-xs text-[var(--fg-muted)]">Skill Affinity</div>
                    <div className="text-2xl font-black text-cyan-500 mt-1">{qkeResult.affinity}%</div>
                    <div className="text-[11px] text-[var(--fg-subtle)] mt-0.5">Vector Cosine Match</div>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--glass-card)] border border-[var(--glass-border-subtle)]">
                    <div className="text-xs text-[var(--fg-muted)]">Search Latency</div>
                    <div className="text-2xl font-black text-emerald-500 mt-1">12 ms</div>
                    <div className="text-[11px] text-emerald-500 mt-0.5">Optimized Index</div>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--glass-card)] border border-[var(--glass-border-subtle)]">
                    <div className="text-xs text-[var(--fg-muted)]">Synergy Multiplier</div>
                    <div className="text-2xl font-black text-indigo-500 mt-1">+{qkeResult.synergy}%</div>
                    <div className="text-[11px] text-[var(--fg-subtle)] mt-0.5">Stack Synergy Boost</div>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--glass-card)] border border-[var(--glass-border-subtle)]">
                    <div className="text-xs text-[var(--fg-muted)]">Candidate Pool</div>
                    <div className="text-2xl font-black text-fuchsia-500 mt-1">1,024</div>
                    <div className="text-[11px] text-[var(--fg-subtle)] mt-0.5">Active candidates matched</div>
                  </div>
                </div>

                {/* Emergent Synergies Card */}
                <div className="p-6 rounded-2xl border border-[var(--glass-border-subtle)] bg-[var(--glass-card)] space-y-3 shadow-sm">
                  <h4 className="text-sm font-bold text-[var(--fg-color)] flex items-center gap-2">
                    <Cpu size={16} className="text-cyan-500" /> Technical Skill Stack Synergies
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-xs space-y-1">
                      <div className="font-bold text-cyan-600 dark:text-cyan-300">Rust + Systems Architecture (+8.5%)</div>
                      <div className="text-[var(--fg-muted)]">High correlation with low-latency network services and systems reliability engineering.</div>
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-xs space-y-1">
                      <div className="font-bold text-indigo-600 dark:text-indigo-300">TypeScript + WebAssembly Runtime (+6.0%)</div>
                      <div className="text-[var(--fg-muted)]">High correlation with browser sandboxing and performant edge application engineering.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: Consortia Ventures ──────────────── */}
      {activeTab === 'consortia' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Venture Creator */}
            <div className="p-6 rounded-2xl border border-[var(--glass-border-subtle)] bg-[var(--glass-card)] space-y-4 shadow-sm">
              <h3 className="font-bold text-[var(--fg-color)] text-base flex items-center gap-2">
                <Building size={18} className="text-indigo-500" /> Enterprise Talent Venture
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--fg-muted)] mb-1">Venture Title</label>
                  <input
                    type="text"
                    value={ventureName}
                    onChange={(e) => setVentureName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--fg-muted)] mb-1">Target Skill Requirements</label>
                  <textarea
                    rows={2}
                    value={marketGap}
                    onChange={(e) => setMarketGap(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[var(--fg-muted)] mb-1">
                    <span>Hiring Budget Allocation (₹)</span>
                    <span className="text-emerald-500 font-bold">₹{liquidityInr.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={50000}
                    max={1000000}
                    step={25000}
                    value={liquidityInr}
                    onChange={(e) => setLiquidityInr(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <button
                  onClick={() => setVentureCreated(true)}
                  className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Create Talent Pool
                </button>
              </div>
            </div>

            {/* Active Venture Dashboard & Dispute Panel */}
            <div className="lg:col-span-2 space-y-4">
              <div className="p-6 rounded-2xl border border-[var(--glass-border-subtle)] bg-[var(--glass-card)] space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-indigo-500 font-semibold uppercase">Active Talent Initiative</span>
                    <h4 className="text-base font-bold text-[var(--fg-color)] mt-0.5">{ventureName}</h4>
                  </div>
                  <div className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-semibold">
                    Budget: ₹{liquidityInr.toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-xs">
                  <div>
                    <span className="text-[var(--fg-subtle)]">Placement Rate</span>
                    <div className="text-emerald-500 font-bold mt-0.5">99.8%</div>
                  </div>
                  <div>
                    <span className="text-[var(--fg-subtle)]">Disbursed Compensation</span>
                    <div className="text-[var(--fg-color)] font-bold mt-0.5">₹69.93 L</div>
                  </div>
                  <div>
                    <span className="text-[var(--fg-subtle)]">Active Squads</span>
                    <div className="text-cyan-500 font-bold mt-0.5">3 Specialized Teams</div>
                  </div>
                </div>

                {/* Dispute Arbitration Simulator */}
                <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-[var(--fg-color)] flex items-center gap-1.5">
                      <Gavel size={14} className="text-amber-500" /> Milestone Verification &amp; Clearance
                    </h5>
                    <button
                      onClick={handleArbitrate}
                      className="px-3 py-1 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-colors cursor-pointer"
                    >
                      Clear Milestone Review
                    </button>
                  </div>

                  {arbitrationResult && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      {arbitrationResult}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: Verified Credential Ledger ─────── */}
      {activeTab === 'meritocracy' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Credential Aggregator Card */}
            <div className="p-6 rounded-2xl border border-[var(--glass-border-subtle)] bg-[var(--glass-card)] space-y-4 shadow-sm">
              <h4 className="text-sm font-bold text-[var(--fg-color)] flex items-center gap-2">
                <ShieldCheck size={16} className="text-cyan-500" /> Verified Credential Proof Aggregator
              </h4>
              <p className="text-xs text-[var(--fg-muted)]">
                Cryptographically bundles multi-skill assessment scores, code evaluations, and proctoring trust records into a tamper-evident credential.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--fg-muted)] mb-1">Candidate ID</label>
                  <input
                    type="text"
                    value={candidateZkdid}
                    onChange={(e) => setCandidateZkdid(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-xs text-[var(--fg-color)] font-mono"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[var(--fg-muted)]">Proof Signature Size:</span>
                    <span className="text-emerald-500 font-bold">&le; 8 KB Verified</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--fg-muted)]">Verification Time:</span>
                    <span className="text-cyan-500 font-bold">&lt; 1 ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--fg-muted)]">Career Readiness Score Mean:</span>
                    <span className="text-violet-500 font-bold">88.5%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 100% Bias-Free Hiring Guarantee Card */}
            <div className="p-6 rounded-2xl border border-[var(--glass-border-subtle)] bg-[var(--glass-card)] space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[var(--fg-color)] flex items-center gap-2">
                  <Target size={16} className="text-fuchsia-500" /> Bias-Free Hiring Guarantee
                </h4>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-fuchsia-500/10 text-fuchsia-500 border border-fuchsia-500/30">
                  PII MASKED
                </span>
              </div>

              <p className="text-xs text-[var(--fg-muted)]">
                Employers verify candidate capability against technical and integrity benchmarks with full masking of demographic and personal identifiers.
              </p>

              <div className="p-3.5 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-500 font-bold">
                  <CheckCircle2 size={16} /> Verified Technical Competence (CCRS &ge; 85%)
                </div>
                <div className="flex items-center gap-2 text-emerald-500 font-bold">
                  <CheckCircle2 size={16} /> Verified Proctor Integrity (PTS &ge; 90%)
                </div>
                <div className="flex items-center gap-2 text-cyan-500 font-bold">
                  <CheckCircle2 size={16} /> Demographic Data Exposure: 0.00% (Anonymized PII)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: Compliance Audit ──────────── */}
      {activeTab === 'redteam' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-[var(--glass-border-subtle)] bg-[var(--glass-card)] space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--fg-color)]">Hiring Ethics &amp; Regulatory Compliance</h3>
                <p className="text-xs text-[var(--fg-muted)]">Continuous automated auditing against adverse impact and demographic bias.</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-xs font-bold">
                Certified Compliant
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-2">
                <div className="text-xs text-[var(--fg-muted)] font-medium">EU AI Act Standards</div>
                <div className="text-emerald-500 font-bold text-sm">PASSED &bull; Article 10 &amp; 14</div>
                <div className="text-[11px] text-[var(--fg-subtle)]">Risk management, data governance, and human oversight certified.</div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-2">
                <div className="text-xs text-[var(--fg-muted)] font-medium">US EEOC Guidelines</div>
                <div className="text-emerald-500 font-bold text-sm">PASSED &bull; Four-Fifths Rule</div>
                <div className="text-[11px] text-[var(--fg-subtle)]">Adverse impact ratio: 0.96 (Minimum threshold is 0.80).</div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-subtle)] space-y-2">
                <div className="text-xs text-[var(--fg-muted)] font-medium">NYC Local Law 144</div>
                <div className="text-emerald-500 font-bold text-sm">PASSED &bull; Annual Bias Audit</div>
                <div className="text-[11px] text-[var(--fg-subtle)]">Algorithmic audit completed with no statistically significant disparate impact.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
