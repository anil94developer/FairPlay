import React from "react";
import { ReactComponent as gameRulesIcon } from "../../assets/images/icons/gameRulesIcon.svg?react";
import ReportsHeader from "../../common/ReportsHeader/ReportsHeader";
import MarketTermsCondi from "../../components/MarketTermsCondi/MarketTermsCondi";

import TrendingGames from "../../components/ProviderSidebar/TrendingGames";
import { useWindowSize } from "../../hooks/useWindowSize";
import "./GameRules.scss";
import { RootState } from "../../models/RootState";
import { connect } from "react-redux";

const GameRules: React.FC<{ langData: any }> = (props) => {
  const { langData } = props;
  const isMobile = useWindowSize().width < 720;

  return (
    <div className="gr-ctn">
      <div className="game-rules-container-content">
        <ReportsHeader
          titleIcon={gameRulesIcon}
          reportName={langData?.["game_rules"]}
          reportFilters={[]}
        />
        <div className="rules-accordians-ctn">
          <MarketTermsCondi />
        </div>
      </div>

      {!isMobile && (
        <div className="promotions-trending-games">
          <TrendingGames langData={langData} />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    langData: state.common.langData,
  };
};

export default connect(mapStateToProps, null)(GameRules);
