import React, { useEffect, useState } from "react";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Paper from "@material-ui/core/Paper";

import "./FancyBookView.scss";
import { connect } from "react-redux";
import { RootState } from "../../../models/RootState";
import { UserBet } from "../../../models/UserBet";
import { CURRENCY_TYPE_FACTOR } from "../../../constants/CurrencyTypeFactor";
import { getCurrencyTypeFromToken } from "../../../store";

type PropsType = {
  fancyBookOutcomeId: string;
  openBets: UserBet[];
  exposureMap?: any;
};

const FancyBookView: React.FC<PropsType> = (props) => {
  const { fancyBookOutcomeId, openBets, exposureMap } = props;
  const [loading, setLoading] = useState<boolean>(true);
  const [tableData, setTableData] = useState<UserBet[]>();
  const [runsRiskMap, setRunsRiskMap] = useState({});
  const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];

  const getRiskValue = () => {
    let probableRunsList = [];
    if (exposureMap) {
      probableRunsList = exposureMap.sort((a, b) => Number(b) - Number(a));
      let runsMap = {};
      for (let pr of probableRunsList) {
        runsMap[pr["runnerId"]] = pr;
      }
      setRunsRiskMap(runsMap);
    }
  };

  useEffect(() => {
    setLoading(true);
    getRiskValue();
    setTableData(
      openBets.filter(
        (bet) => bet.marketType === 2 && bet.outcomeId === fancyBookOutcomeId
      )
    );
    setLoading(false);
  }, [openBets]);

  return (
    <div className="fancy-book-table-ctn">
      {loading ? null : (
        <>
          {tableData ? (
            <TableContainer component={Paper}>
              <Table className="fancy-book-table">
                <TableHead>
                  <TableRow>
                    <TableCell>Runner Name</TableCell>
                    <TableCell>Profit/Loss</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(runsRiskMap)
                    .sort((a, b) => Number(a) - Number(b))
                    .map((run, idx) => (
                      <TableRow key={idx}>
                        <TableCell key={"row-" + idx + "cell-1"}>
                          {idx === 0
                            ? run + " or Less"
                            : idx === Object.keys(runsRiskMap).length - 1
                            ? run + " or More"
                            : run}
                        </TableCell>
                        <TableCell
                          key={"row-" + idx + "cell-2"}
                          className={
                            runsRiskMap[run]["userRisk"] > 0
                              ? "profit"
                              : runsRiskMap[run]["userRisk"] < 0
                              ? "loss"
                              : null
                          }
                        >
                          {runsRiskMap[run]["userRisk"] > 0
                            ? "+" +
                              Number(runsRiskMap[run]["userRisk"]).toFixed(2)
                            : Number(runsRiskMap[run]["userRisk"]).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <div className="no-data">No data to display</div>
          )}
        </>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    openBets: state.exchBetslip.openBets,
  };
};

export default connect(mapStateToProps)(FancyBookView);
