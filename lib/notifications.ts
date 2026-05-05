import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { SLOTS, type SlotId } from '@/constants/slots';
import {
  getDosesForDate,
  today,
  type DoseSchedule,
  type Medicine,
} from '@/lib/schedule';
import { useMedicationLog, useMedicines } from '@/lib/queries';
import type { MedicationLogEntry } from '@/lib/api';

// ---------------------------------------------------------------------------
// Foreground notification handler — show banners while the app is open too.
// ---------------------------------------------------------------------------

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  if (!existing.canAskAgain) return false;
  const req = await Notifications.requestPermissionsAsync();
  return req.granted;
}

// ---------------------------------------------------------------------------
// Native scheduling
// ---------------------------------------------------------------------------

export async function scheduleAllReminders(meds: Medicine[]): Promise<void> {
  if (Platform.OS === 'web') {
    // Web reminders run via the polling loop in startWebReminderLoop — nothing to schedule.
    return;
  }
  // Cancel everything we previously scheduled, then re-schedule.
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const med of meds) {
    if (!med.reminderTime) continue;
    const [h, m] = med.reminderTime.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) continue;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'RheumaTrack 💊',
        body: `Take ${med.drugName} (${med.brandName} ${med.dose})`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: h,
        minute: m,
      },
    });
  }
}

// ---------------------------------------------------------------------------
// Web polling loop
// ---------------------------------------------------------------------------

export interface WebReminderContext {
  meds: Medicine[];
  log: Record<string, boolean>; // key: `${dateStr}_${medId}_${slot}` → bool
  todayStr: string; // 'YYYY-MM-DD'
  getDosesForDate: (med: Medicine, ds: string) => DoseSchedule | null;
  slots: readonly SlotId[];
}

let webIntervalId: ReturnType<typeof setInterval> | null = null;

export function startWebReminderLoop(
  getCtx: () => WebReminderContext,
): () => void {
  if (Platform.OS !== 'web') return () => {};
  if (typeof window === 'undefined' || !('Notification' in window)) return () => {};
  if (Notification.permission !== 'granted') return () => {};
  const tick = () => {
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const ctx = getCtx();
    for (const med of ctx.meds) {
      if (med.reminderTime !== hhmm) continue;
      const doses = ctx.getDosesForDate(med, ctx.todayStr);
      if (!doses) continue;
      const dueSlots = ctx.slots.filter((s) => (doses[s] ?? 0) > 0);
      if (dueSlots.length === 0) continue;
      const allTaken = dueSlots.every(
        (s) => ctx.log[`${ctx.todayStr}_${med.id}_${s}`],
      );
      if (allTaken) continue;
      try {
        new Notification('RheumaTrack 💊', {
          body: `Take ${med.drugName} (${med.brandName} ${med.dose})`,
        });
      } catch {
        /* swallow — Notification API can throw if permission is revoked mid-session */
      }
    }
  };
  if (webIntervalId !== null) clearInterval(webIntervalId);
  webIntervalId = setInterval(tick, 60_000);
  return () => {
    if (webIntervalId !== null) clearInterval(webIntervalId);
    webIntervalId = null;
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

function reduceLog(entries: MedicationLogEntry[]): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const e of entries) {
    out[`${e.logDate}_${e.medicineId}_${e.slot}`] = e.taken;
  }
  return out;
}

export function useReminderScheduler(): void {
  const medsQ = useMedicines();
  const logQ = useMedicationLog(today(), today());

  // Native: re-schedule whenever meds change.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const meds = medsQ.data;
    if (!meds) return;
    let cancelled = false;
    (async () => {
      const perm = await Notifications.getPermissionsAsync();
      if (cancelled || !perm.granted) return;
      await scheduleAllReminders(meds);
    })();
    return () => {
      cancelled = true;
    };
  }, [medsQ.data]);

  // Web: poll every minute.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    if (!medsQ.data) return;
    const stop = startWebReminderLoop(() => ({
      meds: medsQ.data ?? [],
      log: reduceLog(logQ.data ?? []),
      todayStr: today(),
      getDosesForDate,
      slots: SLOTS,
    }));
    return stop;
  }, [medsQ.data, logQ.data]);
}
