import React, { useState } from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import Button from "@material-ui/core/Button";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";

import { PLStatement, PLRecordMktLvl } from "../../models/PLStatement";
import "./ProfitLossStatement.scss";
import moment, { Moment } from "moment";
import { AuthResponse } from "../../models/api/AuthResponse";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { getCurrencyTypeFromToken } from "../../store";
import { oddValueFormatter } from "../../util/stringUtil";

type PLProps = {
  searchName: string;
  selectedMarket: PLStatement;
  startDate: Moment;
  endDate: Moment;
  showGameLevel: () => void;
  langData: any;
};

const PLStatementMktLvl: React.FC<PLProps> = (props) => {
  const {
    selectedMarket,
    startDate,
    endDate,
    showGameLevel,
    searchName,
    langData,
  } = props;
  const [items, setItems] = useState<PLRecordMktLvl[]>();
  const [backTotal, setBackTotal] = useState<number>(0);
  const [layTotal, setLayTotal] = useState<number>(0);
  const [marketTotal, setMarketTotal] = useState<number>(0);
  const [netMarket, setNetMarket] = useState<number>(0);
  const [pageToken, setPageToken] = useState<string[]>([""]);
  const [nextPageToken, setNextPageToken] = useState<string>("");
  const [loading, setLoading] = useState<Boolean>(false);
  const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];
  const pageSize = 25;
  const tableFields = [
    {
      key: "betPlacedTime",
      Label: "Placed",
      langKey: "placed",
      className: "placed-cell-head text-uppercase",
      align: "left",
    },
    {
      key: "selection",
      Label: "Runner Name",
      langKey: "runner_name",
      className: "selection-cell-head text-uppercase",
      align: "left",
    },
    {
      key: "betId",
      Label: "Bet ID",
      langKey: "bet_id",
      className: "betid-cell-head text-uppercase",
      align: "left",
    },
    {
      key: "betType",
      Label: "Type",
      langKey: "type",
      className: "type-cell-head text-uppercase",
      align: "left",
    },
    {
      key: "odds",
      Label: "Odds",
      langKey: "odds",
      className: "odds-cell-head text-uppercase",
      align: "left",
    },
    {
      key: "stake",
      Label: "Amount",
      langKey: "amount",
      className: "stake-cell-head text-uppercase",
      align: "left",
    },
    {
      key: "profitLoss",
      Label: "Winnings",
      langKey: "winnings",
      className: "ploss-cell-head text-uppercase",
      align: "left",
    },
    {
      key: "status",
      Label: "Result",
      langKey: "result",
      className: "status-cell-head text-uppercase",
      align: "left",
    },
  ];

  const tableFieldsMob = [
    {
      key: "selection",
      Label: "Runner Name",
      langKey: "runner_name",
      className: "selection-cell-head text-uppercase",
      align: "left",
    },

    {
      key: "profitLoss",
      Label: "W&L",
      langKey: "w&l",
      className: "ploss-cell-head text-uppercase",
      align: "left",
    },

    {
      key: "stake",
      Label: "Amount",
      langKey: "amount",
      className: "stake-cell-head text-uppercase",
      align: "left",
    },

    {
      key: "odds",
      Label: "Odds",
      langKey: "odds",
      className: "odds-cell-head text-uppercase",
      align: "left",
    },
  ];

  const nextPage = () => {
    setLoading(true);
    if (nextPageToken) {
      setPageToken([...pageToken, nextPageToken]);
    }
    setLoading(false);
  };

  const prevPage = () => {
    setLoading(true);
    if (pageToken.length > 1) {
      let pagetokens = pageToken;
      pagetokens.pop();
      setPageToken([...pagetokens]);
    }
    setLoading(false);
  };

  const fetchPLByMarket = async () => {
    try {
      // Dummy data instead of API call
      const response: AuthResponse = {
        status: 200,
        data: {
          orders: [
            {
              id: "pl-001",
              betPlacedTime: new Date().toISOString(),
              selection: "Team A",
              betId: "bet-001",
              betType: "BACK",
              odds: 1.5,
              stake: 100 * cFactor,
              profitLoss: 50 * cFactor,
              status: "Won",
              payOutAmount: 150 * cFactor,
              stakeAmount: 100 * cFactor,
              outcomeResult: "Won",
              marketType: "MATCH_ODDS",
              marketName: "Match Odds",
              outcomeDesc: "Team A",
              oddValue: 1.5,
              sessionRuns: null,
            },
            {
              id: "pl-002",
              betPlacedTime: new Date(Date.now() - 86400000).toISOString(),
              selection: "Team B",
              betId: "bet-002",
              betType: "LAY",
              odds: 0.9,
              stake: 200 * cFactor,
              profitLoss: -20 * cFactor,
              status: "Loss",
              payOutAmount: 180 * cFactor,
              stakeAmount: 200 * cFactor,
              outcomeResult: "Lost",
              marketType: "BOOKMAKER",
              marketName: "Bookmaker",
              outcomeDesc: "Team B",
              oddValue: 0.9,
              sessionRuns: null,
            },
            {
              id: "pl-003",
              betPlacedTime: new Date(Date.now() - 172800000).toISOString(),
              selection: "Over 20.5",
              betId: "bet-003",
              betType: "BACK",
              odds: 1.5,
              stake: 50 * cFactor,
              profitLoss: 25 * cFactor,
              status: "Won",
              payOutAmount: 75 * cFactor,
              stakeAmount: 50 * cFactor,
              outcomeResult: "Won",
              marketType: "FANCY",
              marketName: "Fancy Market",
              outcomeDesc: "Over 20.5",
              oddValue: 1.5,
              sessionRuns: 25,
            },
          ],
          pageToken: null,
        },
      } as AuthResponse;
      if (response.status === 200) {
        if (response.data?.orders) {
          let records: PLRecordMktLvl[] = response.data?.orders;
          setItems(records);
          let backCount = 0;
          let layCount = 0;
          let marketAmt = 0;
          for (let record of records) {
            if (record.betType === "BACK") {
              backCount += record.payOutAmount;
            } else {
              layCount += record.payOutAmount;
            }
            marketAmt += record.payOutAmount;
          }
          setBackTotal(backCount / cFactor);
          setLayTotal(layCount / cFactor);
          setMarketTotal(marketAmt / cFactor);
          setNetMarket(
            marketAmt / cFactor +
              (selectedMarket.commission ? selectedMarket.commission : 0)
          );
        }
        setNextPageToken(response.data?.pageToken);
      } else {
        throw new Error(response.data);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        console.error(err.response.data.error);
      }
    }
  };

  React.useEffect(() => {
    fetchPLByMarket();
  }, [pageToken]);

  return (
    <div className="modal-pl">
      {selectedMarket ? (
        <>
          <div className="pl-stmt-tbl web-view">
            <TableContainer component={Paper}>
              <Table className="myb-table">
                <TableHead className="myb-table-header sub-table-header">
                  <TableRow>
                    {tableFields.map((tF, index) => (
                      <TableCell
                        key={"key_" + Math.random().toString(36).substr(2, 9)}
                        align={tF.align === "left" ? "left" : "center"}
                        className={tF.className}
                      >
                        {langData?.[tF.langKey]}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                {items && items.length > 0 ? (
                  <>
                    <TableBody className="tbl-body">
                      {items.map((row) => (
                        <>
                          <TableRow
                            className={
                              row.payOutAmount > 0
                                ? "profit-bg"
                                : row.payOutAmount <= 0
                                ? "loss-bg"
                                : "row-bg"
                            }
                            key={
                              "key_" + Math.random().toString(36).substr(2, 9)
                            }
                          >
                            <TableCell align="left">
                              <span className="txt-bldin-mob">
                                {moment(row.betPlacedTime).format(
                                  "D/M/YYYY HH:mm:ss"
                                )}
                              </span>
                            </TableCell>
                            <TableCell
                              className="myb-table-cell bwon-col"
                              align="left"
                            >
                              <span className="txt-bldin-mob">
                                {row.marketType === "FANCY"
                                  ? row.marketName +
                                    " @ " +
                                    Number(row.oddValue * 100 - 100).toFixed(0)
                                  : row.marketType === "BINARY"
                                  ? row.outcomeDesc +
                                    " @ " +
                                    Number(row.sessionRuns).toFixed(0)
                                  : row.outcomeDesc}
                              </span>
                            </TableCell>
                            <TableCell
                              className="myb-table-cell blost-col"
                              align="left"
                            >
                              <span className="txt-bldin-mob">{row.id}</span>
                            </TableCell>
                            <TableCell
                              className="myb-table-cell blost-col"
                              align="left"
                            >
                              <span className="txt-bldin-mob">
                                {row.betType == "BACK" ? "Back" : "Lay"}
                              </span>
                            </TableCell>
                            <TableCell
                              className="myb-table-cell blost-col"
                              align="left"
                            >
                              <span className="txt-bldin-mob">
                                {oddValueFormatter(
                                  row.marketType,
                                  row.oddValue,
                                  row.sessionRuns
                                )}
                              </span>
                            </TableCell>
                            <TableCell
                              className="myb-table-cell blost-col"
                              align="left"
                            >
                              <span className="txt-bldin-mob">
                                {(row.stakeAmount / cFactor).toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell align="left" className="pandl-col">
                              <span className="txt-bldin-mob">
                                <div
                                  className={
                                    row.outcomeResult == "Won"
                                      ? "profit"
                                      : "loss"
                                  }
                                >
                                  {Number(row.payOutAmount / cFactor).toFixed(
                                    2
                                  )}
                                </div>
                              </span>
                            </TableCell>

                            <TableCell align="left" className="pandl-col">
                              <span className="txt-bldin-mob">
                                <div>
                                  {row.outcomeResult == "Won" ||
                                  row.payOutAmount > 0
                                    ? "Win"
                                    : "Loss"}
                                </div>
                              </span>
                            </TableCell>
                          </TableRow>
                        </>
                      ))}
                    </TableBody>
                  </>
                ) : (
                  <TableBody>
                    <TableRow>
                      <TableCell
                        className="no-data-cell"
                        variant="body"
                        colSpan={8}
                      >
                        {langData?.["records_not_found_txt"]}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </div>

          <div className="pl-stmt-tbl mob-view">
            <TableContainer component={Paper}>
              <Table className="myb-table">
                <TableHead className="myb-table-header sub-table-header">
                  <TableRow>
                    {tableFieldsMob.map((tF, index) => (
                      <TableCell
                        key={"key_" + Math.random().toString(36).substr(2, 9)}
                        align={tF.align === "left" ? "left" : "center"}
                        className={tF.className}
                      >
                        {langData?.[tF.langKey] ?? tF.Label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                {items && items.length > 0 ? (
                  <>
                    <TableBody className="tbl-body">
                      {items.map((row) => (
                        <>
                          <TableRow
                            className={
                              row.payOutAmount > 0
                                ? "profit-bg"
                                : row.payOutAmount <= 0
                                ? "loss-bg"
                                : "row-bg"
                            }
                            key={
                              "key_" + Math.random().toString(36).substr(2, 9)
                            }
                          >
                            <TableCell
                              className="myb-table-cell bwon-col"
                              align="left"
                            >
                              <span className="tableCell-pl-mob">
                                <span className="txt-bldin-mob  text-ctn">
                                  {row.marketType === "FANCY"
                                    ? row.marketName +
                                      " @ " +
                                      Number(row.oddValue * 100 - 100).toFixed(
                                        0
                                      )
                                    : row.marketType === "BINARY"
                                    ? row.outcomeDesc +
                                      " @ " +
                                      Number(row.sessionRuns).toFixed(0)
                                    : row.outcomeDesc}
                                </span>

                                <span className="txt-bldin-mob">
                                  {moment(row.betPlacedTime).format(
                                    "D/M/YYYY HH:mm:ss"
                                  )}
                                </span>
                              </span>
                            </TableCell>

                            <TableCell align="left" className="pandl-col">
                              <span className="txt-bldin-mob">
                                <div
                                  className={
                                    row.outcomeResult == "Won"
                                      ? "profit"
                                      : "loss"
                                  }
                                >
                                  {Number(row.payOutAmount / cFactor).toFixed(
                                    2
                                  )}
                                </div>
                              </span>
                            </TableCell>
                            <TableCell
                              className="myb-table-cell blost-col"
                              align="left"
                            >
                              <span className="txt-bldin-mob">
                                {(row.stakeAmount / cFactor).toFixed(2)}
                              </span>
                            </TableCell>

                            <TableCell
                              className="myb-table-cell blost-col"
                              align="left"
                            >
                              <span className="txt-bldin-mob">
                                {oddValueFormatter(
                                  row.marketType,
                                  row.oddValue,
                                  row.sessionRuns
                                )}
                              </span>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell align="left">
                              <span className="tableCell-btid-mob">
                                <span>{langData?.["bet_id"]}: </span>
                                <span
                                  style={{
                                    marginLeft: "2px",
                                  }}
                                >
                                  {row.id}
                                </span>
                              </span>
                            </TableCell>

                            <TableCell
                              className="myb-table-cell blost-col"
                              align="left"
                            >
                              <span className="txt-bldin-mob">
                                <div>
                                  <span className="results-mob">
                                    {langData?.["results"]}:{" "}
                                  </span>
                                  <span>
                                    {row.outcomeResult == "Won" ||
                                    row.payOutAmount > 0
                                      ? "Won"
                                      : "Loss"}
                                  </span>
                                </div>
                              </span>

                              <span>{langData?.["bet_type"]}: </span>
                              <span className="txt-bldin-mob">
                                {row.betType == "BACK" ? "Back" : "Lay"}
                              </span>
                            </TableCell>
                            {/* <TableCell></TableCell>
                            <TableCell></TableCell> */}
                          </TableRow>
                        </>
                      ))}
                    </TableBody>
                  </>
                ) : (
                  <TableBody>
                    <TableRow>
                      <TableCell
                        className="no-data-cell"
                        variant="body"
                        colSpan={8}
                      >
                        {langData?.["records_not_found_txt"]}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </div>

          <div className="pl-summary-mob">
            <div className="subheading-ctn">
              <div className="subheading"> {langData?.["back_subtotal"]}:</div>
              <div className="subheading-data">
                {Number(backTotal).toFixed(2)}
              </div>
            </div>
            <div className="border-line-pl"></div>
            <div className="subheading-ctn">
              <div className="subheading"> {langData?.["lay_subtotal"]}:</div>
              <div className="subheading-data">
                {Number(layTotal).toFixed(2)}
              </div>
            </div>
            <div className="border-line-pl"></div>
            <div className="subheading-ctn">
              <div className="subheading">
                {" "}
                {langData?.["market_subtotal"]}:{" "}
              </div>
              <div className="subheading-data">
                {Number(marketTotal).toFixed(2)}
              </div>
            </div>
            <div className="border-line-pl"></div>
            <div className="subheading-ctn">
              <div className="subheading"> {langData?.["commission"]}: </div>
              <div className="subheading-data">
                {Number(selectedMarket?.commission ?? 0)?.toFixed(2)}
              </div>
            </div>
            <div className="border-line-pl"></div>
            <div className="border-bottom net-market  subheading-ctn">
              <div className="b-text subheading">
                {langData?.["net_market_total"]}:
              </div>
              <div className="ml-auto  subheading-data">
                {Number(netMarket ?? 0).toFixed(2)}
              </div>
            </div>
          </div>
          <div className="mob-view-pgnation">
            {pageToken.length === 1 || loading ? null : (
              <Button
                onClick={(e) => prevPage()}
                disabled={pageToken.length < 2}
                className="prev-btn"
              >
                ({langData?.["prev"]})({pageToken.length - 1})
              </Button>
            )}
            {nextPageToken && !loading ? (
              <Button
                onClick={(e) => nextPage()}
                disabled={!nextPageToken}
                className="next-btn"
              >
                ({langData?.["next"]})({pageToken.length + 1})
              </Button>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default PLStatementMktLvl;
