import React, { useState, useRef, useMemo } from 'react';
import { Incident, FieldCrew, IncidentPriority, IncidentCategory } from '../types/infrastructure';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MapPin,
  Truck,
  Flame,
  ShieldAlert,
  Clock,
  Compass,
  Crosshair,
  Radio,
  Eye,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface InteractiveMapProps {
  incidents: Incident[];
  crews: FieldCrew[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  isPinpointMode?: boolean;
  onPinpointSelect?: (lat: number, lng: number, locationName: string) => void;
  selectedCategoryFilter: string;
  selectedPriorityFilter: string;
}

type MapLayer = 'street' | 'satellite' | 'heatmap' | 'sectors';

// Bounding box for Metro Civil District
// Lat: ~37.745 to 37.805, Lng: -122.455 to -122.385
const MAP_BOUNDS = {
  minLat: 37.745,
  maxLat: 37.805,
  minLng: -122.455,
  maxLng: -122.385,
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  incidents,
  crews,
  selectedIncident,
  onSelectIncident,
  isPinpointMode = false,
  onPinpointSelect,
  selectedCategoryFilter,
  selectedPriorityFilter,
}) => {
  const [activeLayer, setActiveLayer] = useState<MapLayer>('street');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredIncident, setHoveredIncident] = useState<Incident | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert GPS (lat, lng) to SVG coordinates (0 to 1000, 0 to 700)
  const gpsToSvg = (lat: number, lng: number) => {
    const xRatio = (lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng);
    // Invert lat for Y coordinate (north is up)
    const yRatio = 1 - (lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);
    return {
      x: Math.max(20, Math.min(980, xRatio * 1000)),
      y: Math.max(20, Math.min(680, yRatio * 700)),
    };
  };

  // Convert SVG coordinates back to GPS
  const svgToGps = (svgX: number, svgY: number) => {
    const lng = MAP_BOUNDS.minLng + (svgX / 1000) * (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng);
    const lat = MAP_BOUNDS.maxLat - (svgY / 700) * (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);
    return {
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5)),
    };
  };

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      if (selectedCategoryFilter !== 'all' && inc.category !== selectedCategoryFilter) return false;
      if (selectedPriorityFilter !== 'all' && inc.priority !== selectedPriorityFilter) return false;
      return true;
    });
  }, [incidents, selectedCategoryFilter, selectedPriorityFilter]);

  // Handle map click
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPinpointMode || !onPinpointSelect || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - pan.x) / zoom;
    const clickY = (e.clientY - rect.top - pan.y) / zoom;

    // Normalize to 1000x700 viewBox
    const scaleX = 1000 / rect.width;
    const scaleY = 700 / rect.height;
    const svgX = clickX * scaleX;
    const svgY = clickY * scaleY;

    const coords = svgToGps(svgX, svgY);
    // Generate an approximate human readable cross street name
    const approxStreet = generateApproximatedLocation(coords.lat, coords.lng);
    onPinpointSelect(coords.lat, coords.lng, approxStreet);
  };

  const generateApproximatedLocation = (lat: number, lng: number) => {
    if (lat > 37.785) return `North Shore Corridor (Lat: ${lat}, Lng: ${lng})`;
    if (lat < 37.76) return `South Arterial Zone (Lat: ${lat}, Lng: ${lng})`;
    if (lng > -122.41) return `Riverfront Transit Pier (Lat: ${lat}, Lng: ${lng})`;
    return `Central Civic Grid, Sector 3 (Lat: ${lat}, Lng: ${lng})`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPinpointMode) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(3.5, Math.max(0.8, prev + delta)));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Color helper based on priority
  const getPriorityColor = (priority: IncidentPriority) => {
    switch (priority) {
      case 'critical':
        return '#f43f5e'; // rose-500
      case 'high':
        return '#f97316'; // orange-500
      case 'medium':
        return '#eab308'; // yellow-500
      case 'low':
        return '#10b981'; // emerald-500
      default:
        return '#64748b';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[580px] overflow-hidden select-none rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 ${
        isPinpointMode ? 'cursor-crosshair ring-2 ring-amber-500' : 'cursor-grab active:cursor-grabbing'
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Map Layer Bar & Diagnostics */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 p-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
          <button
            onClick={() => setActiveLayer('street')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeLayer === 'street'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Street Cartography
          </button>
          <button
            onClick={() => setActiveLayer('satellite')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeLayer === 'satellite'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Aerial Grid
          </button>
          <button
            onClick={() => setActiveLayer('heatmap')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
              activeLayer === 'heatmap'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-rose-600'
            }`}
          >
            <Flame className="w-3 h-3" />
            Hazard Heatmap
          </button>
          <button
            onClick={() => setActiveLayer('sectors')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activeLayer === 'sectors'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sectors & Crews
          </button>
        </div>

        {isPinpointMode && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-slate-950 font-medium text-xs rounded-lg shadow-md animate-pulse">
            <Crosshair className="w-3.5 h-3.5" />
            <span>Click any coordinate on map to pin defect</span>
          </div>
        )}
      </div>

      {/* Map Navigation Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5">
        <div className="flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
          <button
            onClick={() => handleZoom(0.25)}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200 dark:bg-slate-800" />
          <button
            onClick={() => handleZoom(-0.25)}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200 dark:bg-slate-800" />
          <button
            onClick={handleReset}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset Frame"
            aria-label="Reset map frame"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="px-2.5 py-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-md border border-slate-200 dark:border-slate-800 text-center">
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* Primary SVG Vector GIS Map Canvas */}
      <div
        className="w-full h-full origin-center transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        <svg
          viewBox="0 0 1000 700"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          onClick={handleMapClick}
        >
          <defs>
            {/* Grid pattern */}
            <pattern id="urbanGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke={activeLayer === 'satellite' ? 'rgba(51, 65, 85, 0.4)' : 'rgba(148, 163, 184, 0.15)'}
                strokeWidth="1"
              />
            </pattern>
            {/* Fine subgrid */}
            <pattern id="fineGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path
                d="M 10 0 L 0 0 0 10"
                fill="none"
                stroke="rgba(255, 255, 255, 0.03)"
                strokeWidth="0.5"
              />
            </pattern>

            {/* Heatmap blur filter */}
            <filter id="heatBlur" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="35" />
            </filter>

            {/* Radial glow for critical pins */}
            <radialGradient id="criticalPulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#f43f5e" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Base Landmass Fill */}
          <rect
            width="1000"
            height="700"
            fill={activeLayer === 'satellite' ? '#0b1120' : '#0f172a'}
          />
          <rect width="1000" height="700" fill="url(#urbanGrid)" />
          <rect width="1000" height="700" fill="url(#fineGrid)" />

          {/* Natural River / Estuary Waterway */}
          <path
            d="M 680 0 Q 640 180 720 320 T 790 520 Q 820 620 860 700 L 1000 700 L 1000 0 Z"
            fill={activeLayer === 'satellite' ? '#041d38' : '#0c2744'}
            stroke="#1e3a5f"
            strokeWidth="1.5"
          />
          {/* Pier docks */}
          <path
            d="M 720 320 L 760 300 M 740 370 L 785 355 M 760 430 L 805 415"
            stroke="#334155"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Municipal Maintenance Sectors Layer */}
          {activeLayer === 'sectors' && (
            <g opacity="0.65">
              {/* Sector: Downtown Core */}
              <polygon
                points="300,160 620,160 660,420 340,420"
                fill="rgba(59, 130, 246, 0.08)"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <text x="460" y="290" fill="#93c5fd" fontSize="12" fontWeight="600" textAnchor="middle">
                DOWNTOWN CORE SECTOR (DIV 1)
              </text>

              {/* Sector: Riverfront District */}
              <polygon
                points="620,120 780,120 840,650 660,650 630,380"
                fill="rgba(16, 185, 129, 0.08)"
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <text x="730" y="480" fill="#6ee7b7" fontSize="12" fontWeight="600" textAnchor="middle">
                RIVERFRONT SECTOR (DIV 2)
              </text>

              {/* Sector: North Hills */}
              <polygon
                points="80,40 600,40 580,160 100,160"
                fill="rgba(168, 85, 247, 0.08)"
                stroke="#a855f7"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <text x="320" y="100" fill="#d8b4fe" fontSize="12" fontWeight="600" textAnchor="middle">
                NORTH HILLS SECTOR (DIV 3)
              </text>

              {/* Sector: West Industrial */}
              <polygon
                points="40,240 300,240 320,640 40,640"
                fill="rgba(245, 158, 11, 0.08)"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <text x="170" y="440" fill="#fde68a" fontSize="12" fontWeight="600" textAnchor="middle">
                WEST INDUSTRIAL CORRIDOR (DIV 4)
              </text>
            </g>
          )}

          {/* Major Urban Arterials & Street Geometry */}
          <g stroke="rgba(203, 213, 225, 0.22)" strokeWidth="6" strokeLinecap="round">
            {/* Central Expressway */}
            <path d="M 0 350 Q 400 370 1000 340" stroke="#334155" strokeWidth="12" />
            <path d="M 0 350 Q 400 370 1000 340" stroke="#f59e0b" strokeWidth="2" strokeDasharray="14 12" />

            {/* 4th Avenue Parkway */}
            <path d="M 450 0 L 480 700" stroke="#334155" strokeWidth="10" />

            {/* Market Street Diagonal */}
            <path d="M 120 620 L 730 180" stroke="#475569" strokeWidth="9" />

            {/* Riverside Boulevard */}
            <path d="M 640 40 Q 610 200 680 340 T 750 560 L 780 700" stroke="#475569" strokeWidth="8" />

            {/* Oak Avenue & Pine Crossings */}
            <path d="M 60 140 L 780 140" stroke="#334155" strokeWidth="7" />
            <path d="M 80 500 L 800 500" stroke="#334155" strokeWidth="7" />
            <path d="M 240 0 L 260 700" stroke="#334155" strokeWidth="7" />
            <path d="M 620 0 L 640 700" stroke="#334155" strokeWidth="7" />
          </g>

          {/* Secondary Street Grid */}
          <g stroke="rgba(148, 163, 184, 0.12)" strokeWidth="2.5">
            <line x1="140" y1="40" x2="140" y2="660" />
            <line x1="340" y1="40" x2="340" y2="660" />
            <line x1="540" y1="40" x2="540" y2="660" />
            <line x1="40" y1="220" x2="680" y2="220" />
            <line x1="40" y1="280" x2="680" y2="280" />
            <line x1="40" y1="420" x2="720" y2="420" />
            <line x1="40" y1="580" x2="750" y2="580" />
          </g>

          {/* Bridges across Waterway */}
          <g stroke="#94a3b8" strokeWidth="6" strokeLinecap="square">
            {/* East Memorial Bridge */}
            <line x1="695" y1="345" x2="780" y2="340" />
            {/* Pier transit span */}
            <line x1="740" y1="510" x2="815" y2="505" />
          </g>
          {/* Bridge text */}
          <text x="735" y="335" fill="#cbd5e1" fontSize="10" fontWeight="600" textAnchor="middle">
            EAST MEMORIAL SPAN
          </text>

          {/* Street Labels (Cartographic typography) */}
          <text x="310" y="365" fill="#94a3b8" fontSize="11" fontWeight="600" letterSpacing="2">
            CENTRAL EXPRESSWAY
          </text>
          <text x="495" y="260" fill="#94a3b8" fontSize="10" fontWeight="500" transform="rotate(85 495 260)">
            4TH AVENUE ARTERIAL
          </text>
          <text x="360" y="440" fill="#94a3b8" fontSize="10" fontWeight="500" transform="rotate(-33 360 440)">
            MARKET STREET
          </text>
          <text x="685" y="160" fill="#94a3b8" fontSize="10" fontWeight="500" transform="rotate(70 685 160)">
            RIVERSIDE BLVD
          </text>

          {/* Heatmap Density Layer */}
          {activeLayer === 'heatmap' && (
            <g filter="url(#heatBlur)" opacity="0.8">
              {filteredIncidents.map(inc => {
                const pos = gpsToSvg(inc.latitude, inc.longitude);
                const radius = inc.severity * 28;
                const heatColor =
                  inc.priority === 'critical' ? '#ef4444' :
                  inc.priority === 'high' ? '#f97316' :
                  inc.priority === 'medium' ? '#eab308' : '#10b981';
                return (
                  <circle
                    key={`heat-${inc.id}`}
                    cx={pos.x}
                    cy={pos.y}
                    r={radius}
                    fill={heatColor}
                    opacity="0.65"
                  />
                );
              })}
            </g>
          )}

          {/* Active Field Crew Unit GPS Pins & Vehicle Vectors */}
          {crews.map(crew => {
            const pos = gpsToSvg(crew.latitude, crew.longitude);
            return (
              <g
                key={`crew-${crew.id}`}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="transition-transform duration-300"
              >
                {/* Crew pulse ring */}
                <circle cx="0" cy="0" r="16" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
                <rect x="-10" y="-10" width="20" height="20" rx="5" fill="#047857" stroke="#34d399" strokeWidth="1.5" />
                <text x="0" y="3" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                  {crew.id.replace('CREW-', 'C')}
                </text>
                <text x="0" y="22" fill="#6ee7b7" fontSize="9" fontWeight="600" textAnchor="middle" className="drop-shadow-sm">
                  {crew.id}
                </text>
              </g>
            );
          })}

          {/* Incident Pin Markers */}
          {filteredIncidents.map(incident => {
            const pos = gpsToSvg(incident.latitude, incident.longitude);
            const isSelected = selectedIncident?.id === incident.id;
            const isCritical = incident.priority === 'critical';
            const pinColor = getPriorityColor(incident.priority);

            return (
              <g
                key={incident.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={e => {
                  e.stopPropagation();
                  onSelectIncident(incident);
                }}
                onMouseEnter={() => setHoveredIncident(incident)}
                onMouseLeave={() => setHoveredIncident(null)}
                className="cursor-pointer group"
              >
                {/* Critical emergency warning pulse halo */}
                {isCritical && (
                  <>
                    <circle
                      cx="0"
                      cy="0"
                      r="26"
                      fill="url(#criticalPulse)"
                      className="animate-ping opacity-75"
                    />
                    <circle
                      cx="0"
                      cy="0"
                      r="20"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="1.5"
                      strokeDasharray="4 3"
                    />
                  </>
                )}

                {/* Selected marker boundary ring */}
                {isSelected && (
                  <circle
                    cx="0"
                    cy="0"
                    r="22"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3"
                    className="drop-shadow-md"
                  />
                )}

                {/* Marker Body Drop Pin */}
                <path
                  d="M 0 -18 C -9 -18 -14 -12 -14 -4 C -14 6 0 16 0 16 C 0 16 14 6 14 -4 C 14 -12 9 -18 0 -18 Z"
                  fill={pinColor}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-transform group-hover:scale-125 origin-bottom drop-shadow-md"
                />

                {/* Inner Icon / Severity Indicator */}
                <circle cx="0" cy="-6" r="4.5" fill="#ffffff" />
                <text
                  x="0"
                  y="-4"
                  fill={pinColor}
                  fontSize="7"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {incident.severity}
                </text>

                {/* Status indicator dot below */}
                {incident.status === 'resolved' ? (
                  <circle cx="0" cy="22" r="3" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
                ) : incident.status === 'in_progress' ? (
                  <circle cx="0" cy="22" r="3" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hover Inspection Popover */}
      {hoveredIncident && (
        <div
          className="absolute bottom-4 left-4 z-30 max-w-sm p-3.5 bg-slate-900/95 text-slate-100 rounded-xl border border-slate-700 shadow-xl backdrop-blur-md pointer-events-none transition-all"
        >
          <div className="flex items-center justify-between gap-3 text-xs text-slate-400 mb-1">
            <span className="font-mono text-amber-400 font-medium">{hoveredIncident.id}</span>
            <span>{hoveredIncident.sector}</span>
            <span>·</span>
            <span className="capitalize">{hoveredIncident.status.replace('_', ' ')}</span>
          </div>
          <div className="text-sm font-semibold text-white line-clamp-1">
            {hoveredIncident.title}
          </div>
          <p className="text-xs text-slate-300 mt-1 line-clamp-2">
            {hoveredIncident.hazardSummary}
          </p>
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            <span className="font-mono text-rose-400">Risk Score: {hoveredIncident.riskScore}/100</span>
            <span>·</span>
            <span>SLA: {hoveredIncident.slaHours}h</span>
          </div>
        </div>
      )}

      {/* Bottom Map Legend - Clean unboxed text layout adhering to Zero-Pill discipline */}
      <div className="absolute bottom-3 right-4 z-20 hidden md:flex items-center gap-4 px-3.5 py-1.5 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg text-xs text-slate-300 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30" />
          <span>Critical (L5)</span>
        </div>
        <span className="text-slate-700" aria-hidden="true">·</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span>High (L4)</span>
        </div>
        <span className="text-slate-700" aria-hidden="true">·</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span>Medium (L3)</span>
        </div>
        <span className="text-slate-700" aria-hidden="true">·</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 border border-emerald-400" />
          <span>Field Crews Active</span>
        </div>
      </div>
    </div>
  );
};
