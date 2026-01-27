import React from "react";

type Props = {
  langData: any;
};

const AffiliateOverview = (props: Props) => {
  const { langData } = props;

  return (
    <div className="affiliate-overview-ctn">
      <div className="col-1">
        <div className="affiliate-overview-title">
          {langData?.["affiliate_program_header_txt"]}
        </div>
        <div className="affiliate-overview-video-ctn"></div>
        <p className="affiliate-overview-desc">
          {langData?.["invite_referral_txt"]}
        </p>
      </div>

      <div className="col-2 web-view"></div>
    </div>
  );
};

export default AffiliateOverview;
