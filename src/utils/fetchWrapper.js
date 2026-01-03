export const fetchWrapper = async (url, options = {}) => {
  // Allow passing token in options for temp auth
  const token = options.token || localStorage.getItem('jwt');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
  
  // Remove token from options before passing to fetch
  const { token: _, ...fetchOptions } = options;

  // Prepend API URL if it's a relative path
  let fullUrl = url;
  if (url.startsWith('/')) {
    const apiBase = import.meta.env.VITE_API_URL || ''; // Fallback to empty (proxy) if not set
    fullUrl = `${apiBase}${url}`;
  }
  
  const res = await fetch(fullUrl, { ...fetchOptions, headers });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message || `HTTP Error ${res.status}`);
  }

  return res.json();
};
