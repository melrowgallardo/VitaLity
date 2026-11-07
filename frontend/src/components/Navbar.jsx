import React, { useState, useEffect } from 'react';
import { Pill, CheckCircle2, Bell, BellRing, BellOff } from 'lucide-react';
import { notifications } from '../lib/notifications';

export default function Navbar({ completedCount = 0, totalCount = 0 }) {
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    setNotificationPermission(notifications.getPermission());
  }, []);

  const handleToggleNotifications = async () => {
    if (notificationPermission === 'granted') {
      notifications.notify('Reminders are active! We will notify you when scheduled vitamins are due.');
      return;
    }
    const granted = await notifications.requestPermission();
    setNotificationPermission(granted ? 'granted' : 'denied');
    if (granted) {
      notifications.notify('Vitality reminders enabled!', 'You will be notified on schedule.');
    }
  };

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 ring-4 ring-emerald-50">
            <Pill className="w-5 h-5 -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-stone-900">Vitality</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Daily Tracker
              </span>
            </div>
            <p className="text-xs text-stone-500 font-normal">Nourish your daily habits & wellness</p>
          </div>
        </div>

        {/* Date, Reminders & Summary Counter */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-stone-100">
          <div className="text-left sm:text-right">
            <p className="text-xs font-medium text-stone-400 uppercase tracking-wider">Today</p>
            <p className="text-xs sm:text-sm font-semibold text-stone-800">{todayFormatted}</p>
          </div>

          {/* Reminder Bell Button */}
          {notifications.isSupported() && (
            <button
              type="button"
              onClick={handleToggleNotifications}
              className={`p-2 rounded-xl border transition-all ${notificationPermission === 'granted'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  : notificationPermission === 'denied'
                    ? 'bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              title={
                notificationPermission === 'granted'
                  ? 'Reminders enabled (Click for test alert)'
                  : notificationPermission === 'denied'
                    ? 'Notifications blocked in browser'
                    : 'Enable desktop reminders for vitamin schedules'
              }
            >
              {notificationPermission === 'granted' ? (
                <BellRing className="w-4 h-4 text-emerald-600" />
              ) : notificationPermission === 'denied' ? (
                <BellOff className="w-4 h-4 text-stone-400" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
            </button>
          )}

          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200/80 rounded-full px-3 py-1.5 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-stone-700">
              {completedCount}/{totalCount}
            </span>
            <span className="text-[10px] text-stone-400 font-medium hidden sm:inline">
              ({progressPct}%)
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
