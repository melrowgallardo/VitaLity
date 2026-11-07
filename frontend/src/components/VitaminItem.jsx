import React, { useState } from 'react';
import { Check, Trash2, Clock, Calendar, Pencil, X, Loader2 } from 'lucide-react';

export default function VitaminItem({ vitamin, onToggle, onDelete, onUpdate }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { id, name, date, time, is_completed } = vitamin;

  const [editName, setEditName] = useState(name);
  const [editTime, setEditTime] = useState(time || '08:00');

  // Format time nicely to 12-hour AM/PM
  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  // Determine date badge (Today, Yesterday, Tomorrow, or formatted date)
  const getDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const target = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';

    return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleDeleteClick = async () => {
    if (!showConfirmDelete) {
      setShowConfirmDelete(true);
      return;
    }

    try {
      setIsDeleting(true);
      await onDelete(id);
    } catch {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !onUpdate) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      await onUpdate(id, {
        name: editName.trim(),
        time: editTime,
      });
      setIsEditing(false);
    } catch {
      // Handled in parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 ${
        is_completed
          ? 'bg-emerald-50/70 border-emerald-200/80 shadow-xs'
          : 'bg-white border-stone-200/80 hover:border-stone-300 hover:shadow-xs'
      }`}
    >
      {isEditing ? (
        /* Inline Edit Form */
        <form onSubmit={handleSaveEdit} className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            disabled={isSaving}
            placeholder="Vitamin name"
            className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
            autoFocus
          />
          <input
            type="time"
            value={editTime}
            onChange={(e) => setEditTime(e.target.value)}
            disabled={isSaving}
            className="w-28 px-2 py-1.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl text-stone-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
          />
          <div className="flex items-center gap-1 justify-end">
            <button
              type="submit"
              disabled={isSaving || !editName.trim()}
              className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
              title="Save changes"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditName(name);
                setEditTime(time || '08:00');
                setIsEditing(false);
              }}
              disabled={isSaving}
              className="p-1.5 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Left side: Checkbox and Details */}
          <div className="flex items-center gap-3.5 min-w-0 flex-1">
            {/* Quick Checkbox Toggle Button */}
            <button
              type="button"
              onClick={() => onToggle(vitamin)}
              aria-label={is_completed ? 'Mark as incomplete' : 'Mark as complete'}
              className={`flex-shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-200 ${
                is_completed
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'border-stone-300 bg-white hover:border-emerald-500 hover:bg-emerald-50/30'
              }`}
            >
              {is_completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
            </button>

            {/* Vitamin Name and Time/Date Meta */}
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium tracking-tight truncate transition-all duration-200 ${
                  is_completed
                    ? 'line-through text-stone-400 font-normal'
                    : 'text-stone-800'
                }`}
              >
                {name}
              </p>

              <div className="flex items-center gap-3 mt-1 text-xs">
                <span
                  className={`inline-flex items-center gap-1 font-medium ${
                    is_completed ? 'text-emerald-700/80' : 'text-stone-500'
                  }`}
                >
                  <Clock className="w-3 h-3 text-stone-400" />
                  {formatTimeDisplay(time)}
                </span>

                <span className="text-stone-300">•</span>

                <span
                  className={`inline-flex items-center gap-1 ${
                    is_completed ? 'text-emerald-700/70' : 'text-stone-400'
                  }`}
                >
                  <Calendar className="w-3 h-3 text-stone-300" />
                  {getDateLabel(date)}
                </span>

                {is_completed && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded-md">
                    Taken
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right side: Actions (Edit & Delete) */}
          <div className="flex items-center gap-1 pl-2">
            {showConfirmDelete ? (
              <div className="flex items-center gap-1 animate-fadeIn">
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="text-xs px-2 py-1 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors shadow-xs"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="text-xs px-2 py-1 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  aria-label={`Edit ${name}`}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors opacity-70 sm:opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Edit details"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  aria-label={`Delete ${name}`}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-70 sm:opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Delete entry"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
