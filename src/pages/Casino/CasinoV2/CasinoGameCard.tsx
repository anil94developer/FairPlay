import React from "react";
import useLazyLoad from "./useLazyLoad";

interface CasinoGameCardProps {
  index: number;
  game: {
    gameId: string;
    gameName: string;
    urlThumb: string;
    gameCode: string;
    subProviderName: string;
    providerName: string;
    superProviderName: string;
  };
  handleGameClick: (
    gameId: string,
    gameName: string,
    gameCode: string,
    subProviderName: string,
    providerName: string,
    superProviderName: string
  ) => void;
}

const CasinoGameCard: React.FC<CasinoGameCardProps> = ({
  game,
  handleGameClick,
  index,
}) => {
  const isLazy = index > 10;
  const { isVisible, elementRef } = useLazyLoad(isLazy);

  return (
    <div ref={elementRef} className="casino-game-card">
      {isVisible || !isLazy ? (
        <img
          loading="lazy"
          alt={game.gameName}
          className="casino-game-image"
          src={game.urlThumb || ""}
          title={game.gameName}
          onClick={() =>
            handleGameClick(
              game.gameId,
              game.gameName,
              game.gameCode,
              game.subProviderName,
              game.providerName,
              game.superProviderName
            )
          }
        />
      ) : (
        <div className="casino-game-placeholder">Loading...</div>
      )}
    </div>
  );
};

export default CasinoGameCard;
