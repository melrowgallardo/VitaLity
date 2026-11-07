const DEVICE_ID_KEY = 'vitality_device_id';

/**
 * Retrieve existing device ID or generate a new unique identifier
 * @returns {string} Unique device identifier
 */
export function getDeviceId() {
  if (typeof window === 'undefined') return '';

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      deviceId = crypto.randomUUID();
    } else {
      deviceId = 'vit_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
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
    localStorage.setItem(DEVICE_ID_KEY, trimmed);
  }
}
