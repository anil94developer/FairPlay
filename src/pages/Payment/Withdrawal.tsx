import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import React, { lazy, useEffect, useRef, useState } from "react";
import { connect, useDispatch } from "react-redux";
import FEATURE_API from "../../api-services/feature-api";
import { RootState } from "../../models/RootState";
import "./Payment.scss";
import "./Withdraw.scss";

import { useHistory } from "react-router";
import AGPAY_API from "../../api-services/feature-api";
import { ReactComponent as withdrawIcon } from "../../assets/images/reportIcons/withdraw.svg?react";
import ReportBackBtn from "../../common/ReportBackBtn/ReportBackBtn";
import ReportsHeader from "../../common/ReportsHeader/ReportsHeader";
import { AlertDTO } from "../../models/Alert";
import { fetchBalance, logout, setOpenWithdrawModal } from "../../store";
import { paymentMethods } from "../../description/paymentMethods";
import { setAlertMsg } from "../../store/common/commonActions";
import {
  AvailablePaymentGateways,
  getFieldFromToken,
  JwtToken,
  normalizeInput,
} from "../../util/stringUtil";
import { AccountDetails } from "./AccountDetails";
import { fetchPaymentMethod } from "./WithdrawalTabPanels/common";
import SVLS_API from "../../api-services/svls-api";
const AbcMoney = lazy(() => import("./WithdrawalTabPanels/AbcMoney"));
const Pgman = lazy(() => import("./WithdrawalTabPanels/Pgman"));
const XenonPay = lazy(() => import("./WithdrawalTabPanels/XenonPay"));
const ZenPay = lazy(() => import("./WithdrawalTabPanels/Zenpay"));
const ZenPayCrypto = lazy(() => import("./WithdrawalTabPanels/ZenpayCrypto"));

type StoreProps = {
  setOpenWithdrawModal: Function;
  setAlertMsg: Function;
  balance: number;
  bonusRedeemed: number;
  nonCashableAmount: number;
  cashableAmount: number;
  exposure: number;
  langData: any;
  logout: Function;
};

const Withdrawal: React.FC<StoreProps> = (props) => {
  const {
    setOpenWithdrawModal,
    setAlertMsg,
    balance,
    bonusRedeemed,
    nonCashableAmount,
    exposure,
    cashableAmount,
    langData,
    logout,
  } = props;
  const [tabValue, setTabValue] = useState<number>(0);
  const [paymentOption, setPaymentOption] = useState<string>("NEFT");
  const [UpiOption, setUpiOption] = useState<string>("");
  const [onlinePaymentOption, setOnlinePaymentOption] = useState<string>("");
  const [accountDetails, setAccountDetails] = useState<AccountDetails[]>();
  const [selectedAccountId, setSelectedAccountId] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [addAccount, setAddAccount] = useState<boolean>(false);
  const [accountNumber, setAccountNumber] = useState<string>();
  const [withdrawAmount, setWithdrawAmount] = useState<string>();
  const [holderName, setHolderName] = useState<string>();
  const [displayName, setDisplayName] = useState<string>();
  const [ifscCode, setIfscCode] = useState<string>();
  const [bankName, setBankName] = useState<string>();
  const [branchName, setBranchName] = useState<string>();
  const [phoneNumber, setPhoneNumber] = useState<string>();
  const [otp, setOtp] = useState<number>();
  const [otpTimer, setOtpTimer] = useState<number>();
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<number>();
  const [providersList, setProvidersList] = useState([]);
  const [paymentMethodsInfo, setPaymentMethodsInfo] = useState<any>([]);
  const [paymentGatewaysCount, setPaymentGatewaysCount] = useState<number>(0);
  const [selectedCrypto, setSelectedCrypto] = useState<any>({});
  let indexCount = 0;
  const history = useHistory();

  const [withdrawNotes, setWithdrawNotes] = useState<string>();
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [selectedWalletDetails, setSelectedWalletDetails] = useState<any>({});
  const [perTxnLimit, setPerTxnLimit] = useState<number>(0);
  const [perDayLimit, setPerDayLimit] = useState<number>(0);
  const [minTxnAmount, setMinTxnAmount] = useState<number>(0);
  const [minAmountLimitPerDay, setMinAmountLimitPerDay] = useState<number>(0);
  const [phoneNumbeErrorMsg, setPhoneNumbeErrorMsg] = useState<string>("");
  const [otpLoader, setOtpLoader] = useState<boolean>(false);

  const successToast = (mess: string) => {
    setAlertMsg({
      type: "success",
      message: mess,
    });
  };

  const errorToast = (mess: string) => {
    setAlertMsg({
      type: "error",
      message: mess,
    });
  };

  const otpTimerIdRef = useRef(null);

  const handleOtpTimer = (time) => {
    if (otpTimerIdRef.current) {
      clearTimeout(otpTimerIdRef.current);
    }

    if (time === 0) {
      setOtpTimer(undefined);
      return;
    }

    if (time > 0) {
      setOtpTimer(time);
      otpTimerIdRef.current = setTimeout(() => {
        handleOtpTimer(time - 1);
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (otpTimerIdRef.current) {
      clearTimeout(otpTimerIdRef.current);
      otpTimerIdRef.current = null;
    }
    setOtpTimer(0);
  };

  const sendOtp = async () => {
    setPhoneNumbeErrorMsg("");
    setOtpLoader(true);
    try {
      const response = await SVLS_API.post(
        `/account/v2/users/otp`,
        {},
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
        }
      );
      handleOtpTimer(60);
    } catch (err) {
      setPhoneNumbeErrorMsg(err?.response?.data?.message);
    }
    setOtpLoader(false);
  };

  const getPaymentProviders = () => {
    setPaymentMethodsInfo(paymentMethods?.withdrawMethods);
    setPerDayLimit(paymentMethods?.perDayLimit);
    setPerTxnLimit(paymentMethods?.perTxnLimit);
    setMinTxnAmount(paymentMethods?.minTxnAmount);
    setMinAmountLimitPerDay(paymentMethods?.minAmountLimitPerDay);
  };

  useEffect(() => {
    setPaymentGatewaysCount(0);
    getPaymentProviders();
  }, []);

  const submitAbcPayment = async (e, selectedPayment = "abcmoney") => {
    e.preventDefault();
    if (Number(withdrawAmount) < 100) {
      setAlertMsg({
        type: "error",
        message: langData?.["min_100_withdrawal_amount_txt"],
      });
      return false;
    }
    setLoading(true);
    try {
      const payload = {
        amount: withdrawAmount,
        notes: withdrawNotes,
        payment_method_id: selectedAccountId,
        payment_method: "BANK_TRANSFER",
        currency_type: "INR",
        mobile_number: "9000900099",
      };
      const response = await FEATURE_API.post(
        `/agpay/v2/${selectedPayment}/transactions/:withdraw`,
        payload,
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
        }
      );
      if (response.status === 200) {
        successToast(langData?.["txn_saved_success_txt"]);
        setOpenWithdrawModal(false);
        history.push("/my_transactions");
      } else {
        setAlertMsg({
          type: "error",
          message: langData?.["general_err_txt"],
        });
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

  const submitCryptoPayment = async (e, selectedPayment = "zenpay-crypto") => {
    e.preventDefault();
    if (Number(withdrawAmount) < minTxnAmount) {
      setAlertMsg({
        type: "error",
        message: langData?.["min_withdrawal_amount_txt"] + " " + minTxnAmount,
      });
      return false;
    }
    setLoading(true);
    try {
      const payload = {
        payment_method: "CRYPTO_WALLET_TRANSFER",
        currency_type: "INR",
        amount: withdrawAmount,
        mobile_number: mobileNumber ? mobileNumber : "9876543211",
        payment_method_id: selectedAccountId,
        crypto_currency: selectedWalletDetails.cryptoCurrency,
        network_id: selectedWalletDetails.networkId,
        wallet_address: selectedWalletDetails.walletAddress,
      };
      const response = await FEATURE_API.post(
        `/agpay/v2/${selectedPayment}/transactions/:withdraw`,
        payload,
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
        }
      );
      if (response.status === 200) {
        successToast(langData?.["txn_saved_success_txt"]);
        setOpenWithdrawModal(false);
        history.push("/my_transactions");
      } else {
        setAlertMsg({
          type: "error",
          message: langData?.["general_err_txt"],
        });
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

  const submitOnlinePayment = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        amount: Number(withdrawAmount),
        gatewayProvider: "INSTAPETECH",
        notes: withdrawNotes,
        payment_method_id: selectedAccountId,
        payment_option: onlinePaymentOption,
        // paymentMethod: accountDetails[0].paymentMethod,
      };
      setLoading(true);
      const response = await FEATURE_API.post(
        `/agpay/v1/online/:payout`,
        payload,
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
        }
      );
      if (response.status === 204) {
        successToast("Transaction Saved Successfully!");
      } else {
        setAlertMsg({
          type: "error",
          message: langData?.["general_err_txt"],
        });
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

  const submitPayment = async (e) => {
    e.preventDefault();
    if (Number(withdrawAmount) < minTxnAmount) {
      setAlertMsg({
        type: "error",
        message: langData?.["min_withdrawal_amount_txt"] + " " + minTxnAmount,
      });
      return false;
    }
    setLoading(true);
    try {
      const payload = {
        amount: withdrawAmount,
        notes: withdrawNotes,
        payment_method_id: selectedAccountId,
        // paymentMethod: accountDetails[0].paymentMethod,
      };
      const response = await FEATURE_API.post(
        `/agpay/v2/pgman/transactions/:withdraw`,
        payload,
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
        }
      );
      if (response.status === 204) {
        successToast(langData?.["txn_saved_success_txt"]);
        setOpenWithdrawModal(false);
        history.push("/my_transactions");
      } else {
        setAlertMsg({
          type: "error",
          message: langData?.["general_err_txt"],
        });
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

  const submitXenonPay = async (e) => {
    e.preventDefault();
    if (Number(withdrawAmount) < 100) {
      errorToast(langData?.["min_100_withdrawal_amount_txts"]);
      return false;
    }
    setLoading(true);
    try {
      const payload = {
        amount: withdrawAmount,
        notes: withdrawNotes,
        payment_method_id: selectedAccountId,
      };
      const response = await FEATURE_API.post(
        `/agpay/v2/xenon-pay/transactions/:withdraw`,
        payload,
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
        }
      );
      if (response.status === 204) {
        successToast(langData?.["txn_saved_success_txt"]);
        setOpenWithdrawModal(false);
        history.push("/my_transactions");
      } else {
        setAlertMsg({
          type: "error",
          message: langData?.["general_err_txt"],
        });
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
    if (paymentOption) {
      setAccountDetails([]);
      setSelectedAccountId("");
      setWithdrawAmount("");
      setWithdrawNotes("");
      setAccountNumber("");
      setWithdrawAmount("");
      setHolderName("");
      setDisplayName("");
      setIfscCode("");
      setAddAccount(false);
    }
  }, [paymentOption]);

  useEffect(() => {
    if (addAccount) {
      setSelectedAccountId("");
    }
  }, [addAccount]);

  useEffect(() => {
    if (selectedAccountId) {
      setAddAccount(false);
    }
  }, [selectedAccountId]);

  const isOnlineUser =
    getFieldFromToken(JwtToken.MODE)?.toLowerCase() === "online";

  const submitDetails = async (e) => {
    e.preventDefault();
    if ((isOnlineUser && !otp) || otp > 999999) {
      setAlertMsg({
        type: "error",
        message: "Please enter valid OTP",
      });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        accountHolderName: normalizeInput(holderName),
        accountNumber: normalizeInput(accountNumber.trim()),
        displayName: "",
        bankName: normalizeInput(bankName),
        branchName: normalizeInput(branchName),
        ifscCode: normalizeInput(ifscCode.trim()),
        paymentMethod:
          paymentOption === "NEFT" || paymentOption == "BANK_TRANSFER"
            ? "BANK_TRANSFER"
            : "UPI_TRANSFER",
        otp: otp,
      };

      const payTMPayload = {
        accountNumber: normalizeInput(accountNumber),
        accountHolderName: normalizeInput(holderName),
        displayName: normalizeInput(displayName),
        paymentMethod: "PAYTM_WALLET_TRANSFER",
        otp: otp,
      };

      const cryptoPayload = {
        paymentMethod: paymentOption,
        accountNumber: normalizeInput(accountNumber.trim()),
        cryptoCurrencyType: selectedCrypto.crypto_currency,
        blockchain: selectedCrypto.blockchain,
        networkId: selectedCrypto.network_id,
        otp: otp,
      };

      const response = await FEATURE_API.post(
        `/agpay/v2/pgman/payment-methods`,
        paymentOption === "PAYTM_WALLET"
          ? payTMPayload
          : paymentOption === "CRYPTO_WALLET_TRANSFER"
          ? cryptoPayload
          : payload,
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
        }
      );
      if (response.status === 200 || 204) {
        fetchPaymentMethod(paymentOption, setAccountDetails);
        successToast(langData?.["details_saved_success_txt"]);
        setOpenWithdrawModal(false);
        setAddAccount(false);
        setHolderName("");
        setAccountNumber("");
        setBankName("");
        setBranchName("");
        setIfscCode("");
        setDisplayName("");
        setSelectedCrypto({});
        setOtp(null);
        stopTimer();
      } else {
        setAlertMsg({
          type: "error",
          message: langData?.["general_err_txt"],
        });
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

  const submitXenonPayPaymentDetails = async (e) => {
    e.preventDefault();
    console.log(e);
    setLoading(true);
    try {
      const payload = {
        accountHolderName: holderName,
        accountNumber: accountNumber,
        ifscCode: ifscCode,
        bankName: bankName,
        branchName: branchName,
        phoneNumber: phoneNumber,
        email: "bjhb@nk.nk",
        upiId: "",
      };

      const response = await FEATURE_API.post(
        `/agpay/v2/xenon-pay/payment-methods`,
        payload,
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
        }
      );
      if (response.status === 200 || 204) {
        successToast(langData?.["details_saved_success_txt"]);
        history.push("/my_transactions");
        setOpenWithdrawModal(false);
      } else {
        setAlertMsg({
          type: "error",
          message: langData?.["general_err_txt"],
        });
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

  const deletePaymentMethod = async () => {
    try {
      const response = await AGPAY_API.delete(
        `/agpay/v2/pgman/payment-methods/${deleteId}`,
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
        }
      );

      if (response.status === 204 || 200) {
        fetchPaymentMethod(paymentOption, setAccountDetails);
        successToast(langData?.["beneficiary_account_deleted_success_txt"]);
      }
      // setDeleteId(null);
    } catch (err) {
      errorToast(err.response.data.message);
      // setDeleteId(null);
    }
  };

  const redirectToHome = () => {
    history.goBack();
  };

  const renderWithdrawForm = (
    paymentGateway: AvailablePaymentGateways,
    index: number,
    tabValue: number
  ) => {
    switch (paymentGateway) {
      case AvailablePaymentGateways.ABCMONEY:
        return (
          <AbcMoney
            index={index}
            accountDetails={accountDetails}
            paymentMethodsInfo={paymentMethodsInfo}
            paymentOption={paymentOption}
            setPaymentOption={setPaymentOption}
            tabValue={tabValue}
            selectedAccountId={selectedAccountId}
            setSelectedAccountId={setSelectedAccountId}
            setShowDeleteModal={setShowDeleteModal}
            onlinePaymentOption={onlinePaymentOption}
            setAddAccount={setAddAccount}
            setDeleteId={setDeleteId}
            setOnlinePaymentOption={setOnlinePaymentOption}
            submitOnlinePayment={submitOnlinePayment}
            submitPayment={submitAbcPayment}
            setWithdrawAmount={setWithdrawAmount}
            withdrawAmount={withdrawAmount}
            loading={loading}
            setWithdrawNotes={setWithdrawNotes}
            withdrawNotes={withdrawNotes}
            setAccountDetails={setAccountDetails}
            langData={langData}
          />
        );

      case AvailablePaymentGateways.PGMAN:
        return (
          <Pgman
            index={index}
            paymentOption={paymentOption}
            paymentMethodsInfo={paymentMethodsInfo}
            setPaymentOption={setPaymentOption}
            setUpiOption={setUpiOption}
            tabValue={tabValue}
            UpiOption={UpiOption}
            accountDetails={accountDetails}
            selectedAccountId={selectedAccountId}
            setDeleteId={setDeleteId}
            setSelectedAccountId={setSelectedAccountId}
            setShowDeleteModal={setShowDeleteModal}
            loading={loading}
            setAddAccount={setAddAccount}
            setWithdrawAmount={setWithdrawAmount}
            setWithdrawNotes={setWithdrawNotes}
            submitOnlinePayment={submitOnlinePayment}
            submitPayment={submitPayment}
            withdrawAmount={withdrawAmount}
            withdrawNotes={withdrawNotes}
            addAccount={addAccount}
            accountNumber={accountNumber}
            setAccountNumber={setAccountNumber}
            submitDetails={submitDetails}
            bankName={bankName}
            branchName={branchName}
            holderName={holderName}
            ifscCode={ifscCode}
            setBankName={setBankName}
            setBranchName={setBranchName}
            setHolderName={setHolderName}
            setIfscCode={setIfscCode}
            displayName={displayName}
            setDisplayName={setDisplayName}
            setAccountDetails={setAccountDetails}
            langData={langData}
          />
        );

      case AvailablePaymentGateways.XENONPAY:
        return (
          <XenonPay
            index={index}
            paymentMethodsInfo={paymentMethodsInfo}
            paymentOption={paymentOption}
            setPaymentOption={setPaymentOption}
            tabValue={tabValue}
            accountDetails={accountDetails}
            selectedAccountId={selectedAccountId}
            setDeleteId={setDeleteId}
            setSelectedAccountId={setSelectedAccountId}
            setShowDeleteModal={setShowDeleteModal}
            loading={loading}
            setAddAccount={setAddAccount}
            setWithdrawAmount={setWithdrawAmount}
            setWithdrawNotes={setWithdrawNotes}
            withdrawAmount={withdrawAmount}
            withdrawNotes={withdrawNotes}
            addAccount={addAccount}
            accountNumber={accountNumber}
            setAccountNumber={setAccountNumber}
            branchName={branchName}
            holderName={holderName}
            ifscCode={ifscCode}
            setBranchName={setBranchName}
            setHolderName={setHolderName}
            setIfscCode={setIfscCode}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            submitXenonPay={submitXenonPay}
            submitXenonPayPaymentDetails={submitXenonPayPaymentDetails}
            setAccountDetails={setAccountDetails}
            langData={langData}
          />
        );

      case AvailablePaymentGateways.ZENPAY:
        return (
          <ZenPay
            paymentMethodsInfo={paymentMethodsInfo}
            selectedWalletDetails={selectedWalletDetails}
            setSelectedWalletDetails={setSelectedWalletDetails}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            submitCryptoPayment={submitCryptoPayment}
            selectedCrypto={selectedCrypto}
            setSelectedCrypto={setSelectedCrypto}
            tabValue={tabValue}
            index={index}
            providersList={providersList}
            paymentOption={paymentOption}
            setPaymentOption={setPaymentOption}
            accountDetails={accountDetails}
            selectedAccountId={selectedAccountId}
            setSelectedAccountId={setSelectedAccountId}
            setShowDeleteModal={setShowDeleteModal}
            setDeleteId={setDeleteId}
            addAccount={addAccount}
            setAddAccount={setAddAccount}
            submitDetails={submitDetails}
            loading={loading}
            accountNumber={accountNumber}
            setAccountNumber={setAccountNumber}
            setHolderName={setHolderName}
            holderName={holderName}
            setIfscCode={setIfscCode}
            ifscCode={ifscCode}
            setBranchName={setBranchName}
            branchName={branchName}
            setBankName={setBankName}
            bankName={bankName}
            submitAbcPayment={submitAbcPayment}
            withdrawAmount={withdrawAmount}
            setWithdrawNotes={setWithdrawNotes}
            withdrawNotes={withdrawNotes}
            setWithdrawAmount={setWithdrawAmount}
            pgProvider="zenpay"
            perDayLimit={perDayLimit}
            perTxnLimit={perTxnLimit}
            minTxnAmount={minTxnAmount}
            minAmountLimitPerDay={minAmountLimitPerDay}
            langData={langData}
            otp={otp}
            setOtp={setOtp}
            sendOtp={sendOtp}
            otpTimer={otpTimer}
            phoneNumbeErrorMsg={phoneNumbeErrorMsg}
            otpLoader={otpLoader}
          />
        );
      case AvailablePaymentGateways.ZENPAY1:
        return (
          <ZenPay
            paymentMethodsInfo={paymentMethodsInfo}
            selectedWalletDetails={selectedWalletDetails}
            setSelectedWalletDetails={setSelectedWalletDetails}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            submitCryptoPayment={submitCryptoPayment}
            selectedCrypto={selectedCrypto}
            setSelectedCrypto={setSelectedCrypto}
            tabValue={tabValue}
            index={index}
            providersList={providersList}
            paymentOption={paymentOption}
            setPaymentOption={setPaymentOption}
            accountDetails={accountDetails}
            selectedAccountId={selectedAccountId}
            setSelectedAccountId={setSelectedAccountId}
            setShowDeleteModal={setShowDeleteModal}
            setDeleteId={setDeleteId}
            addAccount={addAccount}
            setAddAccount={setAddAccount}
            submitDetails={submitDetails}
            loading={loading}
            accountNumber={accountNumber}
            setAccountNumber={setAccountNumber}
            setHolderName={setHolderName}
            holderName={holderName}
            setIfscCode={setIfscCode}
            ifscCode={ifscCode}
            setBranchName={setBranchName}
            branchName={branchName}
            setBankName={setBankName}
            bankName={bankName}
            submitAbcPayment={submitAbcPayment}
            withdrawAmount={withdrawAmount}
            setWithdrawNotes={setWithdrawNotes}
            withdrawNotes={withdrawNotes}
            setWithdrawAmount={setWithdrawAmount}
            pgProvider="zenpay1"
            perDayLimit={perDayLimit}
            perTxnLimit={perTxnLimit}
            minTxnAmount={minTxnAmount}
            minAmountLimitPerDay={minAmountLimitPerDay}
            langData={langData}
            otp={otp}
            setOtp={setOtp}
            sendOtp={sendOtp}
            otpTimer={otpTimer}
            phoneNumbeErrorMsg={phoneNumbeErrorMsg}
            otpLoader={otpLoader}
          />
        );

      case AvailablePaymentGateways.ZENPAY2:
        return (
          <ZenPay
            paymentMethodsInfo={paymentMethodsInfo}
            selectedWalletDetails={selectedWalletDetails}
            setSelectedWalletDetails={setSelectedWalletDetails}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            submitCryptoPayment={submitCryptoPayment}
            selectedCrypto={selectedCrypto}
            setSelectedCrypto={setSelectedCrypto}
            tabValue={tabValue}
            index={index}
            providersList={providersList}
            paymentOption={paymentOption}
            setPaymentOption={setPaymentOption}
            accountDetails={accountDetails}
            selectedAccountId={selectedAccountId}
            setSelectedAccountId={setSelectedAccountId}
            setShowDeleteModal={setShowDeleteModal}
            setDeleteId={setDeleteId}
            addAccount={addAccount}
            setAddAccount={setAddAccount}
            submitDetails={submitDetails}
            loading={loading}
            accountNumber={accountNumber}
            setAccountNumber={setAccountNumber}
            setHolderName={setHolderName}
            holderName={holderName}
            setIfscCode={setIfscCode}
            ifscCode={ifscCode}
            setBranchName={setBranchName}
            branchName={branchName}
            setBankName={setBankName}
            bankName={bankName}
            submitAbcPayment={submitAbcPayment}
            withdrawAmount={withdrawAmount}
            setWithdrawNotes={setWithdrawNotes}
            withdrawNotes={withdrawNotes}
            setWithdrawAmount={setWithdrawAmount}
            pgProvider="zenpay2"
            perDayLimit={perDayLimit}
            perTxnLimit={perTxnLimit}
            minTxnAmount={minTxnAmount}
            minAmountLimitPerDay={minAmountLimitPerDay}
            langData={langData}
            otp={otp}
            setOtp={setOtp}
            sendOtp={sendOtp}
            otpTimer={otpTimer}
            phoneNumbeErrorMsg={phoneNumbeErrorMsg}
            otpLoader={otpLoader}
          />
        );

      case AvailablePaymentGateways.ZENPAYCRYPTO:
        return (
          <ZenPayCrypto
            paymentMethodsInfo={paymentMethodsInfo}
            selectedWalletDetails={selectedWalletDetails}
            setSelectedWalletDetails={setSelectedWalletDetails}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            submitCryptoPayment={submitCryptoPayment}
            selectedCrypto={selectedCrypto}
            setSelectedCrypto={setSelectedCrypto}
            tabValue={tabValue}
            index={index}
            paymentOption={paymentOption}
            setPaymentOption={setPaymentOption}
            accountDetails={accountDetails}
            selectedAccountId={selectedAccountId}
            setSelectedAccountId={setSelectedAccountId}
            setShowDeleteModal={setShowDeleteModal}
            setDeleteId={setDeleteId}
            addAccount={addAccount}
            setAddAccount={setAddAccount}
            submitDetails={submitDetails}
            loading={loading}
            accountNumber={accountNumber}
            setAccountNumber={setAccountNumber}
            withdrawAmount={withdrawAmount}
            setWithdrawAmount={setWithdrawAmount}
            perDayLimit={perDayLimit}
            perTxnLimit={perTxnLimit}
            minTxnAmount={minTxnAmount}
            minAmountLimitPerDay={minAmountLimitPerDay}
            langData={langData}
            otp={otp}
            setOtp={setOtp}
            sendOtp={sendOtp}
            otpTimer={otpTimer}
            phoneNumbeErrorMsg={phoneNumbeErrorMsg}
            otpLoader={otpLoader}
            pgProvider="zenpay-crypto"
          />
        );
      case AvailablePaymentGateways.ZENPAYCRYPTOSEAMLESS:
        return (
          <ZenPayCrypto
            paymentMethodsInfo={paymentMethodsInfo}
            selectedWalletDetails={selectedWalletDetails}
            setSelectedWalletDetails={setSelectedWalletDetails}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            submitCryptoPayment={submitCryptoPayment}
            selectedCrypto={selectedCrypto}
            setSelectedCrypto={setSelectedCrypto}
            tabValue={tabValue}
            index={index}
            paymentOption={paymentOption}
            setPaymentOption={setPaymentOption}
            accountDetails={accountDetails}
            selectedAccountId={selectedAccountId}
            setSelectedAccountId={setSelectedAccountId}
            setShowDeleteModal={setShowDeleteModal}
            setDeleteId={setDeleteId}
            addAccount={addAccount}
            setAddAccount={setAddAccount}
            submitDetails={submitDetails}
            loading={loading}
            accountNumber={accountNumber}
            setAccountNumber={setAccountNumber}
            withdrawAmount={withdrawAmount}
            setWithdrawAmount={setWithdrawAmount}
            perDayLimit={perDayLimit}
            perTxnLimit={perTxnLimit}
            minTxnAmount={minTxnAmount}
            minAmountLimitPerDay={minAmountLimitPerDay}
            langData={langData}
            otp={otp}
            setOtp={setOtp}
            sendOtp={sendOtp}
            otpTimer={otpTimer}
            phoneNumbeErrorMsg={phoneNumbeErrorMsg}
            otpLoader={otpLoader}
            pgProvider="zenpay-crypto-seamless"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="withdraw-ctn-new">
      <div className="withdraw-back-btn-report-header">
        <ReportBackBtn back={langData?.["back"]} />
        <ReportsHeader
          titleIcon={withdrawIcon}
          reportName={langData?.["withdraw"]}
          reportFilters={[
            {
              element: (
                <>
                  <div className="withdraw-header-text">
                    {langData?.["payment_payment_withrawal_txt"]}:
                  </div>

                  <div className="withdraw-header-text">
                    {langData?.["cashable_amount"]} :{" "}
                    {Math.floor(cashableAmount)}
                  </div>
                </>
              ),
            },
          ]}
        />
      </div>
      {paymentMethodsInfo && (
        <Tabs
          value={paymentOption}
          onChange={(_, newValue) => {
            setPaymentOption(newValue);
            setProvidersList(paymentMethodsInfo[newValue]);
            setTabValue(0);
            setMobileNumber("");
          }}
        >
          {Object.keys(paymentMethodsInfo).map((paymentMethodName, index) => (
            <Tab
              value={paymentMethodName}
              label={
                paymentMethodName === "BANK_TRANSFER"
                  ? langData?.["bank"]
                  : paymentMethodName === "CRYPTO_WALLET_TRANSFER"
                  ? langData?.["crypto"]
                  : langData?.[paymentMethodName]
              }
              className="payment-btn"
            />
          ))}
        </Tabs>
      )}
      <div className="deposit-form-ctn">
        {providersList?.length > 1 && (
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => {
              setTabValue(newValue);
            }}
          >
            {providersList.map(
              (paymentGateway, index) =>
                AvailablePaymentGateways[paymentGateway] && (
                  <Tab
                    value={index}
                    label={`${langData?.["option"]} ${++indexCount}`}
                    className="payment-btn"
                  />
                )
            )}
          </Tabs>
        )}
        {providersList?.length > 0 &&
          providersList.map((paymentGateway, index) =>
            renderWithdrawForm(paymentGateway, index, tabValue)
          )}
      </div>

      <Dialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        className="payment-method-confirm"
      >
        <DialogTitle id="form-dialog-title" className="withdraw-title">
          {langData?.["delete_account"]}
        </DialogTitle>
        <div className="withdrawal-dialog-content">
          {langData?.["delete_account_confirm_txt"]}
        </div>
        <div className="dialog-footer">
          <Button
            color="primary"
            className="footer-action-btn"
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteId(null);
            }}
          >
            {langData?.["cancel"]}
          </Button>
          <Button
            color="primary"
            className="footer-action-btn withdraw-yes-btn"
            onClick={() => {
              deletePaymentMethod();
              setShowDeleteModal(false);
            }}
          >
            {langData?.["delete_confirm_txt"]}
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    balance: state.auth.balanceSummary.balance,
    bonusRedeemed: state.auth.balanceSummary.bonusRedeemed,
    nonCashableAmount: state.auth.balanceSummary.nonCashableAmount,
    cashableAmount: state.auth.balanceSummary.cashableAmount,
    exposure: state.auth.balanceSummary.exposure,
    langData: state.common.langData,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    fetchBalance: () => dispatch(fetchBalance()),
    setOpenWithdrawModal: (val) => dispatch(setOpenWithdrawModal(val)),
    setAlertMsg: (alert: AlertDTO) => dispatch(setAlertMsg(alert)),
    logout: () => dispatch(logout()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Withdrawal);
