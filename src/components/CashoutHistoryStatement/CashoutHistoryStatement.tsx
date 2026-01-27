import React, { useState } from "react";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import "../ProfitLossStatement/ProfitLossStatement.scss";
import moment, { Moment } from "moment";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import Modal from "../Modal/Modal";
import PLStatementMktLvl from "../ProfitLossStatement/PLStatementMktLvl";

type CashoutHistoryProps = {
  items: any;
  startDate: Moment;
  endDate: Moment;
  searchName: string;
  selectedGame: string;
  langData: any;
};

const CashoutHistoryStatement: React.FC<CashoutHistoryProps> = (props) => {
  const { items, startDate, endDate, searchName, langData, selectedGame } =
    props;
  const [selectedRecord, setSelectedRecord] = useState<any>();
  const [open, setOpen] = React.useState<any>(false);

  const renderRunnerPL = (runnerRiskMap: any) => {
    if (!runnerRiskMap) return "-";

    return Object.entries(runnerRiskMap).map(([runnerName, risk], index) => (
      <div key={index} className="runner-risk-item">
        {runnerName}: {Number(risk).toFixed(2)}
      </div>
    ));
  };

  return (
    <>
      <div className="tbl-ctn my-bets-tbl no-hov-style">
        <TableContainer component={Paper}>
          <Table className="myb-table" size="small">
            <TableHead className="myb-table-header">
              <TableRow>
                <TableCell className="market-header">
                  {langData?.["market"]}
                </TableCell>
                <TableCell className="start-time">Runner PL</TableCell>
                <TableCell className="pl-comm">Cashout Amount</TableCell>
                <TableCell className="settled-time">Cashout Comm</TableCell>
                <TableCell className="pl-net-win">Net Cashout</TableCell>
                <TableCell className="settled-time">Cashout Time</TableCell>
                {items?.length > 0 && (
                  <TableCell className="settled-time"></TableCell>
                )}
              </TableRow>
            </TableHead>

            {items && items?.length > 0 ? (
              <TableBody className="apl-table-body webview">
                {items.map((row) => (
                  <>
                    <TableRow
                      className="apl-table-row"
                      key={"key_" + Math.random().toString(36).substr(2, 9)}
                      onClick={() => {
                        setSelectedRecord(row);
                      }}
                    >
                      <TableCell>
                        <span className="txt-bldin-mob">
                          {row.eventName} - {row.marketName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="txt-bldin-mob">
                          {renderRunnerPL(row.runnerRiskMap)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="txt-bldin-mob">
                          <div
                            className={
                              row.cashoutAmount > 0 ? "profit" : "loss"
                            }
                          >
                            {Number(row.cashoutAmount).toFixed(2)}
                          </div>
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="txt-bldin-mob">
                          <div
                            className={
                              row.cashoutCommission > 0 ? "profit" : "loss"
                            }
                          >
                            {Number(row.cashoutCommission).toFixed(2)}
                          </div>
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="txt-bldin-mob">
                          <div
                            className={
                              row.netCashoutAmount > 0 ? "profit" : "loss"
                            }
                          >
                            {Number(row.netCashoutAmount).toFixed(2)}
                          </div>
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="txt-bldin-mob">
                          {moment(row.createTime).format("D/M/YYYY HH:mm:ss")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          aria-label="expand row"
                          size="small"
                          onClick={() =>
                            setOpen((prevState) => {
                              return {
                                ...prevState,
                                [row.id]: prevState[row.id] ? false : true,
                              };
                            })
                          }
                        >
                          {open[row.id] ? (
                            <KeyboardArrowUpIcon htmlColor={"#000"} />
                          ) : (
                            <KeyboardArrowDownIcon htmlColor={"#000"} />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  </>
                ))}
              </TableBody>
            ) : null}
          </Table>
        </TableContainer>

        {!(items?.length > 0) && (
          <div className="no-data-cell-web">
            <div>{langData?.["records_not_found_txt"]}</div>
          </div>
        )}

        <Modal
          open={open}
          title={langData?.["pl_details_txt"] + ":"}
          customClass="light-bg-title pl-details"
          closeHandler={() => setOpen(false)}
          size="md"
        >
          <PLStatementMktLvl
            selectedMarket={selectedRecord}
            startDate={startDate}
            endDate={endDate}
            showGameLevel={() => {
              setSelectedRecord(null);
            }}
            searchName={searchName}
            langData={langData}
          />
        </Modal>
      </div>
      {/* mob view table body */}
      {items?.length > 0 ? (
        <>
          <TableBody className="apl-table-body-mob-ctn mob-view">
            {items.map((row) => (
              <>
                <TableRow
                  className="apl-table-row"
                  key={"key_" + Math.random().toString(36).substr(2, 9)}
                  onClick={() => {
                    setSelectedRecord(row);
                  }}
                >
                  <TableCell className="pl-table-body-mob  mob-frst-cell">
                    <span
                      className="txt-bldin-mob"
                      onClick={() =>
                        setOpen((prevState) => {
                          return {
                            ...prevState,
                            [row.id]: prevState[row.id] ? false : true,
                          };
                        })
                      }
                    >
                      <div className="mob-market-name-ctn">
                        <div className="mob-market-name">
                          {row.eventName} - {row.marketName}
                        </div>

                        <div className="mob-market-time">
                          {moment(row.createTime).format("D/M/YYYY HH:mm:ss")}
                        </div>
                      </div>
                    </span>
                  </TableCell>
                  <TableCell className="pl-table-body-mob mob-middle-cell">
                    <span className="txt-bldin-mob">
                      <div
                        className={row.cashoutAmount > 0 ? "profit" : "loss"}
                      >
                        {Number(row.cashoutAmount).toFixed(2)}
                      </div>
                    </span>
                  </TableCell>

                  <TableCell className="pl-table-body-mob  mob-last-cell">
                    <span className="txt-bldin-mob">
                      <div
                        className={row.netCashoutAmount > 0 ? "profit" : "loss"}
                      >
                        {Number(row.netCashoutAmount).toFixed(2)}
                      </div>
                    </span>
                  </TableCell>
                </TableRow>

                <TableRow className="second-tablerow">
                  <TableCell className="second-tablecell  mob-secondtable-frstcell">
                    <span className="fw-500">Runner PL:</span>{" "}
                    <span className="txt-bldin-mob">
                      {renderRunnerPL(row.runnerRiskMap)}
                    </span>
                  </TableCell>{" "}
                  <TableCell className="second-tablecell mob-secondtable-frstcell no-border">
                    <span className="fw-500">Cashout Comm:</span>{" "}
                    <span className="txt-bldin-mob">
                      <div
                        className={
                          row.cashoutCommission > 0 ? "profit" : "loss"
                        }
                      >
                        {Number(row.cashoutCommission).toFixed(2)}
                      </div>
                    </span>
                  </TableCell>{" "}
                  <TableCell className="second-tablecell mob-secondtable-lastcell">
                    <div
                      className="link"
                      onClick={() => {
                        setSelectedRecord(row);
                      }}
                    >
                      <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() =>
                          setOpen((prevState) => {
                            return {
                              ...prevState,
                              [row.id]: prevState[row.id] ? false : true,
                            };
                          })
                        }
                      >
                        <KeyboardArrowRightIcon />
                      </IconButton>{" "}
                    </div>
                  </TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </>
      ) : null}
    </>
  );
};

export default CashoutHistoryStatement;
