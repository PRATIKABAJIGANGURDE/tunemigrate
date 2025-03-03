
import { motion } from "framer-motion";
import { ConversionStep } from "@/types";

interface ProcessingStepsProps {
  currentStep: ConversionStep;
  reversed?: boolean;
}

const ProcessingSteps = ({ currentStep, reversed = false }: ProcessingStepsProps) => {
  const steps = reversed ? [
    { id: ConversionStep.INPUT_URL, label: "Paste URL", description: "Add your Spotify playlist link" },
    { id: ConversionStep.EXTRACTING, label: "Extract Tracks", description: "We'll fetch the songs from Spotify" },
    { id: ConversionStep.EDIT_SONGS, label: "Match Songs", description: "Find matching tracks on YouTube" },
    { id: ConversionStep.NAME_PLAYLIST, label: "Review", description: "Edit your playlist before conversion" },
    { id: ConversionStep.CREATE_PLAYLIST, label: "Create Playlist", description: "Generate your YouTube playlist" },
  ] : [
    { id: ConversionStep.INPUT_URL, label: "Input URL" },
    { id: ConversionStep.EXTRACTING, label: "Extract Songs" },
    { id: ConversionStep.EDIT_SONGS, label: "Edit Songs" },
    { id: ConversionStep.NAME_PLAYLIST, label: "Name Playlist" },
    { id: ConversionStep.CREATE_PLAYLIST, label: "Create Playlist" },
  ];

  return (
    <div className="w-full my-8">
      {reversed ? (
        <div className="grid grid-cols-5 gap-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center text-center">
              <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-3
                ${currentStep === step.id ? 'bg-primary text-white font-bold' : 
                  currentStep > step.id ? 'bg-primary/20 text-primary font-medium' : 'bg-gray-100 text-gray-500'}`}>
                {index + 1}
              </div>
              <h3 className={`text-sm font-medium ${currentStep === step.id ? 'text-primary' : 'text-gray-700'}`}>
                {step.label}
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-[120px]">{step.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-between w-full items-center relative">
          {/* Progress Bar Background */}
          <div className="absolute h-0.5 bg-muted w-full top-1/2 -translate-y-1/2 z-0" />
          
          {/* Animated Progress Bar */}
          <motion.div 
            className="absolute h-0.5 bg-primary top-1/2 -translate-y-1/2 z-0 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ 
              scaleX: currentStep / (steps.length - 1),
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />

          {/* Step Points */}
          {steps.map((step) => (
            <div key={step.id} className="z-10 flex flex-col items-center">
              <motion.div 
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2
                  ${step.id < currentStep 
                    ? 'bg-primary text-white' 
                    : step.id === currentStep 
                      ? 'bg-primary/10 text-primary border border-primary' 
                      : 'bg-muted text-muted-foreground'}`}
                initial={false}
                animate={{
                  scale: step.id === currentStep ? [1, 1.1, 1] : 1,
                  transition: { duration: 0.5 }
                }}
              >
                {step.id < currentStep ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13L9 17L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <span className="text-xs">{step.id + 1}</span>
                )}
              </motion.div>
              <span className={`text-xs ${step.id === currentStep ? 'font-medium text-primary' : 'text-muted-foreground'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProcessingSteps;
