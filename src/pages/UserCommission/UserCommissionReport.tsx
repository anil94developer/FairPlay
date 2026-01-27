import React, { useState, useCallback, useEffect } from "react";
import { IonIcon, IonRow, IonButton, IonCol } from "@ionic/react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import MomentUtils from "@date-io/moment";

import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import moment, { Moment } from "moment";

import API from "../../api/index";
import { CommissionEvents } from "../../models/UserCommissionReport";
import { AuthResponse } from "../../models/api/AuthResponse";
import Spinner from "../../components/Spinner/Spinner";
import Modal from "../../components/Modal/Modal";
import Paper from "@material-ui/core/Paper";
import { Currency } from "../../models/Currency";
import MyWalletImg from "../../assets/images/icons/wallet.svg";
import InfoImg from "../../assets/images/sportsbook/info.svg";
import "./UserCommissionReport.scss";
import { NavLink } from "react-router-dom";
import CommissionRules from "../../views/CommissionRules/CommissionRules";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { getCurrencyTypeFromToken } from "../../store";

type StoreProps = {
  fetchBettingCurrency: Function;
  bettingCurrency: Currency;
  balance: number;
};

const UserCommisionReport: React.FC<StoreProps> = (props) => {
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<CommissionEvents[]>([]);
  const [sortDesc, setSortDesc] = useState<Boolean>(true);
  const [pageNum, setPageNum] = useState<number>(1);
  const [fromDate, setfromDate] = useState<Moment>(moment().subtract(7, "d"));
  const [toDate, setToDate] = useState<Moment>(moment());
  const [launchModal, setLaunchModal] = useState<boolean>(false);
  const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];

  const fromDateChangeHandler = (d: Moment) => {
    setfromDate(d);
  };

  const toDateChangeHandler = (d: Moment) => {
    setToDate(d);
  };

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response: AuthResponse = await API.get(
        "user/reports/commission-report",
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
          params: {
            pageNum: pageNum,
            dateFrom: fromDate.startOf("day").toISOString(),
            dateTo: toDate.endOf("day").toISOString(),
          },
        }
      );
      if (response.status === 200) {
        setRecords(response.data);
        setLoading(false);
      } else {
        setLoading(false);
        throw new Error(response.data);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setErrorMsg(err.response.data.error);
      }
      setLoading(false);
    }
  }, [sortDesc, pageNum, fromDate, toDate]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return (
    <IonRow className="h-100">
      <IonCol sizeLg="2" sizeMd="2.2" className="commission-sidebar web-view">
        <div className="commission-menu">
          <div className="commission-menu-card web-view">
            <div className="commission-menu-card-content">
              <div className="filters-heading">Filters</div>
              <div className="filters-input">
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
                      format="DD/MM/yyyy"
                      minDate={moment().subtract(1, "months").calendar()}
                      margin="normal"
                      id="from-date"
                      autoOk={true}
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
                      format="DD/MM/yyyy"
                      autoOk={true}
                      minDate={moment().subtract(1, "months").calendar()}
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
            </div>
          </div>
        </div>
      </IonCol>
      <IonCol sizeLg="9.9" sizeMd="9.6">
        <div className="reports-ctn user-commission-ctn">
          <>
            <div className="header-ctn my-wallet-header">
              <IonRow>
                <div className="img-page-title-row img-title-ctn commission-report-heading">
                  <div className="image-title">
                    <IonIcon
                      className="title-image"
                      color="primary"
                      src={MyWalletImg}
                    />
                    <div className="title">
                      Commission Report{" "}
                      <IonIcon
                        className="info-img"
                        onClick={() => setLaunchModal(true)}
                        src={InfoImg}
                      />
                    </div>
                  </div>
                </div>
              </IonRow>
            </div>

            <div className="content-ctn light-bg">
              <div className="balance-history-tbl-ctn">
                {errorMsg ? <div className="err-msg"> {errorMsg}</div> : ""}
                {loading ? (
                  <Spinner />
                ) : (
                  <div className="tbl-ctn">
                    <TableContainer className="tbl-paper-ctn" component={Paper}>
                      <Table className="tbl-ctn my-wallet-tbl">
                        <TableHead className="tbl-header-section">
                          <TableRow>
                            <TableCell className="th-col">Event Date</TableCell>
                            <TableCell align="left" className="th-col web-view">
                              Event Name
                            </TableCell>
                            <TableCell align="left" className="th-col ">
                              Commission
                            </TableCell>
                          </TableRow>
                        </TableHead>

                        {records.length > 0 ? (
                          <TableBody className="tbl-body">
                            {records.map((row) => (
                              <TableRow className="tb-row">
                                <TableCell
                                  component="th"
                                  scope="row"
                                  className="tb-col"
                                >
                                  <div>
                                    {moment(row.eventDate).format(
                                      "DD-MM-YY, h:mm:ss A"
                                    )}
                                  </div>
                                  <div className="mob-view">
                                    <NavLink
                                      className="nav-link b-text"
                                      to={`/commission_report/${
                                        row.eventId
                                      }?eventName=${
                                        row.eventName
                                      }&dateFrom=${fromDate.startOf(
                                        "day"
                                      )}&dateTo=${toDate.startOf("day")}`}
                                    >
                                      {row.eventName}
                                    </NavLink>
                                  </div>
                                </TableCell>
                                <TableCell
                                  className="tb-col web-view"
                                  align="left"
                                >
                                  <NavLink
                                    className="nav-link b-text"
                                    to={`/commission_report/${
                                      row.eventId
                                    }?eventName=${
                                      row.eventName
                                    }&dateFrom=${fromDate.startOf(
                                      "day"
                                    )}&dateTo=${toDate.startOf("day")}`}
                                  >
                                    {row.eventName}
                                  </NavLink>
                                </TableCell>
                                <TableCell className="tb-col " align="left">
                                  {Number(
                                    row.eventCommission / cFactor
                                  ).toFixed()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        ) : (
                          <TableCell className="no-data-row" colSpan={9}>
                            <div>You don't have any transactions</div>
                          </TableCell>
                        )}
                      </Table>
                    </TableContainer>
                    <IonRow>
                      {pageNum === 1 || loading ? null : (
                        <IonButton
                          className="myb-btn-prev"
                          onClick={(e) => {
                            setPageNum(pageNum - 1);
                          }}
                        >
                          Prev({pageNum - 1})
                        </IonButton>
                      )}
                      {records.length === 10 && !loading ? (
                        <IonButton
                          className="myb-btn-next"
                          onClick={(e) => setPageNum(pageNum + 1)}
                        >
                          Next({pageNum + 1})
                        </IonButton>
                      ) : null}
                    </IonRow>
                  </div>
                )}
              </div>
            </div>

            <Modal
              open={launchModal}
              closeHandler={() => setLaunchModal(false)}
              customClass="light-bg-title"
              title="Commission Rules"
              size="md"
            >
              <CommissionRules />
            </Modal>
          </>
        </div>
      </IonCol>
    </IonRow>
  );
};

export default UserCommisionReport;
