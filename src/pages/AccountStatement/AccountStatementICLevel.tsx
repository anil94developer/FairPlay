import { IonButton, IonIcon, IonRow } from "@ionic/react";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import moment, { Moment } from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";

import API from "../../api/index";
import Alert from "../../components/Alert/Alert";
import Spinner from "../../components/Spinner/Spinner";
import { fetchBettingCurrency, logout } from "../../store";

import { useHistory } from "react-router-dom";
import AccStmtImg from "../../assets/images/icons/acc_stmt.svg";
import { Currency } from "../../models/Currency";
import { RootState } from "../../models/RootState";
import { UserBet } from "../../models/UserBet";
import {
  MarketTypeMap,
  getOutcomeDescName,
  getTransactionNameByID,
} from "../../util/stringUtil";
import "./AccountStatement.scss";

type LedgerProps = {
  fetchBettingCurrency: Function;
  bettingCurrency: Currency;
  logout: Function;
};

const Ledger: React.FC<LedgerProps> = (props) => {
  const history = useHistory();
  const params =
    typeof history.location.state === "string"
      ? JSON.parse(history.location.state)
      : history.location.state;
  const { logout, fetchBettingCurrency, bettingCurrency } = props;
  const [errorMsg, setErrorMsg] = useState(null);
  const [dataflag, setdataflag] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const filter = "all";
  const [records, setRecords] = useState<UserBet[]>([]);
  const [currpage, setcurrpage] = useState<number>(1);
  const [sortDesc, setsortDesc] = useState<boolean>(true);
  const [fromDate, setfromDate] = useState<Moment>(
    params["fromDate"] ? moment(params["fromDate"]) : moment().subtract(7, "d")
  );
  const [transaction, setTransaction] = useState<string>(
    params["transactionType"]
      ? getTransactionNameByID(params["transactionType"])
          .toUpperCase()
          .split(" ")
          .join("_")
      : ""
  );
  const [toDate, setToDate] = useState<Moment>(
    params["toDate"] ? moment(params["toDate"]) : moment()
  );
  const [showTransactionDetailsModal, setShowTransactionDetailsModal] =
    useState<boolean>(false);
  const [transactionDetails, setTransactionDetails] = useState<{
    id: string;
    type: string;
  }>({ id: "", type: "" });
  const pageSize = 25;

  useEffect(() => {
    fetchBettingCurrency();
  }, [fetchBettingCurrency]);

  const fromDateChangeHandler = (d: Moment) => {
    setfromDate(d);
  };

  const toDateChangeHandler = (d: Moment) => {
    setToDate(d);
  };

  const nextpageHandler = () => {
    setLoading(true);
    setcurrpage(currpage + 1);
  };

  const prevpageHandler = () => {
    setLoading(true);
    setcurrpage(currpage - 1);
  };

  const sortOrderHandler = () => {
    setLoading(true);
    setsortDesc(!sortDesc);
  };

  const fetchRecords = useCallback(
    async (filter: string, currpage: number) => {
      setLoading(true);
      try {
        if (!bettingCurrency) return false;

        const response: any = await API.get("/user/reports/get-ic-bets", {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
          params: {
            roundId: params["marketId"],
          },
        });
        if (response.status === 200 && response.data) {
          let betList = response.data;
          setRecords([]);
          setRecords(betList);
          setdataflag(1);
          setLoading(false);
        } else {
          throw new Error(response);
        }
      } catch (err) {
        if (err?.response) {
          setErrorMsg(err.response.data.message);
        }
        if (err.response && err.response.status === 401) {
          logout();
        }
      }
    },
    [logout, transaction, fromDate, toDate, sortDesc, bettingCurrency]
  );

  useEffect(() => {
    fetchRecords(filter, currpage);
  }, [fetchRecords, filter, currpage, sortDesc]);

  return (
    <div className="reports-ctn account-summary-ctn">
      <div className="header-ctn">
        <IonRow>
          <div className="img-page-title-row">
            <IonIcon className="title-image" color="primary" src={AccStmtImg} />
            <div
              className="title"
              onClick={(e) => {
                history.push("/account_statement");
              }}
            >
              Account Statement
              {" / " + params["eventName"]}
            </div>
          </div>
        </IonRow>
      </div>

      <div className="content-ctn light-bg">
        {errorMsg ? <Alert message={errorMsg} /> : ""}

        {loading ? (
          <>
            <Spinner />
            <div className="tbl-paceholder"></div>
          </>
        ) : (
          <div className="tbl-ctn">
            <TableContainer component={Paper}>
              <Table className="myb-table" size="small">
                <TableHead className="myb-table-header">
                  <TableRow>
                    <TableCell className="th-date">Place Date</TableCell>
                    <TableCell align="left" className="th-match">
                      Match
                    </TableCell>
                    <TableCell className="th-match-date" align="left">
                      Match Date
                    </TableCell>
                    <TableCell align="left" className="th-market">
                      Market
                    </TableCell>
                    <TableCell align="left" className="th-bet-on">
                      Bet On
                    </TableCell>
                    <TableCell align="right">Odds</TableCell>
                    <TableCell align="right">Stake</TableCell>
                    <TableCell align="right">Bet Type</TableCell>
                    {/* <TableCell align="left" className="th-outcome">
                      Bet status
                    </TableCell> */}
                    <TableCell align="right">Returns</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody className="myb-table-body">
                  {records.map((row) => (
                    <Row key={row.id} row={row} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}

        <IonRow>
          {currpage === 1 || loading ? null : (
            <IonButton
              className="led-btn-prev"
              onClick={(e) => prevpageHandler()}
            >
              Prev({currpage - 1})
            </IonButton>
          )}
          {records.length === pageSize && !loading ? (
            <IonButton
              className="led-btn-next"
              onClick={(e) => nextpageHandler()}
            >
              Next({currpage + 1})
            </IonButton>
          ) : null}
        </IonRow>
      </div>
    </div>
  );
};

function Row(props: { row: UserBet }) {
  const { row } = props;

  return (
    <React.Fragment>
      <TableRow
        className={
          (row.oddValue && row.betType === 0) || row.eventName === "CASINO"
            ? "myb-table-row back-odd-row"
            : row.oddValue && row.betType === 1
            ? "myb-table-row lay-odd-row"
            : "myb-table-row"
        }
      >
        <TableCell className="td-date" component="th" scope="row">
          {moment(row.betPlacedTime).format("DD-MM-YY, h:mm:ss A")}
        </TableCell>

        <TableCell className="myb-table-cell td-match" align="left">
          <div className="web-view">
            <span className="event-link">{row.eventName}</span>
          </div>

          <div className="mob-view">
            <div className="game-label col-data-header mob-fs-13">
              {row.eventName}
            </div>
            <div className="market-label col-data-header">
              {" "}
              {row.marketType === 2 || row.marketType === 5
                ? row.outcomeDesc +
                  " @ " +
                  Number(row.oddValue * 100 - 100).toFixed(0)
                : row.outcomeDesc !== "-"
                ? row.outcomeDesc
                : ""}
            </div>
            <div className="col-data-desc">
              {moment(row.betPlacedTime).format("DD-MM-YY, h:mm:ss A")}
            </div>
          </div>
        </TableCell>

        <TableCell className="myb-table-cell th-match-date" align="left">
          {row.eventDate
            ? moment(row.eventDate).format("DD-MM-YY, h:mm A")
            : null}{" "}
        </TableCell>

        <TableCell className="myb-table-cell td-market" align="left">
          {row.marketType === 1 ? (
            <span>{row.marketName || MarketTypeMap[row.marketType]}</span>
          ) : (
            <>
              {row.marketType >= 0 ? (
                <span>
                  {MarketTypeMap[row.marketType]
                    ? MarketTypeMap[row.marketType]
                    : "Casino"}
                </span>
              ) : (
                "-"
              )}
            </>
          )}
        </TableCell>

        <TableCell className="myb-table-cell td-bet-on" align="left">
          {row.marketType === 2 || row.marketType === 5
            ? row.outcomeDesc +
              " @ " +
              Number(row.oddValue * 100 - 100).toFixed(0)
            : row.outcomeDesc}
        </TableCell>

        <TableCell className="myb-table-cell td-odd" align="right">
          <span className="mob-fs-13">
            {row.oddValue && row.oddValue !== -1.0
              ? row.marketType === 2 || row.marketType === 5
                ? Number(row.sessionRuns).toFixed(0)
                : row.marketType === 1
                ? (row.oddValue * 100 - 100).toFixed(0)
                : row.oddValue.toFixed(2)
              : "-"}
          </span>
        </TableCell>

        <TableCell className="myb-table-cell td-stake" align="right">
          <span className="mob-fs-14">{row.stakeAmount}</span>
        </TableCell>

        <TableCell className="myb-table-cell td-outcome" align="left">
          {getOutcomeDescName(row.outcomeResult.toString())
            ? getOutcomeDescName(row.outcomeResult.toString())
            : "Unsettled"}
        </TableCell>

        <TableCell
          className={
            row.payOutAmount > 0
              ? "myb-table-cell profit-bet"
              : "myb-table-cell loss-bet"
          }
          align="right"
        >
          <span className="mob-fs-14">
            {row.outcomeResult === 2 ? "-" : row.payOutAmount.toFixed(2)}
          </span>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

const mapStateToProps = (state: RootState) => {
  return {
    bettingCurrency: state.common.bettingCurrency,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    logout: () => dispatch(logout()),
    fetchBettingCurrency: () => dispatch(fetchBettingCurrency()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Ledger);
