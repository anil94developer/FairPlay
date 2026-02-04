import React, { useState, useEffect } from "react";
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
import { getStaticSportsData, transformSportsToTabs, SportTabData } from "../../util/sportsApiUtil";
import USABET_API from "../../api-services/usabet-api";
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
  const [sportsTabs, setSportsTabs] = useState<SportTabData[]>(sideHeaderTabs);

  useEffect(() => {
    // Use static sports data instead of fetching from API
    const sports = getStaticSportsData();
    if (sports.length > 0) {
      const transformedTabs = transformSportsToTabs(sports);
      setSportsTabs(transformedTabs);
    }
  }, []);

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
            tabs={sportsTabs}
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

interface CompetitionData {
  competitionId: string;
  competitionName: string;
  sportId: string;
  sportName: string;
  enabled: boolean;
}

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
  const [sportCompetitions, setSportCompetitions] = useState<{
    [sportId: string]: CompetitionData[];
  }>({});

  // Fetch competitions from API
  useEffect(() => {
    const fetchCompetitionsFromAPI = async () => {
      try {
        const response = await USABET_API.get("/match/homeMatchesOpen");
        if (response?.data?.status === true && Array.isArray(response.data.data)) {
          const matches = response.data.data;
          
          // Group by sport_id and extract unique series/competitions
          const competitionsMap: { [sportId: string]: Map<string, CompetitionData> } = {};
          
          matches.forEach((match: any) => {
            const sportId = String(match.sport_id || match.sportId || "");
            const sportName = match.sport_name || match.sportName || "";
            const seriesId = String(match.series_id || match.seriesId || match.competitionId || "");
            const seriesName = match.series_name || match.seriesName || match.competitionName || "";
            
            // Skip if missing required data
            if (!sportId || !seriesId || !seriesName) {
              return;
            }

            // Some feeds return a "series" equal to the sport itself for racing
            // e.g. sport_id: "7" & series_id: "7" & series_name: "Horse Racing".
            // This is not a real competition and breaks series_id filtering.
            if (
              String(seriesId).trim() === String(sportId).trim() ||
              String(seriesName).trim().toLowerCase() === String(sportName).trim().toLowerCase()
            ) {
              return;
            }
            
            // Initialize sport map if not exists
            if (!competitionsMap[sportId]) {
              competitionsMap[sportId] = new Map();
            }
            
            // Add unique competition (use seriesId as key to avoid duplicates)
            if (!competitionsMap[sportId].has(seriesId)) {
              competitionsMap[sportId].set(seriesId, {
                competitionId: seriesId,
                competitionName: seriesName,
                sportId: sportId,
                sportName: sportName,
                enabled: true,
              });
            }
          });
          
          // Convert Map to array for each sport
          const competitionsBySport: { [sportId: string]: CompetitionData[] } = {};
          Object.keys(competitionsMap).forEach((sportId) => {
            competitionsBySport[sportId] = Array.from(competitionsMap[sportId].values())
              .sort((a, b) => a.competitionName.localeCompare(b.competitionName));
          });
          
          setSportCompetitions(competitionsBySport);
          
          if (process.env.NODE_ENV === 'development') {
            console.log('[SHSportsTab] Loaded competitions from API:', competitionsBySport);
          }
        }
      } catch (error) {
        console.error("Error fetching competitions from API:", error);
        // Fallback to static data on error
        const fallbackCompetitions: { [sportId: string]: CompetitionData[] } = {};
        competitionsData.forEach((comp) => {
          if (!fallbackCompetitions[comp.sportId]) {
            fallbackCompetitions[comp.sportId] = [];
          }
          fallbackCompetitions[comp.sportId].push({
            competitionId: comp.competitionId,
            competitionName: comp.competitionName,
            sportId: comp.sportId,
            sportName: "",
            enabled: comp.enabled,
          });
        });
        setSportCompetitions(fallbackCompetitions);
      }
    };
    
    fetchCompetitionsFromAPI();
  }, []);

  const handleClick = (indv) => {
    setShowDropDown((prev) => ({
      ...prev,
      [indv.id]: !prev[indv.id],
    }));
    history.push(indv.route);
  };

  const handleCompetitionClick = (indv, compt) => {
    setSelCompetition(compt.competitionId);
    
    // Derive sport slug from tab route to avoid mismatches like Soccer(text) vs Football(route)
    // Example: indv.route = "/exchange_sports/football" -> sportSlug = "football"
    const sportSlugFromRoute =
      typeof indv?.route === "string" && indv.route.includes("/exchange_sports/")
        ? indv.route.split("/exchange_sports/")[1]?.split("/")[0]
        : null;

    // Generate competition slug from name
    const competitionSlug = compt.competitionName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, " ")
      .replace(/ +/g, " ")
      .trim()
      .split(" ")
      .join("-");
    
    // Set competition in Redux store with series_id
    setCompetition({
      id: compt.competitionId, // This is the series_id
      name: compt.competitionName,
      slug: competitionSlug,
    });
    
    closeHandler && closeHandler();
    
    // Navigate to competition page with series_id as query parameter
    const sportSlug = sportSlugFromRoute || indv.text;
    const url = `/exchange_sports/${sportSlug}/${competitionSlug}?series_id=${compt.competitionId}`;
    history.push(url);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[SHSportsTab] Navigated to competition:', {
        sportId: indv.id,
        sportName: indv.text,
        sportSlug,
        seriesId: compt.competitionId,
        seriesName: compt.competitionName,
        slug: competitionSlug,
        url: url
      });
    }
  };

  // Get competitions for a specific sport from API data or fallback to static data
  const getCompetitionsForSport = (sportId: string): CompetitionData[] => {
    // Try API data first
    if (sportCompetitions[sportId] && sportCompetitions[sportId].length > 0) {
      return sportCompetitions[sportId];
    }
    
    // Fallback to static data
    return competitionsData
      .filter((comp) => comp.sportId === sportId && comp.enabled)
      .map((comp) => ({
        competitionId: comp.competitionId,
        competitionName: comp.competitionName,
        sportId: comp.sportId,
        sportName: "",
        enabled: comp.enabled,
      }))
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
