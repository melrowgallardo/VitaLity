const DEVICE_ID_KEY = 'vitality_device_id';

// In-memory fallback if localStorage is blocked by browser policies
let memoryDeviceId = null;

/**
 * Retrieve existing device ID or generate a new unique identifier
 * @returns {string} Unique device identifier
 */
export function getDeviceId() {
  if (typeof window === 'undefined') return 'server_render_id';

  let deviceId = null;

  try {
    deviceId = localStorage.getItem(DEVICE_ID_KEY);
  } catch (err) {
    console.warn('[Storage] localStorage is not accessible, using memory session:', err);
    deviceId = memoryDeviceId;
  }

  if (!deviceId) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      try {
        deviceId = crypto.randomUUID();
      } catch {
        deviceId = 'vit_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      }
    } else {
      deviceId = 'vit_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }

    try {
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    } catch {
      memoryDeviceId = deviceId;
    }
  }

  return deviceId;
}

/**
 * Update the stored device ID (enables cross-device synchronization)
 * @param {string} newId
 */
export function setDeviceId(newId) {
  if (typeof window === 'undefined' || !newId) return;
  const trimmed = newId.trim();
  if (trimmed) {
    try {
      localStorage.setItem(DEVICE_ID_KEY, trimmed);
    } catch {
      memoryDeviceId = trimmed;
    }
  }
}
