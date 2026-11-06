import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePatients } from '@/hooks/usePatients';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface PatientSelectProps {
  value: number | null;
  onChange: (patientId: number, fullName: string) => void;
  error?: string;
  label?: string;
}

export default function PatientSelect({
  value,
  onChange,
  error,
  label = 'Patient *',
}: PatientSelectProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = usePatients({ pageSize: 100 });
  const patients = data?.items ?? [];

  const filtered = search.trim()
    ? patients.filter((p) =>
        `${p.firstName} ${p.surname}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : patients;

  const selected = patients.find((p) => p.patientId === value);

  // Position the portal dropdown relative to the input element
  useEffect(() => {
    if (open && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
  }, [open]);

  const dropdown =
    open ? (
      <ul
        style={dropdownStyle}
        className="max-h-56 overflow-auto rounded-lg border border-input bg-white shadow-xl text-sm"
      >
        {isLoading ? (
          <li className="flex items-center gap-2 px-3 py-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Loading…
          </li>
        ) : filtered.length === 0 ? (
          <li className="px-3 py-2 text-muted-foreground">No patients found</li>
        ) : (
          filtered.map((p) => (
            <li
              key={p.patientId}
              className="flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-accent"
              onMouseDown={() => {
                onChange(p.patientId, `${p.firstName} ${p.surname}`);
                setSearch('');
                setOpen(false);
              }}
            >
              <span>
                {p.firstName} {p.surname}
              </span>
              <span className="text-xs text-muted-foreground">ID #{p.patientId}</span>
            </li>
          ))
        )}
      </ul>
    ) : null;

  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium leading-none">{label}</label>
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder="Search patient…"
          value={
            open
              ? search
              : selected
              ? `${selected.firstName} ${selected.surname}`
              : ''
          }
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          aria-invalid={!!error}
          autoComplete="off"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {typeof document !== 'undefined' && createPortal(dropdown, document.body)}
    </div>
  );
}
