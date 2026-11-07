import React, { useState, useMemo } from 'react';
import VitaminItem from './VitaminItem';
import { Search, Filter, CheckCircle2, ListFilter, AlertCircle, RefreshCw, CalendarDays, Download } from 'lucide-react';

export default function DailyTrackerList({
  vitamins = [],
  isLoading = false,
  error = null,
  onToggle,
  onDelete,
  onUpdate,
  onRefresh,
}) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'today', 'pending', 'completed'
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter and search logic
  const filteredVitamins = useMemo(() => {
    return vitamins.filter((item) => {
      // Search matching
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase().trim());
      if (!matchesSearch) return false;

      // Filter tabs
      if (activeFilter === 'today') {
        return item.date === todayStr;
      }
      if (activeFilter === 'pending') {
        return !item.is_completed;
      }
      if (activeFilter === 'completed') {
        return item.is_completed;
      }

      return true; // 'all'
    });
  }, [vitamins, searchQuery, activeFilter, todayStr]);

  // Export to CSV
  const handleExportCSV = () => {
    if (vitamins.length === 0) return;

    const headers = ['ID', 'Name', 'Date', 'Time', 'Completed'];
    const rows = vitamins.map((v) => [
      v.id,
      `"${v.name.replace(/"/g, '""')}"`,
      v.date,
      v.time,
      v.is_completed ? 'YES' : 'NO',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vitality_routine_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Counters for tabs
  const countAll = vitamins.length;
  const countToday = vitamins.filter((v) => v.date === todayStr).length;
  const countPending = vitamins.filter((v) => !v.is_completed).length;
  const countCompleted = vitamins.filter((v) => v.is_completed).length;

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-semibold text-stone-900 tracking-tight flex items-center gap-2">
            <span>Scheduled Routine</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
              {filteredVitamins.length}
            </span>
          </h2>
          <p className="text-xs text-stone-400">Track and log your daily vitamins on schedule</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export CSV */}
          {vitamins.length > 0 && (
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-all"
              title="Export vitamins to CSV"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}

          {/* Refresh Action */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl transition-all"
            title="Refresh schedule"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-stone-50 p-1 rounded-xl border border-stone-200/70 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`text-xs px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeFilter === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            All ({countAll})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('today')}
            className={`text-xs px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeFilter === 'today'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Today ({countToday})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('pending')}
            className={`text-xs px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeFilter === 'pending'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Pending ({countPending})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('completed')}
            className={`text-xs px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
              activeFilter === 'completed'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Completed ({countCompleted})
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative sm:w-56">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vitamins..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50/50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all"
          />
        </div>
      </div>

      {/* Loading Skeleton State */}
      {isLoading && vitamins.length === 0 && (
        <div className="space-y-2 py-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="animate-pulse flex items-center justify-between p-4 rounded-2xl border border-stone-100 bg-stone-50/60"
            >
              <div className="flex items-center gap-3.5 flex-1">
                <div className="w-6 h-6 rounded-lg bg-stone-200" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-stone-200 rounded w-1/3" />
                  <div className="h-3 bg-stone-100 rounded w-1/4" />
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-stone-100" />
            </div>
          ))}
        </div>
      )}

      {/* Error State Banner */}
      {error && (
        <div className="mb-4 p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Database Notice</p>
            <p className="mt-0.5 text-amber-800">{error}</p>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="text-xs font-semibold underline hover:text-amber-950 ml-2"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredVitamins.length === 0 && (
        <div className="text-center py-12 px-4 border border-dashed border-stone-200 rounded-2xl bg-stone-50/40">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 mx-auto flex items-center justify-center mb-3">
            <CalendarDays className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-stone-700">No scheduled entries found</h3>
          <p className="text-xs text-stone-400 max-w-xs mx-auto mt-1">
            {searchQuery
              ? `No vitamins match "${searchQuery}". Try clearing the search.`
              : activeFilter === 'completed'
              ? 'No completed items yet. Check off items as you take them!'
              : activeFilter === 'pending'
              ? 'All caught up! No pending items remaining.'
              : 'Add your first vitamin or supplement above to begin tracking.'}
          </p>
        </div>
      )}

      {/* List of Items */}
      <div className="space-y-2.5">
        {filteredVitamins.map((item) => (
          <VitaminItem
            key={item.id}
            vitamin={item}
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ))}
      </div>
    </div>
  );
}
