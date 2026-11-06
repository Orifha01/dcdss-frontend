import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useUpdateLabResult } from '@/hooks/useLaboratory';
import type { LabResultDto } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const uploadSchema = z.object({
  resultValue: z.string().min(1, 'Result value is required'),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

function statusColorClass(status: string): string {
  switch (status) {
    case 'Normal': return 'bg-green-100 text-green-800 border-green-200';
    case 'High': return 'bg-red-100 text-red-800 border-red-200';
    case 'Low': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'Indeterminate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export default function UploadLabResultPage() {
  const { id } = useParams<{ id: string }>();
  const resultId = Number(id);
  const navigate = useNavigate();

  const updateResult = useUpdateLabResult(resultId);
  const [uploadedResult, setUploadedResult] = useState<LabResultDto | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
  });

  const onSubmit = (data: UploadFormValues) => {
    updateResult.mutate(
      { resultValue: data.resultValue },
      {
        onSuccess: (result) => {
          setUploadedResult(result);
          toast.success(`Result uploaded — classified as ${result.status}`);
        },
        onError: () => {
          toast.error('Failed to upload result. Please try again.');
        },
      },
    );
  };

  // Show result card after successful upload
  if (uploadedResult) {
    return (
      <div className="mx-auto max-w-md space-y-6">
        <h1 className="text-2xl font-semibold">Result Uploaded</h1>
        <Card>
          <CardHeader>
            <CardTitle>{uploadedResult.testName}</CardTitle>
            <CardDescription>Result ID #{uploadedResult.resultId}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Result Value</p>
                <p className="font-medium">{uploadedResult.resultValue}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reference Range</p>
                <p>{uploadedResult.referenceRange}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Auto-Classified Status</p>
              <span
                className={`inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold ${statusColorClass(uploadedResult.status)}`}
              >
                {uploadedResult.status}
              </span>
            </div>
            <Button variant="outline" onClick={() => navigate('/laboratory')}>
              Back to Lab Orders
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <h1 className="text-2xl font-semibold">Upload Lab Result</h1>
      <Card>
        <CardHeader>
          <CardTitle>Result #{resultId}</CardTitle>
          <CardDescription>
            Enter the measured result value. The system will automatically classify it as Normal,
            High, Low, or Indeterminate based on the reference range.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="resultValue">Result Value *</Label>
              <Input
                id="resultValue"
                placeholder="e.g. 95 mg/dL"
                aria-invalid={!!errors.resultValue}
                {...register('resultValue')}
              />
              {errors.resultValue && (
                <p className="text-sm text-destructive">{errors.resultValue.message}</p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={updateResult.isPending}>
                {updateResult.isPending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  'Upload Result'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/laboratory')}
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
