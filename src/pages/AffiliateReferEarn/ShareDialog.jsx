import React, { useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { Button, DialogActions } from "@material-ui/core";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const ShareDialog = ({ show, onClose }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSelfPassword, setShowSelfPassword] = useState(false);
  const [phone, setPhone] = useState("");

  return (
    <Dialog
      open={show}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className="add-user-modal"
    >
      <div className="login-component">
        <div className="modal-dialog" style={{ margin: 0, maxWidth: "none" }}>
          <div className="modal-content">
            <div className="modal-header bg-transparent border-0">
              <DialogActions>
                <Button
                  onClick={onClose}
                  color="primary"
                  autoFocus
                  disableRipple
                >
                  <svg
                    height="24"
                    width="24"
                    fill="var(--color-quaternary)"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fad"
                    data-icon="circle-xmark"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                  >
                    <g className="fa-duotone-group">
                      <path
                        fill="black"
                        d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"
                      ></path>
                      <path
                        fill="white"
                        d="M209 175c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47z"
                      ></path>
                    </g>
                  </svg>
                </Button>
              </DialogActions>
            </div>
            <div className="modal-body position-relative">
              <form className="login-form">
                <PhoneInput
                  country={"us"}
                  value={phone}
                  onChange={(phone) => setPhone(phone)}
                  containerClass="mb-3"
                />
                <button className="login-button mb-4">WhatsApp OTP</button>
                <TextField
                  id="username"
                  name="username"
                  label="Username"
                  placeholder="Enter Username"
                  variant="outlined"
                  fullWidth
                  className="mb-3"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  id="password"
                  name="password"
                  label="password"
                  placeholder="password"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  fullWidth
                  required
                  className="mb-3"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  id="cpassword"
                  name="cpassword"
                  label="Confirm Password"
                  placeholder="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  variant="outlined"
                  fullWidth
                  required
                  className="mb-3"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          edge="end"
                        >
                          {showConfirmPassword ? (
                            <Visibility />
                          ) : (
                            <VisibilityOff />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  id="selt_password"
                  name="selt_password"
                  label="Self Password"
                  placeholder="Self Password"
                  type={showSelfPassword ? "text" : "password"}
                  variant="outlined"
                  fullWidth
                  required
                  className="mb-3"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowSelfPassword(!showSelfPassword)}
                          edge="end"
                        >
                          {showSelfPassword ? (
                            <Visibility />
                          ) : (
                            <VisibilityOff />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <button type="submit" className="login-button">
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ShareDialog;
