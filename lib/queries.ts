import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  bulkCreateMedicines,
  createAppointment,
  createLabReport,
  createMedicine,
  deleteAppointment,
  deleteFlareEntry,
  deleteLabReport,
  deleteMedicine,
  getMedicationLog,
  getPatient,
  listAppointments,
  listFlareEntries,
  listLabReports,
  listMedicines,
  patchAppointment,
  patchPatient,
  scanLabReport,
  scanPrescription,
  setMedicationLog,
  upsertFlareEntry,
  upsertPatient,
  type Appointment,
  type AppointmentCreate,
  type AppointmentUpdate,
  type FlareEntry,
  type FlareEntryUpsert,
  type LabReport,
  type LabReportCreate,
  type MedicationLogEntry,
  type MedicationLogUpsert,
  type Medicine,
  type MedicineCreate,
  type Patient,
  type PatientCreate,
  type PatientUpdate,
  type ScanLabResponse,
  type ScanResult,
  type SlotId,
  type UploadFile,
} from './api';

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------

export const queryKeys = {
  patient: ['patient'] as const,
  medicines: ['medicines'] as const,
  medicationLog: (from: string, to: string) =>
    ['medicationLog', from, to] as const,
  medicationLogAll: ['medicationLog'] as const,
  labReports: ['labReports'] as const,
  flareEntries: ['flareEntries'] as const,
  appointments: ['appointments'] as const,
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export const usePatient = (opts: { enabled?: boolean } = {}) =>
  useQuery<Patient | null>({
    queryKey: queryKeys.patient,
    queryFn: getPatient,
    enabled: opts.enabled ?? true,
  });

export const useMedicines = () =>
  useQuery({
    queryKey: queryKeys.medicines,
    queryFn: listMedicines,
  });

export const useMedicationLog = (from: string, to: string) =>
  useQuery<MedicationLogEntry[]>({
    queryKey: queryKeys.medicationLog(from, to),
    queryFn: () => getMedicationLog(from, to),
    enabled: Boolean(from) && Boolean(to),
    placeholderData: keepPreviousData,
  });

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const useUpsertPatient = () => {
  const qc = useQueryClient();
  return useMutation<Patient, Error, PatientCreate>({
    mutationFn: upsertPatient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.patient });
    },
  });
};

export const usePatchPatient = () => {
  const qc = useQueryClient();
  return useMutation<Patient, Error, PatientUpdate>({
    mutationFn: patchPatient,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.patient });
    },
  });
};

export const useBulkCreateMedicines = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: MedicineCreate[]) => bulkCreateMedicines(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.medicines });
    },
  });
};

export const useCreateMedicine = () => {
  const qc = useQueryClient();
  return useMutation<Medicine, Error, MedicineCreate>({
    mutationFn: (body) => createMedicine(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.medicines });
    },
  });
};

export const useDeleteMedicine = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id: string) => deleteMedicine(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.medicines });
    },
  });
};

export const useScanPrescription = () =>
  useMutation<ScanResult, Error, UploadFile>({
    mutationFn: (file) => scanPrescription(file),
  });

// ---------------------------------------------------------------------------
// Lab Reports
// ---------------------------------------------------------------------------

export const useLabReports = () =>
  useQuery<LabReport[]>({
    queryKey: queryKeys.labReports,
    queryFn: listLabReports,
  });

export const useCreateLabReport = () => {
  const qc = useQueryClient();
  return useMutation<LabReport, Error, LabReportCreate>({
    mutationFn: createLabReport,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.labReports }),
  });
};

export const useDeleteLabReport = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteLabReport,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.labReports }),
  });
};

export interface ScanLabVars {
  file: UploadFile;
  tests: ReadonlyArray<readonly [string, string, string]>;
}

export const useScanLabReport = () =>
  useMutation<ScanLabResponse, Error, ScanLabVars>({
    mutationFn: ({ file, tests }) => scanLabReport(file, tests),
  });

// ---------------------------------------------------------------------------
// Flare Diary
// ---------------------------------------------------------------------------

export const useFlareEntries = () =>
  useQuery<FlareEntry[]>({
    queryKey: queryKeys.flareEntries,
    queryFn: listFlareEntries,
  });

export const useUpsertFlareEntry = () => {
  const qc = useQueryClient();
  return useMutation<FlareEntry, Error, FlareEntryUpsert>({
    mutationFn: upsertFlareEntry,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.flareEntries }),
  });
};

export const useDeleteFlareEntry = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteFlareEntry,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.flareEntries }),
  });
};

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

export const useAppointments = () =>
  useQuery<Appointment[]>({
    queryKey: queryKeys.appointments,
    queryFn: listAppointments,
  });

export const useCreateAppointment = () => {
  const qc = useQueryClient();
  return useMutation<Appointment, Error, AppointmentCreate>({
    mutationFn: createAppointment,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.appointments }),
  });
};

export const usePatchAppointment = () => {
  const qc = useQueryClient();
  return useMutation<Appointment, Error, { id: string; body: AppointmentUpdate }>({
    mutationFn: ({ id, body }) => patchAppointment(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.appointments }),
  });
};

export const useDeleteAppointment = () => {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteAppointment,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.appointments }),
  });
};

// ---------------------------------------------------------------------------
// Optimistic toggle-taken
// ---------------------------------------------------------------------------

export interface ToggleTakenVars {
  medicineId: string;
  logDate: string;
  slot: SlotId;
  taken: boolean;
}

type LogQuerySnapshot = [
  readonly unknown[],
  MedicationLogEntry[] | undefined,
];

export const useToggleTaken = () => {
  const qc = useQueryClient();
  return useMutation<
    MedicationLogEntry,
    Error,
    ToggleTakenVars,
    { previousSnapshots: LogQuerySnapshot[] }
  >({
    mutationFn: (vars) => setMedicationLog(vars),
    onMutate: async (vars) => {
      // Note: rapid double-tap can cause snapshot to capture optimistic state; onSettled invalidate reconciles.
      await qc.cancelQueries({ queryKey: queryKeys.medicationLogAll });

      const previousSnapshots = qc.getQueriesData<MedicationLogEntry[]>({
        queryKey: queryKeys.medicationLogAll,
      }) as LogQuerySnapshot[];

      for (const [key, data] of previousSnapshots) {
        if (!data) continue;
        const idx = data.findIndex(
          (e) =>
            e.medicineId === vars.medicineId &&
            e.logDate === vars.logDate &&
            e.slot === vars.slot
        );
        let next: MedicationLogEntry[];
        if (idx >= 0) {
          next = data.slice();
          next[idx] = { ...next[idx], taken: vars.taken };
        } else {
          const synthetic: MedicationLogEntry = {
            id: `tmp-${vars.medicineId}-${vars.logDate}-${vars.slot}`,
            patientId: data[0]?.patientId ?? '',
            medicineId: vars.medicineId,
            logDate: vars.logDate,
            slot: vars.slot,
            taken: vars.taken,
            createdAt: new Date().toISOString(),
          };
          next = [...data, synthetic];
        }
        qc.setQueryData<MedicationLogEntry[]>(key, next);
      }

      return { previousSnapshots };
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      for (const [key, data] of ctx.previousSnapshots) {
        qc.setQueryData(key, data);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.medicationLogAll });
    },
  });
};
