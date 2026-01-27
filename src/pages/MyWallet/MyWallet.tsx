import { IonRow } from "@ionic/react";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import moment, { Moment } from "moment";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import Spinner from "../../components/Spinner/Spinner";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { BalanceInfo } from "../../models/BalanceInfo";
import { RootState } from "../../models/RootState";
import { AuthResponse } from "../../models/api/AuthResponse";
import { getCurrencyTypeFromToken } from "../../store";
import SVLS_API from "../../svls-api";

import { ReactComponent as WalletIcon } from "../../assets/images/icons/walletIcon.svg?react";
import { FundTransferRecord } from "../../models/FundTransferRecord";
import { TransactionTypeMap } from "../../util/stringUtil";
import "./MyWallet.scss";

import { useHistory } from "react-router";
import DateTemplate from "../../common/DateAndTimeTemplate/DateAndTimeTemplate";
import ReportBackBtn from "../../common/ReportBackBtn/ReportBackBtn";
import ReportsHeader from "../../common/ReportsHeader/ReportsHeader";
import REPORTING_API from "../../reporting-api";
import CustomTableMob, {
  HeaderParamsType,
  RowType,
} from "../../common/CustomTableMob/CustomTableMob";
import { useWindowSize } from "../../hooks/useWindowSize";

type StoreProps = {
  allowedConfig: number;
  commissionEnabled: boolean;
  balance: number;
  langData: any;
};

type Filters = {
  fromDate: any;
  toDate: any;
  pageToken: string[];
};

const MyWallet: React.FC<StoreProps> = (props) => {
  const { balance, langData } = props;
  const windowSize = useWindowSize();
  const headerParams: HeaderParamsType[] = [
    {
      label: "Transaction",
      langKey: "transaction",
      param: "",
      widthInPercent: 33.33,
    },
    {
      label: "credit/debit",
      langKey: "credit_debit",
      param: "",
      widthInPercent: 33.33,
    },
    { label: "balance", langKey: "balance", param: "", widthInPercent: 33.33 },
  ];
  const upperRow: RowType[] = [
    { param: "", widthInPercent: 33.33, cellRender: upperRowCellRender1 },
    { param: "", widthInPercent: 33.33, cellRender: upperRowCellRender2 },
    { param: "", widthInPercent: 33.33, cellRender: upperRowCellRender3 },
  ];
  const history = useHistory();
  const defaultFilters: Filters = {
    fromDate: moment().subtract(7, "d"),
    toDate: moment(),
    pageToken: [],
  };

  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState<Boolean>(true);
  const [records, setRecords] = useState<FundTransferRecord[]>([]);
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo>(null);
  const [pageNum, setPageNum] = useState<number>(1);
  const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];

  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [nextPageToken, setNextPageToken] = useState<string>(null);

  const fetchRecords = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Replaced API call with dummy data
      const dummyStatements = [
        {
          transactionId: "TXN001",
          transactionType: 0,
          amount: 1000,
          balanceAfter: 11000,
          transactionTime: new Date().toISOString(),
          remarks: "Dummy Deposit",
        },
        {
          transactionId: "TXN002",
          transactionType: 1,
          amount: -500,
          balanceAfter: 10500,
          transactionTime: new Date().toISOString(),
          remarks: "Dummy Withdrawal",
        },
      ];
      setRecords(dummyStatements);
      setNextPageToken(null);
    } catch (err) {
      if (err.response && err.response.data) {
        setErrorMsg(err.response.data.error);
      }
      setNextPageToken(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCliamBalance();
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [filters]);

  const fetchCliamBalance = async () => {
    setLoading(false);
    setErrorMsg(null);

    try {
      // Replaced API call with dummy data
      const dummyBalanceInfo = {
        balance: 10000,
        incentive: 500,
      };
      setBalanceInfo(dummyBalanceInfo as any);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const onClaimCommissionHandler = async () => {
    if (loading) return true;
    setLoading(true);

    try {
      // Replaced API call with dummy logic - simulate successful claim
      // Update balance info to reflect claimed incentive
      setBalanceInfo((prev) => {
        if (prev) {
          return {
            ...prev,
            balance: (prev.balance || 0) + (prev.incentive || 0),
            incentive: 0,
          };
        }
        return prev;
      });
      setLoading(false);
    } catch (err) {
      setErrorMsg(err.response?.data?.message);
      setLoading(false);
    }
  };

  const prevPage = () => {
    if (filters.pageToken.length > 0) {
      let pagetokens = filters.pageToken;
      pagetokens.pop();
      setPageNum(pageNum - 1);
      setFilters({ ...filters, pageToken: [...pagetokens] });
    }
    setNextPageToken(null);
  };

  const nextPage = () => {
    if (nextPageToken) {
      setPageNum(pageNum + 1);
      setFilters({
        ...filters,
        pageToken: [...filters.pageToken, nextPageToken],
      });
    }
    setNextPageToken(null);
  };

  const fromDateChangeHandler = (d: Moment) => {
    setFilters({ ...filters, fromDate: d, pageToken: [] });
    setNextPageToken(null);
  };

  const toDateChangeHandler = (d: Moment) => {
    setFilters({ ...filters, toDate: d, pageToken: [] });
    setNextPageToken(null);
  };

  function upperRowCellRender1(headerParam, row) {
    return (
      <div className="upperrow-pad-5">
        <div className="tiny-info-text">
          {TransactionTypeMap[row.transactionType]}
        </div>
        <div className="col-data-desc tiny-info-text">
          {moment(row.transactionTime).format("DD-MM-YY, h:mm A")}
        </div>
      </div>
    );
  }

  function upperRowCellRender2(headerParam, row) {
    return (
      <div
        className={`upperrow-pad-5 ${
          row.account > 0 ? "mw-ur-profit" : "mw-ur-loss"
        } `}
      >
        {row.amount > 0
          ? "+" + Number(row.amount / cFactor).toFixed(2)
          : Number(row.amount / cFactor).toFixed(2)}
      </div>
    );
  }

  function upperRowCellRender3(headerParam, row) {
    return (
      <div className="upperrow-pad-5">
        {Number(row.balanceAfter / cFactor).toFixed(2)}
      </div>
    );
  }

  return (
    <>
      <div className="reports-ctn my-wallet-ctn mw-ctn-dup">
        <>
          <ReportBackBtn back={langData?.["back"]} />
          <ReportsHeader
            titleIcon={WalletIcon}
            reportName={langData?.["my_wallet"]}
            tabsOrBtns={[
              {
                label: `${langData?.["available_balance_caps_txt"]}: ${
                  balance ? Number(balance / cFactor).toFixed(2) : "0.00"
                }`,
                onSelect: () => {},
                className: "avail-bal-label",
              },
            ]}
            reportFilters={[
              {
                element: (
                  <DateTemplate
                    value={filters.fromDate}
                    label={langData?.["from"]}
                    // onChange={fromDateChangeHandler}

                    onChange={(e) => fromDateChangeHandler(e)}
                    minDate={moment().subtract(1, "months").calendar()}
                    maxDate={filters.toDate}
                  />
                ),
              },
              {
                element: (
                  <DateTemplate
                    value={filters.toDate}
                    label={langData?.["to"]}
                    onChange={(e) => toDateChangeHandler(e)}
                    minDate={filters.fromDate}
                  />
                ),
              },
              // {
              //   fullWidthInMob: true,
              //   element: (
              //     <button
              //       className={'claim-btn'}
              //       onClick={onClaimCommissionHandler}
              //     >
              //       {'Claim ' + (balanceInfo?.incentive / cFactor).toFixed(2)}
              //     </button>
              //   ),
              // },
            ]}
          />

          <div className="content-ctn light-bg">
            <div className="balance-history-tbl-ctn">
              {errorMsg ? <div className="err-msg"> {errorMsg}</div> : ""}
              {loading ? (
                <Spinner />
              ) : (
                <div className="tbl-ctn">
                  {windowSize.width > 720 && (
                    <TableContainer className="tbl-paper-ctn" component={Paper}>
                      <Table className="tbl-ctn my-wallet-tbl" size="small">
                        <TableHead className="tbl-header-section">
                          <TableRow>
                            <TableCell className="th-col date-col" align="left">
                              {langData?.["date"]}
                              <IconButton
                                aria-label={langData?.["change_order"]}
                                size="small"
                              ></IconButton>
                            </TableCell>

                            <TableCell
                              align="left"
                              className="th-col transaction-col border-left"
                            >
                              {langData?.["transaction"]}
                            </TableCell>

                            <TableCell
                              align="right"
                              className="th-col border-left-right"
                            >
                              {langData?.["credit_debit"]}
                            </TableCell>

                            <TableCell
                              align="right"
                              className="th-col border-right"
                            >
                              {langData?.["balance"]}
                            </TableCell>

                            <TableCell align="left" className="th-col desc-col">
                              {langData?.["description"]}
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
                                  className="tb-col date-col"
                                  align="left"
                                >
                                  {moment(row.transactionTime).format(
                                    "DD-MM-YY, h:mm:ss A"
                                  )}
                                </TableCell>
                                <TableCell
                                  className="tb-col transaction-col"
                                  align="left"
                                >
                                  <div className="web-view">
                                    {TransactionTypeMap[row.transactionType]}
                                  </div>

                                  <div className="mob-view">
                                    <div className="tiny-info-text">
                                      {TransactionTypeMap[row.transactionType]}
                                    </div>
                                    <div className="col-data-desc tiny-info-text">
                                      {moment(row.transactionTime).format(
                                        "DD-MM-YY, h:mm A"
                                      )}
                                    </div>
                                  </div>
                                </TableCell>

                                <TableCell
                                  className={
                                    row.amount > 0
                                      ? "tb-col profit"
                                      : row.amount < 0
                                      ? "tb-col loss"
                                      : "tb-col"
                                  }
                                  align="right"
                                >
                                  <span className="mob-fs-14">
                                    {row.amount > 0
                                      ? "+" +
                                        Number(row.amount / cFactor).toFixed(2)
                                      : Number(row.amount / cFactor).toFixed(2)}
                                  </span>
                                </TableCell>
                                <TableCell className="tb-col" align="right">
                                  <span className="mob-fs-13">
                                    {Math.floor(
                                      Number(row.balanceAfter / cFactor)
                                    ).toFixed(2)}
                                  </span>
                                </TableCell>

                                <TableCell
                                  className="tb-col desc-col"
                                  align="left"
                                >
                                  {row.description ? row.description : "-"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        ) : (
                          <TableCell className="no-data-row" colSpan={9}>
                            <div>
                              {langData?.["transactions_not_found_txt"]}
                            </div>
                          </TableCell>
                        )}
                      </Table>
                    </TableContainer>
                  )}
                  {windowSize.width < 720 && (
                    <CustomTableMob
                      headerParams={headerParams}
                      upperRow={upperRow}
                      lowerRow={undefined}
                      bodyData={records}
                      noDataMessage={langData?.["transactions_not_found_txt"]}
                      langData={langData}
                    />
                  )}

                  <IonRow className="mw-pagination">
                    {filters.pageToken.length > 0 && !loading && (
                      <button className="mw-page-btn" onClick={prevPage}>
                        ({langData?.["prev"]}) ({pageNum - 1})
                      </button>
                    )}
                    {nextPageToken && !loading && (
                      <button className="mw-page-btn" onClick={nextPage}>
                        ({langData?.["next"]}) ({pageNum + 1})
                      </button>
                    )}
                  </IonRow>
                </div>
              )}
            </div>
          </div>
        </>
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    balance: state.auth.balanceSummary.balance,
    allowedConfig: state.common.allowedConfig,
    commissionEnabled: state.common.commissionEnabled,
    langData: state.common.langData,
  };
};

export default connect(mapStateToProps, null)(MyWallet);
