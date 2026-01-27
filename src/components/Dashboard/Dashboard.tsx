import { IonCol, IonIcon, IonRow } from "@ionic/react";
import Backdrop from "@material-ui/core/Backdrop";
import Button from "@material-ui/core/Button";
import React, { useState } from "react";
import { connect } from "react-redux";
import { NavLink, useHistory } from "react-router-dom";
import { ReactComponent as AccStmtImg } from "../../assets/images/sidebar/account_statement.svg?react";
import { ReactComponent as DepositImg } from "../../assets/images/sidebar/deposit.svg?react";
import { ReactComponent as LogoutImg } from "../../assets/images/sidebar/logout.svg?react";
import { ReactComponent as MyBetsImg } from "../../assets/images/sidebar/my_bets.svg?react";
import { ReactComponent as ProfileImg } from "../../assets/images/sidebar/my_profile.svg?react";
import { ReactComponent as TransactionImg } from "../../assets/images/sidebar/my_transaction.svg?react";
import { ReactComponent as ProfitLossImg } from "../../assets/images/sidebar/profit_loss.svg?react";
import { ReactComponent as StakeImg } from "../../assets/images/sidebar/stake_settings.svg?react";
import { ReactComponent as TurnoverImg } from "../../assets/images/sidebar/turnover_history.svg?react";
import { ReactComponent as WithdrawImg } from "../../assets/images/sidebar/withdraw.svg?react";
import { RootState } from "../../models/RootState";
import "./Dashboard.scss";

import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { DomainConfig } from "../../models/DomainConfig";
import { getCurrencyTypeFromToken, logout } from "../../store";
import { notDemoUser } from "../../util/stringUtil";
import ChangePassword from "../ChangePassword/ChangePassword";
import Modal from "../Modal/Modal";

type StoreProps = {
  balance: number;
  exposure: number;
  bonus: number;
  allowedConfig: number;
  commissionEnabled: boolean;
  logout: () => void;
  domainConfig: DomainConfig;
  langData: any;
};

const DashboardView: React.FC<StoreProps> = (props) => {
  const history = useHistory();
  const {
    balance,
    allowedConfig,
    domainConfig,
    logout,
    exposure,
    bonus,
    langData,
  } = props;
  const [changePwdMOdal, setChangePwdMOdal] = useState<boolean>(false);
  const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];

  const dashboardPreferences = [
    {
      key: "deposit",
      name: "Deposit",
      langKey: "deposit",
      imgSrc: DepositImg,
      url: "/transaction/deposit",
      cond: domainConfig.payments && domainConfig.b2cEnabled && notDemoUser(),
    },
    {
      key: "withdraw",
      name: "Withdraw",
      langKey: "withdraw",
      imgSrc: WithdrawImg,
      url: "/transaction/withdraw",
      cond: domainConfig.payments && domainConfig.b2cEnabled && notDemoUser(),
    },
    {
      key: "my-bets",
      name: "My Bets",
      langKey: "my_bets",
      imgSrc: MyBetsImg,
      url: "my_bets",
      cond: true,
    },
    {
      key: "acc-stmt",
      name: "Account Statement",
      langKey: "account_statement",
      imgSrc: AccStmtImg,
      url: "/account_statement",
      cond: true,
    },
    {
      key: "pl-stmt",
      name: "P/L Statement",
      langKey: "pl_statement",
      imgSrc: ProfitLossImg,
      url: "/pl_statement",
      cond: true,
    },
    {
      key: "my-transactions",
      name: "My Transactions",
      langKey: "my_txns",
      imgSrc: TransactionImg,
      url: "/my_transactions",
      cond: domainConfig.payments && notDemoUser(),
    },
    // {
    //   key: 'commission-report',
    //   name: 'Commission Report',
    //   imgSrc: MyWalletImg,
    //   url: '/commission_report:upline',
    //   cond: (allowedConfig & CONFIG_PERMISSIONS.sports) !== 0,
    // },
    {
      key: "turnover-history",
      name: "Turnover history",
      langKey: "turnover_history",
      imgSrc: TurnoverImg,
      url: "/bonus/turnover_history",
      cond: notDemoUser() && domainConfig.bonus && domainConfig.b2cEnabled,
    },
    {
      key: "deposit-turnover",
      name: "Deposit Turnover",
      langKey: "deposit_turnover",
      imgSrc: TurnoverImg,
      url: "/deposit-turnover",
      cond: notDemoUser() && domainConfig.bonus && domainConfig.b2cEnabled,
    },
    {
      key: "set-btn-vars",
      name: "Stake Settings",
      langKey: "stake_settings",
      imgSrc: StakeImg,
      url: "/set-button-variables",
      cond: true,
    },
    {
      key: "change-password",
      name: "Change Password",
      langKey: "change_password_txt",
      imgSrc: StakeImg,
      url: "/change-password",
      cond: notDemoUser(),
    },
  ];

  return (
    <div className="dashboard-ctn">
      <div className="header-content">
        <div className="user-details-section">
          <div className="user-balance">
            <div>{langData?.["available_balance"]}</div>
            <div>
              {(() => {
                if (balance === null || balance === undefined || !cFactor || cFactor === 0) {
                  return "0.00";
                }
                const result = Number(balance) / Number(cFactor);
                return isNaN(result) || !isFinite(result) ? "0.00" : result.toFixed(2);
              })()}
            </div>
          </div>
        </div>
      </div>
      <div className="header-content-ctn">
        <div
          className={`exposure-credit ${
            domainConfig.b2cEnabled && domainConfig.bonus ? "" : "b2c-enabled"
          }`}
        >
          <div className="header-amount">{exposure?.toFixed(2)}</div>
          <div className="header-content-text">
            {langData?.["exposure_credited"]}
          </div>
        </div>
        {domainConfig.b2cEnabled && domainConfig.bonus && (
          <div className="bonus-credit">
            <div className="header-amount">{bonus?.toFixed(2)}</div>
            <div className="header-content-text">
              {langData?.["bonus_rewarded"]}
            </div>
          </div>
        )}
      </div>

      <div className="reports-header">{langData?.["reports_menu"]}</div>
      <IonRow className="dashboard-cards-ctn">
        {dashboardPreferences.map(
          (item) =>
            item.cond && (
              <IonCol
                className="dashboard-item"
                key={item.key}
                sizeXs="6"
                sizeSm="6"
                sizeMd="3"
              >
                <NavLink to={item.url} className="dashboard-item-link">
                  <item.imgSrc className="dashboard-item-icon" />
                  <span className="dashboard-item-text">
                    {langData?.[item.langKey]}
                  </span>
                </NavLink>
              </IonCol>
            )
        )}

        {notDemoUser() && (
          <IonCol
            className="dashboard-item"
            key={"profile"}
            sizeXs="6"
            sizeSm="6"
            sizeMd="3"
          >
            <NavLink to={`/profile`} className="dashboard-item-link">
              <ProfileImg className="dashboard-item-icon sport-icon" />
              <span className="dashboard-item-text">
                {langData?.["my_profile"]}
              </span>
            </NavLink>
          </IonCol>
        )}

        <IonCol
          className="dashboard-item"
          key={"signout"}
          sizeXs="12"
          sizeSm="12"
          sizeMd="12"
        >
          <Button className="dashboard-sign-out-btn" onClick={() => logout()}>
            <LogoutImg className="dashboard-sign-out-logo" />
            <span className="dashboard-item-text logout-text">
              {langData?.["logout"]}
            </span>
          </Button>
        </IonCol>
      </IonRow>
      <div className="logout-item-row"></div>
      <Backdrop className="backdrop-ctn" open={changePwdMOdal}>
        <Modal
          open={changePwdMOdal}
          closeHandler={() => setChangePwdMOdal(false)}
          title={langData?.["change_password_txt"]}
          size="xs"
        >
          <ChangePassword
            closeHandler={() => setChangePwdMOdal(false)}
            backHandler={() => {}}
            langData={langData}
          />
        </Modal>
      </Backdrop>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    balance: state.auth.balanceSummary.balance,
    exposure: state.auth.balanceSummary.exposure,
    bonus: state.auth.balanceSummary.bonus,
    allowedConfig: state.common.allowedConfig,
    commissionEnabled: state.common.commissionEnabled,
    domainConfig: state.common.domainConfig,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    logout: () => dispatch(logout()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardView);
