import React from "react";
import { IonRow, IonCol } from "@ionic/react";
import { connect } from "react-redux";

import EventsTable from "../../components/ExchEventsTable/ExchEventsTable";
import ExchRaceTable from "../../components/ExchEventsTable/ExchRaceEventsTable";
import { RootState } from "../../models/RootState";
import { SelectedObj } from "../../models/ExchangeSportsState";
import "./ExchangeSportsHomeView.scss";
import PromotionSidebar from "../../components/ProviderSidebar/PromotionSidebar";
import TrendingGames from "../../components/ProviderSidebar/TrendingGames";
import { isMobile } from "react-device-detect";

type StoreProps = {
  loggedIn: boolean;
  selectedEventType: SelectedObj;
  langData: any;
};

const ExchSportsHome: React.FC<StoreProps> = (props) => {
  const { loggedIn, selectedEventType, langData } = props;
  return (
    <div>
      <IonRow className="sports-home-view">
        {/* <IonCol sizeLg='2.1' sizeMd='2' className="competitions-menu-section">
          <div className="sticky-col">
            <CompetitionsMenu />
          </div>
        </IonCol> */}
        <IonCol sizeLg="9.2" sizeMd="8.5" className="events-table-section">
          {!["7", "4339"].includes(selectedEventType.id) ? (
            <EventsTable loggedIn={loggedIn} />
          ) : (
            <ExchRaceTable loggedIn={loggedIn} />
          )}
        </IonCol>
        <IonCol
          sizeLg="2.8"
          sizeMd="3.5"
          className="exch-providers web-view pos-sticky-10"
        >
          {!isMobile && (
            <>
              <PromotionSidebar />
              <TrendingGames langData={langData} />
            </>
          )}
        </IonCol>
      </IonRow>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    loggedIn: state.auth.loggedIn,
    selectedEventType: state.exchangeSports.selectedEventType,
    langData: state.common.langData,
  };
};

export default connect(mapStateToProps)(ExchSportsHome);
