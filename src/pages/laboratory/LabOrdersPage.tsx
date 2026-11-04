import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Search, FlaskConical } from 'lucide-react';
import { useLabResults } from '@/hooks/useLaboratory';
import useAuthStore from '@/store/authStore';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from 'cn';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';

function labStatusClass(status: string): string {
  switch (status) {
    case 'Normal': return 'bg-green-100 text-green-800';
    case 'High': return 'bg-red-100 text-red-800';
    case 'Low': return 'bg-orange-100 text-orange-800';
    case 'Ordered': return 'bg-gray-100 text-gray-700';
    case 'Indeterminate': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-700';
  }
}

export default function LabOrdersPage() {
  const { role } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isLabStaff = role === 'LaboratoryStaff';
  const canOrder = role === 'Doctor' || role === 'Nurse';

  // patientId can come from URL query param or from a local search field
  const urlPatientId = searchParams.get('patientId');
  const [patientIdInput, setPatientIdInput] = useState(urlPatientId ?? '');
  const [activePatientId, setActivePatientId] = useState<number | null>(
    urlPatientId ? Number(urlPatientId) : null,
  );

  const { data: results, isLoading } = useLabResults(activePatientId ?? 0);

  function handleSearch() {
    const n = Number(patientIdInput);
    if (n > 0) setActivePatientId(n);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Lab Orders</h1>
        {canOrder && (
          <Button onClick={() => navigate('/laboratory/order')}>
            <FlaskConical className="mr-2 size-4" />
            Order Lab Test
          </Button>
        )}
      </div>

      {/* Patient search */}
      <div className="flex items-center gap-2 max-w-sm">
        <Input
          type="number"
          placeholder="Patient ID"
          value={patientIdInput}
          onChange={(e) => setPatientIdInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          aria-label="Patient ID"
          min={1}
        />
        <Button variant="outline" onClick={handleSearch} aria-label="Search">
          <Search className="size-4" />
        </Button>
      </div>

      {activePatientId === null && (
        <p className="text-sm text-muted-foreground">
          Enter a Patient ID above to view their lab orders.
        </p>
      )}

      {activePatientId !== null && isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {activePatientId !== null && !isLoading && results && (
        <>
          <p className="text-sm text-muted-foreground">
            Showing results for Patient #{activePatientId}
            {' '}· {results.length} order{results.length !== 1 ? 's' : ''}
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Test Name</TableHead>
                <TableHead>Result Value</TableHead>
                <TableHead>Reference Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Ordered</TableHead>
                {isLabStaff && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={isLabStaff ? 7 : 6}
                    className="text-center text-muted-foreground py-8"
                  >
                    No lab orders found for this patient.
                  </TableCell>
                </TableRow>
              )}
              {results.map((r) => (
                <TableRow key={r.resultId}>
                  <TableCell>
                    <Link
                      to={`/patients/${activePatientId}`}
                      className="text-primary underline-offset-2 hover:underline"
                    >
                      #{activePatientId}
                    </Link>
                  </TableCell>
                  <TableCell>{r.testName}</TableCell>
                  <TableCell>{r.resultValue ?? '—'}</TableCell>
                  <TableCell>{r.referenceRange}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${labStatusClass(r.status)}`}
                    >
                      {r.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {format(parseISO(r.dateOrdered), 'dd MMM yyyy')}
                  </TableCell>
                  {isLabStaff && (
                    <TableCell>
                      <Link
                        to={`/laboratory/results/${r.resultId}`}
                        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
                      >
                        Upload Result
                      </Link>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
