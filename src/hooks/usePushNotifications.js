import { useCallback, useEffect, useState } from "react";
import api from "../services/api";
import { getToken } from "../utils/roleHelper";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "";

const SUBSCRIBE_ENDPOINT = "/config/api/push/subscribe";
const UNSUBSCRIBE_ENDPOINT = "/config/api/push/unsubscribe";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

const supported =
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

// Posts an existing browser subscription to the backend. Used by both the
// hook's subscribe() flow and the post-login sync in App.jsx so that a
// previously-anonymous subscription (user_id = NULL) gets attached to the
// user once they authenticate.
export async function syncPushSubscriptionWithBackend() {
  if (!supported) return false;
  const token = getToken();
  if (!token) {
    console.warn(
      "[push] Skipping subscribe POST — no auth token. Will retry after login.",
    );
    return false;
  }
  try {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();
    if (!sub) return false;
    // axios interceptor at services/api.js attaches the Authorization header.
    await api.post(SUBSCRIBE_ENDPOINT, sub.toJSON());
    return true;
  } catch (err) {
    console.warn(
      "[push] Failed to sync subscription with backend:",
      err?.message || err,
    );
    return false;
  }
}

export default function usePushNotifications() {
  const [permission, setPermission] = useState(
    supported ? Notification.permission : "denied",
  );
  const [subscription, setSubscription] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((existing) => setSubscription(existing))
      .catch(() => {});
  }, []);

  const subscribe = useCallback(async () => {
    if (!supported) {
      setError(new Error("Push notifications are not supported on this device."));
      return null;
    }
    if (!VAPID_PUBLIC_KEY) {
      setError(
        new Error(
          "Push not configured: set VAPID_PUBLIC_KEY to your VAPID public key.",
        ),
      );
      return null;
    }
    if (!getToken()) {
      console.warn("[push] Subscribe requested without an auth token. Aborting.");
      setError(
        new Error("Please sign in before enabling notifications."),
      );
      return null;
    }
    setBusy(true);
    setError(null);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        setBusy(false);
        return null;
      }
      const registration = await navigator.serviceWorker.ready;
      let sub = await registration.pushManager.getSubscription();
      if (!sub) {
        sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }
      setSubscription(sub);
      try {
        // axios interceptor adds Authorization: Bearer <token> automatically.
        await api.post(SUBSCRIBE_ENDPOINT, sub.toJSON());
      } catch (apiErr) {
        const status = apiErr?.response?.status;
        if (status === 401) {
          console.warn(
            "[push] Subscribe POST returned 401 — token rejected by backend.",
          );
          setError(
            new Error("Session expired. Please sign in again to enable notifications."),
          );
        } else {
          console.warn(
            "[push] Subscribe POST failed:",
            apiErr?.message || apiErr,
          );
        }
      }
      return sub;
    } catch (err) {
      setError(err);
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (!subscription) return;
    setBusy(true);
    try {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      setSubscription(null);
      if (!getToken()) {
        console.warn(
          "[push] Skipping unsubscribe POST — no auth token. Local subscription cleared.",
        );
        return;
      }
      try {
        await api.post(UNSUBSCRIBE_ENDPOINT, { endpoint });
      } catch (apiErr) {
        console.warn(
          "[push] Unsubscribe POST failed:",
          apiErr?.message || apiErr,
        );
      }
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }, [subscription]);

  return {
    supported,
    permission,
    subscription,
    subscribed: Boolean(subscription),
    busy,
    error,
    subscribe,
    unsubscribe,
  };
}
