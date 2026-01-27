import React from "react";
import "./MarketEnabled.scss";
import { ReactComponent as VirtualSportsIcon } from "../../assets/images/home/tiles/egames-icon.svg?react";

type Props = {
  marketEnabled: boolean;
  marketType: string;
};

const MarketEnabled = (props: Props) => {
  const { marketEnabled, marketType } = props;

  return (
    <>
      {marketEnabled && (
        <div
          className={
            marketType === "V"
              ? "market-enabled bg-none"
              : marketType === "V2"
              ? "market-enabled bg-none v2"
              : "market-enabled"
          }
        >
          <div className="market-enabled-inner">
            {["V", "V2"].includes(marketType) ? (
              <VirtualSportsIcon width={30} height={30} />
            ) : (
              marketType
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MarketEnabled;
