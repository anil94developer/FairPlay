import { IonSpinner } from "@ionic/react";
import Button from "@material-ui/core/Button";
import Add from "@material-ui/icons/Add";
import Edit from "@material-ui/icons/Edit";
import React from "react";
import deleteImg from "../../../assets/images/common/icons/accountDelete.svg";
import InputTemplate from "../../../common/InputTemplate/InputTemplate";
import TabPanel from "../../../components/TabPanel/TabPanel";
import "../Zenpay.scss";

interface ZenPayUpiProps {
  tabValue: number;
  index: number;
  paymentOption: string;
  accountDetails: any;
  selectedAccountId: any;
  setSelectedAccountId: any;
  setShowDeleteModal: any;
  setDeleteId: any;
  addAccount: any;
  setAddAccount: any;
  submitWalletUpiAccount: (e: React.FormEvent) => void;
  loading: boolean;
  holderName: any;
  setHolderName: Function;
  accountNumber: any;
  setAccountNumber: Function;
  phoneNumber: any;
  setPhoneNumber: Function;
  withdrawAmount: any;
  setWithdrawAmount: Function;
  langData: any;
  cancelEdit?: () => void;
  editingAccountId?: string | null;
  updateWalletUpiAccount?: (e: React.FormEvent) => void;
  setAccountForEditUpi?: (acc: any) => void;
  pgProvider: string;
}

const ZenPayUpi: React.FC<ZenPayUpiProps> = ({
  tabValue,
  index,
  paymentOption,
  accountDetails,
  selectedAccountId,
  setSelectedAccountId,
  setShowDeleteModal,
  setDeleteId,
  addAccount,
  setAddAccount,
  submitWalletUpiAccount,
  loading,
  holderName,
  setHolderName,
  accountNumber,
  setAccountNumber,
  phoneNumber,
  setPhoneNumber,
  withdrawAmount,
  setWithdrawAmount,
  langData,
  cancelEdit,
  editingAccountId,
  updateWalletUpiAccount,
  setAccountForEditUpi,
  pgProvider
}) => {
  return (
    <TabPanel value={tabValue} index={index}>
      <div className="account-details-ctn">
        <div className="sub-acc-details-ctn">
          {paymentOption === "UPI" &&
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
                  <div className="delete-btn-ctn-div">
                    <div className="account-actions">
                      {setAccountForEditUpi && (
                        <Button
                          className="method-edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAccountForEditUpi(acc);
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
                      <div className="account-ifsc">
                        {acc?.paymentMethodDetails?.upiId?.length > 8
                          ? acc?.paymentMethodDetails?.upiId?.slice(0, 8) + "****"
                          : acc?.paymentMethodDetails?.upiId}
                      </div>
                    </div>
                  </div>
                  <div className="account-name-new-ctn">
                    <div className="account-name-new">
                      {acc?.paymentMethodDetails?.accountHolderName}
                    </div>
                  </div>
                  <div className="account-name-bottom">
                    {acc?.paymentMethodDetails?.upiPhoneNumber}
                  </div>
                </Button>
              </div>
            ))}
        </div>
        {paymentOption === "UPI" && (
          <Button
            title={"Add UPI"}
            onClick={() => {
              cancelEdit?.();
              setAddAccount(true);
            }}
            className="add-btn"
          >
            <div className="add-account">
              <Add />
            </div>
            <div className="add-new-accnt">
              {langData?.["add_upi"] || "Add UPI"}
            </div>
          </Button>
        )}
      </div>

      {paymentOption === "UPI" && (addAccount || editingAccountId) && (
        <form
          className="account-inputs bank-account-form bank-details-form-card"
          onSubmit={(e) => {
            e.preventDefault();
            if (editingAccountId) {
              updateWalletUpiAccount?.(e);
            } else {
              submitWalletUpiAccount(e);
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
          <InputTemplate
            required
            label={langData?.["upi_id"] || "UPI ID"}
            value={accountNumber || ""}
            placeholder={langData?.["enter_upi_id"] || "Enter UPI ID"}
            onChange={(v) => setAccountNumber(v)}
          />
          <InputTemplate
            required
            label={langData?.["mobile_no"] || "Mobile No"}
            value={phoneNumber || ""}
            placeholder={langData?.["enter_mobile_number"] || "Enter Mobile Number"}
            onChange={(v) => setPhoneNumber(v)}
            type="number"
          />
          <InputTemplate
            required
            label={langData?.["account_name"] || "Account Name"}
            value={holderName || ""}
            placeholder={langData?.["enter_account_name"] || "Enter Account Name"}
            onChange={(v) => setHolderName(v)}
          />
          <Button
            className="submit-payment-btn"
            type="submit"
            endIcon={loading ? <IonSpinner name="lines-small" /> : ""}
            disabled={loading}
          >
            {editingAccountId
              ? langData?.["update"] || "UPDATE"
              : langData?.["add"] || "ADD"}
          </Button>
        </form>
      )}

      {paymentOption === "UPI" && selectedAccountId && (
        <form
        className="account-inputs"
        onSubmit={(e) => {
          submitWalletUpiAccount(e);
        }}
      >
        
        <InputTemplate
          required={true}
          label={langData?.["enter_amount"] + " (INR)"}
          value={withdrawAmount}
          type={"number"}
          placeholder={langData?.["enter_withdraw_amount"]}
          onChange={(e) => setWithdrawAmount(e)}
        />
        <InputTemplate 
          label={langData?.["enter_notes"]}
          value={""}
          placeholder={langData?.["enter_notes"]}
          onChange={(e) =>  {}}
        />
        
         
        <Button
          className="submit-payment-btn"
          type="submit"
          disabled={loading ? true : false}
          endIcon={loading ? <IonSpinner name="lines-small" /> : ""}
        >
          {langData?.["submit"]}
        </Button>
      </form>
      )}
    </TabPanel>
  );
};

export default ZenPayUpi;
