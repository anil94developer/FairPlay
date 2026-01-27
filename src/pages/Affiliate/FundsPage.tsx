import React, { useEffect, useState } from "react";
import CustomTable from "../../common/CustomTable/CustomTable";
import CustomButton from "../../common/CustomButton/CustomButton";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import CloseIcon from "@material-ui/icons/Close";
import CustomModalBtns from "../../common/CustomButton/CustomModalBtn";
import InputTemplate from "../../common/InputTemplate/InputTemplate";
import Drawer from "@material-ui/core/Drawer";
import SVLS_API from "../../api-services/svls-api";
import { CampaignInfoDataType } from "./affiliate.utils";
import { useDispatch } from "react-redux";
import { setAlertMsg } from "../../store/common/commonActions";
import { Button } from "@material-ui/core";
import { IonSpinner } from "@ionic/react";

const headerParams = [
  {
    label: "AVAILABLE",
    langKey: "available_caps",
    param: "availableCommission",
    widthInPercent: 33.33,
  },
  {
    label: "COMMISSION",
    langKey: "commission_caps",
    param: "totalCommission",
    widthInPercent: 33.33,
  },
  {
    label: "WITHDRAW",
    langKey: "withdraw_caps",
    param: "withdraw",
    widthInPercent: 33.33,
  },
];

interface WithdrawCommissionFormComponentProps {
  handleModalClose: () => void;
  withdrawAmount: number;
  setWithdrawAmount: (amount: number) => void;
  handleWithdrawAmount: () => void;
  langData: any;
}

interface FundsReportProps {
  isMobile: boolean;
  campaignDetails: CampaignInfoDataType;
  getCampaignDetails: () => void;
  langData: any;
}

const WithdrawCommissionFormComponent: React.FC<
  WithdrawCommissionFormComponentProps
> = ({
  handleModalClose,
  setWithdrawAmount,
  withdrawAmount,
  handleWithdrawAmount,
  langData,
}) => {
  return (
    <div className="dialog-content">
      <div className="dialog-title-ctn">
        <div className="dialog-title">{langData?.["withdraw_commission"]}</div>
        <div onClick={handleModalClose} className="close-icon-ctn">
          <CloseIcon className="close-icon" />
        </div>
      </div>
      <div className="dialog-form">
        <InputTemplate
          label={langData?.["withdraw_amount"]}
          value={withdrawAmount}
          placeholder={"enter"}
          onChange={(text) => setWithdrawAmount(text)}
          customInputClassName="affiliate-input"
          customInputCtnClassName="affiliate-input-ctn"
        />
      </div>

      <CustomModalBtns
        hideLeftBtn
        rightBtnTitle={langData?.["withdraw"]}
        rightBtnOnPress={handleWithdrawAmount}
        rightBtnDisabled={!withdrawAmount}
      />
    </div>
  );
};

const FundsReport: React.FC<FundsReportProps> = ({
  isMobile,
  campaignDetails,
  getCampaignDetails,
  langData,
}) => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);

  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>();
  const [otpTimer, setOtpTimer] = useState<number>();

  const calcWithdrawAmount =
    +campaignDetails.totalCommission - +campaignDetails.availableCommission;
  const availableWithdrawAmount =
    calcWithdrawAmount < 0 ? 0 : calcWithdrawAmount;

  const tableData = [
    {
      totalCommission: `${campaignDetails.totalCommission}`,
      availableCommission: `${campaignDetails.availableCommission}`,
      withdraw: `${availableWithdrawAmount}`,
    },
  ];

  const handleFundsWithdraw = () => {
    if (+campaignDetails.availableCommission > 0) {
      requestCommissionWithdraw();
    } else {
      dispatch(
        setAlertMsg({
          type: "error",
          message: langData?.["minimum_commission_txt"],
        })
      );
    }
  };

  const closeModal = () => {
    setWithdrawModalOpen(false);
    setWithdrawAmount(null);
  };

  const handleOtpTimer = (time) => {
    if (time >= 0) {
      setOtpTimer(time);
      setTimeout(() => {
        handleOtpTimer(time - 1);
      }, 1000);
    } else {
      setTimeout(() => {
        setOtpTimer(undefined);
      }, 1000);
    }
  };

  useEffect(() => {
    if (campaignDetails.lastTxnTime) {
      const currentTime = Date.now();
      const remainingTime = campaignDetails.lastTxnTime - currentTime;
      // const commissionRetryWindow = 24 * 3600 * 1000;

      if (remainingTime > 0) {
        handleOtpTimer((remainingTime / 1000).toFixed(0));
      }
    }
  }, []);

  const requestCommissionWithdraw = async () => {
    try {
      setLoading(true);
      // Replaced API call with dummy logic - simulate successful withdrawal
      setLoading(false);

      dispatch(
        setAlertMsg({
          type: "success",
          message: langData?.["withdraw_complete_success"],
        })
      );
      closeModal();
      getCampaignDetails();
    } catch (e) {
      setLoading(false);
      handleOtpTimer(60);
      let errorMsg: string = e.response?.data?.message;
      dispatch(
        setAlertMsg({
          type: "warning",
          message:
            e.message == "Network Error"
              ? "Please wait for a few minutes and try again.. only try to process one request at a time"
              : errorMsg?.includes("Insufficient funds")
              ? "Something went wrong, please contact support"
              : errorMsg,
        })
      );
    }
  };

  function formatTime(otpTimer) {
    let hours = Math.floor(otpTimer / 3600);
    let minutes = Math.floor((otpTimer % 3600) / 60);
    let seconds = otpTimer % 60;

    if (hours > 0) {
      return `${hours} hrs ${minutes} mins ${seconds} secs`;
    } else if (minutes > 0) {
      return `${minutes} mins ${seconds} secs`;
    } else {
      return `${seconds} secs`;
    }
  }

  return (
    <div>
      <div className="disclaimer-msg">
        <b>
          {`${langData?.["note"]} : ${langData?.["commission_withdraw_msg"]}`}
        </b>
      </div>
      <CustomTable
        headerParams={headerParams}
        bodyData={tableData}
        langData={langData}
      />

      <div className="withdraw-btn-ctn">
        <Button
          className="cb cb-variant-1"
          endIcon={loading ? <IonSpinner name="lines-small" /> : ""}
          onClick={handleFundsWithdraw}
          disabled={loading || otpTimer >= 0}
        >
          {langData?.["withdraw_available_commission"]}
        </Button>
        <span className="resend-msg">
          {otpTimer >= 0 ? `Try again in ${formatTime(otpTimer)}` : null}
        </span>
      </div>

      <Dialog open={!isMobile && withdrawModalOpen} onClose={closeModal}>
        <DialogContent>
          <WithdrawCommissionFormComponent
            handleModalClose={closeModal}
            setWithdrawAmount={setWithdrawAmount}
            withdrawAmount={withdrawAmount}
            handleWithdrawAmount={requestCommissionWithdraw}
            langData={langData}
          />
        </DialogContent>
      </Dialog>

      <Drawer
        anchor={"bottom"}
        open={isMobile && withdrawModalOpen}
        onClose={closeModal}
        className="light-bg-title game-rules-drawer mob-view"
        title={langData?.["rules"]}
      >
        <WithdrawCommissionFormComponent
          handleModalClose={closeModal}
          setWithdrawAmount={setWithdrawAmount}
          withdrawAmount={withdrawAmount}
          handleWithdrawAmount={requestCommissionWithdraw}
          langData={langData}
        />
      </Drawer>
    </div>
  );
};

export default FundsReport;
