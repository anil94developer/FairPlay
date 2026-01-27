import React, { useCallback } from "react";

interface AffiliateInfoCardProps {
  unitName: string;
  unitQuantity: string | number;
}

const AffiliateInfoCard: React.FC<AffiliateInfoCardProps> = ({
  unitName,
  unitQuantity,
}) => {
  const getUnitQuantity = useCallback(
    () =>
      +unitQuantity < 10 && +unitQuantity >= 0
        ? "0" + unitQuantity
        : unitQuantity,
    [unitQuantity]
  );

  const getQuantityText = (): string | number => {
    if (unitQuantity || unitQuantity === 0) {
      return isNaN(+unitQuantity) ? unitQuantity : getUnitQuantity();
    } else {
      return "--";
    }
  };

  return (
    <div className="affiliate-info-card-ctn">
      <div className="affiliate-info-card">
        <div className="affiliate-info-text-ctn">
          <h2 className="unit-text">{getQuantityText()}</h2>
          <p className="unit-name">{unitName}</p>
        </div>
      </div>
    </div>
  );
};

export default AffiliateInfoCard;
