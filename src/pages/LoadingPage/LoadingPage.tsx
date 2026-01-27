import { IonSpinner } from "@ionic/react";
import React from "react";
import "./LoadingPage.scss";

const LoadingPage: React.FC = () => {
  return (
    <div className="loading-page-ctn">
      <div className="item-row">
        {/* <img src={TitleImg} className="title-img" alt={BRAND_NAME} /> */}
      </div>
      <div className="item-row">
        <IonSpinner className="loading-page-spinner" name="bubbles" />
      </div>
    </div>
  );
};

export default LoadingPage;
