import React, { useEffect } from "react";
import LoginForm from "../../components/LoginForm/LoginForm";
import "./LoginPage.scss";
import { useHistory } from "react-router";
import { useDispatch } from "react-redux";
import { getEnvVariable } from "../../constants/whitelabelEnv";
import { domain } from "../../constants/Branding";
import Logo from "../../assets/images/theme/title.png";
import {
  isSiteUnderMaintenance,
  setMaintenanceTimer,
} from "../../store/common/commonActions";
const modalCloseHandler = () => {};

const LoginPage: React.FC = () => {
  const history = useHistory();

  return (
    <div className="login-ctn">
      <div className="title-row" onClick={() => history.push("/home")}>
        <img src={Logo} alt="website" className="logo" />
      </div>

      <div className="login-card">
        <LoginForm modalCloseHandler={modalCloseHandler} />
      </div>
    </div>
  );
};

export default LoginPage;
