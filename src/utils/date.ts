export const parseDateOnly = (dateInput?: string | Date | null): Date | null => {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    const d = new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const str = String(dateInput).split('T')[0];
  if (str.includes('-')) {
    const parts = str.split('-');
    if (parts.length === 3) {
      const year = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const day = Number(parts[2]);
      if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
        const d = new Date(year, month, day);
        d.setHours(0, 0, 0, 0);
        return d;
      }
    }
  }
  const fallback = new Date(dateInput);
  if (!Number.isNaN(fallback.getTime())) {
    fallback.setHours(0, 0, 0, 0);
    return fallback;
  }
  return null;
};

export const formatDate = (dateInput: string | Date | null | undefined) => {
  if (!dateInput) return '---';
  const parsed = parseDateOnly(dateInput);
  if (!parsed || Number.isNaN(parsed.getTime())) return String(dateInput);

  return parsed
    .toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    .toUpperCase();
};

export const formatFullDate = (date: Date) => {
  return date
    .toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
    .toUpperCase();
};

export const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};
