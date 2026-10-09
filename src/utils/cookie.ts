export const setCookie = (name: string, value: string, minutes: number = 60) => {
  const expires = new Date(Date.now() + minutes * 60000).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + '; expires=' + expires + '; path=/';
};

export const getCookie = (name: string) => {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
};

export const deleteCookie = (name: string) => {
  setCookie(name, '', -1);
};
