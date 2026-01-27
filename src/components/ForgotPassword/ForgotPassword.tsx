import { IonSpinner } from "@ionic/react";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import TextField from "@material-ui/core/TextField";

import Button from "@material-ui/core/Button";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { useFormik } from "formik";
import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import { useHistory } from "react-router";

import { connect, useDispatch } from "react-redux";
import * as Yup from "yup";
import { setAlertMsg } from "../../store/common/commonActions";
import SVLS_API from "../../svls-api";
import "./ForgotPassword.scss";
import SocialMediaNew from "../SocialMediaNew/SocialMediaNew";
import CopyIcon from "../../assets/images/MyProfileIcons/copy_icon.svg";
import { StyledAlertBox } from "../Alert/AlertBox";
import { RootState } from "../../models/RootState";
import { getEnvVariable } from "../../constants/whitelabelEnv";
import { domain } from "../../constants/Branding";
import Logo from "../../assets/images/theme/title.png";

type ForgotPwdForm = {
  closeHandler: () => void;
  langData: any;
};

const ForgotPwdForm: React.FC<ForgotPwdForm> = (props) => {
  const { langData } = props;
  let history = useHistory();

  return (
    <div className="fgt-pwd">
      <div className="title-row">
        <img src={Logo} alt="website" className="logo" />
      </div>
      <div className="form-ctn">
        <UsernameVerfication langData={langData} />
      </div>

      <div className="social-media-fp">
        <SocialMediaNew />
      </div>

      <div className="disclaimer-ctn-fg">
        <div className="disclaimer-ctn-text-fg">
          {langData?.["login_disclaimer_txt"]}
        </div>
      </div>
    </div>
  );
};

function UsernameVerfication({ langData }) {
  const [option, setOption] = useState("Username");
  const [progress, setProgress] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState();
  const [disable, setDisable] = useState(true);
  const [otpTimer, setOtpTimer] = useState<number>();
  const [userName, setUserName] = useState<string>(false);
  const history = useHistory();
  const dispatch = useDispatch();
  const requiredMessage = langData?.["required"];

  const redirectToSignUp = () => {
    history.push("/register");
  };

  const redirectToLogin = () => {
    history.push("/login");
  };

  const handleOtpTimer = (time) => {
    if (time >= 0) {
      setOtpTimer(time);
      setTimeout(() => {
        handleOtpTimer(time - 1);
      }, 1000);
    } else {
      setTimeout(() => {
        setOtpTimer(undefined);
      }, 1000);
    }
  };

  const copyText = (text, toastMessage = langData?.["text_copied_txt"]) => {
    navigator.clipboard.writeText(text);
    dispatch(
      setAlertMsg({
        type: "success",
        message: toastMessage,
      })
    );
  };

  return (
    <>
      {/* TODO: FIX */}
      <StyledAlertBox />
      <div className="back-icon-fg" onClick={redirectToLogin}>
        <ArrowBackIcon className="  arrow-clr" />
        <span className="back-text">{langData?.["back"]}</span>
      </div>
      <h1>{langData?.["forgot_username_password_txt"]}</h1>
      {userName ? (
        <>
          <h3>{langData?.["your_username_is_txt"]}:</h3>
          <div className="display-username">
            {userName}
            <button
              className="r-copy-btn-div"
              onClick={() =>
                copyText(userName, langData?.["username_copied_txt"])
              }
            >
              <img src={CopyIcon} className="r-copy-btn" height={28} />
            </button>
          </div>
        </>
      ) : (
        <>
          <span className="otp-text">
            {langData?.["forgot_password_send_otp_txt"]}
          </span>
          <form className="forgot-pwd-form-ctn" autoComplete="off">
            <div className="select-input .pwd-field">
              <select className="option-selection">
                <option value="Username">{langData?.["user_id"]}</option>
                <option value="Phone number">{langData?.["mobile"]}</option>
              </select>
              <div className="w-78">
                {option === "Username" ? (
                  <TextField
                    className="login-input-field text-field  userName-otp"
                    type="text"
                    name="username"
                    placeholder={langData?.["enter_username_txt"]}
                    variant="outlined"
                    autoFocus
                  />
                ) : (
                  <div className="text-field">
                    <PhoneInput
                      inputClass="fp-phone-input"
                      containerClass="fp-phone-ctn"
                      country={"in"}
                      placeholder={langData?.["enter_phone_number_txt"]}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="error-msg">{errorMsg}</div>

            <Button
              className="confirm-btn send-btn send-otp"
              color="primary"
              type="submit"
              endIcon={progress ? <IonSpinner name="lines-small" /> : ""}
              variant="contained"
            >
              {otpTimer !== undefined && otpTimer !== null && otpTimer >= 0
                ? `${langData?.["resend_in_txt"]} ${otpTimer} ${langData?.["seconds"]}`
                : `${langData?.["send_otp"]}`}
            </Button>
          </form>
          <form className="forgot-pwd-form-ctn" autoComplete="off">
            <div className="usr-input">
              <TextField
                className="login-input-field user-name"
                placeholder={langData?.["enter_otp_txt"]}
                type="text"
                name="otp"
                variant="outlined"
                autoFocus
                disabled={disable}
              />
            </div>

            <div className="usr-input">
              <FormControl
                className="login-input-field pwd-field"
                variant="outlined"
              >
                <OutlinedInput
                  id="standard-adornment-password"
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  disabled={disable}
                  placeholder={langData?.["enter_new_password_txt"]}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        onMouseDown={(event) => event.preventDefault()}
                      >
                        {showNewPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
            </div>

            <div className="usr-input">
              <FormControl
                className="login-input-field pwd-field"
                variant="outlined"
              >
                <OutlinedInput
                  id="standard-adornment-password"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  disabled={disable}
                  placeholder={langData?.["enter_confirm_password_txt"]}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        onMouseDown={(event) => event.preventDefault()}
                      >
                        {showConfirmPassword ? (
                          <Visibility className="no-margin" />
                        ) : (
                          <VisibilityOff className="no-margin" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
            </div>

            <span className="error-msg">{errMsg}</span>

            <Button
              className="confirm-btn reset-btn width"
              color="primary"
              endIcon={loading ? <IonSpinner name="lines-small" /> : ""}
              type="submit"
              variant="contained"
            >
              {langData?.["reset_password_txt"]}
            </Button>
          </form>
        </>
      )}
      <div className="dont-have-accnt" onClick={redirectToSignUp}>
        <div className="account-dontHaveAccount">
          {langData?.["account_not_found_txt"]}
        </div>
        <span className="back-to-SignUp">{langData?.["sign_up"]}</span>
      </div>
    </>
  );
}

const mapStateToProps = (state: RootState) => {
  return {
    langData: state.common.langData,
  };
};

export default connect(mapStateToProps, null)(ForgotPwdForm);
