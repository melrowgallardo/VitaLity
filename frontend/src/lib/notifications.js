/**
 * Browser Notification Helper for Vitamin Reminders
 */

export const notifications = {
  /**
   * Check if the browser supports notifications
   * @returns {boolean}
   */
  isSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  /**
   * Get current notification permission state
   * @returns {NotificationPermission|'unsupported'}
   */
  getPermission() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  },

  /**
   * Request user permission for notifications
   * @returns {Promise<boolean>}
   */
  async requestPermission() {
    if (!this.isSupported()) return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  },

  /**
   * Display a vitamin reminder notification
   * @param {string} vitaminName
   * @param {string} [time]
   */
  notify(vitaminName, time = '') {
    if (!this.isSupported() || Notification.permission !== 'granted') return;

    try {
      new Notification('Vitality Reminder 💊', {
        body: `Time to take: ${vitaminName}${time ? ` (Scheduled for ${time})` : ''}`,
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2310b981"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>',
        tag: `vitamin-${vitaminName}-${Date.now()}`,
      });
    } catch (err) {
      console.warn('Could not display notification:', err);
    }
  },
};

