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
import USABET_API from "../../../api-services/usabet-api";

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
  const [runtimeData, setRuntimeData] = useState<any>(null);
  const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];

  const getRiskValue = () => {
    let probableRunsList: any[] = [];
    if (exposureMap) {
      // exposureMap may be provided as an Array, an Object (map-like), or a Map instance.
      if (Array.isArray(exposureMap)) {
        probableRunsList = [...exposureMap];
      } else if (exposureMap instanceof Map) {
        probableRunsList = Array.from(exposureMap.values());
      } else if (typeof exposureMap === "object") {
        probableRunsList = Object.values(exposureMap);
      }

      // Guard: ensure we have an array before sorting/mapping
      if (!Array.isArray(probableRunsList)) probableRunsList = [];

      // Sort by runnerId (numeric) descending so runsMap builds predictably
      probableRunsList.sort((a: any, b: any) => {
        const ra = Number(a?.runnerId ?? a?.runner_id ?? 0);
        const rb = Number(b?.runnerId ?? b?.runner_id ?? 0);
        return rb - ra;
      });

      const runsMap: Record<string, any> = {};
      for (const pr of probableRunsList) {
        const rId = String(pr?.runnerId ?? pr?.runner_id ?? "");
        if (rId) runsMap[rId] = pr;
      }
      setRunsRiskMap(runsMap);
    }
  };

  useEffect(() => {
    setLoading(true);
    getRiskValue();
    setTableData(
      openBets.filter((bet) => String(bet.marketType) === "2" && String(bet.outcomeId) === String(fancyBookOutcomeId))
    );
    // Fetch runtime fancy position when modal opens for given fancy id
    const fetchRuntime = async () => {
      if (!fancyBookOutcomeId) {
        setRuntimeData(null);
        setLoading(false);
        return;
      }
      try {
        const payload = { fancy_id: fancyBookOutcomeId };
        const res = await USABET_API.post(`/fancy/getRunTimeFancyPosition`, payload);
        // store whatever the API returned for rendering
        setRuntimeData(res?.data ?? res);
      } catch (err) {
        console.warn("[FancyBookView] getRunTimeFancyPosition failed:", err);
        setRuntimeData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRuntime();
  }, [openBets, fancyBookOutcomeId]);

  return (
    <div className="fancy-book-table-ctn">
      {loading ? null : (
        <>
          <>
            {/* Show runtime API response if available */}

            <div className="runtime-data-ctn">
              {/* If runtimeData is an array of { key, value, valueFull } render as rows */}
              {/* {runtimeData.length > 0 &&  */}
              <TableContainer component={Paper}>
                <Table className="fancy-book-table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Runner Name</TableCell>
                      <TableCell>Profit/Loss</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {runtimeData.data.fancy_position.map((row: any, i: number) => {
                      const formattedKey = String(row.key)
                        .replace(/^0-/, '')   // remove "0-"
                        .replace(/\+/, '');  // remove "+"

                      return (
                        <TableRow key={i}>
                          <TableCell>
                            {formattedKey} {i === 0 ? "Or Less" : "Or More"}
                          </TableCell>

                          <TableCell
                            className={
                              Number(row.valueFull) > 0
                                ? "profit"
                                : Number(row.valueFull) < 0
                                  ? "loss"
                                  : undefined
                            }
                          >
                            {Number(row.valueFull) > 0
                              ? "+" + Number(row.valueFull).toFixed(2)
                              : Number(row.valueFull).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                  </TableBody>
                </Table>
              </TableContainer>
              {/* } */}
            </div>


            {/* Existing open bets / exposure view as fallback */}
            {tableData && Object.keys(runsRiskMap).length > 0 ? (
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
                              ? "+" + Number(runsRiskMap[run]["userRisk"]).toFixed(2)
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
