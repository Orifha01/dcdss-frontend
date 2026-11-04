import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import useAuthStore from '@/store/authStore';
import type { Role } from '@/types/api';

const roleBadgeClass: Record<Role, string> = {
  Doctor: 'bg-blue-100 text-blue-800 border-blue-200',
  Nurse: 'bg-green-100 text-green-800 border-green-200',
  LaboratoryStaff: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Administrator: 'bg-red-100 text-red-800 border-red-200',
};

export function Navbar() {
  const { username, role, logout } = useAuthStore();
  const navigate = useNavigate();

  const initials = username
    ? username.slice(0, 2).toUpperCase()
    : '??';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex h-14 w-full items-center justify-between border-b bg-white px-4 shadow-sm">
      {/* Left: logo */}
      <span className="text-lg font-bold tracking-tight text-primary">DCDSS</span>

      {/* Right: user info + logout */}
      <div className="flex items-center gap-3">
        <Avatar size="sm">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>

        <span className="hidden text-sm font-medium sm:block">{username}</span>

        {role && (
          <Badge
            className={roleBadgeClass[role]}
          >
            {role}
          </Badge>
        )}

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={handleLogout}
          aria-label="Logout"
        >
          <LogOut />
        </Button>
      </div>
    </header>
  );
}
