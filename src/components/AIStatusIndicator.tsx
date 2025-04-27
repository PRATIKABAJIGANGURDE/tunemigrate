
import React from "react";
import { Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { getGeminiApiKey } from "@/services/spotifyService";

interface AIStatusIndicatorProps {
  className?: string;
}

const AIStatusIndicator = ({ className }: AIStatusIndicatorProps) => {
  const [isEnabled, setIsEnabled] = React.useState(false);
  
  React.useEffect(() => {
    // Check if AI is enabled
    const apiKey = getGeminiApiKey();
    setIsEnabled(!!apiKey);
  }, []);
  
  if (!isEnabled) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline"
            className={`bg-purple-500/10 text-purple-600 border-purple-200 hover:bg-purple-500/20 flex gap-1 items-center cursor-help ${className}`}
          >
            <Sparkles className="h-3 w-3" />
            <span className="text-xs">AI Matching</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="text-sm">AI-enhanced song matching is enabled</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AIStatusIndicator;
