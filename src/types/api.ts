// ──────────────────────────────────────────────────────────────────────────────
// Auth
// ──────────────────────────────────────────────────────────────────────────────

export type Role = 'Administrator' | 'Doctor' | 'Nurse' | 'LaboratoryStaff';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
  expiresAt: string; // ISO 8601
}

export interface UserDto {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  department?: string;
  createdAt: string; // ISO 8601
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  role: string;
  department?: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Pagination
// ──────────────────────────────────────────────────────────────────────────────

export interface PagedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// Patients
// ──────────────────────────────────────────────────────────────────────────────

export interface PatientSummaryDto {
  patientId: number;
  firstName: string;
  surname: string;
  gender: string;
  dateOfBirth: string; // YYYY-MM-DD
  phone: string;
  bloodType: string;
  createdAt: string; // ISO 8601
}

export interface PatientDetailDto {
  patientId: number;
  firstName: string;
  surname: string;
  gender: string;
  dateOfBirth: string; // YYYY-MM-DD
  address: string;
  phone: string;
  bloodType: string;
  emergencyContact?: string;
  createdAt: string; // ISO 8601
  allergies: string[];
  medicalHistory: MedicalRecordDto[];
}

export interface CreatePatientRequest {
  firstName: string;
  surname: string;
  gender: string;
  dateOfBirth: string; // YYYY-MM-DD
  address: string;
  phone: string;
  bloodType: string;
  emergencyContact?: string;
  allergies?: string[];
}

export type UpdatePatientRequest = CreatePatientRequest;

// ──────────────────────────────────────────────────────────────────────────────
// Medical Records
// ──────────────────────────────────────────────────────────────────────────────

export interface MedicalRecordDto {
  recordId: number;
  patientId: number;
  doctorId: number;
  doctorName?: string;
  diagnosis: string;
  treatmentNotes?: string;
  visitDate: string; // ISO 8601
  status: string;
  labResults: LabResultDto[];
  medications: MedicationDto[];
}

export interface CreateMedicalRecordRequest {
  patientId: number;
  diagnosis: string;
  treatmentNotes?: string;
  visitDate: string; // ISO 8601
}

// ──────────────────────────────────────────────────────────────────────────────
// Laboratory
// ──────────────────────────────────────────────────────────────────────────────

export interface LabResultDto {
  resultId: number;
  recordId: number;
  testName: string;
  resultValue?: string;
  referenceRange: string;
  status: string;
  orderedBy: number;
  dateOrdered: string; // ISO 8601
}

export interface OrderLabTestRequest {
  recordId: number;
  testName: string;
  referenceRange: string;
}

export interface UpdateLabResultRequest {
  resultValue: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Medications
// ──────────────────────────────────────────────────────────────────────────────

export interface MedicationDto {
  medicationId: number;
  recordId: number;
  drugName: string;
  dosage: string;
  frequency: string;
  startDate: string; // ISO 8601
  status: string;
}

export interface CreateMedicationRequest {
  recordId: number;
  drugName: string;
  dosage: string;
  frequency: string;
}

export interface SafetyWarningDto {
  ruleId: string;
  type: string;
  severity: string;
  message: string;
  relatedDrug?: string;
  relatedAllergen?: string;
}

export interface PrescribeMedicationResponse {
  medication: MedicationDto;
  warnings: SafetyWarningDto[];
}

// ──────────────────────────────────────────────────────────────────────────────
// Appointments
// ──────────────────────────────────────────────────────────────────────────────

export interface AppointmentDto {
  appointmentId: number;
  patientId: number;
  doctorId: number;
  appointmentDate: string; // ISO 8601
  status: string;
  patientName?: string;
  doctorName?: string;
}

export interface CreateAppointmentRequest {
  patientId: number;
  doctorId: number;
  appointmentDate: string; // ISO 8601
}

// ──────────────────────────────────────────────────────────────────────────────
// CDS (Clinical Decision Support)
// ──────────────────────────────────────────────────────────────────────────────

export interface LabResultInputDto {
  testName: string;
  resultValue: string;
  referenceRange: string;
}

export interface MedicationInputDto {
  drugName: string;
  dosage: string;
}

export interface CdsEvaluationRequest {
  patientId?: number;
  symptoms?: string[];
  labResults?: LabResultInputDto[];
  medications?: MedicationInputDto[];
  allergies?: string[];
}

export interface CdsFindingDto {
  ruleId: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  relatedItem?: string;
}

export interface CdsEvaluationResponse {
  diagnosticRecommendations: CdsFindingDto[];
  interactionWarnings: CdsFindingDto[];
  criticalAlerts: CdsFindingDto[];
  evaluatedAt: string; // ISO 8601
}

// ──────────────────────────────────────────────────────────────────────────────
// Reports
// ──────────────────────────────────────────────────────────────────────────────

export interface DepartmentStatDto {
  department: string;
  visitCount: number;
}

export interface MonthlyStatsDto {
  month: number;
  year: number;
  totalVisits: number;
  newPatientRegistrations: number;
  labTestsOrdered: number;
  departmentPerformance: DepartmentStatDto[];
}

// ──────────────────────────────────────────────────────────────────────────────
// Audit
// ──────────────────────────────────────────────────────────────────────────────

export interface AuditLogDto {
  auditId: number;
  userId?: number;
  username?: string;
  action: string;
  details?: string;
  timestamp: string; // ISO 8601
}
