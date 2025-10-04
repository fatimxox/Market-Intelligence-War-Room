import React from 'react';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  />
);

export const Crown: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" /></Icon> );
export const Crosshair: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><circle cx="12" cy="12" r="10" /><line x1="22" y1="12" x2="18" y2="12" /><line x1="6" y1="12" x2="2" y2="12" /><line x1="12" y1="6" x2="12" y2="2" /><line x1="12" y1="22" x2="12" y2="18" /></Icon> );
export const DollarSign: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></Icon> );
export const Eye: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></Icon> );
export const Shield: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></Icon> );
export const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></Icon> ); // Placeholder
export const LinkedInIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></Icon> );
export const CrunchbaseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></Icon> ); // Placeholder
export const MailIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></Icon> );
export const Lock: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Icon> );
export const Target: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></Icon> );
export const Plus: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></Icon> );
export const Users: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Icon> );
export const Clock: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></Icon> );
export const Trophy: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></Icon> );
export const Zap: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></Icon> );
export const AlertCircle: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></Icon> );
export const Play: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><polygon points="5 3 19 12 5 21 5 3" /></Icon> );
export const Pause: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></Icon> );
export const ArrowLeft: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></Icon> );
export const Calendar: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></Icon> );
export const ChevronRight: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><polyline points="9 18 15 12 9 6" /></Icon> );
export const TrendingUp: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></Icon> );
export const BarChart3: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></Icon> );
export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></Icon> );
export const Download: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></Icon> );
export const XCircle: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></Icon> );
export const Save: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></Icon> );
export const MagicWandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><path d="M15 4V2" /><path d="M15 16v-2" /><path d="M8 9h2" /><path d="M20 9h2" /><path d="M17.8 11.8 19 13" /><path d="M15 9h.01" /><path d="M17.8 6.2 19 5" /><path d="m3 21 9-9" /><path d="M12.2 6.2 11 5" /></Icon> );
export const MessageCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></Icon> );
export const Loader: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" /></Icon> );
export const Send: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></Icon> );
export const Award: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 17 17 23 15.79 13.88" /></Icon> );
export const FileText: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></Icon> );
export const Code: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></Icon> );
export const UserCheck: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></Icon> );
export const Upload: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></Icon> );
export const LogOut: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></Icon> );
export const Settings: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></Icon> );
export const Star: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></Icon> );
{/* FIX: Added missing Search icon component. */}
export const Search: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( <Icon {...props}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></Icon> );

export default Icon;