import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';
import { getActivePaletteId, getColors, type Colors } from './colors';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

/**
 * Palette-aware StyleSheet. Reads the live palette on each style access so
 * preview theme switches update without rewriting screens.
 *
 * Call `useTheme()` (or `useThemedStyles`) in the component so it re-renders.
 */
export function createStyles<T extends NamedStyles<T> | NamedStyles<any>>(
  factory: (colors: Colors) => T & NamedStyles<any>,
): T {
  const cache = new Map<string, T>();
  return new Proxy({} as T, {
    get(_target, prop) {
      if (typeof prop !== 'string') return undefined;
      const id = getActivePaletteId();
      let sheet = cache.get(id);
      if (!sheet) {
        sheet = StyleSheet.create(factory(getColors())) as T;
        cache.set(id, sheet);
      }
      return sheet[prop as keyof T];
    },
  });
}
