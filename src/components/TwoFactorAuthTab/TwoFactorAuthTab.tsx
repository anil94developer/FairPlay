import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAlertMsg } from "../../store/common/commonActions";
import SVLS_API from "../../svls-api";
import QRCode from "react-qr-code";
import {
  IonButton,
  IonInput,
  IonLabel,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
} from "@ionic/react";
import "./TwoFactorAuthTab.scss";
import { TextField } from "@material-ui/core";

interface TwoFactorAuthTabProps {
  userDetails: any;
  langData: any;
}

const TwoFactorAuthTab: React.FC<TwoFactorAuthTabProps> = ({
  userDetails,
  langData,
}) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeLink, setQrCodeLink] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
    // Check if 2FA is already enabled for the user using is2faVerified field
    const is2FAEnabled =
      userDetails?.is2faVerified ||
      userDetails?.twoFactorEnabled ||
      userDetails?.is2FAEnabled;

    setIs2FAEnabled(!!is2FAEnabled);
  }, [userDetails]);

  const fetch2FALink = async () => {
    try {
      setIsLoading(true);
      const response = await SVLS_API.post("/account/two-factor-auth/", null, {
        headers: {
          Authorization: sessionStorage.getItem("jwt_token"),
        },
      });

      if (response.data) {
        setQrCodeLink(response.data);
        setShowSetup(true);
      }
    } catch (error) {
      dispatch(
        setAlertMsg({
          type: "error",
          message:
            langData?.["2fa_link_error"] || "Failed to get 2FA setup link",
        })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || !password.trim()) {
      dispatch(
        setAlertMsg({
          type: "error",
          message:
            langData?.["2fa_required_fields"] ||
            "Please enter OTP and password",
        })
      );
      return;
    }

    try {
      const response = await SVLS_API.put(
        "/account/two-factor-auth/",
        {
          otp: otp,
          password: password,
          status: true,
          loginType: "PASS",
        },
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
        }
      );

      if (response.status === 200) {
        dispatch(
          setAlertMsg({
            type: "success",
            message:
              langData?.["2fa_enabled_success"] || "2FA enabled successfully!",
          })
        );
        setIs2FAEnabled(true);
        setShowSetup(false);
        setOtp("");
        setPassword("");
        setQrCodeLink("");
      }
    } catch (error) {
      dispatch(
        setAlertMsg({
          type: "error",
          message: error?.response?.data?.message || "Failed to enable 2FA",
        })
      );
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || !password.trim()) {
      dispatch(
        setAlertMsg({
          type: "error",
          message:
            langData?.["2fa_required_fields"] ||
            "Please enter OTP and password",
        })
      );
      return;
    }

    try {
      const response = await SVLS_API.put(
        "/account/two-factor-auth/",
        {
          otp: otp,
          password: password,
          status: false,
          loginType: "PASS",
        },
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
        }
      );

      if (response.status === 200) {
        dispatch(
          setAlertMsg({
            type: "success",
            message:
              langData?.["2fa_disabled_success"] ||
              "2FA disabled successfully!",
          })
        );
        setIs2FAEnabled(false);
        setOtp("");
        setPassword("");
      }
    } catch (error) {
      dispatch(
        setAlertMsg({
          type: "error",
          message: langData?.["2fa_disable_error"] || "Failed to disable 2FA",
        })
      );
    }
  };

  const formatOTPInput = (value: string) => {
    // Remove non-numeric characters and limit to 6 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 6);
    return numericValue;
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatOTPInput(e.target.value);
    setOtp(formattedValue);
  };

  if (is2FAEnabled) {
    return (
      <div className="two-factor-auth-container">
        <IonCard style={{ margin: "0" }}>
          <IonCardContent>
            <div className="two-factor-status">
              <div
                style={{
                  textOverflow: "nowrap",
                  fontSize: "18px",
                  fontWeight: "bold",
                }}
              >
                {langData?.["2fa_disabled_title"] ||
                  "Two-Factor Authentication"}
              </div>
              <p>
                {langData?.["2fa_manage_description"] ||
                  "Manage your two-factor authentication settings"}
              </p>

              <div className="status-indicator enabled">
                <span className="status-icon">✓</span>
                <span>
                  {langData?.["2fa_enabled_status"] || "2FA is enabled"}
                </span>
              </div>

              <form onSubmit={handleDisable2FA} className="two-factor-form">
                <div style={{ fontWeight: "bold" }}>
                  {langData?.["2fa_disable_title"] ||
                    "Disable Two-Factor Authentication"}
                </div>
                <p>
                  {langData?.["2fa_disable_description"] ||
                    "To disable 2FA, enter your current password and the 6-digit code from your authenticator app."}
                </p>

                <div
                  style={{
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      className="text-nowrap"
                      style={{
                        width: "40%",
                      }}
                    >
                      {langData?.["2fa_otp_label"] || "Authentication Code"}
                    </div>
                    <TextField
                      type="text"
                      value={otp}
                      onChange={handleOTPChange}
                      placeholder="123456"
                      inputProps={{ maxLength: 6 }}
                      className="otp-input"
                      style={{
                        textAlign: "center",
                        fontSize: "18px",
                        letterSpacing: "2px",
                        fontFamily: "monospace",
                        width: "100%",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      className="text-nowrap"
                      style={{
                        width: "40%",
                      }}
                    >
                      {langData?.["password_label"] || "Current Password"}
                    </div>

                    <TextField
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        langData?.["password_placeholder"] ||
                        "Enter your current password"
                      }
                      style={{
                        textAlign: "center",
                        fontSize: "18px",
                        letterSpacing: "2px",
                        fontFamily: "monospace",
                        width: "100%",
                      }}
                    />
                  </div>
                </div>

                <IonButton
                  type="submit"
                  color="danger"
                  expand="block"
                  className="disable-button"
                >
                  {langData?.["2fa_disable_button"] || "Disable 2FA"}
                </IonButton>
              </form>
            </div>
          </IonCardContent>
        </IonCard>
      </div>
    );
  }

  return (
    <div className="two-factor-auth-container">
      <IonCard>
        <IonCardContent>
          <div className="two-factor-setup">
            <div
              style={{
                textOverflow: "nowrap",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              {langData?.["2fa_setup_title"] ||
                "Two-Factor Authentication Setup"}
            </div>
            <p>
              {langData?.["2fa_setup_description"] ||
                "Secure your account with an additional layer of protection"}
            </p>

            {!showSetup ? (
              <div className="setup-instructions">
                <div className="setup-icon">
                  <span>🔐</span>
                </div>
                <h4>
                  {langData?.["2fa_enable_title"] ||
                    "Enable Two-Factor Authentication"}
                </h4>
                <p>
                  {langData?.["2fa_description"] ||
                    "Add an extra layer of security to your account with 2FA."}
                </p>

                <div className="setup-steps">
                  <div className="step">
                    <span className="step-number">1</span>
                    <span>
                      {langData?.["2fa_step_1"] ||
                        "Download an authenticator app like Google Authenticator or Authy"}
                    </span>
                  </div>
                  <div className="step">
                    <span className="step-number">2</span>
                    <span>
                      {langData?.["2fa_step_2"] ||
                        "Scan the QR code that will be generated"}
                    </span>
                  </div>
                  <div className="step">
                    <span className="step-number">3</span>
                    <span>
                      {langData?.["2fa_step_3"] ||
                        "Enter the 6-digit code to complete setup"}
                    </span>
                  </div>
                </div>

                <IonButton
                  onClick={fetch2FALink}
                  disabled={isLoading}
                  color="primary"
                  expand="block"
                  className="setup-button"
                >
                  {isLoading
                    ? langData?.["loading"] || "Loading..."
                    : langData?.["2fa_setup_button"] || "Setup 2FA"}
                </IonButton>
              </div>
            ) : (
              <div className="qr-setup">
                <h4>{langData?.["2fa_scan_qr"] || "Scan QR Code"}</h4>
                <p>
                  {langData?.["2fa_scan_instructions"] ||
                    "Use your authenticator app to scan this QR code"}
                </p>

                {qrCodeLink && (
                  <div className="qr-code-container">
                    <QRCode value={qrCodeLink} size={200} />
                  </div>
                )}

                <form onSubmit={handleEnable2FA} className="two-factor-form">
                  <div>
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        gap: "6px",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        className="text-nowrap"
                        style={{
                          width: "40%",
                        }}
                      >
                        {langData?.["2fa_otp_label"] || "Authentication Code"}
                      </div>
                      <TextField
                        type="text"
                        value={otp}
                        onChange={handleOTPChange}
                        placeholder="123456"
                        inputProps={{ maxLength: 6 }}
                        className="otp-input"
                        style={{
                          width: "100%",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        gap: "6px",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div
                        className="text-nowrap"
                        style={{
                          width: "40%",
                        }}
                      >
                        {langData?.["password_label"] || "Current Password"}
                      </div>
                      <TextField
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          width: "100%",
                        }}
                        placeholder={
                          langData?.["password_placeholder"] ||
                          "Enter your current password"
                        }
                        className="otp-input"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <IonButton
                      type="button"
                      color="medium"
                      onClick={() => {
                        setShowSetup(false);
                        setQrCodeLink("");
                        setOtp("");
                        setPassword("");
                      }}
                      className="cancel-button"
                    >
                      {langData?.["cancel"] || "Cancel"}
                    </IonButton>

                    <IonButton
                      type="submit"
                      color="primary"
                      className="enable-button"
                    >
                      {langData?.["2fa_enable_button"] || "Enable 2FA"}
                    </IonButton>
                  </div>
                </form>
              </div>
            )}
          </div>
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default TwoFactorAuthTab;
