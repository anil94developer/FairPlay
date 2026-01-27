import { IonSpinner } from "@ionic/react";
import Button from "@material-ui/core/Button";
import { WhatsApp } from "@material-ui/icons";
import React, { FormEvent, forwardRef, useEffect } from "react";
import { isMobile } from "react-device-detect";
import { connect } from "react-redux";
import InputTemplate from "../../../common/InputTemplate/InputTemplate";
import SelectTemplate from "../../../common/SelectTemplate/SelectTemplate";
import TabPanel from "../../../components/TabPanel/TabPanel";
import { ButtonVariable } from "../../../models/ButtonVariables";
import { DomainConfig } from "../../../models/DomainConfig";
import { RootState } from "../../../models/RootState";
import { BonusDto } from "../Deposit";
import { PaymentMethodsInfo, PaymentOptions } from "../Deposit.types";
import "../Zenpay.scss";

interface XenonpayzTabPanelProps {
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
  getBonusTypes: (amount: number) => void;
  langData: any;
}

const Xenonpayz = forwardRef<HTMLInputElement, XenonpayzTabPanelProps>(
  (
    {
      index,
      providersList,
      tabValue,
      submitOnlineAmount,
      paymentDetails,
      depositAmount,
      setDepositAmount,
      loading,
      providerRefId,
      confirmPayment,
      depositPaymentMethodsInfo,
      buttonVariables,
      loggedIn,
      domainConfig,
      getAdminWhatsAppNumber,
      showWhatsapp,
      bonusTypes,
      selectedBonus,
      setSelectedBonus,
      pgProvider,
      getBonusTypes,
      langData,
    },
    hiddenFileInput
  ) => {
    const setBetAmount = (amount, type) => {
      if (
        type == "ADD" &&
        !(paymentDetails?.length && paymentDetails[0]?.payment_method)
      ) {
        setDepositAmount(String(+depositAmount + +amount));
      }
    };

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
                  disabled={bonusTypes ? true : false}
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
              {!bonusTypes && (
                <Button
                  className={
                    loading || !depositAmount
                      ? "submit-payment-btn submit-btn-disabled"
                      : "submit-payment-btn"
                  }
                  disabled={loading || !depositAmount ? true : false}
                  endIcon={loading ? <IonSpinner name="lines-small" /> : ""}
                  onClick={() => getBonusTypes(Number(depositAmount))}
                >
                  {langData?.["next"]}
                </Button>
              )}
              {bonusTypes && bonusTypes.length > 0 && (
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
              {!providerRefId && bonusTypes && (
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
                  <div className="bottom-buttons">
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

export default connect(mapStateToProps, null)(Xenonpayz);
