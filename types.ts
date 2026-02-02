
export type OrchestrationMode = 'growth' | 'seo' | 'crm';

export interface SystemDiagnosis {
  signals: {
    technical?: string;
    content?: string;
    performance?: string;
    engagement?: string;
    lifecycle?: string;
    funnel?: string;
  };
  inefficiencies: string[];
}

export interface AgentArchitecture {
  agents: {
    id: string;
    name: string;
    role: string;
    description: string;
    dependencies: string[];
  }[];
}

export interface RoadmapStep {
  phase: string;
  items: string[];
  priority: 'High' | 'Medium' | 'Low';
}

export interface VirginiaEvent {
  event_name: string;
  date: string;
  location_city: string;
  priority_level: 'High' | 'Medium' | 'Low';
  source_url: string;
  strategic_reason: string;
}

export interface SyncResult {
  diagnosis: SystemDiagnosis;
  architecture: AgentArchitecture;
  roadmap: RoadmapStep[];
  metrics: {
    label: string;
    value: number;
    unit: string;
  }[];
  triggeredActions?: {
    name: string;
    args: any;
    id: string;
  }[];
}
