import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import React, { useEffect, useState } from "react";

import defaultLangRulesData from "../../description/default-lang-tc.json";
import bonusRulesConfig from "../../description/bonus-rules-config.json";
import "./MarketTermsCondi.scss";
import { RootState } from "../../models/RootState";
import { connect } from "react-redux";
import { DomainConfig } from "../../models/DomainConfig";
import USABET_API from "../../api-services/usabet-api";

type MarketTermsProps = {
  oddsType?: string;
  langSelected: string;
  domainConfig: DomainConfig;
};

type RuleItem = {
  category: string;
  rules?: string[];
  fromApi?: boolean;
  key?: string;
};

type BonusContent = { title?: string; description?: string };

const bonusRulesMapped: RuleItem[] = (bonusRulesConfig as { name: string; key: string }[]).map(
  (b) => ({ category: b.name, key: b.key, fromApi: true })
);

const MarketTermsCondi: React.FC<MarketTermsProps> = (props) => {
  const { domainConfig } = props;
  const [rules, setRules] = useState<RuleItem[] | null>(null);
  const [bonusContent, setBonusContent] = useState<Record<string, BonusContent>>({});
  const [bonusLoading, setBonusLoading] = useState<Record<string, boolean>>({});

  const getLangRulesData = async () => {
    try {
      setRules([...bonusRulesMapped, ...(defaultLangRulesData as RuleItem[])]);
    } catch (error) {
      console.error("Error getting language rules data:", error);
      setRules([...bonusRulesMapped, ...(defaultLangRulesData as RuleItem[])]);
    }
  };

  const fetchBonusContent = async (categoryKey: string) => {
    if (bonusContent[categoryKey] || bonusLoading[categoryKey]) return;
    setBonusLoading((prev) => ({ ...prev, [categoryKey]: true }));
    try {
      const host = typeof window !== "undefined" ? window.location.hostname : "usabet9.com";
      const res = await USABET_API.get("/content/contentGet", {
        params: {
          content_type: "bonus_rules",
          category: categoryKey,
          host:"usabet9.com",
        },
      });
      if (res?.data?.status === true && res?.data?.data) {
        setBonusContent((prev) => ({
          ...prev,
          [categoryKey]: {
            title: res.data.data.title,
            description: res.data.data.description,
          },
        }));
      }
    } catch (err) {
      console.error("[MarketTermsCondi] fetchBonusContent error:", err);
    } finally {
      setBonusLoading((prev) => ({ ...prev, [categoryKey]: false }));
    }
  };

  useEffect(() => {
    getLangRulesData();
  }, []);

  return (
    <div className="odds-terms-condi-ctn">
      <>
        {rules?.map((r, index) => (
          <Accordion
            key={r.key ?? r.category ?? index}
            className="rules-accordion"
            onChange={(_e, expanded) => {
              if (expanded && r.fromApi && r.key) fetchBonusContent(r.key);
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel-${index}-content`}
              id={`panel-${index}-header`}
            >
              <Typography>{r.category}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {r.fromApi ? (
                <>
                  {bonusLoading[r.key!] && <p className="conditions-paragraph">Loading...</p>}
                  {!bonusLoading[r.key!] && bonusContent[r.key!] && (
                    <>
                      {bonusContent[r.key!].title && (
                        <Typography variant="subtitle1" className="bonus-rule-title">
                          {bonusContent[r.key!].title}
                        </Typography>
                      )}
                      {bonusContent[r.key!].description && (
                        <div
                          className="conditions-paragraph bonus-rule-description"
                          dangerouslySetInnerHTML={{
                            __html: bonusContent[r.key!].description!,
                          }}
                        />
                      )}
                    </>
                  )}
                  {!bonusLoading[r.key!] && !bonusContent[r.key!] && (
                    <p className="conditions-paragraph">No content available.</p>
                  )}
                </>
              ) : (
                r.rules?.map((rule, idx) => (
                  <p key={idx} className="conditions-paragraph">
                    {rule}
                  </p>
                ))
              )}
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
