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
        <div className="flex items-center justify-between p-5 border-b border-[#f0ede8]">
          <h2 className="text-lg font-bold text-[#0f2537]">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-[#4a5568] transition-colors"><X size={20} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// --- TOAST NOTIFICATION ---
const Toast = ({ message, show, onClose, type = 'info' }) => {
  const bgColors = { success: 'bg-emerald-50 border-emerald-200', info: 'bg-blue-50 border-blue-200', warning: 'bg-amber-50 border-amber-200', error: 'bg-red-50 border-red-200' };
  const textColors = { success: 'text-emerald-700', info: 'text-blue-700', warning: 'text-[#b8895a]', error: 'text-red-700' };
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
const inputCls = "w-full border border-[#e2dfd9] rounded-lg px-3 py-2 text-sm text-[#0f2537] focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all";
const labelCls = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1";
const SelectInput = ({ label, value, onChange, options }) => (
  <div><label className={labelCls}>{label}</label><select value={value} onChange={e => onChange(e.target.value)} className={inputCls + " bg-white"}>{options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
);
const TextInput = ({ label, value, onChange, placeholder, type }) => (
  <div><label className={labelCls}>{label}</label><input type={type || "text"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={inputCls} /></div>
);
const SubmitBtn = ({ loading, label }) => (
  <button type="submit" disabled={loading} className="w-full bg-[#c49b66] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#b8895a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
    {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</> : label}
  </button>
);

// --- STATUS BADGE ---
const colors = { active:'bg-emerald-100 text-emerald-800 border-emerald-200', pending:'bg-[#f5ede3] text-amber-800 border-amber-200', pending_registration:'bg-[#f5ede3] text-amber-800 border-amber-200', pending_fingerprint:'bg-orange-100 text-orange-800 border-orange-200', completed:'bg-emerald-100 text-emerald-800 border-emerald-200', in_progress:'bg-blue-100 text-blue-800 border-blue-200', expired:'bg-red-100 text-red-800 border-red-200', critical:'bg-red-100 text-red-800 border-red-200', high:'bg-orange-100 text-orange-800 border-orange-200', medium:'bg-yellow-100 text-yellow-800 border-yellow-200', low:'bg-[#f0ede8] text-[#2d3748] border-[#e2dfd9]', scheduled:'bg-blue-100 text-blue-800 border-blue-200', proposed:'bg-purple-100 text-purple-800 border-purple-200', notice_sent:'bg-[#f5ede3] text-amber-800 border-amber-200', investigation:'bg-blue-100 text-blue-800 border-blue-200', pending_resolution:'bg-orange-100 text-orange-800 border-orange-200', investigating:'bg-blue-100 text-blue-800 border-blue-200', resolved:'bg-emerald-100 text-emerald-800 border-emerald-200', under_review:'bg-[#f5ede3] text-amber-800 border-amber-200', filed:'bg-emerald-100 text-emerald-800 border-emerald-200', current:'bg-emerald-100 text-emerald-800 border-emerald-200', reminder_sent:'bg-blue-100 text-blue-800 border-blue-200', legal_notice:'bg-red-100 text-red-800 border-red-200', not_started:'bg-[#f0ede8] text-[#4a5568] border-[#e2dfd9]' };
const labelMap = { pending_registration:'Pending Registration', pending_fingerprint:'Pending Fingerprint', in_progress:'In Progress', notice_sent:'Notice Sent', pending_resolution:'Pending Resolution', under_review:'Under Review', legal_notice:'Legal Notice Sent', reminder_sent:'Reminder Sent', not_started:'Not Started' };
const StatusBadge = ({ status }) => {
  const label = labelMap[status] || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  return <span className={`px-2 py-0.5 text-xs font-medium rounded border whitespace-nowrap ${colors[status] || 'bg-[#f0ede8] text-[#2d3748] border-[#e2dfd9]'}`}>{label}</span>;
};

// --- METRIC CARD ---
const MetricCard = ({ label, value, subtext, trend, alert }) => (
  <div className={`bg-white rounded-xl p-5 border ${alert ? 'border-red-200 bg-red-50/30' : 'border-[#e2dfd9]'} shadow-sm transition-all duration-200 hover:shadow-md`}>
    <div className="text-sm text-slate-500 font-medium">{label}</div>
    <div className={`text-2xl font-bold mt-1 ${alert ? 'text-red-700' : 'text-[#1a3a52]'}`}>{value}</div>
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
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 rounded-lg group ${active ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 text-amber-900 border-l-4 border-[#c49b66]' : 'text-[#4a5568] hover:bg-[#faf8f5] hover:text-[#1a3a52]'}`}>
    <span className={`text-lg transition-colors ${active ? 'text-[#c49b66]' : 'text-slate-400 group-hover:text-[#4a5568]'}`}>{icon}</span>
    <span className="font-medium">{label}</span>
  </button>
);

const Sidebar = ({ activeSection, setActiveSection, darkMode, userAssociations, selectedAssociation, onAssociationChange }) => {
  const [showAssocDropdown, setShowAssocDropdown] = useState(false);
  const navItems = [
    { id: 'dashboard', icon: <LayoutGrid size={20} />, label: 'Dashboard' },
    { id: 'meetings', icon: <Calendar size={20} />, label: 'Meetings' },
    { id: 'compliance', icon: <ShieldCheck size={20} />, label: 'Compliance' },
    { id: 'financial', icon: <DollarSign size={20} />, label: 'Aged Receivable' },
    { id: 'services', icon: <Scale size={20} />, label: 'Services' },
    { id: 'complaints', icon: <AlertCircle size={20} />, label: 'Complaints' },
    { id: 'board', icon: <Users size={20} />, label: 'Key Personal' },
      { id: 'users', icon: <Users size={20} />, label: 'User Management' },
  ];
  return (
    <aside className={`w-64 border-r flex flex-col h-screen shrink-0 transition-colors duration-300 ${darkMode ? 'bg-[#0f2537] border-slate-700' : 'bg-white border-[#e2dfd9]'}`}>
      <div className="p-5 border-b border-[#f0ede8]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-sm"><Building size={18} className="text-white" /></div>
          <div><div className="font-bold text-[#1a3a52] text-sm tracking-tight">Al-Malak</div><div className="text-xs text-slate-400">BY SAHWAN LAW FIRM</div></div>
        </div>
      </div>
      <div className={`p-3 border-b transition-colors ${darkMode ? 'border-slate-700' : 'border-[#f0ede8]'} relative`}>
        <div className={`text-xs uppercase font-semibold tracking-wider px-2 mb-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>ASSOCIATION</div>
        <div onClick={() => setShowAssocDropdown(!showAssocDropdown)} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-[#faf8f5] hover:bg-[#f0ede8]'}`}>
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{selectedAssociation?.name?.substring(0, 2).toUpperCase() || 'AA'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-xs font-semibold truncate ${darkMode ? 'text-slate-200' : 'text-[#2d3748]'}`}>{selectedAssociation?.name || 'Select Association'}</div>
            <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{selectedAssociation?.total_units || 0} units</div>
          </div>
          <ChevronDown size={14} className={`transition-transform ${showAssocDropdown ? 'rotate-180' : ''} ${darkMode ? 'text-slate-400' : 'text-slate-400'}`} />
        </div>
        {showAssocDropdown && (
          <div className="absolute top-full left-3 right-3 mt-1 bg-white border border-[#e2dfd9] rounded-xl shadow-lg z-40 overflow-hidden max-h-96 overflow-y-auto">
            {/* List all user associations */}
            {userAssociations && userAssociations.length > 0 ? (
              <div className="p-2">
                <div className="text-xs font-bold text-slate-500 uppercase px-2 py-1">Switch Association</div>
                {userAssociations.map((userAssoc) => {
                  const assoc = userAssoc.associations;
                  const isSelected = selectedAssociation?.id === assoc.id;
                  return (
                    <div
                      key={assoc.id}
                      onClick={() => { onAssociationChange(assoc); setShowAssocDropdown(false); }}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-amber-50 border border-amber-200' : 'hover:bg-[#faf8f5]'}`}
                    >
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${isSelected ? 'bg-amber-500 text-white' : 'bg-slate-200 text-[#4a5568]'}`}>
                        {assoc.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-[#2d3748] truncate">{assoc.name}</div>
                        <div className="text-xs text-slate-400">{assoc.total_units} units • {userAssoc.role}</div>
                      </div>
                      {isSelected && <Check size={14} className="text-[#c49b66] shrink-0" />}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-xs text-slate-500 text-center">No associations found</div>
            )}
            
            {/* Current association info */}
            {selectedAssociation && (
              <div className="border-t border-[#f0ede8] p-3 bg-[#faf8f5]">
                <div className="text-xs font-bold text-slate-500 uppercase mb-2">Current Association Info</div>
                <div className="flex justify-between text-xs"><span className="text-slate-500">Total Units</span><span className="font-semibold text-[#2d3748]">{selectedAssociation.total_units}</span></div>
                <div className="flex justify-between text-xs mt-1"><span className="text-slate-500">Registered Owners</span><span className="font-semibold text-[#2d3748]">{selectedAssociation.registered_owners}</span></div>
                <div className="flex justify-between text-xs mt-1"><span className="text-slate-500">Active Since</span><span className="font-semibold text-[#2d3748]">{selectedAssociation.active_since}</span></div>
              </div>
            )}
            
            <div className="p-3 border-t border-[#f0ede8]">
              <div className="text-xs font-bold text-slate-500 uppercase mb-2">Quick Links</div>
              <div onClick={() => { setActiveSection('board'); setShowAssocDropdown(false); }} className="text-xs text-[#c49b66] font-semibold hover:underline cursor-pointer py-0.5">→ Association Details</div>
              <div onClick={() => { setActiveSection('compliance'); setShowAssocDropdown(false); }} className="text-xs text-[#c49b66] font-semibold hover:underline cursor-pointer py-0.5">→ Compliance Overview</div>
              <div onClick={() => { setActiveSection('financial'); setShowAssocDropdown(false); }} className="text-xs text-[#c49b66] font-semibold hover:underline cursor-pointer py-0.5">→ Financial Summary</div>
            </div>
          </div>
        )}
      </div>
      <nav className="flex-1 p-3 overflow-y-auto">
        {navItems.map(item => <NavItem key={item.id} icon={item.icon} label={item.label} active={activeSection === item.id} onClick={() => setActiveSection(item.id)} />)}
      </nav>
      <div className="p-4 border-t border-[#f0ede8]">
        <div className="flex items-center gap-2 text-xs text-slate-400 hover:text-[#4a5568] cursor-pointer transition-colors"><span>🔗</span><span>sahwanlaw.com</span></div>
      </div>
    </aside>
  );
};

// --- HEADER (with bell notifications) ---
const headerTitles = {
  dashboard: { title: 'Dashboard', subtitle: 'Lagoon Heights Owners Association' },
  meetings: { title: 'Meetings', subtitle: 'Manage and schedule association meetings' },
  compliance: { title: 'Compliance', subtitle: 'Track regulatory and legal compliance items' },
  financial: { title: 'Aged Receivable', subtitle: 'Outstanding payments and collection tracking' },
  services: { title: 'Services', subtitle: 'Collection and legal services management' },
  complaints: { title: 'Complaints', subtitle: 'Owner complaints and resolutions' },
  board: { title: 'Key Personal & Management', subtitle: 'Key personnel and association management' },
    users: { title: 'User Management', subtitle: 'Manage association users and access' },
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
      <div><h1 className="text-2xl font-bold text-[#1a3a52]">{title}</h1><p className="text-sm text-slate-500 mt-0.5">{subtitle}</p></div>
      <div className="flex items-center gap-3">
        {/* Bell */}
        <div className="relative">
          <div onClick={() => setShowBell(!showBell)} className="relative cursor-pointer">
            <Bell size={20} className="text-slate-500 hover:text-[#2d3748] transition-colors" />
            {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"><span className="text-white text-xs font-bold">{unread}</span></span>}
          </div>
          {showBell && (
            <div className="absolute top-7 right-0 w-80 bg-white border border-[#e2dfd9] rounded-xl shadow-xl z-50">
              <div className="flex items-center justify-between p-3 border-b border-[#f0ede8]">
                <span className="text-sm font-bold text-[#0f2537]">Notifications</span>
                <span onClick={markAllRead} className="text-xs text-[#c49b66] font-semibold cursor-pointer hover:underline">Mark all read</span>
              </div>
              {notifications.map(n => (
                <div key={n.id} className={`flex items-start gap-3 p-3 hover:bg-[#faf8f5] cursor-pointer transition-colors ${!n.read ? "bg-blue-50/40" : ""}`}>
                  <span className="text-base mt-0.5">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-xs ${!n.read ? "font-semibold text-[#0f2537]" : "text-[#4a5568]"}`}>{n.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{n.time}</div>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0"></div>}
                </div>
              ))}
              <div className="p-3 border-t border-[#f0ede8] text-center"><span onClick={() => setShowBell(false)} className="text-xs text-[#c49b66] font-semibold cursor-pointer hover:underline">View all notifications</span></div>
            </div>
          )}
        </div>
        {/* Settings */}
        <div className="relative">
          <div onClick={() => setShowSettings(!showSettings)} className="cursor-pointer">
            <Settings size={20} className={`transition-colors ${showSettings ? "text-[#c49b66]" : "text-slate-500 hover:text-[#2d3748]"}`} />
          </div>
          {showSettings && (
            <div className="absolute top-7 right-0 w-72 bg-white border border-[#e2dfd9] rounded-xl shadow-xl z-50">
              <div className="flex items-center justify-between p-4 border-b border-[#f0ede8]">
                <span className="text-sm font-bold text-[#0f2537]">Settings</span>
                <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-[#4a5568]"><X size={16} /></button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Profile</div>
                  <div className="flex items-center gap-3 p-3 bg-[#faf8f5] rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center"><span className="text-white text-sm font-bold">PA</span></div>
                    <div><div className="text-sm font-semibold text-[#0f2537]">{currentUser?.name || 'User'}</div><div className="text-xs text-slate-500">{currentUser?.role || 'Member'} — Lagoon Heights</div></div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Preferences</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 hover:bg-[#faf8f5] rounded-lg">
                      <span className="text-xs text-[#4a5568]">Email Notifications</span>
                      <div onClick={() => setToggleEmail(!toggleEmail)} className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${toggleEmail ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${toggleEmail ? 'left-4' : 'left-0.5'}`}></div></div>
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-[#faf8f5] rounded-lg">
                      <span className="text-xs text-[#4a5568]">Push Notifications</span>
                      <div onClick={() => setTogglePush(!togglePush)} className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${togglePush ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${togglePush ? 'left-4' : 'left-0.5'}`}></div></div>
                    </div>
                    <div className="flex items-center justify-between p-2 hover:bg-[#faf8f5] rounded-lg">
                      <span className="text-xs text-[#4a5568]">Dark Mode</span>
                      <div onClick={() => { setToggleDark(!toggleDark); setDarkMode(!darkMode); }} className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors duration-200 ${toggleDark ? 'bg-emerald-500' : 'bg-slate-300'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200 ${toggleDark ? 'left-4' : 'left-0.5'}`}></div></div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Association</div>
                  <div className="flex justify-between text-xs p-2"><span className="text-slate-500">Name</span><span className="font-semibold text-[#2d3748]">Lagoon Heights</span></div>
                  <div className="flex justify-between text-xs p-2"><span className="text-slate-500">Total Units</span><span className="font-semibold text-[#2d3748]">48</span></div>
                  <div className="flex justify-between text-xs p-2"><span className="text-slate-500">Law Firm</span><span className="font-semibold text-[#2d3748]">Sahwan Law</span></div>
                </div>
                {!showLogoutConfirm ? (
                  <button onClick={() => setShowLogoutConfirm(true)} className="w-full text-xs text-red-500 font-semibold hover:text-red-700 py-2 border-t border-[#f0ede8] mt-2">Log Out</button>
                ) : (
                  <div className="border-t border-[#f0ede8] mt-2 pt-3 space-y-2">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="text-xs font-semibold text-red-700">Are you sure?</div>
                      <div className="text-xs text-red-500 mt-0.5">You will be logged out of Al-Malak dashboard.</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 text-xs text-[#4a5568] font-semibold py-1.5 rounded-lg border border-[#e2dfd9] hover:bg-[#faf8f5]">Cancel</button>
                      <button onClick={() => { setShowSettings(false); setShowLogoutConfirm(false); onLogout(); }} className="flex-1 text-xs text-white font-semibold py-1.5 rounded-lg bg-red-500 hover:bg-red-600">Log Out</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm"><span className="text-white text-xs font-bold">PA</span></div>
        <div className="text-right"><div className="text-xs font-semibold text-[#2d3748]">{currentUser?.name?.split(' ')[0] || 'User'}</div><div className="text-xs text-slate-400">{currentUser?.role || 'Member'}</div></div>
      </div>
    </header>
  );
};

// --- NEW MEETING MODAL (shared, used by Dashboard + Meetings) ---
const NewMeetingModal = ({ open, onClose, onAdd, associationId }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'AGM', date: '', time: '18:00', status: 'scheduled', agenda: '', quorum: '', notice: 'Pending', legal_review: 'not_started' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.date) return;
    setSaving(true);
    try {
      const newRow = await postToSupabase('meetings', { ...form, association_id: associationId });
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
const Dashboard = ({ meetings, legalCases, complianceItems, setActiveSection, setMeetings, selectedAssociation }) => {
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const totalOwing = 17200;
  const totalBilled = 45600;
  const collectionRate = ((totalBilled - totalOwing) / totalBilled * 100).toFixed(1);
  return (
    <div className="animate-fade-in">
      <NewMeetingModal open={showNewMeeting} onClose={() => setShowNewMeeting(false)} onAdd={(rows) => setMeetings(prev => [...prev, ...rows])} associationId={selectedAssociation?.id} />

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
        <div className="bg-white rounded-xl border border-[#e2dfd9] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><span className="text-lg">📅</span><span className="font-semibold text-[#0f2537]">Upcoming Meetings</span></div>
            <span onClick={() => setShowNewMeeting(true)} className="text-xs text-[#c49b66] font-semibold cursor-pointer hover:underline">Schedule New →</span>
          </div>
          {meetings.slice(0, 2).map(m => (
            <div key={m.id} className="p-3 hover:bg-[#faf8f5] rounded-lg transition-colors">
              <div className="flex items-center justify-between border-b border-[#e2dfd9] pb-4 mb-6"><div className="flex items-center gap-2"><span className="font-bold text-[#1a3a52] text-sm">{m.type}</span><StatusBadge status={m.status} /></div><div className="flex items-center gap-2"><span className="text-xs text-slate-400">LEGAL REVIEW</span><StatusBadge status={m.legal_review} /></div></div>
              <div className="text-xs text-slate-500 mt-1">{m.date} at {m.time}</div>
              <div className="text-xs text-slate-400 mt-1">Agenda: {m.agenda ? m.agenda.substring(0, 60) + '...' : ''}</div>
            </div>
          ))}
        </div>
        {/* Legal card */}
        <div className="bg-white rounded-xl border border-[#e2dfd9] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><span className="text-lg">⚖️</span><span className="font-semibold text-[#0f2537]">Legal Activity</span></div>
            <span onClick={() => setActiveSection('legal')} className="text-xs text-[#c49b66] font-semibold cursor-pointer hover:underline">View All →</span>
          </div>
          {legalCases.map(c => (
            <div key={c.id} className="p-3 hover:bg-[#faf8f5] rounded-lg transition-colors">
              <div className="flex items-center justify-between border-b border-[#e2dfd9] pb-4 mb-6"><div className="flex items-center gap-2"><span className="font-medium text-[#1a3a52] text-sm">{c.type}</span><StatusBadge status={c.status} /></div>{c.amount && <div className="text-sm font-bold text-[#1a3a52] bg-[#f0ede8] px-2 py-0.5 rounded">BD {Number(c.amount).toLocaleString()}</div>}</div>
              <div className="text-xs text-slate-500 leading-snug mt-1">{c.description}</div>
              <div className="flex items-center gap-1 mt-1.5 text-xs text-[#b8895a] font-medium"><ArrowRight size={11} /><span>Next Step: </span><span className="text-[#2d3748]">{c.next_step}</span></div>
            </div>
          ))}
        </div>
      </div>
      {/* Compliance tracker */}
      <div className="bg-white rounded-xl border border-[#e2dfd9] shadow-sm p-5 mt-6">
        <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-2"><span className="text-lg">🛡️</span><span className="font-semibold text-[#0f2537]">Compliance Tracker</span></div><span className="text-xs text-slate-500">{complianceItems.length} items</span></div>
        <div className="grid grid-cols-3 gap-3">
          {complianceItems.map(item => (
            <div key={item.id} className={`p-3 rounded-lg border ${item.status === 'expired' || item.priority === 'critical' ? 'border-red-200 bg-red-50' : item.status === 'completed' ? 'border-emerald-200 bg-emerald-50' : 'border-[#e2dfd9] bg-[#faf8f5]'}`}>
              <div className="flex items-center justify-between mb-1"><StatusBadge status={item.status} /><StatusBadge status={item.priority} /></div>
              <div className="text-xs font-semibold text-[#0f2537] mt-2">{item.item}</div>
              <div className="text-xs text-slate-500 mt-1">Due: {item.deadline}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MEETINGS PAGE ---
const Meetings = ({ meetings, setMeetings, selectedAssociation }) => {
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  
  // Minutes of Meeting state
  const [showMinutesModal, setShowMinutesModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [minutesForm, setMinutesForm] = useState({ attendees: '', topics_discussed: '', decisions_made: '', action_items: '', next_meeting: '' });
  const [editingMinutes, setEditingMinutes] = useState(null);
  const [meetingMinutes, setMeetingMinutes] = useState([]);
  const [saving, setSaving] = useState(false);
  
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };
  
  // Fetch minutes for all meetings
  useEffect(() => {
    if (selectedAssociation?.id) {
      fetchMinutes();
    }
  }, [selectedAssociation]);
  
  const fetchMinutes = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/meeting_minutes?association_id=eq.${selectedAssociation.id}`, { headers: hdrs });
      if (res.ok) setMeetingMinutes(await res.json());
    } catch (err) { console.error(err); }
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
  
  const openMinutesModal = (meeting) => {
    setSelectedMeeting(meeting);
    // Check if minutes already exist for this meeting
    const existing = meetingMinutes.find(m => m.meeting_id === meeting.id);
    if (existing) {
      setEditingMinutes(existing);
      setMinutesForm({
        attendees: existing.attendees,
        topics_discussed: existing.topics_discussed,
        decisions_made: existing.decisions_made,
        action_items: existing.action_items,
        next_meeting: existing.next_meeting || ''
      });
    } else {
      setEditingMinutes(null);
      setMinutesForm({ attendees: '', topics_discussed: '', decisions_made: '', action_items: '', next_meeting: '' });
    }
    setShowMinutesModal(true);
  };
  
  const handleSaveMinutes = async (e) => {
    e.preventDefault();
    if (!minutesForm.attendees || !minutesForm.topics_discussed) {
      showToast('Please fill in required fields', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingMinutes) {
        // Update existing minutes
        await patchToSupabase('meeting_minutes', editingMinutes.id, minutesForm);
        setMeetingMinutes(prev => prev.map(m => m.id === editingMinutes.id ? { ...m, ...minutesForm } : m));
        showToast('Minutes updated successfully', 'success');
      } else {
        // Create new minutes
        const r = await postToSupabase('meeting_minutes', { 
          ...minutesForm, 
          meeting_id: selectedMeeting.id,
          association_id: selectedAssociation.id 
        });
        setMeetingMinutes(prev => [...prev, ...r]);
        showToast('Minutes saved successfully', 'success');
      }
      setShowMinutesModal(false);
      setSelectedMeeting(null);
      setMinutesForm({ attendees: '', topics_discussed: '', decisions_made: '', action_items: '', next_meeting: '' });
    } catch (err) { 
      showToast(err.message || 'Failed to save minutes', 'error'); 
    }
    finally { setSaving(false); }
  };
  
  const downloadMinutes = (meeting) => {
    const minutes = meetingMinutes.find(m => m.meeting_id === meeting.id);
    if (!minutes) {
      showToast('No minutes recorded for this meeting', 'warning');
      return;
    }
    
    const content = `MINUTES OF MEETING
    
Meeting Type: ${meeting.type}
Date & Time: ${meeting.date} at ${meeting.time}
Status: ${meeting.status}

ATTENDEES:
${minutes.attendees}

TOPICS DISCUSSED:
${minutes.topics_discussed}

DECISIONS MADE:
${minutes.decisions_made}

ACTION ITEMS:
${minutes.action_items}

NEXT MEETING:
${minutes.next_meeting || 'To be determined'}

---
Generated on: ${new Date().toLocaleString()}
`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Minutes-${meeting.type}-${meeting.date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Minutes downloaded', 'success');
  };
  
  const getMinutesStatus = (meetingId) => {
    return meetingMinutes.some(m => m.meeting_id === meetingId);
  };
  
  const meetingTypes = [
    { title: "Annual General Meeting (AGM)", type: "Mandatory", bg: "blue", icon: "🏛️", desc: "Budget approval, elections, reviews." },
    { title: "Extraordinary Meeting (EGM)", type: "Urgent", bg: "purple", icon: "⚡", desc: "Emergency decisions, special resolutions." },
    { title: "Board Meeting", type: "Routine", bg: "emerald", icon: "👥", desc: "Operational oversight, management decisions." }
  ];
  
  return (
    <div className="animate-fade-in">
      <Toast message={toast.message} show={toast.show} onClose={() => setToast({ ...toast, show: false })} type={toast.type} />
      <NewMeetingModal open={showModal} onClose={() => setShowModal(false)} onAdd={(rows) => { setMeetings(prev => [...prev, ...rows]); showToast('Meeting created successfully', 'success'); }} associationId={selectedAssociation?.id} />
      
      {/* Minutes of Meeting Modal */}
      <Modal open={showMinutesModal} onClose={() => { setShowMinutesModal(false); setSelectedMeeting(null); setEditingMinutes(null); }} title={editingMinutes ? "Edit Minutes of Meeting" : "Add Minutes of Meeting"}>
        {selectedMeeting && (
          <form onSubmit={handleSaveMinutes} className="space-y-3">
            <div className="bg-[#faf8f5] p-3 rounded-lg mb-3">
              <div className="text-sm font-semibold text-[#0f2537]">{selectedMeeting.type}</div>
              <div className="text-xs text-slate-500">{selectedMeeting.date} at {selectedMeeting.time}</div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-[#2d3748] mb-1.5">Attendees *</label>
              <textarea 
                value={minutesForm.attendees} 
                onChange={(e) => setMinutesForm({...minutesForm, attendees: e.target.value})}
                placeholder="List all attendees (e.g., Chairman, Treasurer, Secretary, Unit Owners...)"
                className="w-full text-sm border border-[#d4cfc7] rounded-lg px-3 py-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#c49b66]"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-[#2d3748] mb-1.5">Topics Discussed *</label>
              <textarea 
                value={minutesForm.topics_discussed} 
                onChange={(e) => setMinutesForm({...minutesForm, topics_discussed: e.target.value})}
                placeholder="List main topics discussed during the meeting..."
                className="w-full text-sm border border-[#d4cfc7] rounded-lg px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[#c49b66]"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-[#2d3748] mb-1.5">Decisions Made *</label>
              <textarea 
                value={minutesForm.decisions_made} 
                onChange={(e) => setMinutesForm({...minutesForm, decisions_made: e.target.value})}
                placeholder="Record all decisions, votes, and resolutions..."
                className="w-full text-sm border border-[#d4cfc7] rounded-lg px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[#c49b66]"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-[#2d3748] mb-1.5">Action Items *</label>
              <textarea 
                value={minutesForm.action_items} 
                onChange={(e) => setMinutesForm({...minutesForm, action_items: e.target.value})}
                placeholder="List action items, responsibilities, and deadlines..."
                className="w-full text-sm border border-[#d4cfc7] rounded-lg px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[#c49b66]"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-[#2d3748] mb-1.5">Next Meeting</label>
              <input 
                type="text"
                value={minutesForm.next_meeting} 
                onChange={(e) => setMinutesForm({...minutesForm, next_meeting: e.target.value})}
                placeholder="e.g., March 15, 2026 at 6:00 PM"
                className="w-full text-sm border border-[#d4cfc7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#c49b66]"
              />
            </div>
            
            <SubmitBtn loading={saving} label={editingMinutes ? "Update Minutes" : "Save Minutes"} />
          </form>
        )}
      </Modal>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        {meetingTypes.map((mt, i) => (
          <div key={i} className="bg-white rounded-xl border border-[#e2dfd9] p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-2"><span className="text-2xl">{mt.icon}</span><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${mt.bg === 'blue' ? 'bg-blue-100 text-blue-700' : mt.bg === 'purple' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>{mt.type}</span></div>
            <div className="font-semibold text-[#0f2537] text-sm">{mt.title}</div>
            <div className="text-xs text-slate-500 mt-1">{mt.desc}</div>
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-xl border border-[#e2dfd9] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#f0ede8] flex items-center justify-between">
          <h3 className="font-semibold text-[#0f2537]">All Meetings ({filteredMeetings.length})</h3>
          <div className="flex gap-2">
            <div className="relative">
              <button onClick={() => setShowFilter(!showFilter)} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors ${showFilter || filterType !== 'all' || filterStatus !== 'all' ? 'bg-[#f5ede3] text-[#b8895a]' : 'bg-[#f0ede8] text-[#4a5568] hover:bg-slate-200'}`}>
                <Filter size={13} /> Filter {(filterType !== 'all' || filterStatus !== 'all') && '(Active)'}
              </button>
              {showFilter && (
                <div className="absolute top-10 right-0 w-64 bg-white border border-[#e2dfd9] rounded-xl shadow-xl z-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#2d3748]">Filter Meetings</span>
                    <button onClick={() => setShowFilter(false)} className="text-slate-400 hover:text-[#4a5568]"><X size={14} /></button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Type</label>
                      <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full text-xs border border-[#e2dfd9] rounded-lg px-2 py-1.5 bg-white">
                        <option value="all">All Types</option>
                        <option value="AGM">AGM</option>
                        <option value="EGM">EGM</option>
                        <option value="Board Meeting">Board Meeting</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Status</label>
                      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full text-xs border border-[#e2dfd9] rounded-lg px-2 py-1.5 bg-white">
                        <option value="all">All Statuses</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="proposed">Proposed</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <button onClick={clearFilters} className="w-full text-xs bg-[#f0ede8] text-[#4a5568] py-1.5 rounded-lg hover:bg-slate-200">Clear Filters</button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-1 text-xs bg-[#c49b66] text-white px-3 py-1.5 rounded-lg hover:bg-[#b8895a] transition-colors"><Plus size={13} /> New Meeting</button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-[#faf8f5] border-b border-[#f0ede8]">
            <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
            <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Date & Time</th>
            <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
            <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Legal Review</th>
            <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Quorum</th>
            <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Notice</th>
            <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Minutes</th>
          </tr></thead>
          <tbody>{filteredMeetings.map(m => (
            <tr key={m.id} className="border-b border-slate-50 hover:bg-[#faf8f5] transition-colors">
              <td className="p-3 font-medium text-[#0f2537]">{m.type}</td>
              <td className="p-3 text-[#4a5568]">{m.date} at {m.time}</td>
              <td className="p-3"><StatusBadge status={m.status} /></td>
              <td className="p-3"><StatusBadge status={m.legal_review} /></td>
              <td className="p-3 text-xs text-slate-500">{m.quorum}</td>
              <td className="p-3 text-xs text-slate-500">{m.notice}</td>
              <td className="p-3">
                <div className="flex gap-1">
                  {getMinutesStatus(m.id) ? (
                    <>
                      <button onClick={() => openMinutesModal(m)} className="text-xs text-blue-600 font-semibold hover:underline">Edit</button>
                      <button onClick={() => downloadMinutes(m)} className="text-xs text-emerald-600 font-semibold hover:underline">Download</button>
                    </>
                  ) : (
                    <button onClick={() => openMinutesModal(m)} className="text-xs text-[#c49b66] font-semibold hover:underline">Add Minutes</button>
                  )}
                </div>
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      
      <div className="bg-white rounded-xl border border-[#e2dfd9] shadow-sm p-5 mt-6">
        <h3 className="font-semibold text-[#0f2537] mb-3">Agenda Items</h3>
        {filteredMeetings.map(m => (
          <div key={m.id} className="mb-4">
            <div className="flex items-center gap-2 mb-2"><span className="text-sm font-semibold text-[#2d3748]">{m.type}</span><StatusBadge status={m.status} /></div>
            <div className="flex flex-wrap gap-2 ml-2">{m.agenda && m.agenda.split(',').map((item, idx) => <span key={idx} className="text-xs bg-[#f0ede8] text-[#4a5568] px-2 py-1 rounded">{item.trim()}</span>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- FINANCIAL ---
const Financial = ({ delinquentUnits, setDelinquentUnits, selectedAssociation }) => {
  const [noticeUnit, setNoticeUnit] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filterDays, setFilterDays] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [unitForm, setUnitForm] = useState({ unit: '', owner: '', amount: '', days: '', status: 'current', collection: '', unprocess: '' });
  
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
    const headers = ['Unit', 'Owner', 'Amount (BD)', 'Days Overdue', 'Status', 'Collection', 'Unprocess'];
    const rows = filteredUnits.map(u => [u.unit, u.owner, u.amount, u.days, u.status, u.collection || '', u.unprocess || '']);
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
  
  const handleAddUnit = async (e) => {
    e.preventDefault();
    if (!unitForm.unit || !unitForm.owner || !unitForm.amount) return;
    setSaving(true);
    try {
      const r = await postToSupabase('delinquent_units', { ...unitForm, association_id: selectedAssociation?.id });
      setDelinquentUnits(prev => [...prev, ...r]);
      setShowAddModal(false);
      setUnitForm({ unit: '', owner: '', amount: '', days: '', status: 'current', collection: '', unprocess: '' });
      showToast('Unit added successfully', 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };
  
  const handleEditUnit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await patchToSupabase('delinquent_units', editingUnit.id, editingUnit);
      setDelinquentUnits(prev => prev.map(u => u.id === editingUnit.id ? editingUnit : u));
      setEditingUnit(null);
      showToast('Unit updated successfully', 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };
  
  const handleDeleteUnit = async (id) => {
    if (!confirm('Remove this delinquent unit?')) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/delinquent_units?id=eq.${id}`, { method: 'DELETE', headers: hdrs });
      setDelinquentUnits(prev => prev.filter(u => u.id !== id));
      showToast('Unit removed successfully', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  };
  
  return (
    <div className="animate-fade-in">
      <Toast message={toast.message} show={toast.show} onClose={() => setToast({ ...toast, show: false })} type={toast.type} />
      
      {/* Send Notice Modal */}
      <Modal open={!!noticeUnit} onClose={() => setNoticeUnit(null)} title="Send Notice">
        {noticeUnit && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4"><div className="text-sm font-semibold text-amber-800">Notice Details</div><div className="text-xs text-[#c49b66] mt-1">A formal payment notice will be sent to the owner.</div></div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Unit:</span><span className="font-semibold">{noticeUnit.unit}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Owner:</span><span className="font-semibold">{noticeUnit.owner}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Amount:</span><span className="font-semibold text-red-700">BD {Number(noticeUnit.amount).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Days Overdue:</span><span className="font-semibold">{noticeUnit.days} days</span></div>
            </div>
            <button onClick={sendNotice} disabled={saving} className="w-full bg-[#c49b66] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#b8895a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Sending...</> : 'Confirm & Send Notice'}
            </button>
          </div>
        )}
      </Modal>
      
      {/* Add Unit Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add Delinquent Unit">
        <form onSubmit={handleAddUnit} className="space-y-3">
          <TextInput label="Unit Number" value={unitForm.unit} onChange={v => setUnitForm({...unitForm, unit: v})} placeholder="e.g. 5A" />
          <TextInput label="Owner Name" value={unitForm.owner} onChange={v => setUnitForm({...unitForm, owner: v})} placeholder="e.g. Ahmed Al-Mahmood" />
          <TextInput label="Amount (BD)" value={unitForm.amount} onChange={v => setUnitForm({...unitForm, amount: v})} placeholder="e.g. 1200" type="number" />
          <TextInput label="Days Overdue" value={unitForm.days} onChange={v => setUnitForm({...unitForm, days: v})} placeholder="e.g. 45" type="number" />
          <SelectInput label="Status" value={unitForm.status} onChange={v => setUnitForm({...unitForm, status: v})} options={[{value:'current',label:'Current'},{value:'reminder_sent',label:'Reminder Sent'},{value:'notice_sent',label:'Notice Sent'},{value:'legal_notice',label:'Legal Notice'}]} />
          <TextInput label="Collection" value={unitForm.collection} onChange={v => setUnitForm({...unitForm, collection: v})} placeholder="e.g. In Progress" />
          <TextInput label="Unprocess" value={unitForm.unprocess} onChange={v => setUnitForm({...unitForm, unprocess: v})} placeholder="e.g. Pending" />
          <SubmitBtn loading={saving} label="Add Unit" />
        </form>
      </Modal>
      
      {/* Edit Unit Modal */}
      <Modal open={!!editingUnit} onClose={() => setEditingUnit(null)} title="Edit Delinquent Unit">
        {editingUnit && (
          <form onSubmit={handleEditUnit} className="space-y-3">
            <TextInput label="Unit Number" value={editingUnit.unit} onChange={v => setEditingUnit({...editingUnit, unit: v})} />
            <TextInput label="Owner Name" value={editingUnit.owner} onChange={v => setEditingUnit({...editingUnit, owner: v})} />
            <TextInput label="Amount (BD)" value={editingUnit.amount} onChange={v => setEditingUnit({...editingUnit, amount: v})} type="number" />
            <TextInput label="Days Overdue" value={editingUnit.days} onChange={v => setEditingUnit({...editingUnit, days: v})} type="number" />
            <SelectInput label="Status" value={editingUnit.status} onChange={v => setEditingUnit({...editingUnit, status: v})} options={[{value:'current',label:'Current'},{value:'reminder_sent',label:'Reminder Sent'},{value:'notice_sent',label:'Notice Sent'},{value:'legal_notice',label:'Legal Notice'}]} />
            <TextInput label="Collection" value={editingUnit.collection || ''} onChange={v => setEditingUnit({...editingUnit, collection: v})} placeholder="e.g. In Progress" />
            <TextInput label="Unprocess" value={editingUnit.unprocess || ''} onChange={v => setEditingUnit({...editingUnit, unprocess: v})} placeholder="e.g. Pending" />
            <SubmitBtn loading={saving} label="Update Unit" />
          </form>
        )}
      </Modal>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Billed" value="BD 45,600" subtext="Monthly maintenance fees" />
        <MetricCard label="Collected" value={`BD ${(45600 - delinquentUnits.reduce((s,u)=>s+Number(u.amount),0)).toLocaleString()}`} subtext="Successfully collected" trend={3} />
        <MetricCard label="Outstanding" value={`BD ${totalOwing.toLocaleString()}`} subtext={`${filteredUnits.length} units overdue`} alert />
        <MetricCard label="Collection Rate" value={`${((45600 - delinquentUnits.reduce((s,u)=>s+Number(u.amount),0)) / 45600 * 100).toFixed(1)}%`} subtext="Current period" trend={-5} />
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-[#e2dfd9] shadow-sm p-4"><div className="flex items-center gap-2 mb-3"><span className="text-lg">💳</span><span className="font-semibold text-[#2d3748] text-sm">Payment Methods</span></div><div className="space-y-2"><div className="flex justify-between text-xs"><span className="text-slate-500">Bank Transfer</span><span className="font-semibold text-[#2d3748]">BD 18,400</span></div><div className="flex justify-between text-xs"><span className="text-slate-500">Online Portal</span><span className="font-semibold text-[#2d3748]">BD 8,200</span></div><div className="flex justify-between text-xs"><span className="text-slate-500">Cash</span><span className="font-semibold text-[#2d3748]">BD 1,800</span></div></div></div>
        <div className="bg-white rounded-xl border border-[#e2dfd9] shadow-sm p-4"><div className="flex items-center gap-2 mb-3"><span className="text-lg">📊</span><span className="font-semibold text-[#2d3748] text-sm">Budget Overview</span></div><div className="space-y-2"><div className="flex justify-between text-xs"><span className="text-slate-500">Maintenance</span><span className="font-semibold text-[#2d3748]">BD 22,000</span></div><div className="flex justify-between text-xs"><span className="text-slate-500">Insurance</span><span className="font-semibold text-[#2d3748]">BD 8,500</span></div><div className="flex justify-between text-xs"><span className="text-slate-500">Legal & Admin</span><span className="font-semibold text-[#2d3748]">BD 5,200</span></div></div></div>
        <div className="bg-white rounded-xl border border-[#e2dfd9] shadow-sm p-4"><div className="flex items-center gap-2 mb-3"><span className="text-lg">📈</span><span className="font-semibold text-[#2d3748] text-sm">Reserves</span></div><div className="space-y-2"><div className="flex justify-between text-xs"><span className="text-slate-500">Emergency Fund</span><span className="font-semibold text-emerald-700">BD 45,000</span></div><div className="flex justify-between text-xs"><span className="text-slate-500">Sinking Fund</span><span className="font-semibold text-emerald-700">BD 28,000</span></div><div className="flex justify-between text-xs"><span className="text-slate-500">Status</span><span className="font-semibold text-emerald-700">Healthy</span></div></div></div>
      </div>
      
      <div className="bg-white rounded-xl border border-[#e2dfd9] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#f0ede8] flex items-center justify-between">
          <h3 className="font-semibold text-[#0f2537]">Delinquent Units ({filteredUnits.length})</h3>
          <div className="flex gap-2">
            <div className="relative">
              <button onClick={() => setShowFilter(!showFilter)} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors ${showFilter || filterDays !== 'all' || filterStatus !== 'all' ? 'bg-[#f5ede3] text-[#b8895a]' : 'bg-[#f0ede8] text-[#4a5568] hover:bg-slate-200'}`}>
                <Filter size={13} /> Filter {(filterDays !== 'all' || filterStatus !== 'all') && '(Active)'}
              </button>
              {showFilter && (
                <div className="absolute top-10 right-0 w-64 bg-white border border-[#e2dfd9] rounded-xl shadow-xl z-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#2d3748]">Filter Units</span>
                    <button onClick={() => setShowFilter(false)} className="text-slate-400 hover:text-[#4a5568]"><X size={14} /></button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Days Overdue</label>
                      <select value={filterDays} onChange={(e) => setFilterDays(e.target.value)} className="w-full text-xs border border-[#e2dfd9] rounded-lg px-2 py-1.5 bg-white">
                        <option value="all">All</option>
                        <option value="30+">30+ Days</option>
                        <option value="60+">60+ Days</option>
                        <option value="90+">90+ Days</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Status</label>
                      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full text-xs border border-[#e2dfd9] rounded-lg px-2 py-1.5 bg-white">
                        <option value="all">All Statuses</option>
                        <option value="current">Current</option>
                        <option value="reminder_sent">Reminder Sent</option>
                        <option value="notice_sent">Notice Sent</option>
                        <option value="legal_notice">Legal Notice</option>
                      </select>
                    </div>
                    <button onClick={() => { setFilterDays('all'); setFilterStatus('all'); showToast('Filters cleared', 'success'); }} className="w-full text-xs bg-[#f0ede8] text-[#4a5568] py-1.5 rounded-lg hover:bg-slate-200">Clear Filters</button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={exportCSV} className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors"><Download size={13} /> Export CSV</button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1 text-xs bg-[#c49b66] text-white px-3 py-1.5 rounded-lg hover:bg-[#b8895a]"><Plus size={13} /> Add Unit</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[#faf8f5] border-b border-[#f0ede8]">
              <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Unit</th>
              <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Owner</th>
              <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
              <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Days Overdue</th>
              <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
              <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Collection</th>
              <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Unprocess</th>
              <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
            </tr></thead>
            <tbody>{filteredUnits.map(row => (
              <tr key={row.id} className="border-b border-slate-50 hover:bg-[#faf8f5] transition-colors">
                <td className="p-3 font-medium text-[#0f2537]">{row.unit}</td>
                <td className="p-3 text-[#4a5568]">{row.owner}</td>
                <td className="p-3 font-semibold text-red-700">BD {Number(row.amount).toLocaleString()}</td>
                <td className="p-3"><span className={`text-xs font-semibold ${row.days > 60 ? 'text-red-600' : row.days > 30 ? 'text-orange-600' : 'text-[#c49b66]'}`}>{row.days} days</span></td>
                <td className="p-3"><StatusBadge status={row.status} /></td>
                <td className="p-3 text-[#4a5568] text-xs">{row.collection || '-'}</td>
                <td className="p-3 text-[#4a5568] text-xs">{row.unprocess || '-'}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button onClick={() => setNoticeUnit(row)} className="text-xs text-[#c49b66] font-semibold hover:underline">Notice</button>
                    <button onClick={() => setEditingUnit(row)} className="text-xs text-blue-600 font-semibold hover:underline">Edit</button>
                    <button onClick={() => handleDeleteUnit(row.id)} className="text-xs text-red-600 font-semibold hover:underline">Remove</button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// --- COMPLIANCE ---
const Compliance = ({ complianceItems, setComplianceItems, selectedAssociation }) => {
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
    try { const r = await postToSupabase('compliance_items', { ...form, association_id: selectedAssociation?.id }); setComplianceItems(prev => [...prev, ...r]); setShowModal(false); setForm({ item: '', status: 'pending', deadline: '', priority: 'medium' }); showToast('Compliance item added', 'success'); }
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
            <div className="bg-[#faf8f5] rounded-lg p-3"><div className="text-sm font-semibold text-[#2d3748]">{updateModal.item}</div><div className="text-xs text-slate-400">Deadline: {updateModal.deadline}</div></div>
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
      
      <div className="bg-white rounded-xl border border-[#e2dfd9] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#f0ede8] flex items-center justify-between">
          <h3 className="font-semibold text-[#0f2537]">Compliance Items ({filteredItems.length})</h3>
          <div className="flex gap-2">
            <div className="relative">
              <button onClick={() => setShowFilter(!showFilter)} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors ${showFilter || filterPriority !== 'all' || filterStatus !== 'all' ? 'bg-[#f5ede3] text-[#b8895a]' : 'bg-[#f0ede8] text-[#4a5568] hover:bg-slate-200'}`}>
                <Filter size={13} /> Filter {(filterPriority !== 'all' || filterStatus !== 'all') && '(Active)'}
              </button>
              {showFilter && (
                <div className="absolute top-10 right-0 w-64 bg-white border border-[#e2dfd9] rounded-xl shadow-xl z-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#2d3748]">Filter Items</span>
                    <button onClick={() => setShowFilter(false)} className="text-slate-400 hover:text-[#4a5568]"><X size={14} /></button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Priority</label>
                      <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="w-full text-xs border border-[#e2dfd9] rounded-lg px-2 py-1.5 bg-white">
                        <option value="all">All Priorities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Status</label>
                      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full text-xs border border-[#e2dfd9] rounded-lg px-2 py-1.5 bg-white">
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                    <button onClick={() => { setFilterPriority('all'); setFilterStatus('all'); showToast('Filters cleared', 'success'); }} className="w-full text-xs bg-[#f0ede8] text-[#4a5568] py-1.5 rounded-lg hover:bg-slate-200">Clear Filters</button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-1 text-xs bg-[#c49b66] text-white px-3 py-1.5 rounded-lg hover:bg-[#b8895a]"><Plus size={13} /> Add Item</button>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredItems.map(item => (
            <div key={item.id} className="p-4 hover:bg-[#faf8f5] transition-colors flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner shrink-0" style={{background: item.status === 'expired' ? '#fee2e2' : item.status === 'completed' ? '#dcfce7' : '#f1f5f9'}}>🏛️</div>
                <div><div className="font-medium text-[#0f2537] text-sm">{item.item}</div><div className="text-xs text-slate-500 mt-0.5">Deadline: {item.deadline}</div></div>
              </div>
              <div className="flex items-center gap-3"><StatusBadge status={item.priority} /><StatusBadge status={item.status} /><button onClick={() => setUpdateModal({...item})} className="text-xs text-[#c49b66] font-semibold hover:underline ml-2">Update</button></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- LEGAL ---
const Services = ({ legalCases, setLegalCases, selectedAssociation }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [collectionRecords, setCollectionRecords] = useState([]);
  
  useEffect(() => {
    if (selectedAssociation?.id) {
      fetchCollectionRecords();
    }
  }, [selectedAssociation]);
  
  const fetchCollectionRecords = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/collection_services?association_id=eq.${selectedAssociation.id}`, { headers: hdrs });
      if (res.ok) setCollectionRecords(await res.json());
    } catch (err) { console.error(err); }
  };
  
  const renderContent = () => {
    switch(activeTab) {
      case 'collection':
        return <CollectionService collectionRecords={collectionRecords} setCollectionRecords={setCollectionRecords} selectedAssociation={selectedAssociation} />;
      case 'legal':
        return <LegalService legalCases={legalCases} setLegalCases={setLegalCases} selectedAssociation={selectedAssociation} />;
      default:
        return <ServicesOverview legalCases={legalCases} collectionRecords={collectionRecords} activeTab={activeTab} setActiveTab={setActiveTab} />;
    }
  };
  
  return (
    <div className="animate-fade-in">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-[#e2dfd9]">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-semibold text-sm transition-colors ${activeTab === 'overview' ? 'border-b-2 border-[#c49b66] text-[#c49b66]' : 'text-[#4a5568] hover:text-[#1a3a52]'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('collection')}
          className={`px-4 py-2 font-semibold text-sm transition-colors ${activeTab === 'collection' ? 'border-b-2 border-[#c49b66] text-[#c49b66]' : 'text-[#4a5568] hover:text-[#1a3a52]'}`}
        >
          Collection Service
        </button>
        <button 
          onClick={() => setActiveTab('legal')}
          className={`px-4 py-2 font-semibold text-sm transition-colors ${activeTab === 'legal' ? 'border-b-2 border-[#c49b66] text-[#c49b66]' : 'text-[#4a5568] hover:text-[#1a3a52]'}`}
        >
          Legal Service
        </button>
      </div>
      
      {renderContent()}
    </div>
  );
};

// Services Overview Page
const ServicesOverview = ({ legalCases, collectionRecords, setActiveTab }) => {
  const totalLegalAmount = legalCases.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  const totalCollectionAmount = collectionRecords.reduce((sum, r) => sum + (Number(r.amount_received) || 0), 0);
  const totalSettlements = collectionRecords.filter(r => r.settlement).length;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <MetricCard label="Active Legal Cases" value={String(legalCases.filter(c => c.status !== 'closed').length)} subtext="Currently being handled" />
        <MetricCard label="Total Collection" value={`BD ${totalCollectionAmount.toLocaleString()}`} subtext="Amount received" />
        <MetricCard label="Settlements" value={String(totalSettlements)} subtext="Completed settlements" />
      </div>
      
      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <div 
          onClick={() => setActiveTab('collection')}
          className="bg-white rounded-xl border border-[#e2dfd9] p-6 cursor-pointer hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <h3 className="font-semibold text-[#0f2537]">Collection Service</h3>
              <p className="text-xs text-slate-500">Manage collections and settlements</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700">BD {totalCollectionAmount.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">{collectionRecords.length} records</div>
        </div>
        
        <div 
          onClick={() => setActiveTab('legal')}
          className="bg-white rounded-xl border border-[#e2dfd9] p-6 cursor-pointer hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <span className="text-2xl">⚖️</span>
            </div>
            <div>
              <h3 className="font-semibold text-[#0f2537]">Legal Service</h3>
              <p className="text-xs text-slate-500">Active legal cases and actions</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-red-700">BD {totalLegalAmount.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">{legalCases.length} active cases</div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-[#e2dfd9] shadow-sm p-5">
        <h3 className="font-semibold text-[#0f2537] mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {legalCases.slice(0, 3).map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 bg-[#faf8f5] rounded-lg">
              <div>
                <div className="font-medium text-[#0f2537] text-sm">{c.title}</div>
                <div className="text-xs text-slate-500">{c.description}</div>
              </div>
              <StatusBadge status={c.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Collection Service Component
const CollectionService = ({ collectionRecords, setCollectionRecords, selectedAssociation }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ unit: '', owner: '', amount_received: '', settlement: '', date: new Date().toISOString().split('T')[0], notes: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.unit || !form.amount_received) {
      showToast('Please fill required fields', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingRecord) {
        await patchToSupabase('collection_services', editingRecord.id, form);
        setCollectionRecords(prev => prev.map(r => r.id === editingRecord.id ? { ...r, ...form } : r));
        showToast('Record updated', 'success');
      } else {
        const r = await postToSupabase('collection_services', { ...form, association_id: selectedAssociation?.id });
        setCollectionRecords(prev => [...prev, ...r]);
        showToast('Record added', 'success');
      }
      setShowModal(false);
      setEditingRecord(null);
      setForm({ unit: '', owner: '', amount_received: '', settlement: '', date: new Date().toISOString().split('T')[0], notes: '' });
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };
  
  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/collection_services?id=eq.${id}`, { method: 'DELETE', headers: hdrs });
      setCollectionRecords(prev => prev.filter(r => r.id !== id));
      showToast('Record deleted', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  };
  
  const totalReceived = collectionRecords.reduce((sum, r) => sum + (Number(r.amount_received) || 0), 0);
  const totalSettlements = collectionRecords.reduce((sum, r) => sum + (Number(r.settlement) || 0), 0);
  
  return (
    <div className="animate-fade-in">
      <Toast message={toast.message} show={toast.show} onClose={() => setToast({ ...toast, show: false })} type={toast.type} />
      
      <Modal open={showModal || !!editingRecord} onClose={() => { setShowModal(false); setEditingRecord(null); }} title={editingRecord ? "Edit Collection Record" : "Add Collection Record"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <TextInput label="Unit Number *" value={editingRecord?.unit || form.unit} onChange={v => editingRecord ? setEditingRecord({...editingRecord, unit: v}) : setForm({...form, unit: v})} placeholder="e.g. 5A" />
          <TextInput label="Owner Name" value={editingRecord?.owner || form.owner} onChange={v => editingRecord ? setEditingRecord({...editingRecord, owner: v}) : setForm({...form, owner: v})} placeholder="e.g. Ahmed Al-Mahmood" />
          <TextInput label="Amount Received (BD) *" value={editingRecord?.amount_received || form.amount_received} onChange={v => editingRecord ? setEditingRecord({...editingRecord, amount_received: v}) : setForm({...form, amount_received: v})} placeholder="e.g. 1200" type="number" />
          <TextInput label="Settlement (BD)" value={editingRecord?.settlement || form.settlement} onChange={v => editingRecord ? setEditingRecord({...editingRecord, settlement: v}) : setForm({...form, settlement: v})} placeholder="e.g. 800" type="number" />
          <TextInput label="Date" value={editingRecord?.date || form.date} onChange={v => editingRecord ? setEditingRecord({...editingRecord, date: v}) : setForm({...form, date: v})} type="date" />
          <TextInput label="Notes" value={editingRecord?.notes || form.notes} onChange={v => editingRecord ? setEditingRecord({...editingRecord, notes: v}) : setForm({...form, notes: v})} placeholder="Additional notes..." />
          <SubmitBtn loading={saving} label={editingRecord ? "Update" : "Add Record"} />
        </form>
      </Modal>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard label="Total Received" value={`BD ${totalReceived.toLocaleString()}`} subtext="Amount collected" />
        <MetricCard label="Total Settlements" value={`BD ${totalSettlements.toLocaleString()}`} subtext="Settlement amounts" />
        <MetricCard label="Records" value={String(collectionRecords.length)} subtext="Collection entries" />
      </div>
      
      <div className="bg-white rounded-xl border border-[#e2dfd9] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#f0ede8] flex items-center justify-between">
          <h3 className="font-semibold text-[#0f2537]">Collection Records</h3>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1 text-xs bg-[#c49b66] text-white px-3 py-1.5 rounded-lg hover:bg-[#b8895a]"><Plus size={13} /> Add Record</button>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="bg-[#faf8f5] border-b border-[#f0ede8]">
            <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Unit</th>
            <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Owner</th>
            <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Amount Received</th>
            <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Settlement</th>
            <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
            <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
          </tr></thead>
          <tbody>
            {collectionRecords.map(record => (
              <tr key={record.id} className="border-b border-slate-50 hover:bg-[#faf8f5]">
                <td className="p-3 font-medium text-[#0f2537]">{record.unit}</td>
                <td className="p-3 text-[#4a5568]">{record.owner || '-'}</td>
                <td className="p-3 font-semibold text-emerald-700">BD {Number(record.amount_received).toLocaleString()}</td>
                <td className="p-3 text-[#4a5568]">{record.settlement ? `BD ${Number(record.settlement).toLocaleString()}` : '-'}</td>
                <td className="p-3 text-[#4a5568] text-xs">{record.date}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => setEditingRecord(record)} className="text-xs text-blue-600 font-semibold hover:underline">Edit</button>
                    <button onClick={() => handleDelete(record.id)} className="text-xs text-red-600 font-semibold hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Legal Service Component (original Legal component with minor updates)
const LegalService = ({ legalCases, setLegalCases, selectedAssociation }) => {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', amount: '', status: 'investigation', priority: 'medium', next_action: '', deadline: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const showToast = (message, type = 'info') => { setToast({ show: true, message, type }); setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000); };
  
  const handleSubmit = async (e) => {
    e.preventDefault(); if (!form.title) return; setSaving(true);
    try { const payload = { ...form, amount: form.amount || null }; const r = await postToSupabase('legal_cases', { ...payload, association_id: selectedAssociation?.id }); setLegalCases(prev => [...prev, ...r]); setShowModal(false); setForm({ title: '', description: '', amount: '', status: 'investigation', priority: 'medium', next_action: '', deadline: '' }); showToast('Legal case added', 'success'); }
    catch (err) { showToast(err.message, 'error'); } finally { setSaving(false); }
  };
  
  const activeCases = legalCases.filter(c => c.status !== 'closed').length;
  const totalExposure = legalCases.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  
  return (
    <div className="animate-fade-in">
      <Toast message={toast.message} show={toast.show} onClose={() => setToast({ ...toast, show: false })} type={toast.type} />
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Legal Case">
        <form onSubmit={handleSubmit} className="space-y-3">
          <TextInput label="Case Title" value={form.title} onChange={v => setForm({...form, title: v})} placeholder="e.g. Debt Collection" />
          <TextInput label="Description" value={form.description} onChange={v => setForm({...form, description: v})} placeholder="Case details..." />
          <TextInput label="Amount (BD)" value={form.amount} onChange={v => setForm({...form, amount: v})} placeholder="e.g. 3200" type="number" />
          <SelectInput label="Status" value={form.status} onChange={v => setForm({...form, status: v})} options={[{value:'investigation',label:'Investigation'},{value:'notice_sent',label:'Notice Sent'},{value:'in_court',label:'In Court'},{value:'settled',label:'Settled'},{value:'closed',label:'Closed'}]} />
          <SelectInput label="Priority" value={form.priority} onChange={v => setForm({...form, priority: v})} options={[{value:'high',label:'High'},{value:'medium',label:'Medium'},{value:'low',label:'Low'}]} />
          <TextInput label="Next Action" value={form.next_action} onChange={v => setForm({...form, next_action: v})} placeholder="e.g. File with Small Claims" />
          <TextInput label="Deadline" value={form.deadline} onChange={v => setForm({...form, deadline: v})} type="date" />
          <SubmitBtn loading={saving} label="Add Case" />
        </form>
      </Modal>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard label="Active Cases" value={String(activeCases)} subtext="Currently being handled" />
        <MetricCard label="Total Exposure" value={`BD ${totalExposure.toLocaleString()}`} subtext="Potential liability" alert />
        <MetricCard label="Resolved This Month" value="1" subtext="Successfully closed" />
      </div>
      
      <div className="bg-white rounded-xl border border-[#e2dfd9] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#f0ede8] flex items-center justify-between">
          <h3 className="font-semibold text-[#0f2537]">All Legal Cases</h3>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1 text-xs bg-[#c49b66] text-white px-3 py-1.5 rounded-lg hover:bg-[#b8895a]"><Plus size={13} /> New Case</button>
        </div>
        <div className="divide-y divide-slate-100">
          {legalCases.map(c => (
            <div key={c.id} className="p-4 hover:bg-[#faf8f5] transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1"><span className="text-lg">{c.status === 'investigation' ? '🔍' : c.status === 'notice_sent' ? '📧' : c.status === 'in_court' ? '⚖️' : '✅'}</span><h4 className="font-semibold text-[#0f2537]">{c.title}</h4><StatusBadge status={c.status.replace('_', ' ')} /></div>
                  <p className="text-sm text-[#4a5568]">{c.description}</p>
                </div>
                {c.amount && <div className="text-right"><div className="text-lg font-bold text-red-700">BD {Number(c.amount).toLocaleString()}</div></div>}
              </div>
              {c.next_action && (
                <div className="mt-2 text-sm"><span className="text-slate-500">Last Action:</span> <span className="text-[#2d3748]">{c.last_action || 'N/A'}</span></div>
              )}
              {c.next_action && (
                <div className="mt-1 flex items-center gap-2 text-sm"><span className="text-[#c49b66]">→ Next:</span><span className="font-medium text-[#2d3748]">{c.next_action}</span></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- COMPLAINTS ---
const Complaints = ({ complaints, setComplaints, selectedAssociation }) => {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ unit: '', subject: '', date: new Date().toISOString().split('T')[0], status: 'pending', priority: 'medium' });
  const [showFilter, setShowFilter] = useState(false);
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  
  // Required Documents state
  const [requiredDocs, setRequiredDocs] = useState([]);
  const [showDocModal, setShowDocModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [docForm, setDocForm] = useState({ doc_type: 'Memorandum', file_name: '', uploaded_date: new Date().toISOString().split('T')[0], status: 'pending' });
  const [selectedFile, setSelectedFile] = useState(null);
  
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };
  
  const filteredComplaints = complaints.filter(c => {
    if (filterPriority !== 'all' && c.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    return true;
  });
  
  // Fetch required documents
  useEffect(() => {
    if (selectedAssociation?.id) {
      fetchRequiredDocs();
    }
  }, [selectedAssociation]);
  
  const fetchRequiredDocs = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/required_documents?association_id=eq.${selectedAssociation.id}`, { headers: hdrs });
      if (res.ok) setRequiredDocs(await res.json());
    } catch (err) { console.error(err); }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault(); if (!form.unit || !form.subject) return; setSaving(true);
    try { const r = await postToSupabase('complaints', { ...form, association_id: selectedAssociation?.id }); setComplaints(prev => [...prev, ...r]); setShowModal(false); setForm({ unit: '', subject: '', date: new Date().toISOString().split('T')[0], status: 'pending', priority: 'medium' }); showToast('Complaint submitted', 'success'); }
    catch (err) { showToast(err.message, 'error'); } finally { setSaving(false); }
  };
  
  const handleAddDoc = async (e) => {
    e.preventDefault(); 
    
    // Check if association is selected
    if (!selectedAssociation?.id) {
      showToast('Please select an association first', 'error');
      return;
    }
    
    if (!docForm.file_name && !selectedFile) {
      showToast('Please provide a file name or select a file', 'error');
      return;
    }
    
    setSaving(true);
    try {
      let fileName = docForm.file_name;
      let fileUrl = null;
      
      // If file is selected, use its name and simulate upload
      if (selectedFile) {
        fileName = fileName || selectedFile.name;
        // Simulate file URL (in production, upload to Supabase Storage)
        fileUrl = `https://storage.example.com/docs/${selectedAssociation.id}/${selectedFile.name}`;
      }
      
      const r = await postToSupabase('required_documents', { 
        ...docForm, 
        file_name: fileName,
        file_url: fileUrl,
        file_size: selectedFile ? selectedFile.size : null,
        association_id: selectedAssociation.id 
      });
      
      // Store actual file in localStorage for download
      if (selectedFile && r.length > 0) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const storedFiles = JSON.parse(localStorage.getItem('uploaded_files') || '{}');
          storedFiles[r[0].id] = {
            data: e.target.result.split(',')[1], // base64 data
            type: selectedFile.type,
            name: selectedFile.name
          };
          localStorage.setItem('uploaded_files', JSON.stringify(storedFiles));
        };
        reader.readAsDataURL(selectedFile);
      }
      
      setRequiredDocs(prev => [...prev, ...r]);
      setShowDocModal(false);
      setDocForm({ doc_type: 'Memorandum', file_name: '', uploaded_date: new Date().toISOString().split('T')[0], status: 'pending' });
      setSelectedFile(null);
      showToast('Document uploaded successfully', 'success');
    } catch (err) { 
      console.error('Upload error:', err);
      showToast(err.message || 'Upload failed', 'error'); 
    }
    finally { setSaving(false); }
  };
  
  const handleEditDoc = async (e) => {
    e.preventDefault(); 
    
    if (!selectedAssociation?.id) {
      showToast('Please select an association first', 'error');
      return;
    }
    
    setSaving(true);
    try {
      let updates = { ...editingDoc };
      
      // If new file is selected, update file info
      if (selectedFile) {
        updates.file_name = selectedFile.name;
        updates.file_url = `https://storage.example.com/docs/${selectedAssociation.id}/${selectedFile.name}`;
        updates.file_size = selectedFile.size;
      }
      
      await patchToSupabase('required_documents', editingDoc.id, updates);
      
      // Store new file in localStorage if uploaded
      if (selectedFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const storedFiles = JSON.parse(localStorage.getItem('uploaded_files') || '{}');
          storedFiles[editingDoc.id] = {
            data: e.target.result.split(',')[1], // base64 data
            type: selectedFile.type,
            name: selectedFile.name
          };
          localStorage.setItem('uploaded_files', JSON.stringify(storedFiles));
        };
        reader.readAsDataURL(selectedFile);
      }
      
      setRequiredDocs(prev => prev.map(d => d.id === editingDoc.id ? updates : d));
      setEditingDoc(null);
      setSelectedFile(null);
      showToast('Document updated', 'success');
    } catch (err) { 
      console.error('Update error:', err);
      showToast(err.message || 'Update failed', 'error'); 
    }
    finally { setSaving(false); }
  };
  
  const handleDeleteDoc = async (id) => {
    if (!confirm('Remove this document?')) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/required_documents?id=eq.${id}`, { method: 'DELETE', headers: hdrs });
      
      // Remove file from localStorage
      const storedFiles = JSON.parse(localStorage.getItem('uploaded_files') || '{}');
      delete storedFiles[id];
      localStorage.setItem('uploaded_files', JSON.stringify(storedFiles));
      
      setRequiredDocs(prev => prev.filter(d => d.id !== id));
      showToast('Document removed', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  };
  
  const handleDocumentDownload = async (doc) => {
    try {
      // Check if we have a stored file (from selectedFile during upload)
      const storedFiles = JSON.parse(localStorage.getItem('uploaded_files') || '{}');
      const fileData = storedFiles[doc.id];
      
      if (fileData) {
        // Download the actual file from localStorage
        const byteCharacters = atob(fileData.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: fileData.type });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = doc.file_name;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Document downloaded', 'success');
      } else {
        // Fallback: File not in localStorage (older documents)
        showToast('This document was uploaded before file storage was enabled. Please re-upload to download.', 'warning');
      }
    } catch (err) {
      console.error('Download error:', err);
      showToast('Download failed', 'error');
    }
  };
  
  // Group documents by type
  const docsByType = {
    'Memorandum': requiredDocs.filter(d => d.doc_type === 'Memorandum'),
    'RERA Certificate': requiredDocs.filter(d => d.doc_type === 'RERA Certificate'),
    'Bylaw': requiredDocs.filter(d => d.doc_type === 'Bylaw'),
    'Other': requiredDocs.filter(d => !['Memorandum', 'RERA Certificate', 'Bylaw'].includes(d.doc_type))
  };
  
  return (
    <div className="animate-fade-in">
      <Toast message={toast.message} show={toast.show} onClose={() => setToast({ ...toast, show: false })} type={toast.type} />
      
      {/* Complaint Modal */}
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
      
      {/* Required Document Modal */}
      <Modal open={showDocModal || !!editingDoc} onClose={() => { setShowDocModal(false); setEditingDoc(null); setDocForm({ doc_type: 'Memorandum', file_name: '', uploaded_date: new Date().toISOString().split('T')[0], status: 'pending' }); setSelectedFile(null); }} title={editingDoc ? "Edit Document" : "Add Required Document"}>
        <form onSubmit={editingDoc ? handleEditDoc : handleAddDoc} className="space-y-3">
          <SelectInput label="Document Type" value={editingDoc?.doc_type || docForm.doc_type} onChange={v => editingDoc ? setEditingDoc({...editingDoc, doc_type: v}) : setDocForm({...docForm, doc_type: v})} options={[{value:'Memorandum',label:'Memorandum'},{value:'RERA Certificate',label:'RERA Certificate'},{value:'Bylaw',label:'Bylaw'},{value:'Other',label:'Other'}]} />
          
          {/* File Upload Section */}
          <div>
            <label className="block text-xs font-semibold text-[#2d3748] mb-1.5">Upload File (PDF, DOC, DOCX)</label>
            <div className="relative">
              <input 
                type="file" 
                accept=".pdf,.doc,.docx" 
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setSelectedFile(file);
                    if (!docForm.file_name && !editingDoc) {
                      setDocForm({...docForm, file_name: file.name});
                    }
                  }
                }}
                className="w-full text-xs border border-[#d4cfc7] rounded-lg px-3 py-2 bg-white file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-[#b8895a] hover:file:bg-[#f5ede3] cursor-pointer"
              />
            </div>
            {selectedFile && (
              <div className="mt-2 flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</span>
              </div>
            )}
            {editingDoc?.file_name && !selectedFile && (
              <div className="mt-2 text-xs text-slate-500 bg-[#faf8f5] px-3 py-2 rounded-lg">
                Current file: {editingDoc.file_name}
              </div>
            )}
          </div>
          
          <TextInput label="File Name (Optional)" value={editingDoc?.file_name || docForm.file_name} onChange={v => editingDoc ? setEditingDoc({...editingDoc, file_name: v}) : setDocForm({...docForm, file_name: v})} placeholder="e.g. Memorandum-2026.pdf" />
          <TextInput label="Upload Date" value={editingDoc?.uploaded_date || docForm.uploaded_date} onChange={v => editingDoc ? setEditingDoc({...editingDoc, uploaded_date: v}) : setDocForm({...docForm, uploaded_date: v})} type="date" />
          <SelectInput label="Status" value={editingDoc?.status || docForm.status} onChange={v => editingDoc ? setEditingDoc({...editingDoc, status: v}) : setDocForm({...docForm, status: v})} options={[{value:'pending',label:'Pending'},{value:'uploaded',label:'Uploaded'},{value:'approved',label:'Approved'},{value:'expired',label:'Expired'}]} />
          <SubmitBtn loading={saving} label={editingDoc ? "Update Document" : "Add Document"} />
        </form>
      </Modal>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Complaints" value={String(filteredComplaints.length)} subtext="All time" />
        <MetricCard label="Open" value={String(filteredComplaints.filter(c => c.status !== 'resolved').length)} subtext="Awaiting resolution" />
        <MetricCard label="Critical" value={String(filteredComplaints.filter(c => c.priority === 'critical').length)} subtext="High priority" alert />
        <MetricCard label="Resolved" value={String(filteredComplaints.filter(c => c.status === 'resolved').length)} subtext="Successfully closed" />
      </div>
      
      <div className="bg-white rounded-xl border border-[#e2dfd9] shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-[#f0ede8] flex items-center justify-between">
          <h3 className="font-semibold text-[#0f2537]">All Complaints ({filteredComplaints.length})</h3>
          <div className="flex gap-2">
            <div className="relative">
              <button onClick={() => setShowFilter(!showFilter)} className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors ${showFilter || filterPriority !== 'all' || filterStatus !== 'all' ? 'bg-[#f5ede3] text-[#b8895a]' : 'bg-[#f0ede8] text-[#4a5568] hover:bg-slate-200'}`}>
                <Filter size={13} /> Filter {(filterPriority !== 'all' || filterStatus !== 'all') && '(Active)'}
              </button>
              {showFilter && (
                <div className="absolute top-10 right-0 w-64 bg-white border border-[#e2dfd9] rounded-xl shadow-xl z-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#2d3748]">Filter Complaints</span>
                    <button onClick={() => setShowFilter(false)} className="text-slate-400 hover:text-[#4a5568]"><X size={14} /></button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Priority</label>
                      <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="w-full text-xs border border-[#e2dfd9] rounded-lg px-2 py-1.5 bg-white">
                        <option value="all">All Priorities</option>
                        <option value="critical">Critical</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Status</label>
                      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full text-xs border border-[#e2dfd9] rounded-lg px-2 py-1.5 bg-white">
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="investigating">Investigating</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                    <button onClick={() => { setFilterPriority('all'); setFilterStatus('all'); showToast('Filters cleared', 'success'); }} className="w-full text-xs bg-[#f0ede8] text-[#4a5568] py-1.5 rounded-lg hover:bg-slate-200">Clear Filters</button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-1 text-xs bg-[#c49b66] text-white px-3 py-1.5 rounded-lg hover:bg-[#b8895a]"><MessageCircle size={13} /> New Complaint</button>
          </div>
        </div>
        <div className="divide-y divide-slate-100">
          {filteredComplaints.map(c => (
            <div key={c.id} className="p-4 hover:bg-[#faf8f5] transition-colors">
              <div className="flex items-center justify-between border-b border-[#e2dfd9] pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg border ${c.priority === 'critical' ? 'bg-red-50 text-red-700 border-red-200' : c.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-[#faf8f5] text-[#4a5568] border-[#e2dfd9]'}`}>{c.unit}</span>
                  <span className="font-medium text-[#0f2537] text-sm">{c.subject}</span>
                </div>
                <div className="flex items-center gap-2"><StatusBadge status={c.priority} /><StatusBadge status={c.status} /></div>
              </div>
              <div className="text-sm text-slate-500 mt-1 font-medium">Reported: {c.date}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Required Documents Section */}
      <div className="bg-white rounded-xl border border-[#e2dfd9] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#f0ede8] flex items-center justify-between">
          <h3 className="font-semibold text-[#0f2537]">Required Documents</h3>
          <button onClick={() => setShowDocModal(true)} className="flex items-center gap-1 text-xs bg-[#c49b66] text-white px-3 py-1.5 rounded-lg hover:bg-[#b8895a]"><Plus size={13} /> Add Document</button>
        </div>
        
        {/* Document Categories */}
        <div className="divide-y divide-slate-100">
          {Object.entries(docsByType).map(([type, docs]) => (
            docs.length > 0 && (
              <div key={type} className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={18} className="text-[#c49b66]" />
                  <h4 className="font-semibold text-[#2d3748] text-sm">{type}</h4>
                  <span className="text-xs bg-[#f0ede8] text-[#4a5568] px-2 py-0.5 rounded-full">{docs.length}</span>
                </div>
                <div className="space-y-2 ml-6">
                  {docs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-[#faf8f5] rounded-lg hover:bg-[#f0ede8] transition-colors">
                      <div className="flex-1">
                        <div className="font-medium text-[#0f2537] text-sm">{doc.file_name}</div>
                        <div className="text-xs text-slate-500">Uploaded: {doc.uploaded_date}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={doc.status} />
                        <button onClick={() => handleDocumentDownload(doc)} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 flex items-center gap-1"><Download size={12} /> Download</button>
                        <button onClick={() => setEditingDoc(doc)} className="text-xs bg-[#f0ede8] text-[#4a5568] px-2 py-1 rounded hover:bg-slate-200">Edit</button>
                        <button onClick={() => handleDeleteDoc(doc.id)} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
          
          {requiredDocs.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">
              No required documents added yet. Click "Add Document" to upload.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- BOARD ---
const Board = ({ boardMembers, setBoardMembers, documents, setDocuments, selectedAssociation }) => {
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showMgrModal, setShowMgrModal] = useState(false);
  const [showLawyerModal, setShowLawyerModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [editingManager, setEditingManager] = useState(null);
  const [editingLawyer, setEditingLawyer] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);
  const [saving, setSaving] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: '', role: 'Member', status: 'pending_registration', since: new Date().toISOString().split('T')[0] });
  const [docForm, setDocForm] = useState({ name: '', date: new Date().toISOString().split('T')[0], status: 'current' });
  const [managerForm, setManagerForm] = useState({ name: '', contact: '', status: 'under_review', services: '', contract_start: '', contract_end: '' });
  const [lawyerForm, setLawyerForm] = useState({ name: '', firm: '', email: '', phone: '', specialty: '' });
  const [vendorForm, setVendorForm] = useState({ name: '', office_no: '', email: '', mobile_no: '', service_type: '' });
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [lawyers, setLawyers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [managers, setManagers] = useState([]);
  
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };
  
  // Fetch lawyers, vendors, managers on mount
  useEffect(() => {
    if (selectedAssociation?.id) {
      fetchLawyers();
      fetchVendors();
      fetchManagers();
    }
  }, [selectedAssociation]);
  
  const fetchLawyers = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/lawyers?association_id=eq.${selectedAssociation.id}`, { headers: hdrs });
      if (res.ok) setLawyers(await res.json());
    } catch (err) { console.error(err); }
  };
  
  const fetchVendors = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/vendors?association_id=eq.${selectedAssociation.id}`, { headers: hdrs });
      if (res.ok) setVendors(await res.json());
    } catch (err) { console.error(err); }
  };
  
  const fetchManagers = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/property_managers?association_id=eq.${selectedAssociation.id}`, { headers: hdrs });
      if (res.ok) setManagers(await res.json());
    } catch (err) { console.error(err); }
  };
  
  const handleAddMember = async (e) => {
    e.preventDefault(); if (!memberForm.name) return; setSaving(true);
    try { 
      const r = await postToSupabase('board_members', { ...memberForm, association_id: selectedAssociation?.id }); 
      setBoardMembers(prev => [...prev, ...r]); 
      setShowMemberModal(false); 
      setMemberForm({ name: '', role: 'Member', status: 'pending_registration', since: new Date().toISOString().split('T')[0] }); 
      showToast('Board member added successfully', 'success'); 
    } catch (err) { showToast(err.message, 'error'); } 
    finally { setSaving(false); }
  };
  
  const handleEditMember = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await patchToSupabase('board_members', editingMember.id, { name: editingMember.name, role: editingMember.role, status: editingMember.status });
      setBoardMembers(prev => prev.map(m => m.id === editingMember.id ? editingMember : m));
      setEditingMember(null);
      showToast('Member updated', 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };
  
  const handleDeleteMember = async (id) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/board_members?id=eq.${id}`, { method: 'DELETE', headers: hdrs });
      setBoardMembers(prev => prev.filter(m => m.id !== id));
      showToast('Member removed', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  };
  
  const handleAddDoc = async (e) => {
    e.preventDefault(); if (!docForm.name) return; setSaving(true);
    try { const r = await postToSupabase('documents', { ...docForm, association_id: selectedAssociation?.id }); setDocuments(prev => [...prev, ...r]); setShowDocModal(false); setDocForm({ name: '', date: new Date().toISOString().split('T')[0], status: 'current' }); showToast('Document added successfully', 'success'); }
    catch (err) { showToast(err.message, 'error'); } finally { setSaving(false); }
  };
  
  const handleAddManager = async (e) => {
    e.preventDefault(); if (!managerForm.name) return; setSaving(true);
    try {
      const r = await postToSupabase('property_managers', { ...managerForm, association_id: selectedAssociation?.id });
      setManagers(prev => [...prev, ...r]);
      setShowMgrModal(false);
      setManagerForm({ name: '', contact: '', status: 'under_review', services: '', contract_start: '', contract_end: '' });
      showToast('Manager added', 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };
  
  const handleEditManager = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await patchToSupabase('property_managers', editingManager.id, editingManager);
      setManagers(prev => prev.map(m => m.id === editingManager.id ? editingManager : m));
      setEditingManager(null);
      showToast('Manager updated', 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };
  
  const handleDeleteManager = async (id) => {
    if (!confirm('Remove this property manager?')) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/property_managers?id=eq.${id}`, { method: 'DELETE', headers: hdrs });
      setManagers(prev => prev.filter(m => m.id !== id));
      showToast('Manager removed', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  };
  
  const handleAddLawyer = async (e) => {
    e.preventDefault(); if (!lawyerForm.name) return; setSaving(true);
    try {
      const r = await postToSupabase('lawyers', { ...lawyerForm, association_id: selectedAssociation?.id });
      setLawyers(prev => [...prev, ...r]);
      setShowLawyerModal(false);
      setLawyerForm({ name: '', firm: '', email: '', phone: '', specialty: '' });
      showToast('Lawyer added', 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };
  
  const handleEditLawyer = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await patchToSupabase('lawyers', editingLawyer.id, editingLawyer);
      setLawyers(prev => prev.map(l => l.id === editingLawyer.id ? editingLawyer : l));
      setEditingLawyer(null);
      showToast('Lawyer updated', 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };
  
  const handleDeleteLawyer = async (id) => {
    if (!confirm('Remove this lawyer?')) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/lawyers?id=eq.${id}`, { method: 'DELETE', headers: hdrs });
      setLawyers(prev => prev.filter(l => l.id !== id));
      showToast('Lawyer removed', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  };
  
  const handleAddVendor = async (e) => {
    e.preventDefault(); if (!vendorForm.name) return; setSaving(true);
    try {
      const r = await postToSupabase('vendors', { ...vendorForm, association_id: selectedAssociation?.id });
      setVendors(prev => [...prev, ...r]);
      setShowVendorModal(false);
      setVendorForm({ name: '', office_no: '', email: '', mobile_no: '', service_type: '' });
      showToast('Vendor added', 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };
  
  const handleEditVendor = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await patchToSupabase('vendors', editingVendor.id, editingVendor);
      setVendors(prev => prev.map(v => v.id === editingVendor.id ? editingVendor : v));
      setEditingVendor(null);
      showToast('Vendor updated', 'success');
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  };
  
  const handleDeleteVendor = async (id) => {
    if (!confirm('Remove this vendor?')) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/vendors?id=eq.${id}`, { method: 'DELETE', headers: hdrs });
      setVendors(prev => prev.filter(v => v.id !== id));
      showToast('Vendor removed', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  };
  
  const associationData = { name: selectedAssociation?.name || "Association", units: selectedAssociation?.total_units || 0, registeredOwners: selectedAssociation?.registered_owners || 0 };

  return (
    <div className="animate-fade-in">
      <Toast message={toast.message} show={toast.show} onClose={() => setToast({ ...toast, show: false })} type={toast.type} />
      
      {/* Add/Edit Board Member Modal */}
      <Modal open={showMemberModal || !!editingMember} onClose={() => { setShowMemberModal(false); setEditingMember(null); }} title={editingMember ? "Edit Board Member" : "Add Board Member"}>
        <form onSubmit={editingMember ? handleEditMember : handleAddMember} className="space-y-3">
          <TextInput label="Full Name" value={editingMember?.name || memberForm.name} onChange={v => editingMember ? setEditingMember({...editingMember, name: v}) : setMemberForm({...memberForm, name: v})} placeholder="e.g. Ahmed Al-Mahmood" />
          <SelectInput label="Role" value={editingMember?.role || memberForm.role} onChange={v => editingMember ? setEditingMember({...editingMember, role: v}) : setMemberForm({...memberForm, role: v})} options={[{value:'Chairman',label:'Chairman'},{value:'Vice Chairman',label:'Vice Chairman'},{value:'Treasurer',label:'Treasurer'},{value:'Secretary',label:'Secretary'},{value:'Member',label:'Member'}]} />
          <SelectInput label="Status" value={editingMember?.status || memberForm.status} onChange={v => editingMember ? setEditingMember({...editingMember, status: v}) : setMemberForm({...memberForm, status: v})} options={[{value:'active',label:'Active'},{value:'pending_registration',label:'Pending Registration'},{value:'pending_fingerprint',label:'Pending Fingerprint'}]} />
          {!editingMember && <TextInput label="Member Since" value={memberForm.since} onChange={v => setMemberForm({...memberForm, since: v})} type="date" />}
          <SubmitBtn loading={saving} label={editingMember ? "Update Member" : "Add Member"} />
        </form>
      </Modal>
      
      {/* Property Manager Modal */}
      <Modal open={showMgrModal || !!editingManager} onClose={() => { setShowMgrModal(false); setEditingManager(null); setManagerForm({ name: '', contact: '', status: 'under_review', services: '', contract_start: '', contract_end: '' }); }} title={editingManager ? "Edit Property Manager" : "Add Property Manager"}>
        <form onSubmit={editingManager ? handleEditManager : handleAddManager} className="space-y-3">
          <TextInput label="Company Name" value={editingManager?.name || managerForm.name} onChange={v => editingManager ? setEditingManager({...editingManager, name: v}) : setManagerForm({...managerForm, name: v})} placeholder="e.g. Impact Property Management" />
          <TextInput label="Contact Person" value={editingManager?.contact || managerForm.contact} onChange={v => editingManager ? setEditingManager({...editingManager, contact: v}) : setManagerForm({...managerForm, contact: v})} placeholder="e.g. Imad" />
          <TextInput label="Services" value={editingManager?.services || managerForm.services} onChange={v => editingManager ? setEditingManager({...editingManager, services: v}) : setManagerForm({...managerForm, services: v})} placeholder="e.g. Maintenance, Security, Accounts" />
          <SelectInput label="Status" value={editingManager?.status || managerForm.status} onChange={v => editingManager ? setEditingManager({...editingManager, status: v}) : setManagerForm({...managerForm, status: v})} options={[{value:'active',label:'Active'},{value:'under_review',label:'Under Review'},{value:'pending',label:'Pending'}]} />
          <TextInput label="Contract Start" value={editingManager?.contract_start || managerForm.contract_start} onChange={v => editingManager ? setEditingManager({...editingManager, contract_start: v}) : setManagerForm({...managerForm, contract_start: v})} type="date" />
          <TextInput label="Contract End" value={editingManager?.contract_end || managerForm.contract_end} onChange={v => editingManager ? setEditingManager({...editingManager, contract_end: v}) : setManagerForm({...managerForm, contract_end: v})} type="date" />
          <SubmitBtn loading={saving} label={editingManager ? "Update Manager" : "Add Manager"} />
        </form>
      </Modal>
      
      {/* Lawyer Modal */}
      <Modal open={showLawyerModal || !!editingLawyer} onClose={() => { setShowLawyerModal(false); setEditingLawyer(null); setLawyerForm({ name: '', firm: '', email: '', phone: '', specialty: '' }); }} title={editingLawyer ? "Edit Lawyer" : "Add Lawyer"}>
        <form onSubmit={editingLawyer ? handleEditLawyer : handleAddLawyer} className="space-y-3">
          <TextInput label="Lawyer Name" value={editingLawyer?.name || lawyerForm.name} onChange={v => editingLawyer ? setEditingLawyer({...editingLawyer, name: v}) : setLawyerForm({...lawyerForm, name: v})} placeholder="e.g. Dr. Ahmed Al-Sahwan" />
          <TextInput label="Law Firm" value={editingLawyer?.firm || lawyerForm.firm} onChange={v => editingLawyer ? setEditingLawyer({...editingLawyer, firm: v}) : setLawyerForm({...lawyerForm, firm: v})} placeholder="e.g. Sahwan Law" />
          <TextInput label="Email" value={editingLawyer?.email || lawyerForm.email} onChange={v => editingLawyer ? setEditingLawyer({...editingLawyer, email: v}) : setLawyerForm({...lawyerForm, email: v})} placeholder="lawyer@firm.com" type="email" />
          <TextInput label="Phone" value={editingLawyer?.phone || lawyerForm.phone} onChange={v => editingLawyer ? setEditingLawyer({...editingLawyer, phone: v}) : setLawyerForm({...lawyerForm, phone: v})} placeholder="+973 XXXX XXXX" />
          <TextInput label="Specialty" value={editingLawyer?.specialty || lawyerForm.specialty} onChange={v => editingLawyer ? setEditingLawyer({...editingLawyer, specialty: v}) : setLawyerForm({...lawyerForm, specialty: v})} placeholder="e.g. Property Law, HOA Disputes" />
          <SubmitBtn loading={saving} label={editingLawyer ? "Update Lawyer" : "Add Lawyer"} />
        </form>
      </Modal>
      
      {/* Vendor Modal */}
      <Modal open={showVendorModal || !!editingVendor} onClose={() => { setShowVendorModal(false); setEditingVendor(null); setVendorForm({ name: '', office_no: '', email: '', mobile_no: '', service_type: '' }); }} title={editingVendor ? "Edit Vendor" : "Add Vendor"}>
        <form onSubmit={editingVendor ? handleEditVendor : handleAddVendor} className="space-y-3">
          <TextInput label="Vendor Name" value={editingVendor?.name || vendorForm.name} onChange={v => editingVendor ? setEditingVendor({...editingVendor, name: v}) : setVendorForm({...vendorForm, name: v})} placeholder="e.g. ABC Plumbing Services" />
          <TextInput label="Office No" value={editingVendor?.office_no || vendorForm.office_no} onChange={v => editingVendor ? setEditingVendor({...editingVendor, office_no: v}) : setVendorForm({...vendorForm, office_no: v})} placeholder="+973 XXXX XXXX" />
          <TextInput label="Email" value={editingVendor?.email || vendorForm.email} onChange={v => editingVendor ? setEditingVendor({...editingVendor, email: v}) : setVendorForm({...vendorForm, email: v})} placeholder="vendor@company.com" type="email" />
          <TextInput label="Mobile No" value={editingVendor?.mobile_no || vendorForm.mobile_no} onChange={v => editingVendor ? setEditingVendor({...editingVendor, mobile_no: v}) : setVendorForm({...vendorForm, mobile_no: v})} placeholder="+973 XXXX XXXX" />
          <TextInput label="Service Type" value={editingVendor?.service_type || vendorForm.service_type} onChange={v => editingVendor ? setEditingVendor({...editingVendor, service_type: v}) : setVendorForm({...vendorForm, service_type: v})} placeholder="e.g. Plumbing, Electrical, Cleaning" />
          <SubmitBtn loading={saving} label={editingVendor ? "Update Vendor" : "Add Vendor"} />
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
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard label="Board Members" value={String(boardMembers.length)} subtext="Active members" />
        <MetricCard label="Registered Owners" value={String(associationData.registeredOwners)} subtext={`of ${associationData.units} units`} />
        <MetricCard label="Management" value={managers.length > 0 ? "Active" : "Inactive"} subtext={managers.length > 0 ? managers[0]?.name : "No manager"} />
      </div>
      
      {/* Board Members */}
      <div className="bg-white rounded-xl border border-[#e2dfd9] shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#0f2537]">Board Members</h3>
          <button onClick={() => setShowMemberModal(true)} className="flex items-center gap-1 text-xs bg-[#c49b66] text-white px-3 py-1.5 rounded-lg hover:bg-[#b8895a]"><Plus size={13} /> Add Member</button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {boardMembers.map(member => (
            <div key={member.id} className="border border-[#e2dfd9] rounded-xl p-4 hover:shadow-md transition-all relative group">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => setEditingMember(member)} className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                <button onClick={() => handleDeleteMember(member.id)} className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </div>
              <div className="flex items-center gap-3 mb-3"><div className="w-12 h-12 rounded-xl bg-[#f0ede8] flex items-center justify-center text-xl shadow-inner">🏢</div><div><div className="font-semibold text-[#0f2537] text-sm">{member.name}</div><div className="text-xs text-slate-500">{member.role}</div></div></div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f0ede8]"><StatusBadge status={member.status} /><span className="text-xs text-slate-400">Since {member.since}</span></div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Property Management */}
      <div className="bg-white rounded-xl border border-[#e2dfd9] shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#0f2537]">Property Management</h3>
          <button onClick={() => setShowMgrModal(true)} className="flex items-center gap-1 text-xs bg-[#c49b66] text-white px-3 py-1.5 rounded-lg hover:bg-[#b8895a]"><Plus size={13} /> Add Manager</button>
        </div>
        {managers.length > 0 ? managers.map(mgr => (
          <div key={mgr.id} className="flex items-center justify-between p-4 bg-[#faf8f5] rounded-xl mb-2 relative group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center text-2xl shadow border">🏢</div>
              <div><div className="font-semibold text-[#0f2537]">{mgr.name}</div><div className="text-sm text-slate-500 font-medium">Contact: {mgr.contact}</div><div className="text-xs text-slate-400">Services: {mgr.services}</div></div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={mgr.status} />
              <button onClick={() => setEditingManager(mgr)} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200">Edit</button>
              <button onClick={() => handleDeleteManager(mgr.id)} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">Remove</button>
            </div>
          </div>
        )) : (
          <div className="text-center py-8 text-slate-400 text-sm">No property managers added yet</div>
        )}
      </div>
      
      {/* Lawyers Section */}
      <div className="bg-white rounded-xl border border-[#e2dfd9] shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#0f2537]">Lawyers</h3>
          <button onClick={() => setShowLawyerModal(true)} className="flex items-center gap-1 text-xs bg-[#c49b66] text-white px-3 py-1.5 rounded-lg hover:bg-[#b8895a]"><Plus size={13} /> Add Lawyer</button>
        </div>
        {lawyers.length > 0 ? (
          <div className="space-y-2">
            {lawyers.map(lawyer => (
              <div key={lawyer.id} className="flex items-center justify-between p-3 bg-[#faf8f5] rounded-lg hover:bg-[#f0ede8] transition-colors">
                <div className="flex-1">
                  <div className="font-semibold text-[#0f2537] text-sm">{lawyer.name}</div>
                  <div className="text-xs text-slate-500">{lawyer.firm} • {lawyer.specialty}</div>
                  <div className="text-xs text-slate-400 mt-1">{lawyer.email} • {lawyer.phone}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditingLawyer(lawyer)} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200">Edit</button>
                  <button onClick={() => handleDeleteLawyer(lawyer.id)} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">Remove</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">No lawyers added yet</div>
        )}
      </div>
      
      {/* Vendors Section */}
      <div className="bg-white rounded-xl border border-[#e2dfd9] shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#0f2537]">Vendors</h3>
          <button onClick={() => setShowVendorModal(true)} className="flex items-center gap-1 text-xs bg-[#c49b66] text-white px-3 py-1.5 rounded-lg hover:bg-[#b8895a]"><Plus size={13} /> Add Vendor</button>
        </div>
        {vendors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#faf8f5] border-b border-[#e2dfd9]">
                <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Office No</th>
                <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Mobile No</th>
                <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Service Type</th>
                <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr></thead>
              <tbody>
                {vendors.map(vendor => (
                  <tr key={vendor.id} className="border-b border-slate-50 hover:bg-[#faf8f5] transition-colors">
                    <td className="p-3 font-medium text-[#0f2537]">{vendor.name}</td>
                    <td className="p-3 text-[#4a5568]">{vendor.office_no}</td>
                    <td className="p-3 text-[#4a5568]">{vendor.email}</td>
                    <td className="p-3 text-[#4a5568]">{vendor.mobile_no}</td>
                    <td className="p-3 text-[#4a5568]">{vendor.service_type}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => setEditingVendor(vendor)} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200">Edit</button>
                        <button onClick={() => handleDeleteVendor(vendor.id)} className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200">Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm">No vendors added yet</div>
        )}
      </div>
      
      {/* Association Documents */}
      <div className="bg-white rounded-xl border border-[#e2dfd9] shadow-sm p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#0f2537]">Association Documents</h3>
          <button onClick={() => setShowDocModal(true)} className="flex items-center gap-1 text-xs bg-[#c49b66] text-white px-3 py-1.5 rounded-lg hover:bg-[#b8895a]"><Plus size={13} /> Upload</button>
        </div>
        <div className="space-y-2">
          {documents.map((doc, i) => (
            <div key={doc.id || i} className="flex items-center justify-between p-3 hover:bg-[#faf8f5] rounded-lg transition-colors">
              <div className="flex items-center gap-3"><FileText size={18} className="text-slate-400" /><div><div className="text-sm font-medium text-[#2d3748]">{doc.name}</div><div className="text-xs text-slate-400">Updated: {doc.date}</div></div></div>
              <div className="flex items-center gap-2"><StatusBadge status={doc.status} /><Download size={16} onClick={() => { const blob = new Blob([`Document: ${doc.name}\nDate: ${doc.date}\nStatus: ${doc.status}\n\nThis is a simulated document download.`], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${doc.name.replace(/\s/g, "-")}.txt`; a.click(); URL.revokeObjectURL(url); }} className="text-slate-400 cursor-pointer hover:text-[#4a5568]" /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- USER MANAGEMENT ---
const UserManagement = ({ selectedAssociation }) => {
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'Member' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [maxUsers, setMaxUsers] = useState(5);
  const [currentUsers, setCurrentUsers] = useState(0);
  
  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };
  
  useEffect(() => {
    if (selectedAssociation?.id) {
      fetchUsers();
      fetchAssociationLimits();
    }
  }, [selectedAssociation]);
  
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/user_associations?association_id=eq.${selectedAssociation.id}&select=*,app_users(*)`, { headers: hdrs });
      if (res.ok) setUsers(await res.json());
    } catch (err) { console.error(err); }
  };
  
  const fetchAssociationLimits = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/associations?id=eq.${selectedAssociation.id}`, { headers: hdrs });
      if (res.ok) {
        const assocs = await res.json();
        if (assocs.length > 0) {
          setMaxUsers(assocs[0].max_users || 5);
          setCurrentUsers(assocs[0].current_users || 0);
        }
      }
    } catch (err) { console.error(err); }
  };
  
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!userForm.name || !userForm.email || !userForm.password) {
      showToast('Please fill all fields', 'error');
      return;
    }
    
    // Check user limit
    if (currentUsers >= maxUsers) {
      showToast(`Maximum user limit reached (${maxUsers} users)`, 'error');
      return;
    }
    
    setSaving(true);
    try {
      // Create user account
      const userRes = await fetch(`${SUPABASE_URL}/rest/v1/app_users`, {
        method: 'POST',
        headers: { ...hdrs, 'Prefer': 'return=representation' },
        body: JSON.stringify({ ...userForm, role: userForm.role })
      });
      
      if (!userRes.ok) {
        const error = await userRes.json();
        throw new Error(error.message || 'Failed to create user');
      }
      
      const newUsers = await userRes.json();
      const newUser = newUsers[0];
      
      // Link user to association
      await fetch(`${SUPABASE_URL}/rest/v1/user_associations`, {
        method: 'POST',
        headers: { ...hdrs, 'Prefer': 'return=representation' },
        body: JSON.stringify({ 
          user_id: newUser.id, 
          association_id: selectedAssociation.id, 
          role: userForm.role 
        })
      });
      
      fetchUsers();
      fetchAssociationLimits();
      setShowAddModal(false);
      setUserForm({ name: '', email: '', password: '', role: 'Member' });
      showToast('User added successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to add user', 'error');
    } finally {
      setSaving(false);
    }
  };
  
  const handleRemoveUser = async (userId, userAssocId) => {
    if (!confirm('Remove this user from the association?')) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/user_associations?id=eq.${userAssocId}`, { method: 'DELETE', headers: hdrs });
      fetchUsers();
      fetchAssociationLimits();
      showToast('User removed', 'success');
    } catch (err) {
      showToast('Failed to remove user', 'error');
    }
  };
  
  const canAddMore = currentUsers < maxUsers;
  
  return (
    <div className="animate-fade-in">
      <Toast message={toast.message} show={toast.show} onClose={() => setToast({ ...toast, show: false })} type={toast.type} />
      
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)} title="Add User to Association">
        <form onSubmit={handleAddUser} className="space-y-3">
          <TextInput label="Full Name" value={userForm.name} onChange={v => setUserForm({...userForm, name: v})} placeholder="e.g. Ahmed Al-Mahmood" />
          <TextInput label="Email Address" value={userForm.email} onChange={v => setUserForm({...userForm, email: v})} placeholder="user@example.com" type="email" />
          <TextInput label="Password" value={userForm.password} onChange={v => setUserForm({...userForm, password: v})} placeholder="Minimum 6 characters" type="password" />
          <SelectInput label="Role" value={userForm.role} onChange={v => setUserForm({...userForm, role: v})} options={[{value:'Member',label:'Member'},{value:'Treasurer',label:'Treasurer'},{value:'Secretary',label:'Secretary'}]} />
          <SubmitBtn loading={saving} label="Add User" />
        </form>
      </Modal>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard label="Total Users" value={String(currentUsers)} subtext={`of ${maxUsers} maximum`} />
        <MetricCard label="Available Slots" value={String(maxUsers - currentUsers)} subtext={canAddMore ? 'Can add more' : 'Limit reached'} alert={!canAddMore} />
        <MetricCard label="Association" value={selectedAssociation?.name || 'N/A'} subtext="Current association" />
      </div>
      
      <div className="bg-white rounded-xl border border-[#e2dfd9] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#f0ede8] flex items-center justify-between">
          <h3 className="font-semibold text-[#0f2537]">Association Users ({currentUsers}/{maxUsers})</h3>
          <button 
            onClick={() => setShowAddModal(true)} 
            disabled={!canAddMore}
            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors ${canAddMore ? 'bg-[#c49b66] text-white hover:bg-[#b8895a]' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
          >
            <Plus size={13} /> Add User {!canAddMore && '(Limit Reached)'}
          </button>
        </div>
        
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#faf8f5] border-b border-[#f0ede8]">
              <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
              <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
              <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
              <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(ua => (
              <tr key={ua.id} className="border-b border-slate-50 hover:bg-[#faf8f5]">
                <td className="p-3 font-medium text-[#0f2537]">{ua.app_users?.name}</td>
                <td className="p-3 text-[#4a5568]">{ua.app_users?.email}</td>
                <td className="p-3"><StatusBadge status={ua.role.toLowerCase()} /></td>
                <td className="p-3">
                  {ua.app_users?.email !== 'admin@sahwanlaw.com' && (
                    <button onClick={() => handleRemoveUser(ua.app_users.id, ua.id)} className="text-xs text-red-600 font-semibold hover:underline">Remove</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- MAIN APP ---

// --- LOGIN / SIGNUP PAGES ---
const AuthPage = ({ onLogin }) => {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
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
    setTimeout(async () => {
      const success = await onLogin(loginForm.email, loginForm.password);
      if (!success) {
        setError('Invalid credentials or no access to any association');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f2537] via-[#1a3a52] to-[#2d4a62] p-4">
      <div className="w-full max-w-md">
        {/* Logo and Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#c49b66] text-white shadow-2xl mb-4">
            <span className="text-4xl">🏛️</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Al-Malak</h1>
          <p className="text-[#d4af7a] text-sm font-medium tracking-wide">BY SAHWAN LAW FIRM</p>
          <p className="text-[#a8b5c4] text-sm mt-2">Owners Association Management Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-[#1a3a52] mb-2 text-center">Welcome Back</h2>
          <p className="text-[#4a5568] text-sm text-center mb-6">Sign in to access your dashboard</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#2d3748] mb-2">Email Address</label>
              <input 
                type="email" 
                value={loginForm.email} 
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})} 
                className="w-full px-4 py-3 border-2 border-[#e2dfd9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c49b66] focus:border-transparent transition-all text-[#2d3748] placeholder-[#a0aec0]" 
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#2d3748] mb-2">Password</label>
              <input 
                type="password" 
                value={loginForm.password} 
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})} 
                className="w-full px-4 py-3 border-2 border-[#e2dfd9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c49b66] focus:border-transparent transition-all text-[#2d3748]" 
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#c49b66] text-white py-3.5 rounded-xl font-semibold hover:bg-[#b8895a] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-[#718096]">
              Need access? Contact your association administrator
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-[#a8b5c4]">
            © 2026 Al-Malak Platform • Powered by Sahwan Law Firm
          </p>
        </div>
      </div>
    </div>
  );
};

// --- SIDEBAR ---

export default function App() {
  
  // Helper to get current association ID
  const getCurrentAssociationId = () => selectedAssociation?.id;
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [userAssociations, setUserAssociations] = useState([]);
  const [selectedAssociation, setSelectedAssociation] = useState(null);
  const [allAssociations, setAllAssociations] = useState([]);

  const [boardMembers, setBoardMembers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [complianceItems, setComplianceItems] = useState([]);
  const [legalCases, setLegalCases] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [delinquentUnits, setDelinquentUnits] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  

  
}