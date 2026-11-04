import { useMutation } from '@tanstack/react-query';
import { cdsApi } from '@/lib/api';
import type { CdsEvaluationRequest } from '@/types/api';

export function useCdsEvaluate() {
  return useMutation({
    mutationFn: (data: CdsEvaluationRequest) => cdsApi.evaluate(data),
  });
}
