import React from "react";
import "./NoDataComponent.scss";
import CustomButton, { ButtonProps } from "../CustomButton/CustomButton";

type Props = {
  title: string;
  bodyContent: string;
  noDataImg: any;
  buttonProps?: ButtonProps;
};

const NoDataComponent = (props: Props) => {
  const { title, bodyContent, noDataImg, buttonProps } = props;

  const handleClick = () => {
    buttonProps.onClick();
  };

  return (
    <div className="nd-ctn">
      <div className="nd-sub-ctn">
        {noDataImg && (
          <div className="nd-img">
            <img src={noDataImg} alt="" />
          </div>
        )}
        <div className="nd-title">{title}</div>
        <div className="nd-bc">{bodyContent}</div>
        {buttonProps && (
          <CustomButton
            text={buttonProps.text}
            onClick={handleClick}
            variant={2}
          />
        )}
      </div>
    </div>
  );
};

export default NoDataComponent;
