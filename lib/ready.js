/* Tiny one-shot signal so the hero knows when the intro has cleared the stage.
   Order-independent: subscribing after the signal fires still runs the callback. */

let isReady = false;
const listeners = new Set();

export function markReady() {
  if (isReady) return;
  isReady = true;
  listeners.forEach((fn) => fn());
  listeners.clear();
}

export function onReady(fn) {
  if (isReady) {
    fn();
    return () => {};
  }
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const introAlreadySeen = () => {
  try {
    return sessionStorage.getItem("pm_intro") === "1";
  } catch {
    return false;
  }
};

export const rememberIntro = () => {
  try {
    sessionStorage.setItem("pm_intro", "1");
  } catch {
    /* private mode — the intro simply plays again */
  }
};
