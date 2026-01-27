import React from "react";
import { connect } from "react-redux";
import Dashboard from "../../components/Dashboard/Dashboard";
import { RootState } from "../../models/RootState";
import "./DashboardView.scss";
import LoginRequired from "../../assets/images/no_login_img.svg";
import NoDataComponent from "../../common/NoDataComponent/NoDataComponent";
import { useHistory } from "react-router";

type StoreProps = {
  loggedIn: boolean;
  langData: any;
};

const DashboardView: React.FC<StoreProps> = (props) => {
  const { loggedIn, langData } = props;
  const history = useHistory();
  return (
    <div
      className={
        loggedIn ? "dashboard-view-ctn" : "dashboard-view-ctn not-logged-in"
      }
    >
      {!loggedIn ? (
        <NoDataComponent
          title={langData?.["login_required"]}
          bodyContent={langData?.["login_required_txt"]}
          noDataImg={LoginRequired}
          buttonProps={{
            text: "login",
            onClick: () => {
              history.push("/login");
            },
          }}
        />
      ) : (
        <Dashboard langData={langData} />
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    loggedIn: state.auth.loggedIn,
    langData: state.common.langData,
  };
};

export default connect(mapStateToProps)(DashboardView);
