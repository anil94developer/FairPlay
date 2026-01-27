import React from "react";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import { CommissionFancyMarketsList } from "../../constants/CommissionMarketsList";
import "./CommissionRules.scss";

const CommissionRules: React.FC = () => {
  return (
    <div className="odds-terms-condi-ctn">
      <>
        {CommissionFancyMarketsList.map((r, index) => (
          <Accordion className="rules-accordion">
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>{r.category}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {r.rules.map((r, index) => (
                <p>{index === 0 ? r : r}</p>
              ))}
            </AccordionDetails>
          </Accordion>
        ))}
      </>
    </div>
  );
};

export default CommissionRules;
