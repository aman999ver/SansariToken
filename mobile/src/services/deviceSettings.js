import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = 'device_id';
const DEVICE_NAME_KEY = 'device_name';
const USERNAME_KEY = 'username';
const USER_NAME_KEY = 'user_name';
export async function getDeviceSettings() {
  const values = await AsyncStorage.multiGet([DEVICE_ID_KEY, DEVICE_NAME_KEY, USERNAME_KEY, USER_NAME_KEY]);
  return Object.fromEntries(values.map(([key, value]) => [key, value || '']));
}

export async function saveDeviceSettings({ deviceId, deviceName }) {
  await AsyncStorage.multiSet([
    [DEVICE_ID_KEY, deviceId.trim()],
    [DEVICE_NAME_KEY, deviceName.trim()]
  ]);
}

export async function saveUserSettings({ username, displayName }) {
  await AsyncStorage.multiSet([[USERNAME_KEY, username], [USER_NAME_KEY, displayName]]);
}