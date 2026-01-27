import React from "react";
import { useParams } from "react-router-dom";
import { IonList, IonItem } from "@ionic/react";
import "./SportRules.scss";

import { SPORT_RULES } from "../../constants/FooterView";

const SportRules: React.FC = () => {
  // let { sport } = useParams();

  const getRules = () => {
    return SPORT_RULES.find((s) => s.name === "4").rules;
  };

  return (
    <IonList lines="none" class="sport-rules-list">
      {getRules().map((s, index) => (
        <IonItem className="sport-rule-desc">
          {index + 1}. {s}
        </IonItem>
      ))}
    </IonList>
  );
};

export default SportRules;
