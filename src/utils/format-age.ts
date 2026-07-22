export function formatAge(ageMonths: number): string {
  const years = Math.floor(ageMonths / 12);
  const months = ageMonths % 12;
  if (years === 0) {
    return `${months} month${months === 1 ? '' : 's'}`;
  }
  if (months === 0) {
    return `${years} year${years === 1 ? '' : 's'}`;
  }
  return `${years}y ${months}m`;
}
