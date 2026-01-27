import {
  IonList,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonTitle,
} from "@ionic/react";
import React, { useState } from "react";
import { Route, useRouteMatch, Redirect, NavLink } from "react-router-dom";
import { Switch } from "react-router";
import BottomNavigation from "@material-ui/core/BottomNavigation";
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction";

import { useHistory } from "react-router-dom";

import { SPORTSBOOK_SPORTS, STUDIO_SPORTS } from "../../constants/FooterView";
import SportRules from "../../components/SportRules/SportRules";
import "./RulesAndRegulations.scss";

const RulesAndRegulations: React.FC = () => {
  const { path } = useRouteMatch();
  const [pointsType, setPointsType] = useState<string>("sports");
  const history = useHistory();

  const handleSportToggle = (value: string) => {
    if (value === "sports") {
      history.push("/rules/cricket");
    } else {
      history.push("/rules/speedy7");
    }
    setPointsType(value);
  };

  return (
    <div className="footer-content-ctn">
      <div className="header-ctn">
        <IonTitle className="title">Rules and Regulations</IonTitle>

        <BottomNavigation
          value={pointsType}
          onChange={(event, newValue) => {
            handleSportToggle(newValue);
          }}
          showLabels
          className="sports-toggle"
        >
          <BottomNavigationAction
            className="toggle-label"
            label="Sportsbook"
            value="sports"
          />
          <BottomNavigationAction
            className="toggle-label"
            label="Live Studio Games"
            value="studio"
          />
        </BottomNavigation>
      </div>

      <IonGrid className="layout-ctn">
        <IonRow>
          <IonCol sizeXs="12" sizeSm="3" sizeMd="3" sizeLg="3">
            <IonList lines="none" class="ion-list-ctn">
              {pointsType === "sports" ? (
                <>
                  {SPORTSBOOK_SPORTS.map((s, index) => (
                    <NavLink
                      activeClassName="active"
                      className="nav-link"
                      to={`${path}/${s}`}
                    >
                      <IonItem className="ion-list-item">
                        <IonLabel>{s}</IonLabel>
                      </IonItem>
                    </NavLink>
                  ))}
                </>
              ) : (
                <>
                  {STUDIO_SPORTS.map((s, index) => (
                    <NavLink
                      activeClassName="active"
                      className="nav-link"
                      to={`${path}/${s}`}
                    >
                      <IonItem className="ion-list-item">
                        <IonLabel>{s}</IonLabel>
                      </IonItem>
                    </NavLink>
                  ))}
                </>
              )}
            </IonList>
          </IonCol>

          <IonCol sizeXs="12" sizeSm="9" sizeMd="9" sizeLg="9">
            {" "}
            <Switch>
              <Route exact path={path}>
                <Redirect to="/rules/cricket" />
              </Route>

              <Route exact path={`/rules/:sport`}>
                <SportRules />
              </Route>
            </Switch>
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  );
};

export default RulesAndRegulations;
