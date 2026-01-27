import React, { useState, useEffect } from "react";
import "./ExchOddButton.scss";
import LockOutlined from "@material-ui/icons/LockOutlined";

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

const OddButton: React.FC<PropType> = (props) => {
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
  const [classes, setClasses] = useState<string>("exch-odd-button");
  const [timer, setTimer] = useState(null);
  const [currentOdds, setCurrentOdds] = useState<number[]>([]);
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
      let showAnimation = true;
      if (oddsSet && oddsSet.length > 0) {
        showAnimation = !currentOdds.includes(chVal);
        setCurrentOdds(oddsSet);
      }
      if (showAnimation) {
        if (cVal && chVal !== cVal) {
          if (!classes.includes("odd-change"))
            setClasses(classes + " odd-change");
          setTimer(
            setTimeout(
              () => setClasses(classes.replace(" odd-change", "")),
              5000
            )
          );
        }
      }
    }
  };

  useEffect(() => oddValueChanged(), [mainValue, subValue]);

  const formatNumber = (value) => {
    // Formats a number to include up to two decimal places only if there are non-zero decimal values.
    const num = Number(value);
    return num % 1 === 0 ? num.toString() : num.toFixed(2);
  };

  return (
    <div className="exch-odd-view">
      {mainValue && Number(mainValue) > 0 ? (
        <div
          className={
            disable ? `${oddType} disabled ` + classes : `${oddType} ` + classes
          }
          onClick={() => onClick()}
        >
          <div className="exch-odd-button-content">
            <div className={mainValueClass ? mainValueClass : "price"}>
              {Number.isNaN(Number(mainValue)) ? (
                <br></br>
              ) : valueType === "fancyMarketOdds" ? (
                Number(mainValue)
              ) : (
                formatNumber(Number(mainValue).toFixed(2))
              )}
            </div>
            {oddType !== "premium-odd" ? (
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
          <LockOutlined className="lock-icon" />
        </div>
      )}
    </div>
  );
};

export default OddButton;
