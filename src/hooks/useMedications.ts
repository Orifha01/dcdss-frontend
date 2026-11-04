import { useMutation } from '@tanstack/react-query';
import { medicationsApi } from '@/lib/api';
import type { CreateMedicationRequest } from '@/types/api';

export function usePrescribeMedication() {
  return useMutation({
    mutationFn: (data: CreateMedicationRequest) =>
      medicationsApi.prescribe(data),
  });
}

export function useDiscontinueMedication() {
  return useMutation({
    mutationFn: (id: number) => medicationsApi.discontinue(id),
  });
}
