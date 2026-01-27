import React, { useState, useEffect } from "react";
import "./ExchOddButton.scss";
import lockIcon from "../../assets/images/sportsbook/lock.png";

type PropType = {
  mainValue?: any;
  mainValueClass?: "price" | "runs";
  subValue?: number;
  subValueClass?: "size" | "odds";
  disable?: boolean;
  oddType:
    | "back-odd"
    | "lay-odd"
    | "odds-yes-cell"
    | "odds-no-cell"
    | "premium-odd";
  valueType?:
    | "matchOdds"
    | "bookmakerOdds"
    | "fancyMarketOdds"
    | "binaryOdds"
    | "premiumOdds";
  onClick?: () => void;
  oddsSet?: number[];
  showSubValueinKformat?: boolean;
};

const ExchMobOddButton: React.FC<PropType> = (props) => {
  const {
    mainValue,
    mainValueClass,
    subValue,
    subValueClass,
    disable,
    oddType,
    valueType,
    onClick,
    oddsSet,
    showSubValueinKformat,
  } = props;
  const [currentValue, setCurrentValue] = useState<number>(null);
  const [classes, setClasses] = useState<string>("mob-exch-odd-button");
  const [timer, setTimer] = useState(null);
  const mainValprecision: number = 2;
  const [volume, setVolume] = useState<number>();
  const subValprecision: number = valueType === "matchOdds" ? 0 : 0;

  useEffect(() => {
    if (subValue) {
      if (valueType === "matchOdds") setVolume(subValue * 1000);
      else setVolume(subValue);
    }
  }, [subValue, valueType]);

  const oddValueChanged = () => {
    clearTimeout(timer);
    const chVal = mainValue;
    if (chVal) {
      const cVal = currentValue;
      setCurrentValue(chVal);
      if (cVal && chVal !== cVal) {
        if (!classes.includes("odd-change"))
          setClasses(classes + " odd-change");
        setTimer(
          setTimeout(() => setClasses(classes.replace(" odd-change", "")), 5000)
        );
      }
    }
  };

  useEffect(() => oddValueChanged(), [mainValue]);

  return (
    <div className="mob-exch-odd-view">
      {mainValue && Number(mainValue) > 0 ? (
        <div
          className={
            disable ? `${oddType} disabled ` + classes : `${oddType} ` + classes
          }
        >
          <div className="mob-exch-odd-button-content">
            <div className={mainValueClass ? mainValueClass : "price"}>
              {Number.isNaN(Number(mainValue)) ? (
                <br></br>
              ) : (
                Number(mainValue).toFixed(mainValprecision)
              )}
            </div>

            {oddType !== "premium-odd" && valueType !== "bookmakerOdds" ? (
              <div className={subValueClass ? subValueClass : "size"}>
                {volume
                  ? showSubValueinKformat && Number(volume > 999)
                    ? Number(volume / 1000).toFixed(subValprecision) + "K"
                    : Number(volume).toFixed(subValprecision)
                  : "0.00K"}
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <div className={`${oddType} disabled ` + classes}>
          <img
            className="lock-icon"
            slot="icon-only"
            src={lockIcon}
            alt="lock"
          />
        </div>
      )}
    </div>
  );
};

export default ExchMobOddButton;
