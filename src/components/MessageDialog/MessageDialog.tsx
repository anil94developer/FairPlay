import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@material-ui/core";

interface MessageDialogProps {
  open: boolean;
  handleClose: () => void;
  message: string;
}

const MessageDialog: React.FC<MessageDialogProps> = ({
  open,
  handleClose,
  message,
}) => {
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Message</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MessageDialog;
