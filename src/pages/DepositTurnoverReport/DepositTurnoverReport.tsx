import { IonButton, IonCol, IonRow } from "@ionic/react";
import Paper from "@material-ui/core/Paper/Paper";
import Table from "@material-ui/core/Table/Table";
import TableBody from "@material-ui/core/TableBody/TableBody";
import TableCell from "@material-ui/core/TableCell/TableCell";
import TableContainer from "@material-ui/core/TableContainer/TableContainer";
import TableHead from "@material-ui/core/TableHead/TableHead";
import TableRow from "@material-ui/core/TableRow/TableRow";
import moment, { Moment } from "moment";
import React, { useEffect, useState } from "react";
import { ReactComponent as TurnOverHistory } from "../../assets/images/reportIcons/TurnOverHistory.svg?react";
import DateTemplate from "../../common/DateAndTimeTemplate/DateAndTimeTemplate";
import ReportBackBtn from "../../common/ReportBackBtn/ReportBackBtn";
import ReportsHeader from "../../common/ReportsHeader/ReportsHeader";
import SelectTemplate from "../../common/SelectTemplate/SelectTemplate";
import Spinner from "../../components/Spinner/Spinner";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { getCurrencyTypeFromToken } from "../../store";
import "./DepositTurnoverReport.scss";
import { connect } from "react-redux";
import { RootState } from "../../models/RootState";

type DepositTurnoverDTO = {
  id: number;
  account_id: number;
  user_name: string;
  deposit_amount: number;
  cashable_amount: number;
  turnover_required: number;
  turnover_met: number;
  turnover_percentage: number;
  transaction_id: string;
  pg_transaction_id: string;
  status: string;
  notes: string;
  award_date: number;
  redeem_date: number | null;
  update_time: number;
};

type Filters = {
  dateFrom: any;
  dateTo: any;
  pageToken: string[];
  status: string;
};

const DepositTurnoverReport: React.FC<{ langData: any }> = (props) => {
  const { langData } = props;
  const defaultFilters: Filters = {
    dateFrom: moment().subtract(7, "d"),
    dateTo: moment(),
    pageToken: [],
    status: "AWARDED",
  };
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 720);

  const webHeaderParams = [
    {
      label: "Transaction Time",
      param: "award_date",
      widthInPercent: 15,
      cellRender: eventDateRender,
    },
    {
      label: "Amount",
      param: "deposit_amount",
      widthInPercent: 15,
    },
    {
      label: "Cashable Amount",
      param: "cashable_amount",
      widthInPercent: 15,
    },
    {
      label: "Turnover Required",
      param: "turnover_required",
      widthInPercent: 20,
    },
    { label: "Turnover Met", param: "turnover_met", widthInPercent: 20 },
    {
      label: "Status",
      param: "status",
      widthInPercent: 20,
    },
    {
      label: "Redeem Date",
      param: "redeem_date",
      widthInPercent: 15,
      cellRender: eventDateRender,
    },
    {
      label: "Update Time",
      param: "update_time",
      widthInPercent: 15,
      cellRender: eventDateRender,
    },
  ];

  const [turnover, setTurnover] = useState<DepositTurnoverDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const pageSize = 25;
  const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];

  const [nextPageToken, setNextPageToken] = useState<string>(null);

  const nextPage = () => {
    if (nextPageToken) {
      setFilters({
        ...filters,
        pageToken: [...filters.pageToken, nextPageToken],
      });
      setNextPageToken(null);
    }
  };

  const prevPage = () => {
    if (filters.pageToken?.length > 0) {
      let pagetokens = filters.pageToken;
      pagetokens.pop();
      setFilters({
        ...filters,
        pageToken: [...pagetokens],
      });
      setNextPageToken(null);
    }
  };
  const fetchData = async () => {
    setLoading(true);
    try {
      // Dummy data instead of API call
      const dummyData: DepositTurnoverDTO[] = [
        {
          id: 1,
          account_id: 12345,
          user_name: "user1",
          deposit_amount: 1000 * cFactor,
          cashable_amount: 800 * cFactor,
          turnover_required: 5000 * cFactor,
          turnover_met: 3200 * cFactor,
          turnover_percentage: 64,
          transaction_id: "TXN001",
          pg_transaction_id: "PG001",
          status: "AWARDED",
          notes: "Deposit bonus",
          award_date: moment().subtract(5, "days").valueOf(),
          redeem_date: null,
          update_time: moment().subtract(5, "days").valueOf(),
        },
        {
          id: 2,
          account_id: 12345,
          user_name: "user1",
          deposit_amount: 2000 * cFactor,
          cashable_amount: 1800 * cFactor,
          turnover_required: 10000 * cFactor,
          turnover_met: 10000 * cFactor,
          turnover_percentage: 100,
          transaction_id: "TXN002",
          pg_transaction_id: "PG002",
          status: "REDEEMED",
          notes: "Deposit bonus redeemed",
          award_date: moment().subtract(10, "days").valueOf(),
          redeem_date: moment().subtract(2, "days").valueOf(),
          update_time: moment().subtract(2, "days").valueOf(),
        },
        {
          id: 3,
          account_id: 12345,
          user_name: "user1",
          deposit_amount: 1500 * cFactor,
          cashable_amount: 1200 * cFactor,
          turnover_required: 7500 * cFactor,
          turnover_met: 4500 * cFactor,
          turnover_percentage: 60,
          transaction_id: "TXN003",
          pg_transaction_id: "PG003",
          status: "IN_PROGRESS",
          notes: "Deposit bonus in progress",
          award_date: moment().subtract(3, "days").valueOf(),
          redeem_date: null,
          update_time: moment().subtract(1, "days").valueOf(),
        },
        {
          id: 4,
          account_id: 12345,
          user_name: "user1",
          deposit_amount: 500 * cFactor,
          cashable_amount: 0,
          turnover_required: 2500 * cFactor,
          turnover_met: 0,
          turnover_percentage: 0,
          transaction_id: "TXN004",
          pg_transaction_id: "PG004",
          status: "CANCELLED",
          notes: "Deposit bonus cancelled",
          award_date: moment().subtract(15, "days").valueOf(),
          redeem_date: null,
          update_time: moment().subtract(14, "days").valueOf(),
        },
        {
          id: 5,
          account_id: 12345,
          user_name: "user1",
          deposit_amount: 3000 * cFactor,
          cashable_amount: 2500 * cFactor,
          turnover_required: 15000 * cFactor,
          turnover_met: 12000 * cFactor,
          turnover_percentage: 80,
          transaction_id: "TXN005",
          pg_transaction_id: "PG005",
          status: "AWARDED",
          notes: "Deposit bonus",
          award_date: moment().subtract(1, "days").valueOf(),
          redeem_date: null,
          update_time: moment().subtract(1, "days").valueOf(),
        },
      ];

      // Filter by status
      let filteredData = dummyData;
      if (filters.status !== "ALL") {
        filteredData = dummyData.filter((item) => item.status === filters.status);
      }

      // Filter by date range
      filteredData = filteredData.filter((item) => {
        const itemDate = moment(item.award_date);
        return (
          itemDate.isSameOrAfter(filters.dateFrom.startOf("day")) &&
          itemDate.isSameOrBefore(filters.dateTo.endOf("day"))
        );
      });

      // Simulate pagination
      const currentPage = filters.pageToken.length;
      const startIndex = currentPage * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      const hasNextPage = endIndex < filteredData.length;

      setNextPageToken(hasNextPage ? `page_${currentPage + 1}` : null);
      setTurnover(paginatedData);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [cFactor, filters]);

  const handleStartDateChange = (d: Moment) => {
    setFilters({ ...filters, pageToken: [], dateFrom: d });
    setNextPageToken(null);
  };

  const handleEndDateChange = (d: Moment) => {
    setFilters({ ...filters, pageToken: [], dateTo: d });
    setNextPageToken(null);
  };

  const handleStatusChange = (e: any) => {
    setFilters({ ...filters, pageToken: [], status: e });
    setNextPageToken(null);
  };

  function eventDateRender(param, row) {
    return moment(row.event_date).format("DD-MM-YY, h:mm:ss A");
  }

  const TransactionFilters = [
    { value: "ALL", name: langData?.["all"] },
    { value: "AWARDED", name: langData?.["awarded"] },
    { value: "REDEEMED", name: langData?.["redeemed"] },
    { value: "CANCELLED", name: langData?.["cancelled"] },
    { value: "IN_PROGRESS", name: langData?.["in_progress_cap"] },
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 720);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="toh-ctn">
      <ReportBackBtn back={langData?.["back"]} />
      <IonRow className="as-ctn">
        <ReportsHeader
          titleIcon={TurnOverHistory}
          reportName={langData?.["deposit_turnover"]}
          reportFilters={[
            {
              element: (
                <SelectTemplate
                  label={langData?.["transaction_type"]}
                  list={TransactionFilters}
                  value={filters.status}
                  onChange={(e) => {
                    handleStatusChange(e.target.value);
                  }}
                  placeholder={langData?.["select_one"]}
                />
              ),
              fullWidthInMob: true,
            },
            {
              element: (
                <DateTemplate
                  value={filters.dateFrom}
                  label={langData?.["from"]}
                  onChange={(e) => handleStartDateChange(e)}
                  minDate={moment().subtract(1, "months").calendar()}
                  maxDate={filters.dateTo}
                />
              ),
            },
            {
              element: (
                <DateTemplate
                  value={filters.dateTo}
                  label={langData?.["to"]}
                  onChange={(e) => handleEndDateChange(e)}
                  minDate={filters.dateFrom}
                />
              ),
            },
          ]}
        />

        <IonCol className="mob-px-0">
          <div className="reports-ctn my-bets-ctn">
            <div className="content-ctn light-bg my-bets-content">
              <div className="myb-bets-div">
                {loading ? (
                  <Spinner />
                ) : (
                  <>
                    <div className="content-ctn light-bg my-bets-content">
                      <div className="myb-bets-div">
                        {loading ? (
                          <Spinner />
                        ) : (
                          <>
                            <div className="tbl-ctn my-bets-tbl no-hov-style web-view">
                              <TableContainer component={Paper}>
                                <Table className="myb-table" size="small">
                                  <TableHead className="myb-table-header">
                                    <TableRow>
                                      <TableCell
                                        align="left"
                                        className="th-col bonus-type-cell"
                                      >
                                        {langData?.["transaction_time"]}
                                      </TableCell>
                                      <TableCell
                                        align="left"
                                        className="th-col approval-req-cell"
                                      >
                                        {langData?.["amount"]}
                                      </TableCell>
                                      <TableCell
                                        align="left"
                                        className="th-col awarded-date-cell"
                                      >
                                        {langData?.["cashable_amount"]}
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        className="th-col turnover-cell"
                                      >
                                        {langData?.["turnover"]}
                                      </TableCell>
                                      <TableCell
                                        align="center"
                                        className="th-col status-cell"
                                      >
                                        {langData?.["status"]}
                                      </TableCell>
                                      <TableCell
                                        align="left"
                                        className="th-col last-date-cell"
                                      >
                                        {langData?.["redeemed_date"]}
                                      </TableCell>
                                      <TableCell
                                        align="left"
                                        className="th-col last-date-cell"
                                      >
                                        {langData?.["update_time"]}
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>

                                  {turnover?.length > 0 ? (
                                    <TableBody className="myb-table-body">
                                      {turnover.map((row, idx) => (
                                        <>
                                          {
                                            <TableRow key={"row-" + idx}>
                                              <TableCell
                                                key={"row-" + idx + "-cell-3"}
                                              >
                                                <div className="b-text m-link">
                                                  {moment(
                                                    row.award_date
                                                  ).format(
                                                    "DD/MM/YYYY, h:mm:ss A"
                                                  )}
                                                </div>
                                              </TableCell>

                                              <TableCell
                                                key={"row-" + idx + "-cell-7"}
                                              >
                                                {row?.deposit_amount?.toFixed(
                                                  2
                                                )}
                                              </TableCell>
                                              <TableCell
                                                key={"row-" + idx + "-cell-7"}
                                              >
                                                {row?.cashable_amount?.toFixed(
                                                  2
                                                )}
                                              </TableCell>

                                              <TableCell
                                                key={"row-" + idx + "-cell-8"}
                                                align="center"
                                              >
                                                {(row.turnover_met
                                                  ? row.turnover_met
                                                  : "-") +
                                                  "/" +
                                                  (row.turnover_required
                                                    ? row.turnover_required
                                                    : "-")}
                                              </TableCell>

                                              <TableCell
                                                key={"row-" + idx + "-cell-8"}
                                                align="center"
                                              >
                                                {row.status}
                                              </TableCell>

                                              <TableCell
                                                key={"row-" + idx + "-cell-2"}
                                                component="th"
                                              >
                                                {row.redeem_date
                                                  ? moment(
                                                      row.redeem_date
                                                    ).format(
                                                      "DD/MM/YYYY, h:mm:ss A"
                                                    )
                                                  : "-"}
                                              </TableCell>

                                              <TableCell
                                                key={"row-" + idx + "-cell-3"}
                                                component="th"
                                              >
                                                {row.update_time
                                                  ? moment(
                                                      row.update_time
                                                    ).format(
                                                      "DD/MM/YYYY, h:mm:ss A"
                                                    )
                                                  : "-"}
                                              </TableCell>
                                            </TableRow>
                                          }
                                        </>
                                      ))}
                                    </TableBody>
                                  ) : (
                                    <TableCell
                                      className="no-data-row"
                                      colSpan={12}
                                    >
                                      <div>{langData?.["no_data_found"]}</div>
                                    </TableCell>
                                  )}
                                </Table>
                              </TableContainer>
                            </div>
                          </>
                        )}
                        <IonRow>
                          {filters.pageToken.length > 0 && !loading && (
                            <IonButton
                              className="myb-btn-prev"
                              onClick={prevPage}
                            >
                              ({langData?.["prev"]})({filters.pageToken.length})
                            </IonButton>
                          )}
                          {nextPageToken && !loading ? (
                            <IonButton
                              className="myb-btn-next"
                              onClick={nextPage}
                            >
                              ({langData?.["next"]})(
                              {filters.pageToken.length + 2})
                            </IonButton>
                          ) : null}
                        </IonRow>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </IonCol>
      </IonRow>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    langData: state.common.langData,
  };
};

export default connect(mapStateToProps, null)(DepositTurnoverReport);
