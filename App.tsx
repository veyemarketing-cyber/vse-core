import React, { useState, useMemo } from 'react';
import veyeLogo from './assets/logo/VSE-Logo-2026-.png';
import {
  ShieldCheck, Zap, Loader2, Activity, Terminal, History,
  GitMerge, Eye, Clock, PlusCircle, ShieldAlert, Download
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('clarity');
  const [syncInput, setSyncInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusLog, setStatusLog] = useState<any[]>([]);
  const [vseResult, setVseResult] = useState<any>(null);
  const [savedReports, setSavedReports] = useState<any[]>([]);

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setStatusLog(prev => [{ id: Math.random(), timestamp: time, message }, ...prev].slice(0, 15));
  };

  // CORE ARCHITECTURE RESET
  const handleNewOrchestration = () => {
    setSyncInput('');
    setVseResult(null);
    setStatusLog([]); // Clears the Action Feed
    setActiveTab('clarity');
  };

  const handleOrchestration = async () => {
    if (!syncInput.trim()) return;
    setLoading(true);
    addLog("ORCHESTRATOR: Engaging strategic synthesis...");
    try {
            const res = await fetch('https://womanlike-olive-barge.ngrok-free.dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: syncInput })
      });
      const data = await res.json();
      setVseResult(data);
      setSavedReports(prev => [{ id: Date.now(), input: syncInput, result: data }, ...prev]);
      addLog("ACTUATOR: Command execution confirmed.");
      setActiveTab('actuator');
    } catch (e) {
      addLog("SYSTEM ERROR: Failed to fetch backend at port 3000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#020202] text-gray-200 font-inter">
      <style>{`
        .vse-border { border: 2px solid rgba(59, 130, 246, 0.6); }
        .vse-panel { background: #0a0a0a; border-radius: 2rem; }
        .vse-sidebar-active { background: rgba(37, 99, 235, 0.3); border-left: 4px solid #3b82f6; color: white; }
        .vse-glow-blue { box-shadow: 0 0 20px rgba(37, 99, 235, 0.15); }
      `}</style>

      {/* Sidebar: Restored New Orchestration */}
      <aside className="w-80 flex flex-col bg-black border-r-2 border-blue-600 shrink-0">
        <div className="p-8 flex-1">
          <img src={veyeLogo} alt="VSE" className="w-[180px] mb-8" />
          
          <button 
            onClick={handleNewOrchestration}
            className="w-full flex items-center justify-center gap-2 py-4 mb-10 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg transition-all"
          >
            <PlusCircle size={16} /> New Orchestration
          </button>

          <nav className="space-y-1">
            {[
              { id: 'clarity', label: 'Clarity Core', icon: <Eye size={18} /> },
              { id: 'sync', label: 'Velocity Sync', icon: <Activity size={18} /> },
              { id: 'orchestrator', label: 'Orchestrator', icon: <ShieldCheck size={18} /> },
              { id: 'conductor', label: 'The Conductor', icon: <Clock size={18} /> },
              { id: 'loom', label: 'Data Loom', icon: <GitMerge size={18} /> },
              { id: 'actuator', label: 'The Actuator', icon: <Zap size={18} /> }
            ].map((item) => (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)} 
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === item.id ? 'vse-sidebar-active' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
          
          <div className="mt-10 pt-8 border-t border-white/10">
            <h4 className="text-[9px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2"><History size={14} /> History</h4>
            <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
              {savedReports.map(r => (
                <button key={r.id} onClick={() => {setVseResult(r.result); setActiveTab('actuator');}} className="w-full text-left p-2 bg-zinc-900 text-[9px] truncate opacity-60 rounded border border-white/5">{r.input}</button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-12 bg-black">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'clarity' && (
            <div className="space-y-12">
              <header className="text-center py-16 px-6 vse-panel vse-border vse-glow-blue">
                <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">Good Morning Victor</h1>
                <p className="text-blue-400 uppercase tracking-[0.4em] font-mono text-xs">Architect of Active Autonomy</p>
              </header>

              <div className="grid grid-cols-12 gap-10">
                <div className="col-span-7 p-10 vse-panel vse-border">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg"><Terminal size={22} /></div>
                    <h3 className="text-xl font-black uppercase text-white">Master Input Node</h3>
                  </div>
                  <textarea 
                    className="w-full h-64 bg-black border-2 border-white/10 rounded-2xl p-6 outline-none text-white text-lg focus:border-blue-500 transition-all resize-none shadow-inner" 
                    value={syncInput} 
                    onChange={(e) => setSyncInput(e.target.value)} 
                    placeholder="Enter Strategic Intent..." 
                  />
                  <button onClick={handleOrchestration} className="w-full mt-8 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl uppercase tracking-widest text-sm shadow-lg">
                    {loading ? "Synthesizing..." : "Orchestrate Architecture"}
                  </button>
                </div>

                <div className="col-span-5 p-10 vse-panel vse-border flex flex-col">
                  <h3 className="text-xs font-black text-white uppercase mb-8 flex items-center gap-3"><Activity size={18} className="text-blue-500" /> System Action Feed</h3>
                  <div className="space-y-4 font-mono text-[11px] flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    {statusLog.length > 0 ? statusLog.map(log => (
                      <div key={log.id} className="p-4 bg-zinc-900 border border-white/10 rounded-xl animate-in fade-in duration-300">
                        <p className="opacity-30 text-[9px] mb-1">{log.timestamp}</p>
                        <p className="font-bold uppercase text-gray-200 leading-tight">{log.message}</p>
                      </div>
                    )) : <div className="h-full flex items-center justify-center opacity-20 uppercase tracking-[0.3em] font-black">Awaiting Signal</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'actuator' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">The Done List</h2>
                <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-xl text-white font-black text-xs uppercase tracking-widest shadow-lg">
                  <Download size={16} /> Export Action Log
                </button>
              </div>
              <div className="p-16 vse-panel vse-border min-h-[500px] flex items-center">
                {vseResult ? (
                   <div className="w-full space-y-6">
                     <h3 className="text-3xl font-black text-white">{vseResult.market} Analysis</h3>
                     <p className="text-gray-300 text-2xl leading-relaxed border-l-8 border-blue-600 pl-10 whitespace-pre-line">{vseResult.insight}</p>
                   </div>
                ) : <div className="text-center w-full opacity-10 uppercase tracking-[0.5em] font-black text-3xl">Standby</div>}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;