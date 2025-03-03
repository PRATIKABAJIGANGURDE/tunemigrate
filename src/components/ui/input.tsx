
import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  icon?: "spotify" | "youtube";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            {icon === "spotify" ? (
              <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-spotify">
                <path fill="currentColor" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0Zm5.387 17.543a.75.75 0 0 1-1.03.244c-2.82-1.728-6.369-2.118-10.549-1.161a.75.75 0 0 1-.313-1.466c4.503-1.016 8.382-.573 11.525 1.358a.75.75 0 0 1 .244 1.025Zm1.474-3.206a.9.9 0 0 1-1.242.293c-3.204-2.002-8.093-2.58-11.88-1.412a.9.9 0 0 1-.54-1.712c4.214-1.33 9.516-.701 13.197 1.558a.9.9 0 0 1 .293 1.273Zm.188-3.305c-3.847-2.278-10.198-2.484-13.927-1.412a1.05 1.05 0 1 1-.584-2.02c4.247-1.229 11.107-.99 15.474 1.562a1.05 1.05 0 0 1-1.063 1.87Z"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="text-youtube">
                <path fill="currentColor" d="M23.4985 6.49C23.3663 6.01903 23.1142 5.59158 22.7669 5.25205C22.4196 4.91253 21.9878 4.67573 21.515 4.57C19.643 4.19 12.1138 4.19 12.1138 4.19C12.1138 4.19 4.58455 4.19 2.71255 4.57C2.23979 4.67573 1.80798 4.91253 1.46069 5.25205C1.1134 5.59158 0.861365 6.01903 0.729151 6.49C0.346733 8.41286 0.158025 10.3631 0.165351 12.3175C0.158025 14.2719 0.346733 16.2221 0.729151 18.145C0.861365 18.616 1.1134 19.0434 1.46069 19.383C1.80798 19.7225 2.23979 19.9593 2.71255 20.065C4.58455 20.445 12.1138 20.445 12.1138 20.445C12.1138 20.445 19.643 20.445 21.515 20.065C21.9878 19.9593 22.4196 19.7225 22.7669 19.383C23.1142 19.0434 23.3663 18.616 23.4985 18.145C23.8809 16.2221 24.0696 14.2719 24.0623 12.3175C24.0696 10.3631 23.8809 8.41286 23.4985 6.49ZM9.72055 15.895V8.74L16.0745 12.3175L9.72055 15.895Z"/>
              </svg>
            )}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            icon && "pl-10",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
