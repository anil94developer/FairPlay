import React from "react";
import Button from "@material-ui/core/Button";
import "./CustomButton.scss";

interface CustomModalBtnProps {
  leftBtnTitle?: string;
  rightBtnTitle: string;
  leftBtnOnPress?: () => void;
  rightBtnOnPress?: () => void;
  rightBtnDisabled?: boolean;
  hideLeftBtn?: boolean;
  hideRightBtn?: boolean;
}

const CustomModalBtns: React.FC<CustomModalBtnProps> = ({
  leftBtnOnPress,
  leftBtnTitle,
  rightBtnOnPress,
  rightBtnTitle,
  rightBtnDisabled,
  hideLeftBtn,
  hideRightBtn,
}) => {
  return (
    <div className="dialog-footer">
      {!hideLeftBtn && (
        <Button
          color="primary"
          className="footer-action-btn"
          onClick={leftBtnOnPress}
        >
          {leftBtnTitle}
        </Button>
      )}
      {!hideRightBtn && (
        <Button
          disabled={rightBtnDisabled}
          color="primary"
          className="footer-action-btn withdraw-yes-btn"
          onClick={rightBtnOnPress}
        >
          {rightBtnTitle}
        </Button>
      )}
    </div>
  );
};

export default CustomModalBtns;
