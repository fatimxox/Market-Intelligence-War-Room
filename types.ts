export enum UserRole {
  ADMIN = 'Admin',
  TEAM_LEADER = 'Team Leader',
  PLAYER = 'Player',
}

export type BattleRole = 'market_commander' | 'arsenal_ranger' | 'capital_quartermaster' | 'customer_analyst' | 'alliance_broker';

export enum MissionStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  RECRUITING = 'recruiting',
  ACTIVE = 'active',
  EVALUATION = 'evaluation',
  COMPLETED = 'completed',
}

export type User = {
  id: string;
  displayName: string;
  email: string;
  password?: string;
  role: UserRole;
  avatarUrl?: string;
  total_missions?: number;
  missions_won?: number;
  preferred_battle_role?: BattleRole;
};

export type PlayerAssignment = {
  email: string;
  display_name: string;
  battle_role: BattleRole | null;
};

export type Team = {
  id: string;
  mission_id: string;
  team_name: 'alpha' | 'beta';
  team_leader_email: string;
  members: PlayerAssignment[];
  report_submitted?: boolean;
  submission_timestamp?: string;
};

export type Mission = {
  id:string;
  title: string;
  target_company: string;
  description: string;
  max_players_per_team: number;
  time_limit_minutes: number;
  status: MissionStatus;
  created_by_admin: string;
  mission_start_time?: string;
  winner_team?: 'alpha' | 'beta' | 'tie';
  team_alpha_score?: number;
  team_beta_score?: number;
};

export type ChatMessage = {
  id: string;
  userId: string;
  userDisplayName: string;
  message: string;
  timestamp: string;
};

// --- WAR ROOM DATA STRUCTURES ---

export interface Founder {
  fullName: string; foundingYear: string; currentRole: string; previousVentures: string; contactEmail: string; linkedinUrl: string; phoneNo: string; sourceLink: string; notes: string;
}
export interface Executive {
  name: string; title: string; function: string; yearsWithFirm: string; contactEmail: string; linkedinUrl: string; phoneNo: string; sourceLink: string; notes: string;
}
export interface MarketSize {
  tam: string; sam: string; som: string; annualGrowthRate: string; notes: string; sourceLink: string;
}
export interface CompetitivePosition {
  rank: string; company: string; share: string; differentiators: string; benchmarks: string; sourceLink: string;
}
export interface GeographicFootprint {
  location: string; openedYear: string; facilityType: string; sourceLink: string; notes: string;
}
export interface ProductLine {
  productName: string; productType: string; launchDate: string; category: string; targetSegment: string; keyFeatures: string; pricingModel: string; price: string; reviewsScore: string; primaryCompetitors: string; sourceLink: string; notes: string;
}
export interface PricingChange {
  date: string; oldPrice: string; newPrice: string; reason: string; sourceLink: string; notes: string;
}
export interface Platform {
  platformName: string; pageLink: string; followers: string; engagementRate: string; runningAds: string; sourceLink: string; notes: string;
}
export interface InfluencerPartnership {
  influencerName: string; totalFollowers: string; platforms: string; campaign: string; sourceLink: string; notes: string;
}
export interface GetInvestment {
  amount: string; yesNo: string; rounds: string; sourceLink: string;
}
export interface FundingRound {
  date: string;
  series: string;
  amount: string;
  numberOfInvestors: string;
  investors: string;
  leadInvestor: string;
  notes: string;
}
export interface Investor {
  name: string; type: string; stake: string; sourceLink: string; notes: string;
}
export interface RevenueValuation {
  revenue: string; growthRate: string; latestValuation: string; notes: string; sourceLink: string;
}
export interface B2CSegment {
  age: string; income: string; educationalLevel: string; interestsLifestyle: string; behavior: string; needsPainPoints: string; location: string; revenueShare: string; sourceLink: string; notes: string;
}
export interface B2BSegment {
  businessSize: string; industry: string; revenueTargeted: string; technographic: string; behavior: string; needsPainPoints: string; revenueShare: string; sourceLink: string; notes: string;
}
export interface Reviews {
  avgRating: string; positive: string; negative: string; commonThemes: string; sourceLink: string;
}
export interface PainPoint {
  description: string; impact: string; frequency: string; suggestedFix: string; sourceLink: string; notes: string;
}
export interface StrategicPartner {
  name: string; type: string; region: string; startDate: string; sourceLink: string; notes: string;
}
export interface KeySupplier {
  name: string; commodity: string; region: string; contractValue: string; sourceLink: string; notes: string;
}
export interface GrowthRates {
  period: string; revenueGrowth: string; userGrowth: string; sourceLink: string;
}
export interface Expansion {
  type: string; regionMarket: string; date: string; investment: string; sourceLink: string; notes: string;
}

export type IntelligenceData = {
  companyName: string;
  companyBrief: string;
  battle1_leadership: {
    founders: Founder[];
    executives: Executive[];
    marketSize: MarketSize;
    competitivePosition: CompetitivePosition[];
    geographicFootprint: GeographicFootprint[];
  },
  battle2_products: {
    productLines: ProductLine[];
    pricingChanges: PricingChange[];
    platforms: Platform[];
    influencerPartnerships: InfluencerPartnership[];
  },
  battle3_funding: {
    getInvestment: GetInvestment;
    fundingRounds: FundingRound[];
    investors: Investor[];
    revenueValuation: RevenueValuation;
  },
  battle4_customers: {
    b2cSegments: B2CSegment[];
    b2bSegments: B2BSegment[];
    reviews: Reviews;
    painPoints: PainPoint[];
  },
  battle5_alliances: {
    strategicPartners: StrategicPartner[];
    keySuppliers: KeySupplier[];
    growthRates: GrowthRates;
    expansions: Expansion[];
  }
};

export type Report = {
  id: string;
  mission_id: string;
  team_name: 'alpha' | 'beta';
  battle_data: IntelligenceData;
}