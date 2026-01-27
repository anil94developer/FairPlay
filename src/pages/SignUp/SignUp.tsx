import { IonCol, IonRow } from "@ionic/react";
import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { RootState } from "../../models/RootState";

import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import OutlinedInput from "@material-ui/core/OutlinedInput";
import TextField from "@material-ui/core/TextField";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import CloseIcon from "@material-ui/icons/Close";
import Visibility from "@material-ui/icons/Visibility";
import VisibilityOff from "@material-ui/icons/VisibilityOff";
import { useFormik } from "formik";
import { isMobile } from "react-device-detect";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { NavLink, useHistory, useLocation } from "react-router-dom";
import { loadCaptchaEnginge } from "react-simple-captcha";
import WhatsupImg from "../../assets/images/footer/whatsup-flot.png";
import Logo from "../../assets/images/theme/title.png";

import * as Yup from "yup";
import SocialMediaNew from "../../components/SocialMediaNew/SocialMediaNew";
import {
  loginFailed,
  loginSuccess,
  requestEnd,
  requestStart,
} from "../../store";
import SVLS_API from "../../svls-api";
import "./SignUp.scss";
import {
  isSiteUnderMaintenance,
  setAlertMsg,
  setMaintenanceTimer,
} from "../../store/common/commonActions";
import { AlertDTO } from "../../models/Alert";
import AUTH_API from "../../api-services/auth-api";
import { signUpEvent } from "../../util/facebookPixelEvent";
import { USERNAME_REGEX } from "../../util/stringUtil";
import { getEnvVariable } from "../../constants/whitelabelEnv";
import { domain, BRAND_DOMAIN } from "../../constants/Branding";

type StoreProps = {
  loginSuccess: Function;
  loginFailed: Function;
  requestStart: Function;
  requestEnd: Function;
  bonusEnabled: boolean;
  setAlertMsg: Function;
  langData: any;
};

const SignUp: React.FC<StoreProps> = (props) => {
  const {
    loginSuccess,
    loginFailed,
    requestStart,
    requestEnd,
    bonusEnabled,
    setAlertMsg,
    langData,
  } = props;
  const [showPassword, setShowPassword] = useState(false);
  const [userErrorMsg, setUserErrorMsg] = useState<string>("");
  const [otp, setOtp] = useState<number>(null);
  const [referralCode, setReferralCode] = useState<number>();
  const [loading, setLoading] = useState<boolean>(false);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [phone, setPhone] = useState<any>("");
  const [country, setCountry] = useState<any>("");
  const [phoneFormat, setPhoneFormat] = useState<any>("");
  const [otpTimer, setOtpTimer] = useState<number>();
  const [otpEnterFields, setOtpEnterFields] = useState<boolean>(false);
  const [otpErrorMessage, setOtpErrorMessage] = useState<string>("");
  const [phoneNumbeErrorMsg, setPhoneNumbeErrorMsg] = useState<string>("");
  const [verificationErrorMsg, setVerificationErrorMsg] = useState<string>("");
  const [signUpErrorMsg, setsignUpErrorMsg] = useState<string>("");
  const [phoneNumberExists, setPhoneNumberExists] = useState<boolean>(false);
  const steps = ["Step 01", "Step 02"];
  const [captchaValue, setCaptchaValue] = useState<string>("");

  const { search } = useLocation();
  const dispatch = useDispatch();
  const refCode = new URLSearchParams(search)?.get("refCode");

  let history = useHistory();
  const campaignId = new URLSearchParams(search)?.get("campaignId");

  const { pathname } = useLocation();
  const [validationCode, setValidationCode] = useState<any>();

  const formik = useFormik({
    initialValues: {
      fullname: "",
      username: "",
      password: "",
      // phoneNumber: '',
      address: "",
      referralCode: new URLSearchParams(search)?.get("refCode"),
      campaignCode: campaignId,
      otp: null,
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .required("Required")
        .min(4, langData?.["signup_username_restriction_txt"])
        .test("conditional-validation", function (value) {
          if (BRAND_DOMAIN?.includes("six666.")) {
            if (value && value.length > 16) {
              return this.createError({
                message: "Username must be at most 16 characters",
              });
            }
            if (value && !/^[a-zA-Z0-9]+$/.test(value)) {
              return this.createError({
                message: "Only letters and numbers are allowed",
              });
            }
          }
          return true;
        }),
      fullname: Yup.string(),
      password: Yup.string().required(langData?.["required"]),
      referralCode: Yup.string().nullable(),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      const campCode = values.campaignCode ?? campaignId ?? "";
      const cleancampCode = campCode.trim().toLowerCase();
      let postBody = {
        fullName: values.username.toLowerCase(),
        username: values.username.toLowerCase(),
        password: values.password,
        phoneNumber: phone,
        referralCode: values.referralCode,
        campaignCode: cleancampCode,
        otp: otp,
      };
      setsignUpErrorMsg("");

      if (values.username?.length > 25) {
        formik.setFieldError(
          "username",
          "Username must be less than 25 characters"
        );
      }
      handleNextStep(postBody);
    },
  });

  // DONT REMOVE THIS COMMENTED CODE

  const checkSiteUnderMaintenance = async () => {
    try {
      const res = await isSiteUnderMaintenance();
      if (
        res?.isSiteUnderMaintenance &&
        history.location.pathname !== "/maintenance"
      ) {
        dispatch(setMaintenanceTimer(res.downtimeTimestamp));
        history.replace("/maintenance");
      }
    } catch (error) {
      console.error("Error checking site maintenance:", error);
    }
  };

  // useEffect(() => {
  //   checkSiteUnderMaintenance();
  // }, []);

  const signUp = async (postBody: any) => {
    try {
      const response: any = await SVLS_API.post(
        "/account/v2/accounts/signup",
        postBody,
        {}
      );
      setAlertMsg({
        type: "success",
        message: langData?.["sign_up_success_txt"],
      });
      if (response.status === 204 || response.status === 200) {
        signUpEvent();
        // login after the sign up is successful.
        login(postBody.username, postBody.password);
        (window as any).gtag("event", "sign_up");
      }
    } catch (err) {
      setsignUpErrorMsg(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const validateCaptcha = (captchaValue) => {
    return captchaValue == validationCode;
  };

  const createValidationCode = () => {
    setValidationCode(Math.floor(1000 + Math.random() * 9000));
  };

  const login = async (username: string, password: string) => {
    requestStart();
    try {
      const loginRequest = {
        username: username,
        password: password,
      };
      const response = await AUTH_API.post("/account/v2/login", loginRequest);

      requestEnd();
      let claim = response.data.split(".")[1];

      sessionStorage.setItem("aid", JSON.parse(window.atob(claim)).aid);
      loginSuccess(response.data);

      sessionStorage.setItem("username", username);
      sessionStorage.setItem("jwt_token", response.data);

      localStorage.removeItem(`multiMarket_${username}`);

      // redirect to home if the login successful.
      redirectToDeposit();
    } catch (err) {
      setAlertMsg({
        type: "error",
        message: err.response.data.message,
      });
      // redirect to login page if the login fails.
      loginFailed(err.response.data.message);
      redirectToLogin();
    } finally {
      requestEnd();
    }
  };

  const redirectToDeposit = () => {
    history.push("/home");
  };

  const redirectToLogin = () => {
    history.push("/login");
  };

  const showPasswordClickHandler = () => {
    setShowPassword(!showPassword);
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

  const handleChange = (e) => {
    const { target } = e;
    const { value, name } = target;
    if (name === "phone") {
      setPhone(value);
    } else if (name === "otp") {
      setOtp(value);
    } else if (name === "referralCode") {
      setReferralCode(value);
    }
  };

  const sendOTP = async () => {
    setPhoneNumbeErrorMsg("");
    try {
      if (country.format?.length === phoneFormat?.length) {
        const response: any = await SVLS_API.post(
          `/account/v2/otp/?mobileNumber=${phone}`
        );
        if (response.status === 204) {
          handleOtpTimer(60);
          setOtpEnterFields(true);
          createValidationCode();
        }
      }
    } catch (err) {
      setPhoneNumbeErrorMsg(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const checkPhoneNumberExists = async (phoneNumber: string) => {
    setLoading(true);
    try {
      const response: any = await SVLS_API.get(
        `/account/v2/users/phones/${phoneNumber}/:exists`
      );
      if (response.status === 200) {
        if (response.data === true) {
          setPhoneNumbeErrorMsg(langData?.["phone_number_exists_txt"]);
          setPhoneNumberExists(true);
        } else {
          setPhoneNumbeErrorMsg("");
          setPhoneNumberExists(false);
        }
      }
    } catch (err) {
      setPhoneNumbeErrorMsg(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phone && phone?.length - country?.dialCode.length + 1 > 10) {
      checkPhoneNumberExists(phone);
    } else {
      setPhoneNumbeErrorMsg("");
    }
  }, [phone]);

  const validateOtp = async (postBody: any) => {
    setVerificationErrorMsg("");
    try {
      if (country.format.length === phoneFormat.length) {
        const response: any = await SVLS_API.post(
          `/account/v2/otp/validate?mobileNumber=${phone}&otp=${otp}`,
          {}
        );
        if (response.status === 204) {
          setOtpErrorMessage("");
          signUp(postBody);
        }
      }
    } catch (err) {
      setVerificationErrorMsg(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = (postBody: any) => {
    if (phone === "") {
      setAlertMsg({
        type: "error",
        message: langData?.["enter_phone_number_required_txt"],
      });
      return;
    }
    if (!otp || otp.toString().length !== 6) {
      setOtpErrorMessage(langData?.["enter_valid_otp_txt"]);
      return;
    }
    setOtpErrorMessage("");
    setLoading(true);
    validateOtp(postBody);
  };

  const checkUserName = async (e) => {
    setsignUpErrorMsg("");
    try {
      const { target } = e;
      const { value } = target;
      if (value.length > 3 && USERNAME_REGEX.test(value)) {
        const response: any = await SVLS_API.get(
          `/account/v2/users/${value?.toLowerCase()}/:exists`
        );
        if (response.status === 200) {
          if (response.data) {
            setUserErrorMsg(langData?.["username_exists_txt"]);
          } else {
            setUserErrorMsg("");
          }
        }
      }
    } catch (err) {
      setsignUpErrorMsg(langData?.["general_err_txt"]);
    }
  };

  const componentDidMount = () => {
    loadCaptchaEnginge(6, "#000", "#fff");
  };
  const handleChangeCaptcha = (e) => {
    const { target } = e;
    const { value, name } = target;
    setCaptchaValue(value);
  };

  useEffect(() => {
    if (campaignId) {
      localStorage.setItem("campaignId", campaignId);
      localStorage.setItem("balance", "0");
    }
  }, [campaignId]);

  return (
    <div
      className={
        pathname?.includes("signup")
          ? "sign-up-ctn faircric-signup"
          : "sign-up-ctn"
      }
    >
      <IonRow>
        <IonCol className="mob-view">
          {/* <div className="back-icon-mob">
            <NavLink to="/home">
              <ArrowBackIcon className="arrow-clr" />
            </NavLink>

            <span className="back-text">Back</span>
          </div> */}
        </IonCol>

        <IonCol sizeLg="12" sizeXs="12" className="card-col">
          <div className="title-row" onClick={() => history.push("/home")}>
            <img src={Logo} alt="website" className="logo" />
          </div>
          <div className="card-bg">
            <div className="card-section">
              <div className="card main-card">
                <form
                  onSubmit={formik.handleSubmit}
                  className="card"
                  autoComplete="off"
                >
                  {isMobile ? (
                    <div className="cross-icon">
                      <NavLink to="/home">
                        <IconButton aria-label="close" className="bet-del-btn">
                          <CloseIcon className="close-icon" />
                        </IconButton>
                      </NavLink>
                    </div>
                  ) : (
                    <div className="back-icon">
                      <NavLink to="/home">
                        <ArrowBackIcon className="arrow-clr" />
                      </NavLink>

                      <span className="back-text">{langData?.["back"]}</span>
                    </div>
                  )}

                  <div className="page-title">{langData?.["sign_up"]}</div>
                  <div className="signup-text">
                    {langData?.["create_your_account_txt"]}
                  </div>
                  <IonRow className="input-row">
                    <div className="form-control">
                      <div className="label">{langData?.["username"]} *</div>
                      <TextField
                        className="login-input-field user-name"
                        type="text"
                        placeholder={langData?.["enter_username_txt"]}
                        variant="outlined"
                        name="username"
                        onKeyUp={(e) => checkUserName(e)}
                        error={
                          (formik.touched.username && formik.errors.username) ||
                          userErrorMsg !== ""
                            ? true
                            : false
                        }
                        helperText={
                          formik.touched.username && formik.errors.username
                            ? formik.errors.username
                            : userErrorMsg !== ""
                            ? userErrorMsg
                            : null
                        }
                        {...formik.getFieldProps("username")}
                      />
                    </div>
                  </IonRow>
                  <IonRow className="input-row">
                    <div className="form-control">
                      <div className="label">{langData?.["password"]} *</div>
                      <FormControl
                        className="login-input-field pwd-field"
                        variant="outlined"
                        error={
                          formik.touched.password && formik.errors.password
                            ? true
                            : false
                        }
                      >
                        <OutlinedInput
                          id="standard-adornment-password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder={langData?.["enter_password"]}
                          {...formik.getFieldProps("password")}
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={showPasswordClickHandler}
                                onMouseDown={showPasswordClickHandler}
                              >
                                {showPassword ? (
                                  <Visibility className="no-margin" />
                                ) : (
                                  <VisibilityOff className="no-margin" />
                                )}
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
                  </IonRow>
                  <IonRow className="input-row">
                    <div className="form-control">
                      <div className="label">
                        {langData?.["campaign_code"] || "Campaign Code"}
                      </div>
                      <TextField
                        className="login-input-field user-name"
                        type="text"
                        name="campaignCode"
                        variant="outlined"
                        placeholder={
                          langData?.["enter_campaign_code"] ??
                          "Enter Campaign Code"
                        }
                        disabled={!!campaignId}
                        error={
                          formik.touched.campaignCode &&
                          Boolean(formik.errors.campaignCode)
                        }
                        helperText={
                          formik.touched.campaignCode &&
                          formik.errors.campaignCode
                        }
                        {...formik.getFieldProps("campaignCode")}
                      />
                    </div>
                  </IonRow>
                  {false ? (
                    <IonRow className="input-row">
                      <div className="form-control">
                        <div className="label">
                          {langData?.["referral_code"]}
                        </div>
                        <TextField
                          className="login-input-field user-name"
                          type="text"
                          name="fullname"
                          variant="outlined"
                          placeholder={langData?.["enter_referral_code"]}
                          disabled={!!refCode}
                          error={
                            formik.touched.referralCode &&
                            formik.errors.referralCode
                              ? true
                              : false
                          }
                          helperText={
                            formik.touched.referralCode &&
                            formik.errors.referralCode
                              ? formik.errors.referralCode
                              : null
                          }
                          {...formik.getFieldProps("referralCode")}
                        />
                      </div>
                    </IonRow>
                  ) : null}

                  <IonRow>
                    <IonCol
                      sizeXs="12"
                      sizeLg="12"
                      className="input-col phone-col"
                    >
                      <div className="input-row mt-15 phone">
                        <div className="label">
                          {langData?.["phone_number"]} /{" "}
                          {langData?.["whats_app"]}
                          <img
                            className="whatsapp-signup"
                            src={WhatsupImg}
                            height={18}
                            width={18}
                            alt="whatsapp"
                          />
                        </div>
                        <PhoneInput
                          country={"in"}
                          placeholder={langData?.["enter_phone_number_txt"]}
                          value={phone}
                          onChange={(value, country, e, formattedValue) => {
                            setPhone(value);
                            setCountry(country);
                            setPhoneFormat(formattedValue);
                          }}
                          disabled={otpEnterFields}
                          countryCodeEditable={false}
                        />
                        {phoneNumbeErrorMsg ? (
                          <FormHelperText error id="my-helper-text">
                            {phoneNumbeErrorMsg}
                          </FormHelperText>
                        ) : null}
                      </div>
                      <div className="btn-section otp-btn">
                        <div className="label" style={{ visibility: "hidden" }}>
                          Phon
                        </div>
                        <Button
                          disableElevation
                          className="btn"
                          color="primary"
                          variant="contained"
                          // endIcon={
                          //   loading ? <IonSpinner name="lines-small" /> : ''
                          // }
                          disabled={
                            phone === "" ||
                            phone?.length - country?.dialCode.length + 1 <=
                              10 ||
                            phoneNumberExists ||
                            (otpTimer !== undefined &&
                              otpTimer !== null &&
                              otpTimer >= 0)
                          }
                          onClick={() => sendOTP()}
                        >
                          {langData?.["send_otp"]}
                        </Button>
                      </div>
                    </IonCol>
                  </IonRow>
                  {!otpEnterFields ? (
                    <>
                      <IonRow className="msg-row">
                        <div className="msg">
                          {langData?.["have_account_txt"]}{" "}
                          <NavLink to="/login" className="back-to-home">
                            {langData?.["sign_in"]}
                          </NavLink>
                        </div>
                      </IonRow>
                    </>
                  ) : null}

                  {otpEnterFields ? (
                    <>
                      <IonRow>
                        <IonCol sizeLg="12" sizeXs="12" className="input-col">
                          <div className="input-row flex-column">
                            <div className="label">{langData?.["otp"]} *</div>
                            <TextField
                              className="number-input"
                              type="number"
                              name="otp"
                              variant="outlined"
                              placeholder={langData?.["enter_otp_txt"]}
                              error={
                                otpErrorMessage !== ""
                                  ? true
                                  : false || verificationErrorMsg !== ""
                                  ? true
                                  : false
                              }
                              helperText={
                                otpErrorMessage !== ""
                                  ? otpErrorMessage
                                  : verificationErrorMsg !== ""
                                  ? verificationErrorMsg
                                  : null
                              }
                              onKeyPress={(evt) => {
                                if (
                                  (evt.which != 8 &&
                                    evt.which != 0 &&
                                    evt.which < 48) ||
                                  evt.which > 57
                                ) {
                                  evt.preventDefault();
                                }
                              }}
                              onChange={(e) => handleChange(e)}
                            />
                            <div
                              className="label link"
                              onClick={() => {
                                if (!otpTimer) {
                                  sendOTP();
                                }
                              }}
                            >
                              {otpTimer !== undefined &&
                              otpTimer !== null &&
                              otpTimer >= 0
                                ? `${langData?.["resend_in_txt"]} ${otpTimer} ${langData?.["seconds"]}`
                                : `${langData?.["send_otp"]}`}
                            </div>
                            {signUpErrorMsg ? (
                              <FormHelperText error id="my-helper-text">
                                {signUpErrorMsg}
                              </FormHelperText>
                            ) : null}
                          </div>
                        </IonCol>
                      </IonRow>

                      <IonRow className="msg-row">
                        <div
                          className="msg"
                          onClick={() => history.push("/home")}
                        >
                          {langData?.["have_account_txt"]}{" "}
                          <NavLink to="/home">{langData?.["sign_in"]}</NavLink>
                        </div>
                      </IonRow>
                    </>
                  ) : null}

                  <IonRow></IonRow>
                  <IonRow className="button-row">
                    <Button
                      className="signup-btn"
                      color="primary"
                      type="submit"
                      variant="contained"
                      disabled={
                        !(formik.isValid && userErrorMsg === "") ||
                        phone === "" ||
                        !otp ||
                        phone?.length - country?.dialCode.length + 1 <= 10 ||
                        phoneNumberExists ||
                        otp == null
                      }
                    >
                      {langData?.["sign_up"]}
                    </Button>
                  </IonRow>
                </form>
              </div>
            </div>
          </div>
          <div className="social-media-signup">
            <SocialMediaNew />
          </div>
          <div className="disclaimer-section">
            {" "}
            {langData?.["login_disclaimer_txt"]}
          </div>
          {/* {window.location.hostname?.includes("fairplay") && ( */}
          <div className="disclaimer-privacy">
            <NavLink to={`/fairplay-terms-conditions`}>
              {langData?.["terms_conditions"]}
            </NavLink>
            <NavLink to={`/fairplay_policy`}>
              {langData?.["privacy_policy"]}
            </NavLink>
          </div>
          {/* )} */}
        </IonCol>
      </IonRow>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    loggedIn: state.auth.loggedIn,
    loading: state.auth.loading,
    bonusEnabled: state.common.domainConfig.bonus,
    langData: state.common.langData,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    loginSuccess: (payload) => dispatch(loginSuccess(payload)),
    loginFailed: (err: string) => dispatch(loginFailed(err)),
    requestStart: () => dispatch(requestStart()),
    requestEnd: () => dispatch(requestEnd()),
    setAlertMsg: (alert: AlertDTO) => dispatch(setAlertMsg(alert)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SignUp);
