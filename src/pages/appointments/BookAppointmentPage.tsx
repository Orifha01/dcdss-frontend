import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useCreateAppointment } from '@/hooks/useAppointments';
import PatientSelect from '@/components/shared/PatientSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const bookSchema = z.object({
  patientId: z.coerce.number({ required_error: 'Patient is required' }).positive('Select a patient'),
  doctorId: z.coerce.number({ required_error: 'Doctor ID is required' }).positive('Doctor ID must be positive'),
  appointmentDate: z
    .string()
    .min(1, 'Appointment date is required')
    .refine((val) => new Date(val) > new Date(), {
      message: 'Appointment must be in the future',
    }),
});

type BookFormValues = z.infer<typeof bookSchema>;

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientIdParam = searchParams.get('patientId');

  const createAppointment = useCreateAppointment();
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<number | null>(
    patientIdParam ? Number(patientIdParam) : null
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      patientId: patientIdParam ? Number(patientIdParam) : undefined,
    },
  });

  const onSubmit = (data: BookFormValues) => {
    setConflictError(null);
    createAppointment.mutate(
      {
        patientId: data.patientId,
        doctorId: data.doctorId,
        appointmentDate: new Date(data.appointmentDate).toISOString(),
      },
      {
        onSuccess: () => {
          toast.success('Appointment booked successfully!');
          navigate(`/appointments?doctorId=${data.doctorId}`);
        },
        onError: (error) => {
          if (axios.isAxiosError(error)) {
            if (error.response?.status === 409) {
              setConflictError(
                error.response.data?.detail ||
                'This time slot is already booked.'
              );
            } else if (error.response?.status === 400) {
              toast.error('Please check the form for errors.');
            } else {
              toast.error('Something went wrong. Please try again.');
            }
          } else {
            toast.error('Failed to book appointment. Please try again.');
          }
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Book Appointment</h1>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <PatientSelect
              value={selectedPatientId}
              onChange={(id) => {
                setSelectedPatientId(id);
                setValue('patientId', id, { shouldValidate: true });
              }}
              error={errors.patientId?.message}
            />

            <div className="grid gap-2">
              <Label htmlFor="doctorId">Doctor ID *</Label>
              <Input
                id="doctorId"
                type="number"
                min={1}
                placeholder="Enter the doctor's ID"
                aria-invalid={!!errors.doctorId}
                {...register('doctorId')}
              />
              {errors.doctorId ? (
                <p className="text-sm text-destructive">{errors.doctorId.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Enter the numeric ID of the doctor (e.g. from the appointments page).
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="appointmentDate">Appointment Date &amp; Time *</Label>
              <Input
                id="appointmentDate"
                type="datetime-local"
                aria-invalid={!!errors.appointmentDate}
                {...register('appointmentDate')}
              />
              {errors.appointmentDate && (
                <p className="text-sm text-destructive">{errors.appointmentDate.message}</p>
              )}
            </div>

            {conflictError && (
              <div className="rounded-md bg-red-50 border border-red-300 p-3 text-red-700 text-sm">
                ⚠️ {conflictError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={createAppointment.isPending}>
                {createAppointment.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Booking…
                  </>
                ) : (
                  'Book Appointment'
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
