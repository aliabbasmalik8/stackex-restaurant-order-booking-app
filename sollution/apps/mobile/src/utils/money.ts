export const money = (n: number) =>
  `AED ${n.toFixed(n % 1 === 0 ? 0 : 2)}`;

export const moneyFixed = (n: number) => `AED ${n.toFixed(2)}`;
