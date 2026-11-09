import React, { useState } from 'react';
import {
  UserRole,
  Agency,
  MemberProfile,
  ReferralLead,
  ReferralStatus,
  LedgerEntry,
  StateRule,
  PaymentMethodPreference
} from './types';
import {
  INITIAL_AGENCIES,
  STATE_RULES,
  INITIAL_MEMBERS,
  INITIAL_LEADS,
  INITIAL_LEDGER,
  ACADEMY_LESSONS,
  SHARE_TEMPLATES,
  COMPETITIONS_DATA
} from './mockData';
import { HeaderRoleSwitcher } from './components/HeaderRoleSwitcher';
import { SuperAdminView } from './components/SuperAdminView';
import { AgencyAdminView } from './components/AgencyAdminView';
import { StaffLeadWorkerView } from './components/StaffLeadWorkerView';
import { MemberPortalView } from './components/MemberPortalView';
import { PublicReferredLanding } from './components/PublicReferredLanding';
import { evaluateStateCompliance, calculateFourthFridayPayday } from './services/payoutEngine';
import { Info, Shield, CheckCircle } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.MEMBER);
  const [agencies, setAgencies] = useState<Agency[]>(INITIAL_AGENCIES);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>('agency-healthlink');
  const [stateRules, setStateRules] = useState<StateRule[]>(STATE_RULES);
  const [members, setMembers] = useState<MemberProfile[]>(INITIAL_MEMBERS);
  const [leads, setLeads] = useState<ReferralLead[]>(INITIAL_LEADS);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(INITIAL_LEDGER);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  // Active agency
  const currentAgency = agencies.find((a) => a.id === selectedAgencyId) || agencies[0];

  // Active member for Member view
  const currentMember =
    members.find((m) => m.agencyId === currentAgency.id) || members[0];

  // Handler: Add new agency (Super Admin)
  const handleAddAgency = (newAgency: Agency) => {
    setAgencies((prev) => [...prev, newAgency]);
  };

  // Handler: Toggle Agency subscription
  const handleToggleAgencyStatus = (agencyId: string) => {
    setAgencies((prev) =>
      prev.map((a) =>
        a.id === agencyId
          ? {
              ...a,
              subscriptionStatus: a.subscriptionStatus === 'CANCELLED' ? 'ACTIVE' : 'CANCELLED'
            }
          : a
      )
    );
  };

  // Handler: Update State Rules
  const handleUpdateStateCap = (state: string, newMax: number, annualCap: number) => {
    setStateRules((prev) =>
      prev.map((r) => (r.state === state ? { ...r, maxPerReferral: newMax, annualCap } : r))
    );
  };

  // Handler: Update Agency Branding
  const handleUpdateAgencyBranding = (branding: Agency['branding']) => {
    setAgencies((prev) =>
      prev.map((a) => (a.id === currentAgency.id ? { ...a, branding } : a))
    );
  };

  // Handler: Qualify / Disqualify lead (Agency Admin / Staff)
  const handleQualifyLead = (leadId: string, isInterested: boolean, reason?: string) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    if (isInterested) {
      // Evaluate state cap rule
      const compliance = evaluateStateCompliance(
        targetLead.referredState,
        stateRules,
        currentMember.totalEarnedToDate,
        25
      );

      // Create ledger line
      const now = new Date();
      const fourthFriday = calculateFourthFridayPayday(now.getFullYear(), now.getMonth());

      const newLedgerLine: LedgerEntry = {
        id: `ledg-${Date.now()}`,
        agencyId: targetLead.agencyId,
        memberId: targetLead.memberId,
        memberName: targetLead.memberName,
        type: 'REFERRAL',
        amount: 25,
        cappedAmount: compliance.approvedAmount,
        stateRuleCode: `${compliance.ruleApplied.state}-2026`,
        status: compliance.isCapped && compliance.approvedAmount === 0 ? 'CAPPED_EXCEEDED' : 'READY_PAYDAY',
        cutoffDate: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
        payDate: fourthFriday.payday.toISOString(),
        notes: `Qualified referral for ${targetLead.referredName}. ${compliance.capMessage || ''}`
      };

      setLedgerEntries((prev) => [newLedgerLine, ...prev]);

      // Update lead
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? {
                ...l,
                status: ReferralStatus.QUALIFIED,
                qualifiedAt: new Date().toISOString(),
                notes: [...l.notes, `Agent verified consultation & genuine interest. Created $${compliance.approvedAmount} ledger line.`]
              }
            : l
        )
      );

      // Update member counters
      setMembers((prev) =>
        prev.map((m) =>
          m.id === targetLead.memberId
            ? {
                ...m,
                qualifiedCount: m.qualifiedCount + 1,
                totalEarnedToDate: m.totalEarnedToDate + compliance.approvedAmount
              }
            : m
        )
      );
    } else {
      // Disqualified
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? {
                ...l,
                status: ReferralStatus.NOT_QUALIFIED,
                disqualificationReason: reason || 'Did not show genuine interest',
                notes: [...l.notes, `Disqualified: ${reason || 'Lead did not show interest'}`]
              }
            : l
        )
      );
    }
  };

  // Handler: Update lead status (Producer outreach)
  const handleUpdateLeadStatus = (leadId: string, newStatus: ReferralStatus, note: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status: newStatus,
              notes: [...l.notes, `${new Date().toLocaleDateString()}: ${note}`]
            }
          : l
      )
    );
  };

  // Handler: Mark ledger line paid
  const handleMarkLedgerPaid = (ledgerId: string) => {
    setLedgerEntries((prev) =>
      prev.map((l) =>
        l.id === ledgerId
          ? {
              ...l,
              status: 'PAID',
              paidOn: new Date().toISOString()
            }
          : l
      )
    );
  };

  const handleMarkBulkPaid = () => {
    const nowIso = new Date().toISOString();
    setLedgerEntries((prev) =>
      prev.map((l) =>
        l.agencyId === currentAgency.id && l.status !== 'PAID'
          ? { ...l, status: 'PAID', paidOn: nowIso }
          : l
      )
    );
    alert('Marked all pending ledger lines as paid! Member dashboards updated.');
  };

  // Handler: Submit Referral (from Member or Public landing)
  const handleSubmitReferral = (newLeadData: Partial<ReferralLead>) => {
    // Automated fraud detection checks:
    let flagFraud: string | undefined = undefined;
    if (
      newLeadData.referredPhone === currentMember.phone ||
      newLeadData.referredEmail === currentMember.email
    ) {
      flagFraud = 'SELF_REFERRAL_DETECTED';
    }

    const createdLead: ReferralLead = {
      id: `lead-${Date.now()}`,
      agencyId: currentAgency.id,
      memberId: currentMember.id,
      memberName: currentMember.name,
      referredName: newLeadData.referredName || 'Anonymous Friend',
      referredPhone: newLeadData.referredPhone || '',
      referredEmail: newLeadData.referredEmail || '',
      referredState: newLeadData.referredState || 'TX',
      bestTimeToCall: newLeadData.bestTimeToCall || 'Anytime',
      consentChecked: true,
      consentTimestamp: new Date().toISOString(),
      source: newLeadData.source || 'LINK',
      status: ReferralStatus.RECEIVED,
      notes: [`${new Date().toLocaleDateString()}: Referral created via ${newLeadData.source || 'LINK'}`],
      flagFraud,
      createdAt: new Date().toISOString()
    };

    setLeads((prev) => [createdLead, ...prev]);
  };

  // Handler: Complete Academy Lesson
  const handleCompleteLesson = (lessonId: string, badgeId: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === currentMember.id && !m.badgesUnlocked.includes(badgeId)
          ? { ...m, badgesUnlocked: [...m.badgesUnlocked, badgeId] }
          : m
      )
    );
  };

  // Handler: Update Payment Preference
  const handleUpdatePaymentPreference = (
    method: PaymentMethodPreference,
    details: string
  ) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === currentMember.id
          ? { ...m, paymentPreference: method, payoutRoutingDetails: details }
          : m
      )
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation & Role Switcher */}
      <HeaderRoleSwitcher
        currentRole={currentRole}
        setRole={setCurrentRole}
        selectedAgency={currentAgency}
        setAgencyId={setSelectedAgencyId}
        allAgencies={agencies}
        onOpenInfoModal={() => setShowInfoModal(true)}
      />

      {/* Main Role Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentRole === UserRole.SUPER_ADMIN && (
          <SuperAdminView
            agencies={agencies}
            onAddAgency={handleAddAgency}
            onToggleStatus={handleToggleAgencyStatus}
            stateRules={stateRules}
            onUpdateStateCap={handleUpdateStateCap}
            globalCompetition={COMPETITIONS_DATA[1]}
            onSwitchToAgency={(id) => {
              setSelectedAgencyId(id);
              setCurrentRole(UserRole.AGENCY_ADMIN);
            }}
          />
        )}

        {currentRole === UserRole.AGENCY_ADMIN && (
          <AgencyAdminView
            agency={currentAgency}
            onUpdateBranding={handleUpdateAgencyBranding}
            leads={leads}
            onQualifyLead={handleQualifyLead}
            ledgerEntries={ledgerEntries}
            onMarkLedgerPaid={handleMarkLedgerPaid}
            onMarkBulkPaid={handleMarkBulkPaid}
            stateRules={stateRules}
            onSendMockCsvInvites={(count) => {
              console.log(`Mock sent ${count} invites`);
            }}
          />
        )}

        {currentRole === UserRole.STAFF && (
          <StaffLeadWorkerView
            agency={currentAgency}
            leads={leads}
            onUpdateLeadStatus={handleUpdateLeadStatus}
            onQualifyLead={(id, interested) => handleQualifyLead(id, interested)}
          />
        )}

        {currentRole === UserRole.MEMBER && (
          <MemberPortalView
            agency={currentAgency}
            member={currentMember}
            leads={leads}
            onSubmitReferral={handleSubmitReferral}
            ledgerEntries={ledgerEntries}
            lessons={ACADEMY_LESSONS}
            onCompleteLesson={handleCompleteLesson}
            templates={SHARE_TEMPLATES}
            competition={COMPETITIONS_DATA[0]}
            onUpdatePaymentPreference={handleUpdatePaymentPreference}
          />
        )}

        {currentRole === UserRole.PUBLIC_LEAD && (
          <PublicReferredLanding
            agency={currentAgency}
            referralCode={currentMember.referralCode}
            onSubmitContactForm={handleSubmitReferral}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Referral Rocket Platform • HealthLink Insurance Agency LLC Multi-Tenant Build
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>4th-Friday Payouts</span>
            <span>•</span>
            <span>State Regulatory Caps Enforced</span>
            <span>•</span>
            <span>Walled-off Tenant Isolation</span>
          </div>
        </div>
      </footer>

      {/* SYSTEM ARCHITECTURE INFO MODAL */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  HealthLink Referral Engine — System Specification
                </h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <p>
                <strong>Architecture & Branding Rules:</strong> HealthLink Insurance Agency LLC owns Referral Rocket behind the scenes. HealthLink runs its own program as Tenant #1 (comped), and partner agencies subscribe at <strong>$100/month</strong>. Partner agencies and their members see only Referral Rocket and their own agency's brand. HealthLink's name appears only to HealthLink's own members in its program, <em>Share the Health</em>.
              </p>

              <div className="p-3.5 bg-blue-50 text-blue-950 rounded-xl space-y-1">
                <strong>4th-Friday Payout Schedule & Cutoff:</strong>
                <ul className="list-disc list-inside space-y-0.5 mt-1">
                  <li>Payday = 4th Friday of each month. When landing on bank holiday, pays the business day before (e.g. Dec 25 Christmas holiday pays Thursday, Dec 24).</li>
                  <li>Cutoff = referrals qualified by 11:59 pm on the last day of prior month.</li>
                  <li>Agencies pay their own members directly; Referral Rocket never holds funds.</li>
                </ul>
              </div>

              <div className="p-3.5 bg-emerald-50 text-emerald-950 rounded-xl space-y-1">
                <strong>Lead Qualification & Anti-Fraud:</strong>
                <p>
                  A referral earns $25 only when the person shows up for an appointment and is genuinely interested. Automated checks flag self-referrals, duplicates, and existing clients.
                </p>
              </div>

              <div className="p-3.5 bg-amber-50 text-amber-950 rounded-xl space-y-1">
                <strong>Master State-Rules Table:</strong>
                <p>
                  Platform-level table capping payments per referral and per year according to member's state of residence (e.g. TX, FL, CA, NY caps).
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl mt-4"
            >
              Got it, Close Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
