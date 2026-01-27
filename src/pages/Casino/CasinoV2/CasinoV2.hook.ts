import { useEffect, useRef, useState } from "react";
import { AxiosResponse } from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../../models/RootState";
import { useHistory, useLocation } from "react-router";
import SVLS_API from "../../../svls-api";
import { getCurrencyTypeFromToken } from "../../../store";
import { DcGameNew } from "../../../models/dc/DcGame";
import { casinoList } from "../../../description/casinoList";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const useCasinoHook = () => {
  const history = useHistory();
  const loggedIn = useSelector((state: RootState) => state.auth.loggedIn);
  let loggedInUserStatus = 0;
  if (loggedIn) {
    loggedInUserStatus = JSON.parse(
      window.atob(sessionStorage.getItem("jwt_token").split(".")[1])
    ).status;
  }

  const { langData } = useSelector((state: RootState) => state.common);
  const [searchTerm, setSearchTerm] = useState("");
  const { pathname } = useLocation();
  const searchParams = useQuery();
  let providerRefs = useRef<Record<string, HTMLElement | null>>({});
  let categoryRefs = useRef({});

  const categoryFromParams = searchParams?.get("category");
  let providerFromParams = searchParams?.get("provider") || "ALL";

  const [dialogShow, setDialogShow] = useState<boolean>(false);

  const [gameInfo, setGameInfo] =
    useState<Record<string, Record<string, any[]>>>(null);

  // Sub-provider tabs
  const subProviderList = gameInfo ? Object.keys(gameInfo) : [];

  // Category tabs
  const categoryList =
    gameInfo !== null && providerFromParams
      ? gameInfo?.[providerFromParams]
        ? Object.keys(gameInfo?.[providerFromParams])
        : []
      : [];

  // Game list display filtered based on selected sub-provider and category
  const filteredGames =
    gameInfo !== null && categoryFromParams && providerFromParams
      ? gameInfo?.[providerFromParams]?.[categoryFromParams]
      : [];

  const gameListDisplay = filteredGames?.filter((game) =>
    game.gameName.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  const getGameUrl = async (
    gameId: string,
    gameName: string,
    gameCode: string,
    provider: string,
    subProvider: string,
    superProvider: string
  ) => {
    if (loggedIn) {
      // status check
      if (loggedInUserStatus === 0 || loggedInUserStatus === 3) {
        history.push(`/home`);
      }
      if (provider === "Indian Casino") {
        // setCasinoGame({ id: gameCode, name: gameName });
        history.push(`/casino/indian/${gameCode}`);
      } else {
        history.push({
          pathname: `/dc/gamev1.1/${gameName
            ?.toLowerCase()
            .replace(/\s+/g, "-")}-${btoa(gameId?.toString())}-${btoa(
            gameCode
          )}-${btoa(provider)}-${btoa(subProvider)}-${btoa(superProvider)}`,
          state: { gameName },
        });
      }
    } else {
      setDialogShow(true);
    }
  };

  const handleGameClickNavigation = async (
    gameId: string,
    gameName: string,
    gameCode: string,
    subProvider: string,
    provider?: string,
    superProvider?: string
  ) => {
    if (
      getCurrencyTypeFromToken() === 0 &&
      !(
        provider?.toLocaleLowerCase() === "ezugi" ||
        subProvider === "BetGames.TV" ||
        subProvider === "Pragmatic Play" ||
        subProvider === "Onetouch Live" ||
        subProvider === "OneTouch" ||
        provider === "RG"
      )
    ) {
      getGameUrl(
        gameId,
        gameName,
        gameCode,
        provider,
        subProvider,
        superProvider
      );
    } else {
      getGameUrl(
        gameId,
        gameName,
        gameCode,
        provider,
        subProvider,
        superProvider
      );
    }
  };

  const handleGameClick = (
    gameId: string,
    gameName: string,
    gameCode: string,
    subProvider: string,
    provider?: string,
    superProvider?: string
  ) => {
    handleGameClickNavigation(
      gameId,
      gameName,
      gameCode,
      subProvider,
      provider,
      superProvider
    );
  };

  const extractAllGames = (gamesData: Record<string, any[]>): DcGameNew[] => {
    let allGames: DcGameNew[] = [];
    if (!gamesData) return allGames;
    Object.keys(gamesData)?.forEach((provider) => {
      Object.keys(gamesData?.[provider]).forEach((category) => {
        allGames = allGames.concat(gamesData?.[provider]?.[category]);
      });
    });
    allGames.sort((a, b) => {
      if (a.priority === null && b.priority === null) {
        return 0; // Both are null, keep their relative order
      }
      if (a.priority === null) {
        return 1; // a.priority is null, so move it to the bottom
      }
      if (b.priority === null) {
        return -1; // b.priority is null, so move it to the bottom
      }
      return a.priority - b.priority; // Normal sort
    });
    return allGames;
  };

  const addAllCategory = (gameData) => {
    let games = { ...gameData };
    if (gameData) {
      if (providerFromParams !== "ALL") {
        let providerAllGames = extractAllGames(games?.[providerFromParams]);
        games[providerFromParams] = {
          ALL: providerAllGames,
          ...games[providerFromParams],
        };
        setCategoryParam("ALL", true);
      }
    }

    setGameInfo(games);
  };

  const setCategoryParam = (category: string, replace: boolean = false) => {
    const navigationMethod = replace ? history.replace : history.push;
    navigationMethod({
      pathname: "/casino",
      search: `?provider=${providerFromParams}&category=${category}`,
    });
  };

  const setProviderParam = (provider: string, replace: boolean = false) => {
    const navigationMethod = replace ? history.replace : history.push;
    navigationMethod({
      pathname: "/casino",
      search: `?provider=${provider}&category=${categoryFromParams}`,
    });
  };

  const handleCasinoSubProviderBlockClick = (subProviderName: string) => {
    providerFromParams = subProviderName;
    setProviderParam(subProviderName);
    if (gameInfo) {
      if (providerFromParams !== "ALL") {
        addAllCategory(gameInfo);
      } else {
        const subProviderCategories = Object.keys(gameInfo[subProviderName]);
        const firstCategory = subProviderCategories[0];
        setCategoryParam(firstCategory);
      }
    }
  };

  const handleCasinoCategoryClick = (categoryName: string) => {
    setCategoryParam(categoryName);
  };

  const getDcGames = async (...providers: String[]) => {
    const allGames = casinoList;

    addAllCategory(allGames);

    let selectedProvider;
    let selectedCategory;

    if (providerFromParams) {
      selectedProvider = providerFromParams;
    } else {
      selectedProvider = Object.keys(allGames)[0];
    }

    if (categoryFromParams) {
      selectedCategory = categoryFromParams;
    } else {
      selectedCategory = Object.keys(
        allGames[selectedProvider]
      )[0]?.toLowerCase();
    }

    // Use replace for initialization to avoid multiple history entries
    setProviderParam(selectedProvider, true);
    setTimeout(() => {
      setCategoryParam(selectedCategory, true);
    }, 100);
  };

  const onClear = () => {
    setSearchTerm("");
  };

  // Scroll to the selected provider when it changes
  useEffect(() => {
    setTimeout(() => {
      const scrolls = providerRefs.current[providerFromParams];
      if (scrolls) {
        scrolls.scrollIntoView({
          behavior: "smooth",
          block: "center",
          // inline: 'center'
        });
      }
    }, 500);
  }, [providerFromParams]);

  // Scroll to the selected category when it changes
  useEffect(() => {
    setTimeout(() => {
      if (categoryFromParams && categoryRefs.current[categoryFromParams]) {
        categoryRefs.current[categoryFromParams].scrollIntoView({
          behavior: "smooth",
          block: "center",
          // inline: 'center'
        });
      }
    }, 500);
  }, [categoryFromParams]);

  useEffect(() => {
    if (loggedIn) {
      if (pathname?.includes("premium-casino")) {
        getDcGames("MAC88", "MAC88 VIRTUALS", "FUN GAMES", "COLOR GAMES");
      } else {
        getDcGames();
      }
    }
  }, [pathname]);

  return {
    dialogShow,
    setDialogShow,
    handleGameClick,
    categoryFromParams,
    handleCasinoSubProviderBlockClick,
    gameInfo,
    subProviderList,
    categoryList,
    gameListDisplay,
    providerFromParams,
    handleCasinoCategoryClick,
    langData,
    searchTerm,
    setSearchTerm,
    onClear,
    providerRefs,
    categoryRefs,
  };
};
