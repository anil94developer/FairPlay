import React, { useState, useEffect, FC } from "react";
import { Box, Typography, IconButton } from "@material-ui/core";
import { withStyles, Theme } from "@material-ui/core/styles";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import CloseIcon from "@material-ui/icons/Close";
import { Styles } from "@material-ui/core/styles/withStyles";
import { RootState } from "../../models/RootState";
import { AlertDTO } from "../../models/Alert";
import { connect } from "react-redux";
import { setAlertMsg } from "../../store/common/commonActions";
import { WarningOutlined } from "@material-ui/icons";

const styles: Styles<
  Theme,
  {},
  | "alertContainer"
  | "success"
  | "error"
  | "warning"
  | "icon"
  | "progressBar"
  | "successBar"
  | "errorBar"
  | "warningBar"
> = (theme) => ({
  alertContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "16px",
    boxShadow: theme.shadows[3],
    borderWidth: "2px",
    borderStyle: "solid",
    backgroundColor: "#fff",
    width: "300px",
    fontSize: "13px",
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: 11,
    [theme.breakpoints.down("xs")]: {
      right: 0,
      left: 0,
      margin: "auto",
      top: "40px",
    },
  },
  success: {
    borderColor: "#4caf50",
    backgroundColor: "#e6f4ea",
  },
  error: {
    borderColor: "#f44336",
    backgroundColor: "#fcecea",
  },
  warning: {
    borderColor: "#ff9800",
    backgroundColor: "#fff4e5",
  },
  icon: {
    marginRight: "8px",
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: "4px",
    width: "100%",
    transition: "width 5s linear",
  },
  successBar: {
    backgroundColor: "#4caf50",
  },
  errorBar: {
    backgroundColor: "#f44336",
  },
  warningBar: {
    backgroundColor: "#ff9800",
  },
  message: {
    fontFamily: "Lato",
    fontWeight: 500,
    fontSize: "13px",
  },
  closeButton: {
    borderRadius: "50%",
    border: "1.25px solid gray",
    padding: "4px",
    height: "20px",
    width: "20px",
  },
});

type StateProps = {
  alert: AlertDTO;
  setAlertMsg: Function;
  classes: any;
};

const AlertBox: FC<StateProps> = ({ alert, setAlertMsg, classes }) => {
  const [progress, setProgress] = useState("100%");

  const handleClose = () => {
    setAlertMsg({
      type: "",
      message: "",
    });
  };

  useEffect(() => {
    const timerDuration =
      alert?.message === "Signed up successfully" ? 30000 : 5000;
    const timer = setTimeout(() => {
      setProgress("0%");
    }, 0);

    const closeTimer = setTimeout(() => {
      handleClose();
    }, timerDuration);

    return () => {
      clearTimeout(timer);
      clearTimeout(closeTimer);
    };
  }, [handleClose]);

  return (
    alert?.message && (
      <Box
        className={`${classes.alertContainer} ${
          alert?.type === "success"
            ? classes.success
            : alert?.type === "warning"
            ? classes.warning
            : classes.error
        }
            ${
              alert?.message === "Signed up successfully"
                ? " sign-up-success-gtm "
                : ""
            }`}
      >
        <Box display="flex" alignItems="center">
          {alert?.type === "success" ? (
            <CheckCircleIcon
              className={classes.icon}
              style={{ color: "#4caf50" }}
            />
          ) : alert?.type === "warning" ? (
            <WarningOutlined
              className={classes.icon}
              style={{ color: "#ff9800" }}
            />
          ) : (
            <ErrorIcon className={classes.icon} style={{ color: "#f44336" }} />
          )}
          <Typography
            className={classes.message}
            style={{
              color:
                alert?.type === "success"
                  ? "#4caf50"
                  : alert?.type === "warning"
                  ? "#ff9800"
                  : "#f44336",
            }}
          >
            {alert?.message}
          </Typography>
        </Box>
        <IconButton
          size="small"
          className={classes.closeButton}
          onClick={() => handleClose()}
        >
          <CloseIcon style={{ fontSize: "15px" }} />
        </IconButton>
        {/* <Box
        className={`${classes.progressBar} ${type === 'success' ? classes.successBar : classes.errorBar}`}
        style={{ width: progress }}
      /> */}
      </Box>
    )
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    alert: state.common.alert,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    setAlertMsg: (alert: AlertDTO) => dispatch(setAlertMsg(alert)),
  };
};

export const StyledAlertBox = withStyles(styles)(
  connect(mapStateToProps, mapDispatchToProps)(AlertBox)
);
