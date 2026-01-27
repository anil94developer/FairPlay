import React, { useState, useCallback, useEffect } from "react";
import {
  IonRow,
  IonButton,
  IonSelect,
  IonSelectOption,
  IonIcon,
} from "@ionic/react";
import { connect } from "react-redux";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import moment, { Moment } from "moment";

import API from "../../api/index";
import { logout, fetchBettingCurrency } from "../../store";
import { LedgerRecord } from "../../models/LedgerRecord";
import Spinner from "../../components/Spinner/Spinner";
import Alert from "../../components/Alert/Alert";

import { Currency } from "../../models/Currency";
import { RootState } from "../../models/RootState";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import "./AccountStatement.scss";
import { getTransactionNameByID, MarketTypeByID } from "../../util/stringUtil";
import AccountStatementRecord from "./AccountStatementRecord";
import Modal from "../../components/Modal/Modal";
import SportSvg from "../../assets/images/sportsbook/icons/sports.svg";
import CasinoImg from "../../assets/images/sportsbook/icons/casino.svg";
import AccStmtImg from "../../assets/images/icons/acc_stmt.svg";
import { useHistory } from "react-router-dom";

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
  const [records, setRecords] = useState<LedgerRecord[]>([]);
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

  // const filterHandler = (
  //   event: React.ChangeEvent<{}>,
  //   newValue: 'all' | 'settled' | 'unsettled'
  // ) => {
  //   setTabValue(newValue);
  //   setFilter(newValue);
  //   setLoading(true);
  //   setcurrpage(1);
  // };

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

  // useEffect(() => {
  //   const fetchSummary = async () => {
  //     const response = await API.get('/user/reports/summary-ledger', {
  //       headers: {
  //         Authorization: sessionStorage.getItem('jwt_token'),
  //       },
  //       params: {
  //         filter: filter,
  //         dateFrom: fromDate.startOf('day').toISOString(),
  //         dateTo: toDate.endOf('day').toISOString(),
  //       },
  //     });
  //     setSummary(response.data);
  //   };
  //   fetchSummary();
  // }, [filter, fromDate, toDate]);

  const fetchRecords = useCallback(
    async (filter: string, currpage: number) => {
      setLoading(true);
      try {
        if (!bettingCurrency) return false;

        const response: any = await API.get(
          "/user/reports/account-summary-market",
          {
            headers: {
              Authorization: sessionStorage.getItem("jwt_token"),
            },
            params: {
              filter: filter,
              page: currpage,
              sortDesc: sortDesc,
              currencyType: bettingCurrency,
              dateFrom: fromDate.startOf("day").toISOString(),
              dateTo: toDate.endOf("day").toISOString(),
              nRecords: pageSize,
              transactionType: transaction,
              eventId: params["eventId"],
              marketId: params["marketId"],
              marketType: params["marketType"],
              outcomeId: params["outcomeId"],
            },
          }
        );
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

  const onShowTransactionDetails = (row: LedgerRecord) => {
    setTransactionDetails({
      id: row.transactionId,
      type: row.transactionType,
    });
    setShowTransactionDetailsModal(true);
  };

  useEffect(() => {
    fetchRecords(filter, currpage);
  }, [fetchRecords, filter, currpage, sortDesc]);

  return (
    <div className="reports-ctn account-summary-ctn">
      <div className="header-ctn">
        <IonRow>
          <div className="img-page-title-row">
            <IonIcon className="title-image" color="primary" src={AccStmtImg} />
            <div className="title">
              Account Statement
              {" / " +
                params["eventName"] +
                (params["marketType"] ? "(" + params["marketType"] + ")" : "")}
            </div>
          </div>

          <div className="user-stmnt-filters-row filters-row">
            <div className="trans-type-filter web-view">
              <div className="select-label">Transaction Type</div>
              <IonSelect
                value={transaction}
                placeholder="Select One"
                interface="popover"
                onIonChange={(e) => setTransaction(e.detail.value)}
              >
                <IonSelectOption value="">All</IonSelectOption>
                <IonSelectOption value="DEPOSIT">Deposit</IonSelectOption>
                <IonSelectOption value="WITHDRAW">Withdraw</IonSelectOption>
                <IonSelectOption value="SETTLEMENT_DEPOSIT">
                  Settlement Deposit
                </IonSelectOption>
                <IonSelectOption value="SETTLEMENT_WITHDRAW">
                  Settlement Withdraw
                </IonSelectOption>

                <IonSelectOption value="BET_SETTLEMENT">
                  Bet Settlement
                </IonSelectOption>
                <IonSelectOption value="ROLLBACK_BET_SETTLEMENT ">
                  Rollback
                </IonSelectOption>
                <IonSelectOption value="VOID_BET_SETTLEMENT">
                  Voided
                </IonSelectOption>
              </IonSelect>
            </div>

            <div className="from-date-filter">
              <div className="date-label">From</div>
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <KeyboardDatePicker
                  disableFuture
                  className="date-filter date-control"
                  InputProps={{
                    disableUnderline: true,
                    readOnly: true,
                  }}
                  disableToolbar
                  variant="inline"
                  minDate={moment().subtract(1, "months").calendar()}
                  format="DD/MM/yyyy"
                  margin="normal"
                  id="from-date"
                  value={fromDate}
                  onChange={(e) => fromDateChangeHandler(e)}
                />
              </MuiPickersUtilsProvider>
            </div>

            <div className="to-date-filter">
              <div className="date-label">To</div>
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <KeyboardDatePicker
                  disableFuture
                  className="date-filter date-control"
                  InputProps={{
                    disableUnderline: true,
                    readOnly: true,
                  }}
                  disableToolbar
                  variant="inline"
                  minDate={moment().subtract(1, "months").calendar()}
                  format="DD/MM/yyyy"
                  margin="normal"
                  id="to-date"
                  value={toDate}
                  onChange={(e) => toDateChangeHandler(e)}
                  KeyboardButtonProps={{
                    "aria-label": "change date",
                  }}
                />
              </MuiPickersUtilsProvider>
            </div>
          </div>
        </IonRow>

        <IonRow className="mob-view filters-row">
          <div className="trans-type-filter">
            <div className="select-label">Transaction Type</div>
            <IonSelect
              value={transaction}
              placeholder="Select One"
              interface="popover"
              onIonChange={(e) => setTransaction(e.detail.value)}
            >
              <IonSelectOption value="">All</IonSelectOption>
              <IonSelectOption value="DEPOSIT">Deposit</IonSelectOption>
              <IonSelectOption value="WITHDRAW">Withdraw</IonSelectOption>
              <IonSelectOption value="SETTLEMENT_DEPOSIT">
                Settlement Deposit
              </IonSelectOption>
              <IonSelectOption value="SETTLEMENT_WITHDRAW">
                Settlement Withdraw
              </IonSelectOption>

              <IonSelectOption value="BET_SETTLEMENT">
                Bet Settlement
              </IonSelectOption>
              <IonSelectOption value="ROLLBACK_BET_SETTLEMENT ">
                Rollback
              </IonSelectOption>
              <IonSelectOption value="VOID_BET_SETTLEMENT">
                Voided
              </IonSelectOption>
            </IonSelect>
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
              <Table>
                <TableHead className="tbl-header-section">
                  <TableRow>
                    <TableCell className="date-col">
                      Place Date
                      <IconButton
                        aria-label="Change Order"
                        size="medium"
                        onClick={() => sortOrderHandler()}
                      >
                        {/* {sortDesc ? (
                          <TableSortLabel active={true} direction="desc" />
                        ) : (
                          <TableSortLabel active={true} direction="asc" />
                        )} */}
                      </IconButton>
                    </TableCell>
                    <TableCell className="transaction-col" align="left">
                      Transaction
                    </TableCell>
                    <TableCell className="hid-mob" align="center">
                      Event
                    </TableCell>
                    <TableCell className="hid-mob" align="left">
                      Market Type
                    </TableCell>
                    <TableCell align="right">Credit/Debit</TableCell>
                    {/* <TableCell align="right">Debit</TableCell> */}
                    <TableCell className="hid-mob" align="right">
                      Balance
                    </TableCell>
                    <TableCell className="transaction-id" align="left">
                      Transaction ID
                    </TableCell>
                  </TableRow>
                </TableHead>
                {records.length > 0 || dataflag === 0 ? (
                  <TableBody className="myb-table-body">
                    {records.map((row) => (
                      <Row
                        row={row}
                        showTransactionDetails={() => {
                          onShowTransactionDetails(row);
                        }}
                      />
                    ))}
                  </TableBody>
                ) : (
                  <TableCell className="no-data-row" colSpan={8}>
                    <div>
                      {" "}
                      You have no transactions for the selected criteria
                    </div>
                  </TableCell>
                )}
              </Table>
            </TableContainer>
            <Modal
              open={showTransactionDetailsModal}
              title="Transaction Details"
              customClass="light-bg-title"
              closeHandler={() => {
                setTransactionDetails({
                  id: "",
                  type: "",
                });
                setShowTransactionDetailsModal(false);
              }}
              size="md"
            >
              {/* <AccountStatementRecord
                transactionId={transactionDetails.id}
                transactionType={transactionDetails.type}
              /> */}
            </Modal>
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

function Row(props: { row: LedgerRecord; showTransactionDetails: () => void }) {
  const { row, showTransactionDetails } = props;
  // const getDisplayName = (runnerName: string) => {
  //   let name =
  //     runnerName.split(':').length > 1
  //       ? runnerName.split(':')[1]
  //       : runnerName.split(':')[0];
  //   if (name.toLowerCase().includes('crudeoil')) return 'CRUDE OIL';
  //   else if (name.toLowerCase().includes('gold')) return 'GOLD';
  //   else if (name.toLowerCase().includes('silver')) return 'SILVER';
  //   else if (name.toLowerCase().includes('banknifty')) return 'BANK NIFTY';
  //   return name;
  // };

  return (
    <React.Fragment>
      <TableRow className="tb-row" onClick={showTransactionDetails}>
        <TableCell className="date-col" component="th" scope="row">
          {moment(row.transactionTime).format("DD-MM-YY, h:mm:ss A")}
        </TableCell>
        <TableCell align="left">
          <div className="b-text m-link web-view">
            {["0", "1", "2", "3"].includes(row.transactionType.toString())
              ? row.upLineUser +
                " / " +
                getTransactionNameByID(row.transactionType)
              : getTransactionNameByID(row.transactionType)}
          </div>
          <div className="mob-view">
            <div className="mob-col-section">
              <div>
                <span className="transacction-img">
                  {!getTransactionNameByID(row.transactionType).includes(
                    "Casino"
                  ) ? (
                    <IonIcon
                      color="primary"
                      className="img"
                      src={SportSvg}
                    ></IonIcon>
                  ) : (
                    <IonIcon
                      color="primary"
                      className="img"
                      src={CasinoImg}
                    ></IonIcon>
                  )}
                </span>
              </div>
              <div>
                <div
                  className="b-text m-link text-elips"
                  onClick={showTransactionDetails}
                >
                  {["0", "1", "2", "3"].includes(row.transactionType.toString())
                    ? row.upLineUser +
                      " / " +
                      getTransactionNameByID(row.transactionType)
                    : getTransactionNameByID(row.transactionType)}
                </div>
                <div className="tiny-info-text">
                  TXN ID: {row.transactionId}
                </div>
                <div className="tiny-info-text">
                  {moment(row.transactionTime).format("DD-MM-YY, h:mm:ss A")}
                </div>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="hid-mob" align="center">
          <span className="txt-bldin-mob">{row.eventName}</span>
        </TableCell>
        <TableCell className="hid-mob" align="left">
          <span className="txt-bldin-mob">
            {row.marketType === 1
              ? row.marketName || MarketTypeByID(row.marketType.toString())
              : row.marketType === -1
              ? ""
              : MarketTypeByID(row.marketType.toString())}
          </span>
        </TableCell>
        <TableCell align="right">
          <div
            className={
              row.amount > 0
                ? "profit mob-fs-16"
                : row.amount < 0
                ? "loss mob-fs-16"
                : null
            }
          >
            {row.amount > 0
              ? "+" + row.amount.toFixed(2)
              : row.amount.toFixed(2)}
          </div>
          <div className="mob-view mob-fs-13">
            {row.balanceAfter === -1
              ? "-"
              : "Bal: " + Math.floor(row.balanceAfter).toFixed(2)}
          </div>
        </TableCell>
        {/* <TableCell align="right">
          <span className="loss">
            {row.amount > 0 ? 0 : -row.amount.toFixed(2)}
          </span>
        </TableCell> */}
        <TableCell className="hid-mob" align="right">
          <span className="txt-bldin-mob">
            {row.balanceAfter === -1
              ? "-"
              : Math.floor(row.balanceAfter).toFixed(2)}
          </span>
        </TableCell>
        <TableCell className="transaction-id" align="left">
          <div className="b-text m-link">{row.transactionId}</div>
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
