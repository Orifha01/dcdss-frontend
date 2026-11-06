import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useCreateMedicalRecord } from '@/hooks/useMedicalRecords';
import PatientSelect from '@/components/shared/PatientSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const recordSchema = z.object({
  diagnosis: z.string().min(1, 'Diagnosis is required').max(500),
  treatmentNotes: z.string().max(2000).optional(),
  visitDate: z.string().min(1, 'Visit date is required'),
});

type RecordFormValues = z.infer<typeof recordSchema>;

export default function CreateMedicalRecordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientIdStr = searchParams.get('patientId');

  const createRecord = useCreateMedicalRecord();

  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    patientIdStr ? Number(patientIdStr) : null
  );
  const [selectedPatientName, setSelectedPatientName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecordFormValues>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      visitDate: new Date().toISOString().slice(0, 16),
    },
  });

  const onSubmit = (data: RecordFormValues) => {
    if (!selectedPatientId) {
      toast.error('Please select a patient first.');
      return;
    }
    createRecord.mutate(
      {
        patientId: selectedPatientId,
        diagnosis: data.diagnosis,
        treatmentNotes: data.treatmentNotes || undefined,
        visitDate: new Date(data.visitDate).toISOString(),
      },
      {
        onSuccess: () => {
          toast.success('Medical record created successfully');
          navigate(`/patients/${selectedPatientId}`);
        },
        onError: () => {
          toast.error('Failed to create medical record. Please try again.');
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">New Visit Record</h1>

      <Card>
        <CardHeader>
          <CardTitle>Medical Record</CardTitle>
          <CardDescription>
            {selectedPatientName
              ? `Patient: ${selectedPatientName} · Doctor information is automatically recorded from your session.`
              : 'Doctor information is automatically recorded from your session.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <PatientSelect
              value={selectedPatientId}
              onChange={(id, name) => {
                setSelectedPatientId(id);
                setSelectedPatientName(name);
              }}
            />

            <div className="grid gap-2">
              <Label htmlFor="visitDate">Visit Date & Time *</Label>
              <Input
                id="visitDate"
                type="datetime-local"
                aria-invalid={!!errors.visitDate}
                {...register('visitDate')}
              />
              {errors.visitDate && (
                <p className="text-sm text-destructive">{errors.visitDate.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="diagnosis">Diagnosis *</Label>
              <Textarea
                id="diagnosis"
                rows={3}
                placeholder="Enter diagnosis…"
                aria-invalid={!!errors.diagnosis}
                {...register('diagnosis')}
              />
              {errors.diagnosis && (
                <p className="text-sm text-destructive">{errors.diagnosis.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="treatmentNotes">Treatment Notes</Label>
              <Textarea
                id="treatmentNotes"
                rows={4}
                placeholder="Enter treatment notes (optional)…"
                {...register('treatmentNotes')}
              />
              {errors.treatmentNotes && (
                <p className="text-sm text-destructive">{errors.treatmentNotes.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={createRecord.isPending || !selectedPatientId}>
                {createRecord.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Create Record'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(selectedPatientId ? `/patients/${selectedPatientId}` : '/')}
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
