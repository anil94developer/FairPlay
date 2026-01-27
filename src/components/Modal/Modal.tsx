import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

import "./Modal.scss";

type ModalProps = {
  closeHandler: Function;
  open: boolean;
  title?: string;
  size: "lg" | "md" | "sm" | "xl" | "xs";
  customClass?: string;
  noTitle?: boolean;
  disableFullScreen?: boolean;
  hideCloseIcon?: boolean;
};

const Modal: React.FC<ModalProps> = (props) => {
  const {
    children,
    closeHandler,
    customClass,
    open,
    title,
    size,
    noTitle,
    disableFullScreen,
    hideCloseIcon,
  } = props;
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down(size));

  const handleClose = () => {
    closeHandler();
  };

  return (
    <Dialog
      fullScreen={disableFullScreen ? false : fullScreen}
      open={open}
      onClose={handleClose}
      aria-labelledby="responsive-dialog-title"
      maxWidth={size}
      fullWidth={true}
      className={customClass}
    >
      {noTitle ? null : (
        <DialogTitle className={"modal-title"} id="responsive-dialog-title">
          {title}
        </DialogTitle>
      )}
      {!hideCloseIcon && (
        <IconButton
          aria-label="close"
          className={
            customClass ? "dark-colose-btn modal-close-btn" : "modal-close-btn"
          }
          onClick={handleClose}
        >
          <CloseIcon />
        </IconButton>
      )}
      <DialogContent
        className="modal-content-ctn"
        onClick={hideCloseIcon ? handleClose : null}
      >
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
