  import { useEffect, useState } from 'react';
import * as Crypto from 'expo-crypto';
import NetInfo from '@react-native-community/netinfo';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { createTransaction, countPendingTransactions, getSetting, initializeDatabase, listTransactionsPaginated, setSetting } from './src/database/database';
import { defaultServices } from './src/constants/defaultServices';
import { API_BASE_URL, TEMPLE_NAME } from './src/constants/appConfig';
import { fetchAvailableDevices, fetchServices, loginUser } from './src/services/api';
import { getDeviceSettings, saveDeviceSettings, saveUserSettings } from './src/services/deviceSettings';
import { printerService } from './src/services/printer/mockPrinterService';
import { syncPendingTransactions } from './src/services/syncService';
import { getReceiptDetails } from './src/utils/receipt';

export default function App() {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState({ device_id: '', device_name: '', username: '', user_name: '' });
  const [services, setServices] = useState(defaultServices);
  const [screen, setScreen] = useState('setup');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [amount, setAmount] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    (async () => {
      await initializeDatabase();
      const saved = await getDeviceSettings();
      setSettings(saved);
      setPendingCount(await countPendingTransactions());
      if (saved.user_name && saved.device_id) setScreen('services');
      else if (saved.user_name) setScreen('setup');
      else setScreen('login');
      setReady(true);
    })().catch(() => Alert.alert('त्रुटि', 'स्थानीय डाटाबेस सुरु गर्न सकिएन।'));
  }, []);

  useEffect(() => {
    if (!ready || screen !== 'services') return undefined;
    let mounted = true;
    const refresh = async () => {
      const state = await NetInfo.fetch();
      if (mounted) setOnline(Boolean(state.isConnected));
      try {
        const remoteServices = await fetchServices(API_BASE_URL);
        if (mounted && remoteServices.length) setServices(remoteServices);
      } catch { /* Offline is a normal operating mode. */ }
      const result = await syncPendingTransactions({ apiUrl: API_BASE_URL, deviceId: settings.device_id });
      if (mounted) setPendingCount(result.pending);
    };
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, [ready, screen, settings]);

  if (!ready) return <Centered><ActivityIndicator size="large" color="#0b6b62" /></Centered>;
  if (screen === 'login') return <LoginScreen onLogin={async (username, password) => { const user = await loginUser(API_BASE_URL, username, password); await saveUserSettings({ username: user.username, displayName: user.displayName }); setSettings((current) => ({ ...current, username: user.username, user_name: user.displayName })); setScreen('setup'); }} />;
  if (screen === 'setup') return <SetupScreen settings={settings} onSave={async (next) => { await saveDeviceSettings(next); setSettings((current) => ({ ...current, device_id: next.deviceId, device_name: next.deviceName })); setScreen('services'); }} />;
  if (screen === 'detail') return <DetailScreen service={selectedService} onBack={() => setScreen('services')} onSelect={(option) => { setSelectedOption(option); setAmount(String(option?.price ?? '')); setScreen('confirm'); }} />;
  if (screen === 'confirm') return <ConfirmScreen service={selectedService} option={selectedOption} amount={amount} setAmount={setAmount} onBack={() => setScreen('detail')} onConfirm={() => generateToken()} />;
  if (screen === 'success') return <SuccessScreen transaction={lastTransaction} onHome={() => setScreen('services')} onHistory={openHistory} />;
  if (screen === 'history') return <HistoryScreen apiUrl={API_BASE_URL} deviceId={settings.device_id} pendingCount={pendingCount} onPendingChange={setPendingCount} onBack={() => setScreen('services')} />;
  return <ServiceScreen services={services} pendingCount={pendingCount} online={online} onSelect={(service) => { setSelectedService(service); setScreen('detail'); }} onHistory={openHistory} />;

  async function generateToken() {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 0) return Alert.alert('रकम जाँच गर्नुहोस्', 'मान्य रकम राख्नुहोस्।');
    const now = new Date();
    const receiptDetails = getReceiptDetails(now);
    const sequenceKey = `token_sequence:${settings.device_id}:${receiptDetails.dateKey}`;
    const nextSequence = Number(await getSetting(sequenceKey) || 0) + 1;
    const transaction = {
      localId: Crypto.randomUUID(), deviceId: settings.device_id, templeName: TEMPLE_NAME,
      nepaliDate: receiptDetails.nepaliDate, tokenTime: receiptDetails.time,
      tokenNumber: `${settings.device_id}-${String(nextSequence).padStart(6, '0')}`, receiptNumber: `${settings.device_id}-${String(nextSequence).padStart(6, '0')}`,
      userName: settings.user_name,
      serviceId: selectedService.id, serviceName: selectedService.name,
      itemName: selectedOption?.name || '', amount: numericAmount, paymentMethod: 'cash', createdAt: now.toISOString()
    };
    try {
      await setSetting(sequenceKey, nextSequence);
      await createTransaction(transaction);
      await printerService.initializePrinter();
      await printerService.printToken(transaction);
      const result = await syncPendingTransactions({ apiUrl: API_BASE_URL, deviceId: settings.device_id });
      setPendingCount(result.pending);
      setLastTransaction(transaction);
      setScreen('success');
    } catch { Alert.alert('टोकन सुरक्षित भएन', 'लेनदेन सुरक्षित नभएसम्म फेरि प्रयास गर्नुहोस्।'); }
  }

  async function openHistory() { setScreen('history'); }
}

function Centered({ children }) { return <View style={styles.centered}>{children}</View>; }

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async () => { setLoading(true); try { await onLogin(username, password); } catch (error) { Alert.alert('प्रवेश असफल भयो', error.message || 'प्रयोगकर्ता नाम वा पासवर्ड जाँच गर्नुहोस्।'); } finally { setLoading(false); } };
  return <SafeAreaView style={styles.safe}><View style={styles.setup}><Text style={styles.brand}>{TEMPLE_NAME}</Text><Text style={styles.title}>प्रयोगकर्ता प्रवेश</Text><Text style={styles.muted}>टोकन बनाउन आफ्नो प्रयोगकर्ता खाताबाट प्रवेश गर्नुहोस्।</Text><Field label="प्रयोगकर्ता नाम" value={username} onChangeText={setUsername} autoCapitalize="none" /><Field label="पासवर्ड" value={password} onChangeText={setPassword} secureTextEntry /><PrimaryButton title={loading ? 'प्रवेश हुँदैछ...' : 'प्रवेश गर्नुहोस्'} onPress={submit} /></View></SafeAreaView>;
}

function SetupScreen({ settings, onSave }) {
  const [devices, setDevices] = useState([]);
  const [selectedId, setSelectedId] = useState(settings.device_id || '');
  const [loading, setLoading] = useState(true);
  useEffect(() => { fetchAvailableDevices(API_BASE_URL).then(setDevices).catch(() => setDevices([])).finally(() => setLoading(false)); }, []);
  const selected = devices.find((device) => device.deviceId === selectedId);
  return <SafeAreaView style={styles.safe}><View style={styles.setup}><Text style={styles.brand}>{TEMPLE_NAME}</Text><Text style={styles.title}>काउन्टर छनोट</Text><Text style={styles.muted}>यो उपकरणमा काउन्टर एकपटक मात्र चयन गर्नुहोस्।</Text>{loading ? <ActivityIndicator color="#0b6b62" /> : devices.length ? devices.map((device) => <Pressable key={device.deviceId} onPress={() => setSelectedId(device.deviceId)} style={[styles.optionButton, selectedId === device.deviceId && styles.selectedOption]}><View><Text style={styles.serviceName}>{device.deviceName}</Text><Text style={styles.serviceMeta}>{device.deviceId}</Text></View><Text style={styles.amount}>{selectedId === device.deviceId ? '✓' : ''}</Text></Pressable>) : <Text style={styles.muted}>कुनै सक्रिय काउन्टर भेटिएन। पहिले admin बाट काउन्टर थप्नुहोस्।</Text>}<PrimaryButton title="काउन्टर सुरक्षित गर्नुहोस्" onPress={() => selected ? onSave({ deviceId: selected.deviceId, deviceName: selected.deviceName }) : Alert.alert('काउन्टर छनोट गर्नुहोस्')} /></View></SafeAreaView>;
}

function ServiceScreen({ services, pendingCount, online, onSelect, onHistory }) {
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}><View style={styles.header}><View><Text style={styles.eyebrow}>सेवा छनोट</Text><Text style={styles.title}>आजको संकलन</Text></View><StatusPill online={online} /></View><View style={styles.notice}><Text style={styles.noticeText}>{pendingCount ? `${pendingCount} टोकन sync हुन बाँकी` : 'सबै टोकन सुरक्षित छन्'}</Text></View>{services.map((service) => <Pressable key={service.id || service._id} style={styles.serviceButton} onPress={() => onSelect({ ...service, id: service.id || service._id })}><View><Text style={styles.serviceName}>{service.name}</Text><Text style={styles.serviceMeta}>{service.options?.length ? `${service.options.length} विकल्प` : service.price == null ? 'रकम प्रविष्ट गर्नुहोस्' : `रु ${service.price}`}</Text></View><Text style={styles.arrow}>›</Text></Pressable>)}<View style={styles.bottomActions}><SecondaryButton title="इतिहास" onPress={onHistory} /></View></ScrollView></SafeAreaView>;
}

function DetailScreen({ service, onBack, onSelect }) { return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}><BackButton onPress={onBack} /><Text style={styles.title}>{service.name}</Text><Text style={styles.muted}>विकल्प छनोट गर्नुहोस्</Text>{service.options?.length ? service.options.map((option) => <Pressable key={option.id || option._id || option.name} style={styles.optionButton} onPress={() => onSelect(option)}><Text style={styles.serviceName}>{option.name}</Text><Text style={styles.amount}>रु {option.price}</Text></Pressable>) : <PrimaryButton title={service.price == null ? 'रकम राख्नुहोस्' : `रु ${service.price} जारी राख्नुहोस्`} onPress={() => onSelect(service.price == null ? null : { name: '', price: service.price })} />}</ScrollView></SafeAreaView>; }

function ConfirmScreen({ service, option, amount, setAmount, onBack, onConfirm }) { return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.content}><BackButton onPress={onBack} /><Text style={styles.eyebrow}>पुष्टि गर्नुहोस्</Text><Text style={styles.title}>टोकन तयार छ</Text><View style={styles.summary}><Text style={styles.muted}>सेवा</Text><Text style={styles.summaryValue}>{service.name}</Text>{option?.name ? <><Text style={styles.muted}>वस्तु</Text><Text style={styles.summaryValue}>{option.name}</Text></> : null}<Text style={styles.muted}>रकम (रु)</Text><TextInput style={styles.amountInput} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" /></View><PrimaryButton title="TOKEN GENERATE गर्नुहोस्" onPress={onConfirm} /><SecondaryButton title="रद्द गर्नुहोस्" onPress={onBack} /></ScrollView></SafeAreaView>; }

function SuccessScreen({ transaction, onHome }) { return <SafeAreaView style={styles.safe}><View style={styles.success}><Text style={styles.successMark}>✓</Text><Text style={styles.title}>रसिद तयार भयो</Text><Text style={styles.token}>{transaction.receiptNumber}</Text><Text style={styles.successAmount}>रु {transaction.amount}</Text><Text style={styles.muted}>प्रिन्ट सम्पन्न</Text><PrimaryButton title="नयाँ रसिद" onPress={onHome} /></View></SafeAreaView>; }

function HistoryScreen({ apiUrl, deviceId, pendingCount: initPending, onPendingChange, onBack }) {
  const PAGE_SIZE = 15;
  const FILTERS = [
    { key: 'all', label: 'सबै' },
    { key: 'pending', label: 'Pending' },
    { key: 'synced', label: 'Synced' },
    { key: 'failed', label: 'Failed' },
  ];
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(initPending);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  async function load(f = filter, p = page) {
    setLoading(true);
    try {
      const result = await listTransactionsPaginated({ page: p, pageSize: PAGE_SIZE, filter: f });
      setRows(result.rows);
      setTotal(result.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(filter, page); }, [filter, page]);

  async function handleSync() {
    setSyncing(true);
    try {
      const { syncPendingTransactions } = require('./src/services/syncService');
      const result = await syncPendingTransactions({ apiUrl, deviceId });
      setPendingCount(result.pending);
      if (onPendingChange) onPendingChange(result.pending);
      await load(filter, 1);
      setPage(1);
    } finally {
      setSyncing(false);
    }
  }

  function changeFilter(f) { setFilter(f); setPage(1); }

  const STATUS_COLOR = { synced: '#0b6b62', pending: '#b47d00', syncing: '#5b7fbf', failed: '#c0392b' };
  const STATUS_LABEL = { synced: '✓ Synced', pending: '⏳ Pending', syncing: '↻ Syncing', failed: '✗ Failed' };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={histStyles.header}>
          <BackButton onPress={onBack} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.title}>टोकन इतिहास</Text>
            <Text style={styles.muted}>{pendingCount > 0 ? `${pendingCount} sync हुन बाँकी` : 'सबै सुरक्षित'}</Text>
          </View>
          <Pressable
            style={[histStyles.syncBtn, syncing && { opacity: 0.5 }]}
            onPress={handleSync}
            disabled={syncing}
          >
            <Text style={histStyles.syncBtnText}>{syncing ? '↻ Sync...' : '↻ Sync Now'}</Text>
          </Pressable>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={histStyles.tabBar} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {FILTERS.map((f) => (
            <Pressable key={f.key} style={[histStyles.tab, filter === f.key && histStyles.tabActive]} onPress={() => changeFilter(f.key)}>
              <Text style={[histStyles.tabText, filter === f.key && histStyles.tabTextActive]}>{f.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* List */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          {loading ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#0b6b62" />
            </View>
          ) : rows.length === 0 ? (
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <Text style={styles.muted}>कुनै इतिहास भेटिएन।</Text>
            </View>
          ) : rows.map((item) => (
            <View key={item.local_id} style={histStyles.card}>
              <View style={histStyles.cardTop}>
                <Text style={histStyles.tokenNum}>{item.token_number}</Text>
                <View style={[histStyles.badge, { backgroundColor: (STATUS_COLOR[item.sync_status] || '#888') + '22' }]}>
                  <Text style={[histStyles.badgeText, { color: STATUS_COLOR[item.sync_status] || '#888' }]}>
                    {STATUS_LABEL[item.sync_status] || item.sync_status}
                  </Text>
                </View>
              </View>
              <Text style={histStyles.serviceName}>{item.service_name}{item.item_name ? ` · ${item.item_name}` : ''}</Text>
              <View style={histStyles.cardBottom}>
                <Text style={histStyles.amount}>रु {item.amount}</Text>
                <Text style={histStyles.meta}>{item.nepali_date || ''} {item.token_time || ''}</Text>
              </View>
              {item.sync_status === 'failed' && (
                <Pressable style={histStyles.retryBtn} onPress={handleSync} disabled={syncing}>
                  <Text style={histStyles.retryText}>↺ Retry Sync</Text>
                </Pressable>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Pagination */}
        <View style={histStyles.pagination}>
          <Pressable
            style={[histStyles.pageBtn, page <= 1 && { opacity: 0.3 }]}
            onPress={() => { if (page > 1) setPage(page - 1); }}
            disabled={page <= 1}
          >
            <Text style={histStyles.pageBtnText}>‹ अघिल्लो</Text>
          </Pressable>
          <Text style={histStyles.pageInfo}>{page} / {totalPages} ({total} रेकर्ड)</Text>
          <Pressable
            style={[histStyles.pageBtn, page >= totalPages && { opacity: 0.3 }]}
            onPress={() => { if (page < totalPages) setPage(page + 1); }}
            disabled={page >= totalPages}
          >
            <Text style={histStyles.pageBtnText}>पछिल्लो ›</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Field({ label, ...props }) { return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput style={styles.input} {...props} /></View>; }
function PrimaryButton({ title, onPress }) { return <Pressable style={styles.primary} onPress={onPress}><Text style={styles.primaryText}>{title}</Text></Pressable>; }
function SecondaryButton({ title, onPress }) { return <Pressable style={styles.secondary} onPress={onPress}><Text style={styles.secondaryText}>{title}</Text></Pressable>; }
function BackButton({ onPress }) { return <Pressable onPress={onPress} style={styles.back}><Text style={styles.backText}>‹ फिर्ता</Text></Pressable>; }
function StatusPill({ online }) { return <View style={[styles.status, online ? styles.online : styles.offline]}><Text style={styles.statusText}>{online ? 'Online' : 'Offline'}</Text></View>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f7f2' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6f7f2' },
  content: { padding: 24, paddingBottom: 44 },
  setup: { flex: 1, justifyContent: 'center', padding: 28 },
  success: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28 },
  brand: { color: '#0b6b62', fontSize: 13, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12 },
  eyebrow: { color: '#0b6b62', fontSize: 15, fontWeight: '700', marginBottom: 6 },
  title: { color: '#182321', fontSize: 30, fontWeight: '800', marginBottom: 8 },
  muted: { color: '#68736f', fontSize: 15, marginBottom: 18 },
  field: { marginBottom: 16 },
  label: { color: '#34413d', fontSize: 14, fontWeight: '700', marginBottom: 7 },
  input: { backgroundColor: '#fff', borderColor: '#dce2dc', borderWidth: 1, borderRadius: 10, padding: 15, fontSize: 17, color: '#182321' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  status: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  online: { backgroundColor: '#d9f1e4' }, offline: { backgroundColor: '#eceeea' },
  statusText: { color: '#31584a', fontWeight: '700', fontSize: 13 },
  notice: { backgroundColor: '#e8efea', borderRadius: 10, padding: 14, marginBottom: 16 },
  noticeText: { color: '#31584a', fontWeight: '600' },
  serviceButton: { backgroundColor: '#fff', borderColor: '#e0e5df', borderWidth: 1, borderRadius: 12, minHeight: 82, padding: 18, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionButton: { backgroundColor: '#fff', borderColor: '#e0e5df', borderWidth: 1, borderRadius: 12, minHeight: 76, padding: 18, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectedOption: { borderColor: '#0b6b62', borderWidth: 2 },
  serviceName: { color: '#182321', fontSize: 18, fontWeight: '700' },
  serviceMeta: { color: '#68736f', marginTop: 5, fontSize: 14 },
  amount: { color: '#0b6b62', fontSize: 17, fontWeight: '800' },
  arrow: { color: '#0b6b62', fontSize: 32, fontWeight: '300' },
  bottomActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  primary: { backgroundColor: '#0b6b62', borderRadius: 10, minHeight: 56, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, marginTop: 14, marginBottom: 12 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  secondary: { borderColor: '#b8c5bd', borderWidth: 1, borderRadius: 10, minHeight: 52, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, marginTop: 8, flex: 1 },
  secondaryText: { color: '#31584a', fontSize: 16, fontWeight: '700' },
  back: { marginBottom: 24 }, backText: { color: '#0b6b62', fontSize: 16, fontWeight: '700' },
  summary: { backgroundColor: '#fff', borderRadius: 12, padding: 20, marginVertical: 18 },
  summaryValue: { color: '#182321', fontSize: 19, fontWeight: '700', marginBottom: 18 },
  amountInput: { borderBottomColor: '#0b6b62', borderBottomWidth: 2, color: '#182321', fontSize: 30, fontWeight: '800', paddingVertical: 8 },
  successMark: { backgroundColor: '#d9f1e4', borderRadius: 40, color: '#0b6b62', fontSize: 42, fontWeight: '800', height: 80, lineHeight: 80, marginBottom: 20, textAlign: 'center', width: 80 },
  token: { color: '#0b6b62', fontSize: 28, fontWeight: '900', marginVertical: 12 },
  successAmount: { color: '#182321', fontSize: 22, fontWeight: '800', marginBottom: 10 },
  historyRow: { backgroundColor: '#fff', borderBottomColor: '#e0e5df', borderBottomWidth: 1, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between' },
  synced: { color: '#39805d', fontSize: 12, marginTop: 4 }, pending: { color: '#aa6b2f', fontSize: 12, marginTop: 4 },
});

const histStyles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e8ede8' },
  syncBtn: { backgroundColor: '#0b6b62', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 9 },
  syncBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  tabBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e8ede8', flexGrow: 0, paddingVertical: 10 },
  tab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f0f4f0', marginRight: 8 },
  tabActive: { backgroundColor: '#0b6b62' },
  tabText: { color: '#4a6358', fontWeight: '700', fontSize: 13 },
  tabTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 14, marginVertical: 6, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  tokenNum: { color: '#0b6b62', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  serviceName: { color: '#34413d', fontSize: 15, fontWeight: '600', marginBottom: 8 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { color: '#182321', fontSize: 18, fontWeight: '800' },
  meta: { color: '#8a9e98', fontSize: 12 },
  retryBtn: { marginTop: 10, backgroundColor: '#fef0ee', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start' },
  retryText: { color: '#c0392b', fontWeight: '700', fontSize: 13 },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e8ede8', paddingHorizontal: 16, paddingVertical: 12 },
  pageBtn: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#f0f4f0', borderRadius: 8 },
  pageBtnText: { color: '#0b6b62', fontWeight: '700', fontSize: 13 },
  pageInfo: { color: '#4a6358', fontSize: 13, fontWeight: '600' },
});
