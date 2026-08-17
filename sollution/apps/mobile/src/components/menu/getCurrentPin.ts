import * as Location from 'expo-location';

export type MapPin = {
  latitude: number;
  longitude: number;
};

export type CurrentPinResult =
  | { ok: true; pin: MapPin }
  | { ok: false; reason: 'denied' | 'unavailable' };

/** One-shot GPS. Free on iOS, Android, and web (browser geolocation). */
export async function getCurrentPin(): Promise<CurrentPinResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { ok: false, reason: 'denied' };
    }
    const { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      ok: true,
      pin: { latitude: coords.latitude, longitude: coords.longitude },
    };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}
