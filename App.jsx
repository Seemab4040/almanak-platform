import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, ArrowRight, Bell, Building, Calendar, Check, ChevronDown, ChevronRight, Circle, ClipboardCheck, DollarSign, Download, ExternalLink, FileText, Filter, Gavel, LayoutGrid, MessageCircle, Plus, Scale, Search, Settings, ShieldCheck, TrendingDown, TrendingUp, Users, X } from 'lucide-react';

// --- SUPABASE ---
const SUPABASE_URL = "https://tuabithtulphofnmblxu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1YWJpdGh0dWxwaG9mbm1ibHh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMTMwNjQsImV4cCI6MjA4NTY4OTA2NH0.iZ8GzhltzA6RG44pgZBvZhP5edt1iOPI4AEK94nz76I";
const hdrs = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" };

async function fetchFromSupabase(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, { headers: hdrs });
  if (!res.ok) throw new Error(`Failed to fetch ${table}: ${res.statusText}`);
  return res.json();
}
async function postToSupabase(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method: "POST", headers: { ...hdrs, "Prefer": "return=representation" }, body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.text(); throw new Error(`Failed to save: ${e}`); }
  return res.json();
}
async function patchToSupabase(table, id, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, { method: "PATCH", headers: { ...hdrs, "Prefer": "return=representation" }, body: JSON.stringify(data) });
  if (!res.ok) { const e = await res.text(); throw new Error(`Failed to update: ${e}`); }
  return res.json();
}

// --- MODAL ---
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};


// --- TOAST NOTIFICATION ---
const Toast = ({ message, show, onClose, type = 'info' }) => {
  const bgColors = { success: 'bg-emerald-50 border-emerald-200', info: 'bg-blue-50 border-blue-200', warning: 'bg-amber-50 border-amber-200', error: 'bg-red-50 border-red-200' };
  const textColors = { success: 'text-emerald-700', info: 'text-blue-700', warning: 'text-amber-700', error: 'text-red-700' };
  const icons = { success: '✓', info: 'ℹ', warning: '⚠', error: '✕' };
  if (!show) return null;
  return (
    <div className="fixed top-4 right-4 z-[100] animate-fade-in">
      <div className={`${bgColors[type]} border rounded-xl shadow-lg p-4 flex items-center gap-3 min-w-[300px]`}>
        <span className={`text-xl ${textColors[type]}`}>{icons[type]}</span>
        <span className={`text-sm font-medium flex-1 ${textColors[type]}`}>{message}</span>
        <button onClick={onClose} className={`${textColors[type]} hover:opacity-70`}><X size={16} /></button>
      </div>
    </div>
  );
};

// --- FORM HELPERS ---
const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all";
const labelCls = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1";
const SelectInput = ({ label, value, onChange, options }) => (
  <div><label className={labelCls}>{label}</label><select value={value} onChange={e => onChange(e.target.value)} className={inputCls + " bg-white"}>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
);
const TextInput = ({ label, value, onChange, placeholder, type }) => (
  <div><label className={labelCls}>{label}</label><input type={type || "text"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={inputCls} /></div>
);
const SubmitBtn = ({ loading, label }) => (
  <button type="submit" disabled={loading} className="w-full bg-amber-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
    {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</> : label}
  </button>
);

// --- STATUS BADGE ---
const colors = { active:'bg-emerald-100 text-emerald-800 border-emerald-200', pending:'bg-amber-100 text-amber-800 border-amber-200', pending_registration:'bg-amber-100 text-amber-800 border-amber-200', pending_fingerprint:'bg-orange-100 text-orange-800 border-orange-200', completed:'bg-emerald-100 text-emerald-800 border-emerald-200', in_progress:'bg-blue-100 text-blue-800 border-blue-200', expired:'bg-red-100 text-red-800 border-red-200', critical:'bg-red-100 text-red-800 border-red-200', high:'bg-orange-100 text-orange-800 border-orange-200', medium:'bg-yellow-100 text-yellow-800 border-yellow-200', low:'bg-slate-100 text-slate-700 border-slate-200', scheduled:'bg-blue-100 text-blue-800 border-blue-200', proposed:'bg-purple-100 text-purple-800 border-purple-200', notice_sent:'bg-amber-100 text-amber-800 border-amber-200', investigation:'bg-blue-100 text-blue-800 border-blue-200', pending_resolution:'bg-orange-100 text-orange-800 border-orange-200', investigating:'bg-blue-100 text-blue-800 border-blue-200', resolved:'bg-emerald-100 text-emerald-800 border-emerald-200', under_review:'bg-amber-100 text-amber-800 border-amber-200', filed:'bg-emerald-100 text-emerald-800 border-emerald-200', current:'bg-emerald-100 text-emerald-800 border-emerald-200', reminder_sent:'bg-blue-100 text-blue-800 border-blue-200', legal_notice:'bg-red-100 text-red-800 border-red-200', not_started:'bg-slate-100 text-slate-600 border-slate-200' };
const labelMap = { pending_registration:'Pending Registration', pending_fingerprint:'Pending Fingerprint', in_progress:'In Progress', notice_sent:'Notice Sent', pending_resolution:'Pending Resolution', under_review:'Under Review', legal_notice:'Legal Notice Sent', reminder_sent:'Reminder Sent', not_started:'Not Started' };
const StatusBadge = ({ status }) => {
  const label = labelMap[status] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  return <span className={`px-2 py-0.5 text-xs font-medium rounded border whitespace-nowrap ${colors[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>{label}</span>;
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
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 rounded-lg group ${active ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-900 border-l-4 border-amber-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
    <span className={`text-lg transition-colors ${active ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-600'}`}>{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

const Sidebar = ({ activeSection, setActiveSection, darkMode }) => {
  const [showAssocDropdown, setShowAssocDropdown] = useState(false);
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
    <aside className={`w-64 border-r flex flex-col h-screen shrink-0 transition-colors duration-300 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-sm"><Building size={18} className="text-white" /></div>
          <div><div className="font-bold text-slate-900 text-sm tracking-tight">Al-Malak</div><div className="text-xs text-slate-400">BY SAHWAN LAW</div></div>
        </div>
      </div>
      <div className="p-3 border-b border-slate-100 relative">
        <div className="text-xs text-slate-400 uppercase font-semibold tracking-wider px-2 mb-2">ASSOCIATION</div>
        <div onClick={() => setShowAssocDropdown(!showAssocDropdown)} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center"><span className="text-white text-xs font-bold">LH</span></div>
          <div><div className="text-xs font-semibold text-slate-700">Lagoon Heights</div><div className="text-xs text-slate-400">48 units</div></div>
          <ChevronDown size={14} className={`ml-auto text-slate-400 transition-transform ${showAssocDropdown ? 'rotate-180' : ''}`} />
        </div>
        {showAssocDropdown && (
          <div className="absolute top-full left-3 right-3 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-40 overflow-hidden">
            <div className="p-3 border-b border-slate-100">
              <div className="text-xs font-bold text-slate-500 uppercase mb-2">Association Info</div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Total Units</span><span className="font-semibold text-slate-700">48</span></div>
              <div className="flex justify-between text-xs mt-1"><span className="text-slate-500">Registered Owners</span><span className="font-semibold text-slate-700">42</span></div>
              <div className="flex justify-between text-xs mt-1"><span className="text-slate-500">Active Since</span><span className="font-semibold text-slate-700">2024</span></div>
            </div>
            <div className="p-3">
              <div className="text-xs font-bold text-slate-500 uppercase mb-2">Quick Links</div>
              <div onClick={() => { setActiveSection('board'); setShowAssocDropdown(false); }} className="text-xs text-amber-600 font-semibold hover:underline cursor-pointer py-0.5">→ Association Details</div>
              <div onClick={() => { setActiveSection('compliance'); setShowAssocDropdown(false); }} className="text-xs text-amber-600 font-semibold hover:underline cursor-pointer py-0.5">→ Compliance Overview</div>
              <div onClick={() => { setActiveSection('financial'); setShowAssocDropdown(false); }} className="text-xs text-amber-600 font-semibold hover:underline cursor-pointer py-0.5">→ Financial Summary</div>
            </div>
          </div>
        )}
      </div>
      <nav className="flex-1 p-3 overflow-y-auto">
        {navItems.map(item => <NavItem key={item.id} icon={item.icon} label={item.label} active={activeSection === item.id} onClick={() => setActiveSection(item.id)} />)}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"><span>🔗</span><span>sahwanlaw.com</span></div>
      </div>
    </aside>
  );
};

// --- HEADER (with bell notifications) ---
const headerTitles = {
  dashboard: { title: 'Dashboard', subtitle: 'Lagoon Heights Owners Association' },
  meetings: { title: 'Meetings', subtitle: 'Manage and schedule association meetings' },
  compliance: { title: 'Compliance', subtitle: 'Track regulatory and legal compliance items' },
  financial: { title: 'Financial', subtitle: 'Financial overview and payment tracking' },
  legal: { title: 'Legal Services', subtitle: 'Active legal cases and actions' },
  complaints: { title: 'Complaints', subtitle: 'Owner complaints and resolutions' },
  board: { title: 'Board & Management', subtitle: 'Board members and association management' },
};

const Header = ({ activeSection, darkMode, setDarkMode, onLogout, currentUser }) => {
  const [showBell, setShowBell] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toggleEmail, setToggleEmail] = useState(true);
  const [togglePush, setTogglePush] = useState(true);
  const [toggleDark, setToggleDark] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, icon: "🔴", title: "Fire Safety Certificate Expired", time: "2 hours ago", read: false },
    { id: 2, icon: "🟠", title: "Board Registration Deadline — Feb 20", time: "1 day ago", read: false },
    { id: 3, icon: "🔵", title: "AGM Notice sent to all owners", time: "2 days ago", read: false },
    { id: 4, icon: "⚪", title: "Unit 12B payment notice delivered", time: "3 days ago", read: true },
  ]);
  const unread = notifications.filter(n => !n.read).length;
  const markAllRead = () => { setNotifications(prev => prev.map(n => ({...n, read: true}))); };
  const { title, subtitle } = headerTitles[activeSection] || { title: "Dashboard", subtitle: "" };
  return (
    <header className="flex items-center justify-between mb-8">
      <div><h1 className="text-2xl font-bold text-slate-900">{title}</h1><p className="text-sm text-slate-500 mt-0.5">{subtitle}</p></div>
      <div className="flex items-center gap-3">
        {/* Bell */}
        <div className="relative">
          <div onClick={() => setShowBell(!showBell)} className="relative cursor-pointer">
            <Bell size={20} className="text-slate-500 hover:text-slate-700 transition-colors" />
            {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"><span className="text-white text-xs font-bold">{unread}</span></span>}
          </div>
          {showBell && (
            <div className="absolute top-7 right-0 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50">
              <div className="flex items-center justify-between p-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-800">Notifications</span>
                <span onClick={markAllRead} className="text-xs text-amber-600 font-semibold cursor-pointer hover:underline">Mark all read</span>
              </div>
              {notifications.map(n => (
                <div key={n.id} className={`flex items-start gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors ${!n.read ? "bg-blue-50/40" : ""}`}>
                  <span className="text-base mt-0.5">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs ${!n.read ? "font-semibold text-slate-800" : "text-slate-600"}`}>{n.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{n.time}</div>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0"></div>}
                </div>
              ))}
              <div className="p-3 border-t border-slate-100 text-center"><span onClick={() => setShowBell(false)} className="text-xs text-amber-600 font-semibold cursor-pointer hover:underline">View all notifications</span></div>
            </div>
          )}
        </div>
        {/* Settings */}
        <div className="relative">
          <div onClick={() => setShowSettings(!showSettings)} className="cursor-pointer">
            <Settings size={20} className={`transition-colors ${showSettings ? "text-amber-600" : "text-slate-500 hover:text-slate-700"}`} />
          </div>
          {showSettings && (
            <div className="absolute top-7 right-0 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-800">Settings</span>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Profile</div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center"><span className="text-white text-sm font-bold">PA</span></div>
                    <div><div className="text-sm font-semibold text-slate-800">{currentUser?.name || 'User'}</div><div className="text-xs text-slate-500">{currentUser?.role || 'Member'} — Lagoon Heights</div></div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Preferences</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
                      <span className="text-xs text-slate-600">Email Notifications</span>
                      <div onClick={() => setToggleEmail(!toggleEmail)} className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${toggleEmail ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${toggleEmail ? 'left-4' : 'left-0.5'}`}></div></div>
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
                      <span className="text-xs text-slate-600">Push Notifications</span>
                      <div onClick={() => setTogglePush(!togglePush)} className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${togglePush ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${togglePush ? 'left-4' : 'left-0.5'}`}></div></div>
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
                      <span className="text-xs text-slate-600">Dark Mode</span>
                      <div onClick={() => { setToggleDark(!toggleDark); setDarkMode(!darkMode); }} className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${toggleDark ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${toggleDark ? 'left-4' : 'left-0.5'}`}></div></div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Association</div>
                  <div className="flex justify-between text-xs p-2"><span className="text-slate-500">Name</span><span className="font-semibold text-slate-700">Lagoon Heights</span></div>
                  <div className="flex justify-between text-xs p-2"><span className="text-slate-500">Total Units</span><span className="font-semibold text-slate-700">48</span></div>
                  <div className="flex justify-between text-xs p-2"><span className="text-slate-500">Law Firm</span><span className="font-semibold text-slate-700">Sahwan Law</span></div>
                </div>
                {!showLogoutConfirm ? (
                  <button onClick={() => setShowLogoutConfirm(true)} className="w-full text-xs text-red-500 font-semibold hover:text-red-700 py-2 border-t border-slate-100 mt-2">Log Out</button>
                ) : (
                  <div className="border-t border-slate-100 mt-2 pt-3 space-y-2">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="text-xs font-semibold text-red-700">Are you sure?</div>
                      <div className="text-xs text-red-500 mt-0.5">You will be logged out of Al-Malak dashboard.</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 text-xs text-slate-600 font-semibold py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">Cancel</button>
                      <button onClick={() => { setShowSettings(false); setShowLogoutConfirm(false); onLogout(); }} className="flex-1 text-xs text-white font-semibold py-1.5 rounded-lg bg-red-500 hover:bg-red-600">Log Out</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm"><span className="text-white text-xs font-bold">PA</span></div>
        <div className="text-right"><div className="text-xs font-semibold text-slate-700">{currentUser?.name?.split(' ')[0] || 'User'}</div><div className="text-xs text-slate-400">{currentUser?.role || 'Member'}</div></div>
      </div>
    </header>
  );
};

// --- NEW MEETING MODAL (shared, used by Dashboard + Meetings) ---
const NewMeetingModal = ({ open, onClose, onAdd }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'AGM', date: '', time: '18:00', status: 'scheduled', agenda: '', quorum: '', notice: 'Pending', legal_review: 'not_started' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date) return;
    setSaving(true);
    try {
      const newRow = await postToSupabase('meetings', form);
      onAdd(newRow);
      onClose();
      setForm({ type: 'AGM', date: '', time: '18:00', status: 'scheduled', agenda: '', quorum: '', notice: 'Pending', legal_review: 'not_started' });
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };
  return (
    <Modal open={open} onClose={onClose} title="Schedule New Meeting">
      <form onSubmit={handleSubmit} className="space-y-3">
        <SelectInput label="Meeting Type" value={form.type} onChange={v => setForm({...form, type: v})} options={[{value:'AGM',label:'Annual General Meeting (AGM)'},{value:'EGM',label:'Extraordinary Meeting (EGM)'},{value:'Board Meeting',label:'Board Meeting'}]} />
        <TextInput label="Date" value={form.date} onChange={v => setForm({...form, date: v})} type="date" />
        <TextInput label="Time" value={form.time} onChange={v => setForm({...form, time: v})} type="time" />
        <SelectInput label="Status" value={form.status} onChange={v => setForm({...form, status: v})} options={[{value:'scheduled',label:'Scheduled'},{value:'proposed',label:'Proposed'}]} />
        <TextInput label="Agenda (comma separated)" value={form.agenda} onChange={v => setForm({...form, agenda: v})} placeholder="e.g. Budget Review, Elections" />
        <TextInput label="Quorum Required" value={form.quorum} onChange={v => setForm({...form, quorum: v})} placeholder="e.g. 75% (36 of 48 units)" />
        <SelectInput label="Legal Review" value={form.legal_review} onChange={v => setForm({...form, legal_review: v})} options={[{value:'not_started',label:'Not Started'},{value:'pending',label:'Pending'},{value:'in_progress',label:'In Progress'},{value:'completed',label:'Completed'}]} />
        <SubmitBtn loading={saving} label="Create Meeting" />
      </form>
    </Modal>
  );
};

// --- DASHBOARD ---
const Dashboard = ({ meetings, legalCases, complianceItems, setActiveSection, setMeetings }) => {
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const totalOwing = 17200;
  const totalBilled = 45600;
  const collectionRate = ((totalBilled - totalOwing) / totalBilled * 100).toFixed(1);
  return (
    <div className="animate-fade-in">
      <NewMeetingModal open={showNewMeeting} onClose={() => setShowNewMeeting(false)} onAdd={(rows) => setMeetings(prev => [...prev, ...rows])} />

      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-4 mb-6 text-white shadow-md">
        <div className="flex items-start gap-3"><AlertTriangle size={22} className="shrink-0 mt-0.5" /><div><div className="font-bold text-base">Urgent Actions Required</div><div className="text-sm text-red-100 mt-0.5">3 compliance items need immediate attention - Board registration deadline <span className="font-semibold text-white">Feb 20</span> - Fire safety certificate expired</div></div></div>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Collection Rate" value={`${collectionRate}%`} subtext={`BD ${(totalBilled - totalOwing).toLocaleString()} of BD ${totalBilled.toLocaleString()}`} trend={-5} />
        <MetricCard label="Delinquent Units" value="8" subtext="BD 17,200 outstanding" alert />
        <MetricCard label="Active Legal Cases" value={String(legalCases.length)} subtext="1 debt, 1 property, 1 reg." />
        <MetricCard label="Compliance Score" value="67%" subtext="2 critical items pending" />
      </div>
      <div className="grid grid-cols-2 gap-6">
        {/* Meetings card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><span className="text-lg">📅</span><span className="font-semibold text-slate-800">Upcoming Meetings</span></div>
            <span onClick={() => setShowNewMeeting(true)} className="text-xs text-amber-600 font-semibold cursor-pointer hover:underline">Schedule New →</span>
          </div>
          {meetings.slice(0, 2).map(m => (
            <div key={m.id} className="p-3 hover:bg-slate-50 rounded-lg transition-colors">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="font-bold text-slate-900 text-sm">{m.type}</span><StatusBadge status={m.status} /></div><div className="flex items-center gap-2"><span className="text-xs text-slate-400">LEGAL REVIEW</span><StatusBadge status={m.legal_review} /></div></div>
              <div className="text-xs text-slate-500 mt-1">{m.date} at {m.time}</div>
              <div className="text-xs text-slate-400 mt-1">Agenda: {m.agenda ? m.agenda.substring(0, 60) + '...' : ''}</div>
            </div>
          ))}
        </div>
        {/* Legal card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><span className="text-lg">⚖️</span><span className="font-semibold text-slate-800">Legal Activity</span></div>
            <span onClick={() => setActiveSection('legal')} className="text-xs text-amber-600 font-semibold cursor-pointer hover:underline">View All →</span>
          </div>
          {legalCases.map(c => (
            <div key={c.id} className="p-3 hover:bg-slate-50 rounded-lg transition-colors">
              <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="font-medium text-slate-900 text-sm">{c.type}</span><StatusBadge status={c.status} /></div>{c.amount && <div className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">BD {Number(c.amount).toLocaleString()}</div>}</div>
              <div className="text-xs text-slate-500 leading-snug mt-1">{c.description}</div>
              <div className="flex items-center gap-1 mt-1.5 text-xs text-amber-700 font-medium"><ArrowRight size={11} /><span>Next Step: </span><span className="text-slate-700">{c.next_step}</span></div>
            </div>
          ))}
        </div>
      </div>
      {/* Compliance tracker */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mt-6">
        <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><span className="text-lg">🛡️</span><span className="font-semibold text-slate-800">Compliance Tracker</span></div><span className="text-xs text-slate-500">{complianceItems.length} items</span></div>
        <div className="grid grid-cols-3 gap-3">
          {complianceItems.map(item => (
            <div key={item.id} className={`p-3 rounded-lg border ${item.status === 'expired' || item.priority === 'critical' ? 'border-red-200 bg-red-50' : item.status === 'completed' ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center justify-between mb-1"><StatusBadge status={item.status} /><StatusBadge status={item.priority} /></div>
              <div className="text-xs font-semibold text-slate-800 mt-2">{item.item}</div>
              <div className="text-xs text-slate-500 mt-1">Due: {item.deadline}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MEETINGS PAGE ---
const Meetings = ({ meetings, setMeetings }) => {
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };
  
  const filteredMeetings = meetings.filter(m => {
    if (filterType !== 'all' && m.type !== filterType) return false;
    if (filterStatus !== 'all' && m.status !== filterStatus) return false;
    return true;
  });
  
  const clearFilters = () => {
    setFilterType('all');
    setFilterStatus('all');
    showToast('Filters cleared', 'success');
  };
  
  const meetingTypes = [
    { title: "Annual General Meeting (AGM)", type: "Mandatory", bg: "blue", icon: "🏛️", desc: "Budget approval, elections, reviews." },
    { title: "Extraordinary Meeting (EGM)", type: "Urgent", bg: "purple", icon: "⚡", desc: "Emergency decisions, special resolutions." },
    { title: "Board Meeting", type: "Routine", bg: "emerald", icon: "👥", desc: "Operational oversight, management decisions." }
  ];
  
  return (
    <div className="animate-fade-in">
      <Toast message={toast.message} show={toast.show} onClose={() => setToast({ ...toast, show: false })} type={toast.type} />
      <NewMeetingModal open={showModal} onClose={() => setShowModal(false)} onAdd={(rows) => { setMeetings(prev => [...prev, ...rows]); showToast('Meeting created successfully', 'success'); }} />
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        {meetingTypes.map((mt, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-2"><span className="text-2xl">{mt.icon}</span><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${mt.bg === 'blue' ? 'bg-blue-100 text-blue-700' : mt.bg === 'purple' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>{mt.type}</span></div>
            <div className="font-semibold text-slate-800 text-sm">{mt.title}</div>
            <div className="text-xs text-slate-500 mt-1">{mt.desc}</div>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">All Meetings ({filteredMeetings.length})</h3>
          <div className="flex gap-2">
            <div className="relative">
              <button onClick={() => setShowFilter(!showFilter)} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors ${showFilter || filterType !== 'all' || filterStatus !== 'all' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <Filter size={13} /> Filter {(filterType !== 'all' || filterStatus !== 'all') && '(Active)'}
              </button>
              {showFilter && (
                <div className="absolute top-10 right-0 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700">Filter Meetings</span>
                    <button onClick={() => setShowFilter(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Type</label>
                      <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
                        <option value="all">All Types</option>
                        <option value="AGM">AGM</option>
                        <option value="EGM">EGM</option>
                        <option value="Board Meeting">Board Meeting</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Status</label>
                      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
                        <option value="all">All Statuses</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="proposed">Proposed</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <button onClick={clearFilters} className="w-full text-xs bg-slate-100 text-slate-600 py-1.5 rounded-lg hover:bg-slate-200">Clear Filters</button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-1 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors"><Plus size={13} /> New Meeting</button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
            <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Date & Time</th>
            <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
            <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Legal Review</th>
            <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Quorum</th>
            <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Notice</th>
          </tr></thead>
          <tbody>{filteredMeetings.map(m => (
            <tr key={m.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="p-3 font-medium text-slate-800">{m.type}</td>
              <td className="p-3 text-slate-600">{m.date} at {m.time}</td>
              <td className="p-3"><StatusBadge status={m.status} /></td>
              <td className="p-3"><StatusBadge status={m.legal_review} /></td>
              <td className="p-3 text-xs text-slate-500">{m.quorum}</td>
              <td className="p-3 text-xs text-slate-500">{m.notice}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mt-6">
        <h3 className="font-semibold text-slate-800 mb-3">Agenda Items</h3>
        {filteredMeetings.map(m => (
          <div key={m.id} className="mb-4">
            <div className="flex items-center gap-2 mb-2"><span className="text-sm font-semibold text-slate-700">{m.type}</span><StatusBadge status={m.status} /></div>
            <div className="flex flex-wrap gap-2 ml-2">{m.agenda && m.agenda.split(',').map((item, idx) => <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{item.trim()}</span>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- FINANCIAL ---
const Financial = ({ delinquentUnits, setDelinquentUnits }) => {
  const [noticeUnit, setNoticeUnit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterDays, setFilterDays] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };
  
  const filteredUnits = delinquentUnits.filter(u => {
    if (filterDays === '30+' && u.days < 30) return false;
    if (filterDays === '60+' && u.days < 60) return false;
    if (filterDays === '90+' && u.days < 90) return false;
    if (filterStatus !== 'all' && u.status !== filterStatus) return false;
    return true;
  });
  
  const totalOwing = filteredUnits.reduce((s, u) => s + Number(u.amount), 0);
  
  const exportCSV = () => {
    const headers = ['Unit', 'Owner', 'Amount (BD)', 'Days Overdue', 'Status'];
    const rows = filteredUnits.map(u => [u.unit, u.owner, u.amount, u.days, u.status]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delinquent-units-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported successfully', 'success');
  };
  
  const sendNotice = async () => {
    setSaving(true);
    try {
      await patchToSupabase('delinquent_units', noticeUnit.id, { status: 'notice_sent' });
      setDelinquentUnits(prev => prev.map(u => u.id === noticeUnit.id ? { ...u, status: 'notice_sent' } : u));
      setNoticeUnit(null);
      showToast('Notice sent successfully', 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };
  
  return (
    <div className="animate-fade-in">
      <Toast message={toast.message} show={toast.show} onClose={() => setToast({ ...toast, show: false })} type={toast.type} />
      <Modal open={!!noticeUnit} onClose={() => setNoticeUnit(null)} title="Send Notice">
        {noticeUnit && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4"><div className="text-sm font-semibold text-amber-800">Notice Details</div><div className="text-xs text-amber-600 mt-1">A formal payment notice will be sent to the owner.</div></div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Unit:</span><span className="font-semibold">{noticeUnit.unit}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Owner:</span><span className="font-semibold">{noticeUnit.owner}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Amount:</span><span className="font-semibold text-red-700">BD {Number(noticeUnit.amount).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Days Overdue:</span><span className="font-semibold">{noticeUnit.days} days</span></div>
            </div>
            <button onClick={sendNotice} disabled={saving} className="w-full bg-amber-600 text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Sending...</> : 'Confirm & Send Notice'}
            </button>
          </div>
        )}
      </Modal>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Billed" value="BD 45,600" subtext="Monthly maintenance fees" />
        <MetricCard label="Collected" value={`BD ${(45600 - delinquentUnits.reduce((s,u)=>s+Number(u.amount),0)).toLocaleString()}`} subtext="Successfully collected" trend={3} />
        <MetricCard label="Outstanding" value={`BD ${totalOwing.toLocaleString()}`} subtext={`${filteredUnits.length} units overdue`} alert />
        <MetricCard label="Collection Rate" value={`${((45600 - delinquentUnits.reduce((s,u)=>s+Number(u.amount),0)) / 45600 * 100).toFixed(1)}%`} subtext="Current period" trend={-5} />
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4"><div className="flex items-center gap-2 mb-3"><span className="text-lg">💳</span><span className="font-semibold text-slate-700 text-sm">Payment Methods</span></div><div className="space-y-2"><div className="flex justify-between text-xs"><span className="text-slate-500">Bank Transfer</span><span className="font-semibold text-slate-700">BD 18,400</span></div><div className="flex justify-between text-xs"><span className="text-slate-500">Online Portal</span><span className="font-semibold text-slate-700">BD 8,200</span></div><div className="flex justify-between text-xs"><span className="text-slate-500">Cash</span><span className="font-semibold text-slate-700">BD 1,800</span></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4"><div className="flex items-center gap-2 mb-3"><span className="text-lg">📊</span><span className="font-semibold text-slate-700 text-sm">Budget Overview</span></div><div className="space-y-2"><div className="flex justify-between text-xs"><span className="text-slate-500">Maintenance</span><span className="font-semibold text-slate-700">BD 22,000</span></div><div className="flex justify-between text-xs"><span className="text-slate-500">Insurance</span><span className="font-semibold text-slate-700">BD 8,500</span></div><div className="flex justify-between text-xs"><span className="text-slate-500">Legal & Admin</span><span className="font-semibold text-slate-700">BD 5,200</span></div></div></div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4"><div className="flex items-center gap-2 mb-3"><span className="text-lg">📈</span><span className="font-semibold text-slate-700 text-sm">Reserves</span></div><div className="space-y-2"><div className="flex justify-between text-xs"><span className="text-slate-500">Emergency Fund</span><span className="font-semibold text-emerald-700">BD 45,000</span></div><div className="flex justify-between text-xs"><span className="text-slate-500">Sinking Fund</span><span className="font-semibold text-emerald-700">BD 28,000</span></div><div className="flex justify-between text-xs"><span className="text-slate-500">Status</span><span className="font-semibold text-emerald-700">Healthy</span></div></div></div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Delinquent Units ({filteredUnits.length})</h3>
          <div className="flex gap-2">
            <div className="relative">
              <button onClick={() => setShowFilter(!showFilter)} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors ${showFilter || filterDays !== 'all' || filterStatus !== 'all' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <Filter size={13} /> Filter {(filterDays !== 'all' || filterStatus !== 'all') && '(Active)'}
              </button>
              {showFilter && (
                <div className="absolute top-10 right-0 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700">Filter Units</span>
                    <button onClick={() => setShowFilter(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Days Overdue</label>
                      <select value={filterDays} onChange={(e) => setFilterDays(e.target.value)} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
                        <option value="all">All</option>
                        <option value="30+">30+ Days</option>
                        <option value="60+">60+ Days</option>
                        <option value="90+">90+ Days</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Status</label>
                      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
                        <option value="all">All Statuses</option>
                        <option value="current">Current</option>
                        <option value="reminder_sent">Reminder Sent</option>
                        <option value="notice_sent">Notice Sent</option>
                        <option value="legal_notice">Legal Notice</option>
                      </select>
                    </div>
                    <button onClick={() => { setFilterDays('all'); setFilterStatus('all'); showToast('Filters cleared', 'success'); }} className="w-full text-xs bg-slate-100 text-slate-600 py-1.5 rounded-lg hover:bg-slate-200">Clear Filters</button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={exportCSV} className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors"><Download size={13} /> Export CSV</button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 border-b border-slate-100"><th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Unit</th><th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Owner</th><th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Amount</th><th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Days Overdue</th><th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Status</th><th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Action</th></tr></thead>
          <tbody>{filteredUnits.map(row => (
            <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
              <td className="p-3 font-medium text-slate-800">{row.unit}</td><td className="p-3 text-slate-600">{row.owner}</td><td className="p-3 font-semibold text-red-700">BD {Number(row.amount).toLocaleString()}</td>
              <td className="p-3"><span className={`text-xs font-semibold ${row.days > 60 ? 'text-red-600' : row.days > 30 ? 'text-orange-600' : 'text-amber-600'}`}>{row.days} days</span></td>
              <td className="p-3"><StatusBadge status={row.status} /></td>
              <td className="p-3"><button onClick={() => setNoticeUnit(row)} className="text-xs text-amber-600 font-semibold hover:underline">Send Notice</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
};

// --- COMPLIANCE ---
const Compliance = ({ complianceItems, setComplianceItems }) => {
  const [showModal, setShowModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ item: '', status: 'pending', deadline: '', priority: 'medium' });
  const [showFilter, setShowFilter] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };
  
  const filteredItems = complianceItems.filter(i => {
    if (filterPriority !== 'all' && i.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    return true;
  });
  
  const handleAdd = async (e) => {
    e.preventDefault(); if (!form.item || !form.deadline) return; setSaving(true);
    try { const r = await postToSupabase('compliance_items', form); setComplianceItems(prev => [...prev, ...r]); setShowModal(false); setForm({ item: '', status: 'pending', deadline: '', priority: 'medium' }); showToast('Compliance item added', 'success'); }
    catch (err) { showToast(err.message, 'error'); } finally { setSaving(false); }
  };
  const handleUpdate = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await patchToSupabase('compliance_items', updateModal.id, { status: updateModal.status, priority: updateModal.priority }); setComplianceItems(prev => prev.map(i => i.id === updateModal.id ? { ...i, status: updateModal.status, priority: updateModal.priority } : i)); setUpdateModal(null); showToast('Item updated', 'success'); }
    catch (err) { showToast(err.message, 'error'); } finally { setSaving(false); }
  };
  
  return (
    <div className="animate-fade-in">
      <Toast message={toast.message} show={toast.show} onClose={() => setToast({ ...toast, show: false })} type={toast.type} />
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Compliance Item">
        <form onSubmit={handleAdd} className="space-y-3">
          <TextInput label="Item Name" value={form.item} onChange={v => setForm({...form, item: v})} placeholder="e.g. Fire Safety Certificate" />
          <TextInput label="Deadline" value={form.deadline} onChange={v => setForm({...form, deadline: v})} type="date" />
          <SelectInput label="Status" value={form.status} onChange={v => setForm({...form, status: v})} options={[{value:'pending',label:'Pending'},{value:'in_progress',label:'In Progress'},{value:'completed',label:'Completed'},{value:'expired',label:'Expired'}]} />
          <SelectInput label="Priority" value={form.priority} onChange={v => setForm({...form, priority: v})} options={[{value:'critical',label:'Critical'},{value:'high',label:'High'},{value:'medium',label:'Medium'},{value:'low',label:'Low'}]} />
          <SubmitBtn loading={saving} label="Add Item" />
        </form>
      </Modal>
      <Modal open={!!updateModal} onClose={() => setUpdateModal(null)} title="Update Compliance Item">
        {updateModal && (
          <form onSubmit={handleUpdate} className="space-y-3">
            <div className="bg-slate-50 rounded-lg p-3"><div className="text-sm font-semibold text-slate-700">{updateModal.item}</div><div className="text-xs text-slate-400">Deadline: {updateModal.deadline}</div></div>
            <SelectInput label="Status" value={updateModal.status} onChange={v => setUpdateModal({...updateModal, status: v})} options={[{value:'pending',label:'Pending'},{value:'in_progress',label:'In Progress'},{value:'completed',label:'Completed'},{value:'expired',label:'Expired'}]} />
            <SelectInput label="Priority" value={updateModal.priority} onChange={v => setUpdateModal({...updateModal, priority: v})} options={[{value:'critical',label:'Critical'},{value:'high',label:'High'},{value:'medium',label:'Medium'},{value:'low',label:'Low'}]} />
            <SubmitBtn loading={saving} label="Save Changes" />
          </form>
        )}
      </Modal>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Items" value={String(filteredItems.length)} subtext="Tracked compliance items" />
        <MetricCard label="Critical" value={String(filteredItems.filter(i => i.priority === 'critical').length)} subtext="Need immediate action" alert />
        <MetricCard label="Completed" value={String(filteredItems.filter(i => i.status === 'completed').length)} subtext="Fully compliant" />
        <MetricCard label="Pending" value={String(filteredItems.filter(i => i.status === 'pending' || i.status === 'in_progress').length)} subtext="In progress or waiting" />
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Compliance Items ({filteredItems.length})</h3>
          <div className="flex gap-2">
            <div className="relative">
              <button onClick={() => setShowFilter(!showFilter)} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors ${showFilter || filterPriority !== 'all' || filterStatus !== 'all' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <Filter size={13} /> Filter {(filterPriority !== 'all' || filterStatus !== 'all') && '(Active)'}
              </button>
              {showFilter && (
                <div className="absolute top-10 right-0 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700">Filter Items</span>
                    <button onClick={() => setShowFilter(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Priority</label>
                      <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
                        <option value="all">All Priorities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Status</label>
                      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                    <button onClick={() => { setFilterPriority('all'); setFilterStatus('all'); showToast('Filters cleared', 'success'); }} className="w-full text-xs bg-slate-100 text-slate-600 py-1.5 rounded-lg hover:bg-slate-200">Clear Filters</button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-1 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700"><Plus size={13} /> Add Item</button>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredItems.map(item => (
            <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0" style={{background: item.status === 'expired' ? '#fee2e2' : item.status === 'completed' ? '#dcfce7' : '#f1f5f9'}}>🏛️</div>
                <div><div className="font-medium text-slate-800 text-sm">{item.item}</div><div className="text-xs text-slate-500 mt-0.5">Deadline: {item.deadline}</div></div>
              </div>
              <div className="flex items-center gap-3"><StatusBadge status={item.priority} /><StatusBadge status={item.status} /><button onClick={() => setUpdateModal({...item})} className="text-xs text-amber-600 font-semibold hover:underline ml-2">Update</button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- LEGAL ---
const Legal = ({ legalCases, setLegalCases }) => {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'Debt Collection', description: '', amount: '', status: 'pending', last_action: '', next_step: '' });
  const handleSubmit = async (e) => {
    e.preventDefault(); if (!form.description) return; setSaving(true);
    try { const payload = { ...form, amount: form.amount ? Number(form.amount) : null }; const r = await postToSupabase('legal_cases', payload); setLegalCases(prev => [...prev, ...r]); setShowModal(false); setForm({ type: 'Debt Collection', description: '', amount: '', status: 'pending', last_action: '', next_step: '' }); }
    catch (err) { alert(err.message); } finally { setSaving(false); }
  };
  return (
    <div className="animate-fade-in">
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Legal Case">
        <form onSubmit={handleSubmit} className="space-y-3">
          <SelectInput label="Case Type" value={form.type} onChange={v => setForm({...form, type: v})} options={[{value:'Debt Collection',label:'Debt Collection'},{value:'Property Damage',label:'Property Damage'},{value:'Regulatory',label:'Regulatory'},{value:'Contract Dispute',label:'Contract Dispute'}]} />
          <TextInput label="Description" value={form.description} onChange={v => setForm({...form, description: v})} placeholder="Brief description of the case" />
          <TextInput label="Amount (BD) — optional" value={form.amount} onChange={v => setForm({...form, amount: v})} placeholder="e.g. 5000" type="number" />
          <SelectInput label="Status" value={form.status} onChange={v => setForm({...form, status: v})} options={[{value:'pending',label:'Pending'},{value:'notice_sent',label:'Notice Sent'},{value:'investigation',label:'Investigation'},{value:'pending_resolution',label:'Pending Resolution'},{value:'resolved',label:'Resolved'}]} />
          <TextInput label="Last Action" value={form.last_action} onChange={v => setForm({...form, last_action: v})} placeholder="e.g. Initial consultation completed" />
          <TextInput label="Next Step" value={form.next_step} onChange={v => setForm({...form, next_step: v})} placeholder="e.g. File formal complaint" />
          <SubmitBtn loading={saving} label="Create Case" />
        </form>
      </Modal>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard label="Active Cases" value={String(legalCases.length)} subtext="Currently being handled" />
        <MetricCard label="Total Exposure" value={`BD ${legalCases.filter(c => c.amount).reduce((s, c) => s + Number(c.amount), 0).toLocaleString()}`} subtext="Potential liability" alert />
        <MetricCard label="Resolved This Month" value="1" subtext="Successfully closed" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">All Legal Cases</h3>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700"><Plus size={13} /> New Case</button>
        </div>
        <div className="divide-y divide-slate-100">
          {legalCases.map(c => (
            <div key={c.id} className="p-5 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${c.type === 'Debt Collection' ? 'bg-red-100 text-red-600' : c.type === 'Property Damage' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}><Gavel size={16} /></div>
                  <span className="font-semibold text-slate-800 text-sm">{c.type}</span><StatusBadge status={c.status} />
                </div>
                {c.amount && <span className="text-sm font-bold text-red-700 bg-red-50 px-3 py-1 rounded-lg border border-red-100">BD {Number(c.amount).toLocaleString()}</span>}
              </div>
              <p className="text-xs text-slate-500 ml-10">{c.description}</p>
              <div className="ml-10 mt-2 space-y-1"><div className="text-xs text-slate-400"><span className="font-medium text-slate-600">Last Action:</span> {c.last_action}</div><div className="text-xs text-amber-700 font-medium flex items-center gap-1"><ArrowRight size={11} /> Next: {c.next_step}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- COMPLAINTS ---
const Complaints = ({ complaints, setComplaints }) => {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ unit: '', subject: '', date: new Date().toISOString().split('T')[0], status: 'pending', priority: 'medium' });
  const [showFilter, setShowFilter] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };
  
  const filteredComplaints = complaints.filter(c => {
    if (filterPriority !== 'all' && c.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    return true;
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault(); if (!form.unit || !form.subject) return; setSaving(true);
    try { const r = await postToSupabase('complaints', form); setComplaints(prev => [...prev, ...r]); setShowModal(false); setForm({ unit: '', subject: '', date: new Date().toISOString().split('T')[0], status: 'pending', priority: 'medium' }); showToast('Complaint submitted', 'success'); }
    catch (err) { showToast(err.message, 'error'); } finally { setSaving(false); }
  };
  
  return (
    <div className="animate-fade-in">
      <Toast message={toast.message} show={toast.show} onClose={() => setToast({ ...toast, show: false })} type={toast.type} />
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Complaint">
        <form onSubmit={handleSubmit} className="space-y-3">
          <TextInput label="Unit Number" value={form.unit} onChange={v => setForm({...form, unit: v})} placeholder="e.g. Unit 5A" />
          <TextInput label="Subject" value={form.subject} onChange={v => setForm({...form, subject: v})} placeholder="Brief description of complaint" />
          <TextInput label="Date" value={form.date} onChange={v => setForm({...form, date: v})} type="date" />
          <SelectInput label="Priority" value={form.priority} onChange={v => setForm({...form, priority: v})} options={[{value:'critical',label:'Critical'},{value:'high',label:'High'},{value:'medium',label:'Medium'},{value:'low',label:'Low'}]} />
          <SelectInput label="Status" value={form.status} onChange={v => setForm({...form, status: v})} options={[{value:'pending',label:'Pending'},{value:'investigating',label:'Investigating'},{value:'in_progress',label:'In Progress'},{value:'resolved',label:'Resolved'}]} />
          <SubmitBtn loading={saving} label="Submit Complaint" />
        </form>
      </Modal>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Complaints" value={String(filteredComplaints.length)} subtext="All time" />
        <MetricCard label="Open" value={String(filteredComplaints.filter(c => c.status !== 'resolved').length)} subtext="Awaiting resolution" />
        <MetricCard label="Critical" value={String(filteredComplaints.filter(c => c.priority === 'critical').length)} subtext="High priority" alert />
        <MetricCard label="Resolved" value={String(filteredComplaints.filter(c => c.status === 'resolved').length)} subtext="Successfully closed" />
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">All Complaints ({filteredComplaints.length})</h3>
          <div className="flex gap-2">
            <div className="relative">
              <button onClick={() => setShowFilter(!showFilter)} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors ${showFilter || filterPriority !== 'all' || filterStatus !== 'all' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                <Filter size={13} /> Filter {(filterPriority !== 'all' || filterStatus !== 'all') && '(Active)'}
              </button>
              {showFilter && (
                <div className="absolute top-10 right-0 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700">Filter Complaints</span>
                    <button onClick={() => setShowFilter(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Priority</label>
                      <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
                        <option value="all">All Priorities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Status</label>
                      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white">
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="investigating">Investigating</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                    <button onClick={() => { setFilterPriority('all'); setFilterStatus('all'); showToast('Filters cleared', 'success'); }} className="w-full text-xs bg-slate-100 text-slate-600 py-1.5 rounded-lg hover:bg-slate-200">Clear Filters</button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-1 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700"><MessageCircle size={13} /> New Complaint</button>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredComplaints.map(c => (
            <div key={c.id} className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${c.priority === 'critical' ? 'bg-red-50 text-red-700 border-red-200' : c.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{c.unit}</span>
                  <span className="font-medium text-slate-800 text-sm">{c.subject}</span>
                </div>
                <div className="flex items-center gap-2"><StatusBadge status={c.priority} /><StatusBadge status={c.status} /></div>
              </div>
              <div className="text-sm text-slate-500 mt-1 font-medium">Reported: {c.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- BOARD ---
const Board = ({ boardMembers, setBoardMembers, documents, setDocuments }) => {
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showMgrModal, setShowMgrModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: '', role: 'Member', status: 'pending_registration', since: new Date().toISOString().split('T')[0] });
  const [docForm, setDocForm] = useState({ name: '', date: new Date().toISOString().split('T')[0], status: 'current' });
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };
  const associationData = { name: "Lagoon Heights Owners Association", units: 48, registeredOwners: 42, manager: { name: "Impact Property Management", contact: "Imad", status: "under_review" } };

  const handleAddMember = async (e) => {
    e.preventDefault(); if (!memberForm.name) return; setSaving(true);
    try { const r = await postToSupabase('board_members', memberForm); setBoardMembers(prev => [...prev, ...r]); setShowMemberModal(false); showToast('Board member added successfully', 'success'); setMemberForm({ name: '', role: 'Member', status: 'pending_registration', since: new Date().toISOString().split('T')[0] }); }
    catch (err) { alert(err.message); } finally { setSaving(false); }
  };
  const handleAddDoc = async (e) => {
    e.preventDefault(); if (!docForm.name) return; setSaving(true);
    try { const r = await postToSupabase('documents', docForm); setDocuments(prev => [...prev, ...r]); setShowDocModal(false); showToast('Document added successfully', 'success'); setDocForm({ name: '', date: new Date().toISOString().split('T')[0], status: 'current' }); }
    catch (err) { alert(err.message); } finally { setSaving(false); }
  };
  return (
    <div className="animate-fade-in">
      <Toast message={toast.message} show={toast.show} onClose={() => setToast({ ...toast, show: false })} type={toast.type} />
      <Modal open={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Board Member">
        <form onSubmit={handleAddMember} className="space-y-3">
          <TextInput label="Full Name" value={memberForm.name} onChange={v => setMemberForm({...memberForm, name: v})} placeholder="e.g. Ahmed Al-Mahmood" />
          <SelectInput label="Role" value={memberForm.role} onChange={v => setMemberForm({...memberForm, role: v})} options={[{value:'Chairman',label:'Chairman'},{value:'Vice Chairman',label:'Vice Chairman'},{value:'Treasurer',label:'Treasurer'},{value:'Secretary',label:'Secretary'},{value:'Member',label:'Member'}]} />
          <SelectInput label="Status" value={memberForm.status} onChange={v => setMemberForm({...memberForm, status: v})} options={[{value:'active',label:'Active'},{value:'pending_registration',label:'Pending Registration'},{value:'pending_fingerprint',label:'Pending Fingerprint'}]} />
          <TextInput label="Member Since" value={memberForm.since} onChange={v => setMemberForm({...memberForm, since: v})} type="date" />
          <SubmitBtn loading={saving} label="Add Member" />
        </form>
      </Modal>
      <Modal open={showDocModal} onClose={() => setShowDocModal(false)} title="Add Document">
        <form onSubmit={handleAddDoc} className="space-y-3">
          <TextInput label="Document Name" value={docForm.name} onChange={v => setDocForm({...docForm, name: v})} placeholder="e.g. Board Resolution - 2026" />
          <TextInput label="Date" value={docForm.date} onChange={v => setDocForm({...docForm, date: v})} type="date" />
          <SelectInput label="Status" value={docForm.status} onChange={v => setDocForm({...docForm, status: v})} options={[{value:'current',label:'Current'},{value:'filed',label:'Filed'},{value:'pending_registration',label:'Pending Registration'},{value:'under_review',label:'Under Review'}]} />
          <SubmitBtn loading={saving} label="Add Document" />
        </form>
      </Modal>
      <Modal open={showMgrModal} onClose={() => setShowMgrModal(false)} title="Property Management Details">
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
            <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center text-3xl shadow border">🏢</div>
            <div><div className="text-base font-bold text-slate-800">{associationData.manager.name}</div><div className="text-sm text-slate-500">Property Management Company</div></div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between p-2 border-b border-slate-50"><span className="text-xs text-slate-500">Company Name</span><span className="text-xs font-semibold text-slate-700">{associationData.manager.name}</span></div>
            <div className="flex justify-between p-2 border-b border-slate-50"><span className="text-xs text-slate-500">Main Contact</span><span className="text-xs font-semibold text-slate-700">{associationData.manager.contact}</span></div>
            <div className="flex justify-between p-2 border-b border-slate-50"><span className="text-xs text-slate-500">Contract Status</span><span className="text-xs"><StatusBadge status={associationData.manager.status} /></span></div>
            <div className="flex justify-between p-2 border-b border-slate-50"><span className="text-xs text-slate-500">Services</span><span className="text-xs font-semibold text-slate-700">Maintenance, Security, Accounts</span></div>
            <div className="flex justify-between p-2 border-b border-slate-50"><span className="text-xs text-slate-500">Contract Start</span><span className="text-xs font-semibold text-slate-700">Jan 2024</span></div>
            <div className="flex justify-between p-2"><span className="text-xs text-slate-500">Contract End</span><span className="text-xs font-semibold text-slate-700">Dec 2026</span></div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="text-xs font-semibold text-amber-800">⚠️ Review Pending</div>
            <div className="text-xs text-amber-600 mt-1">Contract renewal is under review by the board. Decision expected by end of February.</div>
          </div>
        </div>
      </Modal>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard label="Board Members" value={String(boardMembers.length)} subtext="Active members" />
        <MetricCard label="Registered Owners" value={String(associationData.registeredOwners)} subtext={`of ${associationData.units} units`} />
        <MetricCard label="Management" value="Active" subtext="Impact Property Mgmt" />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Board Members</h3>
          <button onClick={() => setShowMemberModal(true)} className="flex items-center gap-1 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700"><Plus size={13} /> Add Member</button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {boardMembers.map(member => (
            <div key={member.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-3"><div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl shadow-inner">🏢</div><div><div className="font-semibold text-slate-800 text-sm">{member.name}</div><div className="text-xs text-slate-500">{member.role}</div></div></div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100"><StatusBadge status={member.status} /><span className="text-xs text-slate-400">Since {member.since}</span></div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-semibold text-slate-800 mb-4">Property Management</h3>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div className="flex items-center gap-4"><div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-2xl shadow border">🏢</div><div><div className="font-semibold text-slate-800">{associationData.manager.name}</div><div className="text-sm text-slate-500 font-medium">Contact: {associationData.manager.contact}</div></div></div>
          <div className="flex items-center gap-3"><StatusBadge status={associationData.manager.status} /><button onClick={() => setShowMgrModal(true)} className="text-xs text-amber-600 font-semibold hover:underline flex items-center gap-1"><ExternalLink size={12} /> View Details</button></div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Association Documents</h3>
          <button onClick={() => setShowDocModal(true)} className="flex items-center gap-1 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700"><Plus size={13} /> Upload</button>
        </div>
        <div className="space-y-2">
          {documents.map((doc, i) => (
            <div key={doc.id || i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
              <div className="flex items-center gap-3"><FileText size={18} className="text-slate-400" /><div><div className="text-sm font-medium text-slate-700">{doc.name}</div><div className="text-xs text-slate-400">Updated: {doc.date}</div></div></div>
              <div className="flex items-center gap-2"><StatusBadge status={doc.status} /><Download size={16} onClick={() => { const blob = new Blob([`Document: ${doc.name}\nDate: ${doc.date}\nStatus: ${doc.status}\n\nThis is a simulated document download.`], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${doc.name.replace(/\s/g, "-")}.txt`; a.click(); URL.revokeObjectURL(url); }} className="text-slate-400 cursor-pointer hover:text-slate-600" /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

// --- LOGIN / SIGNUP PAGES ---
const AuthPage = ({ showLogin, setShowLogin, onLogin, onSignup }) => {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!loginForm.email || !loginForm.password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const success = onLogin(loginForm.email, loginForm.password);
      if (!success) setError('Invalid credentials');
      setLoading(false);
    }, 800);
  };
  
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      setError('Please fill in all fields');
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      onSignup(signupForm.name, signupForm.email, signupForm.password);
      setLoading(false);
    }, 800);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg">
              <Building size={24} className="text-white" />
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold text-slate-900 tracking-tight">Al-Malak</div>
              <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">By Sahwan Law</div>
            </div>
          </div>
          <p className="text-sm text-slate-600">Owners Association Management Platform</p>
        </div>
        
        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button onClick={() => { setShowLogin(true); setError(''); }} className={`flex-1 py-4 text-sm font-semibold transition-all ${showLogin ? 'bg-white text-amber-700 border-b-2 border-amber-600' : 'bg-slate-50 text-slate-500 hover:text-slate-700'}`}>
              Login
            </button>
            <button onClick={() => { setShowLogin(false); setError(''); }} className={`flex-1 py-4 text-sm font-semibold transition-all ${!showLogin ? 'bg-white text-amber-700 border-b-2 border-amber-600' : 'bg-slate-50 text-slate-500 hover:text-slate-700'}`}>
              Sign Up
            </button>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            
            {showLogin ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <input type="email" value={loginForm.email} onChange={(e) => setLoginForm({...loginForm, email: e.target.value})} placeholder="your@email.com" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                  <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} placeholder="••••••••" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Logging in...</> : 'Login to Dashboard'}
                </button>
                <div className="text-center text-xs text-slate-500 mt-3">
                  Demo: Use any email & password to login
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <input type="text" value={signupForm.name} onChange={(e) => setSignupForm({...signupForm, name: e.target.value})} placeholder="John Doe" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                  <input type="email" value={signupForm.email} onChange={(e) => setSignupForm({...signupForm, email: e.target.value})} placeholder="your@email.com" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                  <input type="password" value={signupForm.password} onChange={(e) => setSignupForm({...signupForm, password: e.target.value})} placeholder="••••••••" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                  <input type="password" value={signupForm.confirmPassword} onChange={(e) => setSignupForm({...signupForm, confirmPassword: e.target.value})} placeholder="••••••••" className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Creating account...</> : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        </div>
        
        <div className="text-center mt-6 text-xs text-slate-500">
          © 2026 Al-Malak Platform • Powered by Sahwan Law
        </div>
      </div>
    </div>
  );
};


export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true); // true = login, false = signup
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [boardMembers, setBoardMembers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [complianceItems, setComplianceItems] = useState([]);
  const [legalCases, setLegalCases] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [delinquentUnits, setDelinquentUnits] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  

  
  const handleSignup = async (name, email, password) => {
    try {
      // Check if email exists in Supabase
      const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/app_users?email=eq.${encodeURIComponent(email)}`, { headers: hdrs });
      const existing = await checkRes.json();
      if (existing?.length > 0) {
        alert('Email already registered. Please login.');
        return false;
      }
      
      // Create user in Supabase
      const res = await fetch(`${SUPABASE_URL}/rest/v1/app_users`, {
        method: 'POST',
        headers: { ...hdrs, 'Prefer': 'return=representation' },
        body: JSON.stringify({ name, email, password, role: 'Member' })
      });
      
      if (!res.ok) throw new Error('Signup failed');
      const [user] = await res.json();
      
      // Save session
      localStorage.setItem('al_malak_user', JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role }));
      setCurrentUser({ id: user.id, name: user.name, email: user.email, role: user.role });
      setIsAuthenticated(true);
      loadAllData();
      return true;
    } catch (err) {
      alert('Signup failed: ' + err.message);
      return false;
    }
  };
  
  const handleLogin = async (email, password) => {
    try {
      // Query Supabase for user
      const res = await fetch(`${SUPABASE_URL}/rest/v1/app_users?email=eq.${encodeURIComponent(email)}&password=eq.${encodeURIComponent(password)}`, { headers: hdrs });
      if (!res.ok) throw new Error('Login failed');
      
      const users = await res.json();
      if (users.length === 0) return false; // Invalid credentials
      
      const user = users[0];
      
      // Save session
      localStorage.setItem('al_malak_user', JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role }));
      setCurrentUser({ id: user.id, name: user.name, email: user.email, role: user.role });
      setIsAuthenticated(true);
      loadAllData();
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  
  const handleLogout = () => {
    localStorage.removeItem('al_malak_user');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setBoardMembers([]);
    setMeetings([]);
    setComplianceItems([]);
    setLegalCases([]);
    setComplaints([]);
    setDelinquentUnits([]);
    setDocuments([]);
  };
  
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [bm, mt, ci, lc, cp, du, dc] = await Promise.all([
        fetchFromSupabase('board_members'), fetchFromSupabase('meetings'), fetchFromSupabase('compliance_items'),
        fetchFromSupabase('legal_cases'), fetchFromSupabase('complaints'), fetchFromSupabase('delinquent_units'), fetchFromSupabase('documents'),
      ]);
      setBoardMembers(bm); setMeetings(mt); setComplianceItems(ci); setLegalCases(lc); setComplaints(cp); setDelinquentUnits(du); setDocuments(dc);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  
  // Restore session on page load
  useEffect(() => {
    const savedUser = localStorage.getItem('al_malak_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
        loadAllData();
      } catch (err) {
        localStorage.removeItem('al_malak_user');
      }
    }
  }, []);

;

  const renderContent = () => {
    if (loading) return (<div className="flex flex-col items-center justify-center h-64"><div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div><p className="text-slate-500 mt-4 text-sm">Loading data from database...</p></div>);
    if (error) return (<div className="flex flex-col items-center justify-center h-64 bg-red-50 rounded-xl border border-red-200 p-8"><AlertCircle size={40} className="text-red-500 mb-3" /><p className="text-red-700 font-semibold">Failed to load data</p><p className="text-red-500 text-sm mt-1">{error}</p><button onClick={() => window.location.reload()} className="mt-4 text-xs bg-red-100 text-red-700 px-4 py-1.5 rounded-lg hover:bg-red-200">Retry</button></div>);
    switch (activeSection) {
      case 'dashboard': return <Dashboard meetings={meetings} legalCases={legalCases} complianceItems={complianceItems} setActiveSection={setActiveSection} setMeetings={setMeetings} />;
      case 'meetings': return <Meetings meetings={meetings} setMeetings={setMeetings} />;
      case 'compliance': return <Compliance complianceItems={complianceItems} setComplianceItems={setComplianceItems} />;
      case 'financial': return <Financial delinquentUnits={delinquentUnits} setDelinquentUnits={setDelinquentUnits} />;
      case 'legal': return <Legal legalCases={legalCases} setLegalCases={setLegalCases} />;
      case 'complaints': return <Complaints complaints={complaints} setComplaints={setComplaints} />;
      case 'board': return <Board boardMembers={boardMembers} setBoardMembers={setBoardMembers} documents={documents} setDocuments={setDocuments} />;
      default: return <Dashboard meetings={meetings} legalCases={legalCases} complianceItems={complianceItems} setActiveSection={setActiveSection} setMeetings={setMeetings} />;
    }
  };

  return (
    <>
      {!isAuthenticated ? (
        <AuthPage showLogin={showLogin} setShowLogin={setShowLogin} onLogin={handleLogin} onSignup={handleSignup} />
      ) : (
        <div className={`min-h-screen flex text-slate-900 font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
          <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} darkMode={darkMode} />
          <main className={`ml-64 flex-1 p-8 overflow-y-auto h-screen ${darkMode ? 'bg-slate-900' : ''}`}>
            <div className="max-w-7xl mx-auto pb-10">
              <Header activeSection={activeSection} darkMode={darkMode} setDarkMode={setDarkMode} onLogout={handleLogout} currentUser={currentUser} />
              {renderContent()}
            </div>
          </main>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
          `}</style>
        </div>
      )}
    </>
  );
}