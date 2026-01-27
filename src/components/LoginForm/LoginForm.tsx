import { IonLabel, IonSpinner } from "@ionic/react";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import TextField from "@material-ui/core/TextField";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { NavLink, useHistory, useLocation } from "react-router-dom";
import * as Yup from "yup";
import ResetTwoFactor from "../ResetTwoFactor/ResetTwoFactor";
import { DomainConfig } from "../../models/DomainConfig";
import { RootState } from "../../models/RootState";
import {
  fetchBalance,
  loginFailed,
  loginSuccess,
  requestEnd,
  requestStart,
} from "../../store";
import { setAlertMsg } from "../../store/common/commonActions";
import SocialMediaNew from "../SocialMediaNew/SocialMediaNew";
import "./LoginForm.scss";
import { getSapToken } from "../../store/auth/authActions";
import downloadIcon from "../../assets/images/icons/download-icon.svg";
import android from "../../assets/images/footer/android.svg";

type StoreProps = {
  loginSuccess: Function;
  loginFailed: Function;
  requestStart: Function;
  requestEnd: Function;
  fetchBalance: Function;
  domainConfig: DomainConfig;
};

type LoginProps = StoreProps & {
  errorMsg: string;
  loading: boolean;
  loggedIn: boolean;
  modalCloseHandler: Function;
  redirectUrl?: string;
  langData: any;
};

const setDummyAuthData = (username: string) => {
  // Generate dummy JWT token
  const dummyToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

  // sessionStorage data
  sessionStorage.setItem("jwt_token", dummyToken);
  sessionStorage.setItem("username", username.toLowerCase());
  sessionStorage.setItem("aid", "999999");

  // localStorage data
  localStorage.setItem(
    "user_profile",
    JSON.stringify({
      id: 999999,
      username: username.toLowerCase(),
      role: "USER",
      isLoggedIn: true,
      email: `${username.toLowerCase()}@example.com`,
    })
  );

  localStorage.setItem("theme", "dark");

  // Remove multiMarket data
  localStorage.removeItem(`multiMarket_${username.toLowerCase()}`);
};

const LoginForm: React.FC<LoginProps> = (props) => {
  const {
    errorMsg,
    loading,
    loggedIn,
    loginSuccess,
    loginFailed,
    requestStart,
    requestEnd,
    fetchBalance,
    modalCloseHandler,
    redirectUrl,
    domainConfig,
    langData,
  } = props;

  const [showPassword, setShowPassword] = useState(false);
  const [loginResponse, setLoginResponse] = useState(null);
  const [useAuthenticator, setUseAuthenticator] = useState<boolean>(false);
  const [showForgotPwdModal, setShowForgotPwdModal] = useState(false);
  const [loadLogin, setLoadLogin] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const dispatch = useDispatch();
  let history = useHistory();
  const { search } = useLocation();

  const formik = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema: Yup.object({
      username: Yup.string().required(langData?.["required"] || "Required"),
      password: Yup.string().required(langData?.["required"] || "Required"),
    }),
    onSubmit: async (values) => {
      requestStart();

      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Set dummy data in storage
        setDummyAuthData(values.username);

        // Generate dummy token
        const dummyToken =
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

        setLoginResponse(dummyToken);
        loginSuccess(dummyToken);

        requestEnd();

        // Redirect to home or specified URL
        if (redirectUrl) {
          history.push(redirectUrl);
        } else {
          history.push("/home");
        }
      } catch (err) {
        loginFailed("Login failed");
        requestEnd();
      }
    },
  });

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    requestStart();

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const demoUsername = "demo_user";

      // Set dummy data in storage
      setDummyAuthData(demoUsername);

      // Generate dummy token
      const dummyToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZW1vX3VzZXIiLCJuYW1lIjoiRGVtbyBVc2VyIiwiaWF0IjoxNTE2MjM5MDIyfQ.demo_token_signature";

      setLoginResponse(dummyToken);
      loginSuccess(dummyToken);

      setDemoLoading(false);
      requestEnd();

      // Redirect
      if (redirectUrl) {
        history.push(redirectUrl);
      } else {
        history.push("/home");
      }
    } catch (err) {
      setDemoLoading(false);
      requestEnd();
      console.log(err);
    }
  };

  useEffect(() => {
    if (loggedIn) {
      history.push("/home");
      modalCloseHandler();
    }
  }, [loggedIn, modalCloseHandler]);

  const showPasswordClickHandler = () => {
    setShowPassword(!showPassword);
  };

  const onRedirectToHome = () => {
    history.push("/home");
  };

  const onRedirectToSignUp = () => {
    history.push("/register");
  };

  const isApkAvailable = domainConfig.apkUrl;

  const downloadApp = () => {
    const url = domainConfig.apkUrl;
    const link = document.createElement("a");
    link.href = "https://" + url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="login-form-page">
        <form
          onSubmit={formik.handleSubmit}
          className="login-form-ctn"
          autoComplete="off"
        >
          <div className="back-icon" onClick={onRedirectToHome}>
            <div className="back">
              <ArrowBackIcon className="arrow-clr" />
              <span className="back-text">{langData?.["back"]}</span>
            </div>
            <div className="demo">
              <Button
                className="login-form-btn-demo"
                color="primary"
                endIcon={demoLoading ? <IonSpinner name="lines-small" /> : ""}
                onClick={handleDemoLogin}
                variant="contained"
              >
                {langData?.["demo_login"] || "Demo Login"}
              </Button>
            </div>
          </div>
          <div className="card-title">{langData?.["sign_in"] || "Sign In"}</div>

          <span className="card-login-here">
            {langData?.["enter_login_details_txt"] ||
              "Enter your login details"}
          </span>

          <span className="usr-input">
            <IonLabel className="input-labell">
              {langData?.["username"] || "Username"}{" "}
              <span className="red-text">*</span>
            </IonLabel>
            <TextField
              className="login-input-field user-name"
              type="text"
              name="username"
              placeholder={langData?.["username"] || "Username"}
              variant="outlined"
              error={
                formik.touched.username && formik.errors.username ? true : false
              }
              helperText={
                formik.touched.username && formik.errors.username
                  ? formik.errors.username
                  : null
              }
              {...formik.getFieldProps("username")}
            />
          </span>

          <div className="pwd-input">
            <IonLabel className="input-labell">
              {langData?.["password"] || "Password"}{" "}
              <span className="red-text">*</span>
            </IonLabel>
            <FormControl
              className="login-input-field pwd-field"
              variant="outlined"
              error={
                formik.touched.password && formik.errors.password ? true : false
              }
            >
              <OutlinedInput
                id="standard-adornment-password"
                type={showPassword ? "text" : "password"}
                name="password"
                {...formik.getFieldProps("password")}
                placeholder={langData?.["password"] || "Password"}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={showPasswordClickHandler}
                      onMouseDown={showPasswordClickHandler}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                }
              />
              {formik.touched.password && formik.errors.password ? (
                <FormHelperText error id="my-helper-text">
                  {formik.errors.password}
                </FormHelperText>
              ) : null}
            </FormControl>
          </div>

          <div className="forgot-pwd">
            <NavLink to="/forgot-password">
              {langData?.["forgot_username_password_txt"] ||
                "Forgot Username/Password?"}
            </NavLink>
          </div>

          {errorMsg !== "" ? (
            <span className="login-err-msg">{errorMsg}</span>
          ) : null}

          <div className="login-demologin-btns">
            <Button
              className={
                !domainConfig.demoUser
                  ? "login-form-btn"
                  : "login-form-btn-without-demologin"
              }
              color="primary"
              endIcon={loading ? <IonSpinner name="lines-small" /> : ""}
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {langData?.["login"] || "Login"}
            </Button>
          </div>
        </form>

        <div className="account-SignUp" onClick={onRedirectToSignUp}>
          {!domainConfig.b2cEnabled && !domainConfig.signup && (
            <>
              <div className="account-dontHaveAccount">
                {langData?.["account_not_found_txt"] ||
                  "Don't have an account?"}
              </div>
              <span className="back-to-SignUp">
                {langData?.["sign_up"] || "Sign Up"}
              </span>
            </>
          )}
        </div>

        {!isApkAvailable && (
          <div className="download-apk" onClick={downloadApp}>
            <img src={android} alt="Android" className="android-icon" />
            <span className="donwload-txt">Download .apk</span>
            <img src={downloadIcon} alt="Android" className="donwload-icon" />
          </div>
        )}

        <div className="socialMedia-login">
          <SocialMediaNew />
        </div>
        <div className="disclaimer-ctn-text">
          <div className="disclaimer-width">
            {langData?.["login_disclaimer_txt"]}
          </div>
        </div>
        <div className="disclaimer-privacy">
          <NavLink to={`/fairplay-terms-conditions`}>
            {langData?.["terms_conditions"] || "Terms & Conditions"}
          </NavLink>
          <NavLink to={`/fairplay_policy`}>
            {langData?.["privacy_policy"] || "Privacy Policy"}
          </NavLink>
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    loading: state.auth.loading,
    loggedIn: state.auth.loggedIn,
    errorMsg: state.auth.loginError,
    domainConfig: state.common.domainConfig,
    langData: state.common.langData,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    fetchBalance: () => dispatch(fetchBalance()),
    loginSuccess: (payload) => dispatch(loginSuccess(payload)),
    loginFailed: (err: string) => dispatch(loginFailed(err)),
    requestStart: () => dispatch(requestStart()),
    requestEnd: () => dispatch(requestEnd()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
