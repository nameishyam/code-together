import Cookies from "js-cookie";

const TOKEN_KEY = "jwt_token";
const USER_KEY = "user";

export function setAuth(token: string, user: object) {
  Cookies.set(TOKEN_KEY, token, { expires: 0.04 });
  Cookies.set(USER_KEY, JSON.stringify(user), { expires: 0.04 });
}

export function getToken(): string | null {
  return Cookies.get(TOKEN_KEY) || null;
}

export function getUser(): unknown | null {
  const user = Cookies.get(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function removeAuth() {
  Cookies.remove(TOKEN_KEY);
  Cookies.remove(USER_KEY);
  Cookies.remove("sessionId");
}

export function isLoggedIn(): unknown | null {
  const token = getToken();
  const user = getUser();
  return token && user ? user : null;
}
