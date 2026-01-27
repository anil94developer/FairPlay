import { useFormik } from "formik";
import React, { lazy, useEffect, useState } from "react";

import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import { connect, useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation, useParams } from "react-router";
import * as Yup from "yup";
import { ReactComponent as MyProfileIcon } from "../../assets/images/MyProfileIcons/my_profile_icon.svg?react";
import ReportBackBtn from "../../common/ReportBackBtn/ReportBackBtn";
import ReportsHeader from "../../common/ReportsHeader/ReportsHeader";
import { RootState } from "../../models/RootState";
import { setAlertMsg } from "../../store/common/commonActions";
import SVLS_API from "../../svls-api";
import { notDemoUser } from "../../util/stringUtil";
import ChangePassword from "../ChangePassword/ChangePassword";
import PersonalInfo from "../PersonalInfo/PersonalInfo";
import Referral from "../Referral/Referral";
import RulesAndRegulationsNew from "../RulesAndRegulationsNew/RulesAndRegulationsNew";
import TwoFactorAuthTab from "../TwoFactorAuthTab/TwoFactorAuthTab";
import "./MyProfile.scss";
import {
  MPTabs,
  MPTabsEnum,
} from "./MyProfileSideBar/MyProfileComponents/Components";
import MyProfileSideBar from "./MyProfileSideBar/MyProfileSideBar";
import BonusRewards from "../BonusRewards/BonusRewards";
const Deposit = lazy(() => import("../../pages/Payment/Deposit"));
const Withdrawal = lazy(() => import("../../pages/Payment/Withdrawal"));

type ToastProps = {
  message: string;
  color: string;
  show: boolean;
};

type UpdateUserPersonalDetailsrequest = {
  fullName: string;
  phoneNumber: string;
  emailId: string;
  address: string;
  city: string;
  pinCode: string;
};

type UserPersonalDetails = UpdateUserPersonalDetailsrequest & {
  username: string;
};

type BonusAccount = {
  turnover: number;
  referred_by: string;
  referral_count: number;
  completed_referrals: number;
};

type RouteParams = {
  tab: string;
};

const MyProfile: React.FC<{ langData: any }> = (props) => {
  const { langData } = props;
  const history = useHistory();
  const location = useLocation();
  const { tab } = useParams<RouteParams>();
  const common = useSelector((state: RootState) => state.common);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<UserPersonalDetails>();
  const [toastDetails, setToastDetails] = useState<ToastProps>({
    message: "",
    color: "",
    show: false,
  });
  const [phoneUpdate, setPhoneUpdate] = useState<boolean>(false);
  const [tabValue, setTabValue] = useState<number>(
    tab === "deposit" ? 3 : tab === "bonus" ? 6 : 0
  );
  const [err, setErr] = useState<string>();
  const [showRRModal, setShowRRModal] = useState<boolean>(false);
  const [phone, setPhone] = useState<any>("");
  const [otpTimer, setOtpTimer] = useState<number>();
  const [otpEnterFields, setOtpEnterFields] = useState<boolean>(false);
  const [otpErrorMessage, setOtpErrorMessage] = useState<string>("");
  const [phoneNumbeErrorMsg, setPhoneNumbeErrorMsg] = useState<string>("");
  const [verificationErrorMsg, setVerificationErrorMsg] = useState<string>("");
  const [phoneNumberExists, setPhoneNumberExists] = useState<boolean>(false);
  const [country, setCountry] = useState<any>("");
  const [phoneFormat, setPhoneFormat] = useState<any>("");
  const [otp, setOtp] = useState<number>(null);
  const [referralCode, setReferralCode] = useState<string>();
  const [bonusAccount, setBonusAccount] = useState<BonusAccount>();
  const dispatch = useDispatch();
  const fetchData = async () => {
    setLoading(true);
    try {
      // Dummy data instead of API call
      const dummyUserDetails: UserPersonalDetails = {
        username: sessionStorage.getItem("username") || "dummyuser",
        fullName: "John Doe",
        phoneNumber: "+1234567890",
        emailId: "john.doe@example.com",
        address: "123 Main Street",
        city: "New York",
        pinCode: "10001",
      };

      setUserDetails(dummyUserDetails);
      // setPhone(response.data.phone);
    } catch (err) {
      setErr(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (userDetails?.phoneNumber) {
      setPhone(userDetails.phoneNumber);
    }
  }, [userDetails?.phoneNumber]);

  const phoneRegExp =
    /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
  const pinCodeRegex = /^[1-9][0-9]{5}$/;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      fullName: userDetails ? userDetails.fullName : "",
      phoneNumber: userDetails ? userDetails.phoneNumber : "",
      emailId: userDetails ? userDetails.emailId : "",
      address: userDetails ? userDetails.address : "",
      city: userDetails ? userDetails.city : "",
      pinCode: userDetails ? userDetails.pinCode : "",
    },
    validationSchema: Yup.object({
      phoneNumber: Yup.string().matches(
        phoneRegExp,
        langData?.["invalid_phone_no_txt"]
      ),
      pinCode: Yup.string().matches(
        pinCodeRegex,
        langData?.["invalid_pin_code_txt"]
      ),
    }),
    onSubmit: (values) => {
      let data: UpdateUserPersonalDetailsrequest = {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        emailId: values.emailId,
        address: values.address,
        city: values.city,
        pinCode: values.pinCode,
      };
      updateDetails(data);
    },
  });

  const updateDetails = async (data: UpdateUserPersonalDetailsrequest) => {
    try {
      setErr("");
      setProgress(true);
      const userName = sessionStorage.getItem("username");
      const response = await SVLS_API.put(
        `/account/v2/users/${userName}/profile`,
        data,
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
        }
      );
      if (response.status === 204) {
        setToastDetails({
          message: langData?.["details_saved_success_txt"],
          color: "success",
          show: true,
        });
      } else {
        setToastDetails({
          message: langData?.["details_save_failed_txt"],
          color: "danger",
          show: true,
        });
      }
      fetchData();
    } catch (err) {
      setErr(err?.response?.data?.message);
      setToastDetails({
        message: langData?.["details_save_failed_txt"],
        color: "danger",
        show: true,
      });
    } finally {
      setProgress(false);
    }
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

  const checkPhoneNumberExists = async (phoneNumber: string) => {
    if (phoneNumber === userDetails?.phoneNumber) {
      return;
    }
    try {
      const response: any = await SVLS_API.get(
        `/account/v2/users/phones/${phoneNumber}/:exists`
      );
      if (response.status === 200) {
        if (response.data === true) {
          setPhoneNumbeErrorMsg(langData?.["phone_number_exists_txt"]);
          setPhoneNumberExists(true);
        } else {
          setPhoneNumbeErrorMsg("");
          setPhoneNumberExists(false);
        }
      }
    } catch (err) {
      setPhoneNumbeErrorMsg(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const generateOtp = async () => {
    setPhoneNumbeErrorMsg("");
    const claims = sessionStorage.getItem("jwt_token").split(".")[1];
    const username = JSON.parse(window.atob(claims)).sub;
    try {
      const response: any = await SVLS_API.post(
        `/account/v2/otp/?mobileNumber=${phone}&username=${username}&otpType=UPDATE_PHONE_NUMBER`
      );
      if (response.status === 204) {
        handleOtpTimer(60);
        setPhoneUpdate(false);
        setOtpEnterFields(true);
      }
    } catch (err) {
      setPhoneNumbeErrorMsg(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const validateOtp = async () => {
    setVerificationErrorMsg("");
    try {
      if (country.format.length === phoneFormat.length) {
        const response: any = await SVLS_API.post(
          `/account/v2/otp/validate?mobileNumber=${phone}&otp=${otp}`,
          {}
        );
        if (response.status === 204 || response.status === 200) {
          setOtpErrorMessage("");
          updatePhoneNumber();
        }
      }
    } catch (err) {
      setVerificationErrorMsg(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePhoneNumber = async () => {
    setVerificationErrorMsg("");
    try {
      const claims = sessionStorage.getItem("jwt_token").split(".")[1];
      const username = JSON.parse(window.atob(claims)).sub;
      if (country.format.length === phoneFormat.length) {
        const response: any = await SVLS_API.put(
          `/account/v2/users/${username}/phoneNumber`,
          {
            phone_number: phone,
            otp: otp,
          },
          {
            headers: {
              Authorization: sessionStorage.getItem("jwt_token"),
            },
          }
        );
        if (response.status === 204 || response.status === 200) {
          setOtpErrorMessage("");
          dispatch(
            setAlertMsg({
              type: "success",
              message: langData?.["phone_no_update_success_txt"],
            })
          );
          setPhoneNumberExists(false);
          setOtpEnterFields(false);
          setPhoneUpdate(false);
        }
      }
    } catch (err) {
      setVerificationErrorMsg(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneUpdate = (flag: boolean) => {
    if (flag && !phoneUpdate && otpEnterFields) {
      setOtpEnterFields(false);
    }
    if (!flag) {
      setPhone(userDetails?.phoneNumber);
    }
    setPhoneUpdate(flag);
  };

  const fetchReferralCode = async () => {
    setLoading(true);
    try {
      // Dummy data instead of API call
      const dummyReferralCode = "REF123456";
      setReferralCode(dummyReferralCode);
      // setPhone(response.data.phone);
    } catch (err) {
      setErr(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBonusAccount = async () => {
    setLoading(true);
    try {
      // Dummy data instead of API call
      const dummyBonusAccount: BonusAccount = {
        turnover: 5000,
        referred_by: "REF123456",
        referral_count: 10,
        completed_referrals: 5,
      };

      setBonusAccount(dummyBonusAccount);
      // setPhone(response.data.phone);
    } catch (err) {
      setErr(err?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromSearch = params.get("tab");
    if (tabFromSearch) {
      const tabNumber = parseInt(tabFromSearch, 10);
      if (!isNaN(tabNumber) && tabNumber >= 0 && tabNumber <= 6) {
        setTabValue(tabNumber);
      }
    }
  }, [location.search]);

  useEffect(() => {
    if (
      country &&
      country?.dialCode &&
      phone &&
      phone?.length - country?.dialCode?.length + 1 > 10
    ) {
      checkPhoneNumberExists(phone);
    }
  }, [phone]);

  useEffect(() => {
    fetchReferralCode();
    fetchBonusAccount();
  }, []);

  useEffect(() => {
    if (tabValue === 2) {
      fetchData();
    }
  }, [tabValue]);

  const show = () => {
    switch (tabValue) {
      case 0:
        return <PersonalInfo langData={langData} />;
      case 1:
        return (
          <ChangePassword
            closeHandler={() => {}}
            backHandler={() => {}}
            langData={langData}
          />
        );
      case 2:
        return (
          <TwoFactorAuthTab userDetails={userDetails} langData={langData} />
        );
      case 3:
        return <Deposit />;
      case 4:
        return <Withdrawal />;
      case 5:
        return <Referral langData={langData} />;
      case 6:
        return <BonusRewards />;
    }
  };

  const handleSelectionChange = (label) => {
    let tab = 0;
    switch (label) {
      case MPTabsEnum.PERSONAL_INFO:
        tab = 0;
        break;
      case MPTabsEnum.CHANGE_PASSWORD:
        tab = 1;
        break;
      case MPTabsEnum.TWO_FACTOR_AUTH:
        tab = 2;
        break;
      case MPTabsEnum.DEPOSIT:
        tab = 3;
        break;
      case MPTabsEnum.WITHDRAW:
        tab = 4;
        break;
      case MPTabsEnum.REFFERAL:
        tab = 5;
        break;
      case MPTabsEnum.Bonus:
        tab = 6;
        break;
    }
    setTabValue(tab);
  };

  return (
    <div className="support-container mp-container">
      <div className="mp-page">
        <ReportBackBtn back={langData?.["back"]} />
        <Dialog
          open={showRRModal}
          onClose={() => setShowRRModal(false)}
          aria-labelledby="Settlements Dialog"
          fullScreen={false}
          fullWidth={true}
          maxWidth="md"
          className="stl-dialog rules-dialog"
        >
          <DialogTitle className="stl-dialog-title">
            <div className="title-close-icon">
              <div className="modal-title notification-title">
                {langData?.["rules_and_regulation_txt"]}
              </div>
              <IconButton
                className="close-btn"
                onClick={() => setShowRRModal(false)}
              >
                <CloseIcon className="close-icon" />
              </IconButton>
            </div>
          </DialogTitle>

          <DialogContent className="stl-dialog-content">
            <RulesAndRegulationsNew />
          </DialogContent>
        </Dialog>
        <div className="mp-ctn">
          <MyProfileSideBar
            onSelect={handleSelectionChange}
            tabValue={tabValue}
            className="web-view"
            langData={langData}
          />

          <div className="mp-sub-ctn">
            <ReportsHeader
              titleIcon={MyProfileIcon}
              reportName={langData?.["my_profile"]}
              reportFilters={[]}
            />
            {show()}

            <div className="profile-footer">
              <div className="mp-bottom-tabs mob-view">
                <MPTabs
                  onChange={(label) => {
                    handleSelectionChange(label);
                  }}
                  tabValue={tabValue}
                  langData={langData}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    langData: state.common.langData,
  };
};

export default connect(mapStateToProps, null)(MyProfile);
