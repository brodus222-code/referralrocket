import React, { useState } from 'react';
import { Agency, ReferralLead, ReferralStatus, LedgerEntry, StateRule } from '../types';
import { getNextUpcomingPayoutCycle, evaluateStateCompliance } from '../services/payoutEngine';
import {
  Users,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Palette,
  CreditCard,
  Download,
  AlertTriangle,
  Send,
  UserCheck
} from 'lucide-react';

interface Props {
  agency: Agency;
  onUpdateBranding: (branding: Agency['branding']) => void;
  leads: ReferralLead[];
  onQualifyLead: (leadId: string, isInterested: boolean, reason?: string) => void;
  ledgerEntries: LedgerEntry[];
  onMarkLedgerPaid: (ledgerId: string) => void;
  onMarkBulkPaid: () => void;
  stateRules: StateRule[];
  onSendMockCsvInvites: (count: number) => void;
}

export const AgencyAdminView: React.FC<Props> = ({
  agency,
  onUpdateBranding,
  leads,
  onQualifyLead,
  ledgerEntries,
  onMarkLedgerPaid,
  onMarkBulkPaid,
  stateRules,
  onSendMockCsvInvites
}) => {
  const [activeTab, setActiveTab] = useState<'LEADS' | 'PAYOUT_RUN' | 'INVITES' | 'BRANDING'>('LEADS');
  const [disqualifyModalLeadId, setDisqualifyModalLeadId] = useState<string | null>(null);
  const [disqualifyReason, setDisqualifyReason] = useState('');
  const [primaryColor, setPrimaryColor] = useState(agency.branding.primaryColor);
  const [programTitle, setProgramTitle] = useState(agency.branding.programTitle);
  const [tagline, setTagline] = useState(agency.branding.tagline);

  const payoutCycle = getNextUpcomingPayoutCycle();

  // Filter agency leads
  const agencyLeads = leads.filter((l) => l.agencyId === agency.id);
  const pendingLeads = agencyLeads.filter(
    (l) => l.status === ReferralStatus.RECEIVED || l.status === ReferralStatus.APPOINTMENT_SET
  );
  const qualifiedLeads = agencyLeads.filter((l) => l.status === ReferralStatus.QUALIFIED);

  // Agency ledger
  const agencyLedger = ledgerEntries.filter((l) => l.agencyId === agency.id);
  const unpaidLedger = agencyLedger.filter((l) => l.status === 'READY_PAYDAY' || l.status === 'PENDING_CUTOFF');
  const totalOwedThisCycle = unpaidLedger.reduce((sum, item) => sum + item.cappedAmount, 0);

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBranding({
      ...agency.branding,
      primaryColor,
      programTitle,
      tagline
    });
    alert('Agency branding settings updated successfully!');
  };

  const submitDisqualification = () => {
    if (!disqualifyModalLeadId || !disqualifyReason.trim()) return;
    onQualifyLead(disqualifyModalLeadId, false, disqualifyReason);
    setDisqualifyModalLeadId(null);
    setDisqualifyReason('');
  };

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Member Name,Amount,Payment Method,Status,Pay Date,Notes']
        .concat(
          agencyLedger.map(
            (e) => `"${e.memberName}",$${e.cappedAmount},"${agency.payoutMethodDefault}","${e.status}","${e.payDate}","${e.notes}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${agency.subdomain}-payout-report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div
        className="rounded-2xl p-6 text-white shadow-md transition-all"
        style={{
          background: `linear-gradient(135deg, ${agency.branding.primaryColor} 0%, #0f172a 100%)`
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-white/80 font-mono text-xs font-semibold tracking-wider uppercase">
              Agency Administrator Console • Subdomain: {agency.subdomain}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
              {agency.name}
            </h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl">
              Program: <strong>"{agency.branding.programTitle}"</strong>. You pay your members $25 per qualified referral on the 4th Friday of each month.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('PAYOUT_RUN')}
              className="bg-white text-slate-900 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md hover:bg-slate-100 flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Prepare Payday Run (${totalOwedThisCycle})
            </button>
          </div>
        </div>

        {/* Quick Agency Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
          <div className="bg-black/20 backdrop-blur-sm p-3.5 rounded-xl">
            <div className="text-white/70 text-xs">Awaiting Qualification</div>
            <div className="text-2xl font-black mt-0.5">{pendingLeads.length} leads</div>
          </div>
          <div className="bg-black/20 backdrop-blur-sm p-3.5 rounded-xl">
            <div className="text-white/70 text-xs">Total Qualified Referrals</div>
            <div className="text-2xl font-black mt-0.5">{qualifiedLeads.length}</div>
          </div>
          <div className="bg-black/20 backdrop-blur-sm p-3.5 rounded-xl">
            <div className="text-white/70 text-xs">Next 4th-Friday Payday</div>
            <div className="text-lg font-bold mt-0.5">
              {payoutCycle.nextPayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
          <div className="bg-black/20 backdrop-blur-sm p-3.5 rounded-xl">
            <div className="text-white/70 text-xs">Preferred Payout Channel</div>
            <div className="text-lg font-bold mt-0.5">{agency.payoutMethodDefault}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('LEADS')}
          className={`pb-3 px-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'LEADS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Referral Leads Inbox ({agencyLeads.length})
        </button>
        <button
          onClick={() => setActiveTab('PAYOUT_RUN')}
          className={`pb-3 px-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'PAYOUT_RUN'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          4th-Friday Payout Ledger ({unpaidLedger.length} Ready)
        </button>
        <button
          onClick={() => setActiveTab('INVITES')}
          className={`pb-3 px-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'INVITES'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Book of Business CSV Invite
        </button>
        <button
          onClick={() => setActiveTab('BRANDING')}
          className={`pb-3 px-3 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'BRANDING'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          White-Label Branding & Colors
        </button>
      </div>

      {/* TAB: LEADS INBOX */}
      {activeTab === 'LEADS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Referred Leads & Qualification Queue</h3>
              <p className="text-xs text-slate-500">
                Rule: A referral earns $25 only when the person shows up for an appointment and is genuinely interested.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3">Referred Lead</th>
                  <th className="px-5 py-3">Referring Member</th>
                  <th className="px-5 py-3">State & Timing</th>
                  <th className="px-5 py-3">Current Status</th>
                  <th className="px-5 py-3">Anti-Fraud Status</th>
                  <th className="px-5 py-3">Agency Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {agencyLeads.map((lead) => {
                  const compliance = evaluateStateCompliance(lead.referredState, stateRules, 100, 25);
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{lead.referredName}</div>
                        <div className="text-xs text-slate-500 font-mono">{lead.referredPhone}</div>
                        <div className="text-xs text-slate-400">{lead.referredEmail}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{lead.memberName}</div>
                        <div className="text-[11px] text-slate-500">Via {lead.source}</div>
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                          {lead.referredState}
                        </span>
                        <div className="text-slate-500 mt-1">{lead.bestTimeToCall}</div>
                      </td>
                      <td className="px-5 py-4">
                        {lead.status === ReferralStatus.QUALIFIED && (
                          <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-1 rounded-full border border-emerald-200">
                            Qualified ($25 Ledger)
                          </span>
                        )}
                        {lead.status === ReferralStatus.APPOINTMENT_SET && (
                          <span className="bg-blue-100 text-blue-800 font-medium text-xs px-2.5 py-1 rounded-full border border-blue-200">
                            Appointment Set
                          </span>
                        )}
                        {lead.status === ReferralStatus.RECEIVED && (
                          <span className="bg-amber-100 text-amber-800 font-medium text-xs px-2.5 py-1 rounded-full border border-amber-200">
                            New Lead Received
                          </span>
                        )}
                        {lead.status === ReferralStatus.NOT_QUALIFIED && (
                          <span className="bg-red-100 text-red-800 font-medium text-xs px-2.5 py-1 rounded-full border border-red-200">
                            Not Qualified
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        {lead.flagFraud ? (
                          <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-red-600" />
                            {lead.flagFraud}
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
                            ✓ Passed Checks
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {lead.status !== ReferralStatus.QUALIFIED && lead.status !== ReferralStatus.NOT_QUALIFIED ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onQualifyLead(lead.id, true)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1 transition-transform active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Qualify ($25)
                            </button>
                            <button
                              onClick={() => setDisqualifyModalLeadId(lead.id)}
                              className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-semibold text-xs px-2.5 py-1.5 rounded-lg border border-slate-200"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Decision Logged</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: PAYOUT RUN */}
      {activeTab === 'PAYOUT_RUN' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                4th-Friday Payout Ledger Report
              </h3>
              <p className="text-xs text-slate-500">
                Five business days before payday, this report is finalized. The agency pays members directly (via {agency.payoutMethodDefault}) and marks paid.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCsv}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3 py-2 rounded-lg border border-slate-300 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV for Bank / Zelle
              </button>
              {unpaidLedger.length > 0 && (
                <button
                  onClick={onMarkBulkPaid}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark All Paid (${totalOwedThisCycle})
                </button>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block">Upcoming Scheduled Pay Date</span>
              <span className="font-bold text-slate-900 text-sm">
                {payoutCycle.nextPayDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Eligibility Cutoff Applied</span>
              <span className="font-bold text-slate-900 text-sm">
                Last day of prior month @ 11:59 pm
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">IRS 1099 Status</span>
              <span className="font-bold text-emerald-700 text-sm">
                Under reporting threshold (all members &lt; $600)
              </span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs">
                <tr>
                  <th className="px-5 py-3">Member Referrer</th>
                  <th className="px-5 py-3">Reward Type</th>
                  <th className="px-5 py-3">Gross / Approved Amount</th>
                  <th className="px-5 py-3">State Cap Check</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {agencyLedger.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400 text-xs">
                      No ledger lines generated yet. Qualify referred leads to generate pending payout entries.
                    </td>
                  </tr>
                ) : (
                  agencyLedger.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{item.memberName}</div>
                        <div className="text-xs text-slate-400 font-mono">ID: {item.memberId}</div>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">
                        ${item.cappedAmount}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                          {item.stateRuleCode}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {item.status === 'PAID' ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            ✓ Paid ({new Date(item.paidOn || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Owed for Payday
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {item.status !== 'PAID' ? (
                          <button
                            onClick={() => onMarkLedgerPaid(item.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-1 rounded"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">Complete</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: INVITES */}
      {activeTab === 'INVITES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Upload Book of Business by CSV</h3>
            <p className="text-xs text-slate-500">
              Launch sequence: Email an invite to your existing insurance clients with your $25 referral offer and a magic login link.
            </p>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-blue-500 transition-colors bg-slate-50/50">
            <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-slate-900">Import Client List (.CSV)</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Required columns: <code>name</code>, <code>phone</code>, <code>email</code>, <code>state</code>.
              Platform stores zero health or medical records.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  onSendMockCsvInvites(50);
                  alert('Uploaded 50 client records! Magic link email invites scheduled to send.');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                Simulate 50 Client CSV Upload
              </button>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
            <strong>Sending Infrastructure Note:</strong> Invites go out from <code>thereferralrocket.com</code> with your agency as the sender (<em>"{agency.name} via Referral Rocket"</em>). No business-texting 10DLC registration required because every SMS referral is shared from the member's own native device.
          </div>
        </div>
      )}

      {/* TAB: BRANDING */}
      {activeTab === 'BRANDING' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">White-Label Branding Settings</h3>
            <p className="text-xs text-slate-500">
              {agency.isTenantOne
                ? 'HealthLink Branding Rule: HealthLink name appears only to HealthLink members & their referred clients under program "Share the Health".'
                : 'Partner Branding Rule: Your members see only your agency brand and Referral Rocket.'}
            </p>
          </div>

          <form onSubmit={handleSaveBranding} className="max-w-xl space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Program Title (Visible to Members)
              </label>
              <input
                type="text"
                value={programTitle}
                onChange={(e) => setProgramTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Program Tagline / Value Proposition
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Brand Theme Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded border border-slate-300 cursor-pointer p-0.5"
                />
                <span className="font-mono text-xs text-slate-600">{primaryColor}</span>
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm"
            >
              Save Branding Settings
            </button>
          </form>
        </div>
      )}

      {/* DISQUALIFY REASON MODAL */}
      {disqualifyModalLeadId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Disqualify Referral Lead</h3>
            <p className="text-xs text-slate-500 mt-1">
              Referral lifecycle rule: Every status change is logged and shown to the member so they always know where each referral stands.
            </p>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason (Shown to Member):
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Lead did not attend consultation appointment; no current need for insurance review."
                value={disqualifyReason}
                onChange={(e) => setDisqualifyReason(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setDisqualifyModalLeadId(null)}
                className="px-3 py-1.5 text-xs text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={submitDisqualification}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg"
              >
                Confirm Disqualification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
