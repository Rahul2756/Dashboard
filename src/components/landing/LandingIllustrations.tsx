import React from 'react';

// Processing Team & Infrastructure Watermark Illustration
export const ProcessingIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 150 130" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    {/* Soft glow background */}
    <ellipse cx="80" cy="70" rx="55" ry="45" fill="#DCFCE7" fillOpacity="0.45" />

    {/* Background modern office buildings */}
    <rect x="76" y="24" width="34" height="66" rx="3" fill="#BBF7D0" fillOpacity="0.75" />
    <rect x="106" y="42" width="30" height="48" rx="3" fill="#86EFAC" fillOpacity="0.55" />
    
    {/* Tall building windows */}
    <rect x="82" y="30" width="6" height="6" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
    <rect x="94" y="30" width="6" height="6" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
    <rect x="82" y="42" width="6" height="6" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
    <rect x="94" y="42" width="6" height="6" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
    <rect x="82" y="54" width="6" height="6" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
    <rect x="94" y="54" width="6" height="6" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
    <rect x="82" y="66" width="6" height="6" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
    <rect x="94" y="66" width="6" height="6" rx="1" fill="#FFFFFF" fillOpacity="0.9" />

    {/* Short building windows */}
    <rect x="112" y="48" width="6" height="5" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
    <rect x="122" y="48" width="6" height="5" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
    <rect x="112" y="58" width="6" height="5" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
    <rect x="122" y="58" width="6" height="5" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
    <rect x="112" y="68" width="6" height="5" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
    <rect x="122" y="68" width="6" height="5" rx="1" fill="#FFFFFF" fillOpacity="0.9" />

    {/* Team silhouettes in foreground */}
    {/* Left user */}
    <circle cx="36" cy="68" r="9" fill="#4ADE80" />
    <path d="M22 92 C22 81 30 79 36 79 C42 79 50 81 50 92 Z" fill="#4ADE80" />

    {/* Right user */}
    <circle cx="78" cy="68" r="9" fill="#4ADE80" />
    <path d="M64 92 C64 81 72 79 78 79 C84 79 92 81 92 92 Z" fill="#4ADE80" />

    {/* Center front user */}
    <circle cx="57" cy="60" r="11" fill="#22C55E" />
    <path d="M40 88 C40 76 49 73 57 73 C65 73 74 76 74 88 Z" fill="#22C55E" />
  </svg>
);

// Tranac Updates Watermark Illustration (Vehicle / Traffic monitoring symbol with check badge)
export const ProjectUpdatesIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 150 130" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    {/* Soft glow background */}
    <ellipse cx="75" cy="65" rx="54" ry="46" fill="#DBEAFE" fillOpacity="0.5" />

    {/* Vehicle Road / Lane line */}
    <path d="M20 94 H130" stroke="#BFDBFE" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M55 94 H95" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" />

    {/* Vehicle Side Tires */}
    <rect x="36" y="66" width="9" height="24" rx="3.5" fill="#3B82F6" />
    <rect x="105" y="66" width="9" height="24" rx="3.5" fill="#3B82F6" />

    {/* Vehicle Body Base */}
    <rect x="39" y="44" width="72" height="38" rx="8" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="2.5" />

    {/* Vehicle Cabin / Roof */}
    <path 
      d="M48 45 L58 26 C59 24 61 23 64 23 H86 C89 23 91 24 92 26 L102 45 Z" 
      fill="#EFF6FF" 
      stroke="#60A5FA" 
      strokeWidth="2.5" 
      strokeLinejoin="round" 
    />

    {/* Windshield Glass */}
    <path 
      d="M53 43 L62 28 H88 L97 43 Z" 
      fill="#DBEAFE" 
      stroke="#93C5FD" 
      strokeWidth="1.5" 
    />
    {/* Windshield glare highlight */}
    <path d="M60 32 L70 41" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />

    {/* Side Mirrors */}
    <rect x="33" y="43" width="7" height="6" rx="2" fill="#60A5FA" />
    <rect x="110" y="43" width="7" height="6" rx="2" fill="#60A5FA" />

    {/* Headlights */}
    <rect x="45" y="52" width="12" height="8" rx="2.5" fill="#3B82F6" />
    <rect x="93" y="52" width="12" height="8" rx="2.5" fill="#3B82F6" />
    <circle cx="51" cy="56" r="2" fill="#FFFFFF" />
    <circle cx="99" cy="56" r="2" fill="#FFFFFF" />

    {/* Front Grille */}
    <rect x="63" y="52" width="24" height="16" rx="3.5" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1.5" />
    <line x1="67" y1="56" x2="83" y2="56" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="67" y1="60" x2="83" y2="60" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="67" y1="64" x2="83" y2="64" stroke="#93C5FD" strokeWidth="1.5" strokeLinecap="round" />

    {/* Lower Bumper */}
    <rect x="45" y="72" width="60" height="6" rx="2" fill="#BFDBFE" />

    {/* Blue circle badge with checkmark */}
    <circle cx="108" cy="88" r="16" fill="#3B82F6" />
    <path 
      d="M101 88 L106 93 L115 83" 
      stroke="#FFFFFF" 
      strokeWidth="2.7" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

// Pavement Analysis Watermark Illustration (Curving highway perspective + chart)
export const PavementAnalysisIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 150 130" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    {/* Soft glow background */}
    <ellipse cx="75" cy="65" rx="55" ry="46" fill="#FEF3C7" fillOpacity="0.5" />

    {/* Curving highway perspective */}
    <path 
      d="M12 108 C35 90 62 65 72 32 L86 32 C80 65 62 90 98 108 Z" 
      fill="#FDE68A" 
      fillOpacity="0.75" 
    />
    {/* Center dashed road marking */}
    <path 
      d="M45 108 C54 90 68 64 78 33" 
      stroke="#FFFFFF" 
      strokeWidth="2.5" 
      strokeDasharray="5 4" 
      strokeLinecap="round"
    />

    {/* Right-side analytical chart card */}
    <rect x="94" y="56" width="46" height="44" rx="7" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="2" />
    
    {/* Ascending analysis bars */}
    <rect x="101" y="80" width="7" height="13" rx="1.5" fill="#FCD34D" />
    <rect x="113" y="71" width="7" height="22" rx="1.5" fill="#F59E0B" />
    <rect x="125" y="63" width="7" height="30" rx="1.5" fill="#D97706" />

    {/* Subtle trendline */}
    <path 
      d="M103 76 Q115 67 128 59" 
      stroke="#D97706" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
      strokeDasharray="2 2"
    />
  </svg>
);

// HiRATE Highway Asset Rating Watermark Illustration (Signpost + Shield)
export const HiRateIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    viewBox="0 0 150 130" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-hidden="true"
  >
    {/* Soft glow background */}
    <ellipse cx="75" cy="65" rx="52" ry="46" fill="#CCFBF1" fillOpacity="0.5" />

    {/* Signpost structure */}
    {/* Vertical pole */}
    <rect x="62" y="32" width="6" height="64" rx="2" fill="#5EEAD4" />
    {/* Ground base */}
    <rect x="52" y="94" width="26" height="4" rx="2" fill="#2DD4BF" />

    {/* Directional Highway Signboard */}
    <rect x="26" y="28" width="62" height="34" rx="5" fill="#FFFFFF" stroke="#2DD4BF" strokeWidth="2.2" />
    {/* Arrow pointing left on sign */}
    <path 
      d="M62 45 H38 M46 39 L38 45 L46 51" 
      stroke="#0D9488" 
      strokeWidth="2.8" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />

    {/* Verification / Shield badge in foreground */}
    <path 
      d="M108 72 L122 77 C122 91 116 100 108 105 C100 100 94 91 94 77 Z" 
      fill="#0D9488" 
    />
    {/* White checkmark inside shield */}
    <path 
      d="M101 88 L106 93 L115 84" 
      stroke="#FFFFFF" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
);

// Highway Road Icon for Card 3 top-left badge
export const RoadPerspectiveIcon: React.FC<{ size?: number; className?: string; color?: string }> = ({
  size = 24,
  className,
  color = '#D97706',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Road surface */}
    <path 
      d="M4 21L9 3H15L20 21H4Z" 
      fill={color} 
      fillOpacity="0.15" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinejoin="round" 
    />
    {/* Dashed center lane markings */}
    <line x1="12" y1="5" x2="12" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="11" x2="12" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="17" x2="12" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </svg>
);
