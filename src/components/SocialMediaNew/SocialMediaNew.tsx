import React from "react";
import Telegram from "../../assets/images/footer/Vector (2).svg";
import Facebook from "../../assets/images/footer/facebook-svgrepo-com 1.svg";
import Whatsapp from "../../assets/images/footer/whatsapp.svg";
import "./SocialMediaNew.scss";
import { RootState } from "../../models/RootState";
import { connect } from "react-redux";
import { DomainConfig } from "../../models/DomainConfig";

const ICON_MAP: Record<string, string> = {
  Whatsapp,
  Telegram,
  Facebook,
  Gmail: Whatsapp, // fallback icon for Gmail
};

type StoreProps = {
  langData?: any;
  domainConfig: DomainConfig;
  socialMediaContent: Record<string, { title: string; url: string; is_active: boolean; image_url: string }> | null;
};

const SocialMedia: React.FC<StoreProps> = (props) => {
  const { socialMediaContent } = props;
  const items = socialMediaContent
    ? Object.entries(socialMediaContent).filter(
        ([_, v]) => v?.is_active === true && v?.url
      )
    : [];

  if (items.length === 0) return null;

  return (
    <div className="sm-new-ctn">
      <div className="sm-new-links">
        {items.map(([key, item]) => (
          <button
            key={key}
            className="sm-new-link"
            onClick={() => window.open(item.url, "_blank")}
          >
            <img
              src={ICON_MAP[key] || Whatsapp}
              alt={item.title}
              className="sm-new-img"
            />
            <div className="sm-text">{item.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    langData: state.common.langData,
    domainConfig: state.common.domainConfig,
    socialMediaContent: state.common.socialMediaContent,
  };
};

export default connect(mapStateToProps)(SocialMedia);
