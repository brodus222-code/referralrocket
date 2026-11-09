import React, { useState } from 'react';
import {
  Agency,
  MemberProfile,
  ReferralLead,
  ReferralStatus,
  LedgerEntry,
  AcademyLesson,
  ShareTemplate,
  Competition,
  PaymentMethodPreference
} from '../types';
import { getNextUpcomingPayoutCycle } from '../services/payoutEngine';
import { generateCustomReferralMessage } from '../services/geminiService';
import {
  Sparkles,
  QrCode,
  Copy,
  Check,
  Send,
  GraduationCap,
  Award,
  DollarSign,
  Calendar,
  Share2,
  CheckCircle2,
  MessageCircle,
  ExternalLink,
  Info
} from 'lucide-react';

interface Props {
  agency: Agency;
  member: MemberProfile;
  leads: ReferralLead[];
  onSubmitReferral: (newLead: Partial<ReferralLead>) => void;
  ledgerEntries: LedgerEntry[];
  lessons: AcademyLesson[];
  onCompleteLesson: (lessonId: string, badgeId: string) => void;
  templates: ShareTemplate[];
  competition: Competition;
  onUpdatePaymentPreference: (method: PaymentMethodPreference, details: string) => void;
}

export const MemberPortalView: React.FC<Props> = ({
  agency,
  member,
  leads,
  onSubmitReferral,
  ledgerEntries,
  lessons,
  onCompleteLesson,
  templates,
  competition,
  onUpdatePaymentPreference
}) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'REFER_NOW' | 'ACADEMY' | 'SHARE_LIBRARY' | 'SCOREBOARD' | 'ACCOUNT'>('DASHBOARD');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Quick refer form
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadState, setLeadState] = useState(member.state || 'TX');
  const [leadBestTime, setLeadBestTime] = useState('Afternoon');
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  // AI generator modal/state
  const [aiOccasion, setAiOccasion] = useState('Open Enrollment');
  const [aiGeneratedText, setAiGeneratedText] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Quiz state
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string>(lessons[0]?.id || '');

  const payoutCycle = getNextUpcomingPayoutCycle();

  // Filter member leads & earnings
  const memberLeads = leads.filter((l) => l.memberId === member.id);
  const qualifiedCount = memberLeads.filter((l) => l.status === ReferralStatus.QUALIFIED).length;
  const pendingCount = memberLeads.filter(
    (l) => l.status === ReferralStatus.RECEIVED || l.status === ReferralStatus.APPOINTMENT_SET
  ).length;

  const earnedThisMonth = qualifiedCount * 25;
  const paidToDate = member.totalPaidToDate;

  const referralLinkUrl = `https://${agency.subdomain}/ref/${member.referralCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLinkUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentConfirmed) {
      alert('Please confirm that your friend agreed to be contacted.');
      return;
    }
    onSubmitReferral({
      referredName: leadName,
      referredPhone: leadPhone,
      referredEmail: leadEmail,
      referredState: leadState,
      bestTimeToCall: leadBestTime,
      consentChecked: true,
      source: 'DIRECT_FORM'
    });
    setLeadName('');
    setLeadPhone('');
    setLeadEmail('');
    setConsentConfirmed(false);
    alert('Thank you! Referral submitted. Our team will reach out to schedule their consultation.');
    setActiveTab('DASHBOARD');
  };

  const handleGenerateAiMessage = async () => {
    setLoadingAi(true);
    const result = await generateCustomReferralMessage(
      aiOccasion,
      member.name.split(' ')[0],
      agency.name,
      'friendly'
    );
    setAiGeneratedText(result.replace('[REFERRAL_LINK]', referralLinkUrl));
    setLoadingAi(false);
  };

  const activeLesson = lessons.find((l) => l.id === activeLessonId) || lessons[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Mobile-First Member App Header */}
      <div
        className="rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${agency.branding.primaryColor} 0%, #0f172a 100%)`
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-white mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {agency.branding.programTitle} Member Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {member.name.split(' ')[0]}!
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-lg">
              Earn $25 for every family or friend who completes a free insurance review. Payouts arrive on the 4th Friday of every month.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('REFER_NOW')}
              className="bg-white text-slate-900 font-extrabold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg hover:bg-slate-100 flex items-center gap-2 active:scale-95 transition-transform"
            >
              <Send className="w-4 h-4 text-emerald-600" />
              Refer Someone
            </button>
            <button
              onClick={handleCopyLink}
              className="bg-black/25 backdrop-blur-md hover:bg-black/40 text-white font-semibold text-xs px-3.5 py-3 rounded-2xl border border-white/20 flex items-center gap-1.5"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? 'Copied' : 'Copy Link'}
            </button>
            <button
              onClick={() => setShowQrModal(true)}
              className="bg-black/25 backdrop-blur-md hover:bg-black/40 text-white p-3 rounded-2xl border border-white/20"
              title="Show QR Code"
            >
              <QrCode className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Earnings Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/20 text-slate-900">
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-sm">
            <div className="text-slate-500 text-[11px] font-semibold flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Earned This Cycle
            </div>
            <div className="text-2xl font-black mt-1 text-slate-900">${earnedThisMonth}</div>
            <div className="text-[11px] text-emerald-700 font-medium">{qualifiedCount} qualified referrals</div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-sm">
            <div className="text-slate-500 text-[11px] font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Next Payday
            </div>
            <div className="text-lg sm:text-xl font-bold mt-1 text-slate-900">
              {payoutCycle.nextPayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="text-[11px] text-blue-700 font-medium">In {payoutCycle.daysRemaining} days</div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-sm">
            <div className="text-slate-500 text-[11px] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
              Paid to Date
            </div>
            <div className="text-2xl font-black mt-1 text-slate-900">${paidToDate}</div>
            <div className="text-[11px] text-slate-500">Sent via {member.paymentPreference}</div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-sm">
            <div className="text-slate-500 text-[11px] font-semibold flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              Scoreboard Rank
            </div>
            <div className="text-2xl font-black mt-1 text-slate-900">#2 in Texas</div>
            <div className="text-[11px] text-amber-700 font-medium">1 lead from #1 spot</div>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('DASHBOARD')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'DASHBOARD'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Referral Tracker ({memberLeads.length})
        </button>
        <button
          onClick={() => setActiveTab('REFER_NOW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'REFER_NOW'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Refer Someone
        </button>
        <button
          onClick={() => setActiveTab('SHARE_LIBRARY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'SHARE_LIBRARY'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Share Library & Texts
        </button>
        <button
          onClick={() => setActiveTab('ACADEMY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'ACADEMY'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Referral Academy
        </button>
        <button
          onClick={() => setActiveTab('SCOREBOARD')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'SCOREBOARD'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Competition Scoreboard
        </button>
        <button
          onClick={() => setActiveTab('ACCOUNT')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'ACCOUNT'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Payment Method
        </button>
      </div>

      {/* TAB: DASHBOARD (Referral Tracker) */}
      {activeTab === 'DASHBOARD' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Your Referrals</h3>
              <p className="text-xs text-slate-500">
                Track each contact in real time. Transparent lifecycle: Received → Appointment Set → Qualified ($25) → Paid.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('REFER_NOW')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              + Add Another
            </button>
          </div>

          <div className="space-y-3">
            {memberLeads.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
                <Share2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No referrals submitted yet.</p>
                <p className="text-xs text-slate-500 mt-1">Share your link or enter a friend's name to earn your first $25!</p>
                <button
                  onClick={() => setActiveTab('REFER_NOW')}
                  className="mt-4 bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg"
                >
                  Refer Someone Now
                </button>
              </div>
            ) : (
              memberLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        {lead.referredName}
                        <span className="text-xs font-normal text-slate-500">({lead.referredState})</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Submitted: {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {lead.status === ReferralStatus.QUALIFIED && (
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Qualified • $25 Ledger
                        </span>
                      )}
                      {lead.status === ReferralStatus.APPOINTMENT_SET && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
                          Appointment Set
                        </span>
                      )}
                      {lead.status === ReferralStatus.RECEIVED && (
                        <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-3 py-1 rounded-full border border-amber-200">
                          Outreach Pending
                        </span>
                      )}
                      {lead.status === ReferralStatus.NOT_QUALIFIED && (
                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full border border-red-200">
                          Not Qualified: {lead.disqualificationReason || 'Did not meet criteria'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lifecycle Stepper Bar */}
                  <div className="grid grid-cols-4 gap-1 pt-1 text-[11px] font-semibold text-center">
                    <div
                      className={`py-1 rounded ${
                        lead.status !== ReferralStatus.NOT_QUALIFIED
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      1. Received
                    </div>
                    <div
                      className={`py-1 rounded ${
                        lead.status === ReferralStatus.APPOINTMENT_SET || lead.status === ReferralStatus.QUALIFIED
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      2. Appointment
                    </div>
                    <div
                      className={`py-1 rounded ${
                        lead.status === ReferralStatus.QUALIFIED
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      3. Qualified ($25)
                    </div>
                    <div className="py-1 rounded bg-slate-200 text-slate-500">
                      4. Paid (4th Friday)
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: REFER NOW (Link & Form) */}
      {activeTab === 'REFER_NOW' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Quick Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Hand off a Name Directly</h3>
            <p className="text-xs text-slate-500">
              When your friend would prefer our agent reach out to them directly.
            </p>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Friend's Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Sterling"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="(555) 000-0000"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <select
                    value={leadState}
                    onChange={(e) => setLeadState(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="TX">Texas (TX)</option>
                    <option value="FL">Florida (FL)</option>
                    <option value="CA">California (CA)</option>
                    <option value="NY">New York (NY)</option>
                    <option value="GA">Georgia (GA)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Best Time</label>
                  <select
                    value={leadBestTime}
                    onChange={(e) => setLeadBestTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="Morning">Mornings (9am - 12pm)</option>
                    <option value="Afternoon">Afternoons (1pm - 5pm)</option>
                    <option value="Evening">Evenings (after 5pm)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <input
                    type="checkbox"
                    required
                    checked={consentConfirmed}
                    onChange={(e) => setConsentConfirmed(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-700 font-medium leading-relaxed">
                    I confirm that this person agreed to be contacted by {agency.name} regarding their health insurance options.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-transform active:scale-95"
              >
                Submit Referral
              </button>
            </form>
          </div>

          {/* Right: Personal Link & Sharing Buttons */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900">Your Personal Referral Link</h3>
              <p className="text-xs text-slate-500">
                When people visit this link, they land on {agency.name}'s dedicated page. You get credit automatically.
              </p>

              <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
                <input
                  type="text"
                  readOnly
                  value={referralLinkUrl}
                  className="bg-transparent text-xs font-mono text-slate-800 flex-1 px-2 outline-none select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="pt-2">
                <span className="text-xs font-semibold text-slate-700 block mb-2">Share from your device:</span>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`sms:?&body=Hey! My insurance team at ${encodeURIComponent(
                      agency.name
                    )} was super helpful. You can get a free plan review here: ${encodeURIComponent(referralLinkUrl)}`}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2 text-xs font-bold text-slate-800"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    Open Text App
                  </a>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(
                      `Trusted insurance referral: ${agency.name}`
                    )}&body=${encodeURIComponent(
                      `Hey!\n\nI recommend having ${agency.name} review your insurance options. You can connect directly here: ${referralLinkUrl}\n\nBest,\n${member.name}`
                    )}`}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2 text-xs font-bold text-slate-800"
                  >
                    <Send className="w-4 h-4 text-blue-600" />
                    Open Email
                  </a>
                </div>
              </div>
            </div>

            {/* AI Generator Helper */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Gemini AI Referral Word-Smith
              </div>
              <p className="text-xs text-indigo-900 leading-relaxed">
                Not sure what to say? Let AI create an authentic message tailored to your friend's situation.
              </p>
              <div className="flex gap-2">
                <select
                  value={aiOccasion}
                  onChange={(e) => setAiOccasion(e.target.value)}
                  className="bg-white border border-indigo-200 rounded-lg text-xs px-2.5 py-1.5 font-medium"
                >
                  <option value="Open Enrollment">Open Enrollment</option>
                  <option value="Turning 65">Turning 65 / Medicare</option>
                  <option value="New Job or Freelance">New Job or Freelancing</option>
                  <option value="New Baby in Family">New Baby</option>
                </select>
                <button
                  onClick={handleGenerateAiMessage}
                  disabled={loadingAi}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex-1 shadow-xs"
                >
                  {loadingAi ? 'Drafting...' : 'Generate Text'}
                </button>
              </div>

              {aiGeneratedText && (
                <div className="mt-3 p-3 bg-white rounded-xl border border-indigo-200 text-xs text-slate-800 space-y-2">
                  <p className="whitespace-pre-line leading-relaxed">{aiGeneratedText}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(aiGeneratedText);
                      alert('Custom message copied to clipboard!');
                    }}
                    className="text-indigo-600 font-bold hover:underline text-[11px] block text-right"
                  >
                    Copy This Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: SHARE LIBRARY */}
      {activeTab === 'SHARE_LIBRARY' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Pre-Written Share Library</h3>
            <p className="text-xs text-slate-500">
              Ready-made texts, emails and social posts with your name and personal link filled in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl) => {
              const formattedContent = tpl.contentPattern
                .replace('{member_name}', member.name)
                .replace('{agency_name}', agency.name)
                .replace('{friend_name}', 'Friend')
                .replace('{referral_link}', referralLinkUrl);

              return (
                <div key={tpl.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-white transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {tpl.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Channel: {tpl.channel}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{tpl.title}</h4>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line font-sans">
                    {formattedContent}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">Copied {tpl.copyCount} times</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(formattedContent);
                        alert(`Copied "${tpl.title}" to clipboard!`);
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Message
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: ACADEMY */}
      {activeTab === 'ACADEMY' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 px-1 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              Referral Academy Lessons
            </h3>
            <p className="text-xs text-slate-500 px-1">
              2–3 minute masterclasses on who to ask, when to ask, and exactly what to say.
            </p>

            <div className="space-y-2 mt-2">
              {lessons.map((les) => {
                const isUnlocked = member.badgesUnlocked.includes(les.badgeId);
                return (
                  <button
                    key={les.id}
                    onClick={() => {
                      setActiveLessonId(les.id);
                      setSelectedQuizAnswer(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      activeLessonId === les.id
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-blue-700 uppercase">{les.category}</span>
                      <span className="text-[10px] text-slate-400">{les.duration}</span>
                    </div>
                    <div className="font-bold text-xs text-slate-900 mt-1">{les.title}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-500" /> {les.badgeName}
                      </span>
                      {isUnlocked && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          ✓ Earned
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div>
              <span className="text-xs font-mono font-bold text-blue-600 uppercase">
                {activeLesson.category} • {activeLesson.duration}
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-1">{activeLesson.title}</h2>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-700 leading-relaxed">
              {activeLesson.summary}
            </div>

            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Word-for-Word Suggested Script:
              </span>
              <p className="text-xs font-medium text-amber-950 italic">
                {activeLesson.keyScript}
              </p>
            </div>

            {/* Quick 1-Question Check */}
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-900">
                Quick Knowledge Check (Unlocks "{activeLesson.badgeName}" Badge):
              </h4>
              <p className="text-xs text-slate-600">{activeLesson.quizQuestion}</p>
              <div className="space-y-2">
                {activeLesson.quizOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedQuizAnswer(idx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      selectedQuizAnswer === idx
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {selectedQuizAnswer !== null && (
                <div className="pt-2">
                  {selectedQuizAnswer === activeLesson.correctAnswerIndex ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800">
                        🎉 Correct! Badge unlocked and added to your profile.
                      </span>
                      <button
                        onClick={() => onCompleteLesson(activeLesson.id, activeLesson.badgeId)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg"
                      >
                        Claim Badge
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                      Not quite! Review the lesson above and try again.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: SCOREBOARD */}
      {activeTab === 'SCOREBOARD' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                {competition.title}
              </h3>
              <p className="text-xs text-slate-500">
                Prizes paid on qualified referrals only (never spam submissions). Top 3 win cash bonuses on payday!
              </p>
            </div>
            <div className="text-xs font-mono font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full">
              1st: ${competition.prizes.first} | 2nd: ${competition.prizes.second} | 3rd: ${competition.prizes.third}
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-xs">
                <tr>
                  <th className="px-5 py-3">Rank</th>
                  <th className="px-5 py-3">Member</th>
                  <th className="px-5 py-3">State</th>
                  <th className="px-5 py-3">Qualified Referrals</th>
                  <th className="px-5 py-3">Prize Bonus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {competition.leaderboard.map((item) => {
                  const isCurrentMember = item.displayName === member.displayName;
                  return (
                    <tr
                      key={item.displayName}
                      className={isCurrentMember ? 'bg-blue-50/80 font-bold' : item.rank <= 3 ? 'bg-amber-50/30' : ''}
                    >
                      <td className="px-5 py-3 font-mono font-bold">
                        {item.rank === 1 && '🥇 #1'}
                        {item.rank === 2 && '🥈 #2'}
                        {item.rank === 3 && '🥉 #3'}
                        {item.rank > 3 && `#${item.rank}`}
                      </td>
                      <td className="px-5 py-3">
                        {item.displayName} {isCurrentMember && <span className="text-xs text-blue-600">(You)</span>}
                      </td>
                      <td className="px-5 py-3 font-mono text-slate-500 text-xs">{item.state}</td>
                      <td className="px-5 py-3 font-bold text-slate-900">{item.qualifiedCount}</td>
                      <td className="px-5 py-3 font-mono font-bold text-emerald-700">
                        {item.prizeProjected > 0 ? `$${item.prizeProjected}` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: ACCOUNT (Payment Preference) */}
      {activeTab === 'ACCOUNT' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 max-w-xl">
          <div>
            <h3 className="text-base font-bold text-slate-900">Payout Preferences</h3>
            <p className="text-xs text-slate-500">
              Where should {agency.name} disburse your $25 referral rewards on the 4th Friday of each month?
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Method</label>
              <select
                value={member.paymentPreference}
                onChange={(e) =>
                  onUpdatePaymentPreference(e.target.value as PaymentMethodPreference, member.payoutRoutingDetails)
                }
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm"
              >
                <option value={PaymentMethodPreference.ZELLE}>Zelle (Instant Mobile/Email)</option>
                <option value={PaymentMethodPreference.ACH}>Direct Deposit (ACH)</option>
                <option value={PaymentMethodPreference.GIFT_CARD}>Digital Visa Gift Card</option>
                <option value={PaymentMethodPreference.CHECK}>Physical Paper Check</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Zelle Phone / Email or Account Identifier
              </label>
              <input
                type="text"
                value={member.payoutRoutingDetails}
                onChange={(e) => onUpdatePaymentPreference(member.paymentPreference, e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-mono"
              />
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <strong>IRS 1099 Compliance Note:</strong> Your agency is the payer of record. If your cumulative referral rewards reach $600 in a calendar year, {agency.name} will request a standard W-9 form before year-end payout.
            </div>
          </div>
        </div>
      )}

      {/* MODAL: QR CODE */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <h3 className="text-lg font-bold text-slate-900">{member.name}'s QR Code</h3>
            <p className="text-xs text-slate-500">
              Have your friend scan this code with their phone camera to instantly open your referral page!
            </p>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center justify-center">
              {/* Procedural SVG QR Code Representation */}
              <div className="w-48 h-48 bg-white p-3 rounded-xl shadow-xs border border-slate-300 flex items-center justify-center relative">
                <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v4h-4v-4zm-4-2h2v2h-2v-2zm2 4h2v2h-2v-2zm-4 2h2v2h-2v-2zm6 0h2v2h-2v-2zM12 2h2v4h-2V2zm0 6h2v4h-2V8zm-2 4h4v2h-4v-2z" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                    SCAN
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-500 mt-2">{member.referralCode}</span>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
