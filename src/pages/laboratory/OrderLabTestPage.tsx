import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Loader2, Info } from 'lucide-react';
import { useOrderLabTest } from '@/hooks/useLaboratory';
import { usePatient } from '@/hooks/usePatients';
import PatientSelect from '@/components/shared/PatientSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const selectClass =
  'h-8 w-full appearance-none rounded-lg border border-input bg-transparent pl-2.5 pr-8 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';

const orderSchema = z.object({
  recordId: z.coerce.number({ required_error: 'Medical record is required' }).positive('Select a record'),
  testName: z.string().min(1, 'Test name is required'),
  referenceRange: z.string().min(1, 'Reference range is required'),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export default function OrderLabTestPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientIdStr = searchParams.get('patientId');
  const recordIdStr = searchParams.get('recordId');

  const orderLabTest = useOrderLabTest();

  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    patientIdStr ? Number(patientIdStr) : null
  );
  const [selectedPatientName, setSelectedPatientName] = useState<string | null>(null);

  // Fetch patient detail (includes medicalHistory) once a patient is selected
  const { data: patientDetail, isLoading: recordsLoading } = usePatient(selectedPatientId ?? 0);
  const records = patientDetail?.medicalHistory ?? [];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      recordId: recordIdStr ? Number(recordIdStr) : undefined,
    },
  });

  const onSubmit = (data: OrderFormValues) => {
    orderLabTest.mutate(
      {
        recordId: data.recordId,
        testName: data.testName,
        referenceRange: data.referenceRange,
      },
      {
        onSuccess: (result) => {
          toast.success(`Lab test ordered (Result ID: ${result.resultId})`);
          navigate(selectedPatientId ? `/laboratory?patientId=${selectedPatientId}` : '/laboratory');
        },
        onError: () => {
          toast.error('Failed to order lab test. Please try again.');
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Order Lab Test</h1>

      <Alert>
        <Info className="size-4" />
        <AlertTitle>Prerequisite</AlertTitle>
        <AlertDescription>
          A medical record must exist before ordering a lab test. Select a patient, then choose
          one of their records below.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Lab Test Details</CardTitle>
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

            {/* Medical Record dropdown — only shown after a patient is picked */}
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
              <Label htmlFor="testName">Test Name *</Label>
              <Input
                id="testName"
                placeholder="e.g. Blood Glucose, CBC"
                aria-invalid={!!errors.testName}
                {...register('testName')}
              />
              {errors.testName && (
                <p className="text-sm text-destructive">{errors.testName.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="referenceRange">Reference Range *</Label>
              <Input
                id="referenceRange"
                placeholder="e.g. 70-110 mg/dL"
                aria-invalid={!!errors.referenceRange}
                {...register('referenceRange')}
              />
              {errors.referenceRange && (
                <p className="text-sm text-destructive">{errors.referenceRange.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={orderLabTest.isPending || !selectedPatientId}>
                {orderLabTest.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Ordering…
                  </>
                ) : (
                  'Order Test'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(selectedPatientId ? `/laboratory?patientId=${selectedPatientId}` : '/laboratory')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
