// ========== Color Palettes ==========
export const COLORS = {
  orange: '#f97316',
  pink: '#ec4899',
  red: '#ef4444',
  green: '#22c55e',
  blue: '#3b82f6',
  cyan: '#06b6d4',
  yellow: '#eab308',
  purple: '#a855f7',
  darkBg: '#060a13',
  cardBg: '#111a2e',
  borderColor: '#374151',
};

export const CHART_COLORS = ['#f97316', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#06b6d4', '#eab308', '#ec4899'];

// ========== Crime Types ==========
export const CRIME_TYPES = [
  { value: 'all', label: 'All Types', color: '#9ca3af' },
  { value: 'Theft', label: 'Theft', color: '#f97316' },
  { value: 'Assault', label: 'Assault', color: '#ef4444' },
  { value: 'Robbery', label: 'Robbery', color: '#eab308' },
  { value: 'Burglary', label: 'Burglary', color: '#a855f7' },
  { value: 'Vandalism', label: 'Vandalism', color: '#3b82f6' },
  { value: 'Harassment', label: 'Harassment', color: '#ec4899' },
  { value: 'Murder', label: 'Murder', color: '#dc2626' },
  { value: 'Fraud', label: 'Fraud', color: '#06b6d4' },
];

export const SEVERITY_LABELS = {
  1: { label: 'Very Low', color: '#22c55e' },
  2: { label: 'Low', color: '#84cc16' },
  3: { label: 'Moderate', color: '#eab308' },
  4: { label: 'High', color: '#f97316' },
  5: { label: 'Critical', color: '#ef4444' },
};

// ========== City Coordinates ==========
export const CITY_COORDS = {
  'Delhi': { lat: 28.6139, lng: 77.2090, zoom: 11 },
  'New Delhi': { lat: 28.6139, lng: 77.2090, zoom: 11 },
  'Mumbai': { lat: 19.0760, lng: 72.8777, zoom: 11 },
  'Bangalore': { lat: 12.9716, lng: 77.5946, zoom: 11 },
  'Kolkata': { lat: 22.5726, lng: 88.3639, zoom: 11 },
  'Chennai': { lat: 13.0827, lng: 80.2707, zoom: 11 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867, zoom: 11 },
  'Pune': { lat: 18.5204, lng: 73.8567, zoom: 11 },
  'Noida': { lat: 28.5355, lng: 77.3910, zoom: 12 },
  'Lucknow': { lat: 26.8467, lng: 80.9462, zoom: 11 },
  'Kanpur': { lat: 26.4499, lng: 80.3319, zoom: 11 },
  'Jaipur': { lat: 26.9124, lng: 75.7873, zoom: 11 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714, zoom: 11 },
};

// ========== Emergency Helplines ==========
export const HELPLINES = [
  { name: 'Police', number: '100', icon: '🚓', color: '#3b82f6', description: 'Emergency police assistance' },
  { name: 'Ambulance', number: '102', icon: '🚑', color: '#22c55e', description: 'Medical emergency' },
  { name: 'Fire Brigade', number: '101', icon: '🚒', color: '#ef4444', description: 'Fire emergency' },
  { name: 'Women Helpline', number: '1091', icon: '👮‍♀️', color: '#ec4899', description: 'Women safety helpline' },
  { name: 'Child Helpline', number: '1098', icon: '👶', color: '#a855f7', description: 'Child protection' },
  { name: 'Disaster Mgmt', number: '108', icon: '⚠️', color: '#eab308', description: 'National disaster response' },
  { name: 'Cyber Crime', number: '1930', icon: '💻', color: '#06b6d4', description: 'Online fraud & cybercrime' },
  { name: 'Road Accident', number: '1073', icon: '🛣️', color: '#f97316', description: 'Road accident emergency' },
];

// ========== Safety Index Thresholds ==========
export const SAFETY_LEVELS = {
  safe: { min: 70, label: 'Safe', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  moderate: { min: 40, label: 'Moderate', color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
  danger: { min: 0, label: 'Dangerous', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

export const getSafetyLevel = (score) => {
  if (score >= SAFETY_LEVELS.safe.min) return SAFETY_LEVELS.safe;
  if (score >= SAFETY_LEVELS.moderate.min) return SAFETY_LEVELS.moderate;
  return SAFETY_LEVELS.danger;
};

export const API_BASE = import.meta.env.VITE_API_BASE || 'https://crime-map-m4xc.onrender.com/api';
