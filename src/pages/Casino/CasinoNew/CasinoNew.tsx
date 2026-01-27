import { IonCol, IonRow } from "@ionic/react";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";

import FavoriteBorderOutlinedIcon from "@material-ui/icons/FavoriteBorderOutlined";
import FavoriteOutlinedIcon from "@material-ui/icons/FavoriteOutlined";
import { AxiosResponse } from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";

import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import SVLS_API from "../../../api-services/svls-api";
import { ReactComponent as LiveCasinoImg } from "../../../assets/images/casino/live_casino.svg?react";
import SEO from "../../../components/SEO/Seo";
import TabPanel from "../../../components/TabPanel/TabPanel";
import { BRAND_DOMAIN, BRAND_NAME } from "../../../constants/Branding";
import CasinoView from "../../../constants/CasinoView";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { CasinoGameDTO } from "../../../models/IndianCasinoState";
import { RootState } from "../../../models/RootState";
import { AuthResponse } from "../../../models/api/AuthResponse";
import { DcGameNew } from "../../../models/dc/DcGame";
import aviatorIcon from "../../../assets/images/casino_tabs/ic_aviator.svg";

import { getCurrencyTypeFromToken } from "../../../store";
import {
  setAlertMsg,
  setCasinoGames,
} from "../../../store/common/commonActions";
import { tabs } from "../CasinoSideBar/CasinoSideBarUtil";

import "./CasinoNew.scss";
import { AlertDTO } from "../../../models/Alert";
import { capitalizeWord } from "../../../util/stringUtil";
import ReportsHeader from "../../../common/ReportsHeader/ReportsHeader";
import { CasinoProviders } from "../CasinoSideBar/CasinoProviders";

type StoreProps = {
  loggedIn: boolean;
  loggedInUserStatus: any;
  setCasinoGame: (cGame: CasinoGameDTO) => void;
  setCasinoGames: (games: DcGameNew) => void;
  setAlertMsg: Function;
  langData: any;
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const DcPageNew: React.FC<StoreProps> = (props) => {
  const { setCasinoGames, setAlertMsg, langData } = props;
  const [games, setGames] = useState<DcGameNew[]>([]);
  const [initGames, setInitGames] = useState<DcGameNew[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [casinoTabValue, setCasinoTabValue] = useState<number>(0);
  const [selectedProvider, setSelectedProvider] = useState<string>("all");
  const [fetchSelectedProviderGames, setFetchSelectedProviderGames] =
    useState(false);
  const [casinoGameCatTabValue, setCasinoGameCatTabValue] = useState<number>(0);
  const [providerCategoryList, setProviderCategoryList] = useState(tabs);
  const [selectedCategoryObj, setSelectedCategoryObj] = useState(tabs[1]);
  const [filteredProvider, setFilteredProvider] = useState<string>(
    useQuery().get("provider")
  );
  const [providerList, setProviderList] = useState<string[]>();
  const [favouriteCasinoGames, setFavouriteCasinoGames] =
    useState<DcGameNew[]>();

  const [apiWebBanners, setApiWebBanners] = useState([]);
  const [apiMobBanners, setApiMobBanners] = useState([]);

  const [clear, setClear] = useState<boolean>(false);

  const locationState: any = useLocation().state;

  const liveCasinoGamesMap = {
    blackJack: "Live Blackjack",
    baccarat: "Live Baccarat",
    roulette: "Live Roulette",
    andarBahar: "Live Popular",
    poker: "Live Poker",
    other: "Others",
  };
  const { loggedIn, setCasinoGame, loggedInUserStatus } = props;
  const windowSize = useWindowSize();
  const pathLocation = useLocation();
  const history = useHistory();
  const [disableAllCat, setDisableAllCat] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const onClear = () => {
    setSearchTerm("");
    setSelectedProvider("all");
    setClear(true);
  };

  const buttonRefs = useRef({});

  const [infoDialog, setInfoDialog] = useState<boolean>(false);
  const [selectedEvolutionGame, setSelectedEvolutionGame] = useState({
    gameId: null,
    gameName: null,
    gameCode: null,
    provider: null,
    subProvider: null,
    superProvider: null,
  });

  const disabledGamesIds = [
    "151055",
    "151056",
    "151057",
    "151059",
    "151060",
    "151061",
    "151063",
    "151064",
    "151065",
  ];

  const setDialogShow = (show: boolean) => {
    setShowDialog(show);
  };

  useEffect(() => {
    if (loggedIn && casinoGameCatTabValue === 8) {
      getFavouriteGames();
    }
  }, [casinoGameCatTabValue]);

  const getFavouriteGames = async () => {
    let response = await SVLS_API.get(
      `/catalog/v2/categories/indian-casino/games/favourites`,
      {
        headers: {
          Authorization: sessionStorage.getItem("jwt_token"),
        },
      }
    );

    if (response.status === 200) {
      setFavouriteCasinoGames(response.data);
    }
  };

  const getDcGames = async () => {
    if (gamesDisplay.length > 0) {
      setGames(initGames);
      return;
    }
    let response: AxiosResponse<DcGameNew[]>;
    if (loggedIn) {
      response = await SVLS_API.get(
        "/catalog/v2/categories/indian-casino/games/",
        {
          params: {
            providerId: "*",
          },
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
        }
      );
    } else {
      response = await SVLS_API.get(
        "/catalog/v2/categories/indian-casino/games/",
        {
          params: {
            providerId: "*",
          },
        }
      );
    }
    // xpg games should only be enabled for icasino247 wl
    let data: any = response.data.filter(
      (indvG) => indvG.subProviderName.toLowerCase() !== "xpg"
    );
    setInitGames(data);
    setGames(data);
    setCasinoGames(data);
    setFetchSelectedProviderGames(true);
    setProviderList(
      data
        .map((g) => g.subProviderName)
        .filter(function (elem, index, self) {
          return index === self.indexOf(elem);
        })
    );
  };

  const addOrRemoveToMyFavourites = async (
    gameId: string,
    isFavourite: boolean
  ) => {
    let addedOrRemovedFromFavourites: boolean;
    let response: AxiosResponse<any>;
    if (loggedIn) {
      try {
        if (!isFavourite) {
          response = await SVLS_API.put(
            `/catalog/v2/categories/indian-casino/games/${gameId}:addFavourite`,
            {},
            {
              headers: {
                Authorization: sessionStorage.getItem("jwt_token"),
              },
            }
          );
          addedOrRemovedFromFavourites = true;
        } else {
          response = await SVLS_API.put(
            `/catalog/v2/categories/indian-casino/games/${gameId}:removeFavourite`,
            {},
            {
              headers: {
                Authorization: sessionStorage.getItem("jwt_token"),
              },
            }
          );
          addedOrRemovedFromFavourites = false;
        }

        if (response.status === 204) {
          setAlertMsg({
            type: "success",
            message: addedOrRemovedFromFavourites
              ? langData?.["add_success_txt"]
              : langData?.["remove_success_txt"],
          });
          getDcGames();
          getFavouriteGames();
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      setAlertMsg({
        type: "error",
        message: langData?.["fav_game_login_txt"],
      });
    }
  };

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
        setCasinoGame({ id: gameCode, name: gameName });
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

  const handleGameClick = async (
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

  useEffect(() => {
    if (selectedProvider !== "all") {
      const currentGameObj = CasinoProviders.find(
        (providerObj) => providerObj.subProviderName === selectedProvider
      );

      const currentGameObjConverted = {
        ...currentGameObj,
        filterParams: currentGameObj.filterParams.map((param) =>
          param.toLocaleLowerCase()
        ),
      };

      let repGames = initGames.filter((game) => {
        if (currentGameObjConverted.includedGames?.length > 0) {
          return (
            currentGameObjConverted.filterParams.includes(
              game.subProviderName.toLowerCase()
            ) &&
            currentGameObjConverted.includedGames
              ?.map((gameName) => gameName.toLowerCase())
              .includes(game.gameName.toLowerCase())
          );
        } else if (currentGameObjConverted.excludedGames?.length > 0) {
          return (
            currentGameObjConverted.filterParams.includes(
              game.subProviderName.toLowerCase()
            ) &&
            !currentGameObjConverted.excludedGames
              ?.map((gameName) => gameName.toLowerCase())
              .includes(game.gameName.toLowerCase())
          );
        } else {
          return currentGameObjConverted.filterParams.includes(
            game.subProviderName.toLowerCase()
          );
        }
      });
      let obj = {};
      let categories = repGames
        .map((game) => {
          if (!obj[game.category]) {
            obj[game.category] = true;
            return game.category;
          }
          return null;
        })
        .filter((value) => value != null);

      const cat = ["All", ...categories];
      const categoriesList = [];
      let addOthers = false;
      cat.forEach((category) => {
        let isCategoryFound = false;
        tabs.forEach((tab) => {
          if (tab.title.toLowerCase() === category.toLowerCase()) {
            categoriesList.push(tab);
            isCategoryFound = true;
          }
        });
        if (!isCategoryFound) {
          addOthers = true;
        }
      });
      if (addOthers) {
        let othersTabFound = categoriesList.find((item) =>
          item.title === "Others" ? true : false
        );
        if (!othersTabFound) {
          tabs.map((tab) => {
            if (tab.title === "Others") categoriesList.push(tab);
          });
        }
      }
      setGames(repGames);
      const providerCategories = [
        tabs[0],
        ...currentGameObj.supportedCategories,
      ];

      setProviderCategoryList(categoriesList);
      setSelectedCategoryObj(providerCategories[0]);
    } else {
      getDcGames();
      setProviderCategoryList(tabs);
      setSelectedCategoryObj(tabs[0]);
    }
  }, [selectedProvider, loggedIn]);

  useEffect(() => {
    if (loggedIn && casinoTabValue === 1) {
      history.push(`/indian_casino/live`);
    }
  }, [casinoTabValue, loggedIn]);

  const [gamesDisplay, setGamesDisplay] = useState([]);

  const getSelectedCategoryGames = (categoryFilterParams: string[]) => {
    console.log("getSelectedCategoryGames", {
      categoryFilterParams,
    });
    if (categoryFilterParams[0] === "all") {
      let tempGames = [...games];
      tempGames.sort((a, b) => {
        if (a.subProviderName === "Monk88" && b.subProviderName !== "Monk88") {
          return -1;
        }
        if (a.subProviderName !== "Monk88" && b.subProviderName === "Monk88") {
          return 1;
        }

        if (a.providerName === "MAC88" && b.providerName !== "MAC88") {
          return -1;
        }
        if (a.providerName !== "MAC88" && b.providerName === "MAC88") {
          return 1;
        }

        if (a.providerName === "RG" && b.providerName !== "RG") {
          return -1;
        }
        if (a.providerName !== "RG" && b.providerName === "RG") {
          return 1;
        }

        return 0;
      });
      setGamesDisplay(tempGames);
    } else {
      const filteredGames = games.filter((g) => {
        let gameFound = false;
        categoryFilterParams.forEach((param) => {
          if (
            param.toLowerCase() === g.category.toLowerCase() ||
            param.toLowerCase() === g.gameName.toLowerCase()
          ) {
            gameFound = true;
          }
        });
        return gameFound;
      });
      setGamesDisplay(filteredGames);
    }
  };

  useEffect(() => {
    if (games.length > 0) {
      getSelectedCategoryGames(selectedCategoryObj.filterParams);
    }
  }, [games, selectedCategoryObj]);

  const fetchBannerData = async () => {
    let webdata = [];
    let mobiledata = [];
    try {
      // Dummy data instead of API call
      const dummyResponse: AuthResponse = {
        data: {
          banners: [
            {
              deviceType: "desktop",
              publicUrl:
                "https://cdn.uvwin2024.co/banners/dummy-desktop-banner.webp",
              redirectionUrl: "/casino",
              title: "Casino Banner",
            },
            {
              deviceType: "mobile",
              publicUrl:
                "https://cdn.uvwin2024.co/banners/dummy-mobile-banner.webp",
              redirectionUrl: "/casino",
              title: "Casino Banner",
            },
          ],
        },
      } as AuthResponse;
      let data = dummyResponse?.data?.banners;
      if (data?.length > 0) {
        data.map((item) => {
          if (item.deviceType === "desktop") {
            webdata.push(item);
          } else if (item.deviceType === "mobile") {
            mobiledata.push(item);
          }
        });
        setApiWebBanners(webdata);
        setApiMobBanners(mobiledata);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchBannerData();
  }, []);

  useEffect(() => {
    if (games?.length > 0) {
      if (locationState?.selectedCategory === "Aviator") {
        setSelectedCategoryObj({
          icon: aviatorIcon,
          tabValue: 1,
          title: "Aviator",
          titleKey: "aviator",
          filterParams: ["aviator"],
        });
      } else if (locationState?.selectedCategory === "mines") {
        setSelectedCategoryObj({
          icon: aviatorIcon,
          tabValue: 2,
          title: "Mines",
          titleKey: "mines",
          filterParams: ["mines"],
        });
      } else if (locationState?.selectedCategory === "color game") {
        setSelectedCategoryObj({
          icon: aviatorIcon,
          tabValue: 3,
          title: "Color Prediction",
          titleKey: "color_games",
          filterParams: ["color game"],
        });
      } else if (locationState?.selectedProvider === "smartsoft") {
        locationState["selectedProvider"] = "";
        setSelectedProvider("smartsoft gaming");
      }
    }
  }, [games]);

  useEffect(() => {
    if (locationState?.selectedProvider && fetchSelectedProviderGames) {
      if (locationState?.selectedProvider === "smartsoft") {
        setSelectedProvider("smartsoft gaming");
      } else {
        setSelectedProvider(locationState?.selectedProvider);
      }
    }
  }, [fetchSelectedProviderGames]);

  // this is to scroll to the selected provider
  useEffect(() => {
    if (selectedProvider && buttonRefs.current[selectedProvider]) {
      buttonRefs.current[selectedProvider].scrollIntoView({
        behavior: "smooth",
        block: "center",
        // inline: 'center'
      });
    }
  }, [selectedProvider]);

  const getMobileBanners = () => {
    if (apiMobBanners.length > 0) {
      return apiMobBanners;
    } else {
      return CasinoView.CASINO_MOBILE_BANNERS;
    }
  };

  useEffect(() => {
    if (document.getElementById("casino-page")) {
      document.getElementById("casino-page").scrollIntoView();
    }
  }, []);

  return (
    <div className="dc-page-bg">
      {/* TODO: what to do about this SEO */}
      <SEO
        title={BRAND_NAME}
        name={"Live casino page"}
        description={"Live casino page"}
        type={"Live casino page"}
        link={pathLocation?.pathname}
      />
      <IonRow className="exch-inplay-events-view">
        <IonCol sizeXs="12" className="py-0">
          {/* {windowSize.width < 720 && <PromotionSidebar />} */}
        </IonCol>

        <IonCol
          sizeLg="12"
          sizeMd="12"
          sizeXs="12"
          className="mt-16 special-carousal"
        >
          <div className="dc-ctn" id="casino-page">
            <ReportsHeader
              titleIcon={LiveCasinoImg}
              reportName={langData?.["casino"]}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              clearAll={onClear}
              reportFilters={[]}
              langData={langData}
            />

            <div className="casino-filter-section">
              {CasinoProviders.map(({ subProviderName, titleKey }) => (
                <div
                  onClick={() => setSelectedProvider(subProviderName)}
                  className={`casino-filter-text-ctn ${
                    selectedProvider === subProviderName
                      ? "casino-filter-text-ctn-selected"
                      : ""
                  }`}
                  ref={(el) => (buttonRefs.current[subProviderName] = el)}
                >
                  <div className="casino-filter-text">
                    {langData?.[titleKey]?.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
            <CasinoTabs
              tabs={providerCategoryList}
              selTabVal={selectedCategoryObj.tabValue}
              setSelTabVal={setSelectedCategoryObj}
              disableAllCat={disableAllCat}
              langData={langData}
            />

            <TabPanel value={1} index={1}>
              {games && games.length > 0 ? (
                <>
                  <div className="dc-games-ctn">
                    {gamesDisplay
                      ?.filter((game) =>
                        game.gameName
                          .toLowerCase()
                          .includes(searchTerm?.toLowerCase())
                      )
                      .map(
                        (g, i) =>
                          !disabledGamesIds.includes(g.gameId) && (
                            <>
                              {filteredProvider &&
                              g.subProviderName != filteredProvider ? null : (
                                <Card className="dc-ion-card">
                                  <CardActionArea>
                                    <CardMedia
                                      loading="lazy"
                                      component="img"
                                      alt={g.gameName}
                                      className="dc-card-media"
                                      image={g.urlThumb ? g.urlThumb : ""}
                                      title={g.gameName}
                                      onClick={() =>
                                        handleGameClick(
                                          g.gameId,
                                          g.gameName,
                                          g.gameCode,
                                          g.subProviderName,
                                          g.providerName,
                                          g.superProviderName
                                        )
                                      }
                                    />
                                    <CardContent className="dc-card-ctn">
                                      <button
                                        className="add-or-remove-favourite"
                                        onClick={() =>
                                          addOrRemoveToMyFavourites(
                                            g.gameId,
                                            g.favourite
                                          )
                                        }
                                      >
                                        {g.favourite ? (
                                          <FavoriteOutlinedIcon
                                            className="red-favourite-img"
                                            titleAccess={
                                              langData?.["remove_from_fav_txt"]
                                            }
                                          />
                                        ) : (
                                          <FavoriteBorderOutlinedIcon
                                            className="favourite-img"
                                            titleAccess={
                                              langData?.["add_to_fav_txt"]
                                            }
                                          />
                                        )}
                                      </button>
                                      <Typography
                                        gutterBottom
                                        className="game-name"
                                        title={g.gameName}
                                      >
                                        {g.gameName}
                                      </Typography>
                                      {loggedIn &&
                                      g.minLimits &&
                                      g.maxLimits ? (
                                        <Typography
                                          variant="caption"
                                          className="game-range"
                                        >
                                          {g.minLimits} - {g.maxLimits}
                                        </Typography>
                                      ) : null}
                                    </CardContent>
                                  </CardActionArea>
                                </Card>
                              )}
                            </>
                          )
                      )}
                  </div>
                </>
              ) : null}
            </TabPanel>
          </div>
        </IonCol>

        {/* <IonCol sizeLg="3" sizeMd="4" className="pos-sticky-10">
          {windowSize.width >= 720 && (
            <CasinoSideBar
              setSelectedProvider={setSelectedProvider}
              selectedProvider={selectedProvider}
            />
          )}
        </IonCol> */}

        <Dialog
          open={showDialog}
          onClose={() => setDialogShow(false)}
          aria-labelledby="form-dialog-title"
          maxWidth="xs"
          className="login-alert"
        >
          <DialogTitle id="form-dialog-title">
            {langData?.["notice"]}
          </DialogTitle>
          <DialogContent>
            <div className="dc-dialog-body">
              {langData?.["games_access_login_txt"]}
            </div>
          </DialogContent>
          <DialogActions className="dc-dialog-actions">
            <Button
              onClick={() => setDialogShow(false)}
              className="cancel-btn dialog-action-btn"
            >
              {langData?.["cancel"]}
            </Button>
            <Button
              onClick={() => {
                history.push("/login");
                setDialogShow(false);
              }}
              className="login-btn dialog-action-btn"
            >
              {langData?.["login"]}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={infoDialog}
          onClose={() => {
            setInfoDialog(false);
            setSelectedEvolutionGame(null);
          }}
          aria-labelledby="form-dialog-title"
          className="dialog-div"
        >
          <div className="dialog-div-body">
            <div className="dialog-title">{langData?.["game_info"]}</div>
            <div className="dialog-body">
              {langData?.["1_10_point_conversion_casino_txt"]}
              <div className="dialog-ex">
                {" "}
                {langData?.["1_10_point_conversion_casino_ex_txt"]}
              </div>
            </div>
            <div className="dialog-continue">
              <div
                className="custom-btn btn"
                onClick={() =>
                  getGameUrl(
                    selectedEvolutionGame?.gameId,
                    selectedEvolutionGame?.gameName,
                    selectedEvolutionGame?.gameCode,
                    selectedEvolutionGame?.provider,
                    selectedEvolutionGame?.subProvider,
                    selectedEvolutionGame?.superProvider
                  )
                }
              >
                {langData?.["continue"]}
              </div>

              <div
                className="custom-btn-close"
                onClick={() => {
                  setInfoDialog(false);
                  setSelectedEvolutionGame(null);
                }}
              >
                {langData?.["close"]}
              </div>
            </div>
          </div>
        </Dialog>
      </IonRow>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  let status = 0;
  if (state.auth.loggedIn) {
    status = JSON.parse(
      window.atob(sessionStorage.getItem("jwt_token").split(".")[1])
    ).status;
  }
  return {
    loggedIn: state.auth.loggedIn,
    loggedInUserStatus: status,
    langData: state.common.langData,
  };
};

const CasinoTabs = (props) => {
  const { tabs, selTabVal, setSelTabVal, disableAllCat, langData } = props;
  return (
    <div className="cw-cts">
      <div className="cw-sub-cts">
        {tabs
          .filter(
            (tab) =>
              tab.tabValue !== 0 || (tab.tabValue === 0 && !disableAllCat)
          )
          .map((tab) => (
            <button
              className={`cw-ct ${
                selTabVal === tab.tabValue ? "cw-ct-sel" : ""
              }`}
              onClick={() => {
                setSelTabVal(tab);
              }}
            >
              <div className="tab-icon-ctn">
                <img src={tab.icon} alt="" className="cw-ct-img" />
              </div>

              <span
                className={`tab-btn-text ${
                  selTabVal === tab.tabValue ? "tab-btn-text-selected" : null
                }`}
              >
                {langData?.[tab.titleKey]}
              </span>
            </button>
          ))}
      </div>
    </div>
  );
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    setCasinoGames: (games: DcGameNew) => dispatch(setCasinoGames(games)),
    setAlertMsg: (alert: AlertDTO) => dispatch(setAlertMsg(alert)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DcPageNew);
