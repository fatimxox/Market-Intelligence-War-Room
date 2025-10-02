import React from 'react';
import { IntelligenceData, BattleRole } from './types';
import { Crown, Crosshair, DollarSign, Eye, Shield, GoogleIcon, LinkedInIcon, CrunchbaseIcon } from './components/icons';

// --- BATTLE & ROLE CONSTANTS ---

export const BATTLE_CONFIGS = {
  battle1_leadership: {
    name: 'BATTLE 1: Leadership Recon & Market Dominance',
    icon: (props: React.SVGProps<SVGSVGElement>) => React.createElement(Crown, props),
    color: 'text-red-400'
  },
  battle2_products: {
    name: 'BATTLE 2: Product Arsenal & Social Signals Strike', 
    icon: (props: React.SVGProps<SVGSVGElement>) => React.createElement(Crosshair, props),
    color: 'text-blue-400'
  },
  battle3_funding: {
    name: 'BATTLE 3: Funding Fortification',
    icon: (props: React.SVGProps<SVGSVGElement>) => React.createElement(DollarSign, props),
    color: 'text-green-400'
  },
  battle4_customers: {
    name: 'BATTLE 4: Customer Frontlines',
    icon: (props: React.SVGProps<SVGSVGElement>) => React.createElement(Eye, props),
    color: 'text-purple-400'
  },
  battle5_alliances: {
    name: 'BATTLE 5: Alliance Forge & Growth Offensive',
    icon: (props: React.SVGProps<SVGSVGElement>) => React.createElement(Shield, props),
    color: 'text-orange-400'
  }
};

export const ROLE_BATTLE_MAP: Record<BattleRole, keyof Omit<IntelligenceData, 'companyName' | 'companyBrief'>> = {
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
  google: { name: 'Google', icon: (props: React.SVGProps<SVGSVGElement>) => React.createElement(GoogleIcon, props), url: 'https://www.google.com/search?q=' },
  linkedin: { name: 'LinkedIn', icon: (props: React.SVGProps<SVGSVGElement>) => React.createElement(LinkedInIcon, props), url: 'https://www.linkedin.com/search/results/all/?keywords=' },
  crunchbase: { name: 'Crunchbase', icon: (props: React.SVGProps<SVGSVGElement>) => React.createElement(CrunchbaseIcon, props), url: 'https://www.crunchbase.com/textsearch?q=' },
};

export const emptyFounder = { fullName: '', foundingYear: '', currentRole: '', previousVentures: '', contactEmail: '', linkedinUrl: '', phoneNo: '', sourceLink: '', notes: '' };
export const emptyExecutive = { name: '', title: '', function: '', yearsWithFirm: '', contactEmail: '', linkedinUrl: '', phoneNo: '', sourceLink: '', notes: '' };
export const emptyCompetitivePosition = { rank: '', company: '', share: '', differentiators: '', benchmarks: '', sourceLink: '' };
export const emptyGeographicFootprint = { location: '', openedYear: '', facilityType: '', sourceLink: '', notes: '' };
export const emptyProductLine = { productName: '', productType: '', launchDate: '', category: '', targetSegment: '', keyFeatures: '', pricingModel: '', price: '', reviewsScore: '', primaryCompetitors: '', sourceLink: '', notes: '' };
export const emptyPricingChange = { date: '', oldPrice: '', newPrice: '', reason: '', sourceLink: '', notes: '' };
export const emptyPlatform = { platformName: '', pageLink: '', followers: '', engagementRate: '', runningAds: '', sourceLink: '', notes: '' };
export const emptyInfluencerPartnership = { influencerName: '', totalFollowers: '', platforms: '', campaign: '', sourceLink: '', notes: '' };
export const emptyFundingRound = { date: '', series: '', amount: '', numberOfInvestors: '', investors: '', leadInvestor: '', notes: '' };
export const emptyInvestor = { name: '', type: '', stake: '', sourceLink: '', notes: '' };
export const emptyB2CSegment = { age: '', income: '', educationalLevel: '', interestsLifestyle: '', behavior: '', needsPainPoints: '', location: '', revenueShare: '', sourceLink: '', notes: '' };
export const emptyB2BSegment = { businessSize: '', industry: '', revenueTargeted: '', technographic: '', behavior: '', needsPainPoints: '', revenueShare: '', sourceLink: '', notes: '' };
export const emptyPainPoint = { description: '', impact: '', frequency: '', suggestedFix: '', sourceLink: '', notes: '' };
export const emptyStrategicPartner = { name: '', type: '', region: '', startDate: '', sourceLink: '', notes: '' };
export const emptyKeySupplier = { name: '', commodity: '', region: '', contractValue: '', sourceLink: '', notes: '' };
export const emptyExpansion = { type: '', regionMarket: '', date: '', investment: '', sourceLink: '', notes: '' };

export const initializeBattleData = (): IntelligenceData => ({
  companyName: '',
  companyBrief: '',
  battle1_leadership: {
    founders: [ { ...emptyFounder }, { ...emptyFounder } ],
    executives: [ { ...emptyExecutive }, { ...emptyExecutive } ],
    marketSize: { tam: '', sam: '', som: '', annualGrowthRate: '', notes: '', sourceLink: '' },
    competitivePosition: [ { ...emptyCompetitivePosition } ],
    geographicFootprint: [ { ...emptyGeographicFootprint }, { ...emptyGeographicFootprint } ]
  },
  battle2_products: {
    productLines: [ { ...emptyProductLine }, { ...emptyProductLine } ],
    pricingChanges: [ { ...emptyPricingChange }, { ...emptyPricingChange } ],
    platforms: [ { ...emptyPlatform }, { ...emptyPlatform } ],
    influencerPartnerships: [ { ...emptyInfluencerPartnership }, { ...emptyInfluencerPartnership } ]
  },
  battle3_funding: {
    getInvestment: { amount: '', yesNo: '', rounds: '', sourceLink: '' },
    fundingRounds: [ { ...emptyFundingRound }, { ...emptyFundingRound } ],
    investors: [ { ...emptyInvestor }, { ...emptyInvestor } ],
    revenueValuation: { revenue: '', growthRate: '', latestValuation: '', notes: '', sourceLink: '' }
  },
  battle4_customers: {
    b2cSegments: [ { ...emptyB2CSegment }, { ...emptyB2CSegment } ],
    b2bSegments: [ { ...emptyB2BSegment }, { ...emptyB2BSegment } ],
    reviews: { avgRating: '', positive: '', negative: '', commonThemes: '', sourceLink: '' },
    painPoints: [ { ...emptyPainPoint }, { ...emptyPainPoint } ]
  },
  battle5_alliances: {
    strategicPartners: [ { ...emptyStrategicPartner }, { ...emptyStrategicPartner } ],
    keySuppliers: [ { ...emptyKeySupplier }, { ...emptyKeySupplier } ],
    growthRates: { period: '', revenueGrowth: '', userGrowth: '', sourceLink: '' },
    expansions: [ { ...emptyExpansion }, { ...emptyExpansion } ]
  }
});


// --- MOCK DATABASE ---
// NOTE: This will be replaced by a real database service.
// The structure is kept in `constants.ts` for easy prototyping.

import { User, UserRole, Mission, MissionStatus, Team, Report } from './types';

const mockUsers: User[] = [
  { id: 'admin-001', displayName: 'Game Master', email: 'ateffatim@gmail.com', role: UserRole.ADMIN, total_missions: 5, missions_won: 4 },
  { id: 'player-1', displayName: 'Alice', email: 'alice@example.com', role: UserRole.PLAYER, total_missions: 3, missions_won: 2, preferred_battle_role: 'arsenal_ranger' },
  { id: 'player-2', displayName: 'Bob', email: 'bob@example.com', role: UserRole.PLAYER, total_missions: 4, missions_won: 1, preferred_battle_role: 'capital_quartermaster' },
  { id: 'player-3', displayName: 'Charlie', email: 'charlie@example.com', role: UserRole.PLAYER, total_missions: 2, missions_won: 2, preferred_battle_role: 'market_commander' },
  { id: 'player-4', displayName: 'Diana', email: 'diana@example.com', role: UserRole.PLAYER, total_missions: 5, missions_won: 3, preferred_battle_role: 'customer_analyst' },
  { id: 'player-5', displayName: 'Ethan', email: 'ethan@example.com', role: UserRole.PLAYER, total_missions: 1, missions_won: 0, preferred_battle_role: 'alliance_broker' },
];

const mockMissions: Mission[] = [
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

const mockTeams: Team[] = [
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

const mockReports: Report[] = [];

export const MOCK_DB = {
  users: mockUsers,
  missions: mockMissions,
  teams: mockTeams,
  reports: mockReports
}