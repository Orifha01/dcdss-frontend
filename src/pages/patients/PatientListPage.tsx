import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { UserPlus, Eye, Pencil } from 'lucide-react';
import { usePatients } from '@/hooks/usePatients';
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

const PAGE_SIZE = 20;

export default function PatientListPage() {
  const { role } = useAuthStore();
  const canEdit = role === 'Doctor' || role === 'Nurse';
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // Debounce search input 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading } = usePatients({ page, pageSize: PAGE_SIZE, search: search || undefined });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Patients</h1>
        {canEdit && (
          <Button onClick={() => navigate('/patients/new')}>
            <UserPlus className="mr-2 size-4" />
            Add Patient
          </Button>
        )}
      </div>

      <Input
        placeholder="Search by name…"
        value={searchInput}
        onChange={handleSearchChange}
        className="max-w-sm"
        aria-label="Search patients"
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Date of Birth</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Blood Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No patients found.
                  </TableCell>
                </TableRow>
              )}
              {data?.items.map((patient) => (
                <TableRow key={patient.patientId}>
                  <TableCell className="font-medium">
                    {patient.firstName} {patient.surname}
                  </TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>
                    {format(parseISO(patient.dateOfBirth), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>{patient.bloodType}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/patients/${patient.patientId}`}
                        className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
                      >
                        <Eye className="mr-1 size-4" />
                        View
                      </Link>
                      {canEdit && (
                        <Link
                          to={`/patients/${patient.patientId}/edit`}
                          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
                        >
                          <Pencil className="mr-1 size-4" />
                          Edit
                        </Link>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages} ({data?.total ?? 0} patients)
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
