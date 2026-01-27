import React from "react";
import "./AccessRedirect.scss";
import { RootState } from "../../models/RootState";
import { connect } from "react-redux";

const AccessRedirect: React.FC<{ langData: any }> = (props) => {
  const { langData } = props;

  return (
    <>
      <div className="ion-page access-redirect-page">
        {langData?.["access_redirect_txt"]}
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    langData: state.common.langData,
  };
};

export default connect(mapStateToProps, null)(AccessRedirect);
