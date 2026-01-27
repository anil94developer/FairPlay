import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import React, { lazy, Suspense, useEffect, useState } from "react";
import { useIdleTimer } from "react-idle-timer";
import { connect } from "react-redux";
import { Switch } from "react-router";
import { BrowserRouter, Route } from "react-router-dom";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */

/* Theme variables */
import "./App.scss";
import "./theme/variables.scss";

import { HelmetProvider } from "react-helmet-async";

import { BRAND_NAME, domain } from "./constants/Branding";
import LoadingPage from "./pages/LoadingPage/LoadingPage";
import { fetchMailVerifiedSuccess, logout, setLangData } from "./store";
import {
  setAlertMsg,
  setDomainConfig,
  setLangSelected,
  setLanguages,
} from "./store/common/commonActions";
import {
  defaultLang,
  getLang,
  getLangCode,
  getSelectedLang,
  getUpdatedSelectedLang,
} from "./util/localizationUtil";
import LANG_API from "./api-services/language-api";
import { getEnvVariable } from "./constants/whitelabelEnv";
import Maintenance from "./pages/Maintenance/Maintenance";

const SignUp = lazy(() => import("./pages/SignUp/SignUp"));
const LoginPage = lazy(() => import("./pages/Login/LoginPage"));
const ResetPassword = lazy(
  () => import("./pages/ResetPasswordPage/ResetPasswordPage")
);
const AccessRedirect = lazy(
  () => import("./pages/AccessRedirect/AccessRedirect")
);
const AcceptTerms = lazy(() => import("./pages/AcceptTerms/AcceptTerms"));
const ForgotPwdForm = lazy(
  () => import("./components/ForgotPassword/ForgotPassword")
);
const MainPage = lazy(() => import("./router/UserRouter"));

type StateProps = {
  fetchMailVerifiedSuccess: (mailVerified: boolean) => void;
  logout: () => void;
  mailVerified: boolean;
  prefersDark: string;
  loggedIn: boolean;
  setLanguages: (languages: string[]) => void;
  setLangSelected: (lang: string) => void;
  setLangData: (langData: any) => void;
  langData: any;
  setAlertMsg: Function;
  // setDomainConfig: (config: DomainConfig) => void;
};

const loadTheme = () => {
  // const cssFolderName = getEnvVariable(domain, "FOLDER_NAME") || "default.css";
  const cssFilePath = `/theme/variables.css`;

  // Check if an existing theme file is already loaded
  let existingLink = document.getElementById("site-theme");

  if (existingLink) {
    // Replace existing theme
    existingLink.setAttribute("href", cssFilePath);
  } else {
    // Create new theme link
    const link = document.createElement("link");
    link.id = "site-theme";
    link.rel = "stylesheet";
    link.href = cssFilePath;
    document.head.appendChild(link);
  }
};

const updateFavicon = () => {
  let link: any = document.querySelector("link[rel~='icon']");

  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  link.setAttribute("href", getEnvVariable(domain, "favicon"));
};

const updateTitle = () => {
  document.title = BRAND_NAME;
};

const updateManifest = () => {
  try {
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      const manifest = {
        short_name: BRAND_NAME,
        name: BRAND_NAME,
      };

      const blob = new Blob([JSON.stringify(manifest, null, 2)], {
        type: "application/json",
      });
      const manifestUrl = URL.createObjectURL(blob);
      manifestLink.setAttribute("href", manifestUrl);
    }

    const appleMobileWebAppTitle = document.querySelector(
      'meta[name="apple-mobile-web-app-title"]'
    );
    // if (appleMobileWebAppTitle) {
    //   appleMobileWebAppTitle.setAttribute("content", BRAND_NAME);
    // }
  } catch (error) {
    console.error("Error updating manifest:", error);
  }
};

const App: React.FC<StateProps> = (props) => {
  const consoleOpen = useConsoleOpen();
  const helmetContext = {};
  // const consoleOpen = false;

  const {
    logout,
    prefersDark,
    loggedIn,
    setLanguages,
    setLangSelected,
    setLangData,
    langData,
    setAlertMsg,
    // setDomainConfig,
  } = props;

  // TODO: make sport book call from here.
  const lang = getLang(sessionStorage?.getItem("lang") || "");

  useEffect(() => {
    const selectedTheme = localStorage.getItem("userTheme");
    if (selectedTheme) {
      let a = ["darkgreen", "purple", "darkvoilet"];
      a.splice(a.indexOf(prefersDark), 1);
      document.body.classList.remove(...a);
      document.body.classList.toggle(prefersDark, true);
    } else {
      localStorage.setItem("userTheme", "darkgreen");
      document.body.classList.add("darkgreen");
    }
  }, [prefersDark]);

  const handleOnIdle = () => {
    console.log("user is idle");
    if (loggedIn) {
      logout();
    }
  };

  const handleClose = () => {
    console.log("user open dev tools");
  };

  useIdleTimer({
    timeout: 1000 * 60 * 60 * 2, // 2 hours
    onIdle: handleOnIdle,
    debounce: 500,
  });

  useEffect(() => {
    // TODO: this should only be called once.
    // Load theme file
    loadTheme();
    // Load favicon
    // updateFavicon();
    // Update title
    updateTitle();
    // updateManifest();
  }, []);

  useEffect(() => {
    if (lang) {
      getLangData();
    }
  }, [lang]);

  const getLangData = async () => {
    try {
      var langCode = getLangCode(lang)?.toLowerCase();
      const response = await LANG_API.get(`/languages/${langCode}/lang.json`);
      const data = await response.data;
      if (data) {
        setLangData(data);
      } else {
        setDefaultLangData();
      }
    } catch (error) {
      console.error("Error getting language data:", error);
      setDefaultLangData();
    }
  };

  const setDefaultLangData = () => {
    sessionStorage.setItem("lang", defaultLang);
    setLangSelected(defaultLang);
    setLangData("");
  };

  return (
    <>
      <HelmetProvider context={helmetContext}>
        {!consoleOpen ? (
          <Suspense fallback={<LoadingPage />}>
            <BrowserRouter>
              <Switch>
                <Route path="/access-redirect" component={AccessRedirect} />
                <Route path="/terms-and-conditions" component={AcceptTerms} />
                <Route path="/reset-password" component={ResetPassword} />
                <Route path="/login" component={LoginPage} />
                <Route path="/register" component={SignUp} />
                <Route path="/forgot-password" component={ForgotPwdForm} />
                <Route path="/maintenance" component={Maintenance} />
                <Route path="/" component={MainPage} />
              </Switch>
            </BrowserRouter>
          </Suspense>
        ) : null}
      </HelmetProvider>

      <Dialog
        open={consoleOpen}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
        fullWidth={true}
        className="dev-tools-msg-modal"
      >
        <DialogContent className="modal-content-ctn">
          <div className="dev-tools-warning-msg">
            {" " + langData?.["app_security_txt"]}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const useConsoleOpen = () => {
  const [consoleOpen, setConsoleOpen] = useState(false);

  useEffect(() => {
    let checkStatus;

    var element = new Image();
    Object.defineProperty(element, "id", {
      get: function () {
        checkStatus = true;
        throw new Error("Dev tools checker");
      },
    });
    requestAnimationFrame(function check() {
      setTimeout(() => {
        checkStatus = false;
        setConsoleOpen(checkStatus);
        requestAnimationFrame(check);
      }, 1000);
    });
  });

  return consoleOpen;
};

const mapStateToProps = (state: any) => {
  return {
    mailVerified: state.auth.mailVerified,
    prefersDark: state.common.prefersDark,
    loggedIn: state.auth.loggedIn,
    langData: state.common.langData,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    fetchMailVerifiedSuccess: (mailVerified: boolean) =>
      dispatch(fetchMailVerifiedSuccess(mailVerified)),
    logout: () => dispatch(logout()),
    setLanguages: (languages: string[]) => dispatch(setLanguages(languages)),
    setLangSelected: (lang: string) => dispatch(setLangSelected(lang)),
    setLangData: (langData: any) => dispatch(setLangData(langData)),
    setDomainConfig: (config: any) => dispatch(setDomainConfig(config)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
