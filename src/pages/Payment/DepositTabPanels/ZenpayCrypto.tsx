import { IonSpinner } from "@ionic/react";
import { Fab, MenuItem, Select } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import React, { forwardRef, useEffect, useState } from "react";
import { connect } from "react-redux";
import AGPAY_API from "../../../api-services/feature-api";
import CopyIcon from "../../../assets/images/MyProfileIcons/copy_icon.svg";
import InputTemplate from "../../../common/InputTemplate/InputTemplate";
import TabPanel from "../../../components/TabPanel/TabPanel";
import { AlertDTO } from "../../../models/Alert";
import { setAlertMsg } from "../../../store/common/commonActions";
import { AvailablePaymentGateways } from "../../../util/stringUtil";
import { PaymentMethodsInfo } from "../Deposit.types";
import "../Zenpay.scss";
import { ButtonVariable } from "../../../models/ButtonVariables";
import { CancelOutlined, WhatsApp } from "@material-ui/icons";
import { RootState } from "../../../models/RootState";
import { isMobile } from "react-device-detect";
import { DomainConfig } from "../../../models/DomainConfig";
import { BonusDto } from "../Deposit";
import SelectTemplate from "../../../common/SelectTemplate/SelectTemplate";

interface ZenPayTabPanelProps {
  setOpenDepositModal: Function;
  setLoading: Function;
  index: number;
  onlinePaymentOption: string;
  setOnlinePaymentOption: (paymentOption: string) => void;
  tabValue: number;
  depositAmount: string;
  setDepositAmount: (amount: string) => void;
  mobileNumber: string;
  setMobileNumber: (amount: string) => void;
  loading: boolean;
  copyText: (text: string, toastMsg: string) => void;
  depositPaymentMethodsInfo: PaymentMethodsInfo;
  providersList: any;
  setAlertMsg: Function;
  buttonVariables: ButtonVariable[];
  loggedIn: boolean;
  domainConfig: DomainConfig;
  getAdminWhatsAppNumber: () => void;
  setShowWhatsapp: (show: boolean) => void;
  showWhatsapp: boolean;
  bonusTypes: BonusDto[];
  selectedBonus: string;
  setSelectedBonus: (selectedBonus: string) => void;
  getBonusTypes: (amount: number, paymentMethod: string) => void;
  langData: any;
  depositImage: string | ArrayBuffer;
  handleCapture: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClick: () => void;
  uploadImage: any;
}

const ZenPayCrypto = forwardRef<HTMLInputElement, ZenPayTabPanelProps>(
  (
    {
      setOpenDepositModal,
      setLoading,
      index,
      providersList,
      onlinePaymentOption,
      setOnlinePaymentOption,
      tabValue,
      depositAmount,
      setDepositAmount,
      mobileNumber,
      setMobileNumber,
      loading,
      copyText,
      depositPaymentMethodsInfo,
      setAlertMsg,
      buttonVariables,
      loggedIn,
      getAdminWhatsAppNumber,
      setShowWhatsapp,
      showWhatsapp,
      domainConfig,
      bonusTypes,
      selectedBonus,
      setSelectedBonus,
      getBonusTypes,
      langData,
      depositImage,
      handleCapture,
      handleClick,
      uploadImage,
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

    const [currencyList, setCurrencyList] = useState<any>([]);
    const [selectedCrypto, setSelectedCrypto] = useState<any>({});
    const [amountToBePaid, setAmountToBePaid] = useState<string>("");
    const [transactionId, setTransactionId] = useState<string>("");
    const [transferReferenceId, setTransferReferenceId] = useState<string>("");
    const [walletAddress, setWalletAddress] = useState<string>("");
    const [qrImage, setQrImage] = useState<string>("");
    const [openTxnBox, setOpenTxnBox] = useState<boolean>(false);
    const [txnHash, setTxnHash] = useState<string>("");

    useEffect(() => {
      if (paymentMethodsList?.length > 0)
        setOnlinePaymentOption(paymentMethodsList[0]);
    }, [paymentMethodsList]);

    const getCurrencyList = async () => {
      try {
        const response = await AGPAY_API.get(
          `/agpay/v2/zenpay-crypto/currencies`,
          {
            headers: {
              Authorization: sessionStorage.getItem("jwt_token"),
            },
          }
        );
        if (response.status === 200) {
          setCurrencyList(response?.data?.crypto_currency);
        }
      } catch (err) {
        console.log(err);
      }
    };

    const submitCryptoAmount = async (e) => {
      e.preventDefault();
      // if (mobileNumber?.length != 10) {
      //   setAlertMsg({
      //     type: "error",
      //     message: 'Invalid Mobile Number'
      //   })
      //   return false;
      // }
      if (Object.keys(selectedCrypto).length == 0) {
        setAlertMsg({
          type: "error",
          message: langData?.["select_crypto_currency"],
        });
        return false;
      }
      setLoading(true);
      try {
        const payload = {
          amount: depositAmount,
          crypto_currency: selectedCrypto.crypto_currency,
          network_id: selectedCrypto.network_id,
          currency_type: "INR",
          mobile_number: "9876543211",
        };
        getBonusTypes(Number(depositAmount), "CRYPTO_WALLET_TRANSFER");
        const response = await AGPAY_API.post(
          `/agpay/v2/zenpay-crypto/transactions/:deposit`,
          payload,
          {
            headers: {
              Authorization: sessionStorage.getItem("jwt_token"),
            },
          }
        );
        if (response.status === 200) {
          setAmountToBePaid(response.data?.crypto_amount);
          setTransactionId(response.data?.transaction_id);
          setTransferReferenceId(response.data?.transfer_reference_id);
          setWalletAddress(response?.data?.wallet_address);
          setQrImage(response?.data?.qr_image);
        }
        setLoading(false);
      } catch (err) {
        console.log(err);
        setAlertMsg({
          type: "error",
          message: err?.response?.data?.message,
        });
        setLoading(false);
      }
    };

    const submitCryptoPayment = async (e) => {
      e.preventDefault();
      if (!depositImage) {
        setAlertMsg({
          type: "error",
          message: "Please Upload Transaction Image",
        });
        return false;
      }

      setLoading(true);
      try {
        const payload = {
          transfer_reference_id: transferReferenceId,
          transaction_hash: txnHash,
          transaction_id: transactionId,
          bonus_policy_id: selectedBonus,
        };
        let formData = new FormData();
        formData.append("paymentSlip", uploadImage);
        formData.append("request", JSON.stringify(payload));

        const response = await AGPAY_API.post(
          `/agpay/v2/zenpay-crypto/:confirm-payment`,
          formData,
          {
            headers: {
              Authorization: sessionStorage.getItem("jwt_token"),
            },
          }
        );
        if (response.status == 200) {
          setAlertMsg({
            type: "success",
            message: langData?.["txn_saved_success_txt"],
          });
          window.location.href = "/my_transactions";
          setOpenDepositModal(false);
        }
        setLoading(false);
      } catch (error) {
        setAlertMsg({
          type: "error",
          message: error?.response?.data?.message,
        });
        setLoading(false);
      }
    };

    useEffect(() => {
      getCurrencyList();
    }, []);

    const setBetAmount = (amount, type) => {
      if (type == "ADD" && !walletAddress) {
        setDepositAmount(String(+depositAmount + +amount));
      }
    };

    return (
      <TabPanel value={tabValue} index={index} className="zenpay-ctn">
        {providersList?.length > 0 ? (
          <>
            <form
              className="account-inputs"
              onSubmit={(e) => submitCryptoAmount(e)}
            >
              <div className="select-template">
                <div className="st-label">{langData?.["select_currency"]}</div>
                <Select
                  value={selectedCrypto}
                  disabled={amountToBePaid ? true : false}
                  onChange={(e: any) => setSelectedCrypto(e.target.value)}
                  className="select-compo"
                  MenuProps={{
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left",
                    },
                    getContentAnchorEl: null,
                  }}
                >
                  {currencyList.map((indv) => (
                    <MenuItem key={indv.crypto_currency} value={indv}>
                      {indv.crypto_currency + " (" + indv.blockchain + ")"}
                    </MenuItem>
                  ))}
                </Select>
              </div>
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
                  disabled={amountToBePaid ? true : false}
                  type="number"
                />
                <div className="clear-row">
                  <span
                    className={"text b-text"}
                    onClick={() => {
                      if (!walletAddress) {
                        setDepositAmount("0");
                      }
                    }}
                  >
                    {langData?.["clear"]}
                  </span>
                </div>
              </div>
              {!amountToBePaid && (
                <Button
                  className={
                    loading || !depositAmount || !selectedCrypto
                      ? "submit-payment-btn submit-btn-disabled"
                      : "submit-payment-btn"
                  }
                  type="submit"
                  disabled={
                    loading || !depositAmount || !selectedCrypto ? true : false
                  }
                  endIcon={loading ? <IonSpinner name="lines-small" /> : ""}
                >
                  {langData?.["next"]}
                </Button>
              )}
            </form>

            {amountToBePaid ? (
              <>
                {bonusTypes.length > 0 && (
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
                <div className="account-inputs">
                  <div className="amount-and-wallet">
                    <div className="display-amount">
                      {langData?.["amount"]} : {"  "}
                      <div
                        style={{
                          cursor: "pointer",
                          fontSize: isMobile ? 12 : "medium",
                        }}
                        className="highlight-figure"
                        onClick={() =>
                          copyText(
                            amountToBePaid,
                            langData?.["amount_copied_txt"]
                          )
                        }
                      >
                        {" " +
                          amountToBePaid +
                          " " +
                          selectedCrypto.crypto_currency}
                      </div>
                      {
                        <button
                          className="r-copy-btn-div"
                          onClick={() =>
                            copyText(
                              amountToBePaid,
                              langData?.["amount_copied_txt"]
                            )
                          }
                        >
                          <img
                            src={CopyIcon}
                            className="r-copy-btn"
                            height={28}
                          />
                        </button>
                      }
                    </div>
                    <div className="display-amount wallet-address">
                      <div className="wallet-address-label">
                        {langData?.["wallet_address"]} : {}{" "}
                        {
                          <button
                            className="r-copy-btn-div"
                            onClick={() =>
                              copyText(
                                walletAddress,
                                langData?.["wallet_address_copied_txt"]
                              )
                            }
                          >
                            <img
                              src={CopyIcon}
                              className="r-copy-btn"
                              height={28}
                            />
                          </button>
                        }
                      </div>
                      <div
                        style={{
                          cursor: "pointer",
                          fontSize: isMobile ? 12 : "medium",
                        }}
                        className="highlight-figure"
                        onClick={() =>
                          copyText(
                            walletAddress,
                            langData?.["wallet_address_copied_txt"]
                          )
                        }
                      >
                        {walletAddress}
                      </div>
                    </div>
                    {qrImage && (
                      <div className="display-amount qr-image">
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
                            <img
                              className="qr-code"
                              style={{
                                height: "auto",
                                maxWidth: "100%",
                                width: "100%",
                              }}
                              src={qrImage}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="account-inputs">
                  <InputTemplate
                    label={langData?.["enter_txn_hash"]}
                    value={txnHash}
                    placeholder={langData?.["enter_txn_hash"]}
                    onChange={(e) => setTxnHash(e)}
                  />
                  <div className="account-input">
                    {depositImage ? (
                      <>
                        <div>
                          <div className="zenpay-uploaded-image-title">
                            Uploaded Image
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
                      Upload Image
                    </Button>
                  </div>
                  <div className="bottom-buttons">
                    <Button
                      className="submit-payment-btn"
                      onClick={(e) => submitCryptoPayment(e)}
                      endIcon={loading ? <IonSpinner name="lines-small" /> : ""}
                    >
                      {langData?.["submit"]}
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
                </div>
              </>
            ) : null}
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

export default ZenPayCrypto;
