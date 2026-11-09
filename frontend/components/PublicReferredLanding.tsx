import React, { useState } from 'react';
import { Agency, ReferralLead } from '../types';
import { Shield, Sparkles, CheckCircle, Clock, Heart, Award } from 'lucide-react';

interface Props {
  agency: Agency;
  referralCode?: string;
  onSubmitContactForm: (leadData: Partial<ReferralLead>) => void;
}

export const PublicReferredLanding: React.FC<Props> = ({
  agency,
  referralCode = 'SARAH-HL26',
  onSubmitContactForm
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [state, setState] = useState('TX');
  const [bestTime, setBestTime] = useState('Afternoon');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitContactForm({
      referredName: name,
      referredPhone: phone,
      referredEmail: email,
      referredState: state,
      bestTimeToCall: bestTime,
      consentChecked: true,
      source: 'LINK'
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center max-w-4xl mx-auto px-4 py-8">
      {/* Top Banner Branding */}
      <div className="text-center space-y-3 mb-8">
        <div
          className="inline-flex items-center justify-center p-3 rounded-2xl text-white shadow-md mx-auto mb-1"
          style={{ backgroundColor: agency.branding.primaryColor }}
        >
          <Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {agency.name}
        </h1>
        <p className="text-base text-slate-600 max-w-xl mx-auto font-medium">
          {agency.branding.tagline}
        </p>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <CheckCircle className="w-3.5 h-3.5" />
          Referred by your friend ({referralCode})
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8">
        {/* Left Column: Reassurance */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Complimentary, Zero-Pressure Health Plan Review
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Navigating healthcare plans, Medicare transitions, or changing jobs shouldn't be confusing. Our licensed advisors compare top carriers to find the coverage that fits your life and budget.
            </p>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>100% Free Consultation:</strong> No obligation and no sales pressure. We work for you, not the insurance companies.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Tailored Options:</strong> ACA Marketplace, Medicare Supplement/Advantage, dental, vision, and family health plans.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Local Licensed Advisors:</strong> Real humans who answer the phone when you need help filing a claim or renewing.
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
            * We respect your privacy. Contact information is used exclusively to schedule your consultation and is never sold to third parties.
          </div>
        </div>

        {/* Right Column: Contact Request Form */}
        <div className="bg-slate-50/70 p-6 rounded-2xl border border-slate-200">
          {submitted ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Request Received!</h3>
              <p className="text-xs text-slate-600">
                A licensed advisor from {agency.name} will reach out to you at {phone} during your preferred time window.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 text-xs text-blue-600 font-bold hover:underline"
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <h3 className="font-bold text-sm text-slate-900">Request a Quick 15-Minute Call</h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="(555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="jordan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="TX">Texas</option>
                    <option value="FL">Florida</option>
                    <option value="CA">California</option>
                    <option value="GA">Georgia</option>
                    <option value="NY">New York</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Best Time to Call</label>
                  <select
                    value={bestTime}
                    onChange={(e) => setBestTime(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Morning">Morning (9am - 12pm)</option>
                    <option value="Afternoon">Afternoon (1pm - 5pm)</option>
                    <option value="Evening">Evening (after 5pm)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                style={{ backgroundColor: agency.branding.primaryColor }}
                className="w-full py-2.5 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all mt-2"
              >
                Schedule My Free Consultation
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
