import React, { useState, useEffect } from "react";
import { IonRow, IonButton } from "@ionic/react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import ArrowBack from "@material-ui/icons/ArrowBack";
// import MomentUtils from '@date-io/moment';
import Paper from "@material-ui/core/Paper";
import { useParams, useHistory, useLocation } from "react-router";
// import {
//   MuiPickersUtilsProvider,
//   KeyboardDatePicker,
// } from '@material-ui/pickers';
import moment from "moment";

import API from "../../api/index";
import { UserCommissionDetails } from "../../models/UserCommissionReport";
import { AuthResponse } from "../../models/api/AuthResponse";
import Spinner from "../../components/Spinner/Spinner";
// import { TransactionTypeMap } from '../../util/stringUtil';
import "./UserCommissionReport.scss";

const UserCommissionBySportView: React.FC = () => {
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState<Boolean>(true);
  const [records, setRecords] = useState<UserCommissionDetails[]>([]);
  const [pageNum, setPageNum] = useState<number>(1);
  const routeParams = useParams<any>();
  const history = useHistory();
  const queryStringParams = new URLSearchParams(useLocation().search);

  const fetchRecords = async (
    eventId: string,
    fromDate?: any,
    toDate?: any
  ) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const response: AuthResponse = await API.get(
        `user/reports/commission-report/${eventId}`,
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
          },
          params: {
            dateFrom: moment(fromDate).startOf("day").toISOString(),
            dateTo: moment(toDate).endOf("day").toISOString(),
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
  };

  useEffect(() => {
    if (queryStringParams) {
      fetchRecords(
        routeParams.eventId,
        queryStringParams?.get("dateFrom"),
        queryStringParams?.get("dateTo")
      );
    }
  }, [routeParams]);

  const handleOnBack = () => {
    history.goBack();
  };

  return (
    <div className="reports-ctn user-commission-ctn">
      <>
        <div className="header-ctn my-wallet-header">
          <IonRow>
            <div className="img-page-title-row img-title-ctn">
              <div className="image-title m-link" onClick={handleOnBack}>
                <ArrowBack />
                <div className="title">
                  {queryStringParams?.get("eventName")}
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
                        <TableCell className="th-col">
                          Transaction Date
                        </TableCell>
                        <TableCell align="left" className="th-col">
                          Transaction Type
                        </TableCell>
                        <TableCell align="left" className="th-col">
                          Market
                        </TableCell>
                        <TableCell align="left" className="th-col ">
                          Commission
                        </TableCell>

                        <TableCell align="left" className="th-col ">
                          Upline
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    {records.length > 0 ? (
                      <TableBody className="tbl-body">
                        {records.map((row) => (
                          <TableRow className="tb-row">
                            <TableCell className="tb-col" align="left">
                              {moment(row.transactionDate).format(
                                "MMMM Do YYYY, h:mm:ss a"
                              )}
                            </TableCell>

                            <TableCell
                              component="th"
                              scope="row"
                              className="tb-col"
                            >
                              {row.transactionType}
                            </TableCell>

                            <TableCell className="tb-col" align="left">
                              {row.marketType === "FANCY"
                                ? "Fancy - " + row.sessionName
                                : "Bookmaker"}
                            </TableCell>
                            <TableCell className="tb-col " align="left">
                              {row.commissionPoints}
                            </TableCell>

                            <TableCell className="tb-col " align="left">
                              {row.netUpLine}
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
      </>
    </div>
  );
};

export default UserCommissionBySportView;
