import React, { useState } from "react";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import { PLStatement } from "../../models/PLStatement";
import "./ProfitLossStatement.scss";
import moment, { Moment } from "moment";
import PLStatementMktLvl from "./PLStatementMktLvl";
import KeyboardArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import Modal from "../Modal/Modal";
type PLProps = {
  items: any;
  startDate: Moment;
  endDate: Moment;
  searchName: string;
  selectedGame: string;
  langData: any;
};

const ProfitLossStatement: React.FC<PLProps> = (props) => {
  const { items, startDate, endDate, searchName, langData, selectedGame } =
    props;
  const [selectedRecord, setSelectedRecord] = useState<PLStatement>();
  const [open, setOpen] = React.useState<any>(false);
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
                <TableCell className="start-time">
                  {langData?.["start_time"]}
                </TableCell>
                <TableCell className="settled-time">
                  {langData?.["settled_time"]}
                </TableCell>
                <TableCell className="pl-comm">
                  {langData?.["commission_txt"]}
                </TableCell>
                <TableCell className="pl-net-win">
                  {langData?.["net_win"]}
                </TableCell>
                {items?.length > 0 && (
                  <TableCell className="settled-time"></TableCell>
                )}
              </TableRow>
            </TableHead>

            {/* web view table body */}
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
                        <span
                          className="txt-bldin-mob"
                          onClick={() =>
                            setOpen((prevState) => {
                              return {
                                ...prevState,
                                [moment(row.betPlacedTime, "DD-MM-YYYY").format(
                                  "DD/MM/YYYY"
                                ) +
                                "-" +
                                row?.eventId +
                                "-" +
                                row?.marketId]: prevState[
                                  moment(
                                    row.betPlacedTime,
                                    "DD-MM-YYYY"
                                  ).format("DD/MM/YYYY") +
                                    "-" +
                                    row?.eventId +
                                    "-" +
                                    row?.marketId
                                ]
                                  ? false
                                  : true,
                              };
                            })
                          }
                        >
                          {row.eventName ? row.eventName : row.gameType} -{" "}
                          {row.marketName}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="txt-bldin-mob">
                          {moment(row?.betPlacedTime).format(
                            "D/M/YYYY HH:mm:ss"
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="txt-bldin-mob">
                          {moment(row?.payOutDate).format("D/M/YYYY HH:mm:ss")}
                        </span>
                      </TableCell>
                      <TableCell

                      // className="pandl-col m-link"
                      >
                        <span className="txt-bldin-mob">
                          {!row.commission ? (
                            <div>{Number(0).toFixed(2)}</div>
                          ) : row.commission > 0 ? (
                            <div className="profit">
                              {Number(row.commission).toFixed(2)}
                            </div>
                          ) : row.commission < 0 ? (
                            <div className="loss">
                              {Number(row.commission).toFixed(2)}
                            </div>
                          ) : (
                            <>{Number(row.commission).toFixed(2) || 0}</>
                          )}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="txt-bldin-mob">
                          {["SPORTS", "SPORTS_BOOK"].includes(selectedGame) ? (
                            row?.profit > 0 ? (
                              <div className="profit">
                                {Number(row?.profit + row?.commission)?.toFixed(
                                  2
                                )}
                              </div>
                            ) : row?.profit < 0 ? (
                              <div className="loss">
                                {Number(row?.profit + row?.commission)?.toFixed(
                                  2
                                )}
                              </div>
                            ) : (
                              <>
                                {" "}
                                {Number(row?.profit + row?.commission)?.toFixed(
                                  2
                                )}
                              </>
                            )
                          ) : row?.outcomeResult === "Open" ? (
                            "-"
                          ) : row?.payOutAmount > 0 ? (
                            <div className="profit">
                              {row?.payOutAmount?.toFixed(2)}
                            </div>
                          ) : (
                            <div className="loss">
                              {row?.payOutAmount?.toFixed(2)}
                            </div>
                          )}
                        </span>
                      </TableCell>

                      <TableCell>
                        {["SPORTS", "SPORTS_BOOK"].includes(selectedGame) && (
                          <IconButton
                            aria-label="expand row"
                            size="small"
                            onClick={() =>
                              setOpen((prevState) => {
                                return {
                                  ...prevState,
                                  [moment(
                                    row.betPlacedTime,
                                    "DD-MM-YYYY"
                                  ).format("DD/MM/YYYY") +
                                  "-" +
                                  row?.eventId +
                                  "-" +
                                  row?.marketId]: prevState[
                                    moment(
                                      row.betPlacedTime,
                                      "DD-MM-YYYY"
                                    ).format("DD/MM/YYYY") +
                                      "-" +
                                      row?.eventId +
                                      "-" +
                                      row?.marketId
                                  ]
                                    ? false
                                    : true,
                                };
                              })
                            }
                          >
                            {open[
                              moment(row.betPlacedTime, "DD-MM-YYYY").format(
                                "DD/MM/YYYY"
                              ) +
                                "-" +
                                row?.eventId +
                                "-" +
                                row?.marketId
                            ] ? (
                              <KeyboardArrowUpIcon htmlColor={"#000"} />
                            ) : (
                              <KeyboardArrowDownIcon htmlColor={"#000"} />
                            )}
                          </IconButton>
                        )}
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
                            [moment(row.betPlacedTime, "DD-MM-YYYY").format(
                              "DD/MM/YYYY"
                            ) +
                            "-" +
                            row?.eventId +
                            "-" +
                            row?.marketId]: prevState[
                              moment(row.betPlacedTime, "DD-MM-YYYY").format(
                                "DD/MM/YYYY"
                              ) +
                                "-" +
                                row?.eventId +
                                "-" +
                                row?.marketId
                            ]
                              ? false
                              : true,
                          };
                        })
                      }
                    >
                      <div className="mob-market-name-ctn">
                        <div className="mob-market-name">
                          {row.eventName ? row.eventName : row.gameType} -
                          {row.marketName}
                        </div>

                        <div className="mob-market-time">
                          {moment(row?.betPlacedTime).format(
                            "D/M/YYYY HH:mm:ss"
                          )}
                        </div>
                      </div>
                    </span>
                  </TableCell>
                  <TableCell className="pl-table-body-mob mob-middle-cell">
                    <span className="txt-bldin-mob">
                      {!row.commission ? (
                        <div>{Number(0).toFixed(2)}</div>
                      ) : row.commission > 0 ? (
                        <div className="profit">
                          {Number(row.commission).toFixed(2)}
                        </div>
                      ) : row.commission < 0 ? (
                        <div className="loss">
                          {Number(row.commission).toFixed(2)}
                        </div>
                      ) : (
                        <>{Number(row.commission).toFixed(2) || 0}</>
                      )}
                    </span>
                  </TableCell>

                  <TableCell className="pl-table-body-mob   mob-last-cell">
                    <span className="txt-bldin-mob">
                      {["SPORTS", "SPORTS_BOOK"].includes(selectedGame) ? (
                        row?.profit > 0 ? (
                          <div className="profit">
                            {Number(row?.profit + row?.commission)?.toFixed(2)}
                          </div>
                        ) : row?.profit < 0 ? (
                          <div className="loss">
                            {Number(row?.profit + row?.commission)?.toFixed(2)}
                          </div>
                        ) : (
                          <>
                            {" "}
                            {Number(row?.profit + row?.commission)?.toFixed(2)}
                          </>
                        )
                      ) : row?.outcomeResult === "Open" ? (
                        "-"
                      ) : row?.payOutAmount > 0 ? (
                        <div className="profit">
                          {row?.payOutAmount?.toFixed(2)}
                        </div>
                      ) : (
                        <div className="loss">
                          {row?.payOutAmount?.toFixed(2)}
                        </div>
                      )}
                    </span>
                  </TableCell>
                </TableRow>

                <TableRow className="second-tablerow">
                  <TableCell className="second-tablecell  mob-secondtable-frstcell">
                    <span className="fw-500">
                      {langData?.["settled_time"]}:
                    </span>{" "}
                    <span className="txt-bldin-mob">
                      {moment(row?.payOutDate).format("D/M/YYYY HH:mm:ss")}
                    </span>
                  </TableCell>{" "}
                  <TableCell className="second-tablecell mob-secondtable-secondcell">
                    <span></span>
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
                              [moment(row.betPlacedTime, "DD-MM-YYYY").format(
                                "DD/MM/YYYY"
                              ) +
                              "-" +
                              row?.eventId +
                              "-" +
                              row?.marketId]: prevState[
                                moment(row.betPlacedTime, "DD-MM-YYYY").format(
                                  "DD/MM/YYYY"
                                ) +
                                  "-" +
                                  row?.eventId +
                                  "-" +
                                  row?.marketId
                              ]
                                ? false
                                : true,
                            };
                          })
                        }
                      >
                        {open[
                          moment(row.betPlacedTime, "DD-MM-YYYY").format(
                            "DD/MM/YYYY"
                          ) +
                            "-" +
                            row?.eventId +
                            "-" +
                            row?.marketId
                        ] ? (
                          <KeyboardArrowRightIcon />
                        ) : (
                          <KeyboardArrowRightIcon />
                        )}
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

export default ProfitLossStatement;
