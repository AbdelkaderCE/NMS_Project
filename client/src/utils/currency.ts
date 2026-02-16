export const formatCurrency = (amount: number | string): string => {
  const value = typeof amount === 'string' ? parseFloat(amount) : (amount || 0);
  try {
    return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD', minimumFractionDigits: 0 }).format(value);
  } catch {
    return `${Math.round(value)} DZD`;
  }
};
