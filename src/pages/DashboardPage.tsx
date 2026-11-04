import { Link } from 'react-router-dom';
import {
  Users,
  FlaskConical,
  Calendar,
  BarChart2,
  ClipboardList,
  UserPlus,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import useAuthStore from '@/store/authStore';
import type { Role } from '@/types/api';

interface QuickCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

const cardsByRole: Record<Role, QuickCard[]> = {
  Doctor: [
    { title: 'Patients', description: 'View and manage patient records', icon: Users, path: '/patients' },
    { title: 'Lab Orders', description: 'Order and review lab tests', icon: FlaskConical, path: '/laboratory' },
    { title: 'Appointments', description: 'Manage upcoming appointments', icon: Calendar, path: '/appointments' },
  ],
  Nurse: [
    { title: 'Patients', description: 'View and manage patient records', icon: Users, path: '/patients' },
    { title: 'Lab Orders', description: 'Order and review lab tests', icon: FlaskConical, path: '/laboratory' },
    { title: 'Appointments', description: 'Manage upcoming appointments', icon: Calendar, path: '/appointments' },
  ],
  LaboratoryStaff: [
    { title: 'Lab Orders', description: 'View and upload lab results', icon: FlaskConical, path: '/laboratory' },
    { title: 'Patients', description: 'View patient information', icon: Users, path: '/patients' },
  ],
  Administrator: [
    { title: 'Reports', description: 'View monthly statistics', icon: BarChart2, path: '/reports' },
    { title: 'Audit Log', description: 'Review system activity', icon: ClipboardList, path: '/audit' },
    { title: 'Register User', description: 'Add new staff accounts', icon: UserPlus, path: '/admin/register' },
  ],
};

export default function DashboardPage() {
  const { username, role } = useAuthStore();
  const cards = role ? cardsByRole[role] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {username ?? 'User'}</h1>
        <p className="text-muted-foreground">
          Here's a quick overview of what you can do.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ title, description, icon: Icon, path }) => (
          <Link key={path} to={path} className="group">
            <Card className="h-full transition-shadow group-hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <CardTitle>{title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
