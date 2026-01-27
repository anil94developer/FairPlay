import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import React, { useEffect, useState } from "react";

import defaultLangRulesData from "../../description/default-lang-tc.json";
import "./MarketTermsCondi.scss";
import { RootState } from "../../models/RootState";
import { connect } from "react-redux";
import { getLang, getLangCode } from "../../util/localizationUtil";
import LANG_API from "../../api-services/language-api";
import { DomainConfig } from "../../models/DomainConfig";
import { BRAND_DOMAIN } from "../../constants/Branding";

type MarketTermsProps = {
  oddsType?: string;
  langSelected: string;
  domainConfig: DomainConfig;
};

const MarketTermsCondi: React.FC<MarketTermsProps> = (props) => {
  const { domainConfig } = props;
  const [rules, setRules] = useState<any>(null);

  // TODO: should I use a state for this.
  // TODO: move this to common place
  const getLangRulesData = async () => {
    try {
      const lang = getLang(sessionStorage?.getItem("lang"));
      var langCode = getLangCode(lang)?.toLowerCase();
      let apiPath = `/languages/${langCode}/lang-rules.json`;
      if (domainConfig.ruleScope !== "HOUSE") {
        apiPath = `/${BRAND_DOMAIN}/languages/${langCode}/lang-rules.json`;
      }
      const response = await LANG_API.get(apiPath);
      const data = response.data;
      if (data) {
        setRules(data);
      } else {
        setRules(defaultLangRulesData);
      }
    } catch (error) {
      console.error("Error getting language rules data:", error);
      setRules(defaultLangRulesData);
    }
  };

  useEffect(() => {
    getLangRulesData();
  }, []);

  return (
    <div className="odds-terms-condi-ctn">
      <>
        {rules?.map((r, index) => (
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
            </AccordionDetails>
          </Accordion>
        ))}
      </>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    langSelected: state.common.langSelected,
    domainConfig: state.common.domainConfig,
  };
};

export default connect(mapStateToProps, null)(MarketTermsCondi);
