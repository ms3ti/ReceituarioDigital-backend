export const formatExtendedDate = (date: Date) => {
  const day = date.getDate();
  const month = date.toLocaleString('pt-br', { month: 'long' });
  const year = date.getFullYear();
  const hourUnformated = date.getHours() - 3;
  const minutesUnformated = date.getMinutes();
  const hour = hourUnformated <= 9 ? `0${hourUnformated}` : hourUnformated;
  const minute =
    minutesUnformated <= 9 ? `0${minutesUnformated}` : minutesUnformated;
  return `${day} de ${month} de ${year}, ${Number(hour)}:${minute}`;
};
