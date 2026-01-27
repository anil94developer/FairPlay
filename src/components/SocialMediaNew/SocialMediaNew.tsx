import React, { useEffect, useState } from "react";
import Telegram from "../../assets/images/footer/Vector (2).svg";
import Instagram from "../../assets/images/footer/Vector (4).svg";
import Facebook from "../../assets/images/footer/facebook-svgrepo-com 1.svg";
import Whatsapp from "../../assets/images/footer/whatsapp.svg";
import Twitter from "../../assets/images/footer/twitter 1.svg";
import "./SocialMediaNew.scss";
import { RootState } from "../../models/RootState";
import { connect } from "react-redux";
import { DomainConfig } from "../../models/DomainConfig";

type StoreProps = {
  langData?: any;
  domainConfig: DomainConfig;
};

const SocialMedia: React.FC<StoreProps> = (props) => {
  const { langData, domainConfig } = props;
  const [contactData, setContactData] = useState<any[]>([]);

  const socialMediaAndSiteName = {
    FACEBOOK_LINK: Facebook,
    TELEGRAM_NUMBER: Telegram,
    INSTAGRAM_LINK: Instagram,
    TWITTER_LINK: Twitter,

    // Skype is being used for whatsapp
    SKYPE_LINK: Whatsapp,
  };

  const socialMediaAndSiteNames = {
    FACEBOOK_LINK: "Facebook",
    TELEGRAM_NUMBER: "Telegram",
    INSTAGRAM_LINK: "Instagram",
    TWITTER_LINK: "Twitter",

    // Skype is being used for whatsapp
    SKYPE_LINK: "Whatsapp",
  };

  const redirectToLink = (linkDetails) => {
    window.open(getLinkDetails(linkDetails), "_blank");
  };

  const getLinkDetails = (linkDetails) => {
    return (
      socialMediaAndSiteName[linkDetails.contactType] && linkDetails.details
    );
  };

  useEffect(() => {
    // getContactDetails();
    setContactData(domainConfig.suppportContacts);
  }, [domainConfig?.suppportContacts]);

  return (
    <div className="sm-new-ctn">
      {/* <div className="sm-new-text">stay connected with us</div> */}
      <div className="sm-new-links">
        {/* {contactData?.map(
          (link) =>
            getLinkDetails(link) && ( */}
        <button
          className="sm-new-link"
          // onClick={() => redirectToLink(link)}
        >
          <img src={Whatsapp} alt="Social Icon" className="sm-new-img" />
          <div className="sm-text">Follow on Whatsapp</div>
        </button>
        {/* )
        )} */}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    langData: state.common.langData,
    domainConfig: state.common.domainConfig,
  };
};

export default connect(mapStateToProps)(SocialMedia);
