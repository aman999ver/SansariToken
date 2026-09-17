import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'device_id';
const DEVICE_NAME_KEY = 'device_name';
const COUNTER_ID_KEY = 'counter_id';
const COUNTER_NAME_KEY = 'counter_name';
const USERNAME_KEY = 'username';
const USER_NAME_KEY = 'user_name';

export async function getDeviceSettings() {
  const values = await AsyncStorage.multiGet([
    DEVICE_ID_KEY,
    DEVICE_NAME_KEY,
    COUNTER_ID_KEY,
    COUNTER_NAME_KEY,
    USERNAME_KEY,
    USER_NAME_KEY
  ]);
  return Object.fromEntries(values.map(([key, value]) => [key, value || '']));
}

export async function saveDeviceSettings({ deviceId, deviceName, counterId = 'C1', counterName = 'काउन्टर १' }) {
  await AsyncStorage.multiSet([
    [DEVICE_ID_KEY, (deviceId || '').trim()],
    [DEVICE_NAME_KEY, (deviceName || '').trim()],
    [COUNTER_ID_KEY, (counterId || 'C1').trim()],
    [COUNTER_NAME_KEY, (counterName || 'काउन्टर १').trim()]
  ]);
}

export async function saveUserSettings({ username, displayName }) {
  await AsyncStorage.multiSet([[USERNAME_KEY, username], [USER_NAME_KEY, displayName]]);
}

export async function clearUserSettings() {
  await AsyncStorage.multiRemove([USERNAME_KEY, USER_NAME_KEY]);
}