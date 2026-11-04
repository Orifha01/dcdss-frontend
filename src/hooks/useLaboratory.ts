import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { laboratoryApi } from '@/lib/api';
import type { OrderLabTestRequest, UpdateLabResultRequest } from '@/types/api';

export function useLabResults(patientId: number) {
  return useQuery({
    queryKey: ['lab', patientId],
    queryFn: () => laboratoryApi.getByPatient(patientId),
    enabled: !!patientId,
  });
}

export function useOrderLabTest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OrderLabTestRequest) => laboratoryApi.order(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab'] });
    },
  });
}

export function useUpdateLabResult(id: number) {
  return useMutation({
    mutationFn: (data: UpdateLabResultRequest) =>
      laboratoryApi.updateResult(id, data),
  });
}
