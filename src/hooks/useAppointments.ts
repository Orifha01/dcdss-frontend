import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi } from '@/lib/api';
import type { CreateAppointmentRequest } from '@/types/api';

export function useAppointments(doctorId: number) {
  return useQuery({
    queryKey: ['appointments', doctorId],
    queryFn: () => appointmentsApi.getByDoctor(doctorId),
    enabled: !!doctorId,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAppointmentRequest) =>
      appointmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}
