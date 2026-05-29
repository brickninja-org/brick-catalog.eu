import { Card } from '@heroui/react/card';

interface OverviewEmptyStateCardProps {
  message: string,
}

export function OverviewEmptyStateCard({ message }: OverviewEmptyStateCardProps) {
  return (
    <Card>
      <Card.Content>
        <p className="text-muted text-sm">{message}</p>
      </Card.Content>
    </Card>
  );
}
