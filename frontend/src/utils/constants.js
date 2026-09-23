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
  { value: 'Cyber Crime', label: 'Cyber Crime', color: '#6366f1' },
  { value: 'Vehicle Theft', label: 'Vehicle Theft', color: '#84cc16' }
];

export const SEVERITY_LABELS = {
  1: { label: 'Very Low', color: '#22c55e' },
  2: { label: 'Low', color: '#84cc16' },
  3: { label: 'Moderate', color: '#eab308' },
  4: { label: 'High', color: '#f97316' },
  5: { label: 'Critical', color: '#ef4444' },
};

// ========== NCR City Coordinates ==========
export const CITY_COORDS = {
  'Delhi': { lat: 28.6139, lng: 77.2090, zoom: 11, label: 'Delhi (NCR Capital)' },
  'Noida': { lat: 28.5355, lng: 77.3910, zoom: 12, label: 'Noida (GB Nagar)' },
  'Gurugram': { lat: 28.4595, lng: 77.0266, zoom: 12, label: 'Gurugram (Gurgaon)' },
  'Ghaziabad': { lat: 28.6692, lng: 77.4538, zoom: 12, label: 'Ghaziabad' },
  'Faridabad': { lat: 28.4089, lng: 77.3178, zoom: 12, label: 'Faridabad' },
  'Greater Noida': { lat: 28.4744, lng: 77.5040, zoom: 12, label: 'Greater Noida' }
};

export const NCR_CITIES = Object.keys(CITY_COORDS);

export const NCR_CITY_LOCALITIES = {
  'Delhi': [
    { area: 'Connaught Place', lat: 28.6315, lng: 77.2167, riskScore: 94, riskLevel: 'CRITICAL DANGER', topCrime: 'Snatching & Theft', peakHours: '20:00 - 02:00', surge: '+16%', patrolPriority: 'EMERGENCY PATROL' },
    { area: 'Karol Bagh', lat: 28.6514, lng: 77.1907, riskScore: 88, riskLevel: 'HIGH RISK', topCrime: 'Vehicle Theft', peakHours: '21:00 - 03:00', surge: '+14%', patrolPriority: 'HIGH PATROL REQUIRED' },
    { area: 'Saket', lat: 28.5244, lng: 77.2188, riskScore: 84, riskLevel: 'HIGH RISK', topCrime: 'Burglary & Harassment', peakHours: '19:00 - 23:00', surge: '+12%', patrolPriority: 'HIGH PATROL REQUIRED' },
    { area: 'Dwarka Sector 10', lat: 28.5921, lng: 77.0460, riskScore: 82, riskLevel: 'ELEVATED RISK', topCrime: 'Vehicle Theft & Robbery', peakHours: '22:00 - 04:00', surge: '+11%', patrolPriority: 'ACTIVE MONITORING' },
    { area: 'Rohini Sector 7', lat: 28.7041, lng: 77.1025, riskScore: 89, riskLevel: 'HIGH RISK', topCrime: 'Robbery & Assault', peakHours: '21:00 - 03:00', surge: '+15%', patrolPriority: 'HIGH PATROL REQUIRED' },
    { area: 'Chandni Chowk', lat: 28.6506, lng: 77.2303, riskScore: 91, riskLevel: 'CRITICAL DANGER', topCrime: 'Pickpocketing & Fraud', peakHours: '14:00 - 20:00', surge: '+10%', patrolPriority: 'EMERGENCY PATROL' }
  ],
  'Noida': [
    { area: 'Sector 18 (Atta Market)', lat: 28.5708, lng: 77.3260, riskScore: 93, riskLevel: 'CRITICAL DANGER', topCrime: 'Snatching & Vehicle Theft', peakHours: '20:00 - 02:00', surge: '+18%', patrolPriority: 'EMERGENCY PATROL' },
    { area: 'Sector 62 (IT Hub)', lat: 28.6270, lng: 77.3726, riskScore: 86, riskLevel: 'HIGH RISK', topCrime: 'Cyber Crime & Harassment', peakHours: '19:00 - 23:00', surge: '+13%', patrolPriority: 'HIGH PATROL REQUIRED' },
    { area: 'Knowledge Park II', lat: 28.4680, lng: 77.4840, riskScore: 85, riskLevel: 'HIGH RISK', topCrime: 'Harassment & Robbery', peakHours: '21:00 - 03:00', surge: '+15%', patrolPriority: 'HIGH PATROL REQUIRED' },
    { area: 'Noida Extension (Gaur City)', lat: 28.6085, lng: 77.4260, riskScore: 87, riskLevel: 'HIGH RISK', topCrime: 'Burglary & Construction Theft', peakHours: '22:00 - 04:00', surge: '+14%', patrolPriority: 'HIGH PATROL REQUIRED' },
    { area: 'Film City (Sector 16A)', lat: 28.5750, lng: 77.3150, riskScore: 78, riskLevel: 'ELEVATED RISK', topCrime: 'Vehicle Theft', peakHours: '18:00 - 22:00', surge: '+9%', patrolPriority: 'ACTIVE MONITORING' },
    { area: 'Sector 50 Market', lat: 28.5760, lng: 77.3670, riskScore: 75, riskLevel: 'ELEVATED RISK', topCrime: 'Theft & Vandalism', peakHours: '23:00 - 04:00', surge: '+8%', patrolPriority: 'ACTIVE MONITORING' }
  ],
  'Gurugram': [
    { area: 'Cyber City (DLF Phase 2)', lat: 28.4950, lng: 77.0890, riskScore: 91, riskLevel: 'CRITICAL DANGER', topCrime: 'Pub Fights & Vehicle Theft', peakHours: '22:00 - 04:00', surge: '+17%', patrolPriority: 'EMERGENCY PATROL' },
    { area: 'MG Road (Mall Mile)', lat: 28.4800, lng: 77.0800, riskScore: 95, riskLevel: 'CRITICAL DANGER', topCrime: 'Harassment & Assault', peakHours: '21:00 - 03:00', surge: '+19%', patrolPriority: 'EMERGENCY PATROL' },
    { area: 'DLF Phase 3', lat: 28.4910, lng: 77.1000, riskScore: 88, riskLevel: 'HIGH RISK', topCrime: 'Burglary & Snatching', peakHours: '23:00 - 05:00', surge: '+14%', patrolPriority: 'HIGH PATROL REQUIRED' },
    { area: 'Sector 29 (Pub Hub)', lat: 28.4680, lng: 77.0630, riskScore: 90, riskLevel: 'CRITICAL DANGER', topCrime: 'Assault & Drunk Driving', peakHours: '22:00 - 03:00', surge: '+16%', patrolPriority: 'EMERGENCY PATROL' },
    { area: 'Sohna Road', lat: 28.4000, lng: 77.0400, riskScore: 83, riskLevel: 'ELEVATED RISK', topCrime: 'Vehicle Theft & Robbery', peakHours: '20:00 - 02:00', surge: '+12%', patrolPriority: 'ACTIVE MONITORING' },
    { area: 'Udyog Vihar Phase IV', lat: 28.5080, lng: 77.0860, riskScore: 84, riskLevel: 'HIGH RISK', topCrime: 'Robbery & Theft', peakHours: '19:00 - 01:00', surge: '+11%', patrolPriority: 'HIGH PATROL REQUIRED' }
  ],
  'Ghaziabad': [
    { area: 'Indirapuram (Habitat Centre)', lat: 28.6465, lng: 77.3712, riskScore: 92, riskLevel: 'CRITICAL DANGER', topCrime: 'Chain Snatching & Armed Robbery', peakHours: '20:00 - 02:00', surge: '+16%', patrolPriority: 'EMERGENCY PATROL' },
    { area: 'Vaishali Sector 4', lat: 28.6470, lng: 77.3400, riskScore: 87, riskLevel: 'HIGH RISK', topCrime: 'Vehicle Theft & Snatching', peakHours: '21:00 - 03:00', surge: '+14%', patrolPriority: 'HIGH PATROL REQUIRED' },
    { area: 'Vasundhara Sector 10', lat: 28.6600, lng: 77.3600, riskScore: 83, riskLevel: 'ELEVATED RISK', topCrime: 'Burglary', peakHours: '22:00 - 04:00', surge: '+10%', patrolPriority: 'ACTIVE MONITORING' },
    { area: 'Raj Nagar Extension', lat: 28.6970, lng: 77.4420, riskScore: 89, riskLevel: 'HIGH RISK', topCrime: 'Robbery & Construction Theft', peakHours: '21:00 - 04:00', surge: '+15%', patrolPriority: 'HIGH PATROL REQUIRED' },
    { area: 'Sahibabad Industrial Area', lat: 28.6700, lng: 77.3800, riskScore: 86, riskLevel: 'HIGH RISK', topCrime: 'Extortion & Theft', peakHours: '19:00 - 02:00', surge: '+13%', patrolPriority: 'HIGH PATROL REQUIRED' },
    { area: 'Kavi Nagar', lat: 28.6650, lng: 77.4550, riskScore: 81, riskLevel: 'ELEVATED RISK', topCrime: 'Vehicle Theft', peakHours: '22:00 - 03:00', surge: '+9%', patrolPriority: 'ACTIVE MONITORING' }
  ],
  'Faridabad': [
    { area: 'NIT Faridabad (Market)', lat: 28.3850, lng: 77.3000, riskScore: 90, riskLevel: 'CRITICAL DANGER', topCrime: 'Market Assault & Snatching', peakHours: '19:00 - 01:00', surge: '+15%', patrolPriority: 'EMERGENCY PATROL' },
    { area: 'Sector 15 Main Market', lat: 28.4050, lng: 77.3200, riskScore: 84, riskLevel: 'HIGH RISK', topCrime: 'Vehicle Theft', peakHours: '21:00 - 03:00', surge: '+12%', patrolPriority: 'HIGH PATROL REQUIRED' },
    { area: 'Greater Faridabad (Neharpar)', lat: 28.4100, lng: 77.3500, riskScore: 88, riskLevel: 'HIGH RISK', topCrime: 'Armed Robbery & Burglary', peakHours: '22:00 - 04:00', surge: '+16%', patrolPriority: 'HIGH PATROL REQUIRED' },
    { area: 'Ballabhgarh Bus Stand', lat: 28.3390, lng: 77.3270, riskScore: 92, riskLevel: 'CRITICAL DANGER', topCrime: 'Assault & Theft', peakHours: '20:00 - 02:00', surge: '+17%', patrolPriority: 'EMERGENCY PATROL' },
    { area: 'Surajkund Tourist Area', lat: 28.4600, lng: 77.2800, riskScore: 82, riskLevel: 'ELEVATED RISK', topCrime: 'Robbery on Lonely Stretch', peakHours: '21:00 - 03:00', surge: '+11%', patrolPriority: 'ACTIVE MONITORING' },
    { area: 'Old Faridabad Railway Stn', lat: 28.4150, lng: 77.3100, riskScore: 79, riskLevel: 'ELEVATED RISK', topCrime: 'Pickpocketing & Theft', peakHours: '18:00 - 22:00', surge: '+8%', patrolPriority: 'ACTIVE MONITORING' }
  ],
  'Greater Noida': [
    { area: 'Pari Chowk', lat: 28.4670, lng: 77.5130, riskScore: 94, riskLevel: 'CRITICAL DANGER', topCrime: 'Highway Robbery & Snatching', peakHours: '21:00 - 04:00', surge: '+18%', patrolPriority: 'EMERGENCY PATROL' },
    { area: 'Greater Noida West (Sector 1)', lat: 28.5950, lng: 77.4500, riskScore: 89, riskLevel: 'HIGH RISK', topCrime: 'Construction Theft & Robbery', peakHours: '22:00 - 04:00', surge: '+15%', patrolPriority: 'HIGH PATROL REQUIRED' },
    { area: 'Knowledge Park III (Colleges)', lat: 28.4600, lng: 77.4900, riskScore: 86, riskLevel: 'HIGH RISK', topCrime: 'Harassment & Vehicle Theft', peakHours: '20:00 - 02:00', surge: '+13%', patrolPriority: 'HIGH PATROL REQUIRED' },
    { area: 'Alpha 2 Commercial Belt', lat: 28.4750, lng: 77.5050, riskScore: 83, riskLevel: 'ELEVATED RISK', topCrime: 'Burglary & Theft', peakHours: '23:00 - 05:00', surge: '+11%', patrolPriority: 'ACTIVE MONITORING' },
    { area: 'Tech Zone 4 Expressway', lat: 28.5700, lng: 77.4600, riskScore: 85, riskLevel: 'HIGH RISK', topCrime: 'Isolated Assault & Robbery', peakHours: '21:00 - 03:00', surge: '+12%', patrolPriority: 'HIGH PATROL REQUIRED' },
    { area: 'Surajpur Police Belt', lat: 28.5100, lng: 77.4900, riskScore: 81, riskLevel: 'ELEVATED RISK', topCrime: 'Extortion & Vehicle Theft', peakHours: '19:00 - 01:00', surge: '+10%', patrolPriority: 'ACTIVE MONITORING' }
  ]
};

// ========== Emergency Helplines ==========
export const HELPLINES = [
  { name: 'NCR Police Control', number: '112 / 100', icon: '🚓', color: '#3b82f6', description: 'Immediate police assistance' },
  { name: 'Ambulance', number: '102', icon: '🚑', color: '#22c55e', description: 'Medical emergency' },
  { name: 'Fire Brigade', number: '101', icon: '🚒', color: '#ef4444', description: 'Fire emergency' },
  { name: 'Women Safety Helpline', number: '1091', icon: '👮‍♀️', color: '#ec4899', description: 'NCR Women safety helpline' },
  { name: 'Child Helpline', number: '1098', icon: '👶', color: '#a855f7', description: 'Child protection' },
  { name: 'Disaster Response', number: '108', icon: '⚠️', color: '#eab308', description: 'National disaster response' },
  { name: 'Cyber Crime Helpline', number: '1930', icon: '💻', color: '#06b6d4', description: 'Online fraud & cybercrime' },
  { name: 'Highway Helpline', number: '1073', icon: '🛣️', color: '#f97316', description: 'NCR Expressway & road assistance' },
];

// ========== Safety Index Thresholds ==========
export const SAFETY_LEVELS = {
  safe: { min: 70, label: 'Safe', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  moderate: { min: 45, label: 'Moderate Risk', color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
  danger: { min: 0, label: 'High Danger', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
};

export const getSafetyLevel = (score) => {
  if (score >= SAFETY_LEVELS.safe.min) return SAFETY_LEVELS.safe;
  if (score >= SAFETY_LEVELS.moderate.min) return SAFETY_LEVELS.moderate;
  return SAFETY_LEVELS.danger;
};

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
