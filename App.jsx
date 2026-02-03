import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, Bell, Building, Calendar, Check, ChevronDown, ChevronRight, Circle, ClipboardCheck, DollarSign, Download, ExternalLink, FileText, Filter, Gavel, LayoutGrid, MessageCircle, Plus, Scale, Search, Settings, ShieldCheck, TrendingDown, TrendingUp, Users } from 'lucide-react';

// --- SUPABASE CONFIG ---
const SUPABASE_URL = "https://tuabithtulphofnmblxu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1YWJpdGh0dWxwaG9mbm1ibHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMTMwNjQsImV4cCI6MjA4NTY4OTA2NH0.iZ8GzhltzA6RG44pgZBvZhP5edt1iOPI4AEK94nz76I";

async function fetchFromSupabase(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) throw new Error(`Failed to fetch ${table}: ${res.statusText}`);
  return res.json();
}

// --- STATUS BADGE ---

const colors = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  pending_registration: 'bg-amber-100 text-amber-800 border-amber-200',
  pending_fingerprint: 'bg-orange-100 text-orange-800 border-orange-200',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  expired: 'bg-red-100 text-red-800 border-red-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-slate-100 text-slate-700 border-slate-200',
  scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
  proposed: 'bg-purple-100 text-purple-800 border-purple-200',
  notice_sent: 'bg-amber-100 text-amber-800 border-amber-200',
  investigation: 'bg-blue-100 text-blue-800 border-blue-200',
  pending_resolution: 'bg-orange-100 text-orange-800 border-orange-200',
  investigating: 'bg-blue-100 text-blue-800 border-blue-200',
  resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  under_review: 'bg-amber-100 text-amber-800 border-amber-200',
  filed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  current: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  reminder_sent: 'bg-blue-100 text-blue-800 border-blue-200',
  legal_notice: 'bg-red-100 text-red-800 border-red-200',
  not_started: 'bg-slate-100 text-slate-600 border-slate-200',
};

const labels = {
  pending_registration: 'Pending Registration',
  pending_fingerprint: 'Pending Fingerprint',
  in_progress: 'In Progress',
  notice_sent: 'Notice Sent',
  pending_resolution: 'Pending Resolution',
  under_review: 'Under Review',
  legal_notice: 'Legal Notice Sent',
  reminder_sent: 'Reminder Sent',
  not_started: 'Not Started'
};

const StatusBadge = ({ status }) => {
  const label = labels[status] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border whitespace-nowrap ${colors[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {label}
    </span>
  );
};

// --- METRIC CARD ---

const MetricCard = ({ label, value, subtext, trend, alert }) => (
  <div className={`bg-white rounded-xl p-5 border ${alert ? 'border-red-200 bg-red-50/30' : 'border-slate-200'} shadow-sm transition-all duration-200 hover:shadow-md`}>
    <div className="text-sm text-slate-500 font-medium">{label}</div>
    <div className={`text-2xl font-bold mt-1 ${alert ? 'text-red-700' : 'text-slate-900'}`}>{value}</div>
    {subtext && <div className="text-xs text-slate-400 mt-1">{subtext}</div>}
    {trend !== undefined && (
      <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${trend < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
        {trend < 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
        <span>{trend < 0 ? '▼' : '▲'} {Math.abs(trend)}% from last month</span>
      </div>
    )}
  </div>
);

// --- SIDEBAR ---

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 rounded-lg group ${
      active
        ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-900 border-l-4 border-amber-600'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <span className={`text-lg transition-colors ${active ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-600'}`}>{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

const Sidebar = ({ activeSection, setActiveSection }) => {
  const navItems = [
    { id: 'dashboard', icon: <LayoutGrid size={20} />, label: 'Dashboard' },
    { id: 'meetings', icon: <Calendar size={20} />, label: 'Meetings' },
    { id: 'compliance', icon: <ShieldCheck size={20} />, label: 'Compliance' },
    { id: 'financial', icon: <DollarSign size={20} />, label: 'Financial' },
    { id: 'legal', icon: <Scale size={20} />, label: 'Legal Services' },
    { id: 'complaints', icon: <AlertCircle size={20} />, label: 'Complaints' },
    { id: 'board', icon: <Users size={20} />, label: 'Board' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-sm">
            <Building size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm tracking-tight">Al-Malak</div>
            <div className="text-xs text-slate-400">BY SAHWAN LAW</div>
          </div>
        </div>
      </div>

      <div className="p-3 border-b border-slate-100">
        <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider px-2 mb-2">ASSOCIATION</div>
        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">LH</span>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-700">Lagoon Heights</div>
            <div className="text-xs text-slate-400">48 units</div>
          </div>
          <ChevronDown size={14} className="ml-auto text-slate-400" />
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        {navItems.map(item => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeSection === item.id}
            onClick={() => setActiveSection(item.id)}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
          <span>🔗</span>
          <span>sahwanlaw.com</span>
        </div>
      </div>
    </aside>
  );
};

// --- HEADER ---

const headerTitles = {
  dashboard: { title: 'Dashboard', subtitle: 'Lagoon Heights Owners Association' },
  meetings: { title: 'Meetings', subtitle: 'Manage and schedule association meetings' },
  compliance: { title: 'Compliance', subtitle: 'Track regulatory and legal compliance items' },
  financial: { title: 'Financial', subtitle: 'Financial overview and payment tracking' },
  legal: { title: 'Legal Services', subtitle: 'Active legal cases and actions' },
  complaints: { title: 'Complaints', subtitle: 'Owner complaints and resolutions' },
  board: { title: 'Board & Management', subtitle: 'Board members and association management' },
};

const Header = ({ activeSection }) => {
  const { title, subtitle } = headerTitles[activeSection] || { title: 'Dashboard', subtitle: '' };
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Bell size={20} className="text-slate-500 cursor-pointer hover:text-slate-700 transition-colors" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">3</span>
          </span>
        </div>
        <Settings size={20} className="text-slate-500 cursor-pointer hover:text-slate-700 transition-colors" />
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
          <span className="text-white text-xs font-bold">PA</span>
        </div>
        <div className="text-right">
          <div className="text-xs font-semibold text-slate-700">Prof. Alex</div>
          <div className="text-xs text-slate-400">Chairman</div>
        </div>
      </div>
    </header>
  );
};

// --- DASHBOARD ---

const Dashboard = ({ meetings, legalCases, complianceItems }) => {
  const totalOwing = 17200;
  const totalBilled = 45600;
  const collectionRate = ((totalBilled - totalOwing) / totalBilled * 100).toFixed(1);

  return (
    <div className="animate-fade-in">
      {/* Urgent Banner */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-4 mb-6 text-white shadow-md">
        <div className="flex items-start gap-3">
          <AlertTriangle size={22} className="shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-base">Urgent Actions Required</div>
            <div className="text-sm text-red-100 mt-0.5">
              3 compliance items need immediate attention - Board registration deadline <span className="font-semibold text-white">Feb 20</span> - Fire safety certificate expired
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Collection Rate" value={`${collectionRate}%`} subtext={`BD ${(totalBilled - totalOwing).toLocaleString()} of BD ${totalBilled.toLocaleString()}`} trend={-5} />
        <MetricCard label="Delinquent Units" value="8" subtext="BD 17,200 outstanding" alert />
        <MetricCard label="Active Legal Cases" value={String(legalCases.length)} subtext="1 debt, 1 property, 1 reg." />
        <MetricCard label="Compliance Score" value="67%" subtext="2 critical items pending" />
      </div>

      {/* Two Column: Meetings + Legal */}
      <div className="grid grid-cols-2 gap-6">
        {/* Upcoming Meetings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              <span className="font-semibold text-slate-800">Upcoming Meetings</span>
            </div>
            <span className="text-xs text-amber-600 font-semibold cursor-pointer hover:underline">Schedule New →</span>
          </div>
          {meetings.slice(0, 2).map(meeting => (
            <div key={meeting.id} className="p-3 hover:bg-slate-50 rounded-lg transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{meeting.type}</span>
                  <StatusBadge status={meeting.status} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">LEGAL REVIEW</span>
                  <StatusBadge status={meeting.legal_review} />
                </div>
              </div>
              <div className="text-xs text-slate-500 mt-1">{meeting.date} at {meeting.time}</div>
              <div className="text-xs text-slate-400 mt-1">Agenda: {meeting.agenda ? meeting.agenda.substring(0, 60) + '...' : ''}</div>
            </div>
          ))}
        </div>

        {/* Legal Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚖️</span>
              <span className="font-semibold text-slate-800">Legal Activity</span>
            </div>
            <span className="text-xs text-amber-600 font-semibold cursor-pointer hover:underline">View All →</span>
          </div>
          {legalCases.map(case_ => (
            <div key={case_.id} className="p-3 hover:bg-slate-50 rounded-lg transition-colors group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 text-sm">{case_.type}</span>
                  <StatusBadge status={case_.status} />
                </div>
                {case_.amount && <div className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">BD {Number(case_.amount).toLocaleString()}</div>}
              </div>
              <div className="text-xs text-slate-500 leading-snug mt-1">{case_.description}</div>
              <div className="flex items-center gap-1 mt-1.5 text-xs text-amber-700 font-medium">
                <ArrowRight size={11} />
                <span>Next Step: </span>
                <span className="text-slate-700">{case_.next_step}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Tracker */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛡️</span>
            <span className="font-semibold text-slate-800">Compliance Tracker</span>
          </div>
          <span className="text-xs text-slate-500">6 items</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {complianceItems.map(item => (
            <div key={item.id} className={`p-3 rounded-lg border ${item.status === 'expired' || item.priority === 'critical' ? 'border-red-200 bg-red-50' : item.status === 'completed' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center justify-between mb-1">
                <StatusBadge status={item.status} />
                <StatusBadge status={item.priority} />
              </div>
              <div className="text-xs font-semibold text-slate-800 mt-2">{item.item}</div>
              <div className="text-xs text-slate-500 mt-1">Due: {item.deadline}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MEETINGS ---

const Meetings = ({ meetings }) => {
  const meetingTypes = [
    { title: "Annual General Meeting (AGM)", type: "Mandatory", bg: "blue", icon: "🏛️", desc: "Budget approval, elections, reviews." },
    { title: "Extraordinary Meeting (EGM)", type: "Urgent", bg: "purple", icon: "⚡", desc: "Emergency decisions, special resolutions." },
    { title: "Board Meeting", type: "Routine", bg: "emerald", icon: "👥", desc: "Operational oversight, management decisions." }
  ];

  return (
    <div className="animate-fade-in">
      {/* Meeting Type Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {meetingTypes.map((mt, i) => (
          <div key={i} className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{mt.icon}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${mt.bg === 'blue' ? 'bg-blue-100 text-blue-700' : mt.bg === 'purple' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>{mt.type}</span>
            </div>
            <div className="font-semibold text-slate-800 text-sm">{mt.title}</div>
            <div className="text-xs text-slate-500 mt-1">{mt.desc}</div>
          </div>
        ))}
      </div>

      {/* Meetings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">All Meetings</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
              <Filter size={13} /> Filter
            </button>
            <button className="flex items-center gap-1 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors">
              <Plus size={13} /> New Meeting
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Date & Time</th>
                <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Legal Review</th>
                <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Quorum</th>
                <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Notice</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map(meeting => (
                <tr key={meeting.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-medium text-slate-800">{meeting.type}</td>
                  <td className="p-3 text-slate-600">{meeting.date} at {meeting.time}</td>
                  <td className="p-3"><StatusBadge status={meeting.status} /></td>
                  <td className="p-3"><StatusBadge status={meeting.legal_review} /></td>
                  <td className="p-3 text-xs text-slate-500">{meeting.quorum}</td>
                  <td className="p-3 text-xs text-slate-500">{meeting.notice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Agenda Detail */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mt-6">
        <h3 className="font-semibold text-slate-800 mb-3">Agenda Items</h3>
        {meetings.map(meeting => (
          <div key={meeting.id} className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-slate-700">{meeting.type}</span>
              <StatusBadge status={meeting.status} />
            </div>
            <div className="flex flex-wrap gap-2 ml-2">
              {meeting.agenda && meeting.agenda.split(',').map((item, idx) => (
                <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{item.trim()}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- FINANCIAL ---

const Financial = ({ delinquentUnits }) => {
  const totalOwing = delinquentUnits.reduce((sum, u) => sum + Number(u.amount), 0);

  return (
    <div className="animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Billed" value="BD 45,600" subtext="Monthly maintenance fees" />
        <MetricCard label="Collected" value={`BD ${(45600 - totalOwing).toLocaleString()}`} subtext="Successfully collected" trend={3} />
        <MetricCard label="Outstanding" value={`BD ${totalOwing.toLocaleString()}`} subtext={`${delinquentUnits.length} units overdue`} alert />
        <MetricCard label="Collection Rate" value={`${((45600 - totalOwing) / 45600 * 100).toFixed(1)}%`} subtext="Current period" trend={-5} />
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">💳</span>
            <span className="font-semibold text-slate-700 text-sm">Payment Methods</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs"><span className="text-slate-500">Bank Transfer</span><span className="font-semibold text-slate-700">BD 18,400</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Online Portal</span><span className="font-semibold text-slate-700">BD 8,200</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Cash</span><span className="font-semibold text-slate-700">BD 1,800</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📊</span>
            <span className="font-semibold text-slate-700 text-sm">Budget Overview</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs"><span className="text-slate-500">Maintenance</span><span className="font-semibold text-slate-700">BD 22,000</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Insurance</span><span className="font-semibold text-slate-700">BD 8,500</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Legal & Admin</span><span className="font-semibold text-slate-700">BD 5,200</span></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📈</span>
            <span className="font-semibold text-slate-700 text-sm">Reserves</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs"><span className="text-slate-500">Emergency Fund</span><span className="font-semibold text-emerald-700">BD 45,000</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Sinking Fund</span><span className="font-semibold text-emerald-700">BD 28,000</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-500">Status</span><span className="font-semibold text-emerald-700">Healthy</span></div>
          </div>
        </div>
      </div>

      {/* Delinquent Units Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Delinquent Units</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors"><Filter size={13} /> Filter</button>
            <button className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors"><Download size={13} /> Export</button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Unit</th>
              <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Owner</th>
              <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
              <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Days Overdue</th>
              <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {delinquentUnits.map(row => (
              <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="p-3 font-medium text-slate-800">{row.unit}</td>
                <td className="p-3 text-slate-600">{row.owner}</td>
                <td className="p-3 font-semibold text-red-700">BD {Number(row.amount).toLocaleString()}</td>
                <td className="p-3">
                  <span className={`text-xs font-semibold ${row.days > 60 ? 'text-red-600' : row.days > 30 ? 'text-orange-600' : 'text-amber-600'}`}>{row.days} days</span>
                </td>
                <td className="p-3"><StatusBadge status={row.status} /></td>
                <td className="p-3">
                  <button className="text-xs text-amber-600 font-semibold hover:underline">Send Notice</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- COMPLIANCE ---

const Compliance = ({ complianceItems }) => (
  <div className="animate-fade-in">
    <div className="grid grid-cols-4 gap-4 mb-6">
      <MetricCard label="Total Items" value={String(complianceItems.length)} subtext="Tracked compliance items" />
      <MetricCard label="Critical" value={String(complianceItems.filter(i => i.priority === 'critical').length)} subtext="Need immediate action" alert />
      <MetricCard label="Completed" value={String(complianceItems.filter(i => i.status === 'completed').length)} subtext="Fully compliant" />
      <MetricCard label="Pending" value={String(complianceItems.filter(i => i.status === 'pending' || i.status === 'in_progress').length)} subtext="In progress or waiting" />
    </div>

    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Compliance Items</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200"><Filter size={13} /> Filter</button>
          <button className="flex items-center gap-1 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700"><Plus size={13} /> Add Item</button>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {complianceItems.map(item => (
          <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0`} style={{background: item.status === 'expired' ? '#fee2e2' : item.status === 'completed' ? '#dcfce7' : '#f1f5f9'}}>
                🏛️
              </div>
              <div>
                <div className="font-medium text-slate-800 text-sm">{item.item}</div>
                <div className="text-xs text-slate-500 mt-0.5">Deadline: {item.deadline}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={item.priority} />
              <StatusBadge status={item.status} />
              <button className="text-xs text-amber-600 font-semibold hover:underline ml-2">Update</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- LEGAL ---

const Legal = ({ legalCases }) => (
  <div className="animate-fade-in">
    <div className="grid grid-cols-3 gap-4 mb-6">
      <MetricCard label="Active Cases" value={String(legalCases.length)} subtext="Currently being handled" />
      <MetricCard label="Total Exposure" value={`BD ${legalCases.filter(c => c.amount).reduce((s, c) => s + Number(c.amount), 0).toLocaleString()}`} subtext="Potential liability" alert />
      <MetricCard label="Resolved This Month" value="1" subtext="Successfully closed" />
    </div>

    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">All Legal Cases</h3>
        <button className="flex items-center gap-1 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700"><Plus size={13} /> New Case</button>
      </div>
      <div className="divide-y divide-slate-100">
        {legalCases.map(case_ => (
          <div key={case_.id} className="p-5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                  case_.type === 'Debt Collection' ? 'bg-red-100 text-red-600' :
                  case_.type === 'Property Damage' ? 'bg-orange-100 text-orange-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <Gavel size={16} />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 text-sm">{case_.type}</span>
                  <StatusBadge status={case_.status} />
                </div>
              </div>
              {case_.amount && <span className="text-sm font-bold text-red-700 bg-red-50 px-3 py-1 rounded-lg border border-red-100">BD {Number(case_.amount).toLocaleString()}</span>}
            </div>
            <p className="text-xs text-slate-500 ml-10">{case_.description}</p>
            <div className="ml-10 mt-2 space-y-1">
              <div className="text-xs text-slate-400"><span className="font-medium text-slate-600">Last Action:</span> {case_.last_action}</div>
              <div className="text-xs text-amber-700 font-medium flex items-center gap-1"><ArrowRight size={11} /> Next: {case_.next_step}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- COMPLAINTS ---

const Complaints = ({ complaints }) => (
  <div className="animate-fade-in">
    <div className="grid grid-cols-4 gap-4 mb-6">
      <MetricCard label="Total Complaints" value={String(complaints.length)} subtext="All time" />
      <MetricCard label="Open" value={String(complaints.filter(c => c.status !== 'resolved').length)} subtext="Awaiting resolution" />
      <MetricCard label="Critical" value={String(complaints.filter(c => c.priority === 'critical').length)} subtext="High priority" alert />
      <MetricCard label="Resolved" value={String(complaints.filter(c => c.status === 'resolved').length)} subtext="Successfully closed" />
    </div>

    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">All Complaints</h3>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200"><Filter size={13} /> Filter</button>
          <button className="flex items-center gap-1 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700"><MessageCircle size={13} /> New Complaint</button>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {complaints.map(complaint => (
          <div key={complaint.id} className="p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${complaint.priority === 'critical' ? 'bg-red-50 text-red-700 border-red-200' : complaint.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{complaint.unit}</span>
                <span className="font-medium text-slate-800 text-sm">{complaint.subject}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={complaint.priority} />
                <StatusBadge status={complaint.status} />
              </div>
            </div>
            <div className="text-sm text-slate-500 mt-1 font-medium">Reported: {complaint.date}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- BOARD ---

const Board = ({ boardMembers }) => {
  const associationData = {
    name: "Lagoon Heights Owners Association",
    units: 48,
    registeredOwners: 42,
    manager: { name: "Impact Property Management", contact: "Imad", status: "under_review" }
  };

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard label="Board Members" value={String(boardMembers.length)} subtext="Active members" />
        <MetricCard label="Registered Owners" value={String(associationData.registeredOwners)} subtext={`of ${associationData.units} units`} />
        <MetricCard label="Management" value="Active" subtext="Impact Property Mgmt" />
      </div>

      {/* Board Members */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Board Members</h3>
          <button className="flex items-center gap-1 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700"><Plus size={13} /> Add Member</button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {boardMembers.map(member => (
            <div key={member.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl shadow-inner">🏢</div>
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{member.name}</div>
                  <div className="text-xs text-slate-500">{member.role}</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <StatusBadge status={member.status} />
                <span className="text-xs text-slate-400">Since {member.since}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Management */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Property Management</h3>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-2xl shadow border">🏢</div>
            <div>
              <div className="font-semibold text-slate-800">{associationData.manager.name}</div>
              <div className="text-sm text-slate-500 font-medium">Contact: {associationData.manager.contact}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={associationData.manager.status} />
            <button className="text-xs text-amber-600 font-semibold hover:underline flex items-center gap-1"><ExternalLink size={12} /> View Details</button>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Association Documents</h3>
          <button className="flex items-center gap-1 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700"><Plus size={13} /> Upload</button>
        </div>
        <div className="space-y-2">
          {[
            { name: 'Association Bylaws - 2025 Amendment', date: '2025-03-10', status: 'current' },
            { name: 'Board Resolution - 2025', date: '2025-06-15', status: 'pending_registration' },
            { name: 'AGM Minutes - 2025', date: '2025-06-20', status: 'filed' }
          ].map((doc, i) => (
            <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-slate-400" />
                <div>
                  <div className="text-sm font-medium text-slate-700">{doc.name}</div>
                  <div className="text-xs text-slate-400">Updated: {doc.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={doc.status} />
                <Download size={16} className="text-slate-400 cursor-pointer hover:text-slate-600" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard');

  // Supabase data state
  const [boardMembers, setBoardMembers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [complianceItems, setComplianceItems] = useState([]);
  const [legalCases, setLegalCases] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [delinquentUnits, setDelinquentUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadAll() {
      try {
        const [bm, mt, ci, lc, cp, du] = await Promise.all([
          fetchFromSupabase('board_members'),
          fetchFromSupabase('meetings'),
          fetchFromSupabase('compliance_items'),
          fetchFromSupabase('legal_cases'),
          fetchFromSupabase('complaints'),
          fetchFromSupabase('delinquent_units'),
        ]);
        setBoardMembers(bm);
        setMeetings(mt);
        setComplianceItems(ci);
        setLegalCases(lc);
        setComplaints(cp);
        setDelinquentUnits(du);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const renderContent = () => {
    if (loading) return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 mt-4 text-sm">Loading data from database...</p>
      </div>
    );

    if (error) return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-xl border border-red-200 p-8">
        <AlertCircle size={40} className="text-red-500 mb-3" />
        <p className="text-red-700 font-semibold">Failed to load data</p>
        <p className="text-red-500 text-sm mt-1">{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-xs bg-red-100 text-red-700 px-4 py-1.5 rounded-lg hover:bg-red-200">Retry</button>
      </div>
    );

    switch (activeSection) {
      case 'dashboard': return <Dashboard meetings={meetings} legalCases={legalCases} complianceItems={complianceItems} />;
      case 'meetings': return <Meetings meetings={meetings} />;
      case 'compliance': return <Compliance complianceItems={complianceItems} />;
      case 'financial': return <Financial delinquentUnits={delinquentUnits} />;
      case 'legal': return <Legal legalCases={legalCases} />;
      case 'complaints': return <Complaints complaints={complaints} />;
      case 'board': return <Board boardMembers={boardMembers} />;
      default: return <Dashboard meetings={meetings} legalCases={legalCases} complianceItems={complianceItems} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <main className="ml-64 flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto pb-10">
          <Header activeSection={activeSection} />
          {renderContent()}
        </div>
      </main>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
