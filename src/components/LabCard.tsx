import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Droplets, AlertTriangle } from "lucide-react";

interface Lab {
  id: string;
  name: string;
  description?: string;
  base_price: number;
  suggested_service_fee?: number;
  fee_justification?: string;
  category: string;
  fasting_required?: boolean;
  turnaround_days?: string;
  sample_type?: string;
  optimization_tags?: string[];
}

interface LabCardProps {
  lab: Lab;
  onAdd: (lab: Lab) => void;
  isInCart?: boolean;
}

export function LabCard({ lab, onAdd, isInCart = false }: LabCardProps) {
  const serviceFee = lab.suggested_service_fee || 75;
  const totalPrice = lab.base_price + serviceFee;

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{lab.name}</CardTitle>
          {lab.optimization_tags && lab.optimization_tags.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {lab.optimization_tags[0]}
            </Badge>
          )}
        </div>
        {lab.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {lab.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
        {/* Test Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {lab.fasting_required && (
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Fasting required</span>
              </div>
            )}
            {lab.turnaround_days && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{lab.turnaround_days} days</span>
              </div>
            )}
            {lab.sample_type && (
              <div className="flex items-center gap-1">
                <Droplets className="h-3 w-3" />
                <span>{lab.sample_type}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Lab cost:</span>
            <span>${lab.base_price}</span>
          </div>
          <div className="flex justify-between text-sm text-green-600">
            <span>AI Analysis:</span>
            <span>${serviceFee}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span>${totalPrice}</span>
            </div>
          </div>
        </div>

        {/* Fee Justification */}
        {lab.fee_justification && (
          <p className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
            {lab.fee_justification}
          </p>
        )}

        {/* Add to Cart Button */}
        <Button 
          onClick={() => onAdd(lab)}
          disabled={isInCart}
          className="w-full"
          variant={isInCart ? "secondary" : "default"}
        >
          {isInCart ? "Added to Cart" : "Add to Cart"}
        </Button>
      </CardContent>
    </Card>
  );
}