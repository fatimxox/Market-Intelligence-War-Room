import React from 'react';
import { IntelligenceData, BattleRole, User, UserRole, Mission, MissionStatus, Team, PendingPlayer } from './types.ts';

// --- BATTLE & ROLE CONSTANTS ---

export const BATTLE_CONFIGS = {
  battle1_leadership: {
    name: 'BATTLE 1: Leadership Recon & Market Dominance',
    icon: (props: React.SVGProps<SVGSVGElement>) => <Crown {...props} />,
    color: 'text-red-400'
  },
  battle2_products: {
    name: 'BATTLE 2: Product Arsenal & Social Signals Strike', 
    icon: (props: React.SVGProps<SVGSVGElement>) => <Crosshair {...props} />,
    color: 'text-blue-400'
  },
  battle3_funding: {
    name: 'BATTLE 3: Funding Fortification',
    icon: (props: React.SVGProps<SVGSVGElement>) => <DollarSign {...props} />,
    color: 'text-green-400'
  },
  battle4_customers: {
    name: 'BATTLE 4: Customer Frontlines',
    icon: (props: React.SVGProps<SVGSVGElement>) => <Eye {...props} />,
    color: 'text-purple-400'
  },
  battle5_alliances: {
    name: 'BATTLE 5: Alliance Forge & Growth Offensive',
    icon: (props: React.SVGProps<SVGSVGElement>) => <Shield {...props} />,
    color: 'text-orange-400'
  }
};

export const ROLE_BATTLE_MAP: Record<BattleRole, keyof IntelligenceData> = {
  market_commander: 'battle1_leadership',
  arsenal_ranger: 'battle2_products',
  capital_quartermaster: 'battle3_funding',
  customer_analyst: 'battle4_customers',
  alliance_broker: 'battle5_alliances'
};

export const PREDEFINED_COMPANIES = [
  'Microsoft', 'Apple', 'Google', 'Amazon', 'Meta', 'Tesla', 'Netflix', 'Salesforce',
  'Adobe', 'Oracle', 'IBM', 'Nvidia', 'Intel', 'Cisco', 'PayPal', 'Uber', 'Airbnb',
  'Spotify', 'Zoom', 'Slack', 'Shopify', 'Square', 'Stripe', 'Dropbox', 'Atlassian',
  'ServiceNow', 'Workday', 'MongoDB', 'Snowflake', 'Palantir'
];

export const QUICK_TOOLS = {
  google: { name: 'Google', icon: (props: React.SVGProps<SVGSVGElement>) => <GoogleIcon {...props} />, url: 'https://www.google.com/search?q=' },
  linkedin: { name: 'LinkedIn', icon: (props: React.SVGProps<SVGSVGElement>) => <LinkedInIcon {...props} />, url: 'https://www.linkedin.com/search/results/all/?keywords=' },
  crunchbase: { name: 'Crunchbase', icon: (props: React.SVGProps<SVGSVGElement>) => <CrunchbaseIcon {...props} />, url: 'https://www.crunchbase.com/textsearch?q=' },
};

export const initializeBattleData = (): IntelligenceData => ({
  battle1_leadership: {
    founders: [ { fullName: '', foundingYear: '', currentRole: '', previousVentures: '', contactEmail: '', linkedinUrl: '', phoneNo: '', sourceLink: '', notes: '' } ],
    executives: [ { name: '', title: '', function: '', yearsWithFirm: '', contactEmail: '', linkedinUrl: '', phoneNo: '', sourceLink: '', notes: '' } ],
    marketSize: { tam: '', sam: '', som: '', annualGrowthRate: '', notes: '', sourceLink: '' },
    competitivePosition: [ { rank: '', company: '', share: '', differentiators: '', benchmarks: '', sourceLink: '' } ],
    geographicFootprint: [ { location: '', openedYear: '', facilityType: '', sourceLink: '', notes: '' } ]
  },
  battle2_products: {
    productLines: [ { productName: '', productType: '', launchDate: '', category: '', targetSegment: '', keyFeatures: '', pricingModel: '', price: '', reviewsScore: '', primaryCompetitors: '', sourceLink: '', notes: '' } ],
    pricingChanges: [ { date: '', oldPrice: '', newPrice: '', reason: '', sourceLink: '', notes: '' } ],
    platforms: [ { platformName: '', pageLink: '', followers: '', engagementRate: '', runningAds: '', sourceLink: '', notes: '' } ],
    influencerPartnerships: [ { influencerName: '', totalFollowers: '', platforms: '', campaign: '', sourceLink: '', notes: '' } ]
  },
  battle3_funding: {
    getInvestment: { amount: '', yesNo: '', rounds: '', sourceLink: '' },
    fundingRounds: [ { date: '', series: '', amount: '', investors: '', leadInvestor: '', notes: '' } ],
    investors: [ { name: '', type: '', stake: '', sourceLink: '', notes: '' } ],
    revenueValuation: { revenue: '', growthRate: '', latestValuation: '', notes: '', sourceLink: '' }
  },
  battle4_customers: {
    b2cSegments: [ { age: '', income: '', educationalLevel: '', interestsLifestyle: '', behavior: '', needsPainPoints: '', location: '', revenueShare: '', sourceLink: '', notes: '' } ],
    b2bSegments: [ { businessSize: '', industry: '', revenueTargeted: '', technographic: '', behavior: '', needsPainPoints: '', revenueShare: '', sourceLink: '', notes: '' } ],
    reviews: { avgRating: '', positive: '', negative: '', commonThemes: '', sourceLink: '' },
    painPoints: [ { description: '', impact: '', frequency: '', suggestedFix: '', sourceLink: '', notes: '' } ]
  },
  battle5_alliances: {
    strategicPartners: [ { name: '', type: '', region: '', startDate: '', sourceLink: '', notes: '' } ],
    keySuppliers: [ { name: '', commodity: '', region: '', contractValue: '', sourceLink: '', notes: '' } ],
    growthRates: { period: '', revenueGrowth: '', userGrowth: '', sourceLink: '' },
    expansions: [ { type: '', regionMarket: '', date: '', investment: '', sourceLink: '', notes: '' } ]
  }
});


// --- MOCK DATABASE ---

let mockUsers: User[] = [
  { id: 'admin-001', displayName: 'Game Master', email: 'ateffatim@gmail.com', role: UserRole.ADMIN, total_missions: 5, missions_won: 4 },
  { id: 'player-1', displayName: 'Alice', email: 'alice@example.com', role: UserRole.PLAYER, total_missions: 3, missions_won: 2, preferred_battle_role: 'arsenal_ranger' },
  { id: 'player-2', displayName: 'Bob', email: 'bob@example.com', role: UserRole.PLAYER, total_missions: 4, missions_won: 1, preferred_battle_role: 'capital_quartermaster' },
  { id: 'player-3', displayName: 'Charlie', email: 'charlie@example.com', role: UserRole.PLAYER, total_missions: 2, missions_won: 2, preferred_battle_role: 'market_commander' },
  { id: 'player-4', displayName: 'Diana', email: 'diana@example.com', role: UserRole.PLAYER, total_missions: 5, missions_won: 3, preferred_battle_role: 'customer_analyst' },
  { id: 'player-5', displayName: 'Ethan', email: 'ethan@example.com', role: UserRole.PLAYER, total_missions: 1, missions_won: 0, preferred_battle_role: 'alliance_broker' },
];

let mockMissions: Mission[] = [
  { 
    id: 'mission-001', 
    title: 'Operation Gold Rush',
    target_company: 'Stripe', 
    description: 'Gather comprehensive intelligence on Stripe\'s market position and financial health.',
    max_players_per_team: 5,
    time_limit_minutes: 60,
    status: MissionStatus.RECRUITING,
    created_by_admin: 'ateffatim@gmail.com'
  },
  { 
    id: 'mission-002', 
    title: 'Project Phoenix',
    target_company: 'Figma', 
    description: 'Analyze Figma\'s product strategy and competitive landscape.',
    max_players_per_team: 5,
    time_limit_minutes: 45,
    status: MissionStatus.ACTIVE,
    created_by_admin: 'ateffatim@gmail.com',
    mission_start_time: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: 'mission-003',
    title: 'Operation Chimera',
    target_company: 'OpenAI',
    description: 'Deep dive into OpenAI\'s leadership and funding history.',
    max_players_per_team: 3,
    time_limit_minutes: 90,
    status: MissionStatus.COMPLETED,
    created_by_admin: 'ateffatim@gmail.com',
    winner_team: 'alpha',
    team_alpha_score: 88,
    team_beta_score: 75
  }
];

let mockTeams: Team[] = [
  {
    id: 'team-alpha-002',
    mission_id: 'mission-002',
    team_name: 'alpha',
    team_leader_email: 'alice@example.com',
    members: [
      { email: 'alice@example.com', display_name: 'Alice', battle_role: 'market_commander' },
      { email: 'bob@example.com', display_name: 'Bob', battle_role: 'capital_quartermaster' },
    ]
  },
  {
    id: 'team-beta-002',
    mission_id: 'mission-002',
    team_name: 'beta',
    team_leader_email: 'charlie@example.com',
    members: [
      { email: 'charlie@example.com', display_name: 'Charlie', battle_role: 'arsenal_ranger' },
    ]
  }
];

let mockPendingPlayers: PendingPlayer[] = [
  { id: 'pp-1', mission_id: 'mission-001', player_email: 'diana@example.com', player_name: 'Diana', joined_at: new Date().toISOString(), assigned_to_team: false },
  { id: 'pp-2', mission_id: 'mission-001', player_email: 'ethan@example.com', player_name: 'Ethan', joined_at: new Date().toISOString(), assigned_to_team: false },
];


export const MOCK_DB = {
  users: mockUsers,
  missions: mockMissions,
  teams: mockTeams,
  pendingPlayers: mockPendingPlayers
}

// --- ICON COMPONENTS ---

export const Crown = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>;
export const Crosshair = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M22 12h-4"/><path d="M6 12H2"/><path d="M12 6V2"/><path d="M12 22v-4"/></svg>;
export const DollarSign = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
export const Eye = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
export const Shield = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
export const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.956 0 8.522-3.469 8.522-8.753 0-.646-.054-1.282-.152-1.879z"/></svg>;
export const LinkedInIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
export const CrunchbaseIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M20.721 0H3.279C1.47 0 0 1.469 0 3.279v17.442C0 22.53 1.47 24 3.279 24h17.442C22.53 24 24 22.53 24 20.721V3.279C24 1.469 22.53 0 20.721 0zM8.01 19.349h-3.92v-9.52h3.92zm-1.96-10.74c-1.21 0-2.2-.98-2.2-2.19s.99-2.19 2.2-2.19 2.2.98 2.2 2.19-.99 2.19-2.2 2.19zm13.86 10.74h-3.91v-5.22c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75v5.31h-3.91v-9.52h3.75v1.72h.05c.52-1 1.8-1.64 3.7-1.64 3.96 0 4.69 2.61 4.69 5.99v6.75z"/></svg>;
export const MagicWandIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h.01"/><path d="M17.8 6.2 19 5"/><path d="m5 6.2 1.2 1.2"/><path d="M6.38 11.38 5 13"/><path d="M12 22a2.83 2.83 0 0 0 4-4h-8a2.83 2.83 0 0 0 4 4Z"/><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="M17.66 6.34 19.07 4.93"/></svg>;
export const MessageCircleIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>;
export const Plus = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
export const Target = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
export const Users = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
export const Clock = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
export const Trophy = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;
export const Zap = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>;
export const AlertCircle = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>;
export const Play = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
export const BarChart3 = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>;
export const Send = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>;
export const Minus = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>;
export const ChevronRight = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
export const ArrowLeft = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;
export const Pause = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h4v16H6z"/><path d="M14 4h4v16h-4z"/></svg>;
export const UserCheck = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>;
export const Search = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
export const FileText = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
export const Lock = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
export const TrendingUp = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>;
export const Calendar = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>;
export const Award = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>;
export const Star = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
export const XCircle = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>;
export const ChatBubble = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>;
export const Settings = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
export const Upload = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>;
export const Save = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
export const LogOut = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;