import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FlaskConical,
  Pill,
  Calendar,
  Brain,
  BarChart2,
  ClipboardList,
  UserPlus,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import useAuthStore from '@/store/authStore';
import type { Role } from '@/types/api';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
    roles: ['Administrator', 'Doctor', 'Nurse', 'LaboratoryStaff'],
  },
  {
    label: 'Patients',
    icon: Users,
    path: '/patients',
    roles: ['Doctor', 'Nurse', 'LaboratoryStaff'],
  },
  {
    label: 'Lab Orders',
    icon: FlaskConical,
    path: '/laboratory',
    roles: ['Doctor', 'Nurse', 'LaboratoryStaff'],
  },
  {
    label: 'Medications',
    icon: Pill,
    path: '/medications/prescribe',
    roles: ['Doctor'],
  },
  {
    label: 'Appointments',
    icon: Calendar,
    path: '/appointments',
    roles: ['Doctor', 'Nurse', 'Administrator'],
  },
  {
    label: 'CDS Evaluate',
    icon: Brain,
    path: '/cds/evaluate',
    roles: ['Doctor', 'Nurse'],
  },
  {
    label: 'Reports',
    icon: BarChart2,
    path: '/reports',
    roles: ['Administrator'],
  },
  {
    label: 'Audit Log',
    icon: ClipboardList,
    path: '/audit',
    roles: ['Administrator'],
  },
  {
    label: 'Register User',
    icon: UserPlus,
    path: '/admin/register',
    roles: ['Administrator'],
  },
];

export function Sidebar() {
  const { role } = useAuthStore();
  const [open, setOpen] = useState(false);

  const visibleItems = role
    ? NAV_ITEMS.filter((item) => item.roles.includes(role))
    : [];

  const NavItems = ({ collapsed }: { collapsed: boolean }) => (
    <ul className="flex flex-col gap-1 p-2">
      {visibleItems.map(({ label, icon: Icon, path }) => (
        <li key={path}>
          <NavLink
            to={path}
            end={path === '/'}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-muted hover:text-foreground',
                isActive
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
                  : 'text-muted-foreground'
              )
            }
          >
            <Icon className="size-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="fixed left-4 top-4 z-50 rounded-lg border bg-white p-1.5 shadow-sm md:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle navigation"
      >
        {open ? <X className="size-4" /> : <Menu className="size-4" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-56 border-r bg-white transition-transform md:hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-lg font-bold tracking-tight text-primary">DCDSS</span>
        </div>
        <NavItems collapsed={false} />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 flex-col border-r bg-white md:flex">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-base font-bold tracking-tight text-primary">DCDSS</span>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <NavItems collapsed={false} />
        </nav>
      </aside>
    </>
  );
}
