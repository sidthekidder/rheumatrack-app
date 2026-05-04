import { supabase } from './supabase';
import type {
  DoseSchedule,
  Medicine,
  ScheduleType,
  SlotId,
  TaperingPhase,
} from './schedule';

export type { DoseSchedule, Medicine, ScheduleType, SlotId, TaperingPhase };

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

// ---------------------------------------------------------------------------
// Case conversion (snake_case <-> camelCase) — keys only, values untouched.
// ---------------------------------------------------------------------------

const snakeToCamel = (s: string): string =>
  s.replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());

const camelToSnake = (s: string): string =>
  s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

const isPlainObject = (v: unknown): v is Record<string, unknown> => {
  if (v === null || typeof v !== 'object') return false;
  if (Array.isArray(v)) return false;
  if (v instanceof Date) return false;
  // Skip Blob / File / FormData / ArrayBuffer-ish
  if (typeof Blob !== 'undefined' && v instanceof Blob) return false;
  if (typeof FormData !== 'undefined' && v instanceof FormData) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
};

function transformKeys<T = unknown>(input: unknown, fn: (k: string) => string): T {
  if (Array.isArray(input)) {
    return input.map((item) => transformKeys(item, fn)) as unknown as T;
  }
  if (isPlainObject(input)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(input)) {
      out[fn(k)] = transformKeys(v, fn);
    }
    return out as T;
  }
  return input as T;
}

export const camelize = <T = unknown>(input: unknown): T =>
  transformKeys<T>(input, snakeToCamel);

export const snakeize = <T = unknown>(input: unknown): T =>
  transformKeys<T>(input, camelToSnake);

// ---------------------------------------------------------------------------
// Auth + core fetch helpers
// ---------------------------------------------------------------------------

async function getAuthHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...authHeaders,
    ...((options.headers as Record<string, string>) ?? {}),
  };

  let body = options.body;
  const isJson = (headers['Content-Type'] ?? '').includes('application/json');
  if (body && isJson && typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      body = JSON.stringify(snakeize(parsed));
    } catch {
      // leave as-is if not parseable
    }
  } else if (body && isJson && isPlainObject(body)) {
    body = JSON.stringify(snakeize(body));
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers, body });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`API ${res.status}: ${text}`) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  const json: unknown = JSON.parse(text);
  return camelize<T>(json);
}

export async function apiUpload<T>(
  path: string,
  file: Blob | File,
  fieldName = 'file'
): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const form = new FormData();
  // RN treats Blob/File the same way for FormData
  form.append(fieldName, file as Blob);

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { ...authHeaders }, // no Content-Type; runtime sets boundary
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`API ${res.status}: ${text}`) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return undefined as unknown as T;
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  const json: unknown = JSON.parse(text);
  return camelize<T>(json);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Patient {
  id: string;
  name: string;
  age?: number | null;
  patientId?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  doctorName?: string | null;
  doctorSpecialty?: string | null;
  doctorPhone?: string | null;
  doctorHospital?: string | null;
  diagnosis?: string | null;
  theme?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PatientCreate {
  name: string;
  age?: number | null;
  patientId?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  doctorName?: string | null;
  doctorSpecialty?: string | null;
  doctorPhone?: string | null;
  doctorHospital?: string | null;
  diagnosis?: string | null;
  theme?: string | null;
}

export type PatientUpdate = Partial<PatientCreate>;

export interface MedicineCreate {
  drugName: string;
  brandName: string;
  dose: string;
  scheduleType: ScheduleType;
  doseSchedule: DoseSchedule;
  weekDay?: number | null;
  excludeDays?: number[] | null;
  taperingPhases?: TaperingPhase[] | null;
  startDate: string;
  durationDays?: number | null;
  foodTimingId?: string | null;
  foodTimingLabel?: string | null;
  reminderTime?: string | null;
  route?: string | null;
  tip?: string | null;
  notes?: string | null;
  color?: string | null;
}

export type MedicineUpdate = Partial<MedicineCreate>;

export interface MedicationLogEntry {
  id: string;
  patientId: string;
  medicineId: string;
  logDate: string;
  slot: SlotId;
  taken: boolean;
  createdAt: string;
}

export interface MedicationLogUpsert {
  medicineId: string;
  logDate: string;
  slot: SlotId;
  taken: boolean;
}

export interface ScanResult {
  prescriptionId: string;
  parsed: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Typed wrappers
// ---------------------------------------------------------------------------

export async function getPatient(): Promise<Patient | null> {
  try {
    return await apiFetch<Patient>('/patients/me');
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status === 404) return null;
    throw e;
  }
}

export const upsertPatient = (body: PatientCreate): Promise<Patient> =>
  apiFetch<Patient>('/patients', { method: 'POST', body: JSON.stringify(body) });

export const patchPatient = (body: PatientUpdate): Promise<Patient> =>
  apiFetch<Patient>('/patients/me', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

export const listMedicines = (): Promise<Medicine[]> =>
  apiFetch<Medicine[]>('/medicines');

export const createMedicine = (body: MedicineCreate): Promise<Medicine> =>
  apiFetch<Medicine>('/medicines', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const bulkCreateMedicines = (
  body: MedicineCreate[]
): Promise<Medicine[]> =>
  apiFetch<Medicine[]>('/medicines/bulk', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const patchMedicine = (
  id: string,
  body: MedicineUpdate
): Promise<Medicine> =>
  apiFetch<Medicine>(`/medicines/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

export const deleteMedicine = (id: string): Promise<void> =>
  apiFetch<void>(`/medicines/${id}`, { method: 'DELETE' });

export const getMedicationLog = (
  from: string,
  to: string
): Promise<MedicationLogEntry[]> =>
  apiFetch<MedicationLogEntry[]>(
    `/medication-log?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
  );

export const setMedicationLog = (
  body: MedicationLogUpsert
): Promise<MedicationLogEntry> =>
  apiFetch<MedicationLogEntry>('/medication-log', {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const scanPrescription = (file: Blob | File): Promise<ScanResult> =>
  apiUpload<ScanResult>('/scan', file, 'file');
