
import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Cpu, 
  PlusCircle, 
  BarChart3, 
  MapPin, 
  Calendar,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  Loader2,
  Users,
  LineChart,
  Target,
  Layers,
  Activity,
  Terminal,
  Webhook,
  History,
  Trash2,
  Heart,
  Quote,
  Wand2
} from 'lucide-react';
import { getOrchestrationPlan, scanVirginiaEvents } from './services/geminiService';
import { SyncResult, VirginiaEvent, OrchestrationMode } from './types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'action' | 'info' | 'system';
  payload?: any;
}

const SCRIPTURES = [
  { text: "Commit your work to the Lord, and your plans will be established.", ref: "Proverbs 16:3" },
  { text: "Whatever you do, work heartily, as for the Lord and not for men.", ref: "Colossians 3:23" },
  { text: "Do you see a man skillful in his work? He will stand before kings; he will not stand before obscure men.", ref: "Proverbs 22:29" },
  { text: "So, whether you eat or drink, or whatever you do, do all to the glory of God.", ref: "1 Corinthians 10:31" },
  { text: "And let us not grow weary of doing good, for in due season we will reap, if we do not give up.", ref: "Galatians 6:9" },
  { text: "The soul of the sluggard craves and gets nothing, while the soul of the diligent is richly supplied.", ref: "Proverbs 13:4" },
  { text: "In all toil there is profit, but mere talk tends only to poverty.", ref: "Proverbs 14:23" }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sync' | 'events'>('dashboard');
  const [selectedMode, setSelectedMode] = useState<OrchestrationMode>('growth');
  const [syncInput, setSyncInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [events, setEvents] = useState<VirginiaEvent[]>([]);
  const [scanningEvents, setScanningEvents] = useState(false);
  const [statusLog, setStatusLog] = useState<LogEntry[]>([]);

  const dailyScripture = useMemo(() => {
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return SCRIPTURES[dayOfYear % SCRIPTURES.length];
  }, []);

  const addLog = (message: string, type: LogEntry['type'] = 'info', payload?: any) => {
    const newEntry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type,
      payload
    };
    setStatusLog(prev => [newEntry, ...prev].slice(0, 50));
  };

  const handleSync = async () => {
    if (!syncInput) return;
    setLoading(true);
    addLog(`Initializing ${selectedMode.toUpperCase()} Orchestration...`, 'system');
    
    try {
      const result = await getOrchestrationPlan(syncInput, selectedMode);
      setSyncResult(result);
      
      if (result.triggeredActions && result.triggeredActions.length > 0) {
        result.triggeredActions.forEach(action => {
          addLog(`ZAPIER EXEC: ${action.name}`, 'action', action.args);
        });
      }
      
      addLog(`${selectedMode.toUpperCase()} Roadmap Generated Successfully`, 'system');
      setActiveTab('sync');
    } catch (err) {
      addLog(`ERROR: Orchestration failed. Check system constraints.`, 'system');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEventScan = async () => {
    setScanningEvents(true);
    addLog("Scanning Northern Virginia & Chesterfield procurement hubs...", 'system');
    try {
      let lat, lng;
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((pos) => {
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        });
      }
      const data = await scanVirginiaEvents(lat, lng);
      setEvents(data);
      addLog(`Identified ${data.length} regional growth opportunities.`, 'info');
    } catch (err) {
      addLog("Regional scan interrupted.", 'system');
      console.error(err);
    } finally {
      setScanningEvents(false);
    }
  };

  const modeConfig = {
    growth: { icon: <Layers size={24} />, color: 'blue', label: 'Full Growth System', placeholder: 'Describe end-to-end business operations, traffic sources, and CRM pathways...' },
    seo: { icon: <Search size={24} />, color: 'violet', label: 'SEO Orchestration', placeholder: 'Provide website audit data, technical health signals, or topical content gaps...' },
    crm: { icon: <Users size={24} />, color: 'emerald', label: 'CRM & Lifecycle', placeholder: 'Detail funnel stages, lead capture sources, and customer drop-off points...' }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-gray-200 font-inter">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col glass-panel">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center glow-accent relative overflow-hidden shrink-0">
              <Cpu className="text-white relative z-10" size={24} />
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-transparent animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg font-bold tracking-tight text-white leading-none text-nowrap">VSE v1.2</h1>
                <Wand2 size={14} className="text-[#D4AF37] opacity-80" />
              </div>
              <p className="text-[9px] text-blue-400 font-mono tracking-widest uppercase opacity-80 mt-1">Lead Architect</p>
            </div>
          </div>

          <nav className="space-y-1">
            <p className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 text-blue-500/50">Master Intelligence</p>
            <SidebarItem 
              icon={<LayoutDashboard size={20} />} 
              label="Master Architect" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')} 
            />
            <SidebarItem 
              icon={<Activity size={20} />} 
              label="Sync Roadmap" 
              active={activeTab === 'sync'} 
              onClick={() => setActiveTab('sync')} 
            />
            <SidebarItem 
              icon={<MapPin size={20} />} 
              label="Regional Intel" 
              active={activeTab === 'events'} 
              onClick={() => setActiveTab('events')} 
            />
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/10">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white">VM</div>
            <div className="overflow-hidden text-nowrap">
              <p className="text-sm font-semibold text-white truncate">Veye Media</p>
              <p className="text-[9px] text-gray-400 uppercase tracking-tighter flex items-center gap-1">
                <ShieldCheck size={10} className="text-blue-500" /> SWaM Certified
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative scroll-smooth flex flex-col">
        <div className="flex-1">
          {activeTab === 'dashboard' && (
            <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              
              {/* Centered Daily Dedication Card */}
              <section className="flex flex-col items-center text-center pt-8 pb-4">
                <div className="glass-panel w-full max-w-3xl p-10 rounded-[2.5rem] border border-blue-500/30 relative overflow-hidden bg-gradient-to-b from-blue-600/10 to-transparent shadow-[0_20px_50px_rgba(59,130,246,0.15)] glow-accent group transition-all duration-500 hover:border-blue-500/50">
                  <div className="absolute top-0 right-0 p-8 text-blue-600/5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <Heart size={160} strokeWidth={1} />
                  </div>
                  <div className="absolute -bottom-8 -left-8 text-blue-600/5 pointer-events-none">
                    <Quote size={120} strokeWidth={1} />
                  </div>
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-px w-8 bg-blue-500/50"></div>
                      <span className="px-4 py-1.5 bg-blue-600/20 text-blue-400 text-[11px] font-black uppercase tracking-[0.4em] rounded-full border border-blue-500/20 shadow-lg">Daily Dedication</span>
                      <div className="h-px w-8 bg-blue-500/50"></div>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-8 leading-[1.1] max-w-2xl">
                      Good Morning Victor! <br/>
                      <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        Let's grow Veye Media to God's Glory!
                      </span>
                    </h1>
                    
                    <div className="w-full max-w-xl p-8 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-md shadow-inner relative group/scripture">
                      <div className="flex flex-col items-center">
                        <p className="text-[10px] text-blue-500 uppercase font-black tracking-[0.3em] mb-4 opacity-70">Scripture for Stewardship</p>
                        <p className="text-xl md:text-2xl text-gray-100 font-medium italic leading-relaxed tracking-tight text-center max-w-lg mb-4">
                          "{dailyScripture.text}"
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-4 h-px bg-blue-500/30"></div>
                          <p className="text-xs md:text-sm text-blue-400 font-black tracking-widest uppercase italic">
                            {dailyScripture.ref}
                          </p>
                          <div className="w-4 h-px bg-blue-500/30"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8 flex gap-2">
                      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i === (new Date().getDay()) ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-white/10'}`}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <header className="flex justify-between items-start pt-8 border-t border-white/5">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-4xl font-black text-white tracking-tight">VSE v1.2 Sync Engine</h2>
                    <Wand2 size={24} className="text-[#D4AF37] opacity-60 mb-1" />
                  </div>
                  <p className="text-gray-400 text-lg font-medium">Lead Architect Interface: Initializing regional growth protocols.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_#3b82f6]" />
                  ARCHITECT LIVE: VSE-MASTER-1.2
                </div>
              </header>

              {/* Mode Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(modeConfig).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedMode(key as OrchestrationMode)}
                    className={`p-8 rounded-[2rem] border transition-all text-left relative overflow-hidden group ${
                      selectedMode === key 
                        ? `bg-${config.color}-600/10 border-${config.color}-500/50 glow-accent ring-1 ring-${config.color}-500/30` 
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`mb-4 p-4 inline-block rounded-2xl ${
                      selectedMode === key ? `bg-${config.color}-500 text-white shadow-lg` : 'bg-white/10 text-gray-400'
                    }`}>
                      {config.icon}
                    </div>
                    <h3 className="text-xl font-black text-white mb-2 tracking-tight">{config.label}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">Agentic {key.toUpperCase()} systems design and regional coordination.</p>
                    {selectedMode === key && (
                      <div className="absolute -bottom-2 -right-2 opacity-10">
                        {React.cloneElement(config.icon as React.ReactElement, { size: 100 })}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Input Section */}
                <div className="lg:col-span-7">
                  <div className="glass-panel p-8 rounded-[2.5rem] glow-accent border-blue-500/20 relative overflow-hidden h-full flex flex-col shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <ShieldCheck size={160} className="text-blue-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                      <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-2xl">
                        <PlusCircle size={32} />
                      </div>
                      <div>
                        <label className="block text-sm font-black text-blue-400 uppercase tracking-[0.2em] font-mono">
                          Master Input Node
                        </label>
                        <p className="text-xs text-gray-500 italic font-medium">Active Protocol: {modeConfig[selectedMode].label}</p>
                      </div>
                    </div>
                    
                    <textarea 
                      className="w-full flex-1 bg-black/60 border border-white/10 rounded-3xl p-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-gray-100 placeholder:text-gray-700 font-medium text-lg leading-relaxed relative z-10 shadow-inner custom-scrollbar"
                      placeholder={modeConfig[selectedMode].placeholder}
                      value={syncInput}
                      onChange={(e) => setSyncInput(e.target.value)}
                    />
                    
                    <div className="flex items-center justify-between mt-8 relative z-10">
                      <div className="flex gap-6">
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono font-black uppercase tracking-widest">
                          <Zap size={14} className="text-yellow-500" /> NO SILOS
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono font-black uppercase tracking-widest">
                          <MapPin size={14} className="text-blue-500" /> CHESTERFIELD/NOVA
                        </div>
                      </div>
                      <button 
                        onClick={handleSync}
                        disabled={loading || !syncInput}
                        className={`flex items-center gap-4 px-10 py-5 text-white font-black rounded-2xl transition-all shadow-2xl hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0 text-lg uppercase tracking-tight ${
                          selectedMode === 'growth' ? 'bg-blue-600 hover:bg-blue-500' : 
                          selectedMode === 'seo' ? 'bg-purple-600 hover:bg-purple-500' : 'bg-emerald-600 hover:bg-emerald-500'
                        }`}
                      >
                        {loading ? <Loader2 className="animate-spin" size={28} /> : <Target size={28} />}
                        Orchestrate Growth
                      </button>
                    </div>
                  </div>
                </div>

                {/* Real-time System Status Panel */}
                <div className="lg:col-span-5">
                  <div className="glass-panel p-8 rounded-[2.5rem] border-white/10 h-full flex flex-col bg-black/40 shadow-2xl">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-black flex items-center gap-3 text-white uppercase tracking-tight font-mono">
                        <Terminal size={24} className="text-blue-400" /> System Status Log
                      </h3>
                      <button 
                        onClick={() => setStatusLog([])}
                        className="text-gray-600 hover:text-red-400 transition-colors p-2 bg-white/5 rounded-xl border border-white/5"
                        title="Clear log"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 font-mono text-[11px] pr-2 custom-scrollbar">
                      {statusLog.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-700 opacity-50 space-y-6">
                          <div className="p-6 bg-white/5 rounded-full border border-white/5">
                            <History size={48} strokeWidth={1} />
                          </div>
                          <p className="uppercase tracking-[0.4em] text-center px-12 leading-relaxed">Awaiting Master Signal Synchronization</p>
                        </div>
                      ) : (
                        statusLog.map((log) => (
                          <div key={log.id} className={`p-4 rounded-2xl border leading-tight transition-all duration-300 animate-in fade-in slide-in-from-right-2 ${
                            log.type === 'action' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 
                            log.type === 'system' ? 'bg-blue-500/5 border-blue-500/20 text-blue-400 font-bold' : 
                            'bg-white/5 border-white/5 text-gray-400 shadow-sm'
                          }`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="opacity-40 font-black">{log.timestamp}</span>
                              <span className="text-[9px] uppercase font-black opacity-60 tracking-[0.2em] px-2 py-0.5 rounded bg-black/20">[{log.type}]</span>
                            </div>
                            <div className="flex gap-3">
                               {log.type === 'action' && <Webhook size={14} className="shrink-0 mt-0.5" />}
                               <p className="text-sm font-medium">{log.message}</p>
                            </div>
                            {log.payload && (
                              <pre className="mt-3 p-4 bg-black/60 rounded-xl border border-white/5 overflow-x-auto text-[10px] custom-scrollbar">
                                {JSON.stringify(log.payload, null, 2)}
                              </pre>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-16">
                <StatCard title="Priority Cluster" value="NOVA / CHFLD" sub="Regional Data Focused" icon={<MapPin className="text-blue-400" />} />
                <StatCard title="VSE Core Logic" icon={<Cpu className="text-purple-400" />} value="Master Arch" sub="No Silos Protocol" />
                <StatCard title="Real-world Ops" value="ZAPIER" sub="Webhook-Trigger Ready" icon={<Zap className="text-emerald-400" />} />
              </div>
            </div>
          )}

          {activeTab === 'sync' && (
            <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
              {!syncResult ? (
                <div className="flex flex-col items-center justify-center h-[70vh] text-center glass-panel rounded-[3rem] p-16 shadow-2xl bg-black/40">
                  <div className="w-24 h-24 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-500/20 mb-8 animate-pulse">
                    <ShieldCheck size={48} className="text-blue-500" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4 tracking-tight">Awaiting Master Intelligence Stream</h3>
                  <p className="text-gray-500 max-w-sm font-medium text-lg leading-relaxed mb-10">No active orchestration plan detected. Run a synchronization task to initialize the Master Architect.</p>
                  <button 
                    onClick={() => setActiveTab('dashboard')} 
                    className="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-500 transition-all shadow-2xl hover:-translate-y-1 uppercase tracking-widest text-sm"
                  >
                    Initialize Master Architect
                  </button>
                </div>
              ) : (
                <>
                  <header className="flex justify-between items-end border-b border-white/10 pb-10">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-lg ${
                          selectedMode === 'growth' ? 'bg-blue-600 text-white' : 
                          selectedMode === 'seo' ? 'bg-purple-600 text-white' : 'bg-emerald-600 text-white'
                        }`}>
                          {selectedMode} Mode Active
                        </span>
                      </div>
                      <h2 className="text-5xl font-black text-white mb-3 tracking-tighter">Growth Architecture</h2>
                      <p className="text-gray-400 text-xl font-medium italic">Integrated VSE-Master protocols for 2026 regional dominance.</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-gray-500 mb-2 uppercase tracking-[0.2em] font-black">VSE Protocol Identifier</div>
                      <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl text-blue-400 text-2xl font-mono font-black shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                        VSE-ARCH-{selectedMode.toUpperCase()}
                      </div>
                    </div>
                  </header>

                  {/* Architectural Actions Log (Function Calling / Tools Section) */}
                  {syncResult.triggeredActions && syncResult.triggeredActions.length > 0 && (
                    <div className="glass-panel p-8 rounded-[2.5rem] border-l-8 border-l-emerald-500 bg-black/40 shadow-2xl overflow-hidden relative group">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-emerald-500/10 transition-all duration-700" />
                      <div className="flex justify-between items-center mb-8 relative z-10">
                        <h3 className="text-xl font-black flex items-center gap-3 text-emerald-400 uppercase tracking-[0.1em] font-mono">
                          <Terminal size={24} /> Automated System Executions
                        </h3>
                        <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-[11px] text-emerald-400 font-black tracking-widest animate-pulse">
                          <Webhook size={14} /> LIVE ZAPIER LINK
                        </div>
                      </div>
                      <div className="space-y-4 font-mono relative z-10">
                        {syncResult.triggeredActions.map((action, idx) => (
                          <div key={action.id} className="p-6 bg-white/5 rounded-[1.5rem] border border-white/10 text-sm hover:border-emerald-500/30 transition-all hover:bg-white/[0.07] shadow-lg">
                            <div className="flex justify-between items-center mb-4">
                              <span className="text-emerald-500 font-black text-lg">PROTOCOL: {action.name}()</span>
                              <span className="text-gray-600 font-black opacity-50 tracking-tighter bg-black/20 px-3 py-1 rounded-lg uppercase">Node: {action.id}</span>
                            </div>
                            <pre className="text-gray-400 overflow-x-auto scrollbar-hide bg-black/20 p-4 rounded-xl shadow-inner text-xs">
                              {JSON.stringify(action.args, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Diagnosis - Left Side */}
                    <div className="lg:col-span-5 space-y-10">
                      <div className="glass-panel p-8 rounded-[2.5rem] border-l-8 border-l-blue-600 bg-black/40 shadow-xl">
                        <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-white uppercase tracking-tight">
                          <LineChart className="text-blue-400" size={24} /> Regional Baseline Scan
                        </h3>
                        <div className="grid grid-cols-1 gap-4">
                          {Object.entries(syncResult.diagnosis.signals).map(([key, value]) => value && (
                            <div key={key} className="bg-white/5 p-5 rounded-2xl border border-white/5 group hover:border-blue-500/40 transition-all cursor-default shadow-sm">
                              <p className="text-[11px] text-blue-500 uppercase font-black tracking-[0.2em] mb-2">{key}</p>
                              <p className="text-md text-gray-300 group-hover:text-white transition-colors leading-relaxed font-medium">{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="glass-panel p-8 rounded-[2.5rem] border-l-8 border-l-red-600 bg-black/40 shadow-xl">
                        <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-red-400 uppercase tracking-tight">
                          <ShieldCheck size={24} /> Strategic Inhibitors
                        </h3>
                        <div className="space-y-4">
                          {syncResult.diagnosis.inefficiencies.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-5 bg-red-500/5 rounded-2xl border border-red-500/10 text-md text-gray-300 hover:bg-red-500/10 transition-all shadow-sm">
                              <Zap size={18} className="text-red-500 mt-1 shrink-0" />
                              <span className="font-medium">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Projections - Right Side */}
                    <div className="lg:col-span-7">
                      <div className="glass-panel p-10 rounded-[3rem] h-full flex flex-col border border-white/10 bg-black/40 shadow-2xl">
                        <div className="flex justify-between items-center mb-10">
                          <h3 className="text-2xl font-black flex items-center gap-4 text-white uppercase tracking-tight">
                            <BarChart3 className="text-emerald-400" size={32} /> Velocity Projections
                          </h3>
                          <p className="text-[11px] text-gray-500 font-mono uppercase tracking-[0.4em] font-black">Unified Intelligence Feed</p>
                        </div>
                        <div className="flex-1 min-h-[450px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={syncResult.metrics} layout="vertical" margin={{ left: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                              <XAxis type="number" stroke="#555" fontSize={10} hide />
                              <YAxis dataKey="label" type="category" stroke="#999" fontSize={14} width={130} fontWeight="bold" />
                              <Tooltip 
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '16px', padding: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                itemStyle={{ color: '#60a5fa', fontSize: '16px', fontWeight: '900', textTransform: 'uppercase' }}
                              />
                              <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
                                {syncResult.metrics.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#8b5cf6'} className="hover:opacity-80 transition-opacity" />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-8 p-8 bg-blue-600/10 rounded-[2rem] border border-blue-500/20 grid grid-cols-2 gap-10 shadow-inner">
                          {syncResult.metrics.slice(0, 2).map((m, i) => (
                            <div key={i} className="flex flex-col">
                              <p className="text-[11px] text-blue-400 uppercase mb-2 tracking-[0.2em] font-black">{m.label}</p>
                              <p className="text-5xl font-black text-white tracking-tighter leading-none">+{m.value}{m.unit}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Agent Architecture Section */}
                  <div className="space-y-8 pt-12">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl glow-accent">
                        <Cpu size={36} />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-white tracking-tight uppercase">Agentic Ecosystem</h3>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.1em] text-sm">VSE Core Architecture Nodes</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {syncResult.architecture.agents.map((agent) => (
                        <div key={agent.id} className="p-10 bg-white/5 border border-white/10 rounded-[3rem] hover:border-indigo-500/50 transition-all group relative overflow-hidden backdrop-blur-xl shadow-xl">
                          <div className="flex justify-between items-start mb-6 relative z-10">
                            <h4 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors tracking-tight leading-none uppercase">{agent.name}</h4>
                            <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 font-black uppercase">
                              {agent.id}
                            </span>
                          </div>
                          <p className="text-md text-gray-400 mb-10 leading-relaxed min-h-[100px] font-medium relative z-10">{agent.description}</p>
                          <div className="space-y-4 relative z-10">
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.3em] mb-2">Architectural Logic Path</p>
                            <div className="flex flex-wrap gap-3">
                              {agent.dependencies.map(dep => (
                                <span key={dep} className="text-[11px] bg-indigo-500/10 text-indigo-300 px-4 py-1.5 rounded-full border border-indigo-500/10 font-black shadow-sm">
                                  {dep}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="absolute -bottom-8 -right-8 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 group-hover:scale-125 rotate-12">
                             <Cpu size={200} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Execution Roadmap */}
                  <div className="space-y-10 pb-40 pt-16">
                     <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-blue-600 flex items-center justify-center text-white shadow-2xl glow-accent">
                        <Target size={36} />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black text-white tracking-tight uppercase">Master Phase Deployment</h3>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.1em] text-sm">Strategic Regional Sequence</p>
                      </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {syncResult.roadmap.map((phase, idx) => (
                        <div key={idx} className="glass-panel p-10 rounded-[3.5rem] relative flex flex-col h-full border-t-[12px] border-t-blue-500/50 shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-black/60 transition-all hover:-translate-y-2 duration-500">
                          <div className="flex justify-between items-start mb-8">
                            <div className="bg-blue-600 text-white text-[11px] font-black px-5 py-1.5 rounded-full shadow-2xl uppercase tracking-[0.1em]">PHASE 0{idx + 1}</div>
                            <span className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] border-2 shadow-inner ${
                              phase.priority === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                              phase.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'
                            }`}>
                              {phase.priority} Priority
                            </span>
                          </div>
                          <h4 className="text-3xl font-black text-white mb-10 uppercase tracking-tighter leading-none border-b border-white/5 pb-6">{phase.phase}</h4>
                          <ul className="space-y-6 flex-1">
                            {phase.items.map((item, i) => (
                              <li key={i} className="flex items-start gap-5 text-gray-300 text-md leading-relaxed group cursor-default">
                                <div className="mt-1 w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all shrink-0 shadow-lg">
                                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                </div>
                                <span className="font-semibold">{item}</span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-14 pt-10 border-t border-white/5 flex justify-between items-center">
                            <div>
                               <p className="text-[11px] text-gray-600 font-black uppercase tracking-[0.3em] mb-2">Automation Layer</p>
                               <p className="text-sm text-blue-400 font-black flex items-center gap-3 tracking-widest">
                                 <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" /> SYNC-READY
                               </p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                              <Target size={28} className="text-blue-500" />
                            </div>
                          </div>
                        </div>
                      ))}
                     </div>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-right-4 duration-700">
              <header className="flex justify-between items-end border-b border-white/10 pb-12">
                <div>
                  <h2 className="text-5xl font-black text-white mb-4 tracking-tighter underline decoration-blue-500/40">Regional Intelligence</h2>
                  <p className="text-gray-400 text-xl font-medium max-w-2xl">Targeting Chesterfield and Northern Virginia procurement hubs for strategic SWaM integration.</p>
                </div>
                <button 
                  onClick={handleEventScan}
                  disabled={scanningEvents}
                  className="flex items-center gap-4 px-10 py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-3xl transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:-translate-y-2 active:translate-y-0 disabled:opacity-50 text-lg uppercase tracking-widest"
                >
                  {scanningEvents ? <Loader2 className="animate-spin" size={28} /> : <Search size={28} />}
                  Initiate Regional Scan
                </button>
              </header>

              {events.length === 0 ? (
                <div className="glass-panel p-32 rounded-[5rem] text-center flex flex-col items-center border-dashed border-4 border-white/5 bg-black/40 shadow-inner">
                  <div className="w-40 h-40 rounded-full bg-indigo-500/5 flex items-center justify-center mb-10 border border-white/5 shadow-[inset_0_2px_20px_rgba(79,70,229,0.1)]">
                    <MapPin size={80} className="text-indigo-500/10" />
                  </div>
                  <h3 className="text-4xl font-black text-white mb-6 tracking-tight uppercase italic">Intelligence Node Offline</h3>
                  <p className="text-gray-500 max-w-xl mx-auto leading-relaxed text-xl font-medium">Trigger a regional scan to identify SWaM-eligible events and procurement pathways in Northern Virginia and Chesterfield for Veye Media's 2026 growth cycle.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pb-40">
                  {events.map((event, idx) => (
                    <div key={idx} className="glass-panel p-12 rounded-[3.5rem] group border-l-[12px] border-l-indigo-600/30 hover:border-l-indigo-400 transition-all hover:bg-white/[0.04] shadow-2xl relative overflow-hidden backdrop-blur-xl">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-[100px] rounded-full -mr-24 -mt-24 group-hover:bg-indigo-500/10 transition-all duration-700" />
                      <div className="flex justify-between items-start mb-8 relative z-10">
                        <div className="flex items-center gap-3 text-[11px] text-indigo-400 font-black uppercase tracking-[0.3em] bg-indigo-500/10 px-5 py-2 rounded-full border border-indigo-500/20 shadow-lg">
                          <Calendar size={16} className="mb-0.5" /> {event.date}
                        </div>
                        <span className={`text-[11px] px-5 py-2 rounded-full font-black uppercase tracking-[0.2em] border-2 shadow-md ${
                          event.priority_level === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-green-500/10 text-green-500 border-green-500/30'
                        }`}>
                          {event.priority_level} Priority
                        </span>
                      </div>
                      <h4 className="text-4xl font-black text-white mb-4 group-hover:text-indigo-400 transition-colors leading-[1.05] tracking-tighter relative z-10 uppercase">{event.event_name}</h4>
                      <p className="text-xl text-gray-400 mb-10 flex items-center gap-3 font-black tracking-tight relative z-10">
                        <MapPin size={24} className="text-indigo-500" /> {event.location_city}, VA
                      </p>
                      <div className="bg-black/60 p-10 rounded-[2.5rem] mb-10 border border-white/5 backdrop-blur-sm shadow-[inset_0_4px_30px_rgba(0,0,0,0.5)] relative z-10 group/assessment hover:border-white/10 transition-colors">
                        <p className="text-[11px] text-indigo-400 font-black mb-6 uppercase tracking-[0.4em] font-mono border-b border-indigo-500/20 pb-4">Architect Assessment Node</p>
                        <p className="text-lg text-gray-200 italic leading-relaxed font-medium">"{event.strategic_reason}"</p>
                      </div>
                      <a 
                        href={event.source_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-4 text-lg text-blue-400 hover:text-blue-200 font-black group/link relative z-10 tracking-tight uppercase border-b border-blue-400/20 pb-1 transition-all"
                      >
                        Audit Regional Manifest <ExternalLink size={24} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Universal Footer */}
        <footer className="mt-auto py-12 flex flex-col items-center border-t border-white/5 bg-gradient-to-t from-blue-900/5 to-transparent">
          <div className="flex items-center gap-4 mb-3">
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
             <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em]">VSE Architectural Core</p>
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
          </div>
          <p className="text-xs text-gray-700 font-medium uppercase tracking-[0.1em]">copyright 2026 Veye Media</p>
        </footer>
      </main>

      {/* Global Status Bar */}
      <div className="fixed bottom-10 left-[300px] right-10 flex items-center justify-between pointer-events-none z-50">
        <div className="px-8 py-4 rounded-full glass-panel border border-white/10 flex items-center gap-6 text-xs font-mono shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl pointer-events-auto animate-in slide-in-from-bottom-8 duration-1000">
          <div className={`w-4 h-4 rounded-full animate-pulse ${
            selectedMode === 'growth' ? 'bg-blue-500 shadow-[0_0_20px_#3b82f6]' : 
            selectedMode === 'seo' ? 'bg-purple-500 shadow-[0_0_20px_#8b5cf6]' : 'bg-emerald-500 shadow-[0_0_20px_#10b981]'
          }`} />
          <div className="flex flex-col">
            <span className="text-gray-500 uppercase tracking-[0.3em] text-[10px] font-black">Architecture Protocol</span>
            <span className="text-white font-black tracking-tighter text-lg uppercase leading-none">{selectedMode} Master Engine</span>
          </div>
          <div className="h-10 w-px bg-white/10 mx-2" />
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
               <span className="text-blue-500 font-black text-[10px] uppercase tracking-[0.3em]">Master Node</span>
               <span className="text-blue-300 font-black text-sm tracking-tight">ACTIVE 1.2</span>
            </div>
            <ShieldCheck size={24} className="text-blue-500" />
          </div>
        </div>

        {/* Global Action Hub */}
        <div className="flex items-center gap-6 pointer-events-auto">
          <div className="glass-panel px-6 py-4 rounded-3xl border border-white/5 flex items-center gap-6 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-8 duration-1000 delay-200">
             <div className="flex flex-col items-end">
               <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Victor's Regional Focus</p>
               <div className="flex gap-2">
                 <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-black border border-blue-500/20 shadow-sm uppercase">Chesterfield</span>
                 <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-black border border-indigo-500/20 shadow-sm uppercase">NoVA</span>
               </div>
             </div>
             <button 
              onClick={() => setActiveTab('dashboard')}
              className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_40px_rgba(59,130,246,0.6)] hover:scale-110 transition-all active:scale-95 group border-2 border-white/20 relative overflow-hidden"
              title="Return to Master Architect"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
              <PlusCircle size={36} className="group-hover:rotate-90 transition-transform duration-700 relative z-10 shadow-lg" />
              <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg animate-ping" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
          letter-spacing: -0.01em;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.01);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.3);
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .glow-accent {
          box-shadow: 0 0 50px rgba(59, 130, 246, 0.1);
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  onClick: () => void; 
}> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-5 px-6 py-5 rounded-3xl transition-all group relative overflow-hidden mb-2 ${
      active ? 'bg-white/5 text-white border border-white/10 shadow-2xl' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
    }`}
  >
    {active && <div className="absolute left-0 w-2 h-1/2 bg-blue-500 rounded-r-full shadow-[0_0_15px_#3b82f6]" />}
    <span className={`${active ? 'text-blue-400' : 'text-gray-600 group-hover:text-gray-400'} transition-all duration-300 scale-110`}>{icon}</span>
    <span className="font-black text-sm tracking-widest uppercase text-nowrap">{label}</span>
  </button>
);

const StatCard: React.FC<{ title: string; value: string; sub: string; icon: React.ReactNode }> = ({ title, value, sub, icon }) => (
  <div className="glass-panel p-10 rounded-[3rem] border border-white/5 group hover:border-blue-500/30 transition-all hover:bg-white/[0.03] shadow-2xl relative overflow-hidden">
    <div className="flex justify-between items-start mb-8 relative z-10">
      <div className="p-4 bg-white/5 rounded-[1.25rem] border border-white/5 group-hover:bg-blue-600/10 group-hover:border-blue-500/20 transition-all shadow-inner">{icon}</div>
      <p className="text-[11px] text-gray-500 font-mono uppercase tracking-[0.3em] font-black text-nowrap group-hover:text-blue-400 transition-colors">{title}</p>
    </div>
    <p className="text-5xl font-black text-white mb-3 tracking-tighter leading-none text-nowrap group-hover:scale-105 transition-transform origin-left">{value}</p>
    <p className="text-sm text-gray-500 font-black uppercase tracking-[0.1em] text-nowrap">{sub}</p>
    <div className="absolute -bottom-10 -right-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity rotate-12">
      {React.cloneElement(icon as React.ReactElement, { size: 150 })}
    </div>
  </div>
);

export default App;
