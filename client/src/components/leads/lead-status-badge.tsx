interface LeadStatusBadgeProps {
  status: string;
}

export default function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  return (
    <span className={`status-badge ${status}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
