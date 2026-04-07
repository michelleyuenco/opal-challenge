import type { ChallengeStatus } from '@domain/value-objects/ChallengeStatus'
import { Badge } from '@presentation/components/ui/Badge'

const statusConfig: Record<ChallengeStatus, { label: string; color: 'gray' | 'green' | 'yellow' }> = {
  draft: { label: 'Draft', color: 'gray' },
  active: { label: 'Active', color: 'green' },
  concluded: { label: 'Concluded', color: 'yellow' },
}

export function ChallengeStatusBadge({ status }: { status: ChallengeStatus }) {
  const config = statusConfig[status]
  return <Badge color={config.color}>{config.label}</Badge>
}
