
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

// Distance Formatting
export const formatDistance = (meters) => {
  if (meters === undefined || meters === null) return '';
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};
