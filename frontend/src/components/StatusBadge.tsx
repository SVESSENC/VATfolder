import type { AppStatus } from '../api/client';

const labels: Record<AppStatus, string> = {
  draft: 'Draft',
  validated: 'Validated',
  queued: 'Queued',
  submitted: 'Submitted',
  accepted: 'Accepted',
  rejected: 'Rejected',
  needs_info: 'Needs Info',
};

export default function StatusBadge({ status }: { status: AppStatus }) {
  return (
    <span className={`badge badge-${status}`}>{labels[status] ?? status}</span>
  );
}
