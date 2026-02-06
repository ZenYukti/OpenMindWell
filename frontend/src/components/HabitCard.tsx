import React from 'react';

interface HabitCardProps {
  habit: {
    id: string;
    name: string;
    description?: string;
    frequency: 'daily' | 'weekly';
    created_at: string;
  };
  streak: number;
  isCheckedInToday: boolean;
  onCheckIn: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function HabitCard({
  habit,
  streak,
  isCheckedInToday,
  onCheckIn,
  onEdit,
  onDelete,
}: HabitCardProps) {
  return (
    <div className="habit-card card hover:shadow-lg transition-all duration-300">
      {/* Header with name and actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{habit.name}</h3>
          {habit.description && (
            <p className="text-sm text-gray-500 mt-1">{habit.description}</p>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
            title="Edit habit"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete habit"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Streak Display */}
      <div className="streak-badge mb-4">
        <span className="text-2xl">🔥</span>
        <span className="streak-count">{streak}</span>
        <span className="streak-label">day streak</span>
      </div>

      {/* Frequency Badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full capitalize">
          {habit.frequency}
        </span>
      </div>

      {/* Check-in Button */}
      {isCheckedInToday ? (
        <div className="w-full py-3 px-4 bg-green-100 text-green-700 rounded-lg text-center font-medium flex items-center justify-center gap-2">
          <span className="text-lg">✓</span>
          Done today!
        </div>
      ) : (
        <button
          onClick={onCheckIn}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <span>✓</span>
          Check In
        </button>
      )}
    </div>
  );
}
