
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface AdBannerProps {
  position?: "top" | "bottom";
}

const AdBanner = ({ position = "bottom" }: AdBannerProps) => {
  return (
    <motion.div
      className={`w-full mx-auto max-w-4xl my-6 ${position === "top" ? "mb-8" : "mt-8"}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <Card className="overflow-hidden border border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4">
            <div className="flex-1">
              <div className="flex items-center">
                <span className="text-xs font-medium text-primary/80 uppercase tracking-wider mr-2">
                  Sponsored
                </span>
              </div>
              <h3 className="text-base font-medium mt-1">
                Upgrade to TuneMigrate Pro for unlimited conversions
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Get unlimited playlist migrations, priority support, and no ads
              </p>
            </div>
            <a 
              href="https://tunemigrate.pro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium flex items-center gap-1 hover:bg-primary/90 transition-colors"
            >
              Upgrade <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdBanner;
