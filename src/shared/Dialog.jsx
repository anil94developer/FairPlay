import React from "react";
import {
  Dialog as MuiDialog,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

const Dialog = ({
  show,
  onHide,
  title,
  children,
  dialogClassName,
  contentClassName,
}) => {
  return (
    <MuiDialog
      open={show}
      onClose={onHide}
      className={dialogClassName}
      maxWidth="md"
      fullWidth
    >
      <div className={contentClassName}>
        {title && (
          <DialogTitle>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {title}
              <CloseIcon onClick={onHide} style={{ cursor: "pointer" }} />
            </div>
          </DialogTitle>
        )}
        <DialogContent>{children}</DialogContent>
      </div>
    </MuiDialog>
  );
};

export default Dialog;
