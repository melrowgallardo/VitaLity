import React, { useState } from 'react';
import { Plus, Clock, Calendar, Pill, Sparkles, Loader2 } from 'lucide-react';
import { getLocalTodayStr } from '../lib/dateUtils';

const QUICK_SUGGESTIONS = [
  'Vitamin D3',
  'Omega-3 Fish Oil',
  'Magnesium Glycinate',
  'Multivitamin',
  'Vitamin C 1000mg',
  'Zinc 50mg',
  'B-Complex',
  'Ashwagandha',
];

const TIME_PRESETS = [
  { label: 'Morning', time: '08:00' },
  { label: 'Noon', time: '12:00' },
  { label: 'Evening', time: '18:00' },
  { label: 'Bedtime', time: '21:30' },
];

export default function AddVitaminForm({ onAdd, isSubmitting = false }) {
  // Today's date in local YYYY-MM-DD
  const today = getLocalTodayStr();
  
  // Current time formatted as HH:MM
  const now = new Date();
  const defaultTime = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  const [name, setName] = useState('');
  const [date, setDate] = useState(today);
  const [time, setTime] = useState(defaultTime);
  const [error, setError] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter a vitamin or habit name.');
      return;
    }
    if (!date) {
      setError('Please select a scheduled date.');
      return;
    }
    if (!time) {
      setError('Please select a reminder time.');
      return;
    }

    try {
      await onAdd({
        name: name.trim(),
        date,
        time,
      });

      // Reset form upon successful addition
      setName('');
      setTime(defaultTime);
      setIsExpanded(false);
    } catch (err) {
      setError(err.message || 'Failed to add entry. Please try again.');
    }
  };

  const handleQuickAdd = (suggestion) => {
    setName(suggestion);
    setIsExpanded(true);
  };

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs mb-8 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-semibold text-xs border border-emerald-100">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-stone-900">Schedule Vitamin or Habit</h2>
            <p className="text-xs text-stone-400">Add a new daily supplement or reminder</p>
          </div>
        </div>

        {/* Toggle quick presets */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          {isExpanded ? 'Hide Suggestions' : 'Quick Suggestions'}
        </button>
      </div>

      {/* Quick Suggestions Chips */}
      {isExpanded && (
        <div className="mb-4 p-3 rounded-xl bg-stone-50/80 border border-stone-100 animate-fadeIn">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" /> Popular Supplements
          </p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SUGGESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleQuickAdd(item)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  name === item
                    ? 'bg-emerald-600 text-white border-emerald-600 font-medium'
                    : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-2.5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Vitamin Name */}
          <div className="sm:col-span-6">
            <label className="block text-xs font-medium text-stone-500 mb-1">
              Vitamin / Habit Name
            </label>
            <div className="relative">
              <Pill className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Vitamin Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50/50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-3 focus:ring-emerald-500/10 transition-all"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Date (Defaults to Today) */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-stone-500 mb-1">Date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50/50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-3 focus:ring-emerald-500/10 transition-all"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Time */}
          <div className="sm:col-span-3">
            <label className="block text-xs font-medium text-stone-500 mb-1">Time</label>
            <div className="relative">
              <Clock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50/50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-3 focus:ring-emerald-500/10 transition-all"
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Quick Time Preset Buttons & Submit Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-medium text-stone-400 mr-1">Time Presets:</span>
            {TIME_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setTime(p.time)}
                className={`text-xs px-2 py-0.5 rounded-md border font-normal transition-colors ${
                  time === p.time
                    ? 'bg-stone-800 text-white border-stone-800'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !name.trim()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Add to Schedule</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

