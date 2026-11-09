import {
  Agency,
  MemberProfile,
  ReferralLead,
  ReferralStatus,
  PaymentMethodPreference,
  StateRule,
  LedgerEntry,
  AcademyLesson,
  ShareTemplate,
  Competition,
  UserRole
} from './types';

export const INITIAL_AGENCIES: Agency[] = [
  {
    id: 'agency-healthlink',
    name: 'HealthLink Insurance Agency LLC',
    subdomain: 'healthlink.thereferralrocket.com',
    isTenantOne: true,
    subscriptionStatus: 'COMPED',
    monthlyFee: 0,
    referralRewardAmount: 25,
    branding: {
      primaryColor: '#059669', // Emerald
      accentColor: '#10b981',
      logoText: 'HealthLink Insurance',
      programTitle: 'Share the Health',
      tagline: 'Your health plan partner — earn $25 for every qualified family or friend'
    },
    payoutMethodDefault: PaymentMethodPreference.ZELLE,
    stripeCustomerId: 'cus_hl_internal_01',
    createdAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'agency-apex',
    name: 'Apex Shield Health Partners',
    subdomain: 'apexshield.thereferralrocket.com',
    isTenantOne: false,
    subscriptionStatus: 'ACTIVE',
    monthlyFee: 100,
    referralRewardAmount: 25,
    branding: {
      primaryColor: '#2563eb', // Blue
      accentColor: '#3b82f6',
      logoText: 'Apex Shield Benefits',
      programTitle: 'Apex Referral Champions',
      tagline: 'Care you trust, shared with those you love.'
    },
    payoutMethodDefault: PaymentMethodPreference.ACH,
    stripeCustomerId: 'cus_apex_sub_892',
    createdAt: '2026-02-01T12:00:00Z'
  },
  {
    id: 'agency-sunrise',
    name: 'Sunrise Family Insurance',
    subdomain: 'sunrise.thereferralrocket.com',
    isTenantOne: false,
    subscriptionStatus: 'ACTIVE',
    monthlyFee: 100,
    referralRewardAmount: 25,
    branding: {
      primaryColor: '#ea580c', // Orange
      accentColor: '#f97316',
      logoText: 'Sunrise Health Group',
      programTitle: 'Sunrise Neighbor Perks',
      tagline: 'Neighbors helping neighbors stay covered.'
    },
    payoutMethodDefault: PaymentMethodPreference.GIFT_CARD,
    stripeCustomerId: 'cus_sunrise_991',
    createdAt: '2026-02-15T15:30:00Z'
  }
];

export const STATE_RULES: StateRule[] = [
  {
    state: 'TX',
    maxPerReferral: 25,
    annualCap: 500,
    rewardTypes: 'CASH_OR_GIFT',
    prizesCountTowardCap: true,
    legalNotice: 'Texas Insurance Code prohibits rebating or compensation contingent on binding. Referrals paid on consultation qualification only.'
  },
  {
    state: 'FL',
    maxPerReferral: 25,
    annualCap: 600,
    rewardTypes: 'CASH_OR_GIFT',
    prizesCountTowardCap: true,
    legalNotice: 'Florida statutory guidance allows nominal thank-you tokens up to $25 per qualified referral.'
  },
  {
    state: 'CA',
    maxPerReferral: 25,
    annualCap: 500,
    rewardTypes: 'CASH_OR_GIFT',
    prizesCountTowardCap: false,
    legalNotice: 'California DOI limits consumer compensation to non-licensed referrers.'
  },
  {
    state: 'NY',
    maxPerReferral: 25,
    annualCap: 300,
    rewardTypes: 'GIFT_CARD_ONLY',
    prizesCountTowardCap: true,
    legalNotice: 'New York law strictly caps annual rewards at $300 in promotional merchandise or gift certificates.'
  },
  {
    state: 'GA',
    maxPerReferral: 25,
    annualCap: 500,
    rewardTypes: 'CASH_OR_GIFT',
    prizesCountTowardCap: true,
    legalNotice: 'Georgia insurance rules permit nominal referral fees when not conditioned upon sale.'
  }
];

export const INITIAL_MEMBERS: MemberProfile[] = [
  {
    id: 'mem-101',
    agencyId: 'agency-healthlink',
    role: UserRole.MEMBER,
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    phone: '(512) 555-0192',
    state: 'TX',
    referralCode: 'SARAH-HL26',
    displayName: 'Sarah J.',
    scoreboardOptIn: true,
    paymentPreference: PaymentMethodPreference.ZELLE,
    payoutRoutingDetails: 'sarah.j.zelle@example.com',
    totalEarnedToDate: 175,
    totalPaidToDate: 125,
    pendingReviewCount: 1,
    qualifiedCount: 7,
    badgesUnlocked: ['first_referral', 'academy_grad', 'hat_trick']
  },
  {
    id: 'mem-102',
    agencyId: 'agency-healthlink',
    role: UserRole.MEMBER,
    name: 'David Martinez',
    email: 'david.m@example.com',
    phone: '(214) 555-0318',
    state: 'TX',
    referralCode: 'DAVID-HL88',
    displayName: 'David M.',
    scoreboardOptIn: true,
    paymentPreference: PaymentMethodPreference.ACH,
    payoutRoutingDetails: 'Wells Fargo ending 4821',
    totalEarnedToDate: 350,
    totalPaidToDate: 250,
    pendingReviewCount: 2,
    qualifiedCount: 12,
    badgesUnlocked: ['first_referral', 'academy_grad', 'top_tier', 'streak_champion']
  },
  {
    id: 'mem-103',
    agencyId: 'agency-apex',
    role: UserRole.MEMBER,
    name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    phone: '(305) 555-0774',
    state: 'FL',
    referralCode: 'ELENA-APEX',
    displayName: 'Elena R.',
    scoreboardOptIn: true,
    paymentPreference: PaymentMethodPreference.ZELLE,
    payoutRoutingDetails: 'elena@miamiwork.com',
    totalEarnedToDate: 225,
    totalPaidToDate: 150,
    pendingReviewCount: 1,
    qualifiedCount: 9,
    badgesUnlocked: ['first_referral', 'academy_grad']
  }
];

export const INITIAL_LEADS: ReferralLead[] = [
  {
    id: 'lead-501',
    agencyId: 'agency-healthlink',
    memberId: 'mem-101',
    memberName: 'Sarah Jenkins',
    referredName: 'Marcus Sterling',
    referredPhone: '(512) 555-4421',
    referredEmail: 'marcus.sterling@gmail.com',
    referredState: 'TX',
    bestTimeToCall: 'Afternoons 2-5pm CST',
    consentChecked: true,
    consentTimestamp: '2026-10-18T14:32:00Z',
    source: 'LINK',
    status: ReferralStatus.QUALIFIED,
    notes: [
      '10/18: Lead arrived via Sarah J. referral link.',
      '10/19: Agent called, Marcus showed up to 20-min consultation regarding ACA enrollment.',
      '10/19: Agent verified genuine interest, qualified for $25 reward.'
    ],
    assignedStaffId: 'staff-201',
    assignedStaffName: 'Agent John Davis',
    createdAt: '2026-10-18T14:32:00Z',
    qualifiedAt: '2026-10-19T16:00:00Z'
  },
  {
    id: 'lead-502',
    agencyId: 'agency-healthlink',
    memberId: 'mem-101',
    memberName: 'Sarah Jenkins',
    referredName: 'Chloe Bennett',
    referredPhone: '(512) 555-8832',
    referredEmail: 'chloe.bennett@outlook.com',
    referredState: 'TX',
    bestTimeToCall: 'Mornings 9-11am',
    consentChecked: true,
    consentTimestamp: '2026-10-22T09:15:00Z',
    source: 'DIRECT_FORM',
    status: ReferralStatus.APPOINTMENT_SET,
    notes: [
      '10/22: Sarah submitted Chloe via Refer-Someone form.',
      '10/23: Call scheduled for Thursday 10am to review turning-65 Medicare options.'
    ],
    assignedStaffId: 'staff-201',
    assignedStaffName: 'Agent John Davis',
    createdAt: '2026-10-22T09:15:00Z'
  },
  {
    id: 'lead-503',
    agencyId: 'agency-healthlink',
    memberId: 'mem-102',
    memberName: 'David Martinez',
    referredName: 'Anthony Lopez',
    referredPhone: '(214) 555-9011',
    referredEmail: 'anthony.lopez@yahoo.com',
    referredState: 'TX',
    bestTimeToCall: 'Anytime',
    consentChecked: true,
    consentTimestamp: '2026-10-24T11:00:00Z',
    source: 'QR_CODE',
    status: ReferralStatus.RECEIVED,
    notes: ['10/24: Scanned David QR code at community event. Pending initial outreach.'],
    createdAt: '2026-10-24T11:00:00Z'
  },
  {
    id: 'lead-504',
    agencyId: 'agency-healthlink',
    memberId: 'mem-102',
    memberName: 'David Martinez',
    referredName: 'David Martinez Jr.',
    referredPhone: '(214) 555-0318',
    referredEmail: 'david.m@example.com',
    referredState: 'TX',
    bestTimeToCall: 'Evening',
    consentChecked: true,
    consentTimestamp: '2026-10-20T10:00:00Z',
    source: 'DIRECT_FORM',
    status: ReferralStatus.NOT_QUALIFIED,
    disqualificationReason: 'Fraud Check Triggered: Matching phone & email with existing member (self-referral).',
    flagFraud: 'SELF_REFERRAL_DETECTED',
    notes: ['System automated fraud protection flagged duplicate contact info.'],
    createdAt: '2026-10-20T10:00:00Z'
  },
  {
    id: 'lead-505',
    agencyId: 'agency-apex',
    memberId: 'mem-103',
    memberName: 'Elena Rostova',
    referredName: 'Patricia Gomez',
    referredPhone: '(305) 555-1290',
    referredEmail: 'patricia.gomez@gmail.com',
    referredState: 'FL',
    bestTimeToCall: '1pm EST',
    consentChecked: true,
    consentTimestamp: '2026-10-15T10:00:00Z',
    source: 'LINK',
    status: ReferralStatus.QUALIFIED,
    notes: ['10/16: Consult completed. Marked qualified.'],
    createdAt: '2026-10-15T10:00:00Z',
    qualifiedAt: '2026-10-16T15:00:00Z'
  }
];

export const INITIAL_LEDGER: LedgerEntry[] = [
  {
    id: 'ledg-801',
    agencyId: 'agency-healthlink',
    memberId: 'mem-101',
    memberName: 'Sarah Jenkins',
    type: 'REFERRAL',
    amount: 25,
    cappedAmount: 25,
    stateRuleCode: 'TX-2026',
    status: 'READY_PAYDAY',
    cutoffDate: '2026-10-31T23:59:59Z',
    payDate: '2026-11-27T00:00:00Z',
    notes: 'Qualified referral: Marcus Sterling (Lead #501)'
  },
  {
    id: 'ledg-802',
    agencyId: 'agency-healthlink',
    memberId: 'mem-101',
    memberName: 'Sarah Jenkins',
    type: 'REFERRAL',
    amount: 25,
    cappedAmount: 25,
    stateRuleCode: 'TX-2026',
    status: 'PAID',
    cutoffDate: '2026-09-30T23:59:59Z',
    payDate: '2026-10-23T00:00:00Z',
    paidOn: '2026-10-23T14:15:00Z',
    notes: 'Qualified referral: Brian Taylor. Disbursed via Zelle.'
  },
  {
    id: 'ledg-803',
    agencyId: 'agency-healthlink',
    memberId: 'mem-102',
    memberName: 'David Martinez',
    type: 'PRIZE',
    amount: 250,
    cappedAmount: 250,
    stateRuleCode: 'TX-2026',
    status: 'PAID',
    cutoffDate: '2026-09-30T23:59:59Z',
    payDate: '2026-10-23T00:00:00Z',
    paidOn: '2026-10-23T14:15:00Z',
    notes: '1st Place September Referral Sprint Champion'
  }
];

export const ACADEMY_LESSONS: AcademyLesson[] = [
  {
    id: 'les-1',
    title: 'Who to Ask: Turning 65 & Medicare Milestones',
    duration: '2 min read',
    category: 'Target Demographics',
    summary: 'Friends turning 65 often feel overwhelmed by endless mailers and confusing options. They need an honest advisor they can trust.',
    keyScript: '"Hey Linda, I remember how crazy Medicare mail got when my parents turned 65. Our advisor John at HealthLink made it totally painless—want me to introduce you?"',
    quizQuestion: 'Why is turning 65 one of the most natural times to refer someone for health insurance review?',
    quizOptions: [
      'They must enroll in specific windows and appreciate trusted human guidance',
      'Because they automatically lose all private coverage immediately',
      'Because Medicare is simple and requires no choices'
    ],
    correctAnswerIndex: 0,
    badgeId: 'senior_navigator',
    badgeName: 'Medicare Navigator',
    badgeIcon: 'Compass'
  },
  {
    id: 'les-2',
    title: 'Life Transitions: New Job, Freelancing & New Babies',
    duration: '3 min read',
    category: 'Timing & Life Events',
    summary: 'Special Enrollment Periods (SEPs) happen when people start consulting, switch companies, or have a child. Timing is critical (usually 60 days).',
    keyScript: '"Congrats on going full-time freelance! The first thing I worried about was insurance, but HealthLink set up my private plan in 20 minutes."',
    quizQuestion: 'How many days do individuals generally have following a Qualifying Life Event to secure health coverage?',
    quizOptions: ['10 days', '60 days', '1 year'],
    correctAnswerIndex: 1,
    badgeId: 'life_events_pro',
    badgeName: 'Life Event Specialist',
    badgeIcon: 'Zap'
  },
  {
    id: 'les-3',
    title: 'The "No Pressure" Rule & Compliance Integrity',
    duration: '2 min read',
    category: 'Scripts & Compliance',
    summary: 'You never sell or promise specific insurance rates. You simply introduce your trusted agency so they can get an expert consultation.',
    keyScript: '"I don\'t know the exact plan that fits your family, but I trust my agent completely. They will review options for free with zero pressure."',
    quizQuestion: 'As a member referrer, what should you never do?',
    quizOptions: [
      'Promise a specific guaranteed quote or binding on behalf of the agency',
      'Share your personal referral link on Facebook or SMS',
      'Ask a friend if they want an introduction to your agent'
    ],
    correctAnswerIndex: 0,
    badgeId: 'compliance_champion',
    badgeName: 'Compliance Champion',
    badgeIcon: 'ShieldCheck'
  }
];

export const SHARE_TEMPLATES: ShareTemplate[] = [
  {
    id: 'tpl-1',
    category: 'Open Enrollment',
    channel: 'SMS',
    title: 'Open Enrollment Friendly Ping',
    contentPattern: 'Hey! Open enrollment is open right now. My agency {agency_name} saved me a ton of time comparing plans. You can get a free review here: {referral_link} (Ask for help if you need it!)',
    copyCount: 142
  },
  {
    id: 'tpl-2',
    category: 'Turning 65',
    channel: 'Email',
    title: 'Turning 65 Stress-Free Intro',
    contentPattern: 'Hi {friend_name},\n\nI know turning 65 brings mountains of confusing Medicare mailers. My personal advisor at {agency_name} walked me through every detail with zero sales pressure.\n\nHere is my direct link if you’d like to speak with them: {referral_link}\n\nWarmly,\n{member_name}',
    copyCount: 89
  },
  {
    id: 'tpl-3',
    category: 'New Job',
    channel: 'WhatsApp',
    title: 'New Freelancer / Job Change Chat',
    contentPattern: 'Congrats on the new role! If you need to set up independent health insurance, connect with {agency_name} here: {referral_link} — they made it super easy for me.',
    copyCount: 104
  },
  {
    id: 'tpl-4',
    category: 'General Care',
    channel: 'Social',
    title: 'Social Media Shout-Out Post',
    contentPattern: 'Huge shoutout to my advisors at {agency_name} for helping me sort out our family health plan this year. If anyone is looking for honest guidance, you can connect directly through my link: {referral_link}',
    copyCount: 215
  }
];

export const COMPETITIONS_DATA: Competition[] = [
  {
    id: 'comp-month-oct',
    agencyId: 'agency-healthlink',
    title: 'October Referral Sprint (Agency Level)',
    type: 'MONTHLY',
    window: 'October 1 – October 31, 2026',
    prizes: { first: 250, second: 100, third: 50 },
    leaderboard: [
      { rank: 1, displayName: 'David M.', state: 'TX', qualifiedCount: 5, prizeProjected: 250 },
      { rank: 2, displayName: 'Sarah J.', state: 'TX', qualifiedCount: 4, prizeProjected: 100 },
      { rank: 3, displayName: 'Carlos V.', state: 'TX', qualifiedCount: 3, prizeProjected: 50 },
      { rank: 4, displayName: 'Rachel K.', state: 'TX', qualifiedCount: 2, prizeProjected: 0 },
      { rank: 5, displayName: 'Mark B.', state: 'TX', qualifiedCount: 1, prizeProjected: 0 }
    ]
  },
  {
    id: 'comp-global-league',
    agencyId: 'GLOBAL',
    title: 'Referral Rocket League (Cross-Agency)',
    type: 'ROCKET_LEAGUE',
    window: 'Fall Quarter 2026 (All Agencies)',
    prizes: { first: 1000, second: 500, third: 250 },
    leaderboard: [
      { rank: 1, displayName: 'David M.', state: 'TX', qualifiedCount: 12, prizeProjected: 1000 },
      { rank: 2, displayName: 'Elena R.', state: 'FL', qualifiedCount: 9, prizeProjected: 500 },
      { rank: 3, displayName: 'Sarah J.', state: 'TX', qualifiedCount: 7, prizeProjected: 250 },
      { rank: 4, displayName: 'Robert H.', state: 'GA', qualifiedCount: 6, prizeProjected: 0 },
      { rank: 5, displayName: 'Jessica P.', state: 'CA', qualifiedCount: 5, prizeProjected: 0 }
    ]
  }
];
