import { cn } from '@/lib/utils';

type RentalStatus = 'pending' | 'active' | 'returned' | 'overdue' | 'cancelled' | 'paused' | 'unpaid' | 'paid';

const statusStyles: Record<string, string> = {
  pending: 'bg-warning/15 text-warning border-warning/30',
  active: 'bg-success/15 text-success border-success/30',
  returned: 'bg-muted text-muted-foreground border-border',
  overdue: 'bg-overdue/15 text-overdue border-overdue/30',
  cancelled: 'bg-muted text-muted-foreground border-border',
  paused: 'bg-muted text-muted-foreground border-border',
  unpaid: 'bg-overdue/15 text-overdue border-overdue/30',
  paid: 'bg-success/15 text-success border-success/30',
};

const StatusBadge = ({ status }: { status: RentalStatus }) => {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize', statusStyles[status] || statusStyles.pending)}>
      {status}
    </span>
  );
};

export default StatusBadge;
