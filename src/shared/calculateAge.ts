export function calculateAge(birthday: Date) {
  const ageDifMs = Date.now() - birthday.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getFullYear() - 1970);
}
