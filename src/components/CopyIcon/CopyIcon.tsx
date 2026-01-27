import React from "react";
import CopyIcon from "../../assets/images/MyProfileIcons/copy_icon.svg";
import { useDispatch } from "react-redux";
import { setAlertMsg } from "../../store/common/commonActions";

interface AppCopyIconProps {
  copyText: string;
}

const AppCopyIcon: React.FC<AppCopyIconProps> = ({ copyText }) => {
  const dispatch = useDispatch();

  const handleTextCopy = () => {
    navigator.clipboard.writeText(copyText);
    dispatch(
      setAlertMsg({
        type: "success",
        message: "Referral link copied!",
      })
    );
  };

  return (
    <div className="r-copy-btn-div" onClick={handleTextCopy}>
      <img src={CopyIcon} alt="" className="r-copy-btn" height={28} />
    </div>
  );
};

export default AppCopyIcon;
