import React from "react";
import { useHistory } from "react-router";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import "./ReportBackBtn.scss";
import { useWindowSize } from "../../hooks/useWindowSize";

const ReportBackBtn = ({ back }) => {
  const history = useHistory();
  const windowSize = useWindowSize();

  return (
    windowSize.width < 720 && (
      <button onClick={() => history.goBack()} className="rbb-btn">
        <ArrowBackIosIcon className="rbb-icon" />
        <div className="rbb-btn-text">{back}</div>
      </button>
    )
  );
};

export default React.memo(ReportBackBtn);
