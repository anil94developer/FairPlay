import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import React, { lazy, useCallback, useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import AGPAY_API from "../../api-services/feature-api";
import { RootState } from "../../models/RootState";
import "./Deposit.scss";
import "./Payment.scss";

import bank from "../../assets/images/common/icons/bank.svg";
import { ReactComponent as depositIcon } from "../../assets/images/common/icons/depositAdd.svg?react";
import gpay from "../../assets/images/common/icons/gpay.svg";
import paytm from "../../assets/images/common/icons/paytm.svg";
import phonePe from "../../assets/images/common/icons/phonepe.svg";
import ReportBackBtn from "../../common/ReportBackBtn/ReportBackBtn";
import ReportsHeader from "../../common/ReportsHeader/ReportsHeader";
import { AlertDTO } from "../../models/Alert";
import { setOpenDepositModal } from "../../store";
import { setAlertMsg } from "../../store/common/commonActions";
import {
  AvailablePaymentGateways,
  demoUser,
  NEFT_REGEX,
  normalizeInput,
  RTGS_REGEX,
  UPI_REGEX,
} from "../../util/stringUtil";
import { AccountDetails } from "./AccountDetails";
import { PaymentOptions, StoreProps } from "./Deposit.types";
import { ButtonVariable } from "../../models/ButtonVariables";
import SVLS_API from "../../svls-api";
import Xenonpayz from "./DepositTabPanels/Xenonpayz";
import { depositInitiated } from "../../util/facebookPixelEvent";
import { BRAND_DOMAIN } from "../../constants/Branding";
const AbcMoney = lazy(() => import("./DepositTabPanels/AbcMoney"));
const Pgman = lazy(() => import("./DepositTabPanels/Pgman"));
const XenonPay = lazy(() => import("./DepositTabPanels/XenonPay"));
const ZenPay = lazy(() => import("./DepositTabPanels/Zenpay"));
const ZenpayCrypto = lazy(() => import("./DepositTabPanels/ZenpayCrypto"));
const ZenpayCheckout = lazy(() => import("./DepositTabPanels/ZenpayCheckout"));
const ZenpayCryptoSeamless = lazy(
  () => import("./DepositTabPanels/ZenpayCryptoSeamless")
);

export type BonusDto = {
  id: number;
  name: string;
  description: string;
  bonusCategory: string;
};

const Deposit: React.FC<StoreProps> = (props) => {
  const {
    setOpenDepositModal,
    setAlertMsg,
    whatsappDetails,
    domainConfig,
    loggedIn,
    langData,
  } = props;
  const [tabValue, setTabValue] = useState<number>(0);
  const [paymentOption, setPaymentOption] = useState<string>("BANK_TRANSFER");
  const [accountDetails, setAccountDetails] = useState<AccountDetails[]>();
  const [selectedAccountId, setSelectedAccountId] = useState<string>();
  const [depositAmount, setDepositAmount] = useState<string>();
  const [depositNotes, setDepositNotes] = useState<string>();
  const [referenceId, setReferenceId] = useState<string>();
  const [depositImage, setDepositImage] = useState<string | ArrayBuffer>();
  const [loading, setLoading] = useState<boolean>(false);
  const [onlinePaymentOption, setOnlinePaymentOption] =
    useState<string>("BANK_TRANSFER");
  const [mobileNumber, setMobileNumber] = useState<string>();
  const [paymentDetails, setPaymentDetails] = useState<PaymentOptions[]>();
  const [providerRefId, setProviderRefId] = useState<string>();
  const [providersList, setProvidersList] = useState([]);
  const [depositPaymentMethodsInfo, setDepositPaymentMethodsInfo] =
    useState<any>([]);
  const [newUser, setNewUser] = useState<number>(0);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [paymentOptionFilter, setPaymentOptionFilter] =
    useState<string>("IMPS");
  const [ocrDepositAmount, setOcrDepositAmount] = useState<string>();
  const [ocrReferenceId, setOcrReferenceId] = useState<string>();
  const [paymentGatewaysCount, setPaymentGatewaysCount] = useState<number>(0);
  const hiddenFileInput = useRef(null);
  const [uploadImage, setUploadImage] = useState(null);
  let indexCount = 0;

  const successToast = (mess: string) => {
    setAlertMsg({
      type: "success",
      message: mess,
    });
  };

  const [showWhatsapp, setShowWhatsapp] = useState<boolean>(true);
  const [selectedBonus, setSelectedBonus] = useState<string>();
  const [bonusTypes, setBonusTypes] = useState<BonusDto[]>();

  const getAdminWhatsAppNumber = () => {
    window.open(whatsappDetails, "_blank");
  };

  const errorToast = (mess: string) => {
    setAlertMsg({
      type: "error",
      message: mess ?? "",
    });
  };

  const getImageDetails = async () => {
    setLoading(true);
    setDepositAmount("");
    setOcrDepositAmount("");
    setReferenceId("");
    setOcrReferenceId("");
    try {
      const payload = {
        payment_option:
          paymentOption === "NEFT"
            ? paymentOptionFilter
            : paymentOption === "UPI"
            ? "UPI"
            : "PAYTM_WALLET",
        image: depositImage,
      };

      const response = await AGPAY_API.post(
        `/agpay/v2/ocr/get-details`,
        payload,
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
          timeout: 20000,
        }
      );

      if (response.status === 200 && response?.data) {
        const data = response.data;
        const amount = data.amount.trim();
        const utr = data.utr.trim();

        setDepositAmount(amount);
        setOcrDepositAmount(amount);
        setReferenceId(utr);
        setOcrReferenceId(utr);

        if (amount === "" || utr === "") {
          errorToast(langData?.["enter_details_manually_txt"]);
        } else {
          successToast(langData?.["details_entered_success_txt"]);
        }
      } else {
        errorToast(langData?.["general_err_txt"]);
      }

      setLoading(false);
    } catch (error) {
      errorToast(error?.response?.data?.message);
      setLoading(false);
    }
  };

  const getUtr = async () => {
    setLoading(true);
    setReferenceId("");
    setOcrReferenceId("");
    try {
      const payload = {
        payment_option:
          paymentOption === "NEFT"
            ? paymentOptionFilter
            : paymentOption === "UPI"
            ? "UPI"
            : "PAYTM_WALLET",
        image: depositImage,
      };

      const response = await AGPAY_API.post(`/agpay/v2/ocr/get-utr`, payload, {
        headers: {
          Authorization: sessionStorage.getItem("jwt_token"),
        },
        timeout: 20000,
      });

      if (response.status === 200 && response?.data) {
        var utr = response.data;
        setReferenceId(utr);
        setOcrReferenceId(utr);
        if (utr === "") {
          errorToast(langData?.["enter_details_manually_txt"]);
        } else {
          successToast(langData?.["utr_entered_success_txt"]);
        }
      } else {
        errorToast(langData?.["general_err_txt"]);
      }

      setLoading(false);
    } catch (error) {
      errorToast(error?.response?.data?.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      depositImage !== undefined &&
      depositImage !== null &&
      depositImage !== ""
    ) {
      if (tabValue === 1) {
        // getImageDetails();
      } else if (tabValue === 0) {
        // getUtr();
      }
    }
  }, [depositImage]);

  const getPaymentProviders = async () => {
    setLoading(true);
    try {
      // Replaced API call with dummy data
      const dummyDepositMethods = {
        UPI: [
          {
            id: "upi_1",
            name: "UPI Payment",
            enabled: true,
            minAmount: 100,
            maxAmount: 50000,
          },
        ],
        BANK_TRANSFER: [
          {
            id: "bank_1",
            name: "Bank Transfer",
            enabled: true,
            minAmount: 500,
            maxAmount: 100000,
          },
        ],
        ZENPAY: [
          {
            id: "zenpay_1",
            name: "ZenPay",
            enabled: true,
            minAmount: 100,
            maxAmount: 50000,
          },
        ],
        PGMAN: [
          {
            id: "pgman_1",
            name: "PGMan",
            enabled: true,
            minAmount: 100,
            maxAmount: 50000,
          },
        ],
        XENONPAY: [
          {
            id: "xenonpay_1",
            name: "XenonPay",
            enabled: true,
            minAmount: 100,
            maxAmount: 50000,
          },
        ],
      };
      setDepositPaymentMethodsInfo(dummyDepositMethods);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const isNewUser = async () => {
    setLoading(true);
    try {
      // Replaced API call with dummy data
      // Set to 0 for existing user, 1 for new user
      const dummyIsNewUser = 0;
      setNewUser(dummyIsNewUser);
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    // setPaymentGatewaysCount(0);
    // getPaymentProviders();
    if (paymentOption === "NEFT") {
      // fetchPaymentMethod();
    }
    setDepositNotes("");
    setDepositAmount("");
    // setAccountDetails([]);
    // setPaymentOption('NEFT');
    setSelectedAccountId("");
    // setOnlinePaymentOption('UPI');
    setPaymentOptionFilter("IMPS");
    // setBonusTypes([]);
  }, [tabValue]);

  const submitPayment = async (e) => {
    e.preventDefault();
    if (!depositImage) {
      errorToast(langData?.["upload_txn_img_txt"]);
      return false;
    }
    setLoading(true);
    try {
      const payload = {
        amount: Number(depositAmount),
        image: depositImage,
        notes: depositNotes,
        payment_method_id: selectedAccountId,
        reference_id: referenceId,
        payment_option:
          paymentOption === "NEFT"
            ? paymentOptionFilter
            : paymentOption === "UPI"
            ? "UPI"
            : "PAYTM_WALLET",
        amount_modified: ocrDepositAmount !== depositAmount,
        reference_id_modified: ocrReferenceId !== referenceId,
      };
      const response = await AGPAY_API.post(
        `/agpay/v2/pgman/transactions/:deposit`,
        payload,
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
        }
      );
      if (response.status === 204) {
        successToast(langData?.["txn_saved_success_txt"]);
        depositInitiated();
        window.location.href = "/my_transactions";
        setOpenDepositModal(false);
      } else {
        errorToast(response?.data?.message);
      }
      setLoading(false);
    } catch (error) {
      errorToast(error?.response?.data?.message);
      setLoading(false);
    }
  };

  const handleCapture = ({ target }) => {
    const file = target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      errorToast("File upload error: The file size must be less than 5MB");
      target.value = "";
      setUploadImage(null);
      setDepositImage(null);
      return;
    }
    setUploadImage(file);
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = (e) => {
      setDepositImage(e.target.result);
    };
  };

  const handleClick = () => {
    console.log("input", hiddenFileInput);
    hiddenFileInput.current.click();
  };

  const getBonusTypes = async (
    amount: number,
    paymentMethod: string = onlinePaymentOption
  ) => {
    try {
      const response = await SVLS_API.get(
        `/marketing/v1/bonus-policies/eligible`,
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
          params: {
            account_id: sessionStorage.getItem("aid"),
            amount: amount,
            payment_method:
              paymentMethod == "UPI" ? "UPI_TRANSFER" : paymentMethod,
          },
        }
      );
      if (response.status == 200) {
        const noBonus: BonusDto = {
          id: null,
          name: "-",
          description: "",
          bonusCategory: "",
        };
        setBonusTypes([noBonus, ...response.data]);
        if (response.data && response.data?.length > 0) {
          setSelectedBonus(response.data[0]?.id);
        }
      }
    } catch (error) {
      const noBonus: BonusDto = {
        id: null,
        name: "-",
        description: "",
        bonusCategory: "",
      };
      setBonusTypes([noBonus]);
      // errorToast("Failed to fetch bonuses");
    }
  };

  const submitOnlineAmount = async (e, type = "abcmoney") => {
    e.preventDefault();
    if (
      type != "zenpay" &&
      type != "zenpay1" &&
      type != "zenpay2" &&
      type != "xeinpay" &&
      type != "xenonpayz" &&
      mobileNumber?.length != 10
    ) {
      errorToast(langData?.["invalid_mobile_no_txt"]);
      return false;
    }
    setLoading(true);

    try {
      const payload = {
        amount: Number(depositAmount),
        currency_type: "INR",
        mobile_number: mobileNumber ? mobileNumber : "9876543211",
        notes: depositNotes,
        payment_method:
          onlinePaymentOption === "UPI" ? "UPI_TRANSFER" : onlinePaymentOption,
        upi_intent: onlinePaymentOption === "UPI",
        upi_qr: onlinePaymentOption === "UPI",
        return_url: window.location.origin + "/my_transactions",
        bonus_policy_id: selectedBonus,
      };
      getBonusTypes(Number(depositAmount));
      const response = await AGPAY_API.post(
        `/agpay/v2/${type}/transactions/:deposit`,
        payload,
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
        }
      );
      if (response.status === 200) {
        if (response.data.payment_options?.length > 0) {
          setPaymentDetails(response.data.payment_options);
          setProviderRefId(response.data.provider_ref_id);
          let upiPaymentOption = response.data.payment_options[0];
          if (upiPaymentOption?.sessionUrl) {
            window.location.href = upiPaymentOption?.sessionUrl;
            return;
          } else if (upiPaymentOption?.paymentLink) {
            window.location.href = upiPaymentOption?.paymentLink;
            return;
          } else if (
            upiPaymentOption?.payment_method_details &&
            upiPaymentOption?.payment_method_details?.paymentLink
          ) {
            window.location.href =
              upiPaymentOption?.payment_method_details?.paymentLink;
            return;
          }
        }
        successToast(langData?.["txn_saved_success_txt"]);
      }
      setLoading(false);
    } catch (error) {
      errorToast(error?.response?.data?.message);
      setLoading(false);
    }
  };

  const submitXenonPay = async (e) => {
    e.preventDefault();
    if (mobileNumber?.length != 10) {
      errorToast(langData?.["invalid_mobile_no_txt"]);
      return false;
    }
    setLoading(true);

    try {
      const payload = {
        amount: Number(depositAmount),
        mobile_number: mobileNumber,
        notes: depositNotes,
        return_url: `https://${window.location.hostname}`,
      };
      const response = await AGPAY_API.post(
        `/agpay/v2/xenon-pay/transactions/:deposit`,
        payload,
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
        }
      );
      successToast(langData?.["txn_saved_success_txt"]);
      window.open(response.data.paymentLink, "_self");
      setLoading(false);
    } catch (error) {
      errorToast(error?.response?.data?.message);
      setLoading(false);
    }
  };

  const utrRequired = paymentDetails?.filter(
    (pm) => pm?.payment_method == onlinePaymentOption
  )[0]?.payment_method_details?.utr_required;

  const confirmPayment = async (e, selectedPaymentGateway = "abcmoney") => {
    e.preventDefault();
    if (!depositImage) {
      errorToast("Please Upload Transaction Image");
      return false;
    }
    if (
      !(
        UPI_REGEX.test(referenceId) ||
        RTGS_REGEX.test(referenceId) ||
        NEFT_REGEX.test(referenceId)
      ) &&
      utrRequired
    ) {
      errorToast("Invalid UTR provided");
      return false;
    }
    setLoading(true);

    try {
      const payload = {
        gateway_provider_reference_id: providerRefId,
        utr: normalizeInput(referenceId),
        mobile_number: mobileNumber ? mobileNumber : "9876543211",
        bank_id: paymentDetails?.filter(
          (i) => i?.payment_method === onlinePaymentOption
        )[0].payment_method_details?.bank_id,
        payment_option:
          onlinePaymentOption === "BANK_TRANSFER" ? "IMPS" : "UPI",
        reference_id_modified: ocrReferenceId !== referenceId,
        upi_intent: !!paymentDetails?.filter(
          (i) => i?.payment_method === onlinePaymentOption
        )[0]?.payment_method_details?.upi_intent,
        bonus_policy_id: selectedBonus,
      };
      let formData = new FormData();
      formData.append("paymentSlip", uploadImage);
      formData.append("request", JSON.stringify(payload));
      const response = await AGPAY_API.post(
        `/agpay/v2/${selectedPaymentGateway}/:confirm-payment`,
        formData,
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
        }
      );
      if (response.status == 200) {
        successToast(langData?.["txn_saved_success_txt"]);
        depositInitiated();
        window.location.href = "/my_transactions";
        setOpenDepositModal(false);
      }
      setLoading(false);
    } catch (error) {
      errorToast(error?.response?.data?.message);
      setLoading(false);
    }
  };

  let [buttonVariables, setButtonVariables] = useState([
    { label: "500", stake: 500 },
    { label: "1000", stake: 1000 },
    { label: "5000", stake: 5000 },
    { label: "10000", stake: 10000 },
    { label: "25000", stake: 25000 },
    { label: "50000", stake: 50000 },
    { label: "100000", stake: 100000 },
    { label: "500000", stake: 500000 },
    { label: "1000000", stake: 1000000 },
  ]);

  useEffect(() => {
    if (newUser) {
      setButtonVariables([
        { label: "500", stake: 500 },
        { label: "1000", stake: 1000 },
        { label: "5000", stake: 5000 },
        { label: "10000", stake: 10000 },
        { label: "25000", stake: 25000 },
        { label: "50000", stake: 50000 },
        { label: "100000", stake: 100000 },
        { label: "500000", stake: 500000 },
        { label: "1000000", stake: 1000000 },
      ]);
    } else {
      setButtonVariables([
        { label: "500", stake: 500 },
        { label: "1000", stake: 1000 },
        { label: "5000", stake: 5000 },
        { label: "10000", stake: 10000 },
        { label: "25000", stake: 25000 },
        { label: "50000", stake: 50000 },
        { label: "100000", stake: 100000 },
        { label: "500000", stake: 500000 },
        { label: "1000000", stake: 1000000 },
      ]);
    }
  }, [newUser]);

  const copyText = (text, toastMessage = langData?.["text_copied_txt"]) => {
    navigator.clipboard.writeText(text);
    successToast(toastMessage);
  };

  useEffect(() => {
    if (paymentOption) {
      // fetchPaymentMethod();
      setAccountDetails([]);
      setSelectedAccountId("");
      setDepositAmount("");
      setDepositImage("");
      setDepositNotes("");
      setReferenceId("");
    }
  }, [paymentOption]);

  useEffect(() => {
    setPaymentDetails([]);
    setDepositAmount("");
    setDepositNotes("");
    setReferenceId("");
    setMobileNumber("");
    setProviderRefId("");
  }, [onlinePaymentOption, tabValue]);

  const renderPaymentForm = (
    paymentGateway: AvailablePaymentGateways,
    index: number,
    tabValue: number
  ) => {
    switch (paymentGateway) {
      case AvailablePaymentGateways.ABCMONEY:
        return (
          <AbcMoney
            index={index}
            onlinePaymentOption={onlinePaymentOption}
            depositPaymentMethodsInfo={depositPaymentMethodsInfo}
            setOnlinePaymentOption={setOnlinePaymentOption}
            tabValue={tabValue}
            submitOnlineAmount={submitOnlineAmount}
            paymentDetails={paymentDetails}
            depositAmount={depositAmount}
            setDepositAmount={setDepositAmount}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            loading={loading}
            providerRefId={providerRefId}
            confirmPayment={confirmPayment}
            copyText={copyText}
            referenceId={referenceId}
            setReferenceId={setReferenceId}
            paymentOptionFilter={paymentOptionFilter}
            setPaymentOptionFilter={setPaymentOptionFilter}
            depositImage={depositImage}
            handleCapture={handleCapture}
            handleClick={handleClick}
            ref={hiddenFileInput}
            langData={langData}
          />
        );

      case AvailablePaymentGateways.PGMAN:
        return (
          <Pgman
            index={index}
            tabValue={tabValue}
            paymentOption={paymentOption}
            setPaymentOption={setPaymentOption}
            accountDetails={accountDetails}
            selectedAccountId={selectedAccountId}
            setSelectedAccountId={setSelectedAccountId}
            setSelectedAccount={setSelectedAccount}
            selectedAccount={selectedAccount}
            copyText={copyText}
            paymentOptionFilter={paymentOptionFilter}
            setPaymentOptionFilter={setPaymentOptionFilter}
            submitPayment={submitPayment}
            depositAmount={depositAmount}
            depositNotes={depositNotes}
            referenceId={referenceId}
            setDepositAmount={setDepositAmount}
            setDepositNotes={setDepositNotes}
            setReferenceId={setReferenceId}
            depositImage={depositImage}
            handleCapture={handleCapture}
            handleClick={handleClick}
            loading={loading}
            ref={hiddenFileInput}
            depositPaymentMethodsInfo={depositPaymentMethodsInfo}
            setOnlinePaymentOption={setOnlinePaymentOption}
            onlinePaymentOption={onlinePaymentOption}
            langData={langData}
          />
        );

      case AvailablePaymentGateways.XENONPAY:
        return (
          <XenonPay
            index={index}
            tabValue={tabValue}
            depositAmount={depositAmount}
            loading={loading}
            mobileNumber={mobileNumber}
            providerRefId={providerRefId}
            setDepositAmount={setDepositAmount}
            setMobileNumber={setMobileNumber}
            submitXenonPay={submitXenonPay}
            langData={langData}
          />
        );
      case AvailablePaymentGateways.ZENPAY:
        return (
          <ZenPay
            index={index}
            providersList={providersList}
            onlinePaymentOption={onlinePaymentOption}
            depositPaymentMethodsInfo={depositPaymentMethodsInfo}
            setOnlinePaymentOption={setOnlinePaymentOption}
            tabValue={tabValue}
            submitOnlineAmount={submitOnlineAmount}
            paymentDetails={paymentDetails}
            depositAmount={depositAmount}
            setDepositAmount={setDepositAmount}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            loading={loading}
            providerRefId={providerRefId}
            confirmPayment={confirmPayment}
            copyText={copyText}
            referenceId={referenceId}
            setReferenceId={setReferenceId}
            paymentOptionFilter={paymentOptionFilter}
            setPaymentOptionFilter={setPaymentOptionFilter}
            depositImage={depositImage}
            handleCapture={handleCapture}
            handleClick={handleClick}
            ref={hiddenFileInput}
            buttonVariables={buttonVariables}
            getAdminWhatsAppNumber={getAdminWhatsAppNumber}
            setShowWhatsapp={setShowWhatsapp}
            showWhatsapp={showWhatsapp}
            bonusTypes={bonusTypes}
            selectedBonus={selectedBonus}
            setSelectedBonus={setSelectedBonus}
            pgProvider="zenpay"
            loggedIn={loggedIn}
            domainConfig={domainConfig}
            langData={langData}
          />
        );
      case AvailablePaymentGateways.ZENPAY1:
        return (
          <ZenPay
            index={index}
            providersList={providersList}
            onlinePaymentOption={onlinePaymentOption}
            depositPaymentMethodsInfo={depositPaymentMethodsInfo}
            setOnlinePaymentOption={setOnlinePaymentOption}
            tabValue={tabValue}
            submitOnlineAmount={submitOnlineAmount}
            paymentDetails={paymentDetails}
            depositAmount={depositAmount}
            setDepositAmount={setDepositAmount}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            loading={loading}
            providerRefId={providerRefId}
            confirmPayment={confirmPayment}
            copyText={copyText}
            referenceId={referenceId}
            setReferenceId={setReferenceId}
            paymentOptionFilter={paymentOptionFilter}
            setPaymentOptionFilter={setPaymentOptionFilter}
            depositImage={depositImage}
            handleCapture={handleCapture}
            handleClick={handleClick}
            ref={hiddenFileInput}
            buttonVariables={buttonVariables}
            getAdminWhatsAppNumber={getAdminWhatsAppNumber}
            setShowWhatsapp={setShowWhatsapp}
            showWhatsapp={showWhatsapp}
            bonusTypes={bonusTypes}
            selectedBonus={selectedBonus}
            setSelectedBonus={setSelectedBonus}
            pgProvider="zenpay1"
            loggedIn={loggedIn}
            domainConfig={domainConfig}
            langData={langData}
          />
        );
      case AvailablePaymentGateways.ZENPAY2:
        return (
          <ZenPay
            index={index}
            providersList={providersList}
            onlinePaymentOption={onlinePaymentOption}
            depositPaymentMethodsInfo={depositPaymentMethodsInfo}
            setOnlinePaymentOption={setOnlinePaymentOption}
            tabValue={tabValue}
            submitOnlineAmount={submitOnlineAmount}
            paymentDetails={paymentDetails}
            depositAmount={depositAmount}
            setDepositAmount={setDepositAmount}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            loading={loading}
            providerRefId={providerRefId}
            confirmPayment={confirmPayment}
            copyText={copyText}
            referenceId={referenceId}
            setReferenceId={setReferenceId}
            paymentOptionFilter={paymentOptionFilter}
            setPaymentOptionFilter={setPaymentOptionFilter}
            depositImage={depositImage}
            handleCapture={handleCapture}
            handleClick={handleClick}
            ref={hiddenFileInput}
            buttonVariables={buttonVariables}
            getAdminWhatsAppNumber={getAdminWhatsAppNumber}
            setShowWhatsapp={setShowWhatsapp}
            showWhatsapp={showWhatsapp}
            bonusTypes={bonusTypes}
            selectedBonus={selectedBonus}
            setSelectedBonus={setSelectedBonus}
            pgProvider="zenpay2"
            loggedIn={loggedIn}
            domainConfig={domainConfig}
            langData={langData}
          />
        );
      case AvailablePaymentGateways.XEINPAY:
        return (
          <ZenpayCheckout
            index={index}
            providersList={providersList}
            onlinePaymentOption={onlinePaymentOption}
            depositPaymentMethodsInfo={depositPaymentMethodsInfo}
            setOnlinePaymentOption={setOnlinePaymentOption}
            tabValue={tabValue}
            submitOnlineAmount={submitOnlineAmount}
            paymentDetails={paymentDetails}
            depositAmount={depositAmount}
            setDepositAmount={setDepositAmount}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            loading={loading}
            providerRefId={providerRefId}
            confirmPayment={confirmPayment}
            copyText={copyText}
            referenceId={referenceId}
            setReferenceId={setReferenceId}
            paymentOptionFilter={paymentOptionFilter}
            setPaymentOptionFilter={setPaymentOptionFilter}
            depositImage={depositImage}
            handleCapture={handleCapture}
            handleClick={handleClick}
            ref={hiddenFileInput}
            buttonVariables={buttonVariables}
            getAdminWhatsAppNumber={getAdminWhatsAppNumber}
            setShowWhatsapp={setShowWhatsapp}
            showWhatsapp={showWhatsapp}
            bonusTypes={bonusTypes}
            selectedBonus={selectedBonus}
            setSelectedBonus={setSelectedBonus}
            pgProvider="xeinpay"
            getBonusTypes={getBonusTypes}
            langData={langData}
          />
        );

      case AvailablePaymentGateways.XENONPAYZ:
        return (
          <Xenonpayz
            index={index}
            providersList={providersList}
            onlinePaymentOption={onlinePaymentOption}
            depositPaymentMethodsInfo={depositPaymentMethodsInfo}
            setOnlinePaymentOption={setOnlinePaymentOption}
            tabValue={tabValue}
            submitOnlineAmount={submitOnlineAmount}
            paymentDetails={paymentDetails}
            depositAmount={depositAmount}
            setDepositAmount={setDepositAmount}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            loading={loading}
            providerRefId={providerRefId}
            confirmPayment={confirmPayment}
            copyText={copyText}
            referenceId={referenceId}
            setReferenceId={setReferenceId}
            paymentOptionFilter={paymentOptionFilter}
            setPaymentOptionFilter={setPaymentOptionFilter}
            depositImage={depositImage}
            handleCapture={handleCapture}
            handleClick={handleClick}
            ref={hiddenFileInput}
            buttonVariables={buttonVariables}
            getAdminWhatsAppNumber={getAdminWhatsAppNumber}
            setShowWhatsapp={setShowWhatsapp}
            showWhatsapp={showWhatsapp}
            bonusTypes={bonusTypes}
            selectedBonus={selectedBonus}
            setSelectedBonus={setSelectedBonus}
            pgProvider="xenonpayz"
            getBonusTypes={getBonusTypes}
            langData={langData}
          />
        );
      case AvailablePaymentGateways.ZENPAYCRYPTO:
        return (
          <ZenpayCrypto
            setOpenDepositModal={setOpenDepositModal}
            setLoading={setLoading}
            index={index}
            providersList={providersList}
            onlinePaymentOption={onlinePaymentOption}
            depositPaymentMethodsInfo={depositPaymentMethodsInfo}
            setOnlinePaymentOption={setOnlinePaymentOption}
            tabValue={tabValue}
            depositAmount={depositAmount}
            setDepositAmount={setDepositAmount}
            mobileNumber={mobileNumber}
            setMobileNumber={setMobileNumber}
            loading={loading}
            copyText={copyText}
            ref={hiddenFileInput}
            buttonVariables={buttonVariables}
            getAdminWhatsAppNumber={getAdminWhatsAppNumber}
            setShowWhatsapp={setShowWhatsapp}
            showWhatsapp={showWhatsapp}
            bonusTypes={bonusTypes}
            selectedBonus={selectedBonus}
            setSelectedBonus={setSelectedBonus}
            getBonusTypes={getBonusTypes}
            langData={langData}
            loggedIn={loggedIn}
            domainConfig={domainConfig}
            setAlertMsg={setAlertMsg}
            depositImage={depositImage}
            handleCapture={handleCapture}
            handleClick={handleClick}
            uploadImage={uploadImage}
          />
        );
      case AvailablePaymentGateways.ZENPAYCRYPTOSEAMLESS:
        return (
          <ZenpayCryptoSeamless
            index={index}
            providersList={providersList}
            depositPaymentMethodsInfo={depositPaymentMethodsInfo}
            setOnlinePaymentOption={setOnlinePaymentOption}
            tabValue={tabValue}
            copyText={copyText}
            ref={hiddenFileInput}
            langData={langData}
          />
        );
      default:
        return null;
    }
  };

  const getPaymentIcon = (method) => {
    return method === "GPAY"
      ? gpay
      : method === "PHONEPE"
      ? phonePe
      : method === "BANK_TRANSFER"
      ? bank
      : method === "PAYTM"
      ? paytm
      : null;
  };

  useEffect(() => {
    setProvidersList(depositPaymentMethodsInfo["UPI"]);
  }, [depositPaymentMethodsInfo]);

  useEffect(() => {
    getPaymentProviders();
    isNewUser();
    setPaymentOption("BANK_TRANSFER");
  }, []);

  const eligibleBankBonusWls = [
    "fairplay",
    "stake786",
    "govinda365",
    "winadda",
    "playadda",
    "southbook",
    "murganbook",
    "guru365",
    "ultrawin",
  ];

  const is5PercentBankBonusEligible = eligibleBankBonusWls.includes(
    BRAND_DOMAIN.split(".")[0]
  );

  return (
    <div className="deposit-ctn-new">
      <div className="deposit-back-btn-report-header">
        <ReportBackBtn back={langData?.["back"]} />
        <ReportsHeader
          titleIcon={depositIcon}
          reportName={langData?.["deposit"]}
          reportFilters={[
            {
              element: (
                <div className="deposit-header-text">
                  {langData?.["select_deposit_method_txt"]}:
                </div>
              ),
            },
          ]}
        />
      </div>
      <div className="deposit-form-ctn account-inputs">
        {!loading && Object.keys(depositPaymentMethodsInfo).length == 0 && (
          <div className="pg-down-msg">
            {demoUser()
              ? langData?.["demo_deposits_msg"]
              : langData?.["deposit_upi_problem_txt"]}
          </div>
        )}
        <div className="disclaimer-msg">
          <b>{langData?.["disclaimer"]}</b>
        </div>
        {depositPaymentMethodsInfo && (
          <Tabs
            value={paymentOption}
            onChange={(_, newValue) => {
              if (newValue == "WHATSAPP DEPOSIT") {
                getAdminWhatsAppNumber();
                return;
              }
              setPaymentOption(newValue);
              setProvidersList(depositPaymentMethodsInfo[newValue]);
              setTabValue(0);
              setMobileNumber("");
              setPaymentDetails([]);
              setProviderRefId("");
              setOnlinePaymentOption(newValue);
            }}
          >
            {Object.keys(depositPaymentMethodsInfo).map(
              (paymentMethodName, index) => (
                <Tab
                  value={paymentMethodName}
                  label={
                    paymentMethodName === "BANK_TRANSFER"
                      ? is5PercentBankBonusEligible
                        ? "BANK (5% Bonus)"
                        : "BANK"
                      : paymentMethodName === "CRYPTO_WALLET_TRANSFER"
                      ? "CRYPTO"
                      : paymentMethodName
                  }
                  className="payment-btn"
                />
              )
            )}
            <Tab
              value={"WHATSAPP DEPOSIT"}
              label={langData?.["whatsapp_deposit"]}
              className="whatsapp-payment-btn"
            />
          </Tabs>
        )}
        <div className="deposit-form-ctn">
          {providersList?.length > 1 && (
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
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
              renderPaymentForm(paymentGateway, index, tabValue)
            )}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    whatsappDetails: demoUser()
      ? state.common.demoUserWhatsappDetails
      : state.common.whatsappDetails,
    loggedIn: state.auth.loggedIn,
    domainConfig: state.common.domainConfig,
    langData: state.common.langData,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    setOpenDepositModal: (val) => dispatch(setOpenDepositModal(val)),
    setAlertMsg: (alert: AlertDTO) => dispatch(setAlertMsg(alert)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Deposit);
