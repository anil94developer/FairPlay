import { IonSpinner } from "@ionic/react";
import Tabs from "@material-ui/core/Tabs";
import Button from "@material-ui/core/Button";
import Add from "@material-ui/icons/Add";
import Edit from "@material-ui/icons/Edit";
import React, { useEffect, useState } from "react";
import deleteImg from "../../../assets/images/common/icons/accountDelete.svg";
import bank from "../../../assets/images/common/icons/bank.svg";
import InputTemplate from "../../../common/InputTemplate/InputTemplate";
import TabPanel from "../../../components/TabPanel/TabPanel";
import { FormControl, FormHelperText, MenuItem, Select, Tab } from "@material-ui/core";
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
  submitWalletBankAccount?: any;
  updateWalletBankAccount?: any;
  editingAccountId?: string | null;
  setAccountForEdit?: (acc: any) => void;
  cancelEdit?: () => void;
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
  bankType?: string;
  setBankType?: Function;
  bankAccountType?: string;
  setBankAccountType?: Function;
  bankAccountTypes?: Array<{ _id: string; name?: string }>;
  bankFormErrors?: Record<string, string>;
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
  bankType = "SAVING",
  setBankType,
  bankAccountType,
  setBankAccountType,
  bankAccountTypes = [],
  bankFormErrors = {},
  submitAbcPayment,
  submitWalletBankAccount,
  updateWalletBankAccount,
  editingAccountId,
  setAccountForEdit,
  cancelEdit,
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
                paymentMethod === "BANK_TRANSFER" || paymentMethod === "BANK"
                  ? langData?.["bank"]
                  : langData?.[paymentMethod] || paymentMethod
              }
            />
          )
        )}
      </Tabs>
      <div className="account-details-ctn">
        <div className="sub-acc-details-ctn">
          {(paymentOption === "BANK_TRANSFER" || paymentOption === "BANK") &&
            accountDetails?.map((acc) => (
              <div className="account-btn-ctn" key={acc?.id}>
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
                      (paymentOption === "BANK_TRANSFER" || paymentOption === "BANK")
                        ? "delete-btn-ctn-div"
                        : "delete-btn-ctn-div-upi"
                    }
                  >
                    <div className="account-actions">
                      {submitWalletBankAccount && setAccountForEdit && (
                        <Button
                          className="method-edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAccountForEdit(acc);
                          }}
                          title={langData?.["edit"] || "Edit"}
                        >
                          <Edit fontSize="small" />
                        </Button>
                      )}
                      <Button
                        className="method-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteModal(true);
                          setDeleteId(acc?.id);
                        }}
                      >
                        <img src={deleteImg} alt="delete" />
                      </Button>
                    </div>
                    <div className="account-number">
                      {(paymentOption === "BANK_TRANSFER" || paymentOption === "BANK") && (
                        <div className="account-ifsc">
                          {acc?.paymentMethodDetails?.ifscCode}
                        </div>
                      )}
                    </div>
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
              cancelEdit?.();
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
      {(paymentOption === "BANK_TRANSFER" || paymentOption === "BANK") &&
        (addAccount || editingAccountId) && (
        <form
          className="account-inputs bank-account-form bank-details-form-card"
          onSubmit={(e) => {
            if (submitWalletBankAccount) {
              if (editingAccountId) {
                updateWalletBankAccount?.(e);
              } else {
                submitWalletBankAccount(e);
              }
            } else {
              submitDetails(e);
            }
          }}
        >
          <div className="bank-form-header">
            <h3 className="bank-form-title">
              {editingAccountId
                ? langData?.["edit_account"] || "Edit Account"
                : langData?.["enter_details"] || "Enter Details"}
            </h3>
            {editingAccountId && cancelEdit && (
              <Button
                className="cancel-edit-btn"
                onClick={cancelEdit}
                size="small"
              >
                {langData?.["cancel"] || "Cancel"}
              </Button>
            )}
          </div>
          {submitWalletBankAccount &&
            bankAccountTypes?.length > 0 &&
            setBankAccountType && (
              <div className="bank-field-ctn">
                <FormControl
                  fullWidth
                  error={!!bankFormErrors?.bankAccountType}
                  className="bank-select-form-control"
                >
                  <label className="input-label">
                    {langData?.["bank_account_type"] || "Bank Account Type"} *
                  </label>
                  <Select
                    value={bankAccountType || ""}
                    onChange={(e) => setBankAccountType(e.target.value)}
                    displayEmpty
                    variant="outlined"
                    className="bank-type-select"
                  >
                    <MenuItem value="" disabled>
                      {langData?.["select_bank_type"] || "Select type"}
                    </MenuItem>
                    {bankAccountTypes.map((t) => (
                      <MenuItem key={t._id} value={t._id}>
                        {t.name || t._id}
                      </MenuItem>
                    ))}
                  </Select>
                  {bankFormErrors?.bankAccountType && (
                    <FormHelperText>
                      {bankFormErrors.bankAccountType}
                    </FormHelperText>
                  )}
                </FormControl>
              </div>
            )}
          <div className="bank-field-ctn">
            <InputTemplate
              required={true}
              label={`${langData?.["account_holder_name"] || "Account Holder Name"} *`}
              value={holderName}
              placeholder="e.g. John Doe"
              onChange={(e) => setHolderName(e)}
            />
            {bankFormErrors?.holderName && (
              <div className="field-error">{bankFormErrors.holderName}</div>
            )}
          </div>
          <div className="bank-field-ctn">
            <InputTemplate
              required={true}
              label={`${langData?.["account_no"] || "Account Number"} *`}
              value={accountNumber}
              placeholder="9-18 digits"
              type="text"
              onChange={(val) =>
                setAccountNumber(val ? String(val).replace(/\D/g, "") : val)
              }
            />
            {bankFormErrors?.accountNumber && (
              <div className="field-error">{bankFormErrors.accountNumber}</div>
            )}
          </div>
          <div className="bank-field-ctn">
            <InputTemplate
              required={!!submitWalletBankAccount}
              label={`${langData?.["bank_name"] || "Bank Name"} *`}
              value={bankName}
              placeholder="e.g. SBI, HDFC"
              onChange={(e) => setBankName(e)}
            />
            {bankFormErrors?.bankName && (
              <div className="field-error">{bankFormErrors.bankName}</div>
            )}
          </div>
          <div className="bank-field-ctn">
            <InputTemplate
              label={langData?.["branch_name"] || "Branch Name"}
              value={branchName}
              placeholder="e.g. Main Branch"
              onChange={(e) => setBranchName(e)}
            />
          </div>
          <div className="bank-field-ctn">
            <InputTemplate
              required={!!submitWalletBankAccount}
              label={`${langData?.["ifsc_no"] || "IFSC Code"} *`}
              value={ifscCode}
              placeholder="e.g. SBIN0001234"
              onChange={(val) => setIfscCode(val ? String(val).toUpperCase() : val)}
            />
            {bankFormErrors?.ifscCode && (
              <div className="field-error">{bankFormErrors.ifscCode}</div>
            )}
          </div>
          {submitWalletBankAccount && setBankType && (
            <div className="bank-field-ctn">
              <FormControl fullWidth className="bank-select-form-control">
                <label className="input-label">
                  {langData?.["bank_type"] || "Account Type"}
                </label>
                <Select
                  value={bankType}
                  onChange={(e) => setBankType(e.target.value)}
                  displayEmpty
                  variant="outlined"
                  className="bank-type-select"
                >
                  <MenuItem value="SAVING">
                    {langData?.["saving"] || "Saving"}
                  </MenuItem>
                  <MenuItem value="CURRENT">
                    {langData?.["current"] || "Current"}
                  </MenuItem>
                </Select>
              </FormControl>
            </div>
          )}
          {!submitWalletBankAccount && isOnlineUser && (
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
            className="submit-payment-btn bank-add-btn"
            type="submit"
            endIcon={loading ? <IonSpinner name="lines-small" /> : ""}
            disabled={loading ? true : false}
          >
            {editingAccountId
              ? langData?.["update"] || "UPDATE"
              : langData?.["add"] || "ADD"}
          </Button>
        </form>
      )}

      {(paymentOption === "BANK_TRANSFER" || paymentOption === "BANK") && selectedAccountId ? (
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
