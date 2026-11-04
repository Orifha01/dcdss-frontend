import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/routes/ProtectedRoute';

// ── Public pages ─────────────────────────────────────────────────────────────
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'));

// ── Authenticated pages ───────────────────────────────────────────────────────
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));

// Patients
const PatientListPage = lazy(() => import('@/pages/patients/PatientListPage'));
const PatientDetailPage = lazy(() => import('@/pages/patients/PatientDetailPage'));
const RegisterPatientPage = lazy(() => import('@/pages/patients/RegisterPatientPage'));
const EditPatientPage = lazy(() => import('@/pages/patients/EditPatientPage'));

// Medical Records
const CreateMedicalRecordPage = lazy(
  () => import('@/pages/medical-records/CreateMedicalRecordPage')
);

// Laboratory
const LabOrdersPage = lazy(() => import('@/pages/laboratory/LabOrdersPage'));
const OrderLabTestPage = lazy(() => import('@/pages/laboratory/OrderLabTestPage'));
const UploadLabResultPage = lazy(() => import('@/pages/laboratory/UploadLabResultPage'));

// Medications
const PrescribeMedicationPage = lazy(
  () => import('@/pages/medications/PrescribeMedicationPage')
);

// Appointments
const AppointmentsPage = lazy(() => import('@/pages/appointments/AppointmentsPage'));
const BookAppointmentPage = lazy(() => import('@/pages/appointments/BookAppointmentPage'));

// CDS
const CdsEvaluatePage = lazy(() => import('@/pages/cds/CdsEvaluatePage'));

// Admin
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage'));
const AuditLogPage = lazy(() => import('@/pages/admin/AuditLogPage'));
const RegisterUserPage = lazy(() => import('@/pages/admin/RegisterUserPage'));

// ── Fallback ──────────────────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* All authenticated routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Dashboard — all authenticated roles */}
            <Route path="/" element={<DashboardPage />} />

            {/* Patients — Doctor, Nurse, LaboratoryStaff */}
            <Route element={<ProtectedRoute roles={['Doctor', 'Nurse', 'LaboratoryStaff']} />}>
              <Route path="/patients" element={<PatientListPage />} />
              <Route path="/patients/:id" element={<PatientDetailPage />} />
            </Route>

            {/* Patients write — Doctor, Nurse */}
            <Route element={<ProtectedRoute roles={['Doctor', 'Nurse']} />}>
              <Route path="/patients/new" element={<RegisterPatientPage />} />
              <Route path="/patients/:id/edit" element={<EditPatientPage />} />
              <Route path="/medical-records/new" element={<CreateMedicalRecordPage />} />
            </Route>

            {/* Laboratory read — Doctor, Nurse, LaboratoryStaff */}
            <Route element={<ProtectedRoute roles={['Doctor', 'Nurse', 'LaboratoryStaff']} />}>
              <Route path="/laboratory" element={<LabOrdersPage />} />
            </Route>

            {/* Laboratory order — Doctor, Nurse */}
            <Route element={<ProtectedRoute roles={['Doctor', 'Nurse']} />}>
              <Route path="/laboratory/order" element={<OrderLabTestPage />} />
            </Route>

            {/* Lab results upload — LaboratoryStaff */}
            <Route element={<ProtectedRoute roles={['LaboratoryStaff']} />}>
              <Route path="/laboratory/results/:id" element={<UploadLabResultPage />} />
            </Route>

            {/* Medications — Doctor */}
            <Route element={<ProtectedRoute roles={['Doctor']} />}>
              <Route path="/medications/prescribe" element={<PrescribeMedicationPage />} />
            </Route>

            {/* Appointments — Doctor, Nurse, Administrator */}
            <Route element={<ProtectedRoute roles={['Doctor', 'Nurse', 'Administrator']} />}>
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/appointments/new" element={<BookAppointmentPage />} />
            </Route>

            {/* CDS — Doctor, Nurse */}
            <Route element={<ProtectedRoute roles={['Doctor', 'Nurse']} />}>
              <Route path="/cds/evaluate" element={<CdsEvaluatePage />} />
            </Route>

            {/* Admin — Administrator */}
            <Route element={<ProtectedRoute roles={['Administrator']} />}>
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/audit" element={<AuditLogPage />} />
              <Route path="/admin/register" element={<RegisterUserPage />} />
            </Route>

            {/* Catch-all: redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
