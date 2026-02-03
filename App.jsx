import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, Bell, Building, Calendar, Check, ChevronDown, ChevronRight, Circle, ClipboardCheck, DollarSign, Download, ExternalLink, FileText, Filter, Gavel, LayoutGrid, MessageCircle, Plus, Scale, Search, Settings, ShieldCheck, TrendingDown, TrendingUp, Users } from 'lucide-react';

// --- DATA ---

const associationData = {
  name: "Lagoon Heights Owners Association",
  units: 48,
  registeredOwners: 42,
  boardMembers: [
    { name: "Prof. Alex Atanassoff", role: "Chairman", status: "pending_registration", since: "2025-06-15" },
    { name: "Ahmed Al-Mahmood", role: "Treasurer", status: "active", since: "2025-06-15" },
    { name: "Fatima Hassan", role: "Secretary", status: "pending_fingerprint", since: "2025-06-15" }
  ],
  manager: { name: "Impact Property Management", contact: "Imad", status: "under_review" }
};

const upcomingMeetings = [
  { 
    id: 1, 
    type: "AGM", 
    date: "2026-02-15", 
    time: "18:00",
    status: "scheduled",
    agenda: ["Budget Approval 2026", "Board Election", "Management Review"],
    quorum: "50% + 1",
    notice: "14 days required",
    legalReview: "pending"
  },
  { 
    id: 2, 
    type: "EGM", 
    date: "2026-02-28", 
    time: "19:00",
    status: "proposed",
    agenda: ["Emergency Security Measures", "Falling Sign Liability"],
    quorum: "25%",
    notice: "7 days required",
    legalReview: "not_started"
  }
];

const complianceItems = [
  { id: 1, item: "Board Registration with RERA", status: "in_progress", deadline: "2026-02-20", priority: "high" },
  { id: 2, item: "Annual Financial Audit", status: "pending", deadline: "2026-03-31", priority: "medium" },
  { id: 3, item: "Insurance Renewal", status: "completed", deadline: "2026-01-15", priority: "high" },
  { id: 4, item: "Fire Safety Certificate", status: "expired", deadline: "2025-12-01", priority: "critical" },
  { id: 5, item: "Security Contract Review", status: "pending", deadline: "2026-02-01", priority: "high" }
];

const legalCases = [
  { 
    id: 1, 
    type: "Debt Collection",
    description: "Outstanding maintenance fees - Unit 12B",
    amount: 3200,
    status: "notice_sent",
    lastAction: "Legal notice issued 2026-01-15",
    nextStep: "File with Small Claims if no response by Feb 1"
  },
  { 
    id: 2, 
    type: "Property Damage",
    description: "Falling commercial sign - liability assessment",
    status: "investigation",
    lastAction: "Photos documented, owner identified",
    nextStep: "Formal demand letter to sign owner"
  },
  { 
    id: 3, 
    type: "Regulatory",
    description: "Board installation dispute with RERA",
    status: "pending_resolution",
    lastAction: "Fingerprint requirement clarified",
    nextStep: "Complete registration by Feb 20"
  }
];

const complaints = [
  { id: 1, unit: "5A", subject: "Water leak from unit above", date: "2026-01-28", status: "investigating", priority: "high" },
  { id: 2, unit: "Common", subject: "Elevator maintenance overdue", date: "2026-01-25", status: "scheduled", priority: "medium" },
  { id: 3, unit: "Parking", subject: "Unauthorized vehicle in reserved spot", date: "2026-01-30", status: "resolved", priority: "low" }
  ];

const delinquentUnits = [
  { unit: "12B", owner: "Al-Rashid Holdings", amount: 3200, days: 180, status: "legal_notice" },
  { unit: "7A", owner: "Mohamed Ibrahim", amount: 2400, days: 120, status: "reminder_sent" },
  { unit: "3C", owner: "Sarah Johnson", amount: 2800, days: 90, status: "pending" },
  { unit: "15D", owner: "Ahmed Hassan", amount: 1600, days: 60, status: "pending" },
];

const documents = [
  { name: "Association Bylaws", date: "2019-03-15", status: "current" },
  { name: "Management Agreement", date: "2024-01-01", status: "current" },
  { name: "Board Resolution - 2025", date: "2025-06-15", status: "pending_registration" },
  { name: "AGM Minutes - 2025", date: "2025-06-20", status: "filed" }
];

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
};

const labels = {
  pending_registration: 'Pending Registration',
  pending_fingerprint: 'Pending Fingerprint',
  in_progress: 'In Progress',
  notice_sent: 'Notice Sent',
  pending_resolution: 'Pending Resolution',
  under_review: 'Under Review',
  legal_notice: 'Legal Notice Sent',
  reminder_sent: 'Reminder Sent'
};

const StatusBadge = ({ status }) => {
  const statusKey = status;
  const label = labels[statusKey] || statusKey.charAt(0).toUpperCase() + statusKey.slice(1).replace(/_/g, ' ');
  
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border whitespace-nowrap ${colors[statusKey] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
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
      <div className={`text-xs mt-2 flex items-center gap-1 ${trend > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
        {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {Math.abs(trend)}% from last month
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
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 shadow-sm z-50 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
            SL
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm tracking-tight">Al-Malak</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide font-semibold">by Sahwan Law</div>
          </div>
        </div>
      </div>

      {/* Association Selector */}
      <div className="p-4 border-b border-slate-100">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 font-semibold">Association</div>
        <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2 cursor-pointer hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200">
          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-xs font-bold">LH</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate">Lagoon Heights</div>
            <div className="text-xs text-slate-500">48 units</div>
          </div>
          <ChevronDown size={14} className="text-slate-400" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        <NavItem id="dashboard" icon={<LayoutGrid size={20} />} label="Dashboard" active={activeSection === 'dashboard'} onClick={() => setActiveSection('dashboard')} />
        <NavItem id="meetings" icon={<Calendar size={20} />} label="Meetings" active={activeSection === 'meetings'} onClick={() => setActiveSection('meetings')} />
        <NavItem id="compliance" icon={<ClipboardCheck size={20} />} label="Compliance" active={activeSection === 'compliance'} onClick={() => setActiveSection('compliance')} />
        <NavItem id="financial" icon={<DollarSign size={20} />} label="Financial" active={activeSection === 'financial'} onClick={() => setActiveSection('financial')} />
        <NavItem id="legal" icon={<Scale size={20} />} label="Legal Services" active={activeSection === 'legal'} onClick={() => setActiveSection('legal')} />
        <NavItem id="complaints" icon={<AlertCircle size={20} />} label="Complaints" active={activeSection === 'complaints'} onClick={() => setActiveSection('complaints')} />
        <NavItem id="board" icon={<Users size={20} />} label="Board" active={activeSection === 'board'} onClick={() => setActiveSection('board')} />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 bg-white">
        <a href="#" className="flex items-center gap-2 text-xs text-slate-500 hover:text-amber-600 transition-colors">
          <span>🔗</span>
          <span>sahwanlaw.com</span>
        </a>
      </div>
    </aside>
  );
};

// --- HEADER ---

const Header = ({ activeSection }) => {
  const getTitle = () => {
    switch (activeSection) {
      case 'dashboard': return 'Dashboard';
      case 'meetings': return 'Meetings';
      case 'compliance': return 'Compliance';
      case 'financial': return 'Financial';
      case 'legal': return 'Legal Services';
      case 'complaints': return 'Complaints';
      case 'board': return 'Board';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-4 z-40">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{getTitle()}</h1>
        <p className="text-slate-500 text-sm mt-1">Lagoon Heights Owners Association</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
          <Settings size={20} />
        </button>
        <div className="h-8 w-px bg-slate-200 mx-2"></div>
        <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors rounded-lg px-3 py-2 border border-slate-100">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
            AA
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-slate-700">Prof. Alex</div>
            <div className="text-[10px] text-slate-500 leading-none">Chairman</div>
          </div>
        </div>
      </div>
    </header>
  );
};

// --- DASHBOARD ---

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Alert Banner */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white shadow-lg border-l-4 border-amber-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-1/4 -translate-y-1/4">
           <AlertTriangle size={120} />
        </div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <AlertTriangle size={24} />
          </div>
          <div>
            <div className="font-bold text-lg">Urgent Actions Required</div>
            <div className="text-sm opacity-95 mt-1 leading-relaxed">
              3 compliance items need immediate attention - Board registration deadline: <span className="font-bold underline decoration-amber-300 underline-offset-2">Feb 20</span> - Fire safety certificate expired
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Collection Rate" value="62.3%" subtext="BD 28,400 of BD 45,600" trend={-5} />
        <MetricCard label="Delinquent Units" value="8" subtext="BD 17,200 outstanding" alert />
        <MetricCard label="Active Legal Cases" value="3" subtext="1 debt, 1 property, 1 reg." />
        <MetricCard label="Compliance Score" value="67%" subtext="2 critical items pending" />
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Meetings */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              📅 Upcoming Meetings
            </h3>
            <button className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
              Schedule New <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {upcomingMeetings.map(meeting => (
              <div key={meeting.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{meeting.type}</span>
                      <StatusBadge status={meeting.status} />
                    </div>
                    <div className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                      <span className="font-medium text-slate-700">{meeting.date}</span>
                      <span>at</span>
                      <span className="font-medium text-slate-700">{meeting.time}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Legal Review</div>
                    <StatusBadge status={meeting.legalReview} />
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-100 rounded-md">Agenda</span>
                  <span className="truncate">{meeting.agenda.slice(0, 2).join(', ')}{meeting.agenda.length > 2 && '...'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Legal Activity */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              ⚖️ Legal Activity
            </h3>
            <button className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
              View All <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {legalCases.map(case_ => (
              <div key={case_.id} className="p-4 hover:bg-slate-50 transition-colors group">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900 text-sm">{case_.type}</span>
                      <StatusBadge status={case_.status} />
                    </div>
                    <div className="text-xs text-slate-500 leading-snug mb-2">{case_.description}</div>
                  </div>
                  {case_.amount && <div className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">BD {case_.amount.toLocaleString()}</div>}
                </div>
                <div className="mt-1 text-xs text-slate-500 bg-amber-50 border border-amber-100 p-2 rounded flex items-start gap-2">
                  <span className="text-amber-600 font-bold shrink-0">Next Step:</span> 
                  <span className="text-slate-700">{case_.nextStep}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            🛡️ Compliance Tracker
          </h3>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-bold shadow-sm border border-red-200">1 Critical</span>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded font-bold shadow-sm border border-orange-200">2 High Priority</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Item</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-left px-5 py-3 font-semibold">Deadline</th>
                <th className="text-left px-5 py-3 font-semibold">Priority</th>
                <th className="text-right px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {complianceItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-slate-900">{item.item}</td>
                  <td className="px-5 py-3"><StatusBadge status={item.status} /></td>
                  <td className="px-5 py-3 text-sm text-slate-600 font-mono">{item.deadline}</td>
                  <td className="px-5 py-3"><StatusBadge status={item.priority} /></td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-xs text-slate-500 hover:text-amber-600 font-medium flex items-center justify-end gap-1 w-full transition-colors">
                      {item.status === 'completed' ? 'View' : 'Update'} <ChevronRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- MEETINGS ---

const Meetings = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Meetings Management</h2>
          <p className="text-sm text-slate-500 mt-1">AGM, EGM, and Board meetings with legal compliance tracking</p>
        </div>
        <button className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors shadow-sm flex items-center gap-2">
          <Plus size={18} /> Schedule Meeting
        </button>
      </div>

      {/* Meeting Types Guide */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { title: "Annual General Meeting (AGM)", type: "Mandatory", bg: "blue", icon: "🏛️", desc: "Budget approval, elections, reports.", reqs: ["14-day notice", "50%+1 quorum", "RERA notification"] },
          { title: "Extraordinary Meeting (EGM)", type: "Urgent", bg: "purple", icon: "⚡", desc: "Emergency decisions, special resolutions.", reqs: ["7-day notice", "25% quorum", "Board/10% Owners call"] },
          { title: "Board Meeting", type: "Routine", bg: "emerald", icon: "👥", desc: "Operational oversight, management decisions.", reqs: ["48-hour notice", "Simple majority", "Minutes required"] },
        ].map((card, idx) => (
          <div key={idx} className={`bg-white rounded-xl p-5 border border-slate-200 hover:border-${card.bg}-300 transition-all shadow-sm hover:shadow-md relative overflow-hidden group`}>
             <div className={`absolute top-0 right-0 w-24 h-24 bg-${card.bg}-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
            <div className="relative z-10">
              <div className="text-2xl mb-3">{card.icon}</div>
              <h3 className={`font-bold text-${card.bg}-900`}>{card.title}</h3>
              <p className={`text-sm text-${card.bg}-700/80 mt-2`}>{card.desc}</p>
              <div className="mt-4 space-y-1">
                {card.reqs.map((r, i) => (
                  <div key={i} className={`text-xs text-${card.bg}-600 flex items-center gap-2`}>
                    <div className={`w-1 h-1 rounded-full bg-${card.bg}-500`}></div> {r}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Meetings Detail */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
          <h3 className="font-semibold text-slate-900">Scheduled Meetings</h3>
        </div>
        {upcomingMeetings.map(meeting => (
          <div key={meeting.id} className="p-5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-lg font-bold text-slate-900">{meeting.type}</span>
                  <StatusBadge status={meeting.status} />
                  {meeting.legalReview === 'pending' && (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded border border-amber-200 flex items-center gap-1">
                      <AlertCircle size={12} /> Legal Review Pending
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-slate-600">
                  <div><span className="font-semibold text-slate-800">Date:</span> {meeting.date}</div>
                  <div><span className="font-semibold text-slate-800">Time:</span> {meeting.time}</div>
                  <div><span className="font-semibold text-slate-800">Quorum:</span> {meeting.quorum}</div>
                  <div><span className="font-semibold text-slate-800">Notice:</span> {meeting.notice}</div>
                </div>
                <div className="mt-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Agenda Items</div>
                  <div className="flex flex-wrap gap-2">
                    {meeting.agenda.map((item, i) => (
                      <span key={i} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-full shadow-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-2 md:mt-0">
                <button className="flex-1 md:flex-none px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors shadow-sm text-center">
                  Edit Details
                </button>
                <button className="flex-1 md:flex-none px-3 py-1.5 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors text-center">
                  Send Notices
                </button>
                <button className="flex-1 md:flex-none px-3 py-1.5 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors text-center">
                  Legal Review
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Meeting Checklist */}
      <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <Scale size={200} />
        </div>
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="p-2 bg-amber-500 rounded-lg text-slate-900">
            <Scale size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Legal Compliance Checklist</h3>
            <p className="text-sm text-slate-400">Powered by Sahwan Law</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm p-2 rounded-lg bg-white/5 border border-white/10">
              <div className="w-5 h-5 bg-emerald-500 rounded flex items-center justify-center text-slate-900 shrink-0"><Check size={14} strokeWidth={3} /></div>
              <span>Valid board quorum verified</span>
            </div>
            <div className="flex items-center gap-3 text-sm p-2 rounded-lg bg-white/5 border border-white/10">
              <div className="w-5 h-5 bg-emerald-500 rounded flex items-center justify-center text-slate-900 shrink-0"><Check size={14} strokeWidth={3} /></div>
              <span>Notice period calculated correctly</span>
            </div>
            <div className="flex items-center gap-3 text-sm p-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <div className="w-5 h-5 bg-amber-500 rounded flex items-center justify-center text-slate-900 shrink-0"><AlertCircle size={14} strokeWidth={3} /></div>
              <span className="text-amber-200 font-medium">Agenda items require legal review</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10">
              <Circle size={20} className="text-slate-500" />
              <span className="text-slate-300">Proxy forms prepared</span>
            </div>
            <div className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10">
              <Circle size={20} className="text-slate-500" />
              <span className="text-slate-300">Voting procedures documented</span>
            </div>
            <div className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10">
              <Circle size={20} className="text-slate-500" />
              <span className="text-slate-300">Minutes template prepared</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- FINANCIAL ---

const Financial = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Financial Management</h2>
          <p className="text-sm text-slate-500 mt-1">Collections, budgets, and financial oversight</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Download size={18} /> Export Report
          </button>
          <button className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors shadow-sm flex items-center gap-2">
            <Plus size={18} /> Record Payment
          </button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: "Total Collected", val: "BD 28,400", sub: "62.3% of annual dues", grad: "from-emerald-500 to-emerald-600" },
          { label: "Outstanding", val: "BD 17,200", sub: "8 delinquent units", grad: "from-red-500 to-red-600" },
          { label: "Monthly Budget", val: "BD 4,800", sub: "Pending approval", grad: "from-blue-500 to-blue-600" },
          { label: "Legal Retainer", val: "BD 600", sub: "Accumulated budget", grad: "from-amber-500 to-amber-600" },
        ].map((item, i) => (
          <div key={i} className={`bg-gradient-to-br ${item.grad} rounded-xl p-5 text-white shadow-lg relative overflow-hidden`}>
             <div className="absolute -right-4 -bottom-4 bg-white/10 w-24 h-24 rounded-full blur-xl"></div>
            <div className="text-sm opacity-90 font-medium relative z-10">{item.label}</div>
            <div className="text-3xl font-bold mt-1 relative z-10">{item.val}</div>
            <div className="text-xs mt-2 opacity-80 font-medium relative z-10">{item.sub}</div>
          </div>
        ))}
      </div>

      {/* Delinquent Units */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-lg">💳</span>
            <h3 className="font-semibold text-slate-900">Delinquent Accounts</h3>
          </div>
          <button className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-700 transition-colors shadow-sm">
            Initiate Collection
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Unit</th>
                <th className="text-left px-5 py-3 font-semibold">Owner</th>
                <th className="text-right px-5 py-3 font-semibold">Amount Due</th>
                <th className="text-left px-5 py-3 font-semibold">Overdue</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-right px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {delinquentUnits.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-bold text-slate-900">{row.unit}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{row.owner}</td>
                  <td className="px-5 py-3 text-right font-bold text-red-600 bg-red-50/50">BD {row.amount.toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      row.days > 120 ? 'bg-red-100 text-red-700' : 
                      row.days > 60 ? 'bg-orange-100 text-orange-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {row.days} days
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center justify-end gap-1 w-full">
                      {row.status === 'legal_notice' ? 'View Case' : 'Send Notice'} <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legal Collection Process */}
      <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-500 rounded text-slate-900">
             <AlertCircle size={20} />
          </div>
          <div>
            <h3 className="font-bold">Legal Collection Process</h3>
            <p className="text-sm text-slate-400">Sahwan Law Debt Recovery Service</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { step: 1, title: "Reminder Notice", days: "Day 30", desc: "Friendly payment reminder" },
            { step: 2, title: "Formal Demand", days: "Day 60", desc: "Official demand letter" },
            { step: 3, title: "Legal Notice", days: "Day 90", desc: "Attorney-signed notice" },
            { step: 4, title: "Filing", days: "Day 120", desc: "Small claims court" },
            { step: 5, title: "Judgment", days: "Day 150+", desc: "Court enforcement" }
          ].map((phase, i) => (
            <div key={i} className="relative group">
               {i < 4 && <div className="hidden md:block absolute top-3 left-1/2 w-full h-0.5 bg-slate-700 -z-10"></div>}
              <div className="flex flex-col items-center text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-3 transition-all ${i < 2 ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20 scale-110' : 'bg-slate-700 text-slate-300'}`}>
                  {phase.step}
                </div>
                <div className="font-medium text-sm text-slate-200">{phase.title}</div>
                <div className="text-xs text-amber-400 font-mono mt-1">{phase.days}</div>
                <div className="text-[10px] text-slate-500 mt-1 max-w-[100px]">{phase.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- COMPLIANCE ---

const Compliance = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Compliance & Regulatory</h2>
          <p className="text-sm text-slate-500 mt-1">RERA requirements, certifications, and legal obligations</p>
        </div>
        <button className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors shadow-sm flex items-center gap-2">
          <Plus size={18} /> Add Requirement
        </button>
      </div>

      {/* RERA Board Registration Section */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200 p-6 shadow-sm">
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center text-2xl shadow-inner shrink-0">🏛️</div>
          <div className="flex-1">
            <h3 className="font-bold text-red-900 text-lg">RERA Board Registration - Action Required</h3>
            <p className="text-sm text-red-700 mt-1">Board members must complete registration before <span className="font-bold">Feb 20, 2026</span></p>
            <div className="mt-5 space-y-3">
              {associationData.boardMembers.map((member, i) => (
                <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 border border-red-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-sm font-bold text-slate-600">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">{member.name}</div>
                      <div className="text-xs text-slate-500">{member.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={member.status} />
                    {member.status !== 'active' && (
                      <button className="text-xs text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-md font-medium transition-colors shadow-sm">
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-amber-100/50 rounded-lg border border-amber-200 flex gap-3">
              <div className="shrink-0 mt-0.5 text-amber-600"><AlertTriangle size={16} /></div>
              <div className="text-sm text-amber-900 leading-snug">
                <strong>Sahwan Law Advisory:</strong> Fingerprint and good conduct certificate requirements can be completed at RERA office. Allow 3-5 business days for processing.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Categories */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Regulatory */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50 rounded-t-xl">
            <div className="p-1.5 bg-blue-100 rounded text-blue-600"><FileText size={18} /></div>
            <h3 className="font-semibold text-slate-900">Regulatory Requirements</h3>
          </div>
          <div className="p-4 space-y-3 flex-1">
            {complianceItems.filter(i => ['Board Registration with RERA', 'Annual Financial Audit'].includes(i.item)).map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                <div>
                  <div className="font-medium text-slate-900 text-sm">{item.item}</div>
                  <div className="text-xs text-slate-500 mt-1 font-mono">Due: {item.deadline}</div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Safety & Insurance */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50 rounded-t-xl">
            <div className="p-1.5 bg-emerald-100 rounded text-emerald-600"><ShieldCheck size={18} /></div>
            <h3 className="font-semibold text-slate-900">Safety & Insurance</h3>
          </div>
          <div className="p-4 space-y-3 flex-1">
            {complianceItems.filter(i => ['Insurance Renewal', 'Fire Safety Certificate', 'Security Contract Review'].includes(i.item)).map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                <div>
                  <div className="font-medium text-slate-900 text-sm">{item.item}</div>
                  <div className="text-xs text-slate-500 mt-1 font-mono">Due: {item.deadline}</div>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- LEGAL ---

const Legal = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Legal Services</h2>
          <p className="text-sm text-slate-500 mt-1">Case management and legal advisory powered by Sahwan Law</p>
        </div>
        <button className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors shadow-sm">
          + Request Consultation
        </button>
      </div>

      {/* Active Cases */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
          <h3 className="font-semibold text-slate-900">Active Legal Matters</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {legalCases.map(case_ => (
            <div key={case_.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                      case_.type === 'Debt Collection' ? 'bg-red-100 text-red-600' :
                      case_.type === 'Property Damage' ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {case_.type === 'Debt Collection' ? <Scale size={24} /> : case_.type === 'Property Damage' ? <Building size={24} /> : <FileText size={24} />}
                    </div>
                    <div>
                      <div className="font-bold text-lg text-slate-900">{case_.type}</div>
                      <div className="text-sm text-slate-600 mt-1">{case_.description}</div>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50/80 rounded-lg p-4 border border-slate-100">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Status</div>
                      <div className="mt-1"><StatusBadge status={case_.status} /></div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Last Action</div>
                      <div className="text-sm text-slate-700 mt-1 font-medium">{case_.lastAction}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Next Step</div>
                      <div className="text-sm text-amber-700 font-bold mt-1">{case_.nextStep}</div>
                    </div>
                  </div>
                </div>
                {case_.amount && (
                  <div className="text-right md:pl-6 md:border-l border-slate-100 min-w-[120px]">
                    <div className="text-xs text-slate-500 font-medium uppercase">Claim Amount</div>
                    <div className="text-2xl font-bold text-slate-900 mt-1">BD {case_.amount.toLocaleString()}</div>
                  </div>
                )}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors font-medium">
                  View Documents
                </button>
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors font-medium">
                  Timeline
                </button>
                <button className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg hover:bg-amber-100 transition-colors font-medium ml-auto">
                  Contact Attorney
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Services Menu */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <FileText size={32} />, title: "Contract Review", desc: "Management, vendor, service agreements" },
          { icon: <Scale size={32} />, title: "Dispute Resolution", desc: "Mediation and litigation support" },
          { icon: <Gavel size={32} />, title: "Legal Opinions", desc: "Formal advisory on association matters" },
          { icon: <Building size={32} />, title: "RERA Compliance", desc: "Regulatory filings and appeals" }
        ].map((service, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group text-center md:text-left">
            <div className="text-slate-400 group-hover:text-amber-600 transition-colors mb-4 inline-block">{service.icon}</div>
            <h3 className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">{service.title}</h3>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">{service.desc}</p>
          </div>
        ))}
      </div>

      {/* Engagement Status */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl border border-amber-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-amber-600 rounded-lg flex items-center justify-center text-white font-serif text-2xl font-bold shadow-md">
            SL
          </div>
          <div>
            <div className="font-bold text-amber-900 text-lg">Sahwan Law</div>
            <div className="text-sm text-amber-700 font-medium">Legal Retainer - Active</div>
          </div>
        </div>
        
        <div className="flex gap-8 border-t md:border-t-0 md:border-l border-amber-200 pt-4 md:pt-0 md:pl-8 w-full md:w-auto justify-between md:justify-start">
           <div>
            <div className="text-xs text-amber-600 font-semibold uppercase tracking-wider">Balance</div>
            <div className="text-2xl font-bold text-amber-900">BD 600</div>
          </div>
           <div>
            <div className="text-xs text-amber-600 font-semibold uppercase tracking-wider">Valid Until</div>
            <div className="text-2xl font-bold text-amber-900">Dec 2026</div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium text-amber-800">
           <a href="#" className="hover:text-amber-600 flex items-center gap-1">Website <ExternalLink size={14} /></a>
           <a href="#" className="hover:text-amber-600">Contact Office</a>
        </div>
      </div>
    </div>
  );
};

// --- COMPLAINTS ---

const Complaints = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Complaints & Issues</h2>
          <p className="text-sm text-slate-500 mt-1">Track and resolve unit owner concerns</p>
        </div>
        <button className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors shadow-sm flex items-center gap-2">
          <MessageCircle size={18} /> New Complaint
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total This Month", val: "12", color: "slate" },
          { label: "In Progress", val: "5", color: "blue" },
          { label: "Pending Review", val: "2", color: "amber" },
          { label: "Resolved", val: "5", color: "emerald" },
        ].map((stat, i) => (
          <div key={i} className={`bg-white rounded-xl border border-slate-200 p-4 text-center shadow-sm`}>
            <div className={`text-2xl font-bold text-${stat.color === 'slate' ? 'slate-900' : stat.color + '-600'}`}>{stat.val}</div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 rounded-t-xl">
          <h3 className="font-semibold text-slate-900">Recent Complaints</h3>
          <div className="flex gap-2 w-full sm:w-auto">
             <div className="relative flex-1 sm:flex-none">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="Search..." className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
             </div>
             <button className="p-1.5 border border-slate-300 rounded-lg text-slate-500 hover:bg-slate-100">
                <Filter size={18} />
             </button>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {complaints.map(complaint => (
            <div key={complaint.id} className="p-5 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm shrink-0 ${
                    complaint.unit === 'Common' ? 'bg-purple-100 text-purple-700' :
                    complaint.unit === 'Parking' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {complaint.unit}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{complaint.subject}</div>
                    <div className="text-sm text-slate-500 mt-1 font-medium">Reported: {complaint.date}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={complaint.priority} />
                  <StatusBadge status={complaint.status} />
                </div>
              </div>
              {complaint.status !== 'resolved' && (
                <div className="mt-4 flex flex-wrap gap-2 pl-0 sm:pl-16">
                  <button className="text-xs text-amber-600 hover:text-amber-700 font-medium hover:underline">Update Status</button>
                  <span className="text-slate-300">|</span>
                  <button className="text-xs text-slate-500 hover:text-slate-700 font-medium hover:underline">Add Note</button>
                  <span className="text-slate-300">|</span>
                  <button className="text-xs text-slate-500 hover:text-slate-700 font-medium hover:underline">Escalate to Legal</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- BOARD ---

const Board = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Board & Governance</h2>
          <p className="text-sm text-slate-500 mt-1">Board members, roles, and management oversight</p>
        </div>
      </div>

      {/* Board Members */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
          <h3 className="font-semibold text-slate-900">Current Board</h3>
        </div>
        <div className="p-5 grid md:grid-cols-3 gap-6">
          {associationData.boardMembers.map((member, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 text-center hover:shadow-md transition-shadow relative group overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full mx-auto flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="font-bold text-slate-900 text-lg">{member.name}</div>
              <div className="text-sm text-amber-600 font-semibold uppercase tracking-wide mt-1">{member.role}</div>
              <div className="mt-4"><StatusBadge status={member.status} /></div>
              <div className="text-xs text-slate-400 mt-3 font-medium">Since {member.since}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Management Company */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
          <h3 className="font-semibold text-slate-900">Property Management</h3>
          <StatusBadge status={associationData.manager.status} />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-3xl shadow-inner">🏢</div>
            <div>
              <div className="font-bold text-slate-900 text-lg">{associationData.manager.name}</div>
              <div className="text-sm text-slate-500 font-medium">Contact: {associationData.manager.contact}</div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200 flex gap-3">
             <div className="text-amber-600 mt-0.5"><AlertTriangle size={18} /></div>
             <div className="text-sm text-amber-900">
              <strong>Review Required:</strong> Management performance under review. Key concerns include delayed board installation, unclear AGM procedures, and communication issues. Legal assessment in progress.
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors font-medium">
              View Contract
            </button>
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors font-medium">
              Performance History
            </button>
            <button className="px-4 py-2 bg-amber-100 text-amber-800 text-sm rounded-lg hover:bg-amber-200 transition-colors font-medium ml-auto">
              Request Legal Review
            </button>
          </div>
        </div>
      </div>

      {/* Governance Documents */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
          <h3 className="font-semibold text-slate-900">Governance Documents</h3>
        </div>
        <div className="p-5 grid md:grid-cols-2 gap-4">
          {documents.map((doc, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 group-hover:text-amber-600 transition-colors">
                    <FileText size={20} />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{doc.name}</div>
                  <div className="text-xs text-slate-500 font-medium mt-0.5">{doc.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={doc.status} />
                <button className="p-2 text-slate-400 hover:text-amber-600 transition-colors">
                    <Download size={18} />
                </button>
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

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard />;
      case 'meetings': return <Meetings />;
      case 'compliance': return <Compliance />;
      case 'financial': return <Financial />;
      case 'legal': return <Legal />;
      case 'complaints': return <Complaints />;
      case 'board': return <Board />;
      default: return <Dashboard />;
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
