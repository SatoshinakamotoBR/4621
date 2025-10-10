import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  iconColor?: string;
}

const StatCard = ({ title, value, subtitle, icon: Icon, iconColor = "text-primary" }: StatCardProps) => {
  return (
    <Card className="glass-card border-glass-border/50 hover:border-primary/30 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="glass-card p-2 rounded-lg">
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground mb-1">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
};

export default StatCard;