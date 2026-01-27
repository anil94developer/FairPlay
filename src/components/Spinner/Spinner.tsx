import React from "react";
import { IonSpinner } from "@ionic/react";
import "./Spinner.scss";

const Spinner: React.FC = () => {
  return (
    <div className="spin">
      <IonSpinner color="light" name="lines" />
    </div>
  );
};

export default Spinner;
