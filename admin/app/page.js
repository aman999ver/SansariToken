'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const TEMPLE_NAME = 'श्री संसारी माई मन्दिर व्यवस्थापन समिति';

const text = {
  en: {
    users: 'Users', userManagement: 'User management', userSub: 'Create and manage accounts for counter operators.', displayName: 'Display name', createUser: 'Create user', editUser: 'Edit user', updateUser: 'Update user', cancel: 'Cancel', status: 'Status', userList: 'Operator accounts', noUsers: 'No users created yet.', userUpdated: 'User updated successfully.', userDeleted: 'User deleted.', edit: 'Edit', delete: 'Delete', active: 'Active', inactive: 'Inactive', confirmDeleteUser: 'Are you sure you want to delete this user?', confirmDeleteCounter: 'Are you sure you want to delete this counter?',
    admin: 'ADMIN CONSOLE', loginSub: 'Manage counters, services, and collections', username: 'Username', password: 'Password', optionalPassword: 'New password (leave blank to keep current)', login: 'Sign in', signingIn: 'Signing in...', dashboard: 'Dashboard', counters: 'Counters', transactions: 'Transactions', security: 'Security', logout: 'Sign out', overview: 'Overview', overviewSub: 'A clear view of your collection operation.', activeCounters: 'Active counters', counterManagement: 'Counter management', counterSub: 'Add the counters that POS devices can select during first-time setup.', addCounter: 'Add counter', editCounter: 'Edit counter', deviceId: 'Device ID', counterName: 'Counter name', saveCounter: 'Save counter', updateCounter: 'Update counter', activeCounterList: 'Active counter list', refresh: 'Refresh', noCounters: 'No counters have been added yet.', counterDeleted: 'Counter deleted.', counterUpdated: 'Counter updated.', passwordChange: 'Change password', passwordSub: 'Keep your administrator account protected.', currentPassword: 'Current password', newPassword: 'New password', confirmPassword: 'Confirm new password', savePassword: 'Update password', language: 'Language', nepali: 'नेपाली', english: 'English', added: 'Saved successfully.', changed: 'Password changed successfully.', mismatch: 'New passwords do not match.', loginFailed: 'Login failed.', error: 'Something went wrong.', filterDate: 'Filter date (Nepali / ISO)', clear: 'Clear', token: 'Receipt #', date: 'Nepali date', time: 'Time', service: 'Service', amount: 'Amount', noTransactions: 'No transactions found.',
    allCounters: 'All counters', allUsers: 'All operators', allServices: 'All services', filterCounter: 'Counter', filterUser: 'Operator', filterService: 'Service', applyFilter: 'Filter', pagination: 'Pagination', page: 'Page', of: 'of', prev: 'Previous', next: 'Next', perPage: 'Per page', totalReceipts: 'Total receipts', totalCollection: 'Total collection', serviceBreakdown: 'Service-wise collection breakdown', receiptsGenerated: 'Receipts count', collectionAmount: 'Total amount', operator: 'Operator', paymentMethod: 'Payment', share: 'Share'
  },
  ne: {
    users: 'प्रयोगकर्ता', userManagement: 'प्रयोगकर्ता व्यवस्थापन', userSub: 'काउन्टर सञ्चालकका खाताहरू सिर्जना र व्यवस्थापन गर्नुहोस्।', displayName: 'देखिने नाम', createUser: 'प्रयोगकर्ता बनाउनुहोस्', editUser: 'प्रयोगकर्ता सम्पादन', updateUser: 'विवरण अद्यावधिक गर्नुहोस्', cancel: 'रद्द गर्नुहोस्', status: 'स्थिति', userList: 'सञ्चालक खाताहरू', noUsers: 'अहिलेसम्म प्रयोगकर्ता बनेका छैनन्।', userUpdated: 'प्रयोगकर्ता विवरण अद्यावधिक भयो।', userDeleted: 'प्रयोगकर्ता हटाइयो।', edit: 'सम्पादन', delete: 'हटाउनुहोस्', active: 'सक्रिय', inactive: 'निष्क्रिय', confirmDeleteUser: 'यो प्रयोगकर्ता हटाउने हो?', confirmDeleteCounter: 'यो काउन्टर हटाउने हो?',
    admin: 'प्रशासन कक्ष', loginSub: 'काउन्टर, सेवा र संकलन व्यवस्थापन', username: 'प्रयोगकर्ता नाम', password: 'पासवर्ड', optionalPassword: 'नयाँ पासवर्ड (परिवर्तन नगर्ने भए खाली छोड्नुहोस्)', login: 'प्रवेश गर्नुहोस्', signingIn: 'प्रवेश हुँदैछ...', dashboard: 'ड्यासबोर्ड', counters: 'काउन्टर', transactions: 'लेनदेन', security: 'सुरक्षा', logout: 'बाहिर निस्कनुहोस्', overview: 'अवलोकन', overviewSub: 'तपाईंको संकलन सञ्चालनको स्पष्ट विवरण।', activeCounters: 'सक्रिय काउन्टर', counterManagement: 'काउन्टर व्यवस्थापन', counterSub: 'POS उपकरणले पहिलो सेटअपमा चयन गर्ने काउन्टर थप्नुहोस्।', addCounter: 'काउन्टर थप्नुहोस्', editCounter: 'काउन्टर सम्पादन', deviceId: 'उपकरण ID', counterName: 'काउन्टरको नाम', saveCounter: 'काउन्टर सुरक्षित गर्नुहोस्', updateCounter: 'काउन्टर अद्यावधिक गर्नुहोस्', activeCounterList: 'सक्रिय काउन्टर सूची', refresh: 'रिफ्रेस', noCounters: 'अहिलेसम्म कुनै काउन्टर थपिएको छैन।', counterDeleted: 'काउन्टर हटाइयो।', counterUpdated: 'काउन्टर अद्यावधिक भयो।', passwordChange: 'पासवर्ड परिवर्तन', passwordSub: 'तपाईंको प्रशासनिक खाता सुरक्षित राख्नुहोस्।', currentPassword: 'हालको पासवर्ड', newPassword: 'नयाँ पासवर्ड', confirmPassword: 'नयाँ पासवर्ड फेरि', savePassword: 'पासवर्ड सुरक्षित गर्नुहोस्', language: 'भाषा', nepali: 'नेपाली', english: 'English', added: 'सफलतापूर्वक सुरक्षित भयो।', changed: 'पासवर्ड परिवर्तन भयो।', mismatch: 'नयाँ पासवर्ड मिलेन।', loginFailed: 'प्रवेश असफल भयो।', error: 'केही समस्या भयो।', filterDate: 'मिति छान्नुहोस् (नेपाली / अंग्रेजी)', clear: 'हटाउनुहोस्', token: 'रसिद नं.', date: 'नेपाली मिति', time: 'समय', service: 'सेवा', amount: 'रकम', noTransactions: 'कुनै लेनदेन भेटिएन।',
    allCounters: 'सबै काउन्टर', allUsers: 'सबै सञ्चालक', allServices: 'सबै सेवाहरू', filterCounter: 'काउन्टर', filterUser: 'सञ्चालक', filterService: 'सेवा', applyFilter: 'खोज्नुहोस्', pagination: 'पृष्ठ चयन', page: 'पृष्ठ', of: '/', prev: 'अघिल्लो', next: 'पछिल्लो', perPage: 'प्रति पृष्ठ', totalReceipts: 'कुल जारी रसिद', totalCollection: 'कुल संकलित रकम', serviceBreakdown: 'सेवा अनुसार संकलन विवरण', receiptsGenerated: 'रसिद सङ्ख्या', collectionAmount: 'संकलित रकम', operator: 'सञ्चालक', paymentMethod: 'भुक्तानी विधि', share: 'प्रतिशत'
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
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editingDevice, setEditingDevice] = useState(null);

  // Filter and pagination states for transactions
  const [filterDate, setFilterDate] = useState('');
  const [filterDeviceId, setFilterDeviceId] = useState('ALL');
  const [filterUserName, setFilterUserName] = useState('ALL');
  const [filterServiceName, setFilterServiceName] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, pages: 1 });
  const [summaryData, setSummaryData] = useState({ totals: { tokens: 0, collection: 0 }, services: [] });

  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const t = text[language];

  useEffect(() => {
    setToken(window.localStorage.getItem('admin_token'));
    setLanguage(window.localStorage.getItem('admin_language') || 'ne');
  }, []);

  useEffect(() => {
    if (token) {
      loadDevices();
      loadUsers();
      loadServices();
      loadTransactions({ page: 1 });
    }
  }, [token]);

  function switchLanguage(next) {
    setLanguage(next);
    window.localStorage.setItem('admin_language', next);
  }

  async function login(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || t.loginFailed);
      window.localStorage.setItem('admin_token', body.token);
      setToken(body.token);
    } catch (error) {
      setMessage(error.message || t.loginFailed);
    } finally {
      setLoading(false);
    }
  }

  async function loadDevices() {
    try {
      const response = await fetch(`${API_URL}/api/devices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const body = await response.json();
      if (response.ok) setDevices(body.devices || []);
    } catch {}
  }

  async function loadServices() {
    try {
      const response = await fetch(`${API_URL}/api/services`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const body = await response.json();
      if (response.ok && body.services) setServices(body.services);
    } catch {}
  }

  async function loadUsers() {
    try {
      const response = await fetch(`${API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const body = await response.json();
      if (response.ok) setUsers(body.users || []);
    } catch {}
  }

  async function loadTransactions(override = {}) {
    const activeDate = override.date !== undefined ? override.date : filterDate;
    const activeDevice = override.deviceId !== undefined ? override.deviceId : filterDeviceId;
    const activeUser = override.userName !== undefined ? override.userName : filterUserName;
    const activeService = override.serviceName !== undefined ? override.serviceName : filterServiceName;
    const activePage = override.page !== undefined ? override.page : page;
    const activeLimit = override.limit !== undefined ? override.limit : limit;

    const params = new URLSearchParams();
    if (activeDate) params.set('date', activeDate);
    if (activeDevice && activeDevice !== 'ALL') params.set('deviceId', activeDevice);
    if (activeUser && activeUser !== 'ALL') params.set('userName', activeUser);
    if (activeService && activeService !== 'ALL') params.set('serviceName', activeService);
    params.set('page', String(activePage));
    params.set('limit', String(activeLimit));

    try {
      const response = await fetch(`${API_URL}/api/reports/transactions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const body = await response.json();
      if (response.ok) {
        setTransactions(body.transactions || []);
        if (body.pagination) setPagination(body.pagination);
        if (body.summary) setSummaryData(body.summary);
      } else {
        setMessage(body.message || t.error);
      }
    } catch (error) {
      setMessage(error.message || t.error);
    }
  }

  async function createUser(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/api/auth/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: newUsername, displayName: newDisplayName, password: newUserPassword })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || t.error);
      setNewUsername('');
      setNewDisplayName('');
      setNewUserPassword('');
      setMessage(t.added);
      await loadUsers();
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  async function updateUser(event) {
    event.preventDefault();
    if (!editingUser) return;
    setLoading(true);
    setMessage('');
    try {
      const payload = {
        displayName: editingUser.displayName,
        active: editingUser.active
      };
      if (editingUser.password && editingUser.password.trim()) {
        payload.password = editingUser.password;
      }
      const response = await fetch(`${API_URL}/api/auth/users/${editingUser.id || editingUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || t.error);
      setEditingUser(null);
      setMessage(t.userUpdated);
      await loadUsers();
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  async function addDevice(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/api/devices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ deviceId, deviceName })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || t.error);
      setDeviceId('');
      setDeviceName('');
      setMessage(t.added);
      await loadDevices();
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  async function editDevice(event) {
    event.preventDefault();
    if (!editingDevice) return;
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/api/devices/${editingDevice.deviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ deviceName: editingDevice.deviceName, active: editingDevice.active })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || t.error);
      setEditingDevice(null);
      setMessage(t.counterUpdated);
      await loadDevices();
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteDevice(dev) {
    if (!window.confirm(t.confirmDeleteCounter)) return;
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/api/devices/${dev.deviceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || t.error);
      setMessage(t.counterDeleted);
      await loadDevices();
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(user) {
    if (!window.confirm(t.confirmDeleteUser)) return;
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/api/auth/users/${user.id || user._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || t.error);
      setMessage(t.userDeleted);
      await loadUsers();
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    if (newPassword !== confirmPassword) return setMessage(t.mismatch);
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || t.error);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage(t.changed);
    } catch (error) {
      setMessage(error.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    window.localStorage.removeItem('admin_token');
    setToken(null);
  }

  if (!token) {
    return (
      <main className="loginShell">
        <section className="loginCard">
          <div className="mark">श्री</div>
          <p className="kicker">{t.admin}</p>
          <h1>{TEMPLE_NAME}</h1>
          <p className="subtle">{t.loginSub}</p>
          <LanguageToggle language={language} onChange={switchLanguage} label={t.language} />
          <form onSubmit={login} className="form">
            <label>
              {t.username}
              <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
            </label>
            <label>
              {t.password}
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
            </label>
            {message && <p className="error">{message}</p>}
            <button disabled={loading}>{loading ? t.signingIn : t.login}</button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="adminShell">
      <aside className="sidebar">
        <div className="sideBrand">
          <div className="mark small">श्री</div>
          <div>
            <strong>Token Admin</strong>
            <span>{language === 'ne' ? 'मन्दिर व्यवस्थापन' : 'Temple management'}</span>
          </div>
        </div>
        <nav>
          <NavItem active={section === 'dashboard'} onClick={() => setSection('dashboard')} label={t.dashboard} icon="◈" />
          <NavItem active={section === 'counters'} onClick={() => setSection('counters')} label={t.counters} icon="▦" />
          <NavItem active={section === 'users'} onClick={() => setSection('users')} label={t.users} icon="♙" />
          <NavItem active={section === 'transactions'} onClick={() => setSection('transactions')} label={t.transactions} icon="≡" />
          <NavItem active={section === 'security'} onClick={() => setSection('security')} label={t.security} icon="⌁" />
        </nav>
        <div className="sideBottom">
          <LanguageToggle language={language} onChange={switchLanguage} label={t.language} />
          <button className="sidebarLogout" onClick={logout}>{t.logout}</button>
        </div>
      </aside>

      <section className="mainArea">
        <header className="mainHeader">
          <div>
            <p className="kicker">{t.admin}</p>
            <h1>{TEMPLE_NAME}</h1>
          </div>
          <div className="headerCount">
            <strong>{devices.length}</strong>
            <span>{t.activeCounters}</span>
          </div>
        </header>

        {section === 'dashboard' && (
          <Dashboard devices={devices} t={t} onCounters={() => setSection('counters')} />
        )}

        {section === 'counters' && (
          <Counters
            devices={devices}
            t={t}
            deviceId={deviceId}
            setDeviceId={setDeviceId}
            deviceName={deviceName}
            setDeviceName={setDeviceName}
            addDevice={addDevice}
            editingDevice={editingDevice}
            setEditingDevice={setEditingDevice}
            editDevice={editDevice}
            deleteDevice={deleteDevice}
            loadDevices={loadDevices}
            loading={loading}
            message={message}
          />
        )}

        {section === 'users' && (
          <Users
            users={users}
            t={t}
            username={newUsername}
            setUsername={setNewUsername}
            displayName={newDisplayName}
            setDisplayName={setNewDisplayName}
            password={newUserPassword}
            setPassword={setNewUserPassword}
            createUser={createUser}
            editingUser={editingUser}
            setEditingUser={setEditingUser}
            updateUser={updateUser}
            deleteUser={deleteUser}
            loading={loading}
            message={message}
          />
        )}

        {section === 'transactions' && (
          <Transactions
            rows={transactions}
            date={filterDate}
            setDate={(d) => {
              setFilterDate(d);
              setPage(1);
              loadTransactions({ date: d, page: 1 });
            }}
            deviceId={filterDeviceId}
            setDeviceId={(dev) => {
              setFilterDeviceId(dev);
              setPage(1);
              loadTransactions({ deviceId: dev, page: 1 });
            }}
            userName={filterUserName}
            setUserName={(u) => {
              setFilterUserName(u);
              setPage(1);
              loadTransactions({ userName: u, page: 1 });
            }}
            serviceName={filterServiceName}
            setServiceName={(s) => {
              setFilterServiceName(s);
              setPage(1);
              loadTransactions({ serviceName: s, page: 1 });
            }}
            page={page}
            setPage={(p) => {
              setPage(p);
              loadTransactions({ page: p });
            }}
            limit={limit}
            setLimit={(l) => {
              setLimit(l);
              setPage(1);
              loadTransactions({ limit: l, page: 1 });
            }}
            pagination={pagination}
            summary={summaryData}
            devices={devices}
            users={users}
            services={services}
            load={() => loadTransactions()}
            t={t}
          />
        )}

        {section === 'security' && (
          <Security
            t={t}
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            changePassword={changePassword}
            loading={loading}
            message={message}
          />
        )}
      </section>
    </main>
  );
}

function LanguageToggle({ language, onChange, label }) {
  return (
    <div className="language">
      <span>{label}</span>
      <button className={language === 'ne' ? 'selected' : ''} onClick={() => onChange('ne')}>नेपाली</button>
      <button className={language === 'en' ? 'selected' : ''} onClick={() => onChange('en')}>English</button>
    </div>
  );
}

function NavItem({ active, onClick, label, icon }) {
  return (
    <button className={`navItem ${active ? 'active' : ''}`} onClick={onClick}>
      <span>{icon}</span>
      {label}
    </button>
  );
}

function Dashboard({ devices, t, onCounters }) {
  return (
    <div className="pageContent">
      <div className="pageIntro">
        <p className="kicker">{t.overview}</p>
        <h2>{t.counterManagement}</h2>
        <p className="subtle">{t.overviewSub}</p>
      </div>
      <div className="metricGrid">
        <div className="metricCard accent">
          <span>{t.activeCounters}</span>
          <strong>{devices.length}</strong>
          <button onClick={onCounters}>{t.addCounter} →</button>
        </div>
        <div className="metricCard">
          <span>{t.activeCounterList}</span>
          <strong>{devices.filter((device) => device.active).length}</strong>
          <small>{t.active}</small>
        </div>
      </div>
      <section className="panel">
        <div className="panelHead">
          <div>
            <p className="kicker">{t.counters}</p>
            <h3>{t.activeCounterList}</h3>
          </div>
          <button className="quiet" onClick={onCounters}>{t.counters} →</button>
        </div>
        <DeviceRows devices={devices} t={t} />
      </section>
    </div>
  );
}

function Counters({ devices, t, deviceId, setDeviceId, deviceName, setDeviceName, addDevice, editingDevice, setEditingDevice, editDevice, deleteDevice, loadDevices, loading, message }) {
  return (
    <div className="pageContent">
      <div className="pageIntro">
        <p className="kicker">{t.counters}</p>
        <h2>{t.counterManagement}</h2>
        <p className="subtle">{t.counterSub}</p>
      </div>
      {message && <p className="success" style={{ marginBottom: 16 }}>{message}</p>}
      <div className="contentGrid">
        <section className="panel">
          {editingDevice ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="kicker">{t.editCounter}</p>
                <button type="button" className="quiet" onClick={() => setEditingDevice(null)}>{t.cancel}</button>
              </div>
              <h3>{editingDevice.deviceId}</h3>
              <form onSubmit={editDevice} className="form">
                <label>
                  {t.counterName}
                  <input
                    value={editingDevice.deviceName || ''}
                    onChange={(e) => setEditingDevice({ ...editingDevice, deviceName: e.target.value })}
                    required
                  />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    style={{ width: 'auto' }}
                    checked={editingDevice.active !== false}
                    onChange={(e) => setEditingDevice({ ...editingDevice, active: e.target.checked })}
                  />
                  <span>{t.active}</span>
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button disabled={loading} style={{ flex: 1 }}>{loading ? '...' : t.updateCounter}</button>
                  <button type="button" className="quiet" onClick={() => setEditingDevice(null)}>{t.cancel}</button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <p className="kicker">{t.addCounter}</p>
              <h3>{t.counterManagement}</h3>
              <form onSubmit={addDevice} className="form">
                <label>
                  {t.deviceId}
                  <input value={deviceId} onChange={(event) => setDeviceId(event.target.value.toUpperCase())} placeholder="DEV001" required />
                </label>
                <label>
                  {t.counterName}
                  <input value={deviceName} onChange={(event) => setDeviceName(event.target.value)} placeholder="Counter 1" required />
                </label>
                <button disabled={loading}>{t.saveCounter}</button>
              </form>
            </div>
          )}
        </section>
        <section className="panel">
          <div className="panelHead">
            <div>
              <p className="kicker">{t.activeCounterList}</p>
              <h3>{t.counters}</h3>
            </div>
            <button className="quiet" onClick={loadDevices}>{t.refresh}</button>
          </div>
          {devices.length ? devices.map((dev) => (
            <div className="deviceRow" key={dev.deviceId}>
              <div>
                <strong>{dev.deviceName}</strong>
                <span>{dev.deviceId}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`badge ${dev.active !== false ? '' : 'inactive'}`}>
                  {dev.active !== false ? t.active : t.inactive}
                </span>
                <button type="button" className="quiet small" onClick={() => setEditingDevice({ ...dev })}>✏ {t.edit}</button>
                <button type="button" className="quiet small dangerBtn" onClick={() => deleteDevice(dev)}>✕ {t.delete}</button>
              </div>
            </div>
          )) : <p className="subtle">{t.noCounters}</p>}
        </section>
      </div>
    </div>
  );
}

function Users({ users, t, username, setUsername, displayName, setDisplayName, password, setPassword, createUser, editingUser, setEditingUser, updateUser, deleteUser, loading, message }) {
  return (
    <div className="pageContent">
      <div className="pageIntro">
        <p className="kicker">{t.users}</p>
        <h2>{t.userManagement}</h2>
        <p className="subtle">{t.userSub}</p>
      </div>

      {message && <p className="success" style={{ marginBottom: 16 }}>{message}</p>}

      <div className="contentGrid">
        <section className="panel">
          {editingUser ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="kicker">{t.editUser}</p>
                <button type="button" className="quiet" onClick={() => setEditingUser(null)}>{t.cancel}</button>
              </div>
              <h3>@{editingUser.username}</h3>
              <form onSubmit={updateUser} className="form">
                <label>
                  {t.displayName}
                  <input
                    value={editingUser.displayName || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, displayName: e.target.value })}
                    required
                  />
                </label>
                <label>
                  {t.optionalPassword}
                  <input
                    type="password"
                    minLength="8"
                    value={editingUser.password || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    style={{ width: 'auto' }}
                    checked={editingUser.active !== false}
                    onChange={(e) => setEditingUser({ ...editingUser, active: e.target.checked })}
                  />
                  <span>{t.active}</span>
                </label>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button disabled={loading} style={{ flex: 1 }}>{loading ? '...' : t.updateUser}</button>
                  <button type="button" className="quiet" onClick={() => setEditingUser(null)}>{t.cancel}</button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <p className="kicker">{t.createUser}</p>
              <h3>{t.createUser}</h3>
              <form onSubmit={createUser} className="form">
                <label>
                  {t.username}
                  <input value={username} onChange={(event) => setUsername(event.target.value)} required />
                </label>
                <label>
                  {t.displayName}
                  <input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />
                </label>
                <label>
                  {t.password}
                  <input type="password" minLength="8" value={password} onChange={(event) => setPassword(event.target.value)} required />
                </label>
                <button disabled={loading}>{loading ? '...' : t.createUser}</button>
              </form>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panelHead">
            <div>
              <p className="kicker">{t.userList}</p>
              <h3>{t.users}</h3>
            </div>
          </div>
          {users.length ? (
            users.map((user) => (
              <div className="deviceRow" key={user.id || user._id}>
                <div>
                  <strong>{user.displayName}</strong>
                  <span>@{user.username}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge ${user.active !== false ? '' : 'inactive'}`}>
                    {user.active !== false ? t.active : t.inactive}
                  </span>
                  <button
                    type="button"
                    className="quiet small"
                    onClick={() => setEditingUser({ ...user, password: '' })}
                  >
                    ✏ {t.edit}
                  </button>
                  <button
                    type="button"
                    className="quiet small dangerBtn"
                    onClick={() => deleteUser(user)}
                  >
                    ✕ {t.delete}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="subtle">{t.noUsers}</p>
          )}
        </section>
      </div>
    </div>
  );
}

function Security({ t, currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, changePassword, loading, message }) {
  return (
    <div className="pageContent">
      <div className="pageIntro">
        <p className="kicker">{t.security}</p>
        <h2>{t.passwordChange}</h2>
        <p className="subtle">{t.passwordSub}</p>
      </div>
      <section className="panel narrow">
        <form onSubmit={changePassword} className="form">
          <label>
            {t.currentPassword}
            <input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
          </label>
          <label>
            {t.newPassword}
            <input type="password" minLength="8" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
          </label>
          <label>
            {t.confirmPassword}
            <input type="password" minLength="8" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
          </label>
          <button disabled={loading}>{t.savePassword}</button>
        </form>
        {message && <p className="success">{message}</p>}
      </section>
    </div>
  );
}

function DeviceRows({ devices, t }) {
  return devices.length ? (
    devices.map((device) => (
      <div className="deviceRow" key={device.deviceId}>
        <div>
          <strong>{device.deviceName}</strong>
          <span>{device.deviceId}</span>
        </div>
        <span className="badge">{t.active}</span>
      </div>
    ))
  ) : (
    <p className="subtle">{t.noCounters}</p>
  );
}

function Transactions({
  rows,
  date,
  setDate,
  deviceId,
  setDeviceId,
  userName,
  setUserName,
  serviceName,
  setServiceName,
  page,
  setPage,
  limit,
  setLimit,
  pagination,
  summary,
  devices,
  users,
  services,
  load,
  t
}) {
  const totalReceipts = summary?.totals?.tokens ?? 0;
  const totalCollection = summary?.totals?.collection ?? 0;
  const serviceList = summary?.services ?? [];

  const serviceOptions = Array.from(
    new Set([
      ...(services || []).map((s) => s.name),
      ...(summary?.services || []).map((s) => s.serviceName),
      ...(rows || []).map((r) => r.serviceName),
      'बलि पूजा',
      'बजार शुल्क',
      'गाडी पूजा',
      'टहरा शुल्क',
      'अन्य'
    ].filter(Boolean))
  );

  const operatorOptions = (users || []).map((u) => ({
    value: u.username,
    label: `${u.displayName} (@${u.username})`
  }));
  const knownUserNames = new Set((users || []).flatMap((u) => [u.username?.toLowerCase(), u.displayName?.toLowerCase()]));
  (rows || []).forEach((r) => {
    if (r.userName && !knownUserNames.has(r.userName.toLowerCase())) {
      operatorOptions.push({ value: r.userName, label: r.userName });
      knownUserNames.add(r.userName.toLowerCase());
    }
  });

  return (
    <div className="pageContent">
      <div className="pageIntro">
        <p className="kicker">{t.transactions}</p>
        <h2>{t.transactions}</h2>
        <p className="subtle">{t.overviewSub}</p>
      </div>

      <section className="panel">
        {/* Multi-parameter Filter Bar */}
        <div className="filterBar">
          <label>
            {t.filterDate}
            <input
              type="text"
              value={date}
              placeholder="e.g. 2083-05-30 or २०८३/०५/३०"
              title="Enter Nepali date (e.g. 2083-05-30 or २०८३/०५/३०)"
              onChange={(event) => setDate(event.target.value)}
            />
          </label>

          <label>
            {t.filterCounter}
            <select value={deviceId} onChange={(event) => setDeviceId(event.target.value)}>
              <option value="ALL">{t.allCounters}</option>
              {devices.map((dev) => (
                <option key={dev.deviceId} value={dev.deviceId}>
                  {dev.deviceId} ({dev.deviceName})
                </option>
              ))}
            </select>
          </label>

          <label>
            {t.filterUser}
            <select value={userName} onChange={(event) => setUserName(event.target.value)}>
              <option value="ALL">{t.allUsers}</option>
              {operatorOptions.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            {t.filterService}
            <select value={serviceName} onChange={(event) => setServiceName(event.target.value)}>
              <option value="ALL">{t.allServices}</option>
              {serviceOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="button" onClick={() => load()}>{t.refresh}</button>
            <button
              type="button"
              className="quiet"
              onClick={() => {
                setDate('');
                setDeviceId('ALL');
                setUserName('ALL');
                setServiceName('ALL');
              }}
            >
              {t.clear}
            </button>
          </div>
        </div>

        {/* Detailed Transactions Table */}
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>{t.token}</th>
                <th>{t.date}</th>
                <th>{t.time}</th>
                <th>{t.filterCounter}</th>
                <th>{t.operator}</th>
                <th>{t.service}</th>
                <th>{t.paymentMethod}</th>
                <th style={{ textAlign: 'right' }}>{t.amount}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr key={row.localId || row._id}>
                    <td><strong>{row.receiptNumber || row.tokenNumber}</strong></td>
                    <td>{row.nepaliDate || '-'}</td>
                    <td>{row.tokenTime || '-'}</td>
                    <td><span className="codeTag">{row.deviceId}</span></td>
                    <td>{row.userName || '-'}</td>
                    <td>
                      <div>
                        <strong>{row.serviceName}</strong>
                        {row.itemName && <span className="subtle" style={{ display: 'block', fontSize: 11 }}>{row.itemName}</span>}
                      </div>
                    </td>
                    <td><span className="payTag">{row.paymentMethod || 'Cash'}</span></td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>रु {Number(row.amount).toLocaleString('en-IN')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="empty">{t.noTransactions}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="paginationBar">
          <div className="paginationInfo">
            <span>
              {t.page} <strong>{pagination.page}</strong> {t.of} <strong>{pagination.pages || 1}</strong>
            </span>
            <span className="subtle">({pagination.total} {t.token})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, margin: 0 }}>
              <span>{t.perPage}:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                style={{ padding: '4px 8px', fontSize: 12 }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>

            <button
              type="button"
              className="quiet"
              disabled={pagination.page <= 1}
              onClick={() => setPage(Math.max(1, pagination.page - 1))}
            >
              ← {t.prev}
            </button>
            <button
              type="button"
              className="quiet"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPage(pagination.page + 1)}
            >
              {t.next} →
            </button>
          </div>
        </div>
      </section>

      {/* Dynamic Summary & Service Breakdown at Bottom */}
      <section className="panel" style={{ marginTop: 28 }}>
        <div className="panelHead">
          <div>
            <p className="kicker">{t.overview}</p>
            <h3>{t.serviceBreakdown}</h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: 12, color: 'var(--muted)', display: 'block' }}>{t.totalCollection}</span>
            <strong style={{ fontSize: 24, color: 'var(--green)' }}>
              रु {totalCollection.toLocaleString('en-IN')}
            </strong>
          </div>
        </div>

        {/* Summary metric banner */}
        <div className="metricGrid" style={{ marginBottom: 24 }}>
          <div className="metricCard accent">
            <span>{t.totalReceipts}</span>
            <strong>{totalReceipts.toLocaleString('en-IN')}</strong>
            <small style={{ color: '#d8eee6' }}>
              {date ? `${t.date}: ${date}` : t.allCounters}
            </small>
          </div>
          <div className="metricCard">
            <span>{t.totalCollection}</span>
            <strong style={{ color: 'var(--green)' }}>रु {totalCollection.toLocaleString('en-IN')}</strong>
            <small>{serviceList.length} {t.service}</small>
          </div>
        </div>

        {/* Breakdown table per service */}
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{t.service}</th>
                <th style={{ textAlign: 'center' }}>{t.receiptsGenerated}</th>
                <th style={{ textAlign: 'right' }}>{t.collectionAmount}</th>
                <th style={{ textAlign: 'right' }}>{t.share}</th>
              </tr>
            </thead>
            <tbody>
              {serviceList.length ? (
                serviceList.map((svc, index) => {
                  const sharePct = totalCollection > 0 ? ((svc.collection / totalCollection) * 100).toFixed(1) : '0';
                  return (
                    <tr key={svc.serviceName || index}>
                      <td style={{ width: 40, color: 'var(--muted)' }}>{index + 1}</td>
                      <td><strong>{svc.serviceName}</strong></td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="codeTag">{svc.tokens}</span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                        रु {Number(svc.collection).toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--muted)' }}>
                        {sharePct}%
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="empty">{t.noTransactions}</td>
                </tr>
              )}
            </tbody>
            {serviceList.length > 0 && (
              <tfoot>
                <tr style={{ background: '#f8faf7', fontWeight: 'bold' }}>
                  <td></td>
                  <td>{t.totalReceipts}</td>
                  <td style={{ textAlign: 'center' }}>{totalReceipts}</td>
                  <td style={{ textAlign: 'right', color: 'var(--green)' }}>रु {totalCollection.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right' }}>100%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>
    </div>
  );
}
