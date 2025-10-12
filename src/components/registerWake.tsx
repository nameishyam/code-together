import doWake from "../lib/sw.js";

export default async function RegisterWake() {
  await doWake();
  return null;
}
