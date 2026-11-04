import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Pencil, FlaskConical, Pill, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { usePatient } from '@/hooks/usePatients';
import useAuthStore from '@/store/authStore';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from 'cn';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import type { MedicalRecordDto, LabResultDto, MedicationDto } from '@/types/api';

// ─── Status badge helpers ──────────────────────────────────────────────────────

function labStatusClass(status: string): string {
  switch (status) {
    case 'Normal': return 'bg-green-100 text-green-800';
    case 'High': return 'bg-red-100 text-red-800';
    case 'Low': return 'bg-orange-100 text-orange-800';
    case 'Ordered': return 'bg-gray-100 text-gray-700';
    case 'Indeterminate': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function recordStatusClass(status: string): string {
  switch (status) {
    case 'Active': return 'bg-blue-100 text-blue-800';
    case 'Closed': return 'bg-gray-100 text-gray-700';
    case 'Cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function medStatusClass(status: string): string {
  switch (status) {
    case 'Active': return 'bg-blue-100 text-blue-800';
    case 'Discontinued': return 'bg-gray-100 text-gray-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

function StatusBadge({ status, colorFn }: { status: string; colorFn: (s: string) => string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorFn(status)}`}>
      {status}
    </span>
  );
}

// ─── Lab results nested table ──────────────────────────────────────────────────

function LabResultsTable({ results }: { results: LabResultDto[] }) {
  if (results.length === 0) {
    return <p className="text-xs text-muted-foreground py-2">No lab results.</p>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs">Test Name</TableHead>
          <TableHead className="text-xs">Result Value</TableHead>
          <TableHead className="text-xs">Reference Range</TableHead>
          <TableHead className="text-xs">Status</TableHead>
          <TableHead className="text-xs">Date Ordered</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((r) => (
          <TableRow key={r.resultId}>
            <TableCell className="text-xs">{r.testName}</TableCell>
            <TableCell className="text-xs">{r.resultValue ?? '—'}</TableCell>
            <TableCell className="text-xs">{r.referenceRange}</TableCell>
            <TableCell className="text-xs">
              <StatusBadge status={r.status} colorFn={labStatusClass} />
            </TableCell>
            <TableCell className="text-xs">
              {format(parseISO(r.dateOrdered), 'dd MMM yyyy')}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── Medications nested table ─────────────────────────────────────────────────

function MedicationsTable({ medications }: { medications: MedicationDto[] }) {
  if (medications.length === 0) {
    return <p className="text-xs text-muted-foreground py-2">No medications.</p>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs">Drug</TableHead>
          <TableHead className="text-xs">Dosage</TableHead>
          <TableHead className="text-xs">Frequency</TableHead>
          <TableHead className="text-xs">Start Date</TableHead>
          <TableHead className="text-xs">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {medications.map((m) => (
          <TableRow key={m.medicationId}>
            <TableCell className="text-xs">{m.drugName}</TableCell>
            <TableCell className="text-xs">{m.dosage}</TableCell>
            <TableCell className="text-xs">{m.frequency}</TableCell>
            <TableCell className="text-xs">
              {format(parseISO(m.startDate), 'dd MMM yyyy')}
            </TableCell>
            <TableCell className="text-xs">
              <StatusBadge status={m.status} colorFn={medStatusClass} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── Medical record card (accordion item) ─────────────────────────────────────

function MedicalRecordCard({
  record,
  patientId,
  role,
}: {
  record: MedicalRecordDto;
  patientId: number;
  role: string | null;
}) {
  const [open, setOpen] = useState(false);
  const canOrderLab = role === 'Doctor' || role === 'Nurse';
  const canPrescribe = role === 'Doctor';

  return (
    <div className="rounded-lg border bg-card">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between p-4 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          {open ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
          <div>
            <p className="font-medium">{record.diagnosis}</p>
            <p className="text-xs text-muted-foreground">
              {format(parseISO(record.visitDate), 'dd MMM yyyy')}
              {record.doctorName ? ` · ${record.doctorName}` : ''}
            </p>
          </div>
        </div>
        <StatusBadge status={record.status} colorFn={recordStatusClass} />
      </button>

      {/* Expanded body */}
      {open && (
        <div className="border-t px-4 pb-4 space-y-4">
          {record.treatmentNotes && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mt-3">Treatment Notes</p>
              <p className="text-sm">{record.treatmentNotes}</p>
            </div>
          )}

          {/* Action buttons for this record */}
          <div className="flex flex-wrap gap-2">
            {canOrderLab && (
              <Link
                to={`/laboratory/order?patientId=${patientId}&recordId=${record.recordId}`}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              >
                <FlaskConical className="mr-1 size-4" />
                Order Lab Test
              </Link>
            )}
            {canPrescribe && (
              <Link
                to={`/medications/prescribe?recordId=${record.recordId}`}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
              >
                <Pill className="mr-1 size-4" />
                Prescribe Medication
              </Link>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Lab Results
            </p>
            <LabResultsTable results={record.labResults} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Medications
            </p>
            <MedicationsTable medications={record.medications} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const patientId = Number(id);
  const { role } = useAuthStore();

  const { data: patient, isLoading } = usePatient(patientId);

  const canEdit = role === 'Doctor' || role === 'Nurse';
  const canBookAppt = role === 'Doctor' || role === 'Nurse' || role === 'Administrator';

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!patient) {
    return <div className="p-4 text-muted-foreground">Patient not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">
          {patient.firstName} {patient.surname}
        </h1>
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Link
              to={`/patients/${patientId}/edit`}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              <Pencil className="mr-1 size-4" />
              Edit Patient
            </Link>
          )}
          {canBookAppt && (
            <Link
              to={`/appointments/new?patientId=${patientId}`}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              <Calendar className="mr-1 size-4" />
              Book Appointment
            </Link>
          )}
          {(role === 'Doctor' || role === 'Nurse') && (
            <Link
              to={`/medical-records/new?patientId=${patientId}`}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              + New Visit
            </Link>
          )}
        </div>
      </div>

      {/* Demographics card */}
      <Card>
        <CardHeader>
          <CardTitle>Demographics</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Date of Birth</dt>
              <dd>{format(parseISO(patient.dateOfBirth), 'dd MMM yyyy')}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Gender</dt>
              <dd>{patient.gender}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Blood Type</dt>
              <dd>{patient.bloodType.replace('Positive', '+').replace('Negative', '-')}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Phone</dt>
              <dd>{patient.phone}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-muted-foreground">Address</dt>
              <dd>{patient.address}</dd>
            </div>
            {patient.emergencyContact && (
              <div>
                <dt className="text-xs text-muted-foreground">Emergency Contact</dt>
                <dd>{patient.emergencyContact}</dd>
              </div>
            )}
          </dl>

          {patient.allergies.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">Allergies</p>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center rounded-full bg-red-100 px-3 py-0.5 text-xs font-medium text-red-800"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medical History */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Medical History</h2>
        {patient.medicalHistory.length === 0 ? (
          <p className="text-muted-foreground text-sm">No medical history recorded.</p>
        ) : (
          <div className="space-y-3">
            {patient.medicalHistory.map((record) => (
              <MedicalRecordCard
                key={record.recordId}
                record={record}
                patientId={patientId}
                role={role}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
