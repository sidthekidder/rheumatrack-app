export type SlotId = 'morning' | 'afternoon' | 'evening' | 'night';

export interface SlotMeta {
  id: SlotId;
  emoji: string;
  time: string;
  bg: string;
  border: string;
  accent: string;
  text: string;
  label: string;
}

export const SLOTS: readonly SlotId[] = ['morning', 'afternoon', 'evening', 'night'];

export const TS_DATA: readonly SlotMeta[] = [
  { id: 'morning', emoji: '🌅', time: '8:00 AM', bg: '#FFFBEB', border: '#F59E0B', accent: '#D97706', text: '#92400E', label: 'Morning' },
  { id: 'afternoon', emoji: '☀️', time: '1:00 PM', bg: '#EFF6FF', border: '#3B82F6', accent: '#2563EB', text: '#1E40AF', label: 'Afternoon' },
  { id: 'evening', emoji: '🌆', time: '6:00 PM', bg: '#FFF1F2', border: '#F43F5E', accent: '#E11D48', text: '#9F1239', label: 'Evening' },
  { id: 'night', emoji: '🌙', time: '9:00 PM', bg: '#F5F3FF', border: '#8B5CF6', accent: '#7C3AED', text: '#4C1D95', label: 'Night' },
];
