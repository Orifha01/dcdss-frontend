import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Loader2, X, Plus } from 'lucide-react';
import { usePatient, useUpdatePatient } from '@/hooks/usePatients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const GENDERS = ['Male', 'Female', 'Other'] as const;
const BLOOD_TYPES = [
  'OPositive', 'ONegative', 'APositive', 'ANegative',
  'BPositive', 'BNegative', 'ABPositive', 'ABNegative',
] as const;

const patientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  surname: z.string().min(1, 'Surname is required').max(50),
  gender: z.enum(['Male', 'Female', 'Other'], { required_error: 'Gender is required' }),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  address: z.string().min(1, 'Address is required').max(200),
  phone: z
    .string()
    .regex(/^[0-9+()\\ -]{7,20}$/, 'Phone must be 7–20 chars (digits, +, (), -, space)'),
  bloodType: z.enum(
    ['OPositive', 'ONegative', 'APositive', 'ANegative', 'BPositive', 'BNegative', 'ABPositive', 'ABNegative'],
    { required_error: 'Blood type is required' },
  ),
  emergencyContact: z.string().max(100).optional(),
  allergies: z.array(z.string()).optional(),
});

type PatientFormValues = z.infer<typeof patientSchema>;

function formatBloodType(bt: string): string {
  return bt.replace('Positive', '+').replace('Negative', '-');
}

export default function EditPatientPage() {
  const { id } = useParams<{ id: string }>();
  const patientId = Number(id);
  const navigate = useNavigate();

  const { data: patient, isLoading } = usePatient(patientId);
  const updatePatient = useUpdatePatient(patientId);

  const [allergyInput, setAllergyInput] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [formReady, setFormReady] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
  });

  const selectedGender = watch('gender');
  const selectedBloodType = watch('bloodType');

  // Pre-populate form when patient data loads
  useEffect(() => {
    if (patient && !formReady) {
      reset({
        firstName: patient.firstName,
        surname: patient.surname,
        gender: patient.gender as 'Male' | 'Female' | 'Other',
        dateOfBirth: patient.dateOfBirth,
        address: patient.address,
        phone: patient.phone,
        bloodType: patient.bloodType as (typeof BLOOD_TYPES)[number],
        emergencyContact: patient.emergencyContact ?? '',
        allergies: patient.allergies,
      });
      setAllergies(patient.allergies ?? []);
      setFormReady(true);
    }
  }, [patient, formReady, reset]);

  function addAllergy() {
    const trimmed = allergyInput.trim();
    if (!trimmed || allergies.includes(trimmed)) return;
    const next = [...allergies, trimmed];
    setAllergies(next);
    setValue('allergies', next);
    setAllergyInput('');
  }

  function removeAllergy(item: string) {
    const next = allergies.filter((a) => a !== item);
    setAllergies(next);
    setValue('allergies', next);
  }

  const onSubmit = (data: PatientFormValues) => {
    updatePatient.mutate(
      { ...data, allergies },
      {
        onSuccess: () => {
          toast.success('Patient updated successfully');
          navigate(`/patients/${patientId}`);
        },
        onError: () => {
          toast.error('Failed to update patient. Please try again.');
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-4 text-muted-foreground">Patient not found.</div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">
        Edit Patient: {patient.firstName} {patient.surname}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  aria-invalid={!!errors.firstName}
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="surname">Surname *</Label>
                <Input
                  id="surname"
                  aria-invalid={!!errors.surname}
                  {...register('surname')}
                />
                {errors.surname && (
                  <p className="text-sm text-destructive">{errors.surname.message}</p>
                )}
              </div>
            </div>

            {/* Gender + DOB */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  value={selectedGender}
                  onValueChange={(v) =>
                    setValue('gender', v as 'Male' | 'Female' | 'Other', { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="gender" className="w-full" aria-invalid={!!errors.gender}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {GENDERS.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-destructive">{errors.gender.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  aria-invalid={!!errors.dateOfBirth}
                  {...register('dateOfBirth')}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="grid gap-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                rows={2}
                aria-invalid={!!errors.address}
                {...register('address')}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>

            {/* Phone + Blood Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  type="tel"
                  aria-invalid={!!errors.phone}
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="bloodType">Blood Type *</Label>
                <Select
                  value={selectedBloodType}
                  onValueChange={(v) =>
                    setValue('bloodType', v as (typeof BLOOD_TYPES)[number], { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="bloodType" className="w-full" aria-invalid={!!errors.bloodType}>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPES.map((bt) => (
                      <SelectItem key={bt} value={bt}>{formatBloodType(bt)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bloodType && (
                  <p className="text-sm text-destructive">{errors.bloodType.message}</p>
                )}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="grid gap-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input id="emergencyContact" {...register('emergencyContact')} />
            </div>

            {/* Allergies */}
            <div className="grid gap-2">
              <Label>Allergies</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Penicillin"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAllergy();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addAllergy}>
                  <Plus className="size-4" />
                </Button>
              </div>
              {allergies.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {allergies.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium"
                    >
                      {a}
                      <button
                        type="button"
                        onClick={() => removeAllergy(a)}
                        aria-label={`Remove ${a}`}
                        className="ml-0.5 rounded-full p-0.5 hover:bg-muted"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={updatePatient.isPending}>
                {updatePatient.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/patients/${patientId}`)}
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
