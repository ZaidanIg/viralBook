export const checkAndResetDailyQuota = (): number => {
  if (typeof window === 'undefined') return 0;
  const today = new Date().toISOString().split('T')[0];
  const lastDate = localStorage.getItem('SYSTEM_GENERATION_LAST_DATE');
  if (lastDate !== today) {
    localStorage.setItem('SYSTEM_GENERATION_COUNT', '0');
    localStorage.setItem('SYSTEM_GENERATION_LAST_DATE', today);
    return 0;
  }
  return parseInt(localStorage.getItem('SYSTEM_GENERATION_COUNT') || '0', 10);
};

export const incrementDailyQuota = () => {
  if (typeof window === 'undefined') return;
  const usage = checkAndResetDailyQuota();
  localStorage.setItem('SYSTEM_GENERATION_COUNT', (usage + 1).toString());
};
