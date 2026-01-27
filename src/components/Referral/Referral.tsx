import React, { useEffect, useState } from "react";

import CopyIcon from "../../assets/images/MyProfileIcons/copy_icon.svg";
import { BRAND_DOMAIN } from "../../constants/Branding";
import SVLS_API from "../../svls-api";
import SocialMediaNew from "../SocialMediaNew/SocialMediaNew";
import "./Referral.scss";
import { useDispatch } from "react-redux";
import { setAlertMsg } from "../../store/common/commonActions";

const Referral: React.FC<{ langData: any }> = (props) => {
  const { langData } = props;
  const [referralCode, setReferralCode] = useState<string>();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchReferralCode();
  }, []);

  const generateRefLink = () => {
    let link = `${window.location.hostname}/register?refCode=${referralCode}`;
    navigator.clipboard.writeText(link);
    dispatch(
      setAlertMsg({
        type: "success",
        message: langData?.["referral_link_copied_txt"],
      })
    );
  };

  const fetchReferralCode = async () => {
    try {
      // Dummy data instead of API call
      const dummyReferralCode = "REF123456";
      setReferralCode(dummyReferralCode);
    } catch (err) {
      console.log(err?.response?.data?.message);
    }
  };

  return (
    <div className="referral-ctn">
      <h3 className="r-text1">{langData?.["refer_and_earn_txt"]}:</h3>
      <div className="social-media-referral">
        <SocialMediaNew />
      </div>
      <h6 className="r-text2">
        <span>{langData?.["invite_referral_txt"]}</span>
      </h6>
      <h3 className="r-text3">{langData?.["copy_codes_and_share_txt"]}:</h3>
      <div className="r-referral-code">
        <h3 className="r-text4">
          <div>{langData?.["signup_code_txt"]}</div>
          <div className="underline">{`https://${BRAND_DOMAIN}`}</div>
        </h3>
        <div className="r-copy-btn-div" onClick={() => generateRefLink()}>
          <img src={CopyIcon} alt="" className="r-copy-btn" height={28} />
        </div>
      </div>
    </div>
  );
};

export default Referral;
