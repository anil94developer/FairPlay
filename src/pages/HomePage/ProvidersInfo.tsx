import React from "react";
import { Box, IconButton, makeStyles } from "@material-ui/core";

import Slider from "react-slick";
import { isMobile } from "react-device-detect";
import {
  CasinoProvidersIcons,
  CasinoProvidersIcons2,
  CasinoProvidersIcons3,
} from "../Casino/CasinoSideBar/CasinoProvidersIcons";
import { useHistory } from "react-router";
import {
  ArrowBackIosRounded,
  ArrowForwardIosRounded,
} from "@material-ui/icons";
import { HomeMobProvidersIcons, HomeProvidersIcons } from "./HomePageUtils";

const providerSettings = {
  dots: true,
  infinite: true,
  speed: 1000,
  slidesToShow: isMobile ? 5 : 7,
  slidesToScroll: 1,
  arrows: false,
  autoplay: true,
  autoplaySpeed: 1500,
  pauseOnHover: true,
};

const useStyles = makeStyles((theme) => ({
  buttonContainer: {
    position: "relative",
    width: "40px",
    height: "40px",
    borderRadius: "9px",
    background: "var(--carousel-arrow-btn)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      width: "32px",
      height: "32px",
    },
  },
  prevButton: {
    position: "absolute",
    top: "-58px",
    right: "45px",
    [theme.breakpoints.down("sm")]: {
      top: "-48px",
      right: "36px",
    },
  },
  nextButton: {
    position: "absolute",
    top: "-58px",
    right: "0",
    [theme.breakpoints.down("sm")]: {
      top: "-48px",
    },
  },
  icon: {
    color: "#ffffff",
    zIndex: 1, // Ensure the icon is above the gradient border
  },
  iconHeight: {
    height: "12px",
  },
}));

const SamplePrevArrow = (props) => {
  const { className, style, onClick } = props;
  const classes = useStyles();

  return (
    <div
      onClick={onClick}
      className={classes.buttonContainer + " " + classes.prevButton}
    >
      <IconButton className={classes.icon}>
        <ArrowBackIosRounded
          className={classes.iconHeight}
          style={{ color: "#FFFFFF" }}
          height="12px"
        />
      </IconButton>
    </div>
  );
};

function SampleNextArrow(props) {
  const { className, style, onClick } = props;
  const classes = useStyles();

  return (
    <div
      onClick={onClick}
      className={classes.buttonContainer + " " + classes.nextButton}
    >
      <IconButton className={classes.icon}>
        <ArrowForwardIosRounded
          className={classes.iconHeight}
          style={{ color: "#FFFFFF" }}
        />
      </IconButton>
    </div>
  );
}

const settings = {
  responsive: [
    {
      breakpoint: 1000,
      settings: {
        slidesToShow: 6,
        slidesToScroll: 3,
      },
    },
    {
      breakpoint: 800,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 3,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 3,
      },
    },
  ],
  dots: false,
  infinite: true,
  speed: 500,
  slidesToShow: isMobile ? 3 : 7,
  // slidesToScroll: isMobile ? 3 : 7,
  swipeToSlide: true,
  rows: isMobile ? 6 : 2,
  arrows: !isMobile,
  autoplaySpeed: 1500,
  pauseOnHover: true,
  nextArrow: <SampleNextArrow to="next" />,
  prevArrow: <SamplePrevArrow to="prev" />,
};

const Providers = ({ langData }) => {
  const history = useHistory();
  return (
    <div className="game-carousel-ctn mb-30">
      <div className="border-shadow-container">
        <span className="text">{langData?.["casino_lobby"]}</span>
      </div>
      {isMobile ? (
        <div className="mob-casino-lobby">
          {(isMobile ? HomeMobProvidersIcons : HomeProvidersIcons)?.map(
            (provider) => (
              <div
                key={provider.subProviderName}
                onClick={() => {
                  history.push({
                    pathname: "/casino",
                    search: `?provider=${encodeURIComponent(
                      provider.subProviderName
                    )}&category=ALL`,
                  });
                }}
                className="cursor-pointer provider-box"
              >
                <div className="provider-img-box">
                  <img
                    className="home-casino-img mb-4"
                    src={provider?.icon}
                    loading="lazy"
                    alt={provider.subProviderName}
                  />
                  {/* <div className="play-now">
                <div className="play-now-text">Play Now</div>
              </div> */}

                  {/* <div className="play-animated">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div> Play Now{' '}
                  </div> */}
                </div>
              </div>
            )
          )}
        </div>
      ) : (
        <Slider {...settings}>
          {(isMobile ? HomeMobProvidersIcons : HomeProvidersIcons)?.map(
            (provider) => (
              <div
                key={provider.subProviderName}
                onClick={() => {
                  history.push({
                    pathname: "/casino",
                    search: `?provider=${encodeURIComponent(
                      provider.subProviderName
                    )}&category=ALL`,
                  });
                }}
                className="cursor-pointer provider-box"
              >
                <div className="provider-img-box">
                  <img
                    className="home-casino-img mb-4"
                    src={provider?.icon}
                    loading="lazy"
                    alt={provider.subProviderName}
                  />
                  {/* <div className="play-now">
                <div className="play-now-text">Play Now</div>
              </div> */}

                  {/* <div className="play-animated">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div> Play Now{' '}
                  </div> */}
                </div>
              </div>
            )
          )}
        </Slider>
      )}
    </div>
  );
};

export default Providers;
