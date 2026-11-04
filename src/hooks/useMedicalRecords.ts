import { useMutation, useQueryClient } from '@tanstack/react-query';
import { medicalRecordsApi } from '@/lib/api';
import type { CreateMedicalRecordRequest } from '@/types/api';

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMedicalRecordRequest) =>
      medicalRecordsApi.create(data),
    onSuccess: (_result, variables) => {
      // Invalidate the patient detail query so medical history refreshes
      queryClient.invalidateQueries({ queryKey: ['patient', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['patient'] });
    },
  });
}
