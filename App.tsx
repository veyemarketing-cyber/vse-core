import React, { useState, useMemo } from 'react';
import veyeLogo from './assets/logo/VSE-Logo-2026-.png';
import {
  ShieldCheck,
  Zap,
  Loader2,
  Activity,
  Terminal,
  History,
  GitMerge,
  Eye,
  Clock,
  PlusCircle,
  ShieldAlert,
} from 'lucide-react';
import { Download } from 'lucide-react';
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';
import ExcelJS from 'exceljs';

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

type VSESignal = {
  type: string;
  severity: string;
  narrative: string;
  recommended_action?: string;
};

type VSEAction = {
  action_type: string;
  target_system: string;
  scope?: string;
  from?: string;
  to?: string;
  reason: string;
};

type VSEResult = {
  status: string;
  mode: 'simulate' | 'live';
  app_mode?: 'demo' | 'internal' | 'live';
  input: string;
  market: string;
  insight: string | null;
  combined_score: number | null;
  market_context: {
    location?: string;
    seo_topic?: string;
    seo_visibility_score?: number;
    paid_spend_on_topic?: number;
    paid_spend_on_other_terms?: number;
    opportunities_created?: number;
    opportunities_from_seo_topic?: number;
    pipeline_value_from_seo_topic?: number;
  };
  signals: VSESignal[];
  actions: VSEAction[];
};

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
    title: 'Analysis complete — governed autonomy in observation mode.',
    body: `The VSE evaluated CRM pipeline, SEO visibility, paid media efficiency, competitor intelligence, and market demand for this market.
Signals show performance variance but all remain inside defined governance thresholds.
No paid segments crossed the “spend with zero pipeline” threshold.
No SEO topic produced enough CRM-backed demand to justify a governed budget shift.
Result: no autonomous execution was triggered in this cycle.
The engine continues monitoring and learning from live signals, ready to act when thresholds are exceeded.`
  },
  simulate: {
    title: 'Analysis complete — simulated budget reallocation path prepared.',
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
    title: 'Analysis complete — governed budget adjustments executed.',
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

function getDoneListState(actions: VSEAction[], mode: 'simulate' | 'live'): DoneListState {
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
  const [vseResult, setVseResult] = useState<VSEResult | null>(null);
  const [selectedArchive, setSelectedArchive] = useState<SavedReport | null>(null);
  const [registryUnlocked, setRegistryUnlocked] = useState(false);

  const dailyScripture = useMemo(() => {
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return SCRIPTURES[dayOfYear % SCRIPTURES.length];
  }, []);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const commandTime = new Date().toLocaleTimeString('en-US', {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const newEntry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: commandTime,
      message,
      type
    };

    setStatusLog((prev) => [newEntry, ...prev].slice(0, 50));
  };

  const handleRegistryUnlock = () => {
    if (registryUnlocked) {
      setActiveTab('registry');
      return;
    }
    const pw = prompt('ENTER GOVERNANCE PASSCODE:');
    if (pw === 'architect') {
      setRegistryUnlocked(true);
      setActiveTab('registry');
    }
  };

  const handleNewOrchestration = () => {
    const lastAction = statusLog.find((log) => log.type === 'action');
    if (lastAction && syncInput && !selectedArchive) {
      setSavedReports((prev) => [
        {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: lastAction.timestamp,
          input: syncInput,
          report: lastAction.message
        },
        ...prev
      ]);
    }
    setSyncInput('');
    setStatusLog([]);
    setSelectedArchive(null);
    setVseResult(null);
    setActiveTab('clarity');
  };

  const handleOrchestration = async () => {
    if (!syncInput.trim() || loading) return;

    setLoading(true);
    setStatusLog([]);
    setSelectedArchive(null);
    setVseResult(null);

    addLog('CLARITY CORE: Engaging strategic synthesis...', 'info');

    setTimeout(() => {
      addLog('ORCHESTRATOR: Validating strategic intent...', 'governance');
    }, 700);

    setTimeout(() => {
      addLog('DATA LOOM: Knowledge threads synthesized.', 'info');
    }, 1400);

    try {
      const res = await fetch('/api/main', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: syncInput })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'VSE endpoint returned an error');

      setVseResult(data);

      setTimeout(() => {
        addLog('THE CONDUCTOR: Command execution confirmed.', 'system');

        if (Array.isArray(data?.actions) && data.actions.length > 0) {
          addLog('ACTUATOR: Governed action path generated for review.', 'action');
        } else {
          addLog('ACTUATOR: Analysis complete. No governed action required in this cycle.', 'action');
        }

        setLoading(false);
        setActiveTab('actuator');
      }, 2200);
    } catch (err: any) {
      addLog(`SYSTEM ERROR: ${err?.message || 'Unable to reach VSE endpoint.'}`, 'system');
      setLoading(false);
    }
  };

  const makeSafeFileName = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
  };

  const triggerBrowserDownload = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadWord = async () => {
    if (!vseResult) {
      addLog('EXPORT: No Actuator result available for Word export.', 'system');
      return;
    }

    try {
      const actions = vseResult.actions || [];
      const mode: 'simulate' | 'live' = vseResult.mode === 'live' ? 'live' : 'simulate';
      const state = getDoneListState(actions, mode);
      const content = DONE_LIST_CONTENT[state];
      const market = vseResult.market || 'Unknown Market';
      const appMode = (vseResult.app_mode || 'demo').toUpperCase();
      const marketContext = vseResult.market_context || {};

      const actionParagraphs =
        actions.length > 0
          ? actions.flatMap((action, index) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 1}. ${action.action_type || 'Proposed Action'}`,
                    bold: true
                  })
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun(`Target System: ${action.target_system || 'N/A'}`)
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun(`Reason: ${action.reason || 'No rationale provided.'}`)
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun(
                    `Scope: ${action.scope || 'N/A'} | From: ${action.from || 'N/A'} | To: ${action.to || 'N/A'}`
                  )
                ]
              }),
              new Paragraph({ text: '' })
            ])
          : [new Paragraph('No governed action items were generated in this cycle.')];

      const signalParagraphs =
        Array.isArray(vseResult.signals) && vseResult.signals.length > 0
          ? vseResult.signals.flatMap((signal, index) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${index + 1}. ${signal.type || 'Signal'} (${signal.severity || 'N/A'})`,
                    bold: true
                  })
                ]
              }),
              new Paragraph(signal.narrative || 'No narrative provided.'),
              new Paragraph(`Recommended Action: ${signal.recommended_action || 'N/A'}`),
              new Paragraph({ text: '' })
            ])
          : [new Paragraph('No structured signals were returned for this cycle.')];

      const doc = new Document({
        sections: [
          {
            children: [
              new Paragraph({
                text: 'Velocity Sync Engine Actuator Export',
                heading: HeadingLevel.TITLE
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Market: `, bold: true }),
                  new TextRun(market)
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Execution Mode: `, bold: true }),
                  new TextRun(mode.toUpperCase())
                ]
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `App Mode: `, bold: true }),
                  new TextRun(appMode)
                ]
              }),
              new Paragraph({ text: '' }),

              new Paragraph({
                text: 'Done List Summary',
                heading: HeadingLevel.HEADING_1
              }),
              new Paragraph({
                children: [new TextRun({ text: content.title, bold: true })]
              }),
              ...content.body.split('\n').map((line) => new Paragraph(line)),
              new Paragraph({ text: '' }),

              new Paragraph({
                text: 'Live Decision Context',
                heading: HeadingLevel.HEADING_1
              }),
              new Paragraph(`SEO Topic: ${marketContext.seo_topic || 'N/A'}`),
              new Paragraph(`SEO Visibility Score: ${marketContext.seo_visibility_score ?? 'N/A'}`),
              new Paragraph(`Paid Spend on Topic: ${marketContext.paid_spend_on_topic ?? 'N/A'}`),
              new Paragraph(`Paid Spend on Other Terms: ${marketContext.paid_spend_on_other_terms ?? 'N/A'}`),
              new Paragraph(`Opportunities Created: ${marketContext.opportunities_created ?? 'N/A'}`),
              new Paragraph(`Opportunities from SEO Topic: ${marketContext.opportunities_from_seo_topic ?? 'N/A'}`),
              new Paragraph(`Pipeline Value from SEO Topic: ${marketContext.pipeline_value_from_seo_topic ?? 'N/A'}`),
              new Paragraph({ text: '' }),

              new Paragraph({
                text: 'Proposed Action Path',
                heading: HeadingLevel.HEADING_1
              }),
              ...actionParagraphs,

              new Paragraph({
                text: 'Signals',
                heading: HeadingLevel.HEADING_1
              }),
              ...signalParagraphs
            ]
          }
        ]
      });

      const blob = await Packer.toBlob(doc);
      const stamp = new Date().toISOString().slice(0, 10);
      triggerBrowserDownload(blob, `vse-actuator-${makeSafeFileName(market)}-${stamp}.docx`);
      addLog('EXPORT: Word document downloaded successfully.', 'action');
    } catch (err: any) {
      addLog(`EXPORT ERROR: ${err?.message || 'Word export failed.'}`, 'system');
    }
  };

  const handleDownloadExcel = async () => {
    if (!vseResult) {
      addLog('EXPORT: No Actuator result available for Excel export.', 'system');
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Velocity Sync Engine';
      workbook.created = new Date();

      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.columns = [
        { header: 'Field', key: 'field', width: 32 },
        { header: 'Value', key: 'value', width: 48 }
      ];

      const actions = vseResult.actions || [];
      const mode: 'simulate' | 'live' = vseResult.mode === 'live' ? 'live' : 'simulate';
      const state = getDoneListState(actions, mode);
      const content = DONE_LIST_CONTENT[state];
      const marketContext = vseResult.market_context || {};

      summarySheet.addRows([
        { field: 'Status', value: vseResult.status || 'N/A' },
        { field: 'Mode', value: vseResult.mode || 'N/A' },
        { field: 'App Mode', value: vseResult.app_mode || 'demo' },
        { field: 'Market', value: vseResult.market || 'Unknown' },
        { field: 'Insight', value: vseResult.insight || 'N/A' },
        { field: 'Combined Score', value: vseResult.combined_score ?? 'N/A' },
        { field: 'Done List Title', value: content.title },
        { field: 'Done List Body', value: content.body },
        { field: 'SEO Topic', value: marketContext.seo_topic || 'N/A' },
        { field: 'SEO Visibility Score', value: marketContext.seo_visibility_score ?? 'N/A' },
        { field: 'Paid Spend on Topic', value: marketContext.paid_spend_on_topic ?? 'N/A' },
        { field: 'Paid Spend on Other Terms', value: marketContext.paid_spend_on_other_terms ?? 'N/A' },
        { field: 'Opportunities Created', value: marketContext.opportunities_created ?? 'N/A' },
        { field: 'Opportunities from SEO Topic', value: marketContext.opportunities_from_seo_topic ?? 'N/A' },
        { field: 'Pipeline Value from SEO Topic', value: marketContext.pipeline_value_from_seo_topic ?? 'N/A' }
      ]);

      const actionsSheet = workbook.addWorksheet('Actions');
      actionsSheet.columns = [
        { header: 'Action Type', key: 'action_type', width: 24 },
        { header: 'Target System', key: 'target_system', width: 24 },
        { header: 'Scope', key: 'scope', width: 20 },
        { header: 'From', key: 'from', width: 16 },
        { header: 'To', key: 'to', width: 16 },
        { header: 'Reason', key: 'reason', width: 64 }
      ];

      if (Array.isArray(vseResult.actions) && vseResult.actions.length > 0) {
        vseResult.actions.forEach((action) => {
          actionsSheet.addRow({
            action_type: action.action_type || 'N/A',
            target_system: action.target_system || 'N/A',
            scope: action.scope || 'N/A',
            from: action.from || 'N/A',
            to: action.to || 'N/A',
            reason: action.reason || 'No rationale provided.'
          });
        });
      } else {
        actionsSheet.addRow({
          action_type: 'No Actions',
          target_system: 'N/A',
          scope: 'N/A',
          from: 'N/A',
          to: 'N/A',
          reason: 'No governed action items were generated in this cycle.'
        });
      }

      const signalsSheet = workbook.addWorksheet('Signals');
      signalsSheet.columns = [
        { header: 'Type', key: 'type', width: 24 },
        { header: 'Severity', key: 'severity', width: 16 },
        { header: 'Narrative', key: 'narrative', width: 70 },
        { header: 'Recommended Action', key: 'recommended_action', width: 40 }
      ];

      if (Array.isArray(vseResult.signals) && vseResult.signals.length > 0) {
        vseResult.signals.forEach((signal) => {
          signalsSheet.addRow({
            type: signal.type || 'N/A',
            severity: signal.severity || 'N/A',
            narrative: signal.narrative || 'No narrative provided.',
            recommended_action: signal.recommended_action || 'N/A'
          });
        });
      } else {
        signalsSheet.addRow({
          type: 'No Signals',
          severity: 'N/A',
          narrative: 'No structured signals were returned for this cycle.',
          recommended_action: 'N/A'
        });
      }

      [summarySheet, actionsSheet, signalsSheet].forEach((sheet) => {
        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF2563EB' }
        };
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const stamp = new Date().toISOString().slice(0, 10);
      triggerBrowserDownload(blob, `vse-actuator-${makeSafeFileName(vseResult.market || 'market')}-${stamp}.xlsx`);
      addLog('EXPORT: Excel workbook downloaded successfully.', 'action');
    } catch (err: any) {
      addLog(`EXPORT ERROR: ${err?.message || 'Excel export failed.'}`, 'system');
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-gray-200 font-inter">
      {/* Sidebar: desktop only */}
      <aside className="hidden lg:flex w-80 border-r border-white/10 flex-col glass-panel shrink-0">
        <div className="p-5 flex flex-col h-full overflow-hidden">
          <div className="flex flex-col gap-2 mb-8">
            <div className="shrink-0 flex items-center justify-start">
              <img
                src={veyeLogo}
                alt="Velocity Sync Engine logo"
                className="w-[200px] h-[69px] object-contain"
              />
            </div>
            <p className="text-[9px] text-blue-400 font-mono tracking-[0.35em] uppercase">
              The Engine of Silo Synthesis
            </p>
          </div>

          <button
            onClick={handleNewOrchestration}
            className="w-full flex items-center justify-center gap-2 py-3 mb-6 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400 font-black text-[10px] uppercase tracking-widest transition-all shadow-glow"
          >
            <PlusCircle size={16} /> New Orchestration
          </button>

          <div className="flex-none">
            <p className="px-4 py-1 text-[9px] font-black text-blue-500/50 uppercase tracking-[0.3em] mb-2">
              System Hierarchy
            </p>

            <nav className="space-y-0.5">
              <SidebarItem
                icon={<Eye size={18} />}
                label="Clarity Core"
                description="The Interface: Agentic AI providing absolute business clarity."
                active={activeTab === 'clarity'}
                onClick={() => {
                  setActiveTab('clarity');
                  setSelectedArchive(null);
                }}
              />
              <SidebarItem
                icon={<Activity size={18} />}
                label="Velocity Sync"
                description="The Foundation: Secure infrastructure bridging disparate platforms."
                active={activeTab === 'sync'}
                onClick={() => setActiveTab('sync')}
              />
              <SidebarItem
                icon={<ShieldCheck size={18} />}
                label="Orchestrator"
                description="The Strategy: Governance layer containing business logic."
                active={activeTab === 'orchestrator'}
                onClick={() => setActiveTab('orchestrator')}
              />
              <SidebarItem
                icon={<Clock size={18} />}
                label="The Conductor"
                description="The Execution: Real-time synchronization for data handshakes."
                active={activeTab === 'conductor'}
                onClick={() => setActiveTab('conductor')}
              />
              <SidebarItem
                icon={<GitMerge size={18} />}
                label="Data Loom"
                description="The Synthesis: Weaving siloed threads into a unified tapestry."
                active={activeTab === 'loom'}
                onClick={() => setActiveTab('loom')}
              />
              <SidebarItem
                icon={<Zap size={18} />}
                label="The Actuator"
                description="Autonomous Action: Adjusting bids, budgets, and campaigns."
                active={activeTab === 'actuator'}
                onClick={() => {
                  setActiveTab('actuator');
                  setSelectedArchive(null);
                }}
              />
              <SidebarItem
                icon={<ShieldAlert size={18} />}
                label="VSE Registry"
                description="Security Vault: Private directory of handshake protocols."
                active={activeTab === 'registry'}
                onClick={handleRegistryUnlock}
              />
            </nav>
          </div>

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
                savedReports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => {
                      setSelectedArchive(report);
                      setActiveTab('actuator');
                    }}
                    className="w-full text-left px-4 py-3 rounded-lg hover:bg-white/5 border border-white/5 transition-all bg-white/[0.01] group"
                  >
                    <p className="text-[9px] font-mono text-blue-500 font-bold mb-1 opacity-70">
                      {report.timestamp} EST
                    </p>
                    <p className="text-xs text-gray-400 truncate font-bold uppercase tracking-tight leading-none group-hover:text-white transition-colors">
                      "{report.input}"
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>

      <main className="w-full flex-1 overflow-y-auto p-4 sm:p-5 md:p-8 lg:p-10 relative flex flex-col bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent">
        {/* Mobile header with smaller logo */}
        <div className="lg:hidden flex items-center justify-between mb-4 px-1">
          <img
            src={veyeLogo}
            alt="Velocity Sync Engine logo"
            className="w-[110px] h-auto object-contain"
          />
          <div className="text-right">
            <p className="text-[10px] text-blue-400 font-mono tracking-[0.2em] uppercase">
              VSE Mobile
            </p>
            <p className="text-[9px] text-white/50 uppercase tracking-[0.15em]">
              Input + Actuator
            </p>
          </div>
        </div>

        {/* Mobile: Master Input + Done List stack */}
        <div className="lg:hidden space-y-4 mb-4">
          <div className={`p-5 h-[360px] flex flex-col ${loading ? 'vse-panel vse-panel--processing' : 'vse-panel'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                <Terminal size={20} />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight leading-none">
                Master Input Node
              </h3>
            </div>

            <textarea
              className="w-full flex-1 bg-black/40 border border-white/5 rounded-2xl p-4 outline-none text-sm leading-relaxed resize-none shadow-inner"
              placeholder="What do you want to know?"
              value={syncInput}
              onChange={(e) => setSyncInput(e.target.value)}
            />

            <button
              onClick={handleOrchestration}
              disabled={loading || !syncInput}
              className="mt-4 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl uppercase tracking-tight transition-all shadow-glow text-sm"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Orchestrate Architecture'}
            </button>
          </div>

          <div className={`p-5 ${loading ? 'vse-panel vse-panel--processing' : 'vse-panel'}`}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <h2 className="text-lg font-black text-white tracking-tighter uppercase">
                The Done List
              </h2>

              {!selectedArchive && vseResult && (
                <div className="flex flex-col items-end gap-2">
                  <span className="mode-pill">
                    {(vseResult.app_mode || 'demo').toUpperCase()} MODE
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownloadWord}
                      className="export-btn export-btn--primary"
                    >
                      <Download size={14} />
                      <span>Word</span>
                    </button>
                    <button
                      onClick={handleDownloadExcel}
                      className="export-btn export-btn--secondary"
                    >
                      <Download size={14} />
                      <span>Excel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-black/60 p-5 rounded-[1.5rem] border border-white/10 shadow-inner">
              {selectedArchive ? (
                <p className="text-sm text-gray-100 leading-relaxed font-semibold">
                  {selectedArchive.report}
                </p>
              ) : !vseResult ? (
                <p className="text-sm text-gray-100 leading-relaxed font-semibold">
                  Awaiting Strategic Signal...
                </p>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const actions = vseResult.actions || [];
                    const mode: 'simulate' | 'live' =
                      vseResult?.mode === 'live' ? 'live' : 'simulate';
                    const state = getDoneListState(actions, mode);
                    const content = DONE_LIST_CONTENT[state];

                    return (
                      <>
                        <h3 className="text-base font-black text-white tracking-tight">
                          {content.title}
                        </h3>
                        <p className="text-sm text-gray-100 leading-relaxed whitespace-pre-line">
                          {content.body}
                        </p>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop: Clarity view (hero + input + feed) */}
        <div className="hidden lg:block">
          {activeTab === 'clarity' && (
            <div className="max-w-6xl mx-auto w-full space-y-8 md:space-y-12 animate-in fade-in duration-1000">
              <section className="hidden lg:block text-center glass-panel p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] border-blue-500/20 shadow-2xl glow-accent">
                <span
                  className={`px-4 md:px-5 py-2 bg-blue-600/10 text-blue-400 text-[10px] md:text-[11px] font-black uppercase tracking-[0.35em] md:tracking-[0.5em] rounded-full border border-blue-500/20 ${
                    loading ? 'animate-pulse-soft' : ''
                  }`}
                >
                  Active Autonomy Protocol
                </span>

                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter mt-6 md:mt-8 mb-2">
                  Good Morning Victor
                </h1>

                <h2 className="text-sm md:text-base font-bold text-blue-500 uppercase tracking-[0.2em] md:tracking-[0.25em] mb-6 md:mb-8 font-mono">
                  The Architects of Active Autonomy
                </h2>

                <div className="max-w-2xl mx-auto p-6 md:p-8 rounded-3xl bg-black/60 border border-white/5">
                  <p className="text-base md:text-lg text-gray-200 font-medium italic leading-relaxed">
                    "{dailyScripture.text}"
                  </p>
                  <p className="text-sm text-blue-500 font-black uppercase tracking-widest mt-4">
                    — {dailyScripture.ref}
                  </p>
                </div>
              </section>

              <div className="grid lg:grid-cols-12 gap-6 md:gap-8">
                <div
                  className={`lg:col-span-7 p-6 md:p-8 h-[460px] md:h-[500px] flex flex-col ${
                    loading ? 'vse-panel vse-panel--processing' : 'vse-panel'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-6 md:mb-8">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                      <Terminal size={24} />
                    </div>
                    <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tight leading-none">
                      Master Input Node
                    </h3>
                  </div>

                  <textarea
                    className="w-full flex-1 bg-black/40 border border-white/5 rounded-2xl p-4 md:p-6 outline-none text-base leading-relaxed resize-none shadow-inner"
                    placeholder="What do you want to know?"
                    value={syncInput}
                    onChange={(e) => setSyncInput(e.target.value)}
                  />

                  <button
                    onClick={handleOrchestration}
                    disabled={loading || !syncInput}
                    className="mt-6 md:mt-8 py-4 md:py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl uppercase tracking-tighter transition-all shadow-glow"
                  >
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Orchestrate Architecture'}
                  </button>
                </div>

                <div
                  className={`lg:col-span-5 p-6 md:p-8 h-[460px] md:h-[500px] flex flex-col overflow-hidden ${
                    loading ? 'vse-panel vse-panel--processing' : 'vse-panel'
                  }`}
                >
                  <h3 className="text-xs md:text-sm font-black text-white uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2">
                    <Activity size={18} className="text-blue-500" /> System Action Feed
                  </h3>

                  <div className="flex-1 overflow-y-auto space-y-2 md:space-y-3 font-mono text-[12px] md:text-[13px] custom-scrollbar pr-2">
                    {statusLog.map((log) => (
                      <ActionFeedItem key={log.id} log={log} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop: Actuator view */}
        <div className="hidden lg:block">
          {activeTab === 'actuator' && (
            <div className="max-w-5xl mx-auto w-full animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">
                    The Done List
                  </h2>
                </div>

                {!selectedArchive && vseResult && (
                  <div className="flex flex-col md:items-end gap-3">
                    <span className="mode-pill">
                      {(vseResult.app_mode || 'demo').toUpperCase()} MODE
                    </span>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleDownloadWord}
                        className="export-btn export-btn--primary"
                      >
                        <Download size={16} />
                        <span>Download Word</span>
                      </button>

                      <button
                        onClick={handleDownloadExcel}
                        className="export-btn export-btn--secondary"
                      >
                        <Download size={16} />
                        <span>Download Excel</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div
                className={`p-6 md:p-8 relative overflow-hidden ${
                  loading ? 'vse-panel vse-panel--processing' : 'vse-panel'
                }`}
              >
                <div className="bg-black/60 p-6 md:p-8 rounded-[1.75rem] border border-white/10 shadow-inner">
                  {(() => {
                    if (selectedArchive) {
                      return (
                        <p className="text-base md:text-lg text-gray-100 leading-relaxed font-semibold">
                          {selectedArchive.report}
                        </p>
                      );
                    }

                    if (!vseResult) {
                      return (
                        <p className="text-base md:text-lg text-gray-100 leading-relaxed font-semibold">
                          Awaiting Strategic Signal...
                        </p>
                      );
                    }

                    const actions = vseResult.actions || [];
                    const mode: 'simulate' | 'live' = vseResult?.mode === 'live' ? 'live' : 'simulate';
                    const state = getDoneListState(actions, mode);
                    const content = DONE_LIST_CONTENT[state];

                    return (
                      <div className="space-y-5">
                        <h3 className="text-lg md:text-xl font-black text-white tracking-tight">
                          {content.title}
                        </h3>

                        <p className="text-sm md:text-base text-gray-100 leading-relaxed whitespace-pre-line">
                          {content.body}
                        </p>

                        {vseResult.market_context && (
                          <div className="pt-6 border-t border-white/10">
                            <p className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-blue-400 font-black mb-4">
                              Live Decision Context
                            </p>

                            <div className="grid md:grid-cols-2 gap-3 text-sm">
                              <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                <p className="text-gray-500 uppercase text-[10px] tracking-widest mb-1">
                                  Market
                                </p>
                                <p className="text-white font-semibold">
                                  {vseResult.market || 'Unknown'}
                                </p>
                              </div>

                              <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                <p className="text-gray-500 uppercase text-[10px] tracking-widest mb-1">
                                  SEO Topic
                                </p>
                                <p className="text-white font-semibold">
                                  {vseResult.market_context.seo_topic || 'N/A'}
                                </p>
                              </div>

                              <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                <p className="text-gray-500 uppercase text-[10px] tracking-widest mb-1">
                                  SEO Visibility
                                </p>
                                <p className="text-white font-semibold">
                                  {vseResult.market_context.seo_visibility_score ?? 'N/A'}
                                </p>
                              </div>

                              <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                <p className="text-gray-500 uppercase text-[10px] tracking-widest mb-1">
                                  Pipeline Value
                                </p>
                                <p className="text-white font-semibold">
                                  {typeof vseResult.market_context.pipeline_value_from_seo_topic === 'number'
                                    ? `$${vseResult.market_context.pipeline_value_from_seo_topic.toLocaleString()}`
                                    : 'N/A'}
                                </p>
                              </div>

                              <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                <p className="text-gray-500 uppercase text-[10px] tracking-widest mb-1">
                                  Paid on Topic
                                </p>
                                <p className="text-white font-semibold">
                                  {typeof vseResult.market_context.paid_spend_on_topic === 'number'
                                    ? `$${vseResult.market_context.paid_spend_on_topic.toLocaleString()}`
                                    : 'N/A'}
                                </p>
                              </div>

                              <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                <p className="text-gray-500 uppercase text-[10px] tracking-widest mb-1">
                                  Paid on Other Terms
                                </p>
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
                            <p className="text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-blue-400 font-black mb-4">
                              Proposed Action Path
                            </p>

                            <div className="space-y-3">
                              {vseResult.actions.map((action: VSEAction, idx: number) => (
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
        </div>
      </main>

      <style>{`
        .glass-panel {
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .glow-accent {
          box-shadow: 0 0 80px rgba(59, 130, 246, 0.15);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.2);
          border-radius: 10px;
        }

        @keyframes pulse-soft {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }

        .animate-pulse-soft {
          animation: pulse-soft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes orchestrationPulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(59, 130, 246, 0);
          }
          50% {
            transform: scale(1.01);
            box-shadow: 0 0 32px rgba(59, 130, 246, 0.25);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 rgba(59, 130, 246, 0);
          }
        }

        .vse-panel {
          border-radius: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background:
            radial-gradient(circle at top left, rgba(59, 130, 246, 0.14), transparent 55%),
            rgba(10, 10, 10, 0.88);
          box-shadow:
            0 18px 45px rgba(0, 0, 0, 0.65),
            0 0 32px rgba(15, 118, 255, 0.22);
          backdrop-filter: blur(18px);
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease;
        }

        .vse-panel--processing {
          animation: orchestrationPulse 2s ease-in-out infinite;
        }

        .mode-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.55rem 0.9rem;
          border-radius: 999px;
          border: 1px solid rgba(59, 130, 246, 0.4);
          background: rgba(37, 99, 235, 0.12);
          color: #93c5fd;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          box-shadow: 0 0 18px rgba(59, 130, 246, 0.18);
        }

        .export-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          border-radius: 0.9rem;
          padding: 0.85rem 1rem;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          transition: all 180ms ease;
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .export-btn:hover {
          transform: translateY(-1px);
        }

        .export-btn--primary {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(59, 130, 246, 0.78));
          color: white;
          box-shadow:
            0 0 22px rgba(59, 130, 246, 0.45),
            0 0 42px rgba(59, 130, 246, 0.18);
        }

        .export-btn--primary:hover {
          background: linear-gradient(135deg, rgba(59, 130, 246, 1), rgba(96, 165, 250, 0.85));
          box-shadow:
            0 0 26px rgba(59, 130, 246, 0.55),
            0 0 50px rgba(59, 130, 246, 0.22);
        }

        .export-btn--secondary {
          background: rgba(255, 255, 255, 0.06);
          color: #dbeafe;
          border: 1px solid rgba(96, 165, 250, 0.28);
          box-shadow:
            0 0 18px rgba(59, 130, 246, 0.18),
            inset 0 0 0 1px rgba(255, 255, 255, 0.03);
        }

        .export-btn--secondary:hover {
          background: rgba(59, 130, 246, 0.12);
          box-shadow:
            0 0 24px rgba(59, 130, 246, 0.26),
            inset 0 0 0 1px rgba(147, 197, 253, 0.08);
        }
      `}</style>
    </div>
  );
};

/* =========================
    ACTION FEED ITEM
========================= */
const ActionFeedItem: React.FC<{ log: LogEntry }> = ({ log }) => {
  const [isHovered, setIsHovered] = useState(false);

  const descriptions: Record<LogEntry['type'], string> = {
    governance: 'Layer 2 Check: Ensuring command aligns with budget and safety guardrails.',
    system: 'Layer 3/4 Sync: Verifying internal handshake timing and infrastructure health.',
    info: 'Clarity Core Diagnostic: Processing strategic intent and data threads.',
    action: 'Layer 6 Actuation: Final execution signal sent to autonomous partners.'
  };

  return (
    <div
      className="relative p-4 rounded-xl border border-white/5 bg-white/5 text-gray-400 group cursor-help transition-all hover:bg-white/10"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <p className="text-[10px] opacity-40 mb-1 font-bold">
        {log.timestamp} EST [{log.type.toUpperCase()}]
      </p>

      <p className="font-semibold leading-relaxed">{log.message}</p>

      {isHovered && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 animate-in fade-in zoom-in-95 duration-150 pointer-events-none">
          <div className="p-3 bg-black border border-blue-500/40 rounded-lg shadow-2xl backdrop-blur-2xl">
            <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">
              Architectural Insight:
            </p>
            <p className="text-[11px] text-gray-200 font-medium leading-tight">
              {descriptions[log.type]}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================
    REFINED SIDEBAR ITEM
========================= */
const SidebarItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  description: string;
  active?: boolean;
  onClick: () => void;
}> = ({ icon, label, description, active, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
          active
            ? 'bg-blue-600/10 text-white border border-blue-500/20 shadow-lg'
            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
        }`}
      >
        <span className={active ? 'text-blue-500' : 'text-gray-600'}>{icon}</span>
        <span className="font-bold text-[10px] tracking-widest uppercase text-nowrap">
          {label}
        </span>
      </button>

      {isHovered && (
        <div className="absolute left-6 right-4 top-full z-50 animate-in fade-in slide-in-from-top-1 duration-200 pointer-events-none">
          <div className="p-2 bg-blue-900/90 backdrop-blur-xl border border-blue-500/30 rounded-lg shadow-2xl">
            <p className="text-[9px] text-blue-100 font-medium leading-tight">
              {description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;