import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '@/lib/api';
import type { CreatePatientRequest, UpdatePatientRequest } from '@/types/api';

interface PatientsParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export function usePatients(params: PatientsParams = {}) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => patientsApi.getAll(params),
  });
}

export function usePatient(id: number) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePatientRequest) => patientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useUpdatePatient(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePatientRequest) => patientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', id] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
