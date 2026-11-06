import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Loader2, AlertTriangle, Info } from 'lucide-react';
import axios from 'axios';
import { usePrescribeMedication } from '@/hooks/useMedications';
import { usePatient } from '@/hooks/usePatients';
import PatientSelect from '@/components/shared/PatientSelect';
import type { SafetyWarningDto, PrescribeMedicationResponse } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const selectClass =
  'h-8 w-full appearance-none rounded-lg border border-input bg-transparent pl-2.5 pr-8 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

const prescribeSchema = z.object({
  recordId: z.coerce
    .number({ required_error: 'Medical record is required' })
    .positive('Select a record'),
  drugName: z.string().min(1, 'Drug name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
});

type PrescribeFormValues = z.infer<typeof prescribeSchema>;

function WarningAlert({ warning }: { warning: SafetyWarningDto }) {
  const isCritical = warning.severity === 'Critical';
  return (
    <Alert
      variant={isCritical ? 'destructive' : 'default'}
      className={isCritical ? '' : 'border-yellow-400 bg-yellow-50 text-yellow-900'}
    >
      <AlertTriangle className="size-4" />
      <AlertTitle className="flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
            isCritical ? 'bg-red-200 text-red-900' : 'bg-yellow-200 text-yellow-900'
          }`}
        >
          {warning.severity}
        </span>
        {warning.type}
      </AlertTitle>
      <AlertDescription>{warning.message}</AlertDescription>
    </Alert>
  );
}

export default function PrescribeMedicationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const recordIdStr = searchParams.get('recordId');

  const prescribe = usePrescribeMedication();
  const [blockingError, setBlockingError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<PrescribeMedicationResponse | null>(null);

  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(null);
  const [selectedPatientName, setSelectedPatientName] = useState<string | null>(null);

  const { data: patientDetail, isLoading: recordsLoading } = usePatient(selectedPatientId ?? 0);
  const records = patientDetail?.medicalHistory ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PrescribeFormValues>({
    resolver: zodResolver(prescribeSchema),
    defaultValues: {
      recordId: recordIdStr ? Number(recordIdStr) : undefined,
    },
  });

  const onSubmit = (data: PrescribeFormValues) => {
    setBlockingError(null);
    prescribe.mutate(
      {
        recordId: data.recordId,
        drugName: data.drugName,
        dosage: data.dosage,
        frequency: data.frequency,
      },
      {
        onSuccess: (result) => {
          setSuccessData(result);
          if (result.warnings.length === 0) {
            toast.success('Medication prescribed successfully');
          } else {
            toast.success('Medication prescribed with warnings — review below');
          }
        },
        onError: (err) => {
          if (axios.isAxiosError(err) && err.response?.status === 409) {
            const msg =
              (err.response.data as { message?: string })?.message ||
              'Prescription blocked due to a critical safety conflict.';
            setBlockingError(msg);
          } else {
            toast.error('Failed to prescribe medication. Please try again.');
          }
        },
      },
    );
  };

  if (successData) {
    const { medication, warnings } = successData;
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <h1 className="text-2xl font-semibold">Prescription Created</h1>
        <Card>
          <CardHeader>
            <CardTitle>{medication.drugName}</CardTitle>
            <CardDescription>
              {medication.dosage} · {medication.frequency}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Medication ID #{medication.medicationId} · Status:{' '}
              <span className="font-medium">{medication.status}</span>
            </p>
            {warnings.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Safety Warnings</p>
                {warnings.map((w) => (
                  <WarningAlert key={w.ruleId} warning={w} />
                ))}
              </div>
            )}
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Prescribe Medication</h1>

      <Alert>
        <Info className="size-4" />
        <AlertTitle>Drug Name Matching</AlertTitle>
        <AlertDescription>
          Use the canonical drug name (e.g. "Penicillin", "Aspirin") so the system can check for
          allergies and drug interactions automatically.
        </AlertDescription>
      </Alert>

      {blockingError && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <p className="text-sm font-semibold text-destructive">Prescription Blocked</p>
          <p className="text-sm text-destructive mt-1">{blockingError}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Medication Details</CardTitle>
          {selectedPatientName && (
            <CardDescription>Patient: {selectedPatientName}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <PatientSelect
              value={selectedPatientId}
              onChange={(id, name) => {
                setSelectedPatientId(id);
                setSelectedPatientName(name);
                setValue('recordId', 0 as unknown as number);
              }}
            />

            {selectedPatientId && (
              <div className="grid gap-2">
                <Label htmlFor="recordId">Medical Record *</Label>
                {recordsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" /> Loading records…
                  </div>
                ) : records.length === 0 ? (
                  <p className="text-sm text-destructive">
                    No medical records found for this patient. Create a visit record first.
                  </p>
                ) : (
                  <select
                    id="recordId"
                    className={selectClass}
                    aria-invalid={!!errors.recordId}
                    {...register('recordId')}
                  >
                    <option value="">Select a record…</option>
                    {records.map((r) => (
                      <option key={r.recordId} value={r.recordId}>
                        Record #{r.recordId} — {r.diagnosis.slice(0, 50)}
                        {r.diagnosis.length > 50 ? '…' : ''} ({new Date(r.visitDate).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                )}
                {errors.recordId && (
                  <p className="text-sm text-destructive">{errors.recordId.message}</p>
                )}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="drugName">Drug Name *</Label>
              <Input
                id="drugName"
                placeholder="e.g. Amoxicillin"
                aria-invalid={!!errors.drugName}
                {...register('drugName')}
              />
              {errors.drugName && (
                <p className="text-sm text-destructive">{errors.drugName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dosage">Dosage *</Label>
                <Input
                  id="dosage"
                  placeholder="e.g. 500mg"
                  aria-invalid={!!errors.dosage}
                  {...register('dosage')}
                />
                {errors.dosage && (
                  <p className="text-sm text-destructive">{errors.dosage.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency *</Label>
                <Input
                  id="frequency"
                  placeholder="e.g. Twice daily"
                  aria-invalid={!!errors.frequency}
                  {...register('frequency')}
                />
                {errors.frequency && (
                  <p className="text-sm text-destructive">{errors.frequency.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={prescribe.isPending || !selectedPatientId}>
                {prescribe.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Prescribing…
                  </>
                ) : (
                  'Prescribe'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
