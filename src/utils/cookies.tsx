// get a cookie value
export const get_cookie = (name: string) => {
  const cookie_str = document.cookie;
  const cookies = cookie_str.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key == name) return decodeURIComponent(value);
  }
  return null;
};

// set a cookie value
export const set_cookie = (name: string, value: string, days = 365) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`;
};
