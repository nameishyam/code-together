import { cookies } from "next/headers";

const TOKEN_KEY = "jwt_token";
const USER_KEY = "user";

export async function getServerToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_KEY)?.value || null;
  return token;
}

export async function getServerUser(): Promise<unknown | null> {
  const cookieStore = await cookies();
  const user = cookieStore.get(USER_KEY)?.value;
  return user ? JSON.parse(user) : null;
}

export async function isServerLoggedIn(): Promise<boolean> {
  const token = await getServerToken();
  const user = await getServerUser();
  const loggedIn = !!(token && user);
  return loggedIn;
}
