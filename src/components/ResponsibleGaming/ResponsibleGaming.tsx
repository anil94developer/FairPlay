import { IonButtons, IonCol, IonRow } from "@ionic/react";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import begamble from "../../assets/images/faricimage/image-rule/begamble.png";
import gamcare from "../../assets/images/faricimage/image-rule/gamcare.png";
import gamstop from "../../assets/images/faricimage/image-rule/gamstop.png";
import { ReactComponent as termsAndConditionsIcon } from "../../assets/images/icons/termsAndPolicy.svg?react";
import defaultLangTcData from "../../description/default-lang-tc.json";
import { RootState } from "../../models/RootState";
import { AboutUsRules } from "../../socialmedialink/AboutUsRules";
import { ResponsibleGamingLink } from "../../socialmedialink/ResponsibleGamingLink";
import { ResponsibleGamingRules } from "../../socialmedialink/ResponsibleGamingRules";
import { RulesRegulations } from "../../socialmedialink/RulesRegulations";
import AppTitleHeader from "../MyBets/MyBetsTitleContainer";
import "./ResponsibleGaming.scss";
import { getLangCode } from "../../util/localizationUtil";
import LANG_API from "../../api-services/language-api";
import { fairplay_policy } from "../../socialmedialink/FairplayPolicy";
import { fairplay_terms } from "../../socialmedialink/FairplayTerms";

type TermsProps = {
  name?: string;
  eventTypeID: string;
  langSelected: string;
  langData: any;
};

const ResponsibleGaming: React.FC<TermsProps> = (props) => {
  const { eventTypeID, langSelected, langData } = props;
  const socialmedialink = ResponsibleGamingLink;
  const [tc, setTc] = useState<any>(null);

  const onLink = (linkname: string) => {
    socialmedialink.forEach((element) => {
      if (element.name === linkname && element.link !== "") {
        let urlLink = element.link;
        window.open(urlLink, "_blank");
      }
    });
  };

  // TODO: should I use a state for this.
  // TODO: move this to common place
  const getLangTcData = () => {
    setTc(defaultLangTcData);
  };

  useEffect(() => {
    if (eventTypeID === "Terms and conditions") {
      getLangTcData();
    }
  }, []);

  return (
    <IonRow>
      <IonCol sizeXl="9" sizeXs="12">
        <div className="odds-terms-condi-ctn">
          {eventTypeID === "Responsible Gaming" ? (
            <>
              {/* Note: This is not used. Add localization for this before using */}
              {ResponsibleGamingRules.map((r, index) => (
                <Accordion className="rules-accordion">
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography>{r.category?.toLocaleLowerCase()}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {r.rules.map((r, index) => (
                      <p className="conditions-paragraph">{r}</p>
                    ))}
                    {r.image === "true" ? (
                      <>
                        <IonButtons className="social-media-group">
                          <div>
                            <img
                              className="footer-logo-mob"
                              src={begamble}
                              onClick={() => onLink("begambleaware")}
                            />
                          </div>
                          <div>
                            <img
                              className="footer-logo-mob"
                              src={gamcare}
                              onClick={() => onLink("gamcare")}
                            />
                          </div>
                          <div>
                            <img
                              className="footer-logo-mob"
                              src={gamstop}
                              onClick={() => onLink("gamstop")}
                            />
                          </div>
                        </IonButtons>
                      </>
                    ) : null}
                  </AccordionDetails>
                </Accordion>
              ))}
            </>
          ) : null}

          {eventTypeID === "About Us" ? (
            <>
              {/* Note: This is not used. Add localization for this before using */}
              {AboutUsRules.map((r, index) => (
                <Accordion className="rules-accordion" expanded>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography>{r.category?.toLocaleLowerCase()}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {r.rules.map((r, index) => (
                      <p className="conditions-paragraph">{r}</p>
                    ))}
                    {r.image === "true" ? (
                      <>
                        <IonButtons className="social-media-group">
                          <div>
                            <img
                              className="footer-logo-mob"
                              src={begamble}
                              onClick={() => onLink("begambleaware")}
                            />
                          </div>
                          <div>
                            <img
                              className="footer-logo-mob"
                              src={gamcare}
                              onClick={() => onLink("gamcare")}
                            />
                          </div>
                          <div>
                            <img
                              className="footer-logo-mob"
                              src={gamstop}
                              onClick={() => onLink("gamstop")}
                            />
                          </div>
                        </IonButtons>
                      </>
                    ) : null}
                  </AccordionDetails>
                </Accordion>
              ))}
            </>
          ) : null}

          {eventTypeID === "Terms and conditions" ? (
            <div className="terms-conditions-ctn">
              <AppTitleHeader
                icon={termsAndConditionsIcon}
                title={langData?.["tc_header_txt"]}
              />
              <div className="note">
                {tc?.["notes"].map((r, i) => {
                  return (
                    <p className="note-content-text">
                      {i === 0 ? null : `${i}. `} {r}
                    </p>
                  );
                })}
              </div>
              {tc?.["tc"].map((r, index) => {
                if (!isNaN(+r.split(" ")[0])) {
                  return <p className="conditions-paragraph-title">{r}</p>;
                } else {
                  return (
                    <p className="conditions-paragraph terms-policy">{r}</p>
                  );
                }
              })}
            </div>
          ) : null}
          {eventTypeID === "Rules and regulations" ? (
            <>
              {/* Note: This is not used. Add localization for this before using */}
              {RulesRegulations.map((r, index) => (
                <Accordion className="rules-accordion" expanded>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography>{r.category?.toLocaleLowerCase()}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    {r.rules.map((r, index) => (
                      <p className="conditions-paragraph">{r}</p>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}
            </>
          ) : null}

          {eventTypeID === "fairplay_policy" ? (
            <div className="terms-conditions-ctn">
              <AppTitleHeader
                icon={termsAndConditionsIcon}
                title={langData?.["privacy_policy"]}
              />
              <div className="note">
                {/* {fairplay_policy[0]?.rules?.map((r, i) => {
                    return (
                      <p className="note-content-text">
                        {i === 0 ? null : `${i}. `} {r}
                      </p>
                    );
                  })} */}
              </div>
              {fairplay_policy[0]?.rules?.map((r, index) => {
                if (!isNaN(+r.split(" ")[0])) {
                  return <p className="conditions-paragraph-title">{r}</p>;
                } else {
                  return (
                    <p className="conditions-paragraph terms-policy">{r}</p>
                  );
                }
              })}
            </div>
          ) : null}

          {eventTypeID === "fairplay_terms" ? (
            <div className="terms-conditions-ctn">
              <AppTitleHeader
                icon={termsAndConditionsIcon}
                title={langData?.["terms_conditions"]}
              />
              <div className="note">
                {/* {fairplay_policy[0]?.rules?.map((r, i) => {
                    return (
                      <p className="note-content-text">
                        {i === 0 ? null : `${i}. `} {r}
                      </p>
                    );
                  })} */}
              </div>
              {fairplay_terms[0]?.rules?.map((r, index) => {
                if (!isNaN(+r.split(" ")[0])) {
                  return <p className="conditions-paragraph-title">{r}</p>;
                } else {
                  return (
                    <p className="conditions-paragraph terms-policy">{r}</p>
                  );
                }
              })}
            </div>
          ) : null}
        </div>
      </IonCol>
      <IonCol sizeXl="3" className="web-view">
        {/* <PromotionSidebar /> */}
      </IonCol>
    </IonRow>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    langSelected: state.common.langSelected,
    langData: state.common.langData,
  };
};

export default connect(mapStateToProps, null)(ResponsibleGaming);
