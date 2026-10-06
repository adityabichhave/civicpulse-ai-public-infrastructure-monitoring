export type IncidentCategory =
  | 'roadways'
  | 'drainage'
  | 'lighting'
  | 'bridges_structures'
  | 'sidewalks'
  | 'water_mains'
  | 'traffic_signals';

export type IncidentPriority = 'critical' | 'high' | 'medium' | 'low';

export type IncidentStatus =
  | 'reported'
  | 'triaged'
  | 'dispatched'
  | 'in_progress'
  | 'resolved';

export type IncidentSector =
  | 'Downtown Core'
  | 'Riverfront District'
  | 'North Hills'
  | 'South Hub'
  | 'West Industrial';

export interface WorkNote {
  id: string;
  author: string;
  role: 'dispatcher' | 'technician' | 'ai_system' | 'citizen';
  timestamp: string;
  text: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
}

export interface AssignedCrew {
  id: string;
  name: string;
  lead: string;
  vehicle: string;
  phone: string;
  specialty: string;
}

export interface Incident {
  id: string;
  title: string;
  defectName: string;
  category: IncidentCategory;
  priority: IncidentPriority;
  severity: 1 | 2 | 3 | 4 | 5;
  status: IncidentStatus;
  riskScore: number; // 0 - 100
  hazardSummary: string;
  locationName: string;
  sector: IncidentSector;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  completionProofUrl?: string;
  reportedAt: string;
  updatedAt: string;
  reporterType: 'citizen' | 'field_technician' | 'iot_sensor' | 'patrol';
  reporterName?: string;
  recommendedDepartment: string;
  slaHours: number;
  slaDeadline: string;
  requiredEquipment: string[];
  checklist: ChecklistItem[];
  workNotes: WorkNote[];
  syncStatus: 'synced' | 'pending_sync';
  environmentalImpact?: string;
  confidence?: number;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  severity: 'critical' | 'high' | 'info' | 'success';
  incidentId?: string;
  read: boolean;
}

export interface FieldCrew {
  id: string;
  name: string;
  specialty: string;
  lead: string;
  vehicle: string;
  phone: string;
  latitude: number;
  longitude: number;
  status: 'available' | 'on_mission' | 'offline';
  assignedIncidentId?: string;
}

export interface AIAnalysisResult {
  defectName: string;
  category: IncidentCategory;
  severity: 1 | 2 | 3 | 4 | 5;
  priority: IncidentPriority;
  riskScore: number;
  hazardSummary: string;
  recommendedDepartment: string;
  estimatedSlaHours: number;
  requiredEquipment: string[];
  fieldTechnicianChecklist: string[];
  environmentalImpact?: string;
  confidence?: number;
}
