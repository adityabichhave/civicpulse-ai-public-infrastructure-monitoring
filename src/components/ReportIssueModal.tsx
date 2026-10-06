import React, { useState, useRef } from 'react';
import { Incident, IncidentCategory, IncidentPriority, AIAnalysisResult } from '../types/infrastructure';
import { SAMPLE_PHOTOS } from '../data/mockIncidents';
import {
  Camera,
  Upload,
  Sparkles,
  MapPin,
  AlertTriangle,
  CheckCircle,
  X,
  Loader2,
  Wrench,
  Shield,
  Layers,
  FileText,
  Clock,
  Send,
  HelpCircle,
  Crosshair,
} from 'lucide-react';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newIncident: Partial<Incident>) => void;
  onRequestPinpointOnMap: () => void;
  pinnedLocation?: { lat: number; lng: number; locationName: string } | null;
  isOnline: boolean;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onRequestPinpointOnMap,
  pinnedLocation,
  isOnline,
}) => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Central District, Metropolitan Grid');
  const [latitude, setLatitude] = useState(37.778);
  const [longitude, setLongitude] = useState(-122.418);
  const [category, setCategory] = useState<IncidentCategory>('roadways');
  const [reporterName, setReporterName] = useState('Citizen Reporter');
  const [reporterType, setReporterType] = useState<'citizen' | 'field_technician'>('citizen');

  // AI analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync pinned location if updated from map
  React.useEffect(() => {
    if (pinnedLocation) {
      setLatitude(pinnedLocation.lat);
      setLongitude(pinnedLocation.lng);
      setLocationName(pinnedLocation.locationName);
    }
  }, [pinnedLocation]);

  if (!isOpen) return null;

  // Handle image upload from file or camera
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setAiAnalysis(null);
    };
    reader.readAsDataURL(file);
  };

  // Preset sample photo selector for instant testing
  const handleSelectSample = (sampleKey: keyof typeof SAMPLE_PHOTOS, name: string, cat: IncidentCategory) => {
    setPhotoPreview(SAMPLE_PHOTOS[sampleKey]);
    setDescription(name);
    setCategory(cat);
    setAiAnalysis(null);
    setAnalysisError(null);
  };

  // Run Gemini AI Analysis
  const handleRunAiAnalysis = async () => {
    if (!photoPreview && !description.trim()) {
      setAnalysisError('Please provide either an infrastructure photo or a short description.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/analyze-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: photoPreview,
          description: description || 'Visual infrastructure defect assessment required',
          locationName,
          latitude,
          longitude,
          categoryHint: category,
        }),
      });

      const data = await response.json();
      if (data.analysis) {
        setAiAnalysis(data.analysis);
        if (data.analysis.category) {
          setCategory(data.analysis.category);
        }
      } else {
        throw new Error('Analysis payload incomplete');
      }
    } catch (err: any) {
      console.error('AI Analysis failed:', err);
      setAnalysisError('AI analysis encountered an error. You may still submit this report manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const title = aiAnalysis?.defectName || description || 'Reported Infrastructure Defect';
    const finalSeverity = aiAnalysis?.severity || (category === 'water_mains' || category === 'bridges_structures' ? 4 : 3);
    const finalPriority = aiAnalysis?.priority || (finalSeverity >= 4 ? 'high' : 'medium');
    const finalRisk = aiAnalysis?.riskScore || (finalSeverity * 18);
    const finalDept = aiAnalysis?.recommendedDepartment || 'Municipal Public Works';
    const sla = aiAnalysis?.estimatedSlaHours || (finalPriority === 'critical' ? 4 : finalPriority === 'high' ? 24 : 72);

    const checklistItems = (aiAnalysis?.fieldTechnicianChecklist || [
      'Establish traffic control safety perimeter',
      'Inspect structural defect depth and surrounding integrity',
      'Deploy rapid remediation crew and standard materials',
      'Capture post-repair telemetry photograph and close work order',
    ]).map((text, idx) => ({
      id: `chk-new-${idx}`,
      text,
      completed: false,
    }));

    onSubmit({
      title,
      defectName: aiAnalysis?.defectName || title,
      category,
      severity: finalSeverity as any,
      priority: finalPriority as any,
      riskScore: finalRisk,
      hazardSummary: aiAnalysis?.hazardSummary || 'Reported by municipal user for priority scheduling and remediation.',
      locationName,
      sector: determineSector(latitude, longitude),
      latitude,
      longitude,
      imageUrl: photoPreview || undefined,
      reporterType,
      reporterName,
      recommendedDepartment: finalDept,
      slaHours: sla,
      slaDeadline: new Date(Date.now() + sla * 3600 * 1000).toISOString(),
      requiredEquipment: aiAnalysis?.requiredEquipment || ['Standard Municipal Repair Van', 'Safety Cones & Barriers'],
      checklist: checklistItems,
      workNotes: [
        {
          id: `wn-${Date.now()}`,
          author: 'CivicPulse Triage Engine',
          role: 'ai_system',
          timestamp: 'Just now',
          text: aiAnalysis
            ? `Gemini AI Triaged: Identified as ${aiAnalysis.defectName} (Severity ${aiAnalysis.severity}/5). Target SLA: ${sla}h.`
            : `Logged into municipal dispatch queue. Initial category: ${category}.`,
        },
      ],
      environmentalImpact: aiAnalysis?.environmentalImpact,
      confidence: aiAnalysis?.confidence || 0.94,
    });

    onClose();
  };

  const determineSector = (lat: number, lng: number): any => {
    if (lat > 37.785) return 'North Hills';
    if (lat < 37.76) return 'South Hub';
    if (lng > -122.405) return 'Riverfront District';
    if (lng < -122.43) return 'West Industrial';
    return 'Downtown Core';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Report Public Infrastructure Defect
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>Automated Gemini AI Classification</span>
              <span aria-hidden="true">·</span>
              <span>GPS Geocoded</span>
              {!isOnline && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-500 font-medium">Offline Queue Enabled</span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Quick Scenario Fillers */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Test with Instant Field Scenarios:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleSelectSample('pothole', 'Deep asphalt pothole on arterial road', 'roadways')}
                className="px-2.5 py-1.5 text-xs text-left bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-400 border border-transparent rounded-lg transition-colors text-slate-700 dark:text-slate-300"
              >
                <div className="font-semibold text-slate-900 dark:text-white">Deep Pothole</div>
                <div className="text-[11px] text-slate-500">4th Ave Arterial</div>
              </button>
              <button
                type="button"
                onClick={() => handleSelectSample('drain', 'Catch basin blocked with silt and storm backflow', 'drainage')}
                className="px-2.5 py-1.5 text-xs text-left bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-400 border border-transparent rounded-lg transition-colors text-slate-700 dark:text-slate-300"
              >
                <div className="font-semibold text-slate-900 dark:text-white">Flooded Drain</div>
                <div className="text-[11px] text-slate-500">Riverside Culvert</div>
              </button>
              <button
                type="button"
                onClick={() => handleSelectSample('streetlight', 'Dark luminaire mast with sheared electrical base', 'lighting')}
                className="px-2.5 py-1.5 text-xs text-left bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-400 border border-transparent rounded-lg transition-colors text-slate-700 dark:text-slate-300"
              >
                <div className="font-semibold text-slate-900 dark:text-white">Broken Streetlight</div>
                <div className="text-[11px] text-slate-500">Oak Ave Pole #402</div>
              </button>
              <button
                type="button"
                onClick={() => handleSelectSample('sidewalk', 'Concrete pavement slab heaved 5cm by tree roots', 'sidewalks')}
                className="px-2.5 py-1.5 text-xs text-left bg-slate-100 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-400 border border-transparent rounded-lg transition-colors text-slate-700 dark:text-slate-300"
              >
                <div className="font-semibold text-slate-900 dark:text-white">Heaved Sidewalk</div>
                <div className="text-[11px] text-slate-500">Birch Walk Trail</div>
              </button>
            </div>
          </div>

          {/* Photo Upload Area */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Incident Photo / Visual Evidence
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {photoPreview ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 max-h-56 flex items-center justify-center">
                <img
                  src={photoPreview}
                  alt="Incident evidence"
                  className="w-full h-48 object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                    setAiAnalysis(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-[11px] text-white font-mono rounded">
                  EVIDENCE ATTACHED
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/50"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Camera className="w-6 h-6 text-slate-400" />
                  <Upload className="w-6 h-6 text-slate-400" />
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Click to capture photo or drop image file
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Supports JPG, PNG, WEBP from mobile camera or desktop
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Field Description / Observed Symptoms
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g., Deep crater in right traffic lane causing vehicles to swerve sharply; approximate 15cm depth with sharp asphalt edges..."
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-slate-900 dark:text-white"
            />
          </div>

          {/* Location & GPS Pinpoint */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Location Reference
              </label>
              <input
                type="text"
                value={locationName}
                onChange={e => setLocationName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Coordinates / Map Pin
              </label>
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg flex-1 truncate">
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onRequestPinpointOnMap();
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-lg border border-amber-300 dark:border-amber-800 flex items-center gap-1 transition-colors"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Pin on Map</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reporter Role */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Reporter Type
              </label>
              <select
                value={reporterType}
                onChange={e => setReporterType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="citizen">Civic Resident</option>
                <option value="field_technician">Municipal Field Inspector</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Reporter Name / ID
              </label>
              <input
                type="text"
                value={reporterName}
                onChange={e => setReporterName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Trigger Gemini AI Analysis */}
          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Gemini Automated Inspection & Prioritization
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Analyzes imagery for concrete/asphalt failure, classifies category, assigns severity rating and generates crew checklist.
                </div>
              </div>
              <button
                type="button"
                onClick={handleRunAiAnalysis}
                disabled={isAnalyzing}
                className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg shadow-sm disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Run AI Triage</span>
                  </>
                )}
              </button>
            </div>

            {analysisError && (
              <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{analysisError}</span>
              </div>
            )}

            {/* AI Results Dossier Preview */}
            {aiAnalysis && (
              <div className="mt-3 pt-3 border-t border-amber-200/80 dark:border-amber-900/60 space-y-2.5 text-xs animate-fadeIn">
                <div className="flex items-center justify-between text-slate-900 dark:text-white font-semibold">
                  <span className="text-amber-800 dark:text-amber-300">{aiAnalysis.defectName}</span>
                  <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                    Confidence: {Math.round((aiAnalysis.confidence || 0.95) * 100)}%
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-300">
                  <span>Severity Level: <strong className="text-slate-900 dark:text-white">{aiAnalysis.severity}/5</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Priority: <strong className="capitalize text-slate-900 dark:text-white">{aiAnalysis.priority}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Public Risk: <strong className="font-mono text-rose-600 dark:text-rose-400">{aiAnalysis.riskScore}/100</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Target SLA: <strong className="text-slate-900 dark:text-white">{aiAnalysis.estimatedSlaHours}h</strong></span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-[11px] italic bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
                  {aiAnalysis.hazardSummary}
                </p>

                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Recommended Agency: <strong className="text-slate-700 dark:text-slate-200">{aiAnalysis.recommendedDepartment}</strong>
                </div>

                {aiAnalysis.requiredEquipment && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-medium text-slate-700 dark:text-slate-200">Required Materials: </span>
                    {aiAnalysis.requiredEquipment.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit & Dispatch Report</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
