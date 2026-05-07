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
// ApiError
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(public status: number, public body: string) {
    super(`API ${status}: ${body}`);
    this.name = 'ApiError';
  }
}

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
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...authHeaders,
    ...((options.headers as Record<string, string>) ?? {}),
  };

  let body = options.body;
  if (!isFormData) {
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
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers, body });

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text);
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  const json: unknown = JSON.parse(text);
  return camelize<T>(json);
}

export type UploadFile =
  | Blob
  | File
  | { uri: string; name: string; type: string };

export async function apiUpload<T>(
  path: string,
  file: UploadFile,
  fieldName = 'file'
): Promise<T> {
  const authHeaders = await getAuthHeaders();
  const form = new FormData();
  // RN's FormData accepts the {uri,name,type} object as-is.
  // Web FormData accepts Blob/File. Both paths flow through .append unchanged.
  form.append(fieldName, file as Blob);

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { ...authHeaders }, // no Content-Type — runtime sets multipart boundary
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text);
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
  doctorWebsiteUrl?: string | null;
  doctorInstagramUrl?: string | null;
  doctorYoutubeUrl?: string | null;
  language?: 'en' | 'hi' | null;
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
  doctorWebsiteUrl?: string | null;
  doctorInstagramUrl?: string | null;
  doctorYoutubeUrl?: string | null;
  language?: 'en' | 'hi' | null;
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

// Shape mirrors backend SCAN_PROMPT (app/services/scan_prompt.py).
// camelize() converts snake_case keys from the parser to camelCase.
export interface ParsedMedicine {
  drugName: string;
  brandName?: string;
  dose?: string;
  scheduleType?: ScheduleType;
  doseSchedule?: DoseSchedule;
  weekDay?: number | null;
  excludeDays?: number[] | null;
  taperingPhases?: TaperingPhase[] | null;
  startDate?: string;
  durationDays?: number | null;
  foodTimingId?: string | null;
  foodTimingLabel?: string | null;
  foodTiming?: string | null;
  reminderTime?: string | null;
  route?: string | null;
  tip?: string | null;
  notes?: string | null;
  remarks?: string | null;
  // Tolerate parser drift / extra fields (e.g. confidence scores).
  [key: string]: unknown;
}

export interface ParsedPrescription {
  medicines?: ParsedMedicine[];
  // Backend prompt uses the key "medications"; alias for forward-compat.
  medications?: ParsedMedicine[];
  diagnosis?: string | null;
  doctorName?: string | null;
  prescriptionDate?: string | null;
  [key: string]: unknown;
}

export interface ScanResult {
  prescriptionId: string;
  parsed: ParsedPrescription;
}

// ---------------------------------------------------------------------------
// Typed wrappers
// ---------------------------------------------------------------------------

export async function getPatient(): Promise<Patient | null> {
  try {
    return await apiFetch<Patient>('/patients/me');
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
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

export const updateMedicine = (
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

export const scanPrescription = (file: UploadFile): Promise<ScanResult> =>
  apiUpload<ScanResult>('/scan', file, 'file');

// ---------------------------------------------------------------------------
// Lab Reports
// ---------------------------------------------------------------------------

export interface LabResultEntry {
  testId: string;
  value: string;
}

export interface LabReport {
  id: string;
  patientId: string;
  reportDate: string; // YYYY-MM-DD
  results: LabResultEntry[];
  source: 'manual' | 'scan' | string;
  notes?: string | null;
  createdAt: string;
}

export interface LabReportCreate {
  reportDate: string;
  results: LabResultEntry[];
  source?: 'manual' | 'scan' | string;
  notes?: string | null;
}

export const listLabReports = (): Promise<LabReport[]> =>
  apiFetch<LabReport[]>('/lab-reports');

export const createLabReport = (body: LabReportCreate): Promise<LabReport> =>
  apiFetch<LabReport>('/lab-reports', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const deleteLabReport = (id: string): Promise<void> =>
  apiFetch<void>(`/lab-reports/${id}`, { method: 'DELETE' });

// AI lab-report scan: client posts the image + its current LAB_TESTS catalog
// as a JSON-stringified array of [id, name, unit] triples (multipart form).
export interface ScanLabResponse {
  reportDate: string | null;
  results: LabResultEntry[];
}

export async function scanLabReport(
  file: UploadFile,
  tests: ReadonlyArray<readonly [string, string, string]>,
): Promise<ScanLabResponse> {
  const authHeaders = await getAuthHeaders();
  const form = new FormData();
  form.append('file', file as Blob);
  form.append('tests', JSON.stringify(tests));

  const res = await fetch(`${API_URL}/scan-lab`, {
    method: 'POST',
    headers: { ...authHeaders },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text);
  }
  const text = await res.text();
  if (!text) return { reportDate: null, results: [] };
  const json: unknown = JSON.parse(text);
  return camelize<ScanLabResponse>(json);
}

// ---------------------------------------------------------------------------
// Flare Diary
// ---------------------------------------------------------------------------

export interface FlareEntry {
  id: string;
  patientId: string;
  entryDate: string;
  pain: number;
  stiffnessMin: number;
  fatigue: number;
  joints: string[];
  notes?: string | null;
  createdAt: string;
}

export interface FlareEntryUpsert {
  entryDate: string;
  pain: number;
  stiffnessMin: number;
  fatigue: number;
  joints: string[];
  notes?: string | null;
}

export const listFlareEntries = (): Promise<FlareEntry[]> =>
  apiFetch<FlareEntry[]>('/flare-entries');

export const upsertFlareEntry = (body: FlareEntryUpsert): Promise<FlareEntry> =>
  apiFetch<FlareEntry>('/flare-entries', {
    method: 'PUT',
    body: JSON.stringify(body),
  });

export const deleteFlareEntry = (id: string): Promise<void> =>
  apiFetch<void>(`/flare-entries/${id}`, { method: 'DELETE' });

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

export interface Appointment {
  id: string;
  patientId: string;
  appointmentDate: string;
  appointmentTime?: string | null;
  doctorName: string;
  clinic?: string | null;
  visitType: string;
  preNotes?: string | null;
  postNotes?: string | null;
  completed: boolean;
  createdAt: string;
}

export interface AppointmentCreate {
  appointmentDate: string;
  appointmentTime?: string | null;
  doctorName: string;
  clinic?: string | null;
  visitType?: string;
  preNotes?: string | null;
  postNotes?: string | null;
  completed?: boolean;
}

export type AppointmentUpdate = Partial<AppointmentCreate>;

export const listAppointments = (): Promise<Appointment[]> =>
  apiFetch<Appointment[]>('/appointments');

export const createAppointment = (body: AppointmentCreate): Promise<Appointment> =>
  apiFetch<Appointment>('/appointments', {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const patchAppointment = (
  id: string,
  body: AppointmentUpdate,
): Promise<Appointment> =>
  apiFetch<Appointment>(`/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

export const deleteAppointment = (id: string): Promise<void> =>
  apiFetch<void>(`/appointments/${id}`, { method: 'DELETE' });
