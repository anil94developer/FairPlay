import React, { useEffect, useState } from "react";
import { IonCard, IonCardHeader, IonCol, IonRow } from "@ionic/react";
import { useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { AxiosResponse } from "axios";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import { ReactComponent as LiveCasinoImg } from "../../assets/images/casino/live_casino.svg?react";

import "../Casino/CasinoNew/CasinoNew.scss";
import { DcGameNew } from "../../models/dc/DcGame";
import { RootState } from "../../models/RootState";
import SVLS_API from "../../api-services/svls-api";
import SEO from "../../components/SEO/Seo";
import { BRAND_DOMAIN, BRAND_NAME } from "../../constants/Branding";
import { AuthResponse } from "../../models/api/AuthResponse";
import NoDataComponent from "../../common/NoDataComponent/NoDataComponent";
import NoVritualSportsIcon from "../../assets/images/no_virtualSports_icon.svg";
import { useWindowSize } from "../../hooks/useWindowSize";

type StoreProps = {
  loggedIn: boolean;
  loggedInUserStatus: any;
};

const VirtualSports: React.FC<StoreProps> = (props) => {
  const windowSize = useWindowSize();
  const [games, setGames] = useState<DcGameNew[]>([]);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [virtualGames, setVirtualGames] = useState<DcGameNew[]>([]);
  const { loggedIn, loggedInUserStatus } = props;

  const history = useHistory();
  const pathLocation = useLocation();

  // let MobileBanners = CasinoView.CASINO_MOBILE_BANNERS;
  const [apiWebBanners, setApiWebBanners] = useState([]);
  const [apiMobBanners, setApiMobBanners] = useState([]);
  const setDialogShow = (show: boolean) => {
    setShowDialog(show);
  };

  const getDcGames = async () => {
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
    if (response?.data) {
      const data = response.data.filter(
        (indvG) => indvG.subProviderName.toLowerCase() !== "xpg"
      );
      setGames(data);
    }
  };

  const getGameUrl = async (
    gameId: string,
    gameName: string,
    gameCode: string,
    subProvider: string,
    provider: string,
    superProvider: string
  ) => {
    if (loggedIn) {
      // status check
      if (loggedInUserStatus === 0 || loggedInUserStatus === 3) {
        history.push(`/home`);
      }

      history.push({
        pathname: `/dc/gamev1.1/${gameName
          ?.toLowerCase()
          .replace(/\s+/g, "-")}-${btoa(gameId?.toString())}-${btoa(
          gameCode
        )}-${btoa(provider)}-${btoa(subProvider)}-${btoa(superProvider)}`,
        state: { gameName },
      });
    } else {
      setDialogShow(true);
    }
  };

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
              redirectionUrl: "/virtual-sports",
              title: "Virtual Sports Banner",
            },
            {
              deviceType: "mobile",
              publicUrl:
                "https://cdn.uvwin2024.co/banners/dummy-mobile-banner.webp",
              redirectionUrl: "/virtual-sports",
              title: "Virtual Sports Banner",
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
    getDcGames();
  }, []);

  useEffect(() => {
    if (games.length > 0) {
      setVirtualGames(
        games?.filter(
          (g) => g.subProviderName?.toLowerCase() === "virtual sports"
        )
      );
    }
  }, [games]);

  useEffect(() => {
    fetchBannerData();
  }, []);

  return (
    <div className="dc-page-bg pt-14">
      <SEO
        title={BRAND_NAME}
        name={"Virtual sports"}
        description={"Virtual sports"}
        type={"Virtual sports"}
        link={pathLocation?.pathname}
      />
      {/* <Carousel
        className="casino-web-banners"
        autoPlay={true}
        infiniteLoop={true}
        interval={5000}
        showThumbs={false}
        showStatus={false}
      >
        {apiWebBanners.map((banner) => (
          <div key={banner?.title + 'container'}>
            <img
              className="banner-images"
              src={banner?.publicUrl}
              key={banner?.title + 'image'}
              alt={'banner'}
              onClick={() => {
                navigateToLink(banner)
              }}
            />
          </div>
        ))}
      </Carousel>
      <Carousel
        className="casino-mobile-banners"
        autoPlay={true}
        infiniteLoop={true}
        interval={5000}
        showThumbs={false}
        showStatus={false}
      >
        {getMobileBanners().map((banner) => (
          <div key={banner?.title + 'container'}>
            <img
              className="banner-images"
              src={banner?.publicUrl}
              key={banner?.title + 'image'}
              alt={'banner'}
              onClick={() => {
                navigateToLink(banner)
              }}
            />
          </div>
        ))}
      </Carousel> */}
      <IonRow>
        <IonCol
          sizeLg="9"
          sizeMd="8"
          sizeXs="12"
          className="mt-16 special-carousal"
        >
          <div className="dc-ctn dc-virtual-ctn">
            <div className="casino-header-ctn">
              <div className="casino-heading">
                <div className="casino-icon-img">
                  <img src={LiveCasinoImg} />
                </div>
                Virtual Sports
              </div>
              <div className="casino-search-ctn">
                <div className="eventTypes-menu-tabs"></div>
              </div>
            </div>
            {virtualGames.length > 0 ? (
              <div className="dc-games-ctn">
                {virtualGames.map((g, i) => (
                  <IonCard
                    className="dc-ion-card-1"
                    key={i}
                    onClick={() =>
                      getGameUrl(
                        g.gameId,
                        g.gameName,
                        g.gameCode,
                        g.subProviderName,
                        g.providerName,
                        g.superProviderName
                      )
                    }
                  >
                    <IonCardHeader className="dc-card-ctn tv-game-img">
                      <img
                        src={g.urlThumb ? g.urlThumb : ""}
                        alt={g.gameName}
                        className="dc-img"
                      />
                    </IonCardHeader>
                  </IonCard>
                ))}
              </div>
            ) : (
              <NoDataComponent
                title={"No Virtual Sports"}
                bodyContent={"Currently, no games available"}
                noDataImg={NoVritualSportsIcon}
              />
            )}
          </div>
        </IonCol>
      </IonRow>

      <Dialog
        open={showDialog}
        onClose={() => setDialogShow(false)}
        aria-labelledby="form-dialog-title"
        maxWidth="xs"
        className="login-alert"
      >
        <DialogTitle id="form-dialog-title">Notice</DialogTitle>
        <DialogContent>
          <div className="dc-dialog-body">
            Access required for gameplay. Please log in to proceed.
          </div>
        </DialogContent>
        <DialogActions className="dc-dialog-actions">
          <Button
            onClick={() => setDialogShow(false)}
            className="cancel-btn dialog-action-btn"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              history.push("/login");
              setDialogShow(false);
            }}
            className="login-btn dialog-action-btn"
          >
            Login
          </Button>
        </DialogActions>
      </Dialog>
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
  };
};

export default connect(mapStateToProps, null)(VirtualSports);
