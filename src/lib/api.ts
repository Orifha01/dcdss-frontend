import axios from 'axios';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserDto,
  PagedResult,
  PatientSummaryDto,
  PatientDetailDto,
  CreatePatientRequest,
  UpdatePatientRequest,
  MedicalRecordDto,
  CreateMedicalRecordRequest,
  LabResultDto,
  OrderLabTestRequest,
  UpdateLabResultRequest,
  CreateMedicationRequest,
  PrescribeMedicationResponse,
  AppointmentDto,
  CreateAppointmentRequest,
  CdsEvaluationRequest,
  CdsEvaluationResponse,
  MonthlyStatsDto,
  AuditLogDto,
} from '@/types/api';

// ──────────────────────────────────────────────────────────────────────────────
// Axios instance
// ──────────────────────────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: 'http://localhost:5249',
});

// Request interceptor — attach JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('dcdss_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Import inline to avoid circular dependency
      import('@/store/authStore').then(({ default: useAuthStore }) => {
        useAuthStore.getState().logout();
      });
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default apiClient;

// ──────────────────────────────────────────────────────────────────────────────
// Auth API
// ──────────────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/api/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    apiClient.post<UserDto>('/api/auth/register', data).then((r) => r.data),
};

// ──────────────────────────────────────────────────────────────────────────────
// Patients API
// ──────────────────────────────────────────────────────────────────────────────

export const patientsApi = {
  getAll: (params?: { page?: number; pageSize?: number; search?: string }) =>
    apiClient
      .get<PagedResult<PatientSummaryDto>>('/api/patients', { params })
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<PatientDetailDto>(`/api/patients/${id}`).then((r) => r.data),

  create: (data: CreatePatientRequest) =>
    apiClient.post<PatientDetailDto>('/api/patients', data).then((r) => r.data),

  update: (id: number, data: UpdatePatientRequest) =>
    apiClient
      .put<PatientDetailDto>(`/api/patients/${id}`, data)
      .then((r) => r.data),
};

// ──────────────────────────────────────────────────────────────────────────────
// Medical Records API
// ──────────────────────────────────────────────────────────────────────────────

export const medicalRecordsApi = {
  create: (data: CreateMedicalRecordRequest) =>
    apiClient
      .post<MedicalRecordDto>('/api/medical-records', data)
      .then((r) => r.data),
};

// ──────────────────────────────────────────────────────────────────────────────
// Laboratory API
// ──────────────────────────────────────────────────────────────────────────────

export const laboratoryApi = {
  getByPatient: (patientId: number) =>
    apiClient
      .get<LabResultDto[]>(`/api/laboratory/patient/${patientId}`)
      .then((r) => r.data),

  order: (data: OrderLabTestRequest) =>
    apiClient
      .post<LabResultDto>('/api/laboratory/order', data)
      .then((r) => r.data),

  updateResult: (id: number, data: UpdateLabResultRequest) =>
    apiClient
      .put<LabResultDto>(`/api/laboratory/results/${id}`, data)
      .then((r) => r.data),
};

// ──────────────────────────────────────────────────────────────────────────────
// Medications API
// ──────────────────────────────────────────────────────────────────────────────

export const medicationsApi = {
  prescribe: (data: CreateMedicationRequest) =>
    apiClient
      .post<PrescribeMedicationResponse>('/api/medications/prescribe', data)
      .then((r) => r.data),

  discontinue: (id: number) =>
    apiClient
      .put<void>(`/api/medications/${id}/discontinue`)
      .then((r) => r.data),
};

// ──────────────────────────────────────────────────────────────────────────────
// Appointments API
// ──────────────────────────────────────────────────────────────────────────────

export const appointmentsApi = {
  getByDoctor: (doctorId: number) =>
    apiClient
      .get<AppointmentDto[]>(`/api/appointments/doctor/${doctorId}`)
      .then((r) => r.data),

  create: (data: CreateAppointmentRequest) =>
    apiClient
      .post<AppointmentDto>('/api/appointments', data)
      .then((r) => r.data),
};

// ──────────────────────────────────────────────────────────────────────────────
// CDS API
// ──────────────────────────────────────────────────────────────────────────────

export const cdsApi = {
  evaluate: (data: CdsEvaluationRequest) =>
    apiClient
      .post<CdsEvaluationResponse>('/api/cds/evaluate', data)
      .then((r) => r.data),
};

// ──────────────────────────────────────────────────────────────────────────────
// Reports API
// ──────────────────────────────────────────────────────────────────────────────

export const reportsApi = {
  getMonthlyStats: (month: number, year: number) =>
    apiClient
      .get<MonthlyStatsDto>('/api/reports/monthly', { params: { month, year } })
      .then((r) => r.data),
};

// ──────────────────────────────────────────────────────────────────────────────
// Audit API
// ──────────────────────────────────────────────────────────────────────────────

export const auditApi = {
  getPaged: (page: number, pageSize: number) =>
    apiClient
      .get<PagedResult<AuditLogDto>>('/api/audit', { params: { page, pageSize } })
      .then((r) => r.data),
};
