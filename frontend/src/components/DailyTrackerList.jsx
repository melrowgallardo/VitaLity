import React, { useState, useEffect, useMemo } from 'react';
import VitaminItem from './VitaminItem';
import {
  Search,
  Filter,
  CheckCircle2,
  ListFilter,
  AlertCircle,
  RefreshCw,
  CalendarDays,
  Download,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  getLocalTodayStr,
  getLocalYesterdayStr,
  compareVitamins,
  getDateSortTier,
  getDateSectionInfo,
} from '../lib/dateUtils';

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

  // Track today and yesterday in user's local timezone
  const [todayStr, setTodayStr] = useState(() => getLocalTodayStr());
  const [yesterdayStr, setYesterdayStr] = useState(() => getLocalYesterdayStr());

  // Check every 30 seconds for midnight roll-over in the user's local timezone
  useEffect(() => {
    const checkMidnight = () => {
      const currentLocalToday = getLocalTodayStr();
      if (currentLocalToday !== todayStr) {
        setTodayStr(currentLocalToday);
        setYesterdayStr(getLocalYesterdayStr());
      }
    };

    const interval = setInterval(checkMidnight, 30000);
    return () => clearInterval(interval);
  }, [todayStr]);

  // Filter and search logic
  const filteredVitamins = useMemo(() => {
    const list = vitamins.filter((item) => {
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

    // Sort entries: Today first, Yesterday second, older dates descending, then chronological by time
    return [...list].sort((a, b) => compareVitamins(a, b, todayStr, yesterdayStr));
  }, [vitamins, searchQuery, activeFilter, todayStr, yesterdayStr]);

  // Group entries by date for the schedule view
  const dateGroups = useMemo(() => {
    if (filteredVitamins.length === 0 && !(!searchQuery.trim() && (activeFilter === 'all' || activeFilter === 'today') && vitamins.length > 0)) {
      return [];
    }

    const groupsMap = new Map();

    // Ensure Today is anchored at the top when viewing 'all' or 'today' and not searching
    const shouldAnchorToday = !searchQuery.trim() && (activeFilter === 'all' || activeFilter === 'today') && vitamins.length > 0;
    if (shouldAnchorToday) {
      groupsMap.set(todayStr, []);
    }

    // Populate items into groups
    filteredVitamins.forEach((item) => {
      const dateKey = item.date || todayStr;
      if (!groupsMap.has(dateKey)) {
        groupsMap.set(dateKey, []);
      }
      groupsMap.get(dateKey).push(item);
    });

    // Convert map to array and compute metadata
    const groups = Array.from(groupsMap.entries()).map(([date, items]) => ({
      date,
      items,
      info: getDateSectionInfo(date, todayStr, yesterdayStr),
    }));

    // Sort date groups:
    // 1. "Today" always first at the top
    // 2. "Yesterday" immediately below
    // 3. Older dates in descending order (newest to oldest)
    // 4. Future dates (if any)
    groups.sort((a, b) => {
      const tierA = getDateSortTier(a.date, todayStr, yesterdayStr);
      const tierB = getDateSortTier(b.date, todayStr, yesterdayStr);

      if (tierA !== tierB) {
        return tierA - tierB;
      }

      if (tierA === 3) {
        // Older dates: newest first (e.g. 2026-11-11 before 2026-11-10)
        return b.date.localeCompare(a.date);
      }

      if (tierA === 4) {
        // Future dates: nearest first
        return a.date.localeCompare(b.date);
      }

      return 0;
    });

    return groups;
  }, [filteredVitamins, todayStr, yesterdayStr, activeFilter, searchQuery, vitamins.length]);

  // Export to CSV
  const handleExportCSV = () => {
    if (vitamins.length === 0) return;

    // Use sorted items for CSV export
    const sorted = [...vitamins].sort((a, b) => compareVitamins(a, b, todayStr, yesterdayStr));

    const headers = ['ID', 'Name', 'Date', 'Time', 'Completed'];
    const rows = sorted.map((v) => [
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

  // Counters for tabs using local today
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
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
                ? 'bg-white text-emerald-800 shadow-xs'
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
      {!isLoading && filteredVitamins.length === 0 && dateGroups.length === 0 && (
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
              : activeFilter === 'today'
              ? 'No vitamins scheduled for today. Use the form above to add one!'
              : 'Add your first vitamin or supplement above to begin tracking.'}
          </p>
        </div>
      )}

      {/* Date Groups (Today first, Yesterday second, older dates descending) */}
      <div className="space-y-6">
        {dateGroups.map((group) => {
          const isToday = group.date === todayStr;
          const isYesterday = group.date === yesterdayStr;
          const completedCount = group.items.filter((i) => i.is_completed).length;
          const totalCount = group.items.length;

          return (
            <section key={group.date} className="space-y-2.5">
              {/* Date Group Header */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  {isToday ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Today
                    </span>
                  ) : isYesterday ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                      Yesterday
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-stone-800">
                      {group.info.title}
                    </span>
                  )}
                  <span className="text-xs text-stone-400 font-medium">
                    {group.info.formattedDate}
                  </span>
                </div>

                {totalCount > 0 ? (
                  <span className="text-[11px] font-medium text-stone-400">
                    {completedCount}/{totalCount} completed
                  </span>
                ) : null}
              </div>

              {/* Items in this date group */}
              <div className="space-y-2.5">
                {group.items.length > 0 ? (
                  group.items.map((item) => (
                    <VitaminItem
                      key={item.id}
                      vitamin={item}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onUpdate={onUpdate}
                    />
                  ))
                ) : (
                  /* Empty state for Today when other dates exist */
                  <div className="text-xs text-stone-400 py-3.5 px-4 rounded-xl border border-dashed border-stone-200 bg-stone-50/60 text-center">
                    No vitamins scheduled for today yet. Use the form above to add today's routine.
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
