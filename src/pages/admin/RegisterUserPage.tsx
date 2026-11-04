import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { authApi } from '@/lib/api';
import type { UserDto } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ROLES = ['Doctor', 'Nurse', 'LaboratoryStaff', 'Administrator'] as const;

const registerUserSchema = z.object({
  username: z.string().min(1, 'Username is required').max(50),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100),
  fullName: z.string().min(1, 'Full name is required').max(100),
  email: z.string().email('Invalid email address').max(150),
  role: z.enum(ROLES, { required_error: 'Role is required' }),
  department: z.string().max(100).optional(),
});

type RegisterUserFormValues = z.infer<typeof registerUserSchema>;

export default function RegisterUserPage() {
  const [createdUser, setCreatedUser] = useState<UserDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterUserFormValues>({
    resolver: zodResolver(registerUserSchema),
  });

  const onSubmit = async (data: RegisterUserFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await authApi.register({
        username: data.username,
        password: data.password,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        department: data.department || undefined,
      });
      setCreatedUser(result);
      toast.success('User registered');
      reset();
    } catch (err) {
      let message = 'Failed to register user.';
      if (axios.isAxiosError(err)) {
        const serverMsg = (err.response?.data as { message?: string })?.message;
        if (serverMsg) message = serverMsg;
      }
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Register User</h1>

      {/* Success card */}
      {createdUser && (
        <Card className="border-green-300">
          <CardHeader>
            <CardTitle className="text-green-800">User Registered Successfully</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              User <strong>{createdUser.fullName}</strong> registered as{' '}
              <strong>{createdUser.role}</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              Username: {createdUser.username}
            </p>
            <p className="text-sm text-muted-foreground">
              Email: {createdUser.email}
            </p>
            <Button
              variant="outline"
              onClick={() => setCreatedUser(null)}
              className="mt-2"
            >
              Register Another
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                aria-invalid={!!errors.username}
                {...register('username')}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                aria-invalid={!!errors.fullName}
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-sm text-destructive">{errors.fullName.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="role">Role *</Label>
              <select
                id="role"
                aria-invalid={!!errors.role}
                className="h-8 rounded-lg border border-border bg-background px-2 text-sm"
                {...register('role')}
              >
                <option value="">Select a role…</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="department">Department (optional)</Label>
              <Input
                id="department"
                {...register('department')}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Registering…
                  </>
                ) : (
                  'Register User'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
