import React from "react";
import "./CasinoV2.scss";
import { useCasinoHook } from "./CasinoV2.hook";
import CasinoProviderBlock from "./CasinoProviderBlock";
import CasinoCategoryCard from "./CasinoCategoryCard";
import CasinoGameCard from "./CasinoGameCard";
import { getCasinoCategoryIcon } from "../CasinoSideBar/CasinoSideBarUtil";
import ReportsHeader from "../../../common/ReportsHeader/ReportsHeader";
import { ReactComponent as LiveCasinoImg } from "../../../assets/images/casino/live_casino.svg?react";

const CasinoV2: React.FC = () => {
  const {
    providerFromParams: selectedProvider,
    subProviderList,
    categoryList,
    gameListDisplay,
    handleCasinoCategoryClick,
    handleCasinoSubProviderBlockClick,
    handleGameClick,
    categoryFromParams: selectedCategory,
    langData,
    searchTerm,
    setSearchTerm,
    onClear,
    providerRefs,
    categoryRefs,
  } = useCasinoHook();

  return (
    <div className="casino-container">
      <ReportsHeader
        titleIcon={LiveCasinoImg}
        reportName={langData?.["casino"]}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        clearAll={onClear}
        reportFilters={[]}
        langData={langData}
      />
      <div className="scrollbar-hide flex-row provider-ctn">
        {subProviderList.length > 0 &&
          subProviderList.map((subProviderName, index) => (
            <CasinoProviderBlock
              key={index}
              index={index}
              selected={selectedProvider === subProviderName}
              title={subProviderName}
              handleCasinoSubProviderBlockClick={() =>
                handleCasinoSubProviderBlockClick(subProviderName)
              }
              providerRefs={providerRefs}
              highlighted={subProviderName === ""} // Make this configurable from HA later
            />
          ))}
      </div>

      <div className="scrollbar-hide flex-row">
        {categoryList.length > 0 &&
          categoryList.map((category) => (
            <CasinoCategoryCard
              key={category}
              selected={
                category?.toLowerCase() === selectedCategory?.toLowerCase()
              }
              category={category}
              handleCasinoCategoryClick={handleCasinoCategoryClick}
              icon={getCasinoCategoryIcon(category)}
              categoryRefs={categoryRefs}
            />
          ))}
      </div>

      <div className="casino-game-grid">
        {gameListDisplay &&
          gameListDisplay.length > 0 &&
          gameListDisplay.map(
            (g, i) =>
              ![
                "MAC88-CLOT5104",
                "MAC88-CLOT5103",
                "MAC88-CLOT5102",
                "MAC88-CK3104",
                "MAC88-CK3103",
                "MAC88-CK3102",
                "MAC88-CWI104",
                "MAC88-CWI103",
                "MAC88-CWI102",
              ]?.includes(g.gameCode) && (
                <CasinoGameCard
                  key={g.gameId}
                  index={i}
                  game={g}
                  handleGameClick={handleGameClick}
                />
              )
          )}
      </div>
    </div>
  );
};

export default CasinoV2;
