import React, { useState } from 'react';
import { Agency, StateRule, Competition } from '../types';
import { getNextUpcomingPayoutCycle } from '../services/payoutEngine';
import { Building2, DollarSign, ShieldAlert, Award, Calendar, Plus, CheckCircle, Ban, TrendingUp, Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  agencies: Agency[];
  onAddAgency: (agency: Agency) => void;
  onToggleStatus: (agencyId: string) => void;
  stateRules: StateRule[];
  onUpdateStateCap: (state: string, newMax: number, annualCap: number) => void;
  globalCompetition: Competition;
  onSwitchToAgency: (agencyId: string) => void;
}

export const SuperAdminView: React.FC<Props> = ({
  agencies,
  onAddAgency,
  onToggleStatus,
  stateRules,
  onUpdateStateCap,
  globalCompetition,
  onSwitchToAgency
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AGENCIES' | 'STATE_RULES' | 'CALENDAR' | 'LEAGUE'>('OVERVIEW');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgencyName, setNewAgencyName] = useState('');
  const [newSubdomain, setNewSubdomain] = useState('');
  const [newProgramTitle, setNewProgramTitle] = useState('');

  const payoutCycle = getNextUpcomingPayoutCycle();

  // Metrics
  const totalAgencies = agencies.length;
  const payingAgencies = agencies.filter(a => a.subscriptionStatus === 'ACTIVE').length;
  const currentMRR = payingAgencies * 100;

  const handleCreateAgency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgencyName.trim()) return;
    const cleanSub = newSubdomain.trim().toLowerCase().replace(/[^a-z0-9]/g, '') || 'newagency';
    const newAgency: Agency = {
      id: `agency-${Date.now()}`,
      name: newAgencyName,
      subdomain: `${cleanSub}.thereferralrocket.com`,
      isTenantOne: false,
      subscriptionStatus: 'ACTIVE',
      monthlyFee: 100,
      referralRewardAmount: 25,
      branding: {
        primaryColor: '#2563eb',
        accentColor: '#3b82f6',
        logoText: newAgencyName,
        programTitle: newProgramTitle || `${newAgencyName} Rewards`,
        tagline: 'Reliable healthcare referrals rewarded monthly.'
      },
      payoutMethodDefault: 'ACH' as any,
      stripeCustomerId: `cus_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    onAddAgency(newAgency);
    setNewAgencyName('');
    setNewSubdomain('');
    setNewProgramTitle('');
    setShowAddModal(false);
  };

  const chartData = [
    { name: 'HealthLink (Comped)', mrr: 0, referrals: 38 },
    { name: 'Apex Shield ($100)', mrr: 100, referrals: 24 },
    { name: 'Sunrise Family ($100)', mrr: 100, referrals: 18 }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Highlights */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-lg border border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Referral Rocket Master HQ • Owned by HealthLink LLC
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white">
              Platform Super Admin Dashboard
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Multi-tenant insurance referral SaaS engine. HealthLink runs as Tenant #1 (comped), partner agencies subscribe at $100/mo. All sub-accounts enforce the master state rules table and 4th-Friday payout ledger.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-transform active:scale-95 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Onboard Agency ($100/mo)
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-700/60">
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Recurring MRR
            </div>
            <div className="text-2xl font-black mt-1 text-white">${currentMRR}/mo</div>
            <div className="text-xs text-emerald-400 mt-0.5">Stripe Billing Auto-Sync</div>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" /> Active Sub-Accounts
            </div>
            <div className="text-2xl font-black mt-1 text-white">{totalAgencies}</div>
            <div className="text-xs text-slate-300 mt-0.5">{payingAgencies} paid • 1 comped</div>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400" /> Next Payday Run
            </div>
            <div className="text-xl font-bold mt-1 text-white">
              {payoutCycle.nextPayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="text-xs text-purple-300 mt-0.5">{payoutCycle.daysRemaining} days remaining</div>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
            <div className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> State Rules Table
            </div>
            <div className="text-2xl font-black mt-1 text-white">{stateRules.length} States</div>
            <div className="text-xs text-amber-300 mt-0.5">Automated Cap Limits Active</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-3 px-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'OVERVIEW'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Overview & MRR Analytics
        </button>
        <button
          onClick={() => setActiveTab('AGENCIES')}
          className={`pb-3 px-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'AGENCIES'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Sub-Accounts & "Log in as" ({agencies.length})
        </button>
        <button
          onClick={() => setActiveTab('STATE_RULES')}
          className={`pb-3 px-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'STATE_RULES'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Master State-Rules Table
        </button>
        <button
          onClick={() => setActiveTab('CALENDAR')}
          className={`pb-3 px-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'CALENDAR'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          4th-Friday Payday Calendar Rules
        </button>
        <button
          onClick={() => setActiveTab('LEAGUE')}
          className={`pb-3 px-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'LEAGUE'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Cross-Agency League
        </button>
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Agency Network Referral Activity</h3>
                <p className="text-xs text-slate-500">Qualified insurance leads generated across active partner agencies</p>
              </div>
              <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Growing monthly
              </span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="referrals" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Qualified Referrals" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">SaaS Unit Economics</h3>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-xs text-slate-500">Platform Recurring Revenue</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">${payingAgencies * 100 * 12}/yr ARR</div>
              <p className="text-[11px] text-slate-600 mt-1">
                Based on $100/mo partner subscription via Stripe Billing.
              </p>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-xs text-emerald-800 font-semibold">Break-Even Milestone</div>
              <div className="text-sm text-emerald-950 font-medium mt-1">
                Target: 5–10 paying partner agencies covers all server, database, email & infrastructure hosting costs ($300–$1,000/mo).
              </div>
            </div>

            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-xs text-blue-800 font-semibold">Self-Serve Agency Onboarding Target</div>
              <p className="text-xs text-blue-950 mt-1">
                Time to live: <strong>under 30 minutes</strong> with subdomain, logo colors, qualification definition, and CSV member invite upload.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: AGENCIES */}
      {activeTab === 'AGENCIES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Sub-Account Agencies</h3>
              <p className="text-xs text-slate-500">
                Walled-off tenant isolation. Agencies see only their own members, leads, and payouts.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              New Agency Account
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3">Agency Name</th>
                  <th className="px-5 py-3">Subdomain & Branding</th>
                  <th className="px-5 py-3">Plan Status</th>
                  <th className="px-5 py-3">Referral Reward</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {agencies.map((agency) => (
                  <tr key={agency.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: agency.branding.primaryColor }}
                        />
                        {agency.name}
                        {agency.isTenantOne && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                            Owner / Tenant #1
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs font-mono text-slate-500">
                      <div>{agency.subdomain}</div>
                      <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                        Program: "{agency.branding.programTitle}"
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {agency.subscriptionStatus === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> $100/mo Active
                        </span>
                      )}
                      {agency.subscriptionStatus === 'COMPED' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          Comped (Owner)
                        </span>
                      )}
                      {agency.subscriptionStatus === 'PAST_DUE' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          Past Due (14d Grace)
                        </span>
                      )}
                      {agency.subscriptionStatus === 'CANCELLED' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                          <Ban className="w-3 h-3" /> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono font-medium text-slate-800">
                      ${agency.referralRewardAmount} / qualified
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSwitchToAgency(agency.id)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-2.5 py-1 rounded text-xs font-semibold transition-colors"
                        >
                          Log in as Agency
                        </button>
                        {!agency.isTenantOne && (
                          <button
                            onClick={() => onToggleStatus(agency.id)}
                            className="text-xs text-slate-500 hover:text-red-600 transition-colors"
                            title="Toggle account active/suspended"
                          >
                            {agency.subscriptionStatus === 'CANCELLED' ? 'Reactivate' : 'Suspend'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: STATE RULES */}
      {activeTab === 'STATE_RULES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Master Insurance State-Rules Table</h3>
              <p className="text-xs text-slate-500">
                Enforced platform-wide across all agencies. Ledger automatically caps rewards based on member state of residence.
              </p>
            </div>
            <div className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-lg font-medium">
              Legal Rule: Referrals paid only when consumer shows genuine interest, never contingent upon insurance policy purchase.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {stateRules.map((rule) => (
              <div key={rule.state} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-white transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-lg text-slate-900 bg-slate-200 px-2.5 py-0.5 rounded-md font-mono">
                    {rule.state}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    {rule.rewardTypes === 'GIFT_CARD_ONLY' ? 'Gift Card Only' : 'Cash or Gift Card'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Max per Referral</span>
                    <span className="text-slate-900 font-bold text-sm">${rule.maxPerReferral}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Annual Referrer Cap</span>
                    <span className="text-slate-900 font-bold text-sm">${rule.annualCap}/yr</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 italic">
                  "{rule.legalNotice}"
                </p>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Prizes count toward cap: <strong>{rule.prizesCountTowardCap ? 'Yes' : 'No'}</strong>
                  </span>
                  <button
                    onClick={() => {
                      const newMax = prompt(`Enter new Max per Referral for ${rule.state}:`, rule.maxPerReferral.toString());
                      const newCap = prompt(`Enter new Annual Cap for ${rule.state}:`, rule.annualCap.toString());
                      if (newMax && newCap) {
                        onUpdateStateCap(rule.state, Number(newMax), Number(newCap));
                      }
                    }}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: CALENDAR */}
      {activeTab === 'CALENDAR' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">4th-Friday Payout Schedule Engine</h3>
            <p className="text-xs text-slate-500">
              The payout engine is a ledger plus scheduled job. No money held by Referral Rocket; each agency pays its members directly.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
            <h4 className="text-sm font-bold text-blue-950 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Automated Bank Holiday Exception Rule
            </h4>
            <p className="text-xs text-blue-800 mt-1.5 leading-relaxed">
              <strong>Rule 1:</strong> Payday = the 4th Friday of each month. When it lands on a bank holiday, pay the business day before.
              <br />
              <strong>Immediate Example:</strong> December 25, 2026 is the 4th Friday. Christmas Day is a Federal Bank Holiday, so December automatically pays on <strong>Thursday, Dec 24, 2026</strong>.
              <br />
              <strong>Rule 2 Cutoff:</strong> Referrals qualified by 11:59 pm on the last day of the prior month (Oct 28 referral pays Nov 27; Nov 2 referral pays Dec 24).
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3">Payout Cycle</th>
                  <th className="p-3">Cutoff Time (Prior Month End)</th>
                  <th className="p-3">Report Ready (5 Days Prior)</th>
                  <th className="p-3">Scheduled Payday</th>
                  <th className="p-3">Special Rules</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                <tr>
                  <td className="p-3 font-semibold text-slate-900">November 2026</td>
                  <td className="p-3">Oct 31, 2026 @ 11:59pm</td>
                  <td className="p-3">Nov 20, 2026</td>
                  <td className="p-3 font-bold text-blue-600">Friday, Nov 27, 2026</td>
                  <td className="p-3 text-emerald-700">Standard 4th Friday</td>
                </tr>
                <tr className="bg-amber-50/50">
                  <td className="p-3 font-semibold text-slate-900">December 2026</td>
                  <td className="p-3">Nov 30, 2026 @ 11:59pm</td>
                  <td className="p-3">Dec 17, 2026</td>
                  <td className="p-3 font-bold text-amber-700">Thursday, Dec 24, 2026</td>
                  <td className="p-3 text-amber-800 font-semibold">
                    Adjusted! Dec 25 Christmas Holiday
                  </td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold text-slate-900">January 2027</td>
                  <td className="p-3">Dec 31, 2026 @ 11:59pm</td>
                  <td className="p-3">Jan 15, 2027</td>
                  <td className="p-3 font-bold text-blue-600">Friday, Jan 22, 2027</td>
                  <td className="p-3 text-emerald-700">Standard 4th Friday</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: LEAGUE */}
      {activeTab === 'LEAGUE' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Referral Rocket League (Cross-Agency Top Referrers)
              </h3>
              <p className="text-xs text-slate-500">
                Cross-agency competitions show display name and state only, never the agency name, ensuring complete agency client privacy.
              </p>
            </div>
            <div className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
              Prizes: 1st $1,000 | 2nd $500 | 3rd $250
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden mt-2">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs">
                <tr>
                  <th className="px-5 py-3">Rank</th>
                  <th className="px-5 py-3">Referrer Display Name</th>
                  <th className="px-5 py-3">State</th>
                  <th className="px-5 py-3">Qualified Referrals</th>
                  <th className="px-5 py-3">Projected League Prize</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {globalCompetition.leaderboard.map((item) => (
                  <tr key={item.displayName} className={item.rank <= 3 ? 'bg-amber-50/30' : ''}>
                    <td className="px-5 py-3 font-bold font-mono">
                      {item.rank === 1 && '🥇 #1'}
                      {item.rank === 2 && '🥈 #2'}
                      {item.rank === 3 && '🥉 #3'}
                      {item.rank > 3 && `#${item.rank}`}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-900">{item.displayName}</td>
                    <td className="px-5 py-3 font-mono text-slate-600">{item.state}</td>
                    <td className="px-5 py-3 font-black text-blue-600">{item.qualifiedCount}</td>
                    <td className="px-5 py-3 font-mono font-bold text-emerald-700">
                      {item.prizeProjected > 0 ? `$${item.prizeProjected}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD AGENCY */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Onboard Partner Agency</h3>
            <p className="text-xs text-slate-500 mt-1">
              Add a new agency sub-account with their own isolated tenant, branded portal, and $100/mo subscription.
            </p>
            <form onSubmit={handleCreateAgency} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Agency Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Keystone Benefit Solutions"
                  value={newAgencyName}
                  onChange={(e) => setNewAgencyName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subdomain Slug</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="keystone"
                    value={newSubdomain}
                    onChange={(e) => setNewSubdomain(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-l-lg text-sm font-mono focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="bg-slate-100 border border-l-0 border-slate-300 text-slate-500 text-xs px-3 py-2.5 rounded-r-lg font-mono">
                    .thereferralrocket.com
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Program Title</label>
                <input
                  type="text"
                  placeholder="e.g. Keystone Champions Club"
                  value={newProgramTitle}
                  onChange={(e) => setNewProgramTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-blue-50 text-blue-900 rounded-lg text-xs">
                Billing: <strong>$100.00 / month</strong> will be connected via Stripe Billing. HealthLink receives SaaS platform fee.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Create Agency Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
