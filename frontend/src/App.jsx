import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsCard from './components/StatsCard';
import AddVitaminForm from './components/AddVitaminForm';
import DailyTrackerList from './components/DailyTrackerList';
import NotificationToast from './components/NotificationToast';
import InstallBanner from './components/InstallBanner';
import { api } from './services/api';
import { getDeviceId, setDeviceId } from './lib/deviceId';
import { notifications } from './lib/notifications';
import { sortVitamins, getLocalTodayStr } from './lib/dateUtils';
import { Heart, Cloud, Smartphone, Copy, Check, X, KeyRound } from 'lucide-react';

export default function App() {
  const [vitamins, setVitamins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Device sync modal state
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [inputSyncId, setInputSyncId] = useState('');

  // Fetch vitamins directly from Supabase for current device
  const fetchVitamins = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getVitamins();
      setVitamins(sortVitamins(data));
    } catch (err) {
      console.error('Supabase fetch error:', err);
      const errMsg = err.message || 'Unable to fetch records from Supabase.';
      setError(errMsg);
      setToast({
        type: 'error',
        title: 'Database Notice',
        message: errMsg,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVitamins();
  }, [fetchVitamins]);

  // Subscribe to real-time changes
  useEffect(() => {
    const sub = api.subscribeToChanges(() => {
      fetchVitamins();
    });

    return () => {
      if (sub && sub.unsubscribe) sub.unsubscribe();
    };
  }, [fetchVitamins]);

  // Periodic reminder checker for scheduled vitamins
  useEffect(() => {
    if (!notifications.isSupported()) return;

    const notifiedKeys = new Set();

    const checkInterval = setInterval(() => {
      const now = new Date();
      const todayStr = getLocalTodayStr(now);
      const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      vitamins.forEach((v) => {
        if (
          v.date === todayStr &&
          v.time === currentTimeStr &&
          !v.is_completed
        ) {
          const key = `${v.id}-${todayStr}-${currentTimeStr}`;
          if (!notifiedKeys.has(key)) {
            notifiedKeys.add(key);
            notifications.notify(v.name, v.time);
          }
        }
      });
    }, 30000);

    return () => clearInterval(checkInterval);
  }, [vitamins]);

  // Insert new vitamin(s) into Supabase (single or bulk)
  const handleAddVitamin = async (newVitaminOrRecords) => {
    setIsSubmitting(true);
    try {
      const created = await api.addVitamin(newVitaminOrRecords);
      const createdList = Array.isArray(created) ? created : [created];

      setVitamins((prev) => sortVitamins([...prev, ...createdList]));

      const count = createdList.length;
      const firstName = createdList[0]?.name || 'Vitamin';

      setToast({
        type: 'success',
        title: count > 1 ? 'Routine Scheduled' : 'Vitamin Scheduled',
        message:
          count > 1
            ? `"${firstName}" scheduled for ${count} consecutive days.`
            : `"${firstName}" was added to your schedule.`,
      });
      setError(null);
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Add Failed',
        message: err.message || 'Could not insert vitamin into Supabase.',
      });
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Checkbox Toggle (Optimistic Update with Supabase sync)
  const handleToggleCompleted = async (vitaminOrId, status) => {
    let id = vitaminOrId;
    let isCompleted = status;

    if (typeof vitaminOrId === 'object' && vitaminOrId !== null) {
      id = vitaminOrId.id;
      isCompleted = vitaminOrId.is_completed;
    } else if (typeof isCompleted !== 'boolean') {
      const existing = vitamins.find((v) => v.id === id);
      isCompleted = existing ? existing.is_completed : false;
    }

    const targetStatus = !isCompleted;
    const originalVitamins = [...vitamins];

    setVitamins((prev) =>
      prev.map((v) => (v.id === id ? { ...v, is_completed: targetStatus } : v))
    );

    try {
      await api.toggleCompleted(id, isCompleted);
    } catch (err) {
      setVitamins(originalVitamins);
      setToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update completion status in Supabase.',
      });
    }
  };

  // Update vitamin name / time
  const handleUpdateVitamin = async (id, updates) => {
    try {
      const updated = await api.updateVitamin(id, updates);
      setVitamins((prev) =>
        sortVitamins(prev.map((v) => (v.id === id ? { ...v, ...updated } : v)))
      );
      setToast({
        type: 'success',
        title: 'Routine Updated',
        message: `"${updated.name}" details saved.`,
      });
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Could not update vitamin details.',
      });
      throw err;
    }
  };

  // Delete vitamin entry from Supabase
  const handleDeleteVitamin = async (id) => {
    const itemToDelete = vitamins.find((v) => v.id === id);
    const originalVitamins = [...vitamins];

    setVitamins((prev) => prev.filter((v) => v.id !== id));

    try {
      await api.deleteVitamin(id);
      setToast({
        type: 'success',
        title: 'Entry Deleted',
        message: itemToDelete ? `"${itemToDelete.name}" was removed.` : 'Item deleted.',
      });
    } catch (err) {
      setVitamins(originalVitamins);
      setToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message || 'Could not delete item from Supabase.',
      });
    }
  };

  // Copy Device ID
  const handleCopyDeviceId = () => {
    const devId = getDeviceId();
    navigator.clipboard.writeText(devId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Sync with another Device ID
  const handleApplySyncId = (e) => {
    e.preventDefault();
    if (!inputSyncId.trim()) return;

    setDeviceId(inputSyncId.trim());
    setShowDeviceModal(false);
    setInputSyncId('');
    setToast({
      type: 'success',
      title: 'Device Synced',
      message: 'Switched to new device data.',
    });
    fetchVitamins();
  };

  const completedCount = vitamins.filter((v) => v.is_completed).length;

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-stone-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navbar */}
      <Navbar completedCount={completedCount} totalCount={vitamins.length} />

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Progress & Motivation Stats Card */}
        <StatsCard vitamins={vitamins} />

        {/* Add Entry Form */}
        <AddVitaminForm onAdd={handleAddVitamin} isSubmitting={isSubmitting} />

        {/* Daily Tracker List with Quick Toggle, Edit, Export & Filters */}
        <DailyTrackerList
          vitamins={vitamins}
          isLoading={isLoading}
          error={error}
          onToggle={handleToggleCompleted}
          onDelete={handleDeleteVitamin}
          onUpdate={handleUpdateVitamin}
          onRefresh={fetchVitamins}
        />
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-stone-200/60 py-6 text-center text-xs text-stone-400">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <p className="flex items-center justify-center gap-1.5">
            <span className="font-semibold text-stone-600">Vitality</span>
            <span>•</span>
            <span>Daily Vitamin & Habit Tracker</span>
            <span>•</span>
            <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
              <Heart className="w-3 h-3 fill-emerald-500" /> Live Well
            </span>
          </p>
          <span className="hidden sm:inline text-stone-300">|</span>
          <button
            type="button"
            onClick={() => setShowDeviceModal(true)}
            className="inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-800 transition-colors underline-offset-2 hover:underline"
            title="Manage private device storage"
          >
            <Smartphone className="w-3 h-3 text-stone-400" /> Private Device Storage
          </button>
          <span className="hidden sm:inline text-stone-300">|</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-stone-400">
            <Cloud className="w-3 h-3 text-emerald-600" /> Powered by Supabase
          </span>
        </div>
      </footer>

      {/* Device Storage Modal */}
      {showDeviceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-stone-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-stone-800">Private Device ID</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDeviceModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              Your routine is securely isolated to this device. To sync with your other phone or tablet without creating an account, copy this ID:
            </p>

            {/* Current Device ID Box */}
            <div className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
              <span className="text-xs font-mono text-stone-700 truncate flex-1 select-all">
                {getDeviceId()}
              </span>
              <button
                type="button"
                onClick={handleCopyDeviceId}
                className="text-xs px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors flex items-center gap-1 font-medium shadow-xs"
              >
                {copiedId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-stone-400" />}
                <span>{copiedId ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Sync from another device */}
            <form onSubmit={handleApplySyncId} className="pt-2 border-t border-stone-100 space-y-2">
              <label className="block text-[11px] font-medium text-stone-500">
                Sync from another device:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste device ID here"
                  value={inputSyncId}
                  onChange={(e) => setInputSyncId(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={!inputSyncId.trim()}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <NotificationToast toast={toast} onClose={() => setToast(null)} />

      {/* PWA Install Banner */}
      <InstallBanner />
    </div>
  );
}
