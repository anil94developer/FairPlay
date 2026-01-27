import React from "react";
import { useCountdown } from "../../hooks/countdown.hook";
import { useSelector } from "react-redux";
import { RootState } from "../../models/RootState";

// Countdown display component
const CountdownDisplay: React.FC<{ delay: number }> = ({ delay }) => {
  const count = useCountdown(delay);
  return <div className="delay-text">{delay === 0 ? "0" : count}</div>;
};

// One-click betting loading component
export const OneClickBettingCountdown: React.FC<{ delay: number }> = ({
  delay,
}) => {
  const { langData } = useSelector((state: RootState) => state.common);
  return (
    <div className="one-click-betting-loading">
      <div className="delay-loader">
        <CountdownDisplay delay={delay} />
        <div className="loader-ring"></div>
      </div>
      <div className="click-loading-text">
        <div className="processing-text">
          {langData?.yourBettingIsBeingProcessed}...
        </div>
        <div className="wait-text">{langData?.pleaseWait}</div>
      </div>
    </div>
  );
};
