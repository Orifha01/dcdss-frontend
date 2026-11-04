import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Search, CalendarPlus } from 'lucide-react';
import { useAppointments } from '@/hooks/useAppointments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';

function appointmentStatusClass(status: string): string {
  switch (status) {
    case 'Scheduled': return 'bg-blue-100 text-blue-800';
    case 'Completed': return 'bg-green-100 text-green-800';
    case 'Cancelled': return 'bg-gray-100 text-gray-700';
    default: return 'bg-gray-100 text-gray-700';
  }
}

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [doctorIdInput, setDoctorIdInput] = useState('');
  const [activeDoctorId, setActiveDoctorId] = useState<number | null>(null);

  const { data: appointments, isLoading } = useAppointments(activeDoctorId ?? 0);

  function handleSearch() {
    const n = Number(doctorIdInput);
    if (n > 0) setActiveDoctorId(n);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <Button onClick={() => navigate('/appointments/new')}>
          <CalendarPlus className="mr-2 size-4" />
          Book Appointment
        </Button>
      </div>

      {/* Doctor search */}
      <div className="flex items-center gap-2 max-w-sm">
        <Input
          type="number"
          placeholder="Doctor ID"
          value={doctorIdInput}
          onChange={(e) => setDoctorIdInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSearch();
          }}
          aria-label="Doctor ID"
          min={1}
        />
        <Button variant="outline" onClick={handleSearch} aria-label="Search">
          <Search className="size-4" />
        </Button>
      </div>

      {activeDoctorId === null && (
        <p className="text-sm text-muted-foreground">
          Enter a Doctor ID above to view their appointments.
        </p>
      )}

      {activeDoctorId !== null && isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {activeDoctorId !== null && !isLoading && appointments && (
        <>
          {appointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No appointments found for this doctor.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Doctor Name</TableHead>
                  <TableHead>Appointment Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appt) => (
                  <TableRow key={appt.appointmentId}>
                    <TableCell>{appt.patientName ?? 'Unknown'}</TableCell>
                    <TableCell>{appt.doctorName ?? 'Unknown'}</TableCell>
                    <TableCell>
                      {format(parseISO(appt.appointmentDate), 'dd MMM yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${appointmentStatusClass(appt.status)}`}
                      >
                        {appt.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </div>
  );
}
