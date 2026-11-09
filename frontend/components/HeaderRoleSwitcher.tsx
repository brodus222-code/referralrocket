import React from 'react';
import { UserRole, Agency } from '../types';
import { Shield, Sparkles, Building2, UserCheck, Users, ExternalLink, HelpCircle } from 'lucide-react';

interface Props {
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  selectedAgency: Agency;
  setAgencyId: (id: string) => void;
  allAgencies: Agency[];
  onOpenInfoModal: () => void;
}

export const HeaderRoleSwitcher: React.FC<Props> = ({
  currentRole,
  setRole,
  selectedAgency,
  setAgencyId,
  allAgencies,
  onOpenInfoModal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top Banner: Multi-tenant Role Switcher Bar */}
      <div className="bg-slate-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-200 tracking-wider uppercase text-[11px]">
            Platform Simulation Switcher
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden sm:inline">
            Active Tenant: <strong className="text-emerald-300">{selectedAgency.name}</strong> ({selectedAgency.isTenantOne ? 'Tenant #1 Comped' : '$100/mo Sub'})
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          <span className="text-slate-400 text-[11px] whitespace-nowrap">View As:</span>
          
          <button
            onClick={() => setRole(UserRole.SUPER_ADMIN)}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
              currentRole === UserRole.SUPER_ADMIN
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Super Admin
          </button>

          <button
            onClick={() => setRole(UserRole.AGENCY_ADMIN)}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
              currentRole === UserRole.AGENCY_ADMIN
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            Agency Admin
          </button>

          <button
            onClick={() => setRole(UserRole.STAFF)}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
              currentRole === UserRole.STAFF
                ? 'bg-indigo-600 text-white font-bold shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Agency Agent
          </button>

          <button
            onClick={() => setRole(UserRole.MEMBER)}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
              currentRole === UserRole.MEMBER
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Member Referrer
          </button>

          <button
            onClick={() => setRole(UserRole.PUBLIC_LEAD)}
            className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-all ${
              currentRole === UserRole.PUBLIC_LEAD
                ? 'bg-purple-600 text-white font-bold shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Referred Landing Page
          </button>
        </div>
      </div>

      {/* Main App Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
            style={{ backgroundColor: selectedAgency.branding.primaryColor }}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                {currentRole === UserRole.SUPER_ADMIN
                  ? 'Referral Rocket'
                  : selectedAgency.branding.programTitle}
              </span>
              {selectedAgency.isTenantOne && currentRole !== UserRole.SUPER_ADMIN && (
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                  HealthLink Program
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {currentRole === UserRole.SUPER_ADMIN
                ? 'Platform Owner & Global Control Center'
                : selectedAgency.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Agency Selector Dropdown (for switching agencies in simulation) */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-500 hidden md:inline font-medium pl-1">Agency:</span>
            <select
              value={selectedAgency.id}
              onChange={(e) => setAgencyId(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {allAgencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name} {agency.isTenantOne ? '(Tenant #1)' : '($100/mo)'}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onOpenInfoModal}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors title='System Architecture Guide'"
            title="System Build Plan Info"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
