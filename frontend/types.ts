export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN', // Referral Rocket platform owner
  AGENCY_ADMIN = 'AGENCY_ADMIN', // Agency administrator
  STAFF = 'STAFF', // Agent / Producer working leads
  MEMBER = 'MEMBER', // Existing insurance client referrer
  PUBLIC_LEAD = 'PUBLIC_LEAD' // Public view of landing page
}

export enum ReferralStatus {
  RECEIVED = 'RECEIVED',
  CONTACTED = 'CONTACTED',
  APPOINTMENT_SET = 'APPOINTMENT_SET',
  QUALIFIED = 'QUALIFIED',
  NOT_QUALIFIED = 'NOT_QUALIFIED',
  PAID = 'PAID'
}

export enum PaymentMethodPreference {
  ZELLE = 'Zelle',
  ACH = 'Direct Deposit (ACH)',
  CHECK = 'Paper Check',
  GIFT_CARD = 'Digital Visa Gift Card'
}

export interface AgencyBranding {
  primaryColor: string;
  accentColor: string;
  logoText: string;
  programTitle: string; // e.g. "Share the Health" for HealthLink
  tagline: string;
}

export interface Agency {
  id: string;
  name: string;
  subdomain: string;
  isTenantOne: boolean; // HealthLink
  subscriptionStatus: 'ACTIVE' | 'PAST_DUE' | 'COMPED' | 'CANCELLED';
  monthlyFee: number;
  referralRewardAmount: number; // default $25
  branding: AgencyBranding;
  payoutMethodDefault: PaymentMethodPreference;
  stripeCustomerId: string;
  createdAt: string;
}

export interface User {
  id: string;
  agencyId: string;
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  state: string;
  avatarUrl?: string;
}

export interface MemberProfile extends User {
  referralCode: string;
  displayName: string;
  scoreboardOptIn: boolean;
  paymentPreference: PaymentMethodPreference;
  payoutRoutingDetails: string;
  totalEarnedToDate: number;
  totalPaidToDate: number;
  pendingReviewCount: number;
  qualifiedCount: number;
  badgesUnlocked: string[];
}

export interface StateRule {
  state: string;
  maxPerReferral: number;
  annualCap: number;
  rewardTypes: 'CASH_OR_GIFT' | 'GIFT_CARD_ONLY';
  prizesCountTowardCap: boolean;
  legalNotice: string;
}

export interface ReferralLead {
  id: string;
  agencyId: string;
  memberId: string;
  memberName: string;
  referredName: string;
  referredPhone: string;
  referredEmail: string;
  referredState: string;
  bestTimeToCall: string;
  consentChecked: boolean;
  consentTimestamp: string;
  source: 'LINK' | 'DIRECT_FORM' | 'QR_CODE';
  status: ReferralStatus;
  disqualificationReason?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  notes: string[];
  createdAt: string;
  qualifiedAt?: string;
  paidAt?: string;
  flagFraud?: string; // Duplicate check, self-referral flag
}

export interface LedgerEntry {
  id: string;
  agencyId: string;
  memberId: string;
  memberName: string;
  type: 'REFERRAL' | 'PRIZE' | 'ADJUSTMENT';
  amount: number;
  cappedAmount: number;
  stateRuleCode: string;
  status: 'PENDING_CUTOFF' | 'READY_PAYDAY' | 'PAID' | 'CAPPED_EXCEEDED';
  cutoffDate: string;
  payDate: string;
  paidOn?: string;
  notes: string;
}

export interface AcademyLesson {
  id: string;
  title: string;
  duration: string;
  category: 'Target Demographics' | 'Timing & Life Events' | 'Scripts & Compliance';
  summary: string;
  keyScript: string;
  quizQuestion: string;
  quizOptions: string[];
  correctAnswerIndex: number;
  badgeId: string;
  badgeName: string;
  badgeIcon: string;
}

export interface ShareTemplate {
  id: string;
  category: 'Open Enrollment' | 'Turning 65' | 'New Baby' | 'New Job' | 'General Care';
  channel: 'SMS' | 'Email' | 'Social' | 'WhatsApp';
  title: string;
  contentPattern: string; // Has {member_name}, {agency_name}, {referral_link}
  copyCount: number;
}

export interface Competition {
  id: string;
  agencyId: string | 'GLOBAL';
  title: string;
  type: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'ROCKET_LEAGUE';
  window: string;
  prizes: { first: number; second: number; third: number };
  leaderboard: {
    rank: number;
    displayName: string;
    state: string;
    agencyName?: string;
    qualifiedCount: number;
    prizeProjected: number;
  }[];
}
