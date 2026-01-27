import React from "react";
import AppCopyIcon from "../../components/CopyIcon/CopyIcon";

type CommProps = {
  langData: any;
};

const CommissionFormulaCard = (props: CommProps) => {
  const { langData } = props;

  return (
    <div className="commission-formula-card">
      <div className="formula-text">{langData?.["commission_formula_txt"]}</div>
      <AppCopyIcon copyText="" />
    </div>
  );
};

type Props = {
  langData: any;
};

const CommissionPage = (props: Props) => {
  const { langData } = props;

  return (
    <div>
      <div className="overview-title">{langData?.["casino_caps"]}:</div>
      <div className="overview-description-ctn">
        <p className="overview-description-text">
          {langData?.["affliate_referral_txt"]}
        </p>
        <div className="overview-description-card-ctn">
          <CommissionFormulaCard langData={langData} />
        </div>
      </div>

      <div className="overview-title top-spacing">
        {langData?.["sports_caps"]}:
      </div>
      <div className="overview-description-ctn">
        <p className="overview-description-text">
          {langData?.["affliate_referral_txt"]}
        </p>
        <div className="overview-description-card-ctn">
          <CommissionFormulaCard langData={langData} />
        </div>
      </div>
    </div>
  );
};

export default CommissionPage;
