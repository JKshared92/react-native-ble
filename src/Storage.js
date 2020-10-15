import AsyncStorage from '@react-native-community/async-storage';

async function saveItem(key, value) {
  await AsyncStorage.setItem(key, value)
}

async function getItem(key) {
  const value = await AsyncStorage.getItem(key)
  return value
}

async function removeItem(key) {
  await AsyncStorage.setItem(key, '');
}

export default {
  saveItem,
  getItem,
  removeItem
}
