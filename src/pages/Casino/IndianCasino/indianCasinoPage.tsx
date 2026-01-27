import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import "../CasinoNew/CasinoNew.scss";
import { RootState } from "../../../models/RootState";
import { DcGameNew } from "../../../models/dc/DcGame";
import CasinoView from "../../../constants/CasinoView";
import { AxiosResponse } from "axios";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import SVLS_API from "../../../api-services/svls-api";
import { BRAND_DOMAIN, BRAND_NAME } from "../../../constants/Branding";
import SEO from "../../../components/SEO/Seo";
import { AuthResponse } from "../../../models/api/AuthResponse";
import { ReactComponent as LiveCasinoImg } from "../../../assets/images/casino/live_casino.svg?react";
import { IonCol, IonRow } from "@ionic/react";
import { useWindowSize } from "../../../hooks/useWindowSize";

type StoreProps = {
  loggedIn: boolean;
};

const WebBanners = CasinoView.IND_CASINO_WEB_BANNERS;
const MobileBanners = CasinoView.IND_CASINO_MOBILE_BANNERS;

const IndianCasinoPage: React.FC<StoreProps> = (props) => {
  const windowSize = useWindowSize();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const { loggedIn } = props;
  const [games, setGames] = useState<DcGameNew[]>([]);
  const [apiWebBanners, setApiWebBanners] = useState([]);
  const [apiMobBanners, setApiMobBanners] = useState([]);

  const history = useHistory();
  const pathLocation = useLocation();

  const setDialogShow = (show: boolean) => {
    setShowDialog(show);
  };

  const getDcGames = async () => {
    const response: AxiosResponse<DcGameNew[]> = await SVLS_API.get(
      "/catalog/v2/indian-casino/games",
      {
        params: {
          providerId: "RG",
        },
      }
    );

    setGames(response?.data?.filter((g) => g.providerName === "RG"));
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
      // if (loggedInUserStatus === 0 || loggedInUserStatus === 3) {
      history.push(`/home`);
      // }

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
              redirectionUrl: "/casino/indian",
              title: "Indian Casino Banner",
            },
            {
              deviceType: "mobile",
              publicUrl:
                "https://cdn.uvwin2024.co/banners/dummy-mobile-banner.webp",
              redirectionUrl: "/casino/indian",
              title: "Indian Casino Banner",
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
      if (webdata.length == 0) {
        setApiWebBanners(WebBanners);
      }
      if (mobiledata.length == 0) {
        setApiMobBanners(MobileBanners);
      }
      console.log(apiWebBanners.length);
    } catch (err) {
      if (webdata.length == 0) {
        setApiWebBanners(WebBanners);
      }
      if (mobiledata.length == 0) {
        setApiMobBanners(MobileBanners);
      }
      console.log(err);
      //setShowError(true);
      if (err.response && err.response.status === 400) {
        //setErrorText(err.response.data.message);
      } else {
        //setErrorText('Something went wrong');
      }
    }
  };

  useEffect(() => {
    getDcGames();
  }, [loggedIn]);

  useEffect(() => {
    fetchBannerData();
  }, []);

  const navigateToLink = (data) => {
    if (
      data?.redirectionUrl == "/exchange_sports/inplay" ||
      data?.redirectionUrl == "/casino" ||
      data?.redirectionUrl == "/exchange_sports/cricket" ||
      data?.redirectionUrl == "/exchange_sports/tennis" ||
      data?.redirectionUrl == "/exchange_sports/football"
    ) {
      history.push(data?.redirectionUrl);
    } else if (data?.redirectionUrl == "nourl") {
    } else if (data.url) {
      history.push(data.url);
    } else {
      let url = data?.redirectionUrl;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="dc-page-bg pt-14">
      <SEO
        title={BRAND_NAME}
        name={"Indian casino page"}
        description={"Indian casino page"}
        type={"Indian casino page"}
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
        {apiMobBanners.map((banner) => (
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
          <div className="dc-ctn dc-indian-ctn">
            <div className="casino-header-ctn">
              <div className="casino-heading">
                <div className="casino-icon-img">
                  <img src={LiveCasinoImg} />
                </div>
                Indian Casino
              </div>
              <div className="casino-search-ctn">
                <div className="eventTypes-menu-tabs"></div>
              </div>
            </div>
            <div className="dc-games-ctn">
              {games.map((g, idx) => (
                <Card
                  className="dc-ion-card"
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
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      alt={g.gameName}
                      className="dc-card-media"
                      image={g.urlThumb ? g.urlThumb : ""}
                      title={g.gameName}
                    />
                    <CardContent className="dc-card-ctn">
                      <Typography gutterBottom className="game-name">
                        {g.gameName}
                      </Typography>
                      {loggedIn && g.minLimits && g.maxLimits ? (
                        <Typography variant="caption" className="game-range">
                          {g.minLimits} - {g.maxLimits}
                        </Typography>
                      ) : null}
                    </CardContent>
                  </CardActionArea>
                </Card>
              ))}
            </div>
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

export default connect(mapStateToProps, null)(IndianCasinoPage);
