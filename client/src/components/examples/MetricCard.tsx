import { MetricCard } from '@/components/MetricCard';
import { Users } from 'lucide-react';

export default function MetricCardExample() {
  return (
    <div className="p-6 bg-background">
      <MetricCard
        title="Total Employees"
        value={42}
        icon={Users}
        color="text-purple-600"
        trend={{ value: '+5 from last month', positive: true }}
      />
    </div>
  );
}
