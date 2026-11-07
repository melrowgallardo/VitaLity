import React from 'react';
import { Zap, Sparkles } from 'lucide-react';

export default function StatsCard({ vitamins = [] }) {
  const total = vitamins.length;
  const completed = vitamins.filter((v) => v.is_completed).length;
  const pending = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isGoalReached = total > 0 && percentage === 100;

  let motivation = 'Add your vitamins and supplements to get started today.';
  if (total > 0 && percentage === 0) {
    motivation = 'Ready to begin your morning routine? First dose awaits!';
  } else if (percentage > 0 && percentage < 50) {
    motivation = 'Good momentum! Keep up your daily health routine.';
  } else if (percentage >= 50 && percentage < 100) {
    motivation = "More than halfway done! You're taking great care of yourself.";
  } else if (isGoalReached) {
    motivation = 'All vitamins completed today! Remarkable consistency and vitality!';
  }

  return (
    <div
      className={`rounded-2xl p-5 shadow-xs mb-8 transition-all duration-300 ${
        isGoalReached
          ? 'bg-gradient-to-br from-white via-white to-emerald-50/50 border border-emerald-300/80 ring-3 ring-emerald-500/10'
          : 'bg-white border border-stone-200/80'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-700 tracking-wider uppercase flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
              Today's Progress
            </span>
            {isGoalReached && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-emerald-600" /> All Done
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-stone-600 mt-0.5">{motivation}</p>
        </div>

        <div className="flex items-baseline gap-1 sm:self-center">
          <span className="text-2xl font-bold tracking-tight text-stone-900">{percentage}%</span>
          <span className="text-xs font-medium text-stone-400">completed</span>
        </div>
      </div>

      {/* Modern Slim Progress Bar */}
      <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden p-0.5">
        <div
          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Mini metric counters */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-stone-100 text-center">
        <div className="p-2 rounded-xl bg-stone-50/70">
          <span className="text-xs text-stone-400 font-medium block">Total</span>
          <span className="text-base font-bold text-stone-800">{total}</span>
        </div>
        <div className="p-2 rounded-xl bg-emerald-50/50">
          <span className="text-xs text-emerald-600 font-medium block">Completed</span>
          <span className="text-base font-bold text-emerald-700">{completed}</span>
        </div>
        <div className="p-2 rounded-xl bg-amber-50/50">
          <span className="text-xs text-amber-600 font-medium block">Pending</span>
          <span className="text-base font-bold text-amber-700">{pending}</span>
        </div>
      </div>
    </div>
  );
}
