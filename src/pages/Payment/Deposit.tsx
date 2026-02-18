import React, { useRef, useState, useEffect } from "react";
import { connect } from "react-redux";
import { RootState } from "../../models/RootState";
import { Copy, Edit } from "../../shared/icon";
import "./Deposit.scss";
import "./Payment.scss";
import "./Zenpay.scss";

import { ReactComponent as depositIcon } from "../../assets/images/common/icons/depositAdd.svg?react";
import ReportBackBtn from "../../common/ReportBackBtn/ReportBackBtn";
import ReportsHeader from "../../common/ReportsHeader/ReportsHeader";
import { AlertDTO } from "../../models/Alert";
import { setOpenDepositModal, fetchBalance } from "../../store";
import { setAlertMsg } from "../../store/common/commonActions";
import { demoUser } from "../../util/stringUtil";
import { Link } from "react-router-dom";
import { Button } from "@material-ui/core";
import InputTemplate from "../../common/InputTemplate/InputTemplate";
import USABET_API from "../../api-services/usabet-api";
import {
  WalletLimitDTO,
  BankAccountTypeDTO,
  BankAccountDTO,
} from "../../models/deposit";

export type BonusDto = {
  id: number;
  name: string;
  description: string;
  bonusCategory: string;
};

type StoreProps = {
  langData: any;
  setOpenDepositModal: (val: boolean) => void;
  setAlertMsg: (alert: AlertDTO) => void;
  fetchBalance: () => void;
};

const Deposit: React.FC<StoreProps> = (props) => {
  const { langData, setAlertMsg, fetchBalance } = props;
  const [amount, setAmount] = useState("");
  const [walletLimits, setWalletLimits] = useState<WalletLimitDTO | null>(null);
  const [loadingLimits, setLoadingLimits] = useState(true);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [depositImage, setDepositImage] = useState<string | ArrayBuffer | null>(
    null
  );
  const [uploadImage, setUploadImage] = useState<File | null>(null);
  const [remark, setRemark] = useState("");
  const [userReferenceNo, setUserReferenceNo] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const hiddenFileInput = useRef<HTMLInputElement>(null);

  const [paymentTypes, setPaymentTypes] = useState<BankAccountTypeDTO[]>([]);
  const [loadingPaymentTypes, setLoadingPaymentTypes] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] =
    useState<BankAccountTypeDTO | null>(null);

  const [bankAccounts, setBankAccounts] = useState<BankAccountDTO[]>([]);
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] =
    useState<BankAccountDTO | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const depositMin = walletLimits?.deposit_min_limit ?? 100;
  const depositMax = walletLimits?.deposit_max_limit ?? 1000;

  const getNumericAmount = () => {
    const num = parseInt(amount.replace(/,/g, ""), 10);
    return isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    const fetchWalletLimits = async () => {
      setLoadingLimits(true);
      try {
        const res = await USABET_API.post("/user/getUserShoutPeWalletLimit");
        if (res?.data?.status && res?.data?.data) {
          setWalletLimits(res.data.data);
        }
      } catch (err: any) {
        const msg =
          err?.response?.data?.msg ||
          err?.message ||
          "Failed to fetch wallet limits";
        setAlertMsg({ type: "error", message: msg });
      } finally {
        setLoadingLimits(false);
      }
    };
    fetchWalletLimits();
  }, [setAlertMsg]);

  const fetchPaymentTypes = async () => {
    const amt = getNumericAmount();
    if (amt < depositMin || amt > depositMax) {
      setAlertMsg({
        type: "error",
        message:
          langData?.["amount_invalid"] ||
          `Amount must be between ${depositMin} and ${depositMax}`,
      });
      return;
    }
    setLoadingPaymentTypes(true);
    setPaymentTypes([]);
    setSelectedPaymentType(null);
    setBankAccounts([]);
    setSelectedBankAccount(null);
    try {
      const res = await USABET_API.post("/wallet/bankAccountTypesGet", {
        limit: 10,
        page: 1,
        payment_type: "DEPOSIT",
        amount: amt,
      });
      if (res?.data?.status && Array.isArray(res?.data?.data)) {
        setPaymentTypes(res.data.data);
        setStep(1);
      } else {
        setAlertMsg({
          type: "error",
          message:
            res?.data?.msg ||
            langData?.["no_payment_methods"] ||
            "No payment methods available",
        });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.msg ||
        err?.message ||
        "Failed to fetch payment methods";
      setAlertMsg({ type: "error", message: msg });
    } finally {
      setLoadingPaymentTypes(false);
    }
  };

  const fetchBankAccounts = async (typeItem: BankAccountTypeDTO) => {
    const amt = getNumericAmount();
    setSelectedPaymentType(typeItem);
    setLoadingBankAccounts(true);
    setBankAccounts([]);
    setSelectedBankAccount(null);
    try {
      const res = await USABET_API.post("/wallet/getParentBankAccount", {
        bank_account_type_id: typeItem._id,
        amount: amt,
      });
      if (res?.data?.status && Array.isArray(res?.data?.data)) {
        setBankAccounts(res.data.data);
        setStep(2);
      } else {
        setAlertMsg({
          type: "error",
          message:
            res?.data?.msg ||
            langData?.["no_bank_accounts"] ||
            "No bank accounts available",
        });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.msg ||
        err?.message ||
        "Failed to fetch bank accounts";
      setAlertMsg({ type: "error", message: msg });
    } finally {
      setLoadingBankAccounts(false);
    }
  };

  const selectBankAccount = (acc: BankAccountDTO) => {
    setSelectedBankAccount(acc);
    setStep(3);
  };

  const handleAddAmount = (value: string) => {
    const numValue = parseInt(value.replace(/,/g, ""), 10);
    const currentAmount = getNumericAmount();
    const newAmount = currentAmount + numValue;
    setAmount(newAmount.toLocaleString());
  };

  const handleAmountChange = (value: string) => {
    const numericValue = (value || "").replace(/,/g, "");
    if (numericValue === "" || !isNaN(parseInt(numericValue, 10))) {
      setAmount(numericValue ? parseInt(numericValue, 10).toLocaleString() : "");
    }
  };

  const handleEdit = () => {
    setStep(0);
    setSelectedPaymentType(null);
    setBankAccounts([]);
    setSelectedBankAccount(null);
    setRemark("");
    setUserReferenceNo("");
    setDepositImage(null);
    setUploadImage(null);
    setTermsAccepted(false);
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2);
      setSelectedBankAccount(null);
      setRemark("");
      setUserReferenceNo("");
      setDepositImage(null);
      setUploadImage(null);
      setTermsAccepted(false);
    } else if (step === 2) {
      setStep(1);
      setSelectedPaymentType(null);
      setBankAccounts([]);
      setSelectedBankAccount(null);
    } else if (step === 1) {
      setStep(0);
      setSelectedPaymentType(null);
      setPaymentTypes([]);
      setBankAccounts([]);
    }
  };

  const errorToast = (mess: string) => {
    setAlertMsg({ type: "error", message: mess ?? "" });
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      errorToast("File upload error: The file size must be less than 5MB");
      e.target.value = "";
      setUploadImage(null);
      setDepositImage(null);
      return;
    }
    setUploadImage(file);
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = (ev) => {
      setDepositImage(ev.target?.result ?? null);
    };
  };

  const handleClick = () => {
    hiddenFileInput.current?.click();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setAlertMsg({
        type: "success",
        message: langData?.["copied"] || "Copied to clipboard",
      });
    });
  };

  const getDisplayValue = (acc: BankAccountDTO) => {
    if (acc.crypto_wallet) return acc.crypto_wallet;
    if (acc.crypto_coin_type) return acc.crypto_coin_type;
    if (acc.upi_id) return acc.upi_id;
    if (acc.account_number) return acc.account_number;
    return acc.holder_name || "-";
  };

  const getDisplayLabel = (acc: BankAccountDTO) => {
    if (acc.crypto_wallet) return "Crypto Wallet";
    if (acc.crypto_coin_type) return "Coin Type";
    if (acc.upi_id) return "UPI ID";
    if (acc.account_number) return "Account Number";
    return "Holder Name";
  };

  const handleConfirmPayment = async () => {
    if (!selectedBankAccount) {
      setAlertMsg({
        type: "error",
        message: langData?.["select_bank_account"] || "Please select a bank account",
      });
      return;
    }
    if (!uploadImage) {
      setAlertMsg({
        type: "error",
        message: langData?.["upload_image_required"] || "Please upload payment screenshot",
      });
      return;
    }
    if (!termsAccepted) {
      setAlertMsg({
        type: "error",
        message: langData?.["accept_terms"] || "Please accept Terms & Conditions",
      });
      return;
    }
    const refNo = userReferenceNo.trim();
    if (!refNo) {
      setAlertMsg({
        type: "error",
        message:
          langData?.["reference_required"] || "Please enter Reference ID/UTR",
      });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("image", uploadImage);
      formData.append("bank_account_id", selectedBankAccount._id);
      formData.append("amount", String(getNumericAmount()));
      formData.append("remark", remark.trim() || "wallet");
      formData.append("user_reference_no", refNo);

      const res = await USABET_API.post("/wallet/depositRequestInit", formData);

      if (res?.data?.status) {
        setAlertMsg({
          type: "success",
          message: res?.data?.msg || "Request submitted successfully!",
        });
        fetchBalance();
        handleEdit();
      } else {
        setAlertMsg({
          type: "error",
          message: res?.data?.msg || "Failed to submit deposit request",
        });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.msg ||
        err?.message ||
        "Failed to submit deposit request";
      setAlertMsg({ type: "error", message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = step > 0;

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
        <div className="disclaimer-msg">
          <b>{langData?.["disclaimer"]}</b>
        </div>
        <div className="auto-deposit">
          <div className="mt-2">
            <div className="deposit-input">
              <InputTemplate
                type="text"
                name="amount"
                label={langData?.["enter_amount"] || "Enter Amount"}
                placeholder={langData?.["enter_amount"] || "Enter Amount"}
                disabled={nextStep}
                value={amount}
                onChange={handleAmountChange}
              />
              {nextStep && <Edit onClick={handleEdit} />}
            </div>
            <div className="amount-info">
              <span>
                {langData?.["min"] || "Min"} {depositMin}
              </span>
              <span> - </span>
              <span>
                {langData?.["max"] || "Max"} {depositMax}
              </span>
            </div>

            {step === 0 && (
              <div className="ocbValueButtons zenpay-ctn">
                <div className="account-inputs">
                  <Button
                    type="button"
                    className="qb-btn"
                    onClick={() => handleAddAmount("100")}
                  >
                    <span>+100</span>
                  </Button>
                  <Button
                    type="button"
                    className="qb-btn"
                    onClick={() => handleAddAmount("500")}
                  >
                    <span>+500</span>
                  </Button>
                  <Button
                    type="button"
                    className="qb-btn"
                    onClick={() => handleAddAmount("1000")}
                  >
                    <span>+1,000</span>
                  </Button>
                  <Button
                    type="button"
                    className="qb-btn"
                    onClick={() => handleAddAmount("5000")}
                  >
                    <span>+5,000</span>
                  </Button>
                  <Button
                    type="button"
                    className="qb-btn"
                    onClick={() => handleAddAmount("10000")}
                  >
                    <span>+10,000</span>
                  </Button>
                  <Button
                    type="button"
                    className="qb-btn"
                    onClick={() => handleAddAmount("50000")}
                  >
                    <span>+50,000</span>
                  </Button>
                  <Button
                    variant="contained"
                    className="submit-payment-btn"
                    onClick={fetchPaymentTypes}
                    disabled={loadingPaymentTypes}
                  >
                    {loadingPaymentTypes
                      ? langData?.["loading"] || "Loading..."
                      : langData?.["next"] || "Next"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {step === 1 && (
          <div className="auto-deposit zenpay-ctn">
            <Button
              size="small"
              className="back-step-btn"
              onClick={handleBack}
            >
              {langData?.["back"] || "Back"}
            </Button>
            <h6 className="payment-option-title mt-10">
              {langData?.["select_payment_method"] || "Select Payment Method"}
            </h6>
            <div className="payment-types-grid">
              {paymentTypes.map((pt) => (
                <div
                  key={pt._id}
                  className={`payment-type-card ${
                    selectedPaymentType?._id === pt._id ? "active" : ""
                  }`}
                  onClick={() => fetchBankAccounts(pt)}
                >
                  {pt.image && (
                    <img src={pt.image} alt={pt.name} className="payment-type-img" />
                  )}
                  <span className="payment-type-name">{pt.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="auto-deposit zenpay-ctn">
            <Button
              size="small"
              className="back-step-btn"
              onClick={handleBack}
            >
              {langData?.["back"] || "Back"}
            </Button>
            <h6 className="payment-option-title mt-10">
              {langData?.["select_bank_account"] || "Select Bank Account"}
            </h6>
            <div className="bank-accounts-list">
              {bankAccounts.map((acc) => (
                <div
                  key={acc._id}
                  className={`bank-account-card ${
                    selectedBankAccount?._id === acc._id ? "active" : ""
                  }`}
                  onClick={() => selectBankAccount(acc)}
                >
                  <div className="bank-account-holder">{acc.holder_name}</div>
                  <div className="bank-account-detail">
                    <span className="label">{getDisplayLabel(acc)}:</span>
                    <span className="value">{getDisplayValue(acc)}</span>
                    <Copy
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(getDisplayValue(acc));
                      }}
                    />
                  </div>
                  <div className="bank-account-limits">
                    {acc.min_amount} - {acc.max_amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && selectedBankAccount && (
          <div className="auto-deposit zenpay-ctn">
            <Button
              size="small"
              className="back-step-btn"
              onClick={handleBack}
            >
              {langData?.["back"] || "Back"}
            </Button>
            <div className="mb-4">
              <h6 className="payment-option-title mt-10">
                {langData?.["account_detail"] || "Account Detail"}
              </h6>
              <div className="account-detail">
                <label>{getDisplayLabel(selectedBankAccount)}</label>
                <div className="account-info">
                  <p>{getDisplayValue(selectedBankAccount)}</p>
                  <Copy
                    onClick={() =>
                      copyToClipboard(
                        getDisplayValue(selectedBankAccount)
                      )
                    }
                  />
                </div>
              </div>
              <div className="account-detail">
                <label>{langData?.["holder_name"] || "Holder Name"}</label>
                <div className="account-info">
                  <p>{selectedBankAccount.holder_name}</p>
                  <Copy
                    onClick={() =>
                      copyToClipboard(selectedBankAccount.holder_name)
                    }
                  />
                </div>
              </div>
            </div>
            <InputTemplate
              type="text"
              placeholder={langData?.["enter_reference_placeholder"] || "Enter Reference ID/UTR"}
              name="utr"
              value={userReferenceNo}
              onChange={(val) => setUserReferenceNo(val)}
              label={langData?.["unique_transaction_ref"] || "Unique Transaction Reference*"}
            />
            <InputTemplate
              type="text"
              placeholder={langData?.["enter_remark"] || "Enter remark (optional)"}
              name="remark"
              value={remark}
              onChange={(val) => setRemark(val)}
              label={langData?.["remark"] || "Remark"}
            />
            <div className="account-input">
              {depositImage ? (
                <div>
                  <div className="zenpay-uploaded-image-title">
                    {langData?.["uploaded_image"] || "Uploaded Image"}
                  </div>
                  <img
                    src={`${depositImage}`}
                    className="deposit-upload-image"
                    alt="Upload"
                  />
                </div>
              ) : null}

              <input
                accept="image/*"
                style={{ display: "none" }}
                id="raised-button-file-abcmoney"
                type="file"
                ref={hiddenFileInput}
                onChange={handleCapture}
              />
              <Button
                component="div"
                className="zenpay-upload-btn"
                onClick={handleClick}
              >
                {langData?.["upload_image"] || "Upload Image"}
              </Button>
            </div>
            <div className="form-group terms">
              <input
                type="checkbox"
                id="terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <label className="mb-0" htmlFor="terms">
                {langData?.["accept_terms_text"] || "I accept all the"}{" "}
                <Link to="/" className="pointer">
                  <span>{langData?.["terms_conditions"] || "Terms & Conditions"}</span>
                </Link>
              </label>
            </div>
            <Button
              variant="contained"
              className="submit-payment-btn"
              onClick={handleConfirmPayment}
              disabled={submitting}
            >
              {submitting
                ? langData?.["submitting"] || "Submitting..."
                : langData?.["confirm_payment"] || "Confirm Payment"}
            </Button>
          </div>
        )}
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
    setOpenDepositModal: (val: boolean) => dispatch(setOpenDepositModal(val)),
    setAlertMsg: (alert: AlertDTO) => dispatch(setAlertMsg(alert)),
    fetchBalance: () => dispatch(fetchBalance()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Deposit);
