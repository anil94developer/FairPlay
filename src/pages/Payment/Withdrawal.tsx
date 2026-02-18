import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import { FormControl, MenuItem, Select } from "@material-ui/core";
import React, { lazy, useEffect, useRef, useState } from "react";
import { connect, useDispatch } from "react-redux";
import FEATURE_API from "../../api-services/feature-api";
import USABET_API from "../../api-services/usabet-api";
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
import {
  fetchPaymentMethod,
  fetchWalletBankAccountTypesGet,
  fetchWalletBankAccounts,
  fetchWalletCryptoAccounts,
  fetchWalletUpiAccounts,
} from "./WithdrawalTabPanels/common";
import SVLS_API from "../../api-services/svls-api";
const AbcMoney = lazy(() => import("./WithdrawalTabPanels/AbcMoney"));
const Pgman = lazy(() => import("./WithdrawalTabPanels/Pgman"));
const XenonPay = lazy(() => import("./WithdrawalTabPanels/XenonPay"));
const ZenPay = lazy(() => import("./WithdrawalTabPanels/Zenpay"));
const ZenPayCrypto = lazy(() => import("./WithdrawalTabPanels/ZenpayCrypto"));
const ZenPayUpi = lazy(() => import("./WithdrawalTabPanels/ZenpayUpi"));

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
  const [bankType, setBankType] = useState<string>("SAVING");
  const [bankAccountType, setBankAccountType] = useState<string>("");
  const [cryptoAccountType, setCryptoAccountType] = useState<string>("");
  const [upiAccountType, setUpiAccountType] = useState<string>("");
  const [bankAccountTypes, setBankAccountTypes] = useState<
    Array<{ _id: string; name?: string; category?: string }>
  >([]);
  const [walletPaymentTypes, setWalletPaymentTypes] = useState<
    Array<{ _id: string; name?: string; category?: string }>
  >([]);
  const [bankFormErrors, setBankFormErrors] = useState<Record<string, string>>({});
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [walletLimits, setWalletLimits] = useState<{
    deposit_min_limit?: number;
    withdraw_min_limit?: number;
    deposit_max_limit?: number;
    withdraw_max_limit?: number;
  } | null>(null);

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
    setPerDayLimit(paymentMethods?.perDayLimit);
    setPerTxnLimit(paymentMethods?.perTxnLimit);
    setMinTxnAmount(paymentMethods?.minTxnAmount);
    setMinAmountLimitPerDay(paymentMethods?.minAmountLimitPerDay);
  };

  useEffect(() => {
    setPaymentGatewaysCount(0);
    getPaymentProviders();
    USABET_API.post("/user/getUserShoutPeWalletLimit")
      .then((res) => {
        if (res?.data?.status && res?.data?.data) {
          setWalletLimits(res.data.data);
          const d = res.data.data;
          if (d?.withdraw_min_limit != null) setMinTxnAmount(d.withdraw_min_limit);
          if (d?.withdraw_max_limit != null) setPerTxnLimit(d.withdraw_max_limit);
        }
      })
      .catch(() => {});
    fetchWalletBankAccountTypesGet().then((types) => {
      setWalletPaymentTypes(types);
      const bankTypes = types.filter((t) => t?.category === "BANK");
      const cryptoTypes = types.filter((t) => t?.category === "CRYPTO");
      const upiTypes = types.filter((t) => t?.category === "UPI");
      const dynamicMethods: Record<string, any> = {};
      if (bankTypes.length > 0) {
        dynamicMethods["BANK"] = ["ZENPAY", "ZENPAY1", "ZENPAY2"];
        dynamicMethods["ZENPAY"] = ["BANK"];
        dynamicMethods["ZENPAY1"] = ["BANK"];
        dynamicMethods["ZENPAY2"] = ["BANK"];
      }
      if (cryptoTypes.length > 0) {
        dynamicMethods["CRYPTO"] = ["ZENPAYCRYPTO"];
        dynamicMethods["ZENPAYCRYPTO"] = ["CRYPTO"];
      }
      if (upiTypes.length > 0) {
        dynamicMethods["UPI"] = ["ZENPAYUPI"];
        dynamicMethods["ZENPAYUPI"] = ["UPI"];
      }
      if (Object.keys(dynamicMethods).length > 0) {
        setPaymentMethodsInfo(dynamicMethods);
        const initialOption =
          bankTypes.length > 0 ? "BANK" : cryptoTypes.length > 0 ? "CRYPTO" : "UPI";
        setPaymentOption(initialOption);
        setProvidersList(dynamicMethods[initialOption] || []);
      } else {
        setPaymentMethodsInfo(paymentMethods?.withdrawMethods || {});
        setPaymentOption("BANK_TRANSFER");
      }
    }).catch(() => {
      setPaymentMethodsInfo(paymentMethods?.withdrawMethods || {});
      setPaymentOption("BANK_TRANSFER");
    });
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
      setEditingAccountId(null);
      if (paymentOption === "BANK" || paymentOption === "BANK_TRANSFER") {
        const bankTypeItem = walletPaymentTypes.find((t) => t?.category === "BANK");
        const bankTypeId = bankTypeItem?._id || bankAccountType;
        if (bankTypeItem) setBankAccountType(bankTypeItem._id);
        fetchWalletBankAccounts(setAccountDetails, bankTypeId);
      } else if (
        paymentOption === "CRYPTO" ||
        paymentOption === "ZENPAYCRYPTO" ||
        paymentOption === "CRYPTO_WALLET_TRANSFER"
      ) {
        const cryptoTypeItem = walletPaymentTypes.find(
          (t) => t?.category === "CRYPTO"
        );
        const cryptoTypeId = cryptoTypeItem?._id || cryptoAccountType;
        if (cryptoTypeItem) setCryptoAccountType(cryptoTypeItem._id);
        fetchWalletCryptoAccounts(setAccountDetails, cryptoTypeId);
      } else if (paymentOption === "UPI" || paymentOption === "ZENPAYUPI") {
        const upiTypeItem = walletPaymentTypes.find((t) => t?.category === "UPI");
        const upiTypeId = upiTypeItem?._id || upiAccountType;
        if (upiTypeItem) setUpiAccountType(upiTypeItem._id);
        fetchWalletUpiAccounts(setAccountDetails, upiTypeId);
      } else {
        fetchPaymentMethod(paymentOption, setAccountDetails);
      }
    }
  }, [paymentOption, walletPaymentTypes]);

  useEffect(() => {
    if (addAccount) {
      setSelectedAccountId("");
      setBankFormErrors({});
      if (paymentOption === "BANK" || paymentOption === "BANK_TRANSFER") {
        const bankTypes = walletPaymentTypes.filter((t) => t?.category === "BANK");
        setBankAccountTypes(bankTypes);
        if (bankTypes.length > 0 && !bankAccountType) {
          setBankAccountType(bankTypes[0]._id);
        }
      }
    }
  }, [addAccount, paymentOption, walletPaymentTypes]);


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

  const validateBankAccountForm = (): boolean => {
    const errors: Record<string, string> = {};
    const holder = holderName?.trim();
    const accNum = accountNumber?.trim();
    const ifsc = ifscCode?.trim();
    const bank = bankName?.trim();

    if (!holder) {
      errors.holderName =
        langData?.["account_holder_name"] || "Account holder name is required";
    } else if (holder.length < 2) {
      errors.holderName = "Name must be at least 2 characters";
    }

    if (!accNum) {
      errors.accountNumber =
        langData?.["enter_account_no"] || "Account number is required";
    } else if (!/^\d{9,18}$/.test(accNum)) {
      errors.accountNumber = "Account number must be 9–18 digits";
    }

    if (!bank) {
      errors.bankName =
        langData?.["bank_name"] || "Bank name is required";
    }

    if (!ifsc) {
      errors.ifscCode =
        langData?.["ifsc_code"] || "IFSC code is required";
    } else if (!/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/.test(ifsc.toUpperCase())) {
      errors.ifscCode = "Invalid IFSC (e.g. SBIN0001234)";
    }

    if (!bankAccountType && bankAccountTypes.length > 0) {
      errors.bankAccountType =
        langData?.["select_bank_type"] ||
        "Please select a bank account type";
    }

    setBankFormErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    if (!isValid) {
      setAlertMsg({
        type: "error",
        message: Object.values(errors)[0],
      });
    }
    return isValid;
  };

  const getApiErrorMessage = (msg: string): string => {
    if (!msg) return langData?.["general_err_txt"] || "Something went wrong";
    if (
      msg.toLowerCase().includes("wl bank account") ||
      msg.toLowerCase().includes("own bank account")
    ) {
      return (
        langData?.["wl_bank_account_err"] ||
        "Please select a bank account type from your allowed options."
      );
    }
    if (
      msg.toLowerCase().includes("valid objectid") ||
      msg.toLowerCase().includes("valid object id")
    ) {
      return (
        langData?.["invalid_bank_type_err"] ||
        "Please select a valid bank account type."
      );
    }
    return msg;
  };

  const submitWalletBankAccount = async (e) => {
    e.preventDefault();
    setBankFormErrors({});
    if (!validateBankAccountForm()) return;
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("bank_account_type", bankAccountType);
      formData.append("bank_account_type_category", "BANK");
      formData.append("holder_name", normalizeInput(holderName.trim()));
      formData.append("bank_name", normalizeInput(bankName?.trim() || ""));
      formData.append("account_number", normalizeInput(accountNumber.trim()));
      formData.append(
        "ifsc_code",
        normalizeInput(ifscCode?.trim() || "").toUpperCase()
      );
      formData.append("bank_type", bankType);

      const response = await USABET_API.post(
        `/wallet/bankAccountCreate`,
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      const data = response?.data;
      if (data?.status) {
        successToast(
          data?.msg || langData?.["details_saved_success_txt"] || "Created Successfully"
        );
        setAddAccount(false);
        setHolderName("");
        setAccountNumber("");
        setBankName("");
        setBranchName("");
        setIfscCode("");
        setBankType("SAVING");
        setBankFormErrors({});
        fetchWalletBankAccounts(setAccountDetails, bankAccountType);
      } else {
        const errMsg = getApiErrorMessage(data?.msg || data?.message || "");
        setAlertMsg({ type: "error", message: errMsg });
      }
      setLoading(false);
    } catch (error: any) {
      const errData = error?.response?.data;
      const errMsg = getApiErrorMessage(
        errData?.msg || errData?.message || error?.message || ""
      );
      setAlertMsg({ type: "error", message: errMsg });
      setLoading(false);
    }
  };

  const submitWalletCryptoAccount = async (e) => {
    e.preventDefault();
    if (!selectedCrypto?.crypto_currency) {
      setAlertMsg({
        type: "error",
        message: langData?.["select_currency"] || "Please select a currency",
      });
      return;
    }
    if (!accountNumber?.trim()) {
      setAlertMsg({
        type: "error",
        message: langData?.["enter_wallet_address"] || "Please enter wallet address",
      });
      return;
    }
    if (!holderName?.trim()) {
      setAlertMsg({
        type: "error",
        message: langData?.["holder_name"] || "Please enter holder name",
      });
      return;
    }
    if (!cryptoAccountType) {
      setAlertMsg({
        type: "error",
        message: "Crypto account type not loaded. Please try again.",
      });
      return;
    }
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("bank_account_type", cryptoAccountType);
      formData.append("bank_account_type_category", "CRYPTO");
      formData.append("holder_name", normalizeInput(holderName.trim()));
      formData.append("crypto_coin_type", selectedCrypto.crypto_currency);
      formData.append("crypto_wallet", normalizeInput(accountNumber.trim()));
      if (selectedCrypto.blockchain) {
     //   formData.append("blockchain", selectedCrypto.blockchain);
      }
      if (selectedCrypto.network_id) {
        formData.append("network_id", selectedCrypto.network_id);
      }

      const response = await USABET_API.post(
        `/wallet/bankAccountCreate`,
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      const data = response?.data;
      if (data?.status) {
        successToast(
          data?.msg || langData?.["details_saved_success_txt"] || "Wallet added successfully"
        );
        setAddAccount(false);
        setAccountNumber("");
        setHolderName("");
        setSelectedCrypto({});
        fetchWalletCryptoAccounts(setAccountDetails, cryptoAccountType);
      } else {
        const errMsg = getApiErrorMessage(data?.msg || data?.message || "");
        setAlertMsg({ type: "error", message: errMsg });
      }
      setLoading(false);
    } catch (error: any) {
      const errData = error?.response?.data;
      const errMsg = getApiErrorMessage(
        errData?.msg || errData?.message || error?.message || ""
      );
      setAlertMsg({ type: "error", message: errMsg });
      setLoading(false);
    }
  };

  const updateWalletCryptoAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccountId) return;
    if (!selectedCrypto?.crypto_currency) {
      setAlertMsg({
        type: "error",
        message: langData?.["select_currency"] || "Please select a currency",
      });
      return;
    }
    if (!accountNumber?.trim()) {
      setAlertMsg({
        type: "error",
        message: langData?.["enter_wallet_address"] || "Please enter wallet address",
      });
      return;
    }
    if (!holderName?.trim()) {
      setAlertMsg({
        type: "error",
        message: langData?.["holder_name"] || "Please enter holder name",
      });
      return;
    }
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("id", editingAccountId);
      formData.append("holder_name", normalizeInput(holderName.trim()));
      formData.append("crypto_coin_type", selectedCrypto.crypto_currency);
      formData.append("crypto_wallet", normalizeInput(accountNumber.trim()));

      const response = await USABET_API.post(
        `/wallet/bankAccountUpdate`,
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      const data = response?.data;
      if (data?.status) {
        successToast(
          data?.msg || langData?.["details_saved_success_txt"] || "Updated Successfully"
        );
        cancelEdit();
        fetchWalletCryptoAccounts(setAccountDetails, cryptoAccountType);
      } else {
        setAlertMsg({
          type: "error",
          message: getApiErrorMessage(data?.msg || data?.message || ""),
        });
      }
      setLoading(false);
    } catch (error: any) {
      const errData = error?.response?.data;
      setAlertMsg({
        type: "error",
        message: getApiErrorMessage(
          errData?.msg || errData?.message || error?.message || ""
        ),
      });
      setLoading(false);
    }
  };

  const submitWalletUpiAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holderName?.trim()) {
      setAlertMsg({
        type: "error",
        message: langData?.["account_name"] || "Please enter account name",
      });
      return;
    }
    if (!accountNumber?.trim()) {
      setAlertMsg({
        type: "error",
        message: langData?.["upi_id"] || "Please enter UPI ID",
      });
      return;
    }
    if (!phoneNumber?.trim()) {
      setAlertMsg({
        type: "error",
        message: langData?.["mobile_no"] || "Please enter mobile number",
      });
      return;
    }
    if (!upiAccountType) {
      setAlertMsg({
        type: "error",
        message: "UPI account type not loaded. Please try again.",
      });
      return;
    }
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("bank_account_type", upiAccountType);
      formData.append("bank_account_type_category", "UPI");
      formData.append("holder_name", normalizeInput(holderName.trim()));
      formData.append("upi_id", normalizeInput(accountNumber.trim()));
      formData.append("upi_phone_number", normalizeInput(phoneNumber.trim()));

      const response = await USABET_API.post(
        `/wallet/bankAccountCreate`,
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      const data = response?.data;
      if (data?.status) {
        successToast(
          data?.msg || langData?.["details_saved_success_txt"] || "UPI added successfully"
        );
        setAddAccount(false);
        setHolderName("");
        setAccountNumber("");
        setPhoneNumber("");
        fetchWalletUpiAccounts(setAccountDetails, upiAccountType);
      } else {
        setAlertMsg({
          type: "error",
          message: getApiErrorMessage(data?.msg || data?.message || ""),
        });
      }
      setLoading(false);
    } catch (error: any) {
      const errData = error?.response?.data;
      setAlertMsg({
        type: "error",
        message: getApiErrorMessage(
          errData?.msg || errData?.message || error?.message || ""
        ),
      });
      setLoading(false);
    }
  };

  const updateWalletUpiAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccountId) return;
    if (!holderName?.trim()) {
      setAlertMsg({
        type: "error",
        message: langData?.["account_name"] || "Please enter account name",
      });
      return;
    }
    if (!accountNumber?.trim()) {
      setAlertMsg({
        type: "error",
        message: langData?.["upi_id"] || "Please enter UPI ID",
      });
      return;
    }
    if (!phoneNumber?.trim()) {
      setAlertMsg({
        type: "error",
        message: langData?.["mobile_no"] || "Please enter mobile number",
      });
      return;
    }
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("id", editingAccountId);
      formData.append("holder_name", normalizeInput(holderName.trim()));
      formData.append("upi_id", normalizeInput(accountNumber.trim()));
      formData.append("upi_phone_number", normalizeInput(phoneNumber.trim()));

      const response = await USABET_API.post(
        `/wallet/bankAccountUpdate`,
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      const data = response?.data;
      if (data?.status) {
        successToast(
          data?.msg || langData?.["details_saved_success_txt"] || "Updated Successfully"
        );
        cancelEdit();
        fetchWalletUpiAccounts(setAccountDetails, upiAccountType);
      } else {
        setAlertMsg({
          type: "error",
          message: getApiErrorMessage(data?.msg || data?.message || ""),
        });
      }
      setLoading(false);
    } catch (error: any) {
      const errData = error?.response?.data;
      setAlertMsg({
        type: "error",
        message: getApiErrorMessage(
          errData?.msg || errData?.message || error?.message || ""
        ),
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
    const isWalletBank =
      (paymentOption === "BANK" || paymentOption === "BANK_TRANSFER") &&
      paymentMethodsInfo?.BANK;
    const isWalletCrypto =
      (paymentOption === "CRYPTO" ||
        paymentOption === "ZENPAYCRYPTO" ||
        paymentOption === "CRYPTO_WALLET_TRANSFER") &&
      paymentMethodsInfo?.CRYPTO;
    const isWalletUpi =
      (paymentOption === "UPI" || paymentOption === "ZENPAYUPI") &&
      paymentMethodsInfo?.UPI;
    if ((isWalletBank || isWalletCrypto || isWalletUpi) && deleteId) {
      try {
        const response = await USABET_API.post(`/wallet/bankAccountDelete`, {
          id: String(deleteId),
        });
        if (response?.data?.status || response?.status === 200) {
          if (isWalletBank) {
            fetchWalletBankAccounts(setAccountDetails, bankAccountType);
          } else if (isWalletCrypto) {
            fetchWalletCryptoAccounts(setAccountDetails, cryptoAccountType);
          } else {
            fetchWalletUpiAccounts(setAccountDetails, upiAccountType);
          }
          successToast(
            response?.data?.msg ||
              langData?.["beneficiary_account_deleted_success_txt"] ||
              "Bank account successfully deleted."
          );
        } else {
          errorToast(response?.data?.msg || langData?.["general_err_txt"]);
        }
      } catch (err: any) {
        errorToast(
          err?.response?.data?.msg ||
            err?.response?.data?.message ||
            langData?.["general_err_txt"]
        );
      }
    } else {
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
      } catch (err) {
        errorToast(err.response?.data?.message);
      }
    }
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const setAccountForEdit = (acc: any) => {
    setHolderName(acc?.paymentMethodDetails?.accountHolderName || "");
    setAccountNumber(acc?.paymentMethodDetails?.accountNumber || "");
    setBankName(acc?.paymentMethodDetails?.bankName || "");
    setIfscCode(acc?.paymentMethodDetails?.ifscCode || "");
    setBankType(acc?.paymentMethodDetails?.bankType || "SAVING");
    setEditingAccountId(acc?.id?.toString() || null);
    setAddAccount(true);
  };

  const cancelEdit = () => {
    setEditingAccountId(null);
    setAddAccount(false);
    setHolderName("");
    setAccountNumber("");
    setBankName("");
    setBranchName("");
    setIfscCode("");
    setPhoneNumber("");
    setSelectedCrypto({});
    setBankFormErrors({});
  };

  const setAccountForEditUpi = (acc: any) => {
    setHolderName(acc?.paymentMethodDetails?.accountHolderName || "");
    setAccountNumber(acc?.paymentMethodDetails?.upiId || acc?.paymentMethodDetails?.accountNumber || "");
    setPhoneNumber(acc?.paymentMethodDetails?.upiPhoneNumber || "");
    setEditingAccountId(acc?.id?.toString() || null);
    setAddAccount(true);
  };

  const setAccountForEditCrypto = (acc: any) => {
    setHolderName(acc?.paymentMethodDetails?.accountHolderName || "");
    setAccountNumber(acc?.paymentMethodDetails?.walletAddress || acc?.paymentMethodDetails?.accountNumber || "");
    setSelectedCrypto({
      crypto_currency: acc?.paymentMethodDetails?.cryptoCurrency,
      blockchain: acc?.paymentMethodDetails?.blockchain,
    });
    setEditingAccountId(acc?.id?.toString() || null);
    setAddAccount(true);
  };

  const updateWalletBankAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccountId) return;
    setBankFormErrors({});
    if (!validateBankAccountForm()) return;
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append("id", editingAccountId);
      formData.append("holder_name", normalizeInput(holderName.trim()));
      formData.append("bank_name", normalizeInput(bankName?.trim() || ""));
      formData.append("account_number", normalizeInput(accountNumber.trim()));
      formData.append(
        "ifsc_code",
        normalizeInput(ifscCode?.trim() || "").toUpperCase()
      );
      formData.append("bank_type", bankType);

      const response = await USABET_API.post(
        `/wallet/bankAccountUpdate`,
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      const data = response?.data;
      if (data?.status) {
        successToast(
          data?.msg || langData?.["details_saved_success_txt"] || "Updated Successfully"
        );
        cancelEdit();
        fetchWalletBankAccounts(setAccountDetails, bankAccountType);
      } else {
        setAlertMsg({
          type: "error",
          message: getApiErrorMessage(data?.msg || data?.message || ""),
        });
      }
      setLoading(false);
    } catch (error: any) {
      const errData = error?.response?.data;
      setAlertMsg({
        type: "error",
        message: getApiErrorMessage(
          errData?.msg || errData?.message || error?.message || ""
        ),
      });
      setLoading(false);
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
            submitWalletBankAccount={submitWalletBankAccount}
            updateWalletBankAccount={updateWalletBankAccount}
            editingAccountId={editingAccountId}
            setAccountForEdit={setAccountForEdit}
            cancelEdit={cancelEdit}
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
            bankType={bankType}
            setBankType={setBankType}
            bankAccountType={bankAccountType}
            setBankAccountType={setBankAccountType}
            bankAccountTypes={bankAccountTypes}
            bankFormErrors={bankFormErrors}
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
            submitWalletBankAccount={submitWalletBankAccount}
            updateWalletBankAccount={updateWalletBankAccount}
            editingAccountId={editingAccountId}
            setAccountForEdit={setAccountForEdit}
            cancelEdit={cancelEdit}
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
            bankType={bankType}
            setBankType={setBankType}
            bankAccountType={bankAccountType}
            setBankAccountType={setBankAccountType}
            bankAccountTypes={bankAccountTypes}
            bankFormErrors={bankFormErrors}
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
            submitWalletBankAccount={submitWalletBankAccount}
            updateWalletBankAccount={updateWalletBankAccount}
            editingAccountId={editingAccountId}
            setAccountForEdit={setAccountForEdit}
            cancelEdit={cancelEdit}
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
            bankType={bankType}
            setBankType={setBankType}
            bankAccountType={bankAccountType}
            setBankAccountType={setBankAccountType}
            bankAccountTypes={bankAccountTypes}
            bankFormErrors={bankFormErrors}
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

      case AvailablePaymentGateways.ZENPAYUPI:
        return (
          <ZenPayUpi
            tabValue={tabValue}
            index={index}
            paymentOption={paymentOption}
            accountDetails={accountDetails}
            selectedAccountId={selectedAccountId}
            setSelectedAccountId={setSelectedAccountId}
            setShowDeleteModal={setShowDeleteModal}
            setDeleteId={setDeleteId}
            addAccount={addAccount}
            setAddAccount={setAddAccount}
            submitWalletUpiAccount={submitWalletUpiAccount}
            updateWalletUpiAccount={updateWalletUpiAccount}
            setAccountForEditUpi={setAccountForEditUpi}
            editingAccountId={editingAccountId}
            cancelEdit={cancelEdit}
            loading={loading}
            holderName={holderName}
            setHolderName={setHolderName}
            accountNumber={accountNumber}
            setAccountNumber={setAccountNumber}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            withdrawAmount={withdrawAmount}
            setWithdrawAmount={setWithdrawAmount}
            langData={langData}
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
            submitWalletCryptoAccount={submitWalletCryptoAccount}
            updateWalletCryptoAccount={updateWalletCryptoAccount}
            setAccountForEditCrypto={setAccountForEditCrypto}
            editingAccountId={editingAccountId}
            cancelEdit={cancelEdit}
            loading={loading}
            holderName={holderName}
            setHolderName={setHolderName}
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
            submitWalletCryptoAccount={submitWalletCryptoAccount}
            updateWalletCryptoAccount={updateWalletCryptoAccount}
            setAccountForEditCrypto={setAccountForEditCrypto}
            editingAccountId={editingAccountId}
            cancelEdit={cancelEdit}
            loading={loading}
            holderName={holderName}
            setHolderName={setHolderName}
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

                  {walletLimits && (
                    <div className="wallet-limits-ctn">
                      <div className="withdraw-header-text">
                        {langData?.["withdraw_min_limit"] || "Min Withdraw"} : ₹
                        {walletLimits.withdraw_min_limit ?? "-"}
                      </div>
                      <div className="withdraw-header-text">
                        {langData?.["withdraw_max_limit"] || "Max Withdraw"} : ₹
                        {walletLimits.withdraw_max_limit ?? "-"}
                      </div>
                      <div className="withdraw-header-text">
                        {langData?.["deposit_min_limit"] || "Min Deposit"} : ₹
                        {walletLimits.deposit_min_limit ?? "-"}
                      </div>
                      <div className="withdraw-header-text">
                        {langData?.["deposit_max_limit"] || "Max Deposit"} : ₹
                        {walletLimits.deposit_max_limit ?? "-"}
                      </div>
                    </div>
                  )}
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
            setProvidersList(paymentMethodsInfo[newValue] || []);
            setTabValue(0);
            setMobileNumber("");
          }}
        >
          {Object.keys(paymentMethodsInfo)
            .filter((k) =>
              !["ZENPAY", "ZENPAY1", "ZENPAY2", "ZENPAYCRYPTO", "ZENPAYUPI"].includes(k)
            )
            .map((paymentMethodName) => (
              <Tab
                key={paymentMethodName}
                value={paymentMethodName}
                label={
                  paymentMethodName === "BANK_TRANSFER" || paymentMethodName === "BANK"
                    ? langData?.["bank"]
                    : paymentMethodName === "CRYPTO_WALLET_TRANSFER" ||
                      paymentMethodName === "CRYPTO"
                    ? langData?.["crypto"]
                    : paymentMethodName === "UPI"
                    ? langData?.["upi"] || "UPI"
                    : langData?.[paymentMethodName] || paymentMethodName
                }
                className="payment-btn"
              />
            ))}
        </Tabs>
      )}
      <div className="deposit-form-ctn withdraw-options-ctn">
        {/* {providersList?.length > 1 && (
          <FormControl className="withdraw-option-dropdown" variant="outlined">
            <label className="withdraw-dropdown-label">
              {langData?.["choose_payment_option"] || "Choose Payment Option"}
            </label>
            <Select
              value={tabValue}
              onChange={(e) => setTabValue(Number(e.target.value))}
              displayEmpty
              renderValue={(v) =>
                `${langData?.["option"] || "Option"} ${(v ?? 0) + 1}`
              }
            >
              {providersList.map((paymentGateway: string, index: number) =>
                AvailablePaymentGateways[paymentGateway] ? (
                  <MenuItem key={paymentGateway} value={index}>
                    {langData?.["option"] || "Option"} {index + 1}
                  </MenuItem>
                ) : null
              )}
            </Select>
          </FormControl>
        )} */}
        {providersList?.length > 0 &&
          providersList.map((paymentGateway: string, index: number) =>
            AvailablePaymentGateways[paymentGateway] && index === tabValue ? (
              <div key={`withdraw-${paymentGateway}-${index}`}>
                {renderWithdrawForm(
                  AvailablePaymentGateways[paymentGateway],
                  index,
                  tabValue
                )}
              </div>
            ) : null
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
