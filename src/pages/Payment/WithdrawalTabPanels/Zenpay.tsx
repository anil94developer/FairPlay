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
  providersList: any;
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
  setHolderName: any;
  holderName: any;
  setIfscCode: any;
  ifscCode: any;
  otp: any;
  setOtp: any;
  sendOtp: any;
  setBranchName: any;
  branchName: any;
  setBankName: any;
  bankName: any;
  submitAbcPayment: any;
  withdrawAmount: any;
  setWithdrawNotes: any;
  withdrawNotes: any;
  setWithdrawAmount: any;
  pgProvider: string;
  perTxnLimit: number;
  perDayLimit: number;
  minAmountLimitPerDay: number;
  minTxnAmount: number;
  langData: any;
  otpTimer: any;
  phoneNumbeErrorMsg: any;
  otpLoader: any;
}
const ZenPay: React.FC<ZenPayProps> = ({
  paymentMethodsInfo,
  selectedWalletDetails,
  setSelectedWalletDetails,
  mobileNumber,
  setMobileNumber,
  submitCryptoPayment,
  selectedCrypto,
  setSelectedCrypto,
  index,
  providersList,
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
  holderName,
  setHolderName,
  setIfscCode,
  ifscCode,
  setBranchName,
  branchName,
  setBankName,
  bankName,
  submitAbcPayment,
  withdrawAmount,
  setWithdrawNotes,
  withdrawNotes,
  setWithdrawAmount,
  pgProvider,
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
}) => {
  const [currencyList, setCurrencyList] = useState<any>([]);
  const [recievableAmount, setReceivableAmount] = useState<Number>(0);

  const isOnlineUser =
    getFieldFromToken(JwtToken.MODE)?.toLowerCase() == "online";

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

  const getReceivableAmount = async () => {
    try {
      const payload = {
        amount: +withdrawAmount,
      };
      const response = await AGPAY_API.post(
        `/agpay/v2/zenpay-crypto/exchange-rates`,
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
            setReceivableAmount(currency?.receivable_amount.toFixed(6));
          }
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <TabPanel value={tabValue} index={index}>
      <div className="payment-option-title">
        {langData?.["choose_payment_option"]}
      </div>
      <Tabs
        value={paymentOption}
        onChange={(_, newValue) => {
          setReceivableAmount(0);
          setMobileNumber("");
          setWithdrawAmount("");
          setPaymentOption(newValue);
        }}
      >
        {paymentMethodsInfo[AvailablePaymentGateways.ZENPAY]?.map(
          (paymentMethod) => (
            <Tab
              value={paymentMethod}
              label={
                paymentMethod === "BANK_TRANSFER"
                  ? langData?.["bank"]
                  : langData?.[paymentMethod]
              }
            />
          )
        )}
      </Tabs>
      <div className="account-details-ctn">
        <div className="sub-acc-details-ctn">
          {paymentOption === "BANK_TRANSFER" &&
            accountDetails?.map((acc) => (
              <div className="account-btn-ctn">
                <Button
                  className={
                    acc?.id?.toString() === selectedAccountId
                      ? "active account-detail-withdraw"
                      : "account-detail-withdraw"
                  }
                  onClick={() => setSelectedAccountId(acc?.id?.toString())}
                >
                  <div
                    className={
                      paymentOption === "BANK_TRANSFER"
                        ? "delete-btn-ctn-div"
                        : "delete-btn-ctn-div-upi"
                    }
                  >
                    <div></div>
                    <div className="account-number">
                      {paymentOption === "BANK_TRANSFER" && (
                        <div className="account-ifsc">
                          {acc?.paymentMethodDetails?.ifscCode}
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
                      {acc?.paymentMethodDetails?.accountNumber?.length > 4
                        ? acc?.paymentMethodDetails?.accountNumber?.slice(
                            0,
                            4
                          ) + " **** **** ****"
                        : acc?.paymentMethodDetails?.accountNumber}
                    </div>
                  </div>
                  <div className="account-name-bottom">
                    {langData?.["my_card"]}
                  </div>
                </Button>
              </div>
            ))}
        </div>
        {paymentOption ? (
          <Button
            title={"Add Account"}
            onClick={() => {
              setAddAccount(true);
            }}
            className="add-btn "
          >
            <div className="add-account ">
              <Add />{" "}
            </div>
            <div className="add-new-accnt">{langData?.["add_account"]}</div>
          </Button>
        ) : null}
      </div>
      {paymentOption === "BANK_TRANSFER" && addAccount && (
        <form className="account-inputs" onSubmit={(e) => submitDetails(e)}>
          <div className="payment-option-title">
            {langData?.["enter_details"]}
          </div>
          <InputTemplate
            required={true}
            label={langData?.["account_no"]}
            value={accountNumber}
            placeholder={langData?.["enter_account_no"]}
            onChange={(e) => setAccountNumber(e)}
          />
          <InputTemplate
            required
            label={langData?.["account_holder_name"]}
            value={holderName}
            placeholder={langData?.["account_holder_name"]}
            onChange={(e) => setHolderName(e)}
          />
          <InputTemplate
            label={langData?.["bank_name"]}
            value={bankName}
            placeholder={langData?.["bank_name"]}
            onChange={(e) => setBankName(e)}
          />
          <InputTemplate
            label={langData?.["branch_name"]}
            value={branchName}
            placeholder={langData?.["branch_name"]}
            onChange={(e) => setBranchName(e)}
          />
          <InputTemplate
            label={langData?.["ifsc_no"]}
            value={ifscCode}
            placeholder={langData?.["ifsc_code"]}
            onChange={(e) => setIfscCode(e)}
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

      {paymentOption === "BANK_TRANSFER" && selectedAccountId ? (
        <form
          className="account-inputs"
          onSubmit={(e) => {
            submitAbcPayment(e, pgProvider);
          }}
        >
          <div className="note-msg">{langData?.["withdraw_info_txt"]}</div>
          <div className="payment-option-title">
            {langData?.["enter_payment_details"]}
          </div>
          <InputTemplate
            required={true}
            label={langData?.["enter_amount"] + " (INR)"}
            value={withdrawAmount}
            type={"number"}
            placeholder={langData?.["enter_withdraw_amount"]}
            onChange={(e) => setWithdrawAmount(e)}
          />
          <InputTemplate
            required={true}
            label={langData?.["enter_notes"]}
            value={withdrawNotes}
            placeholder={langData?.["enter_notes"]}
            onChange={(e) => setWithdrawNotes(e)}
          />
          {perDayLimit > 0 && minTxnAmount > 0 && (
            <div className="note-msg limit">
              {`Reminder: A maximum of ${perDayLimit} withdrawals are allowed per day, with no withdrawals permitted below ₹${minTxnAmount}.`}
            </div>
          )}
          <Button
            className="submit-payment-btn"
            type="submit"
            disabled={loading ? true : false}
            endIcon={loading ? <IonSpinner name="lines-small" /> : ""}
          >
            {langData?.["submit"]}
          </Button>
        </form>
      ) : null}
    </TabPanel>
  );
};

export default ZenPay;
