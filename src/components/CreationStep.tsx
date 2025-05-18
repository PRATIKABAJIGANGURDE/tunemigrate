
import { motion } from "framer-motion";
import AnimatedCard from "./AnimatedCard";
import LoadingIndicator from "./LoadingIndicator";
import { useState } from "react";
import { Button } from "./ui/button";
import { Clock, MusicIcon, Calendar, PercentIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CreationStepProps {
  playlistTitle: string;
  selectedSongsCount: number;
  currentProgress?: number;
}

const CreationStep = ({ 
  playlistTitle, 
  selectedSongsCount,
  currentProgress = 0
}: CreationStepProps) => {
  const isMobile = useIsMobile();
  const progressPercent = Math.min(100, currentProgress);
  const [showDetailedInfo, setShowDetailedInfo] = useState(false);
  
  return (
    <motion.div
      key="create-playlist"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatedCard className="flex flex-col items-center justify-center py-6 md:py-12">
        <LoadingIndicator 
          text="Creating Spotify playlist" 
          size={isMobile ? "md" : "lg"} 
        />
        
        {progressPercent > 0 && (
          <div className="w-full max-w-xs mt-4 bg-gray-200 rounded-full h-2 md:h-2.5 dark:bg-gray-700">
            <div 
              className="bg-primary h-2 md:h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        )}
        
        <p className="mt-2 text-xs md:text-sm font-medium">
          {progressPercent > 0 ? `${progressPercent}% complete` : ''}
        </p>
        <p className="mt-1 text-muted-foreground text-xs md:text-sm text-center px-2 md:px-4">
          Finding and adding {selectedSongsCount} songs to "{playlistTitle}"
        </p>
        
        <div className="text-[0.65rem] md:text-xs text-muted-foreground mt-3 max-w-xs space-y-1 px-2 md:px-0">
          <div className="flex items-center justify-between">
            <p className="font-medium">Smart matching in progress:</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[0.65rem] md:text-xs h-5 md:h-6 px-1 md:px-2"
              onClick={() => setShowDetailedInfo(!showDetailedInfo)}
            >
              {showDetailedInfo ? 'Show less' : 'Show more'}
            </Button>
          </div>
          
          <ul className="list-disc list-inside space-y-1">
            <li className="flex items-start">
              <span className="inline-flex items-center">
                <MusicIcon className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                AI-powered artist & title comparison
              </span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center">
                <Clock className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                Duration matching
              </span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center">
                <Calendar className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                Release & upload date analysis
              </span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center">
                <PercentIcon className="h-2.5 w-2.5 md:h-3 md:w-3 mr-1" />
                Match confidence calculation
              </span>
            </li>
          </ul>

          {showDetailedInfo && (
            <div className="mt-3 bg-muted p-2 rounded-md text-[0.65rem] md:text-xs">
              <p className="font-medium mb-1">AI-Powered Matching Algorithm:</p>
              
              <div className="space-y-1">
                <div>
                  <p className="font-medium">Artist matching (40% of score):</p>
                  <ul className="list-disc list-inside pl-1 md:pl-2">
                    <li>Uses Google Gemini AI to extract artist name</li>
                    <li>Applies fuzzy string matching algorithms</li>
                    <li>Handles featuring artists and variations</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-medium">Title matching (30% of score):</p>
                  <ul className="list-disc list-inside pl-1 md:pl-2">
                    <li>Removes YouTube-specific formatting</li>
                    <li>Identifies special versions (live, remix)</li>
                    <li>Uses Levenshtein distance for similarity</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-medium">Duration matching (20% of score):</p>
                  <ul className="list-disc list-inside pl-1 md:pl-2">
                    <li>100% if within 10 seconds</li>
                    <li>90% if within 10-20 seconds</li>
                    <li>70% if within 20-30 seconds</li>
                    <li>50% if within 30-60 seconds</li>
                    <li>20% if within 1-2 minutes</li>
                    <li>0% if more than 2 minutes different</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-medium">Release date matching (10% of score):</p>
                  <ul className="list-disc list-inside pl-1 md:pl-2">
                    <li>100% if within 6 days</li>
                    <li>80% if within 1 month</li>
                    <li>60% if within 3 months</li>
                    <li>40% if within 1 year</li>
                    <li>20% if more than 1 year</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
          
          <p className="mt-2">Songs with higher match percentage have better quality matches!</p>
        </div>
      </AnimatedCard>
    </motion.div>
  );
};

export default CreationStep;
