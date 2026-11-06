import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Loader2, Info } from 'lucide-react';
import { useOrderLabTest } from '@/hooks/useLaboratory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const orderSchema = z.object({
  recordId: z.coerce.number({ required_error: 'Record ID is required' }).positive('Record ID must be positive'),
  testName: z.string().min(1, 'Test name is required'),
  referenceRange: z.string().min(1, 'Reference range is required'),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export default function OrderLabTestPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientIdStr = searchParams.get('patientId');
  const recordIdStr = searchParams.get('recordId');

  const patientId = patientIdStr ? Number(patientIdStr) : null;

  const orderLabTest = useOrderLabTest();

  const {
    register,
    handleSubmit,
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
          navigate(patientId ? `/laboratory?patientId=${patientId}` : '/laboratory');
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
          A medical record (Record ID) is required before ordering a lab test. Create one from the
          patient's detail page if needed.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Lab Test Details</CardTitle>
          {patientId && (
            <CardDescription>Patient #{patientId}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="recordId">Medical Record ID *</Label>
              <Input
                id="recordId"
                type="number"
                min={1}
                aria-invalid={!!errors.recordId}
                {...register('recordId')}
              />
              {errors.recordId && (
                <p className="text-sm text-destructive">{errors.recordId.message}</p>
              )}
            </div>

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
              <Button type="submit" disabled={orderLabTest.isPending}>
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
                onClick={() =>
                  navigate(patientId ? `/laboratory?patientId=${patientId}` : '/laboratory')
                }
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
