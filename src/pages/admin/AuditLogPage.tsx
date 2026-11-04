import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useAuditLogs } from '@/hooks/useAudit';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';

const PAGE_SIZE = 20;

function actionBadgeClass(action: string): string {
  switch (action) {
    case 'LOGIN': return 'bg-green-100 text-green-800';
    case 'CREATE': return 'bg-blue-100 text-blue-800';
    case 'UPDATE': return 'bg-yellow-100 text-yellow-800';
    case 'DELETE':
    case 'DISCONTINUE': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-700';
  }
}

export default function AuditLogPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAuditLogs(page, PAGE_SIZE);

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Audit Log</h1>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Audit ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No audit logs found.
                  </TableCell>
                </TableRow>
              )}
              {data?.items.map((log) => (
                <TableRow key={log.auditId}>
                  <TableCell>{log.auditId}</TableCell>
                  <TableCell>{log.username ?? 'Unknown'}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${actionBadgeClass(log.action)}`}
                    >
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    {log.details
                      ? log.details.length > 80
                        ? log.details.slice(0, 80) + '…'
                        : log.details
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {format(parseISO(log.timestamp), 'dd MMM yyyy HH:mm:ss')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} ({data?.total ?? 0} entries)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
