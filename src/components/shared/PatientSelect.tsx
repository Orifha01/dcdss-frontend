import { useState } from 'react';
import { usePatients } from '@/hooks/usePatients';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface PatientSelectProps {
  value: number | null;
  onChange: (patientId: number, fullName: string) => void;
  error?: string;
  label?: string;
}

/**
 * Searchable patient picker. Fetches up to 100 patients and filters client-side.
 * Falls back to showing all if search is empty.
 */
export default function PatientSelect({ value, onChange, error, label = 'Patient *' }: PatientSelectProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const { data, isLoading } = usePatients({ pageSize: 100 });
  const patients = data?.items ?? [];

  const filtered = search.trim()
    ? patients.filter((p) =>
        `${p.firstName} ${p.surname}`.toLowerCase().includes(search.toLowerCase())
      )
    : patients;

  const selected = patients.find((p) => p.patientId === value);

  return (
    <div className="relative z-50 grid gap-2">
      <label className="text-sm font-medium leading-none">{label}</label>
      <div className="relative">
        <Input
          placeholder={selected ? `${selected.firstName} ${selected.surname}` : 'Search patient…'}
          value={open ? search : selected ? `${selected.firstName} ${selected.surname}` : ''}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          aria-invalid={!!error}
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 className="absolute right-2 top-2 size-4 animate-spin text-muted-foreground" />
        )}
        {open && filtered.length > 0 && (
          <ul className="absolute z-[9999] mt-1 max-h-56 w-full overflow-auto rounded-lg border border-input bg-popover shadow-lg text-sm">
            {filtered.map((p) => (
              <li
                key={p.patientId}
                className="flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-accent"
                onMouseDown={() => {
                  onChange(p.patientId, `${p.firstName} ${p.surname}`);
                  setSearch('');
                  setOpen(false);
                }}
              >
                <span>{p.firstName} {p.surname}</span>
                <span className="text-xs text-muted-foreground">ID #{p.patientId}</span>
              </li>
            ))}
          </ul>
        )}
        {open && !isLoading && filtered.length === 0 && (
          <div className="absolute z-[9999] mt-1 w-full rounded-lg border border-input bg-popover px-3 py-2 text-sm text-muted-foreground shadow-lg">
            No patients found
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
