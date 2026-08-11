import { getAppSettings } from '@/modules/settings';

export const money = (n: number) => {
  const c = getAppSettings().currencyDisplay;
  return `${c} ${n.toFixed(n % 1 === 0 ? 0 : 2)}`;
};

export const moneyFixed = (n: number) => {
  const c = getAppSettings().currencyDisplay;
  return `${c} ${n.toFixed(2)}`;
};
