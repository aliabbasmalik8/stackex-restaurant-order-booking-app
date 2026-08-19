import { Image } from 'react-native';

type DineOsMarkProps = {
  size: number;
  color: string;
};

const MARK = require('./dineos-mark.png');

/** DineOS D from the launcher icon artwork, tinted with the caller color. */
export const DineOsMark = ({ size, color }: DineOsMarkProps) => (
  <Image
    source={MARK}
    resizeMode="contain"
    tintColor={color}
    accessibilityElementsHidden
    importantForAccessibility="no-hide-descendants"
    style={{ width: size, height: size }}
  />
);
