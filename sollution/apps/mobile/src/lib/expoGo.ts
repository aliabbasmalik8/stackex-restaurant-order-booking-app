import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

/** Expo Go store client — not a standalone / dev-client binary. */
export function isExpoGo(): boolean {
  if (Platform.OS === 'web') return false;
  return (
    Constants.appOwnership === 'expo' ||
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  );
}
