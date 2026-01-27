import { IonSpinner } from "@ionic/react";
import Tabs from "@material-ui/core/Tabs";
import Button from "@material-ui/core/Button";
import Add from "@material-ui/icons/Add";
import React, { useEffect, useState } from "react";
import deleteImg from "../../../assets/images/common/icons/accountDelete.svg";
import bank from "../../../assets/images/common/icons/bank.svg";
import InputTemplate from "../../../common/InputTemplate/InputTemplate";
import TabPanel from "../../../components/TabPanel/TabPanel";
import { MenuItem, Select, Tab } from "@material-ui/core";
import AGPAY_API from "../../../api-services/feature-api";
import "../Zenpay.scss";
import { PaymentMethodsInfo } from "../Deposit.types";
import {
  AvailablePaymentGateways,
  getFieldFromToken,
  JwtToken,
} from "../../../util/stringUtil";
import { setAlertMsg } from "../../../store/common/commonActions";
import { AlertDTO } from "../../../models/Alert";
import { connect } from "react-redux";

interface ZenPayProps {
  paymentMethodsInfo: PaymentMethodsInfo;
  selectedWalletDetails: any;
  setSelectedWalletDetails: Function;
  mobileNumber: string;
  setMobileNumber: Function;
  submitCryptoPayment: Function;
  selectedCrypto: any;
  setSelectedCrypto: Function;
  tabValue: number;
  index: number;
  paymentOption: any;
  setPaymentOption: any;
  accountDetails: any;
  selectedAccountId: any;
  setSelectedAccountId: any;
  setShowDeleteModal: any;
  setDeleteId: any;
  addAccount: any;
  setAddAccount: any;
  submitDetails: any;
  loading: boolean;
  accountNumber: any;
  setAccountNumber: any;
  withdrawAmount: any;
  setWithdrawAmount: any;
  setAlertMsg: Function;
  perTxnLimit: number;
  perDayLimit: number;
  minAmountLimitPerDay: number;
  minTxnAmount: number;
  langData: any;
  otp: any;
  setOtp: any;
  sendOtp: any;
  otpTimer: any;
  phoneNumbeErrorMsg: any;
  otpLoader: any;
  pgProvider: string;
}
const ZenPayCrypto: React.FC<ZenPayProps> = ({
  paymentMethodsInfo,
  selectedWalletDetails,
  setSelectedWalletDetails,
  mobileNumber,
  setMobileNumber,
  submitCryptoPayment,
  selectedCrypto,
  setSelectedCrypto,
  index,
  tabValue,
  paymentOption,
  setPaymentOption,
  accountDetails,
  selectedAccountId,
  setSelectedAccountId,
  setShowDeleteModal,
  setDeleteId,
  addAccount,
  setAddAccount,
  submitDetails,
  loading,
  setAccountNumber,
  accountNumber,
  withdrawAmount,
  setWithdrawAmount,
  setAlertMsg,
  perTxnLimit,
  perDayLimit,
  minTxnAmount,
  minAmountLimitPerDay,
  langData,
  otp,
  setOtp,
  sendOtp,
  otpTimer,
  phoneNumbeErrorMsg,
  otpLoader,
  pgProvider,
}) => {
  const [currencyList, setCurrencyList] = useState<any>([]);
  const [recievableAmount, setReceivableAmount] = useState<string>("");

  const isOnlineUser =
    getFieldFromToken(JwtToken.MODE)?.toLowerCase() == "online";

  const getCurrencyList = async () => {
    try {
      const response = await AGPAY_API.get(
        `/agpay/v2/${pgProvider}/currencies`,
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

  const getReceivableAmount = async () => {
    if (!withdrawAmount) {
      setAlertMsg({
        type: "error",
        message: langData?.["enter_amount"],
      });
      return false;
    }
    try {
      const payload = {
        amount: +withdrawAmount,
      };
      const response = await AGPAY_API.post(
        `/agpay/v2/${pgProvider}/exchange-rates`,
        payload,
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
        }
      );
      if (response.status === 200) {
        response.data?.data.map((currency) => {
          if (
            currency?.network_id === selectedWalletDetails?.networkId &&
            currency?.crypto_currency === selectedWalletDetails?.cryptoCurrency
          ) {
            setReceivableAmount(currency?.receivable_amount);
          }
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <TabPanel value={tabValue} index={index}>
      <div className="account-details-ctn">
        <div className="sub-acc-details-ctn">
          {paymentOption === "CRYPTO_WALLET_TRANSFER" &&
            accountDetails?.map((acc) => (
              <div className="account-btn-ctn">
                <Button
                  className={
                    acc?.id?.toString() === selectedAccountId
                      ? "active account-detail-withdraw"
                      : "account-detail-withdraw"
                  }
                  onClick={() => {
                    setSelectedWalletDetails(acc?.paymentMethodDetails);
                    setReceivableAmount("");
                    setSelectedAccountId(acc?.id?.toString());
                  }}
                >
                  <div
                    className={
                      paymentOption === "CRYPTO_WALLET_TRANSFER"
                        ? "delete-btn-ctn-div"
                        : "delete-btn-ctn-div-upi"
                    }
                  >
                    <div className="account-number">
                      {paymentOption === "CRYPTO_WALLET_TRANSFER" && (
                        <div className="account-ifsc">
                          {acc?.paymentMethodDetails?.cryptoCurrency +
                            " (" +
                            acc?.paymentMethodDetails?.blockchain +
                            ")"}
                        </div>
                      )}
                    </div>
                    <Button
                      className="method-delete-btn"
                      onClick={() => {
                        setShowDeleteModal(true);
                        setDeleteId(acc?.id);
                      }}
                    >
                      <img src={deleteImg} />
                    </Button>
                  </div>
                  <div className="account-name-new-ctn">
                    <div className="account-name-new">
                      {acc?.paymentMethodDetails?.walletAddress?.length > 10
                        ? acc?.paymentMethodDetails?.walletAddress?.slice(
                            0,
                            10
                          ) + "****"
                        : acc?.paymentMethodDetails?.walletAddress}
                    </div>
                  </div>
                  <div className="account-name-bottom">
                    {langData?.["my_address"]}
                  </div>
                </Button>
              </div>
            ))}
        </div>
        {paymentOption ? (
          <Button
            title={"Add Wallet"}
            onClick={() => {
              setAddAccount(true);
              getCurrencyList();
            }}
            className="add-btn "
          >
            <div className="add-account ">
              <Add />{" "}
            </div>
            <div className="add-new-accnt">{langData?.["add_wallet"]}</div>
          </Button>
        ) : null}
      </div>

      {paymentOption === "CRYPTO_WALLET_TRANSFER" && addAccount && (
        <form className="account-inputs" onSubmit={(e) => submitDetails(e)}>
          <div className="payment-option-title">
            {langData?.["enter_details"]}
          </div>
          <div className="select-template">
            <div className="st-label">{langData?.["select_currency"]}</div>
            <Select
              value={selectedCrypto}
              onChange={(e: any) => setSelectedCrypto(e.target.value)}
              className="select-compo"
            >
              {currencyList.map((indv) => (
                <MenuItem key={indv.crypto_currency} value={indv}>
                  {indv.crypto_currency + " (" + indv.blockchain + ")"}
                </MenuItem>
              ))}
            </Select>
          </div>
          <InputTemplate
            required
            label={langData?.["enter_wallet_address"]}
            value={accountNumber}
            placeholder={langData?.["enter_wallet_address"]}
            onChange={(e) => setAccountNumber(e)}
          />
          {isOnlineUser && (
            <div className="otp-ctn">
              <InputTemplate
                label={langData?.["otp"]}
                value={otp}
                placeholder={langData?.["otp"]}
                onChange={(e) => setOtp(e)}
                customInputCtnClassName="otp-input"
              />
              <div className="send-otp-ctn">
                <Button
                  className="submit-payment-btn otp-btn"
                  onClick={sendOtp}
                  endIcon={otpLoader ? <IonSpinner name="lines-small" /> : ""}
                  disabled={otpLoader || otpTimer > 0}
                >
                  {langData?.["send_otp"]}
                </Button>
                {otpTimer > 0 && (
                  <div className="otp-timer">
                    {langData?.["resend_in_txt"] + " " + otpTimer + "s"}
                  </div>
                )}
                {phoneNumbeErrorMsg && (
                  <div className="error-msg">{phoneNumbeErrorMsg}</div>
                )}
              </div>
            </div>
          )}
          <Button
            className="submit-payment-btn"
            type="submit"
            endIcon={loading ? <IonSpinner name="lines-small" /> : ""}
            disabled={loading ? true : false}
          >
            {langData?.["add"]}
          </Button>
        </form>
      )}

      {paymentOption === "CRYPTO_WALLET_TRANSFER" && selectedAccountId ? (
        <div className="account-inputs">
          <div className="note-msg">{langData?.["withdraw_info_txt"]}</div>
          <div className="payment-option-title">
            {langData?.["enter_payment_details"]}
          </div>
          <InputTemplate
            required={true}
            label={langData?.["enter_amount"] + " (INR)"}
            value={withdrawAmount}
            type={"number"}
            disabled={recievableAmount ? true : false}
            placeholder={langData?.["enter_withdraw_amount"]}
            onChange={(e) => setWithdrawAmount(e)}
          />
          {/* <InputTemplate
            required={true}
            label={'Enter Mobile Number'}
            disabled={recievableAmount ? true : false}
            value={mobileNumber}
            type="number"
            placeholder={'Enter Mobile Number'}
            onChange={(e) => setMobileNumber(e)}
          /> */}
          {perDayLimit > 0 && minTxnAmount > 0 && (
            <div className="note-msg">
              {`Reminder: A maximum of ${perDayLimit} withdrawals are allowed per day, with no withdrawals permitted below ₹${minTxnAmount}.`}
            </div>
          )}
          {!recievableAmount && (
            <Button
              className="submit-payment-btn"
              type="submit"
              onClick={() => getReceivableAmount()}
              disabled={loading ? true : false}
              endIcon={loading ? <IonSpinner name="lines-small" /> : ""}
            >
              {langData?.["next"]}
            </Button>
          )}
        </div>
      ) : null}
      {recievableAmount ? (
        <div className="account-inputs">
          <div className="display-amount amount-and-wallet">
            {langData?.["receivable_crypto_amount"]}:{" "}
            {recievableAmount + " " + selectedWalletDetails?.cryptoCurrency}
          </div>
          <Button
            className="submit-payment-btn open-txn-btn"
            onClick={(e) => submitCryptoPayment(e, pgProvider)}
            endIcon={loading ? <IonSpinner name="lines-small" /> : ""}
            disabled={loading ? true : false}
          >
            {langData?.["submit"]}
          </Button>
        </div>
      ) : null}
    </TabPanel>
  );
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    setAlertMsg: (alert: AlertDTO) => dispatch(setAlertMsg(alert)),
  };
};

export default connect(null, mapDispatchToProps)(ZenPayCrypto);
