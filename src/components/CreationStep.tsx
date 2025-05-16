
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
  const progressPercent = Math.min(100, currentProgress);
  const [showDetailedInfo, setShowDetailedInfo] = useState(false);
  const isMobile = useIsMobile();
  
  return (
    <motion.div
      key="create-playlist"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatedCard className="flex flex-col items-center justify-center py-8 sm:py-16 px-4 sm:px-8">
        <LoadingIndicator text="Creating Spotify playlist" size={isMobile ? "md" : "lg"} />
        
        {progressPercent > 0 && (
          <div className="w-full max-w-xs mt-6 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        )}
        
        <p className="mt-4 text-sm font-medium">
          {progressPercent > 0 ? `${progressPercent}% complete` : ''}
        </p>
        <p className="mt-2 text-muted-foreground text-sm text-center">
          Finding and adding {selectedSongsCount} songs to "{playlistTitle}"
        </p>
        
        <div className="text-xs text-muted-foreground mt-4 max-w-xs space-y-1 w-full">
          <div className="flex items-center justify-between">
            <p className="font-medium">Smart matching in progress:</p>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-6 px-2"
              onClick={() => setShowDetailedInfo(!showDetailedInfo)}
            >
              {showDetailedInfo ? 'Show less' : 'Show more'}
            </Button>
          </div>
          
          <ul className="list-disc list-inside space-y-2 px-1">
            <li className="flex items-start flex-wrap">
              <span className="inline-flex items-center">
                <MusicIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                AI-powered artist & title comparison
              </span>
            </li>
            <li className="flex items-start flex-wrap">
              <span className="inline-flex items-center">
                <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                Duration matching (10-20s ideal, 1-2min poor)
              </span>
            </li>
            <li className="flex items-start flex-wrap">
              <span className="inline-flex items-center">
                <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                Release & upload date analysis
              </span>
            </li>
            <li className="flex items-start flex-wrap">
              <span className="inline-flex items-center">
                <PercentIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                Match confidence calculation
              </span>
            </li>
          </ul>

          {showDetailedInfo && (
            <div className="mt-4 bg-muted p-3 rounded-md text-xs overflow-x-auto">
              <p className="font-medium mb-2">AI-Powered Matching Algorithm:</p>
              
              <div className="space-y-3">
                <div>
                  <p className="font-medium">Artist matching (40% of score):</p>
                  <ul className="list-disc list-inside pl-2">
                    <li>Uses Google Gemini AI to extract artist name</li>
                    <li>Applies fuzzy string matching algorithms</li>
                    <li>Handles featuring artists and variations</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-medium">Title matching (30% of score):</p>
                  <ul className="list-disc list-inside pl-2">
                    <li>Removes YouTube-specific formatting</li>
                    <li>Identifies special versions (live, remix, acoustic)</li>
                    <li>Uses Levenshtein distance for similarity</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-medium">Duration matching (20% of score):</p>
                  <ul className="list-disc list-inside pl-2">
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
                  <ul className="list-disc list-inside pl-2">
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
          
          <p className="mt-2 text-center">Songs with higher match percentage have better quality matches!</p>
        </div>
      </AnimatedCard>
    </motion.div>
  );
};

export default CreationStep;
