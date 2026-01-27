import React, { useEffect, useState } from "react";
import "./BottomTab.scss";
import SVLS_API from "../../svls-api";
import { BRAND_DOMAIN, BRAND_NAME } from "../../constants/Branding";
import { ReactComponent as WhatsApp } from "../../assets/images/footer/whatsapp.svg?react";
import Secure from "../../assets/images/footer/secure.png";
import GamCare from "../../assets/images/footer/Gamcare.png";
import plus18 from "../../assets/images/footer/18plus.png";

import { connect } from "react-redux";
import { RootState } from "../../models/RootState";
import { demoUser } from "../../util/stringUtil";
import { setDemoUserWhatsappDetails } from "../../store/common/commonActions";
import CustomTelegramSvg from "../../common/CustomSocialmediaIcons/CustomTelegramSvg";
import CustomInstagramSvg from "../../common/CustomSocialmediaIcons/CustomInstagramSvg";

const BottomTab = ({
  langData,
  supportContacts,
  whatsappDetails,
  domainConfig,
  setDemoUserWhatsappDetails,
}) => {
  const [telegramLink, setTelegramLink] = useState("");
  const [instagramLink, setInstagramLink] = useState("");

  useEffect(() => {
    supportContacts?.forEach((ct) => {
      if (ct.contactType === "TELEGRAM_NUMBER") {
        console.log("TELEGRAM_NUMBER", ct.details);
        setTelegramLink(ct.details);
      } else if (ct.contactType === "INSTAGRAM_LINK") {
        console.log("INSTAGRAM_LINK", ct.details);
        setInstagramLink(ct.details);
      } else if (ct.contactType === "REGISTRATION_WHATSAPP_LINK") {
        console.log("REGISTRATION_WHATSAPP_LINK", ct.details);
        setDemoUserWhatsappDetails(ct.details);
      }
    });
  }, [domainConfig]);

  return (
    <div className="bottom-tab">
      <div className="support">
        <span className="help-msg">
          Need help? Our 24/7 support team is here for you anytime!
        </span>
        <div className="social-icons">
          {telegramLink && (
            <button
              className="sm-link wp-svg"
              onClick={() => window.open(telegramLink, "_blank")}
            >
              <CustomTelegramSvg />
            </button>
          )}

          {instagramLink && (
            <button
              className="sm-link wp-svg"
              onClick={() => window.open(instagramLink, "_blank")}
            >
              <CustomInstagramSvg />
            </button>
          )}

          <button className="sm-link">
            <WhatsApp width={20} height={20} className="wp-svg" />
          </button>
        </div>
      </div>

      <div className="secure">
        <img src={Secure} className="secure-img" alt="Secure" />
        <div className="safe-msgs">
          <span className="safe safe1">100% Safe</span>
          <span className="safe safe2">
            Your data is safe with encrypted protection. Enjoy a secure and
            private connection.
          </span>
        </div>
      </div>

      <div className="line"></div>

      <div className="copyright">
        <div className="copyright-msgs">
          <span className="cpr msg1">
            {BRAND_NAME} provides a smooth and secure betting experience with a
            variety of reliable payment options. Whether you’re placing bets on
            casino games or sports, our platform ensures quick and hassle-free
            transactions. Enjoy the convenience of seamless deposits and
            withdrawals, and focus on the thrill of the game.
          </span>
          <span className="cpr msg2">
            © Copyright 2024. All Rights Reserved. Powered by {BRAND_NAME}.
          </span>
        </div>
        <div className="copyright-imgs">
          <img src={GamCare} className="copyright-img" alt="GamCare" />
          <img src={plus18} className="copyright-img" alt="18+" />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    domainConfig: state.common.domainConfig,
    whatsappDetails: demoUser()
      ? state.common.demoUserWhatsappDetails
      : state.common.whatsappDetails,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    setDemoUserWhatsappDetails: (details: string) =>
      dispatch(setDemoUserWhatsappDetails(details)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(BottomTab);
