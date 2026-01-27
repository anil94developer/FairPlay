import React from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { isMobile } from "react-device-detect";
import { useHistory } from "react-router";
import "./CheckBonusTab.scss";

const CheckBonusTab = ({ loggedIn, langData, bonusEnabled }) => {
  const hostory = useHistory();

  const redierectToBonusPage = () => {
    hostory.push("/profile/bonus");
  };

  return (
    isMobile &&
    bonusEnabled &&
    loggedIn && (
      <div className="check-bonus-tab">
        <div className="bonus-content">
          <p className="bonus-msg">{langData?.["check_bonus"]} 💰😍</p>
          <button
            onClick={() => redierectToBonusPage()}
            className="check-bonus-btn check-bt-blink-animation"
          >
            {langData?.["claim_now"]}
          </button>
        </div>
      </div>
    )
  );
};

export default CheckBonusTab;
