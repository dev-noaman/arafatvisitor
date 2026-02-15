/**
 * DateTimePicker Component
 * Modal-based date/time picker with increment/decrement controls.
 * Uses no native date picker libraries -- pure React Native UI.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { useUIStore } from '../../store/uiStore';

interface DateTimePickerProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
  error?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Format a Date to a human-readable string like "Feb 15, 2026 2:30 PM"
 */
function formatDateTime(date: Date): string {
  const month = MONTHS_SHORT[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const minuteStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${month} ${day}, ${year}  ${hours}:${minuteStr} ${ampm}`;
}

/**
 * Pad a number to two digits.
 */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/**
 * Clamp a date so it is not before the minimum.
 */
function clampDate(date: Date, min?: Date): Date {
  if (min && date.getTime() < min.getTime()) {
    return new Date(min.getTime());
  }
  return date;
}

/**
 * Get the number of days in a given month/year.
 */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  value,
  onChange,
  minimumDate,
  error,
}) => {
  const isDarkMode = useUIStore((state) => state.isDarkMode);

  const [isOpen, setIsOpen] = useState(false);
  // Working copy of the date while the modal is open
  const [draft, setDraft] = useState<Date>(new Date(value.getTime()));

  const openModal = useCallback(() => {
    setDraft(new Date(value.getTime()));
    setIsOpen(true);
  }, [value]);

  const handleConfirm = useCallback(() => {
    const clamped = clampDate(draft, minimumDate);
    onChange(clamped);
    setIsOpen(false);
  }, [draft, minimumDate, onChange]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  // ---- Adjustment helpers ----

  const adjustDay = useCallback((delta: number) => {
    setDraft((prev) => {
      const next = new Date(prev.getTime());
      next.setDate(next.getDate() + delta);
      return clampDate(next, minimumDate);
    });
  }, [minimumDate]);

  const adjustMonth = useCallback((delta: number) => {
    setDraft((prev) => {
      const next = new Date(prev.getTime());
      const targetMonth = next.getMonth() + delta;
      next.setMonth(targetMonth);
      // Clamp day if the target month has fewer days
      const maxDay = daysInMonth(next.getFullYear(), next.getMonth());
      if (next.getDate() > maxDay) {
        next.setDate(maxDay);
      }
      return clampDate(next, minimumDate);
    });
  }, [minimumDate]);

  const adjustYear = useCallback((delta: number) => {
    setDraft((prev) => {
      const next = new Date(prev.getTime());
      next.setFullYear(next.getFullYear() + delta);
      const maxDay = daysInMonth(next.getFullYear(), next.getMonth());
      if (next.getDate() > maxDay) {
        next.setDate(maxDay);
      }
      return clampDate(next, minimumDate);
    });
  }, [minimumDate]);

  const adjustHour = useCallback((delta: number) => {
    setDraft((prev) => {
      const next = new Date(prev.getTime());
      next.setHours(next.getHours() + delta);
      return clampDate(next, minimumDate);
    });
  }, [minimumDate]);

  const adjustMinute = useCallback((delta: number) => {
    setDraft((prev) => {
      const next = new Date(prev.getTime());
      next.setMinutes(next.getMinutes() + delta);
      return clampDate(next, minimumDate);
    });
  }, [minimumDate]);

  // ---- Derived display values from draft ----

  const draftHours = draft.getHours();
  const displayHour = draftHours % 12 === 0 ? 12 : draftHours % 12;
  const displayMinute = pad2(draft.getMinutes());
  const displayAmPm = draftHours >= 12 ? 'PM' : 'AM';

  return (
    <View className="mb-4">
      {label ? (
        <Text className="text-sm font-outfit-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </Text>
      ) : null}

      {/* Touchable field that shows current value */}
      <TouchableOpacity
        className={`flex-row items-center justify-between border rounded-xl px-4 py-3 min-h-[48px] ${error ? 'border-error-500 bg-error-50 dark:bg-error-900/10'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-elem'
          }`}
        activeOpacity={0.7}
        onPress={openModal}
      >
        <Text className="text-base text-gray-900 dark:text-white font-outfit flex-1">
          {formatDateTime(value)}
        </Text>
        {/* Calendar icon */}
        <Text className="text-lg text-gray-400 dark:text-gray-500 ml-2">
          {'\u{1F4C5}'}
        </Text>
      </TouchableOpacity>

      {error ? (
        <Text className="text-xs text-error-500 mt-1 font-outfit">
          {error}
        </Text>
      ) : null}

      {/* ---- Modal ---- */}
      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View className="flex-1 justify-center items-center p-6 bg-black/60">
          <View className="w-full max-w-sm bg-white dark:bg-dark-elem rounded-2xl p-6 shadow-xl">
            {/* Title */}
            <Text className="text-lg font-outfit-bold text-gray-900 dark:text-white text-center mb-1">
              Select Date & Time
            </Text>

            {/* Preview of selected value */}
            <Text className="text-base font-outfit-bold text-brand-500 text-center mb-5">
              {formatDateTime(draft)}
            </Text>

            {/* ---- Date row ---- */}
            <Text className="text-xs font-outfit-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              Date
            </Text>
            <View className="flex-row justify-center gap-3 mb-5">
              <AdjustColumn
                label="Month"
                value={MONTHS[draft.getMonth()]}
                onIncrement={() => adjustMonth(1)}
                onDecrement={() => adjustMonth(-1)}
              />
              <AdjustColumn
                label="Day"
                value={String(draft.getDate())}
                onIncrement={() => adjustDay(1)}
                onDecrement={() => adjustDay(-1)}
              />
              <AdjustColumn
                label="Year"
                value={String(draft.getFullYear())}
                onIncrement={() => adjustYear(1)}
                onDecrement={() => adjustYear(-1)}
              />
            </View>

            {/* ---- Time row ---- */}
            <Text className="text-xs font-outfit-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
              Time
            </Text>
            <View className="flex-row justify-center gap-3 mb-5">
              <AdjustColumn
                label="Hour"
                value={String(displayHour)}
                onIncrement={() => adjustHour(1)}
                onDecrement={() => adjustHour(-1)}
              />
              <AdjustColumn
                label="Min"
                value={displayMinute}
                onIncrement={() => adjustMinute(5)}
                onDecrement={() => adjustMinute(-5)}
              />
              <AdjustColumn
                label=""
                value={displayAmPm}
                onIncrement={() => adjustHour(12)}
                onDecrement={() => adjustHour(-12)}
              />
            </View>

            {/* ---- Buttons ---- */}
            <View className="flex-row gap-3 mt-1">
              <TouchableOpacity
                className="flex-1 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 items-center"
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text className="text-base font-outfit-bold text-gray-600 dark:text-gray-300">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3.5 rounded-xl bg-brand-500 items-center"
                onPress={handleConfirm}
                activeOpacity={0.7}
              >
                <Text className="text-base font-outfit-bold text-white">Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ---- Sub-component: a single column with up/value/down ----

interface AdjustColumnProps {
  label: string;
  value: string;
  onIncrement: () => void;
  onDecrement: () => void;
}

const AdjustColumn: React.FC<AdjustColumnProps> = ({
  label,
  value,
  onIncrement,
  onDecrement,
}) => (
  <View className="items-center flex-1">
    {label ? (
      <Text className="text-[10px] font-outfit-medium text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wide">
        {label}
      </Text>
    ) : (
      <Text className="text-[10px] font-outfit-medium text-transparent mb-1.5">
        {/* spacer to keep alignment */}
        {'X'}
      </Text>
    )}
    <TouchableOpacity
      className="w-full items-center justify-center py-2 rounded-lg bg-brand-50 dark:bg-brand-900/20 active:bg-brand-100 dark:active:bg-brand-900/40"
      onPress={onIncrement}
      activeOpacity={0.6}
    >
      <Text className="text-xs font-bold text-brand-600 dark:text-brand-400">{'\u25B2'}</Text>
    </TouchableOpacity>
    <View className="w-full items-center justify-center py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg my-1">
      <Text
        className="text-base font-outfit-bold text-gray-900 dark:text-white"
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
    <TouchableOpacity
      className="w-full items-center justify-center py-2 rounded-lg bg-brand-50 dark:bg-brand-900/20 active:bg-brand-100 dark:active:bg-brand-900/40"
      onPress={onDecrement}
      activeOpacity={0.6}
    >
      <Text className="text-xs font-bold text-brand-600 dark:text-brand-400">{'\u25BC'}</Text>
    </TouchableOpacity>
  </View>
);
