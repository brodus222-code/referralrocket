import React, { useState } from 'react';
import { Agency, ReferralLead, ReferralStatus } from '../types';
import { generateLeadFollowupTips } from '../services/geminiService';
import { PhoneCall, Calendar, Sparkles, MessageSquare, CheckCircle, Clock } from 'lucide-react';

interface Props {
  agency: Agency;
  leads: ReferralLead[];
  onUpdateLeadStatus: (leadId: string, newStatus: ReferralStatus, note: string) => void;
  onQualifyLead: (leadId: string, isInterested: boolean) => void;
}

export const StaffLeadWorkerView: React.FC<Props> = ({
  agency,
  leads,
  onUpdateLeadStatus,
  onQualifyLead
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(leads[0]?.id || null);
  const [newNote, setNewNote] = useState('');
  const [aiTips, setAiTips] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const agencyLeads = leads.filter((l) => l.agencyId === agency.id);
  const currentLead = agencyLeads.find((l) => l.id === selectedLeadId) || agencyLeads[0];

  const handleAddNote = () => {
    if (!currentLead || !newNote.trim()) return;
    onUpdateLeadStatus(currentLead.id, currentLead.status, newNote.trim());
    setNewNote('');
  };

  const handleFetchAiTips = async () => {
    if (!currentLead) return;
    setLoadingAi(true);
    const result = await generateLeadFollowupTips(
      currentLead.referredName,
      currentLead.notes.join('; ')
    );
    setAiTips(result);
    setLoadingAi(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-indigo-950 text-white rounded-2xl p-6 border border-indigo-900 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-indigo-400 font-mono text-xs uppercase font-semibold">
              Producer & Agent Lead Desk • {agency.name}
            </span>
            <h1 className="text-2xl font-bold mt-1">Referred Prospects Queue</h1>
            <p className="text-indigo-200 text-xs mt-1">
              Contact referred leads, schedule consultations, and log genuine interest before month-end cutoff.
            </p>
          </div>
          <div className="text-xs bg-indigo-900/60 px-3 py-1.5 rounded-lg border border-indigo-800 text-indigo-300 font-medium">
            Active Assigned Leads: <strong>{agencyLeads.length}</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Lead List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <h3 className="font-bold text-sm text-slate-900 px-1">Referral Pipeline</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {agencyLeads.map((lead) => (
              <button
                key={lead.id}
                onClick={() => {
                  setSelectedLeadId(lead.id);
                  setAiTips(null);
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                  selectedLeadId === lead.id
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{lead.referredName}</span>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    {lead.referredState}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Referred by <strong>{lead.memberName}</strong>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      lead.status === ReferralStatus.QUALIFIED
                        ? 'bg-emerald-100 text-emerald-800'
                        : lead.status === ReferralStatus.APPOINTMENT_SET
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {lead.status}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(lead.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Active Lead Card & Actions */}
        {currentLead ? (
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="text-xs font-semibold text-slate-400">Prospect Details</div>
                  <h2 className="text-xl font-bold text-slate-900 mt-0.5">{currentLead.referredName}</h2>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-600">
                    <span className="font-mono">{currentLead.referredPhone}</span>
                    <span>•</span>
                    <span>{currentLead.referredEmail}</span>
                    <span>•</span>
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">
                      Best Time: {currentLead.bestTimeToCall}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentLead.status !== ReferralStatus.QUALIFIED && (
                    <button
                      onClick={() => onQualifyLead(currentLead.id, true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Qualified ($25 Payout)
                    </button>
                  )}
                </div>
              </div>

              {/* Status Stepper */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Advance Lead Status:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() =>
                      onUpdateLeadStatus(
                        currentLead.id,
                        ReferralStatus.CONTACTED,
                        'Agent called and made first outreach'
                      )
                    }
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      currentLead.status === ReferralStatus.CONTACTED
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    Contacted
                  </button>
                  <button
                    onClick={() =>
                      onUpdateLeadStatus(
                        currentLead.id,
                        ReferralStatus.APPOINTMENT_SET,
                        'Consultation appointment scheduled on calendar'
                      )
                    }
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      currentLead.status === ReferralStatus.APPOINTMENT_SET
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Appointment Set
                  </button>
                  <button
                    onClick={() =>
                      onUpdateLeadStatus(
                        currentLead.id,
                        ReferralStatus.QUALIFIED,
                        'Consultation attended and verified genuine insurance interest'
                      )
                    }
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      currentLead.status === ReferralStatus.QUALIFIED
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Qualified ($25)
                  </button>
                </div>
              </div>

              {/* AI Coaching Box */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Gemini AI Follow-Up Talking Points
                  </div>
                  <button
                    onClick={handleFetchAiTips}
                    disabled={loadingAi}
                    className="text-xs text-purple-700 hover:text-purple-900 font-semibold"
                  >
                    {loadingAi ? 'Analyzing notes...' : 'Generate Talking Points'}
                  </button>
                </div>
                {aiTips && (
                  <p className="text-xs text-slate-700 mt-2 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 whitespace-pre-line">
                    {aiTips}
                  </p>
                )}
              </div>

              {/* Lead Timeline Notes */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Activity History & Compliance Log
                </h4>
                <div className="space-y-2 mb-3 max-h-44 overflow-y-auto">
                  {currentLead.notes.map((note, idx) => (
                    <div key={idx} className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {note}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add appointment note or client update..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    onClick={handleAddNote}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs px-3.5 py-2 rounded-lg"
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
            Select a lead from the queue to view details.
          </div>
        )}
      </div>
    </div>
  );
};
