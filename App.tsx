import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard, Search, Cpu, BarChart3, MapPin, ChevronRight, ShieldCheck,
  Zap, Loader2, Users, LineChart, Target, Layers, Activity, Terminal, Webhook,
  History, Trash2, Heart, Quote, Wand2, Lock, Database, GitMerge, Eye, Clock, PlusCircle, ShieldAlert, Globe, Server, DollarSign, Info
} from 'lucide-react';


/* =========================
    VSE CORE TYPES
========================= */
interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'action' | 'info' | 'system' | 'governance';
}

interface SavedReport {
  id: string;
  timestamp: string;
  input: string;
  report: string;
}

const SCRIPTURES = [
  { text: 'Commit your work to the Lord, and your plans will be established.', ref: 'Proverbs 16:3' },
  { text: 'Whatever you do, work heartily, as for the Lord and not for men.', ref: 'Colossians 3:23' },
  { text: 'Do you see a man skillful in his work? He will stand before kings; he will not stand before obscure men.', ref: 'Proverbs 22:29' },
  { text: 'So, whether you eat or drink, or whatever you do, do all to the glory of God.', ref: '1 Corinthians 10:31' }
];


/* =========================
    DONE LIST LOGIC
========================= */
type DoneListState = 'no_action' | 'simulate' | 'executed';

const DONE_LIST_CONTENT: Record<DoneListState, { title: string; body: string }> = {
  no_action: {
    title: "Analysis complete — governed autonomy in observation mode.",
    body: `The VSE evaluated CRM pipeline, SEO visibility, paid media efficiency, competitor intelligence, and market demand for this market.
Signals show performance variance but all remain inside defined governance thresholds.
No paid segments crossed the “spend with zero pipeline” threshold.
No SEO topic produced enough CRM-backed demand to justify a governed budget shift.
Result: no autonomous execution was triggered in this cycle.
The engine continues monitoring and learning from live signals, ready to act when thresholds are exceeded.`
  },
  simulate: {
    title: "Analysis complete — simulated budget reallocation path prepared.",
    body: `The VSE ingested CRM data, SEO topic performance, paid media spend, competitor intel, and local market signals.
It detected wasteful paid spend on low-converting generic terms with negligible CRM opportunities.
It also detected a high-performing SEO topic generating qualified opportunities and meaningful pipeline with limited paid support.
Governance thresholds for this environment cap budget moves per cycle and require CRM-backed demand, not clicks alone, to justify changes.
Within those rules, the engine prepared a simulated reallocation plan:
– Decrease budget on identified low-converting paid segments.
– Increase budget on campaigns aligned to the high-performing SEO topic.
– Reallocate a portion of budget from generic terms into proven, CRM-backed demand.
Execution mode is simulation only in this demo; proposals are logged here for human review, and no live account changes were made.`
  },
  executed: {
    title: "Analysis complete — governed budget adjustments executed.",
    body: `The VSE processed a full cross-silo snapshot: CRM pipeline, SEO visibility by topic, paid media performance, competitor posture, and market demand indicators.
It found paid segments exceeding the “spend with zero pipeline” threshold and SEO topics consistently generating high-value opportunities and pipeline.
Governance-as-Code defined what it was allowed to touch: only campaign and keyword budgets, and only within a strict percentage band per decision cycle, with CRM-backed demand as a prerequisite.
Within those parameters, the engine autonomously:
– Reduced budget on specified low-converting paid segments inside the allowed adjustment range.
– Increased budget on campaigns mapped to the high-performing SEO topic, also within the allowed range.
– Rebalanced a portion of spend from weak generic terms into proven, CRM-backed demand.
Every change was written into the Done List with timestamps, affected entities, before/after values, and links back to the originating signals, so the entire decision path is fully auditable.`
  }
};

function getDoneListState(actions: any[], mode: 'simulate' | 'live'): DoneListState {
  const hasActions = Array.isArray(actions) && actions.length > 0;

  if (hasActions && mode === 'simulate') return 'simulate';
  if (hasActions && mode === 'live') return 'executed';
  return 'no_action';
}


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clarity' | 'sync' | 'orchestrator' | 'conductor' | 'loom' | 'actuator' | 'registry'>('clarity');
  const [syncInput, setSyncInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusLog, setStatusLog] = useState<LogEntry[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [vseResult, setVseResult] = useState<any | null>(null);
  const mode: 'simulate' | 'live' = 'simulate';
  const [selectedArchive, setSelectedArchive] = useState<SavedReport | null>(null);
  const [registryUnlocked, setRegistryUnlocked] = useState(false);

  const dailyScripture = useMemo(() => {
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return SCRIPTURES[dayOfYear % SCRIPTURES.length];
  }, []);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const commandTime = new Date().toLocaleTimeString('en-US', {
      timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
    const newEntry: LogEntry = { id: Math.random().toString(36).substr(2, 9), timestamp: commandTime, message, type };
    setStatusLog((prev) => [newEntry, ...prev].slice(0, 50));
  };

  const handleRegistryUnlock = () => {
    if (registryUnlocked) { setActiveTab('registry'); return; }
    const pw = prompt("ENTER GOVERNANCE PASSCODE:");
    if (pw === "architect") { setRegistryUnlocked(true); setActiveTab('registry'); }
  };

  const handleNewOrchestration = () => {
    const lastAction = statusLog.find(log => log.type === 'action');
    if (lastAction && syncInput && !selectedArchive) {
      setSavedReports(prev => [{ id: Math.random().toString(36).substr(2, 9), timestamp: lastAction.timestamp, input: syncInput, report: lastAction.message }, ...prev]);
    }
    setSyncInput('');
    setStatusLog([]);
    setSelectedArchive(null);
    setVseResult(null);
    setActiveTab('clarity');
  };

  const handleOrchestration = async () => {
    if (!syncInput || loading) return;

    setLoading(true);
    setStatusLog([]);
    setSelectedArchive(null);
    setVseResult(null);

    addLog(`CLARITY CORE: Engaging strategic synthesis...`, 'info');

    setTimeout(() => {
      addLog(`ORCHESTRATOR: Validating strategic intent...`, 'governance');
    }, 700);

    setTimeout(() => {
      addLog(`DATA LOOM: Knowledge threads synthesized.`, 'info');
    }, 1400);

    try {
      
      const res = await fetch('/api/main');
      const data = await res.json();

      setVseResult(data);

      setTimeout(() => {
        addLog(`THE CONDUCTOR: Command execution confirmed.`, 'system');

        if (data?.actions?.length > 0) {
          addLog(`ACTUATOR: Governed action path generated for review.`, 'action');
        } else {
          addLog(`ACTUATOR: Analysis complete. No governed action required in this cycle.`, 'action');
        }

        setLoading(false);
        setActiveTab('actuator');
      }, 2200);
    } catch (err: any) {
      addLog(`SYSTEM ERROR: ${err?.message || 'Unable to reach VSE endpoint.'}`, 'system');
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-gray-200 font-inter">
      {/* Sidebar Architecture */}
      <aside className="w-80 border-r border-white/10 flex flex-col glass-panel shrink-0">
        <div className="p-5 flex flex-col h-full overflow-hidden">

          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center glow-accent shrink-0">
              <Cpu className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-lg font-black text-white leading-none tracking-tighter uppercase">VSE CORE</h1>
              <p className="text-[9px] text-blue-400 font-mono tracking-widest uppercase mt-0.5">Command Layer</p>
            </div>
          </div>

          <button onClick={handleNewOrchestration} className="w-full flex items-center justify-center gap-2 py-3 mb-6 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400 font-black text-[10px] uppercase tracking-widest transition-all shadow-glow">
            <PlusCircle size={16} /> New Orchestration
          </button>

          {/* System Hierarchy: Fixed Section */}
          <div className="flex-none">
            <p className="px-4 py-1 text-[9px] font-black text-blue-500/50 uppercase tracking-[0.3em] mb-2">System Hierarchy</p>
            <nav className="space-y-0.5">
              <SidebarItem icon={<Eye size={18} />} label="Clarity Core" description="The Interface: Agentic AI providing absolute business clarity." active={activeTab === 'clarity'} onClick={() => {setActiveTab('clarity'); setSelectedArchive(null);}} />
              <SidebarItem icon={<Activity size={18} />} label="Velocity Sync" description="The Foundation: Secure infrastructure bridging disparate platforms." active={activeTab === 'sync'} onClick={() => setActiveTab('sync')} />
              <SidebarItem icon={<ShieldCheck size={18} />} label="Orchestrator" description="The Strategy: Governance layer containing business logic." active={activeTab === 'orchestrator'} onClick={() => setActiveTab('orchestrator')} />
              <SidebarItem icon={<Clock size={18} />} label="The Conductor" description="The Execution: Real-time synchronization for data handshakes." active={activeTab === 'conductor'} onClick={() => setActiveTab('conductor')} />
              <SidebarItem icon={<GitMerge size={18} />} label="Data Loom" description="The Synthesis: Weaving siloed threads into a unified tapestry." active={activeTab === 'loom'} onClick={() => setActiveTab('loom')} />
              <SidebarItem icon={<Zap size={18} />} label="The Actuator" description="Autonomous Action: Adjusting bids, budgets, and campaigns." active={activeTab === 'actuator'} onClick={() => {setActiveTab('actuator'); setSelectedArchive(null);}} />
              <SidebarItem icon={<ShieldAlert size={18} />} label="VSE Registry" description="Security Vault: Private directory of handshake protocols." active={activeTab === 'registry'} onClick={handleRegistryUnlock} />
            </nav>
          </div>

          {/* History Repository: Scrolling Section */}
          <div className="flex-1 overflow-hidden flex flex-col border-t border-white/5 mt-6 pt-6">
              <p className="px-4 py-2 text-[10px] font-black text-white uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                <History size={12} className="text-blue-500" /> History Repository
              </p>
              <div className="overflow-y-auto custom-scrollbar space-y-2 pr-2 pb-4">
                {savedReports.length === 0 ? (
                  <div className="px-4 py-6 border border-dashed border-white/5 rounded-xl opacity-30 text-center">
                    <p className="text-[9px] font-bold uppercase tracking-widest">No Archived Handshakes</p>
                  </div>
                ) : (
                  savedReports.map(report => (
                    <button key={report.id} onClick={() => { setSelectedArchive(report); setActiveTab('actuator'); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 border border-white/5 transition-all bg-white/[0.01] group">
                      <p className="text-[9px] font-mono text-blue-500 font-bold mb-1 opacity-70">{report.timestamp} EST</p>
                      <p className="text-xs text-gray-400 truncate font-bold uppercase tracking-tight leading-none group-hover:text-white transition-colors">"{report.input}"</p>
                    </button>
                  ))
                )}
              </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-10 relative flex flex-col bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent">
        {activeTab === 'clarity' && (
          <div className="max-w-6xl mx-auto w-full space-y-12 animate-in fade-in duration-1000">
            <section className="text-center glass-panel p-12 rounded-[3rem] border-blue-500/20 shadow-2xl glow-accent">
               <span className={`px-5 py-2 bg-blue-600/10 text-blue-400 text-[11px] font-black uppercase tracking-[0.5em] rounded-full border border-blue-500/20 ${loading ? 'animate-pulse-soft' : ''}`}>Active Autonomy Protocol</span>
               <h1 className="text-5xl font-black text-white tracking-tighter mt-8 mb-2">Good Morning Victor</h1>
               <h2 className="text-xl font-bold text-blue-500 uppercase tracking-[0.2em] mb-10 font-mono text-nowrap">The Architects of Active Autonomy</h2>
               <div className="max-w-2xl mx-auto p-8 rounded-3xl bg-black/60 border border-white/5">
                 <p className="text-2xl text-gray-200 font-medium italic leading-relaxed">"{dailyScripture.text}"</p>
                 <p className="text-sm text-blue-500 font-black uppercase tracking-widest mt-4">— {dailyScripture.ref}</p>
               </div>
            </section>

            <div className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 glass-panel p-8 rounded-[2.5rem] border-blue-500/10 h-[500px] flex flex-col shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg"><Terminal size={24} /></div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight leading-none">Master Input Node</h3>
                </div>
                <textarea className="w-full flex-1 bg-black/40 border border-white/5 rounded-2xl p-6 outline-none text-gray-200 text-[17px] leading-relaxed resize-none shadow-inner" placeholder="What do you want to know?" value={syncInput} onChange={(e) => setSyncInput(e.target.value)} />
                <button onClick={handleOrchestration} disabled={loading || !syncInput} className="mt-8 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl uppercase tracking-tighter transition-all shadow-glow">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : "Orchestrate Architecture"}
                </button>
              </div>

              <div className="lg:col-span-5 glass-panel p-8 rounded-[2.5rem] border-white/5 h-[500px] flex flex-col bg-black/20 shadow-xl overflow-hidden">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2"><Activity size={18} className="text-blue-500" /> System Action Feed</h3>
                <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[13px] custom-scrollbar pr-2">
                    {statusLog.map(log => (
                      <ActionFeedItem key={log.id} log={log} />
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'actuator' && (
          <div className="max-w-5xl mx-auto w-full animate-in fade-in duration-500">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-8">The Done List</h2>
            <div className="glass-panel p-10 rounded-[2.5rem] border-blue-500/20 bg-blue-900/5 shadow-2xl relative overflow-hidden">
                <div className="bg-black/60 p-10 rounded-[2rem] border border-white/10 shadow-inner">
                    {(() => {
                      if (selectedArchive) {
                        return (
                          <p className="text-2xl text-gray-100 leading-relaxed font-semibold">
                            {selectedArchive.report}
                          </p>
                        );
                      }

                      if (!vseResult) {
                        return (
                          <p className="text-2xl text-gray-100 leading-relaxed font-semibold">
                            Awaiting Strategic Signal...
                          </p>
                        );
                      }

                      const actions = vseResult.actions || [];
                      const state = getDoneListState(actions, mode);
                      const content = DONE_LIST_CONTENT[state];

                      return (
                        <div className="space-y-5">
                          <h3 className="text-2xl font-black text-white tracking-tight">
                            {content.title}
                          </h3>

                          <p className="text-lg text-gray-100 leading-relaxed whitespace-pre-line">
                            {content.body}
                          </p>

                          {vseResult.market_context && (
                            <div className="pt-6 border-t border-white/10">
                              <p className="text-[11px] uppercase tracking-[0.3em] text-blue-400 font-black mb-4">
                                Live Decision Context
                              </p>
                              <div className="grid md:grid-cols-2 gap-3 text-sm">
                                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                  <p className="text-gray-500 uppercase text-[10px] tracking-widest mb-1">Market</p>
                                  <p className="text-white font-semibold">{vseResult.market || 'Unknown'}</p>
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                  <p className="text-gray-500 uppercase text-[10px] tracking-widest mb-1">SEO Topic</p>
                                  <p className="text-white font-semibold">{vseResult.market_context.seo_topic || 'N/A'}</p>
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                  <p className="text-gray-500 uppercase text-[10px] tracking-widest mb-1">SEO Visibility</p>
                                  <p className="text-white font-semibold">{vseResult.market_context.seo_visibility_score ?? 'N/A'}</p>
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                  <p className="text-gray-500 uppercase text-[10px] tracking-widest mb-1">Pipeline Value</p>
                                  <p className="text-white font-semibold">
                                    {typeof vseResult.market_context.pipeline_value_from_seo_topic === 'number'
                                      ? `$${vseResult.market_context.pipeline_value_from_seo_topic.toLocaleString()}`
                                      : 'N/A'}
                                  </p>
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                  <p className="text-gray-500 uppercase text-[10px] tracking-widest mb-1">Paid on Topic</p>
                                  <p className="text-white font-semibold">
                                    {typeof vseResult.market_context.paid_spend_on_topic === 'number'
                                      ? `$${vseResult.market_context.paid_spend_on_topic.toLocaleString()}`
                                      : 'N/A'}
                                  </p>
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                  <p className="text-gray-500 uppercase text-[10px] tracking-widest mb-1">Paid on Other Terms</p>
                                  <p className="text-white font-semibold">
                                    {typeof vseResult.market_context.paid_spend_on_other_terms === 'number'
                                      ? `$${vseResult.market_context.paid_spend_on_other_terms.toLocaleString()}`
                                      : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {Array.isArray(vseResult.actions) && vseResult.actions.length > 0 && (
                            <div className="pt-6 border-t border-white/10">
                              <p className="text-[11px] uppercase tracking-[0.3em] text-blue-400 font-black mb-4">
                                Proposed Action Path
                              </p>
                              <div className="space-y-3">
                                {vseResult.actions.map((action: any, idx: number) => (
                                  <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-4">
                                    <p className="text-white font-bold uppercase tracking-wide text-sm mb-1">
                                      {action.action_type || 'Proposed Action'}
                                    </p>
                                    <p className="text-gray-300 text-sm leading-relaxed">
                                      {action.reason || 'No rationale provided.'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .glass-panel { background: rgba(10, 10, 10, 0.8); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); }
        .glow-accent { box-shadow: 0 0 80px rgba(59, 130, 246, 0.15); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
        @keyframes pulse-soft { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }
        .animate-pulse-soft { animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
};


/* =========================
    ACTION FEED ITEM
========================= */
const ActionFeedItem: React.FC<{ log: LogEntry }> = ({ log }) => {
    const [isHovered, setIsHovered] = useState(false);
    const descriptions = {
        governance: "Layer 2 Check: Ensuring command aligns with budget and safety guardrails.",
        system: "Layer 3/4 Sync: Verifying internal handshake timing and infrastructure health.",
        info: "Clarity Core Diagnostic: Processing strategic intent and data threads.",
        action: "Layer 6 Actuation: Final execution signal sent to autonomous partners."
    };

    return (
        <div
          className="relative p-4 rounded-xl border border-white/5 bg-white/5 text-gray-400 group cursor-help transition-all hover:bg-white/10"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
            <p className="text-[10px] opacity-40 mb-1 font-bold">{log.timestamp} EST [{log.type.toUpperCase()}]</p>
            <p className="font-semibold leading-relaxed">{log.message}</p>
            {isHovered && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
                    <div className="p-3 bg-black border border-blue-500/40 rounded-lg shadow-2xl backdrop-blur-2xl">
                        <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">Architectural Insight:</p>
                        <p className="text-[11px] text-gray-200 font-medium leading-tight">{descriptions[log.type]}</p>
                    </div>
                </div>
            )}
        </div>
    );
};


/* =========================
    REFINED SIDEBAR ITEM
========================= */
const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; description: string; active?: boolean; onClick: () => void }> = ({ icon, label, description, active, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    return (
      <div className="relative" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${active ? 'bg-blue-600/10 text-white border border-blue-500/20 shadow-lg' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>
            <span className={active ? 'text-blue-500' : 'text-gray-600'}>{icon}</span>
            <span className="font-bold text-[10px] tracking-widest uppercase text-nowrap">{label}</span>
          </button>
          {isHovered && (
            <div className="absolute left-6 right-4 top-full z-50 animate-in fade-in slide-in-from-top-1 duration-200 pointer-events-none">
                <div className="p-2 bg-blue-900/90 backdrop-blur-xl border border-blue-500/30 rounded-lg shadow-2xl">
                    <p className="text-[9px] text-blue-100 font-medium leading-tight">{description}</p>
                </div>
            </div>
          )}
      </div>
    );
};

export default App;