
// Input Normalization (for storage/matching)
export const normalizeLocation = (value) => {
  if (!value) return '';
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
};

// Display Formatting (Capitalize Words)
export const formatLocation = (value) => {
  if (!value) return '';
  return value
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
