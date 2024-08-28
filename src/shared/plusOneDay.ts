import { formatDateddmmyyyy } from './formatDDmmYYYY';
export const plusOneDay = (date: Date | string) => {
  const today = new Date(date);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return formatDateddmmyyyy(tomorrow);
};
