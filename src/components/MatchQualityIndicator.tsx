
import React from "react";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MatchQualityIndicatorProps {
  confidence?: number;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
}

const MatchQualityIndicator = ({ 
  confidence, 
  showPercentage = true,
  size = "md" 
}: MatchQualityIndicatorProps) => {
  if (confidence === undefined) return null;
  
  const sizeClasses = {
    sm: "h-3 w-3 text-xs",
    md: "h-4 w-4 text-xs",
    lg: "h-5 w-5 text-sm"
  };
  
  if (confidence >= 80) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center gap-1" title={`Match confidence: ${confidence}%`}>
              <CheckCircle2 className={`${sizeClasses[size]} text-green-500`} />
              {showPercentage && <span className={`${sizeClasses[size]} text-green-500 font-medium`}>{confidence}%</span>}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1 max-w-xs">
              <p className="font-bold">Excellent Match: {confidence}%</p>
              <p>High confidence that this is the correct song on Spotify</p>
              <p className="text-green-400">Duration, title, and artist all match well</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  } else if (confidence >= 60) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center gap-1" title={`Match confidence: ${confidence}%`}>
              <CheckCircle2 className={`${sizeClasses[size]} text-yellow-500`} />
              {showPercentage && <span className={`${sizeClasses[size]} text-yellow-500 font-medium`}>{confidence}%</span>}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1 max-w-xs">
              <p className="font-bold">Good Match: {confidence}%</p>
              <p>Reasonably confident this is the correct song</p>
              <p className="text-yellow-400">Minor differences in details, but generally a good match</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  } else {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center gap-1" title={`Match confidence: ${confidence}%`}>
              <AlertTriangle className={`${sizeClasses[size]} text-orange-500`} />
              {showPercentage && <span className={`${sizeClasses[size]} text-orange-500 font-medium`}>{confidence}%</span>}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs space-y-1 max-w-xs">
              <p className="font-bold">Low Match: {confidence}%</p>
              <p>This might not be the correct song on Spotify</p>
              <p className="text-orange-400">Significant differences in duration or details</p>
              <p>Consider verifying this match manually</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
};

export default MatchQualityIndicator;
