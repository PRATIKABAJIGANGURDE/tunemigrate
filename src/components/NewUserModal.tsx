
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface NewUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExistingUser: () => void;
  onNewUser?: () => void; // Making this optional since we'll handle navigation separately
}

const NewUserModal = ({
  isOpen,
  onClose,
  onExistingUser,
  onNewUser,
}: NewUserModalProps) => {
  const navigate = useNavigate();
  
  const handleNewUser = () => {
    // Close the modal first
    onClose();
    // If onNewUser callback exists, call it
    if (onNewUser) {
      onNewUser();
    }
    // Navigate to waitlist page
    navigate("/waitlist");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-center">Welcome to TuneMigrate!</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Are you new to our YouTube to Spotify playlist converter?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-center mt-4">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/10"
            onClick={handleNewUser}
          >
            Yes, I'm new here
          </Button>
          <Button
            onClick={onExistingUser}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            No, I'm an existing user
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewUserModal;
