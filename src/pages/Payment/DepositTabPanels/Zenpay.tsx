import { IonSpinner } from "@ionic/react";
import Button from "@material-ui/core/Button";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import React, { FormEvent, forwardRef, useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { connect } from "react-redux";
import gpay from "../../../assets/images/common/icons/gpay.svg";
import paytm from "../../../assets/images/common/icons/paytm.svg";
import phonepay from "../../../assets/images/common/icons/phonepe.svg";
import InputTemplate from "../../../common/InputTemplate/InputTemplate";
import TabPanel from "../../../components/TabPanel/TabPanel";
import { AlertDTO } from "../../../models/Alert";
import { AvailablePaymentGateways } from "../../../util/stringUtil";
import { PaymentMethodsInfo, PaymentOptions } from "../Deposit.types";
import "../Zenpay.scss";
import { ButtonVariable } from "../../../models/ButtonVariables";
import { Fab } from "@material-ui/core";
import { CancelOutlined, WhatsApp } from "@material-ui/icons";
import { RootState } from "../../../models/RootState";
import { isMobile } from "react-device-detect";
import { DomainConfig } from "../../../models/DomainConfig";
import { BonusDto } from "../Deposit";
import SelectTemplate from "../../../common/SelectTemplate/SelectTemplate";
import CopyIcon from "../../../assets/images/MyProfileIcons/copy_icon.svg";

interface ZenPayTabPanelProps {
  index: number;
  onlinePaymentOption: string;
  setOnlinePaymentOption: (paymentOption: string) => void;
  tabValue: number;
  submitOnlineAmount: (e: FormEvent, selectedPaymentGateway?: string) => void;
  paymentDetails: PaymentOptions[];
  depositAmount: string;
  setDepositAmount: (amount: string) => void;
  mobileNumber: string;
  setMobileNumber: (amount: string) => void;
  loading: boolean;
  providerRefId: string;
  confirmPayment: (e: FormEvent, selectedPaymentGateway?: string) => void;
  copyText: (text: string, toastMsg?: string) => void;
  referenceId: string;
  setReferenceId: (amount: string) => void;
  paymentOptionFilter: string;
  setPaymentOptionFilter: (amount: string) => void;
  depositImage: string | ArrayBuffer;
  handleCapture: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClick: () => void;
  setProviderRefId?: (refId: string) => void;
  setDepositImage?: (imageData: string | ArrayBuffer) => void;
  depositPaymentMethodsInfo: PaymentMethodsInfo;
  providersList: any;
  buttonVariables: ButtonVariable[];
  loggedIn: boolean;
  getAdminWhatsAppNumber: () => void;
  setShowWhatsapp: (show: boolean) => void;
  showWhatsapp: boolean;
  domainConfig: DomainConfig;
  bonusTypes: BonusDto[];
  selectedBonus: string;
  setSelectedBonus: (selectedBonus: string) => void;
  pgProvider: string;
  langData: any;
}

const ZenPay = forwardRef<HTMLInputElement, ZenPayTabPanelProps>(
  (
    {
      index,
      providersList,
      onlinePaymentOption,
      setOnlinePaymentOption,
      tabValue,
      submitOnlineAmount,
      paymentDetails,
      depositAmount,
      setDepositAmount,
      mobileNumber,
      setMobileNumber,
      loading,
      providerRefId,
      confirmPayment,
      copyText,
      referenceId,
      setReferenceId,
      paymentOptionFilter,
      setPaymentOptionFilter,
      depositImage,
      handleCapture,
      handleClick,
      depositPaymentMethodsInfo,
      buttonVariables,
      loggedIn,
      domainConfig,
      getAdminWhatsAppNumber,
      setShowWhatsapp,
      showWhatsapp,
      bonusTypes,
      selectedBonus,
      setSelectedBonus,
      pgProvider,
      langData,
    },
    hiddenFileInput
  ) => {
    const paymentMethodsList =
      depositPaymentMethodsInfo[AvailablePaymentGateways.ZENPAY];

    const selectList = [
      { value: "IMPS", name: "IMPS" },
      { value: "NEFT", name: "NEFT" },
      { value: "RTGS", name: "RTGS" },
    ];

    // useEffect(() => {
    //   if (paymentMethodsList?.length > 0)
    //     setOnlinePaymentOption(paymentMethodsList[0]);
    // }, [paymentMethodsList]);

    const setBetAmount = (amount, type) => {
      if (
        type == "ADD" &&
        !(paymentDetails?.length && paymentDetails[0]?.payment_method)
      ) {
        setDepositAmount(String(+depositAmount + +amount));
      }
    };

    const utrRequired = paymentDetails?.filter(
      (pm) => pm?.payment_method == onlinePaymentOption
    )[0]?.payment_method_details?.utr_required;

    return (
      <TabPanel value={tabValue} index={index} className="zenpay-ctn">
        {providersList?.length > 0 ? (
          <>
            <form
              className="account-inputs"
              onSubmit={(e) => submitOnlineAmount(e, pgProvider)}
            >
              {buttonVariables.map((bV, idx) => (
                <Button
                  key={"qb-btn" + idx}
                  className="qb-btn"
                  // disabled={bettingInprogress}
                  onClick={() => setBetAmount(bV.stake, "ADD")}
                >
                  +{bV.label}
                </Button>
              ))}
              <div className="note-msg">{langData?.["deposit_info_txt"]}</div>
              <div className="amount-input">
                <InputTemplate
                  label={langData?.["enter_amount"] + " (INR)"}
                  value={depositAmount}
                  placeholder={langData?.["enter_deposit_amount_txt"]}
                  onChange={(e) => setDepositAmount(e)}
                  disabled={
                    paymentDetails?.length && paymentDetails[0]?.payment_method
                      ? true
                      : false
                  }
                  type="number"
                />
                <div className="clear-row">
                  <span
                    className={"text b-text"}
                    onClick={() => {
                      if (
                        !(
                          paymentDetails?.length &&
                          paymentDetails[0]?.payment_method
                        )
                      ) {
                        setDepositAmount("0");
                      }
                    }}
                  >
                    {langData?.["clear"]}
                  </span>
                </div>
              </div>
              {!providerRefId && (
                <Button
                  className={
                    loading || !depositAmount
                      ? "submit-payment-btn submit-btn-disabled"
                      : "submit-payment-btn"
                  }
                  type="submit"
                  disabled={loading ? true : false}
                  endIcon={loading ? <IonSpinner name="lines-small" /> : ""}
                >
                  {langData?.["next"]}
                </Button>
              )}
            </form>

            {paymentDetails?.length > 0 &&
              paymentDetails[0]?.payment_method && (
                <form
                  className="account-inputs"
                  onSubmit={(e) => confirmPayment(e, pgProvider)}
                >
                  {bonusTypes?.length > 0 && (
                    <div className="bonus-type">
                      <SelectTemplate
                        label={langData?.["select_bonus_type"]}
                        value={selectedBonus}
                        list={bonusTypes.map((bt) => {
                          return { value: bt.id, name: bt.name };
                        })}
                        onChange={(e: any) => {
                          setSelectedBonus(e.target.value);
                        }}
                        placeholder={langData?.["bonus_type"]}
                      />
                    </div>
                  )}
                  <div className="payment-option-title mt-10">
                    {langData?.["account_details"]}
                  </div>

                  {paymentDetails?.length > 0 &&
                    paymentDetails[0]?.payment_method &&
                    onlinePaymentOption === "BANK_TRANSFER" && (
                      <div className="account-inputs">
                        <div className="account-input">
                          <div
                            className="payment-detail color-fff samerow"
                            onClick={() =>
                              copyText(
                                paymentDetails?.filter(
                                  (i) =>
                                    i?.payment_method === onlinePaymentOption
                                )[0]?.payment_method_details
                                  ?.bank_account_holder
                              )
                            }
                          >
                            {langData?.["account_holder_name"]}:
                            <span
                              title={langData?.["click_to_copy"]}
                              className="payment-detail-input"
                            >
                              {
                                paymentDetails?.filter(
                                  (i) =>
                                    i?.payment_method === onlinePaymentOption
                                )[0]?.payment_method_details
                                  ?.bank_account_holder
                              }
                            </span>
                            <img
                              src={CopyIcon}
                              className="r-copy-btn"
                              height={28}
                            />
                          </div>
                          <div
                            className="payment-detail color-fff samerow"
                            onClick={() =>
                              copyText(
                                paymentDetails?.filter(
                                  (i) =>
                                    i?.payment_method === onlinePaymentOption
                                )[0]?.payment_method_details
                                  ?.bank_account_number
                              )
                            }
                          >
                            {langData?.["account_holder_number"]}:
                            <span
                              title={langData?.["click_to_copy"]}
                              className="payment-detail-input"
                            >
                              {
                                paymentDetails?.filter(
                                  (i) =>
                                    i?.payment_method === onlinePaymentOption
                                )[0]?.payment_method_details
                                  ?.bank_account_number
                              }
                            </span>
                            <img
                              src={CopyIcon}
                              className="r-copy-btn"
                              height={28}
                            />
                          </div>
                          <div
                            className="payment-detail color-fff samerow"
                            onClick={() =>
                              copyText(
                                paymentDetails?.filter(
                                  (i) =>
                                    i?.payment_method === onlinePaymentOption
                                )[0]?.payment_method_details?.ifs_code
                              )
                            }
                          >
                            {langData?.["account_ifsc_code"]}:
                            <span
                              title={langData?.["click_to_copy"]}
                              className="payment-detail-input"
                            >
                              {
                                paymentDetails?.filter(
                                  (i) =>
                                    i?.payment_method === onlinePaymentOption
                                )[0]?.payment_method_details?.ifs_code
                              }
                            </span>
                            <img
                              src={CopyIcon}
                              className="r-copy-btn"
                              height={28}
                            />
                          </div>
                          <div
                            className="payment-detail color-fff samerow"
                            onClick={() =>
                              copyText(
                                paymentDetails?.filter(
                                  (i) =>
                                    i?.payment_method === onlinePaymentOption
                                )[0]?.payment_method_details?.bank_name
                              )
                            }
                          >
                            {langData?.["bank_name"]}:
                            <span
                              title={langData?.["click_to_copy"]}
                              className="payment-detail-input"
                            >
                              {paymentDetails?.filter(
                                (i) => i?.payment_method === onlinePaymentOption
                              )[0]?.payment_method_details?.bank_name ?? "--"}
                            </span>
                            <img
                              src={CopyIcon}
                              className="r-copy-btn"
                              height={28}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  {paymentDetails?.filter(
                    (pm) => pm?.payment_method == onlinePaymentOption
                  ).length > 0 &&
                    onlinePaymentOption === "UPI" && (
                      <div className="account-inputs">
                        <div className="account-input">
                          <div className="highlight">
                            <div
                              className={`pay-header security-input ${
                                isMobile ? "mb-header" : ""
                              }`}
                            >
                              &nbsp;&nbsp;&nbsp;&nbsp;
                              {langData?.["payment_declined_info_txt"]}
                              &nbsp;&nbsp;&nbsp;&nbsp;
                            </div>
                          </div>
                          {paymentDetails?.find(
                            (i) => i?.payment_method === onlinePaymentOption
                          )?.payment_method_details?.upi_intent && (
                            <div
                              style={{
                                height: "auto",
                                margin: "0px",
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              <div style={{ width: "30%", height: "100%" }}>
                                <QRCode
                                  size={256}
                                  className="qr-code"
                                  style={{
                                    height: "auto",
                                    maxWidth: "100%",
                                    width: "100%",
                                  }}
                                  value={
                                    paymentDetails?.find(
                                      (i) =>
                                        i?.payment_method ===
                                        onlinePaymentOption
                                    )?.payment_method_details?.upi_intent
                                  }
                                  viewBox={`0 0 256 256`}
                                />
                              </div>
                            </div>
                          )}
                          {paymentDetails?.filter(
                            (i) => i?.payment_method === onlinePaymentOption
                          )[0]?.payment_method_details?.upi_id &&
                          utrRequired ? (
                            <div className="payment-detail upi_id">
                              {langData?.["upi_id"]}:
                              <span
                                title={langData?.["click_to_copy"]}
                                className="payment-detail-input"
                                onClick={() =>
                                  copyText(
                                    paymentDetails?.filter(
                                      (i) =>
                                        i?.payment_method ===
                                        onlinePaymentOption
                                    )[0]?.payment_method_details?.upi_id
                                  )
                                }
                              >
                                {
                                  paymentDetails?.filter(
                                    (i) =>
                                      i?.payment_method === onlinePaymentOption
                                  )[0]?.payment_method_details?.upi_id
                                }
                              </span>
                              {
                                <div
                                  className="r-copy-btn-div"
                                  onClick={() =>
                                    copyText(
                                      paymentDetails?.filter(
                                        (i) =>
                                          i?.payment_method ===
                                          onlinePaymentOption
                                      )[0]?.payment_method_details?.upi_id,
                                      langData?.["upi_id_copied_txt"]
                                    )
                                  }
                                >
                                  <img
                                    src={CopyIcon}
                                    className="r-copy-btn"
                                    height={28}
                                  />
                                </div>
                              }
                            </div>
                          ) : null}
                          {paymentDetails?.filter(
                            (i) => i?.payment_method === onlinePaymentOption
                          )[0]?.payment_method_details?.upi_intent &&
                          !utrRequired ? (
                            <>
                              <div className="pay-header">
                                Click on below apps to pay
                              </div>
                              <div className="payment-buttons">
                                <Button
                                  className={"payment-btn"}
                                  onClick={() =>
                                    window.open(
                                      paymentDetails
                                        ?.filter(
                                          (i) =>
                                            i?.payment_method ===
                                            onlinePaymentOption
                                        )[0]
                                        ?.payment_method_details?.upi_intent.replace(
                                          "upi",
                                          "phonepe"
                                        )
                                    )
                                  }
                                >
                                  <img
                                    className={"payment-icon"}
                                    alt="phonepay"
                                    src={phonepay}
                                    loading="lazy"
                                  />
                                </Button>

                                <Button
                                  className={"payment-btn"}
                                  onClick={() =>
                                    window.open(
                                      paymentDetails
                                        ?.filter(
                                          (i) =>
                                            i?.payment_method ===
                                            onlinePaymentOption
                                        )[0]
                                        ?.payment_method_details?.upi_intent.replace(
                                          "upi://",
                                          "tez://upi/"
                                        )
                                    )
                                  }
                                >
                                  <img
                                    className={"payment-icon"}
                                    alt="gpay"
                                    src={gpay}
                                    loading="lazy"
                                  />
                                </Button>

                                <Button
                                  className={"payment-btn"}
                                  onClick={() =>
                                    window.open(
                                      paymentDetails
                                        ?.filter(
                                          (i) =>
                                            i?.payment_method ===
                                            onlinePaymentOption
                                        )[0]
                                        ?.payment_method_details?.upi_intent.replace(
                                          "upi",
                                          "paytmmp"
                                        )
                                    )
                                  }
                                >
                                  <img
                                    className={"payment-icon"}
                                    alt="paytm"
                                    src={paytm}
                                    loading="lazy"
                                  />
                                </Button>
                              </div>
                              <div className="payment-detail">
                                <a
                                  className="pay-sentence"
                                  href={
                                    paymentDetails?.filter(
                                      (i) =>
                                        i?.payment_method ===
                                        onlinePaymentOption
                                    )[0]?.payment_method_details?.upi_intent
                                  }
                                >
                                  Pay through UPI app
                                </a>
                              </div>
                            </>
                          ) : null}
                        </div>
                      </div>
                    )}

                  {paymentDetails?.length > 0 &&
                  paymentDetails[0]?.payment_method &&
                  (utrRequired ?? true) ? (
                    <>
                      <InputTemplate
                        required={true}
                        label={
                          langData?.["enter_utr_txt"] +
                          " (" +
                          langData?.["reverify_for_correctness_txt"] +
                          ")"
                        }
                        value={referenceId}
                        type={onlinePaymentOption === "UPI" ? "number" : "text"}
                        placeholder={langData?.["enter_utr_txt"]}
                        onChange={(e) => setReferenceId(e)}
                      />
                      {onlinePaymentOption === "BANK_TRANSFER" &&
                        selectList.map((indv) => (
                          <FormControlLabel
                            value="end"
                            control={<Radio />}
                            label={indv.name}
                            checked={indv.value === paymentOptionFilter}
                            onChange={(e) => {
                              setPaymentOptionFilter(indv.value);
                            }}
                            className="radio"
                          />
                        ))}
                    </>
                  ) : null}

                  {paymentDetails?.length > 0 &&
                    paymentDetails[0]?.payment_method && (
                      <div className="account-input">
                        {depositImage ? (
                          <>
                            <div>
                              <div className="zenpay-uploaded-image-title">
                                {langData?.["uploaded_image"]}
                              </div>
                              <img
                                src={`${depositImage}`}
                                className="deposit-upload-image"
                              />
                            </div>
                          </>
                        ) : null}

                        <input
                          accept="image/*"
                          style={{ display: "none" }}
                          id="raised-button-file-abcmoney"
                          multiple
                          hidden
                          type="file"
                          ref={hiddenFileInput}
                          onChange={(e) => handleCapture(e)}
                        />
                        <Button
                          component="div"
                          className="zenpay-upload-btn"
                          onClick={handleClick}
                        >
                          {langData?.["upload_image"]}
                        </Button>
                      </div>
                    )}
                  <div className="bottom-buttons">
                    <Button
                      className="submit-payment-btn"
                      type="submit"
                      disabled={
                        loading ||
                        !(depositImage && (utrRequired ? referenceId : true))
                          ? true
                          : false
                      }
                      endIcon={loading ? <IonSpinner name="lines-small" /> : ""}
                    >
                      {langData?.["confirm_payment"]}
                    </Button>
                    {domainConfig.whatsapp &&
                      isMobile &&
                      loggedIn &&
                      showWhatsapp && (
                        <div
                          className="submit-payment-btn whatsapp-btn floating-whatsapp-btn new-whatsapp"
                          onClick={getAdminWhatsAppNumber}
                        >
                          <WhatsApp className="whatsapp-icon" />
                          <div className="whatsapp-btn-text">
                            {langData?.["payment_failed_issues"]}
                          </div>
                        </div>
                      )}
                  </div>
                </form>
              )}
          </>
        ) : (
          <div className="no-data-available">
            {langData?.["providers_not_found_txt"]}
          </div>
        )}
      </TabPanel>
    );
  }
);

const mapStateToProps = (state: RootState) => {
  return {
    loggedIn: state.auth.loggedIn,
    domainConfig: state.common.domainConfig,
  };
};

export default ZenPay;
