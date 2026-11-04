import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/lib/api';

export function useAuditLogs(page: number, pageSize: number) {
  return useQuery({
    queryKey: ['audit', page, pageSize],
    queryFn: () => auditApi.getPaged(page, pageSize),
  });
}
