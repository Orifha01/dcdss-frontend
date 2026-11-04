import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';

export function useMonthlyStats(month: number, year: number) {
  return useQuery({
    queryKey: ['reports', month, year],
    queryFn: () => reportsApi.getMonthlyStats(month, year),
    enabled: !!month && !!year,
  });
}
