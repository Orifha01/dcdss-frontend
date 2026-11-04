import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
      <p className="text-7xl font-bold text-destructive">403</p>
      <h1 className="text-2xl font-semibold">Access Denied</h1>
      <p className="text-muted-foreground">
        You do not have permission to view this page.
      </p>
      <Button onClick={() => navigate('/')}>Back to Dashboard</Button>
    </div>
  );
}
