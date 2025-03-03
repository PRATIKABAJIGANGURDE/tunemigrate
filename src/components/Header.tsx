
import { motion } from "framer-motion";
import { logoAnimation } from "@/lib/motionVariants";

interface HeaderProps {
  reversed?: boolean;
}

const Header = ({ reversed = false }: HeaderProps) => {
  return (
    <motion.header 
      className="flex items-center justify-center w-full pt-10 pb-6"
      initial="hidden"
      animate="visible"
      variants={logoAnimation}
    >
      <div className="flex items-center gap-3 logo-animation">
        <div className="flex items-center">
          {/* Container for first logo */}
          <motion.div 
            className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shadow-md border border-gray-100"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {reversed ? (
              // Spotify Logo
              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="#1DB954">
                <title>Spotify</title>
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm5.387 17.543a.75.75 0 0 1-1.03.244c-2.82-1.728-6.369-2.118-10.549-1.161a.75.75 0 0 1-.313-1.466c4.503-1.016 8.382-.573 11.525 1.358a.75.75 0 0 1 .244 1.025Zm1.474-3.206a.9.9 0 0 1-1.242.293c-3.204-2.002-8.093-2.58-11.88-1.412a.9.9 0 0 1-.54-1.712c4.214-1.33 9.516-.701 13.197 1.558a.9.9 0 0 1 .293 1.273Zm.188-3.305c-3.847-2.278-10.198-2.484-13.927-1.412a1.05 1.05 0 1 1-.584-2.02c4.247-1.229 11.107-.99 15.474 1.562a1.05 1.05 0 0 1-1.063 1.87Z"/>
              </svg>
            ) : (
              // YouTube Logo
              <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.4985 6.49C23.3663 6.01903 23.1142 5.59158 22.7669 5.25205C22.4196 4.91253 21.9878 4.67573 21.515 4.57C19.643 4.19 12.1138 4.19 12.1138 4.19C12.1138 4.19 4.58455 4.19 2.71255 4.57C2.23979 4.67573 1.80798 4.91253 1.46069 5.25205C1.1134 5.59158 0.861365 6.01903 0.729151 6.49C0.346733 8.41286 0.158025 10.3631 0.165351 12.3175C0.158025 14.2719 0.346733 16.2221 0.729151 18.145C0.861365 18.616 1.1134 19.0434 1.46069 19.383C1.80798 19.7225 2.23979 19.9593 2.71255 20.065C4.58455 20.445 12.1138 20.445 12.1138 20.445C12.1138 20.445 19.643 20.445 21.515 20.065C21.9878 19.9593 22.4196 19.7225 22.7669 19.383C23.1142 19.0434 23.3663 18.616 23.4985 18.145C23.8809 16.2221 24.0696 14.2719 24.0623 12.3175C24.0696 10.3631 23.8809 8.41286 23.4985 6.49ZM9.72055 15.895V8.74L16.0745 12.3175L9.72055 15.895Z" fill="#FF0000"/>
              </svg>
            )}
          </motion.div>

          {/* Small Blue Connecting Line */}
          <div className="relative mx-1">
            <motion.div 
              className="h-0.5 bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "1.5rem" }}
              transition={{ duration: 0.5, delay: 0.3 }}
            />
          </div>

          {/* Container for second logo */}
          <motion.div 
            className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shadow-md border border-gray-100"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {reversed ? (
              // YouTube Logo
              <svg width="28" height="28" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.4985 6.49C23.3663 6.01903 23.1142 5.59158 22.7669 5.25205C22.4196 4.91253 21.9878 4.67573 21.515 4.57C19.643 4.19 12.1138 4.19 12.1138 4.19C12.1138 4.19 4.58455 4.19 2.71255 4.57C2.23979 4.67573 1.80798 4.91253 1.46069 5.25205C1.1134 5.59158 0.861365 6.01903 0.729151 6.49C0.346733 8.41286 0.158025 10.3631 0.165351 12.3175C0.158025 14.2719 0.346733 16.2221 0.729151 18.145C0.861365 18.616 1.1134 19.0434 1.46069 19.383C1.80798 19.7225 2.23979 19.9593 2.71255 20.065C4.58455 20.445 12.1138 20.445 12.1138 20.445C12.1138 20.445 19.643 20.445 21.515 20.065C21.9878 19.9593 22.4196 19.7225 22.7669 19.383C23.1142 19.0434 23.3663 18.616 23.4985 18.145C23.8809 16.2221 24.0696 14.2719 24.0623 12.3175C24.0696 10.3631 23.8809 8.41286 23.4985 6.49ZM9.72055 15.895V8.74L16.0745 12.3175L9.72055 15.895Z" fill="#FF0000"/>
              </svg>
            ) : (
              // Spotify Logo
              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="#1DB954">
                <title>Spotify</title>
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm5.387 17.543a.75.75 0 0 1-1.03.244c-2.82-1.728-6.369-2.118-10.549-1.161a.75.75 0 0 1-.313-1.466c4.503-1.016 8.382-.573 11.525 1.358a.75.75 0 0 1 .244 1.025Zm1.474-3.206a.9.9 0 0 1-1.242.293c-3.204-2.002-8.093-2.58-11.88-1.412a.9.9 0 0 1-.54-1.712c4.214-1.33 9.516-.701 13.197 1.558a.9.9 0 0 1 .293 1.273Zm.188-3.305c-3.847-2.278-10.198-2.484-13.927-1.412a1.05 1.05 0 1 1-.584-2.02c4.247-1.229 11.107-.99 15.474 1.562a1.05 1.05 0 0 1-1.063 1.87Z"/>
              </svg>
            )}
          </motion.div>
        </div>

        {/* Text Section with Animation */}
        <motion.div 
          className="ml-2"
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-foreground">Tune</span>
            <span className="text-primary">Migrate</span>
          </h1>
          <p className="text-xs text-muted-foreground -mt-1">
            {reversed ? "Spotify to YouTube converter" : "YouTube to Spotify converter"}
          </p>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default Header;
