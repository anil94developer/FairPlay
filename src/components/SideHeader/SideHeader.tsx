import React, { useState } from "react";
import { connect } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import { EXCH_COMPETITIONS_MENU } from "../../constants/CommonConstants";
import {
  fetchCompetitions,
  fetchEventsByCompetition,
  getCompetitionsByEventType,
  logout,
  setCompetition,
  setLangSelected,
  toggleDarkMode,
} from "../../store";
import {
  JwtToken,
  demoUser,
  getFieldFromToken,
  notDemoUser,
} from "../../util/stringUtil";
import SocialMediaNew from "../SocialMediaNew/SocialMediaNew";
import "./SideHeader.scss";
import {
  otherMenuTabs,
  securityAndLogout,
  securityAndLogoutForFairplay,
  sideHeaderTabs,
  competitionsData,
} from "./SideHeaderUtil";
import { ChevronRight, KeyboardArrowDown } from "@material-ui/icons";
import { getLangCode } from "../../util/localizationUtil";
import CloseIcon from "@material-ui/icons/Close";
import { getEnvVariable } from "../../constants/whitelabelEnv";
import { domain } from "../../constants/Branding";
import MidnightAqua from "../../assets/images/home/tiles/midnight_aqua.svg";
import DarkFluralIcon from "../../assets/images/home/tiles/darkflural_icon.svg";
import RoyalSunshine from "../../assets/images/home/tiles/royal_sunshine.svg";
import { MenuItem } from "@material-ui/core";
import Logo from "../../assets/images/theme/title.png";
import { languages } from "../../description/languages";
import BonusInformation from "./BonusInformation";
import { EventDTO } from "../../models/common/EventDTO";
import { SelectedObj } from "../../models/ExchangeSportsState";
import { CompetitionDTO } from "../../models/common/CompetitionDTO";
import { DomainConfig } from "../../models/DomainConfig";
import { RootState } from "../../models/RootState";

type Props = {
  loggedIn: boolean;
  logout: Function;
  fetchCompetitions: (eventTypeId: string) => void;
  fetchEventsByCompetition: (
    eventTypeId: string,
    competitionId: string,
    events: EventDTO[],
    track: string
  ) => void;
  setCompetition: (competition: SelectedObj) => void;
  competitions: CompetitionDTO[];
  domainConfig: DomainConfig;
  closeHandler?: Function;
  langData: any;
  langSelected: string;
  setLangSelected: (lang: string) => void;
  toggleDarkMode: (val: string) => void;
};

const themes = [
  { name: "Midnight Aqua", image: MidnightAqua, themeName: "darkgreen" },
  { name: "Royal Sunshine", image: RoyalSunshine, themeName: "purple" },
  {
    name: "Dark Floral Fusion",
    image: DarkFluralIcon,
    themeName: "darkvoilet",
  },
];

const SideHeader = (props: Props) => {
  const {
    loggedIn,
    logout,
    fetchCompetitions,
    fetchEventsByCompetition,
    competitions,
    domainConfig,
    setCompetition,
    closeHandler,
    langData,
    langSelected,
    setLangSelected,
    toggleDarkMode,
  } = props;

  const history = useHistory();

  const getUserShortName = () => {
    const name: string = demoUser()
      ? "Demo User"
      : getFieldFromToken(JwtToken.SUBJECT_NAME);
    return name ? name[0].toUpperCase() : "";
  };

  const handleImgClick = () => {
    closeHandler && closeHandler();
    history.push("/home");
  };

  const setThemeHandler = (data) => {
    localStorage.setItem("userTheme", data);
    toggleDarkMode(data);
  };

  return (
    <div className="side-header">
      <div className="sh-title">
        <button className="sh-website-title" onClick={() => handleImgClick()}>
          <img src={Logo} alt="website" className="sh-website-title-img" />
        </button>
        <button className="sh-button-icon" onClick={() => closeHandler()}>
          <CloseIcon className="sh-close-icon" />
        </button>
      </div>
      <div className="sh-menu">
        <div className="sh-username-img">
          <div className="short-name">D</div>
          <div className="sh-username">Demo User</div>
        </div>
        <div className="sh-sub-menu">
          <SHSportsTab
            tabs={sideHeaderTabs}
            loggedIn={loggedIn}
            setCompetition={setCompetition}
            closeHandler={closeHandler}
            langData={langData}
          />
        </div>
        <div className="sh-sub-menu">
          <div className="sh-sub-title">{langData?.["other_menu"]}</div>
          <SHTab
            tabs={otherMenuTabs}
            loggedIn={loggedIn}
            domainConfig={domainConfig}
            closeHandler={closeHandler}
            langData={langData}
            languages={languages}
            langSelected={langSelected}
            setLangSelected={setLangSelected}
            setThemeHandler={setThemeHandler}
          />
          <BonusInformation />
        </div>

        <div className="sh-sub-menu">
          <div className="sh-sub-title">
            {langData?.["security_and_logout"]}
          </div>
          <SHTab
            tabs={securityAndLogoutForFairplay}
            loggedIn={loggedIn}
            logout={() => logout()}
            closeHandler={closeHandler}
            langData={langData}
            setThemeHandler={setThemeHandler}
          />
        </div>
      </div>
      <div className="social-media-side-bar">
        <SocialMediaNew />
      </div>
    </div>
  );
};

const SHTab = (props: {
  tabs;
  loggedIn;
  logout?;
  domainConfig?: DomainConfig;
  closeHandler: Function;
  setThemeHandler: Function;
  langSelected?: string;
  setLangSelected?: (lang: string) => void;
  langData: any;
  languages?: string[];
}) => {
  const {
    loggedIn,
    tabs,
    logout,
    domainConfig,
    closeHandler,
    langData,
    languages,
    langSelected,
    setLangSelected,
    setThemeHandler,
  } = props;
  const history = useHistory();
  const location = useLocation();

  const [showlanguages, setShowLanguages] = useState<boolean>(false);
  const [showThemeMenu, setShowThemeMenu] = useState<boolean>(false);

  const handleLangChange = (langParam: string) => {
    sessionStorage.setItem("lang", langParam);
    setLangSelected(sessionStorage.getItem("lang"));
    window.location.reload();
  };

  React.useEffect(() => {
    const currentLang = sessionStorage.getItem("lang");
    if (!currentLang || !langSelected) {
      sessionStorage.setItem("lang", "English(EN)");
      setLangSelected && setLangSelected("English(EN)");
    }
  }, [setLangSelected, langSelected]);

  const handleClick = (indv) => {
    if (indv.id === 22) {
      logout();
      return;
    }
    if (indv.id == 26) {
      setShowLanguages(!showlanguages);
      return;
    }
    if (indv.id === 27) {
      setShowThemeMenu(!showThemeMenu);
      return;
    }
    closeHandler && closeHandler();
    history.push(indv.route);
  };

  const shouldShow = (indv) => {
    if (indv.id === 9 || indv.id === 10) {
      return (
        loggedIn &&
        domainConfig?.payments &&
        notDemoUser() &&
        domainConfig?.b2cEnabled
      );
    }
    if (indv.id === 18 || indv.id === 16) {
      return loggedIn && domainConfig?.bonus && domainConfig?.b2cEnabled;
    }
    if (indv.id === 13) {
      return loggedIn && domainConfig?.affiliate && domainConfig?.b2cEnabled;
    }
    if (indv.id === 25) {
      return (
        loggedIn &&
        domainConfig?.depositWagering &&
        domainConfig.b2cEnabled &&
        domainConfig.bonus
      );
    }
    if (indv.id === 24 || indv.id === 19) {
      return domainConfig?.b2cEnabled && domainConfig?.bonus;
    }
    if (indv.id === 27) {
      return window.location.hostname.includes("ultrawin");
    }
    return indv.showWithoutLogin || loggedIn;
  };

  const isRouteActive = (route: string, id: number) => {
    const currentPath = location.pathname;
    const searchParams = new URLSearchParams(location.search);

    const [routePath, routeQuery] = route.split("?");

    if (currentPath !== routePath) {
      return false;
    }

    if (routePath === "/profile") {
      const currentTab = searchParams.get("tab");

      if (id === 21) {
        return !currentTab || currentTab !== "2";
      }

      if (id === 28) {
        return currentTab === "2";
      }
    }

    if (routeQuery) {
      const routeParams = new URLSearchParams(routeQuery);
      for (const [key, value] of routeParams.entries()) {
        if (searchParams.get(key) !== value) {
          return false;
        }
      }
      return true;
    }

    return !location.search;
  };

  return (
    <>
      {tabs.map((indv) => (
        <React.Fragment key={indv.id}>
          <button
            className={`${
              isRouteActive(indv.route, indv.id) ? "active-sh-btn" : ""
            } sh-btn`}
            onClick={() => handleClick(indv)}
            style={{ animation: indv.blink ? "blink 1s infinite" : "none" }}
          >
            <indv.img
              className={`sh-img ${
                ["logout", "languages"].includes(indv.text.toLowerCase())
                  ? "logout-icon"
                  : ""
              }`}
              alt=""
            />
            <div className="content">
              <div className="sh-tab-label">
                {indv.id == 26
                  ? (langData?.[indv.langKey] || indv.text) +
                    " : " +
                    getLangCode(langSelected)
                  : langData?.[indv.langKey] || indv.text}
              </div>
              {indv.id == 26 && (
                <div>
                  {!showlanguages ? (
                    <ChevronRight className="arrow-img"></ChevronRight>
                  ) : (
                    <KeyboardArrowDown className="arrow-img"></KeyboardArrowDown>
                  )}
                </div>
              )}
            </div>
          </button>
          {indv.id === 26 && languages?.length > 0 && showlanguages && (
            <div className="lang-select-menu">
              <div className="lang-menu">
                {languages.map((language, langInd) => {
                  return (
                    <div
                      className="sh-btn"
                      onClick={() => handleLangChange(language)}
                      key={langInd}
                    >
                      {language.replace("(", " (")}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </React.Fragment>
      ))}

      {showThemeMenu &&
        window.location.hostname.includes("ultrawin") &&
        themes.map((theme, index) => (
          <React.Fragment key={index}>
            <div
              className="sh-btn"
              onClick={() => {
                localStorage.setItem("userTheme", theme.themeName);
                setThemeHandler(theme.themeName);
              }}
            >
              <img src={theme.image} />
              <span>{theme.name}</span>
            </div>
          </React.Fragment>
        ))}
    </>
  );
};

const SHSportsTab = (props: {
  tabs;
  loggedIn;
  setCompetition;
  closeHandler;
  langData;
}) => {
  const { loggedIn, tabs, setCompetition, closeHandler, langData } = props;
  const history = useHistory();
  const [selcompetition, setSelCompetition] = useState<any>(null);
  const [showDropDown, setShowDropDown] = useState<{ [key: string]: boolean }>(
    {}
  );

  const handleClick = (indv) => {
    setShowDropDown((prev) => ({
      ...prev,
      [indv.id]: !prev[indv.id],
    }));
    history.push(indv.route);
  };

  const handleCompetitionClick = (indv, compt) => {
    setSelCompetition(compt.competitionId);
    setCompetition({
      id: compt.competitionId,
      name: compt.competitionName,
      slug: compt.competitionName.toLowerCase().replace(/\s+/g, "-"),
    });
    closeHandler && closeHandler();
    const slug = compt.competitionName.toLowerCase().replace(/\s+/g, "-");
    history.push(`/exchange_sports/${indv.text}/${slug}`);
  };

  // Get competitions for a specific sport
  const getCompetitionsForSport = (sportId: string) => {
    return competitionsData
      .filter((comp) => comp.sportId === sportId && comp.enabled)
      .sort((a, b) => a.competitionName.localeCompare(b.competitionName));
  };

  return (
    <>
      {tabs.map(
        (indv, index) =>
          (indv.showWithoutLogin || loggedIn) && (
            <React.Fragment key={index}>
              <button
                className={`${
                  window.location.pathname.includes(indv.route)
                    ? "active-sh-btn"
                    : ""
                } sh-btn`}
                key={index}
                onClick={() => handleClick(indv)}
              >
                <indv.img className="sh-img" alt="" />
                <div className="sh-tab-label">
                  {langData?.[indv.langKey] || indv.text}
                </div>
              </button>
              {showDropDown[indv.id] &&
                getCompetitionsForSport(indv.id).map((competition) => (
                  <button
                    className={`indv-competition ${
                      selcompetition === competition.competitionId
                        ? "indv-competition-active"
                        : ""
                    }`}
                    key={competition.competitionId}
                    onClick={() => handleCompetitionClick(indv, competition)}
                  >
                    {competition.competitionName}
                  </button>
                ))}
            </React.Fragment>
          )
      )}
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    loggedIn: true,
    competitions: getCompetitionsByEventType(
      state.exchangeSports.competitions,
      state.exchangeSports.selectedEventType?.id || ""
    ),
    domainConfig: state.common.domainConfig,
    langData: state.common.langData,
    langSelected: state.common.langSelected,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    logout: () => dispatch(logout()),
    fetchCompetitions: (eventTypeId: string) =>
      dispatch(fetchCompetitions(eventTypeId)),
    fetchEventsByCompetition: (
      eventTypeId: string,
      competitionId: string,
      events: EventDTO[],
      track: string
    ) =>
      dispatch(
        fetchEventsByCompetition(eventTypeId, competitionId, events, track)
      ),
    setCompetition: (competition: SelectedObj) =>
      dispatch(setCompetition(competition)),
    setLangSelected: (lang: string) => dispatch(setLangSelected(lang)),
    toggleDarkMode: (val: string) => dispatch(toggleDarkMode(val)),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(SideHeader);
