'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const TEMPLE_NAME = 'श्री संसारी माई मन्दिर व्यवस्थापन समिति';
const text = {
  en: {
    users: 'Users', userManagement: 'User management', userSub: 'Create accounts for counter operators.', displayName: 'Display name', createUser: 'Create user', userList: 'Operator accounts', noUsers: 'No users created yet.',
    admin: 'ADMIN CONSOLE', loginSub: 'Manage counters, services, and collections', username: 'Username', password: 'Password', login: 'Sign in', signingIn: 'Signing in...', dashboard: 'Dashboard', counters: 'Counters', transactions: 'Transactions', security: 'Security', logout: 'Sign out', overview: 'Overview', overviewSub: 'A clear view of your collection operation.', activeCounters: 'Active counters', counterManagement: 'Counter management', counterSub: 'Add the counters that POS devices can select during first-time setup.', addCounter: 'Add counter', deviceId: 'Device ID', counterName: 'Counter name', saveCounter: 'Save counter', activeCounterList: 'Active counter list', refresh: 'Refresh', noCounters: 'No counters have been added yet.', active: 'Active', passwordChange: 'Change password', passwordSub: 'Keep your administrator account protected.', currentPassword: 'Current password', newPassword: 'New password', confirmPassword: 'Confirm new password', savePassword: 'Update password', language: 'Language', nepali: 'नेपाली', english: 'English', added: 'Counter added successfully.', changed: 'Password changed successfully.', mismatch: 'New passwords do not match.', loginFailed: 'Login failed.', error: 'Something went wrong.', filterDate: 'Filter date', clear: 'Clear', token: 'Receipt', date: 'Nepali date', time: 'Time', service: 'Service', amount: 'Amount', noTransactions: 'No transactions found.'
  },
  ne: {
    users: 'प्रयोगकर्ता', userManagement: 'प्रयोगकर्ता व्यवस्थापन', userSub: 'काउन्टर सञ्चालकका लागि खाता बनाउनुहोस्।', displayName: 'देखिने नाम', createUser: 'प्रयोगकर्ता बनाउनुहोस्', userList: 'सञ्चालक खाताहरू', noUsers: 'अहिलेसम्म प्रयोगकर्ता बनेका छैनन्।',
    admin: 'प्रशासन कक्ष', loginSub: 'काउन्टर, सेवा र संकलन व्यवस्थापन', username: 'प्रयोगकर्ता नाम', password: 'पासवर्ड', login: 'प्रवेश गर्नुहोस्', signingIn: 'प्रवेश हुँदैछ...', dashboard: 'ड्यासबोर्ड', counters: 'काउन्टर', transactions: 'लेनदेन', security: 'सुरक्षा', logout: 'बाहिर निस्कनुहोस्', overview: 'अवलोकन', overviewSub: 'तपाईंको संकलन सञ्चालनको स्पष्ट विवरण।', activeCounters: 'सक्रिय काउन्टर', counterManagement: 'काउन्टर व्यवस्थापन', counterSub: 'POS उपकरणले पहिलो सेटअपमा चयन गर्ने काउन्टर थप्नुहोस्।', addCounter: 'काउन्टर थप्नुहोस्', deviceId: 'उपकरण ID', counterName: 'काउन्टरको नाम', saveCounter: 'काउन्टर सुरक्षित गर्नुहोस्', activeCounterList: 'सक्रिय काउन्टर सूची', refresh: 'रिफ्रेस', noCounters: 'अहिलेसम्म कुनै काउन्टर थपिएको छैन।', active: 'सक्रिय', passwordChange: 'पासवर्ड परिवर्तन', passwordSub: 'तपाईंको प्रशासनिक खाता सुरक्षित राख्नुहोस्।', currentPassword: 'हालको पासवर्ड', newPassword: 'नयाँ पासवर्ड', confirmPassword: 'नयाँ पासवर्ड फेरि', savePassword: 'पासवर्ड सुरक्षित गर्नुहोस्', language: 'भाषा', nepali: 'नेपाली', english: 'English', added: 'काउन्टर सफलतापूर्वक थपियो।', changed: 'पासवर्ड परिवर्तन भयो।', mismatch: 'नयाँ पासवर्ड मिलेन।', loginFailed: 'प्रवेश असफल भयो।', error: 'केही समस्या भयो।', filterDate: 'मिति छान्नुहोस्', clear: 'हटाउनुहोस्', token: 'रसिद', date: 'नेपाली मिति', time: 'समय', service: 'सेवा', amount: 'रकम', noTransactions: 'कुनै लेनदेन भेटिएन।'
  }
};

export default function Home() {
  const [language, setLanguage] = useState('ne');
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [section, setSection] = useState('dashboard');
  const [devices, setDevices] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const t = text[language];

  useEffect(() => { setToken(window.localStorage.getItem('admin_token')); setLanguage(window.localStorage.getItem('admin_language') || 'ne'); }, []);
  useEffect(() => { if (token) { loadDevices(); loadTransactions(); loadUsers(); } }, [token]);

  function switchLanguage(next) { setLanguage(next); window.localStorage.setItem('admin_language', next); }
  async function login(event) {
    event.preventDefault(); setLoading(true); setMessage('');
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.message || t.loginFailed);
      window.localStorage.setItem('admin_token', body.token); setToken(body.token);
    } catch (error) { setMessage(error.message || t.loginFailed); } finally { setLoading(false); }
  }
  async function loadDevices() {
    const response = await fetch(`${API_URL}/api/devices`, { headers: { Authorization: `Bearer ${token}` } });
    const body = await response.json(); if (response.ok) setDevices(body.devices || []); else setMessage(body.message || t.error);
  }
  async function loadTransactions(date = transactionDate) {
    const query = date ? `?date=${encodeURIComponent(date)}&limit=100` : '?limit=100';
    const response = await fetch(`${API_URL}/api/reports/transactions${query}`, { headers: { Authorization: `Bearer ${token}` } });
    const body = await response.json(); if (response.ok) setTransactions(body.transactions || []); else setMessage(body.message || t.error);
  }
  async function loadUsers() {
    const response = await fetch(`${API_URL}/api/auth/users`, { headers: { Authorization: `Bearer ${token}` } });
    const body = await response.json(); if (response.ok) setUsers(body.users || []);
  }

  async function createUser(event) {
    event.preventDefault(); setLoading(true); setMessage('');
    try {
      const response = await fetch(`${API_URL}/api/auth/users`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ username: newUsername, displayName: newDisplayName, password: newUserPassword }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.message || t.error);
      setNewUsername(''); setNewDisplayName(''); setNewUserPassword(''); setMessage(t.added); await loadUsers();
    } catch (error) { setMessage(error.message || t.error); } finally { setLoading(false); }
  }
  async function addDevice(event) {
    event.preventDefault(); setLoading(true); setMessage('');
    try {
      const response = await fetch(`${API_URL}/api/devices`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ deviceId, deviceName }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.message || t.error);
      setDeviceId(''); setDeviceName(''); setMessage(t.added); await loadDevices();
    } catch (error) { setMessage(error.message || t.error); } finally { setLoading(false); }
  }
  async function changePassword(event) {
    event.preventDefault(); if (newPassword !== confirmPassword) return setMessage(t.mismatch);
    setLoading(true); setMessage('');
    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ currentPassword, newPassword }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.message || t.error);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setMessage(t.changed);
    } catch (error) { setMessage(error.message || t.error); } finally { setLoading(false); }
  }
  function logout() { window.localStorage.removeItem('admin_token'); setToken(null); }

  if (!token) return <main className="loginShell"><section className="loginCard"><div className="mark">श्री</div><p className="kicker">{t.admin}</p><h1>{TEMPLE_NAME}</h1><p className="subtle">{t.loginSub}</p><LanguageToggle language={language} onChange={switchLanguage} label={t.language} /><form onSubmit={login} className="form"><label>{t.username}<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" /></label><label>{t.password}<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>{message && <p className="error">{message}</p>}<button disabled={loading}>{loading ? t.signingIn : t.login}</button></form></section></main>;

  return <main className="adminShell"><aside className="sidebar"><div className="sideBrand"><div className="mark small">श्री</div><div><strong>Token Admin</strong><span>{language === 'ne' ? 'मन्दिर व्यवस्थापन' : 'Temple management'}</span></div></div><nav><NavItem active={section === 'dashboard'} onClick={() => setSection('dashboard')} label={t.dashboard} icon="◈" /><NavItem active={section === 'counters'} onClick={() => setSection('counters')} label={t.counters} icon="▦" /><NavItem active={section === 'users'} onClick={() => setSection('users')} label={t.users} icon="♙" /><NavItem active={section === 'transactions'} onClick={() => setSection('transactions')} label={t.transactions} icon="≡" /><NavItem active={section === 'security'} onClick={() => setSection('security')} label={t.security} icon="⌁" /></nav><div className="sideBottom"><LanguageToggle language={language} onChange={switchLanguage} label={t.language} /><button className="sidebarLogout" onClick={logout}>{t.logout}</button></div></aside><section className="mainArea"><header className="mainHeader"><div><p className="kicker">{t.admin}</p><h1>{TEMPLE_NAME}</h1></div><div className="headerCount"><strong>{devices.length}</strong><span>{t.activeCounters}</span></div></header>{section === 'dashboard' && <Dashboard devices={devices} t={t} onCounters={() => setSection('counters')} />}{section === 'counters' && <Counters devices={devices} t={t} deviceId={deviceId} setDeviceId={setDeviceId} deviceName={deviceName} setDeviceName={setDeviceName} addDevice={addDevice} loadDevices={loadDevices} loading={loading} />}{section === 'users' && <Users users={users} t={t} username={newUsername} setUsername={setNewUsername} displayName={newDisplayName} setDisplayName={setNewDisplayName} password={newUserPassword} setPassword={setNewUserPassword} createUser={createUser} loading={loading} />}{section === 'transactions' && <Transactions rows={transactions} date={transactionDate} setDate={setTransactionDate} load={loadTransactions} t={t} />}{section === 'security' && <Security t={t} currentPassword={currentPassword} setCurrentPassword={setCurrentPassword} newPassword={newPassword} setNewPassword={setNewPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} changePassword={changePassword} loading={loading} message={message} />}</section></main>;
}

function LanguageToggle({ language, onChange, label }) { return <div className="language"><span>{label}</span><button className={language === 'ne' ? 'selected' : ''} onClick={() => onChange('ne')}>नेपाली</button><button className={language === 'en' ? 'selected' : ''} onClick={() => onChange('en')}>English</button></div>; }
function NavItem({ active, onClick, label, icon }) { return <button className={`navItem ${active ? 'active' : ''}`} onClick={onClick}><span>{icon}</span>{label}</button>; }
function Dashboard({ devices, t, onCounters }) { return <div className="pageContent"><div className="pageIntro"><p className="kicker">{t.overview}</p><h2>{t.counterManagement}</h2><p className="subtle">{t.overviewSub}</p></div><div className="metricGrid"><div className="metricCard accent"><span>{t.activeCounters}</span><strong>{devices.length}</strong><button onClick={onCounters}>{t.addCounter} →</button></div><div className="metricCard"><span>{t.activeCounterList}</span><strong>{devices.filter((device) => device.active).length}</strong><small>{t.active}</small></div></div><section className="panel"><div className="panelHead"><div><p className="kicker">{t.counters}</p><h3>{t.activeCounterList}</h3></div><button className="quiet" onClick={onCounters}>{t.counters} →</button></div><DeviceRows devices={devices} t={t} /></section></div>; }
function Counters({ devices, t, deviceId, setDeviceId, deviceName, setDeviceName, addDevice, loadDevices, loading }) { return <div className="pageContent"><div className="pageIntro"><p className="kicker">{t.counters}</p><h2>{t.counterManagement}</h2><p className="subtle">{t.counterSub}</p></div><div className="contentGrid"><section className="panel"><p className="kicker">{t.addCounter}</p><h3>{t.counterManagement}</h3><form onSubmit={addDevice} className="form"><label>{t.deviceId}<input value={deviceId} onChange={(event) => setDeviceId(event.target.value.toUpperCase())} placeholder="DEV001" required /></label><label>{t.counterName}<input value={deviceName} onChange={(event) => setDeviceName(event.target.value)} placeholder="Counter 1" required /></label><button disabled={loading}>{t.saveCounter}</button></form></section><section className="panel"><div className="panelHead"><div><p className="kicker">{t.activeCounterList}</p><h3>{t.counters}</h3></div><button className="quiet" onClick={loadDevices}>{t.refresh}</button></div><DeviceRows devices={devices} t={t} /></section></div></div>; }
function Users({ users, t, username, setUsername, displayName, setDisplayName, password, setPassword, createUser, loading }) { return <div className="pageContent"><div className="pageIntro"><p className="kicker">{t.users}</p><h2>{t.userManagement}</h2><p className="subtle">{t.userSub}</p></div><div className="contentGrid"><section className="panel"><p className="kicker">{t.createUser}</p><form onSubmit={createUser} className="form"><label>{t.username}<input value={username} onChange={(event) => setUsername(event.target.value)} required /></label><label>{t.displayName}<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required /></label><label>{t.password}<input type="password" minLength="8" value={password} onChange={(event) => setPassword(event.target.value)} required /></label><button disabled={loading}>{t.createUser}</button></form></section><section className="panel"><p className="kicker">{t.userList}</p><h3>{t.users}</h3>{users.length ? users.map((user) => <div className="deviceRow" key={user.id || user._id}><div><strong>{user.displayName}</strong><span>{user.username}</span></div><span className="badge">{t.active}</span></div>) : <p className="subtle">{t.noUsers}</p>}</section></div></div>; }
function Security({ t, currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, changePassword, loading, message }) { return <div className="pageContent"><div className="pageIntro"><p className="kicker">{t.security}</p><h2>{t.passwordChange}</h2><p className="subtle">{t.passwordSub}</p></div><section className="panel narrow"><form onSubmit={changePassword} className="form"><label>{t.currentPassword}<input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label><label>{t.newPassword}<input type="password" minLength="8" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label><label>{t.confirmPassword}<input type="password" minLength="8" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label><button disabled={loading}>{t.savePassword}</button></form>{message && <p className="success">{message}</p>}</section></div>; }
function DeviceRows({ devices, t }) { return devices.length ? devices.map((device) => <div className="deviceRow" key={device.deviceId}><div><strong>{device.deviceName}</strong><span>{device.deviceId}</span></div><span className="badge">{t.active}</span></div>) : <p className="subtle">{t.noCounters}</p>; }
function Transactions({ rows, date, setDate, load, t }) { return <div className="pageContent"><div className="pageIntro"><p className="kicker">{t.transactions}</p><h2>{t.transactions}</h2><p className="subtle">{t.overviewSub}</p></div><section className="panel"><div className="filterBar"><label>{t.filterDate}<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><button onClick={() => load()}>{t.refresh}</button><button className="quiet" onClick={() => { setDate(''); load(''); }}>{t.clear}</button></div><div className="tableWrap"><table><thead><tr><th>{t.token}</th><th>{t.date}</th><th>{t.time}</th><th>{t.deviceId}</th><th>User</th><th>{t.service}</th><th>{t.amount}</th></tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={row.localId || row._id}><td>{row.receiptNumber || row.tokenNumber}</td><td>{row.nepaliDate}</td><td>{row.tokenTime}</td><td>{row.deviceId}</td><td>{row.userName || '-'}</td><td>{row.serviceName}{row.itemName ? ` · ${row.itemName}` : ''}</td><td>रु {row.amount}</td></tr>) : <tr><td colSpan="7" className="empty">{t.noTransactions}</td></tr>}</tbody></table></div></section></div>; }
