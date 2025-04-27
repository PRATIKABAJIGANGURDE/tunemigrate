
import React from "react";
import { Button } from "@/components/ui/button";
import { Replace } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MatchQualityIndicatorProps {
  confidence: number;
  alternativeTracks?: any[];
  onReplace?: (track: any) => void;
}

const MatchQualityIndicator = ({ 
  confidence, 
  alternativeTracks = [], 
  onReplace
}: MatchQualityIndicatorProps) => {
  const getColor = () => {
    if (confidence >= 85) return "text-green-500";
    if (confidence >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`font-medium ${getColor()}`}>
              {confidence}%
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Match confidence score</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {alternativeTracks && alternativeTracks.length > 0 && onReplace && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                onClick={() => onReplace(alternativeTracks[0])}
              >
                <Replace className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Show alternative matches</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default MatchQualityIndicator;
