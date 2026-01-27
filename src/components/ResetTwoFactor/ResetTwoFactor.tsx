import React, { useState } from "react";
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonLabel,
  IonSpinner,
  IonRow,
  IonCol,
} from "@ionic/react";
import { Button, TextField } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import SVLS_API from "../../svls-api";
import "./ResetTwoFactor.scss";

interface ResetTwoFactorProps {
  langData: any;
  onBack: () => void;
  onSuccess: () => void;
}

const ResetTwoFactor: React.FC<ResetTwoFactorProps> = ({
  langData,
  onBack,
  onSuccess,
}) => {
  const [option, setOption] = useState("Phone number");
  const [phone, setPhone] = useState<any>("");
  const [email, setEmail] = useState<string>("");
  const [country, setCountry] = useState<any>("");
  const [phoneFormat, setPhoneFormat] = useState<any>("");
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState<number>();
  const [otpEnterFields, setOtpEnterFields] = useState<boolean>(false);
  const [otpErrorMessage, setOtpErrorMessage] = useState<string>("");
  const [phoneNumberErrorMsg, setPhoneNumberErrorMsg] = useState<string>("");
  const [verificationErrorMsg, setVerificationErrorMsg] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const handleOtpTimer = (time: number) => {
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

  const generateOtp = async () => {
    setPhoneNumberErrorMsg("");
    try {
      setLoading(true);
      const identifier = option === "Email" ? email : phone;
      const userIdentifierType = option === "Email" ? "EMAIL" : "PHONE_NUMBER";

      const response = await SVLS_API.post(
        `/account/v2/users/${identifier}/:sendResetPasswordOtp?userIdentifierType=${userIdentifierType}`
      );

      if (response.status === 204) {
        handleOtpTimer(60);
        setOtpEnterFields(true);
      }
    } catch (err) {
      setPhoneNumberErrorMsg(
        err?.response?.data?.message || "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const resetTwoFactor = async () => {
    setVerificationErrorMsg("");
    try {
      setIsResetting(true);
      const response = await SVLS_API.post(
        "/account/two-factor-auth/reset-two-factor",
        {
          userIdentifier: option === "Email" ? "EMAIL" : "PHONE_NUMBER",
          identifierValue: option === "Email" ? email : phone,
          otp: otp,
        }
      );

      if (response.status === 200) {
        onSuccess();
      }
    } catch (err) {
      setVerificationErrorMsg(
        err?.response?.data?.message || "Failed to reset 2FA"
      );
    } finally {
      setIsResetting(false);
    }
  };

  const formatOTPInput = (value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 6);
    return numericValue;
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatOTPInput(e.target.value);
    setOtp(formattedValue);
  };

  return (
    <form className="login-form-ctn" autoComplete="off">
      <div className="back-icon" onClick={onBack}>
        <div className="back">
          <ArrowBackIcon className="arrow-clr" />
          <span className="back-text">{langData?.["back"] || "Back"}</span>
        </div>
      </div>

      <div className="card-title">
        {langData?.["reset_two_factor_auth"] ||
          "Reset Two-Factor Authentication"}
      </div>
      <span className="card-login-here">
        {langData?.["reset_2fa_description"] ||
          "Enter your phone number to reset your Two-Factor Authentication. You will receive an OTP to verify your identity."}
      </span>

      {!otpEnterFields ? (
        <>
          {/* <div className="method-selection-container">
            <div className="method-tabs">
              <Button
                className={`method-tab ${option === 'Phone number' ? 'active' : ''}`}
                onClick={() => {
                  setOption('Phone number');
                  setPhone('');
                  setEmail('');
                  setPhoneNumberErrorMsg('');
                }}
              >
                {langData?.['phone_number'] || 'Phone Number'}
              </Button>
              <Button
                className={`method-tab ${option === 'Email' ? 'active' : ''}`}
                onClick={() => {
                  setOption('Email');
                  setPhone('');
                  setEmail('');
                  setPhoneNumberErrorMsg('');
                }}
              >
                {langData?.['email'] || 'Email'}
              </Button>
            </div>
          </div> */}

          <div className="input-container">
            {option === "Phone number" ? (
              <div className="usr-input">
                <IonLabel className="input-labell">
                  {langData?.["phone_number"] || "Phone Number"}{" "}
                  <span className="red-text">*</span>
                </IonLabel>
                <PhoneInput
                  country={"in"}
                  placeholder={
                    langData?.["enter_phone_number_txt"] || "Enter Phone Number"
                  }
                  value={phone}
                  onChange={(value, country, e, formattedValue) => {
                    setPhone(value);
                    setCountry(country);
                    setPhoneFormat(formattedValue);
                  }}
                  disabled={otpEnterFields}
                  countryCodeEditable={false}
                />
              </div>
            ) : (
              <div className="usr-input">
                <IonLabel className="input-labell">
                  {langData?.["email"] || "Email"}{" "}
                  <span className="red-text">*</span>
                </IonLabel>
                <TextField
                  className="login-input-field user-name"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={langData?.["enter_email_txt"] || "Enter Email"}
                  variant="outlined"
                  disabled={otpEnterFields}
                />
              </div>
            )}
            {phoneNumberErrorMsg && (
              <span className="login-err-msg">{phoneNumberErrorMsg}</span>
            )}
          </div>

          <div className="login-demologin-btns" style={{ marginTop: "16px" }}>
            <Button
              className="login-form-btn-without-demologin"
              color="primary"
              endIcon={loading ? <IonSpinner name="lines-small" /> : ""}
              onClick={generateOtp}
              variant="contained"
              disabled={
                loading || (option === "Phone number" ? !phone : !email)
              }
            >
              {langData?.["send_otp"] || "Send OTP"}
            </Button>
          </div>
        </>
      ) : (
        <>
          {otpTimer && (
            <div
              style={{
                textAlign: "center",
                margin: "10px 0",
                color: "#4fd1c5",
                fontSize: "14px",
              }}
            >
              {langData?.["otp_timer"] || "Resend OTP in"} {otpTimer}s
            </div>
          )}

          <div className="code-input">
            <IonLabel className="input-labell">
              {langData?.["enter_otp"] || "Enter OTP"}{" "}
              <span className="red-text">*</span>
            </IonLabel>
            <TextField
              className="login-input-field user-name"
              type="text"
              value={otp}
              onChange={handleOTPChange}
              placeholder="123456"
              variant="outlined"
              inputProps={{ maxLength: 6 }}
              style={{
                textAlign: "center",
                fontSize: "18px",
                letterSpacing: "2px",
                fontFamily: "monospace",
              }}
            />
            {verificationErrorMsg && (
              <span className="login-err-msg">{verificationErrorMsg}</span>
            )}
          </div>

          <div className="login-demologin-btns" style={{ marginTop: "16px" }}>
            <Button
              className="login-form-btn-without-demologin"
              color="primary"
              endIcon={isResetting ? <IonSpinner name="lines-small" /> : ""}
              onClick={resetTwoFactor}
              variant="contained"
              disabled={isResetting || !otp || otp.length !== 6}
            >
              {langData?.["verify_and_reset"] || "Verify & Reset 2FA"}
            </Button>
          </div>
        </>
      )}

      <div
        style={{
          marginTop: "20px",
          padding: "12px",
          background: "rgba(94, 179, 212, 0.1)",
          border: "1px solid rgba(94, 179, 212, 0.3)",
          borderRadius: "8px",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
        }}
      >
        <span style={{ color: "#4fd1c5", fontSize: "16px" }}>ℹ️</span>
        <p
          style={{
            margin: 0,
            color: "#e0e0e0",
            fontSize: "13px",
            lineHeight: "1.5",
          }}
        >
          {langData?.["reset_2fa_help"] ||
            "If you are unable to access your authenticator app, this will help you reset your Two-Factor Authentication. You will need to set it up again after reset."}
        </p>
      </div>
    </form>
  );
};

export default ResetTwoFactor;
