import { IonRow } from "@ionic/react";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import moment, { Moment } from "moment";
import React, { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { useHistory } from "react-router";
import { ReactComponent as bonusStatementIcon } from "../../assets/images/icons/bonusStatement.svg?react";
import CustomTableMob from "../../common/CustomTableMob/CustomTableMob";
import DateTemplate from "../../common/DateAndTimeTemplate/DateAndTimeTemplate";
import ReportBackBtn from "../../common/ReportBackBtn/ReportBackBtn";
import ReportsHeader from "../../common/ReportsHeader/ReportsHeader";
import Spinner from "../../components/Spinner/Spinner";
import "./BonusStatement.scss";
import { headerParams, lowerRow, upperRow } from "./bonusStatementUtils";
import { connect } from "react-redux";
import { RootState } from "../../models/RootState";

type options = { name: string; value: string };

type BonusProps = {
  award_amount: number;
  award_date: Moment;
  bonus_status: string;
  bonus_category: string;
  id: number;
  last_vest_date: Moment;
  notes: string;
  redeemed_amount: number;
  last_redeem_date: Moment | null;
  redemptions: RedemptionDTO[];
  installments_given: number;
  installments: number;
  approval_required: boolean;
  turnover_required: number;
  turnover_met: number;
  expiry_date: Moment;
};

type RedemptionDTO = {
  notes: string;
  redeem_amount: number;
  redeem_date: Moment;
  redemption_id: number;
  status: string;
};

type Filters = {
  fromDate: any;
  toDate: any;
  pageToken: string[];
  pageNum: number;
};

const BonusStatement: React.FC<{ bonusEnabled: boolean; langData: any }> = (
  props
) => {
  const { bonusEnabled, langData } = props;
  const defaultFilters: Filters = {
    fromDate: moment().subtract(7, "d"),
    toDate: moment(),
    pageToken: [],
    pageNum: 1,
  };
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [bonusType, setBonusType] = useState<string>("All");
  const [bonusStatus, setBonusStatus] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);
  const [bonusData, setBonusData] = useState<BonusProps[]>([]);
  const [nextPageToken, setNextPageToken] = useState<string>(null);
  const [open, setOpen] = React.useState<any>({
    bonusId: -1,
    open: false,
  });

  const pageSize = 25;

  const bonusTypeOptions: options[] = [
    { value: "Joining Bonus", name: "Joining Bonus" },
    { value: "Deposit Bonus", name: "Deposit Bonus" },
  ];

  const bonusStatusOptions: options[] = [
    { value: "Awarded", name: "Awarded" },
    { value: "Partially Redeemed", name: "Partially Redeemed" },
    { value: "Redeemed", name: "Redeemed" },
    { value: "Expired", name: "Expired" },
  ];

  const nextPage = () => {
    if (nextPageToken) {
      setFilters({
        ...filters,
        pageToken: [...filters.pageToken, nextPageToken],
        pageNum: filters.pageNum + 1,
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
        pageNum: filters.pageNum - 1,
      });
      setNextPageToken(null);
    }
  };

  const getBonusData = async () => {
    setLoading(true);
    try {
      // Dummy data instead of API call
      const dummyData: BonusProps[] = [
        {
          id: 1,
          award_amount: 1000,
          award_date: moment().subtract(5, "days"),
          bonus_status: "Awarded",
          bonus_category: "Joining Bonus",
          last_vest_date: moment().subtract(5, "days"),
          notes: "Welcome bonus",
          redeemed_amount: 0,
          last_redeem_date: null,
          redemptions: [],
          installments_given: 0,
          installments: 5,
          approval_required: false,
          turnover_required: 5000,
          turnover_met: 0,
          expiry_date: moment().add(30, "days"),
        },
        {
          id: 2,
          award_amount: 2000,
          award_date: moment().subtract(10, "days"),
          bonus_status: "Partially Redeemed",
          bonus_category: "Deposit Bonus",
          last_vest_date: moment().subtract(10, "days"),
          notes: "First deposit bonus",
          redeemed_amount: 800,
          last_redeem_date: moment().subtract(2, "days"),
          redemptions: [
            {
              redemption_id: 1,
              redeem_amount: 400,
              redeem_date: moment().subtract(5, "days"),
              status: "Completed",
              notes: "First installment",
            },
            {
              redemption_id: 2,
              redeem_amount: 400,
              redeem_date: moment().subtract(2, "days"),
              status: "Completed",
              notes: "Second installment",
            },
          ],
          installments_given: 2,
          installments: 5,
          approval_required: true,
          turnover_required: 10000,
          turnover_met: 6000,
          expiry_date: moment().add(20, "days"),
        },
        {
          id: 3,
          award_amount: 1500,
          award_date: moment().subtract(15, "days"),
          bonus_status: "Redeemed",
          bonus_category: "Deposit Bonus",
          last_vest_date: moment().subtract(15, "days"),
          notes: "Deposit bonus fully redeemed",
          redeemed_amount: 1500,
          last_redeem_date: moment().subtract(1, "days"),
          redemptions: [
            {
              redemption_id: 3,
              redeem_amount: 500,
              redeem_date: moment().subtract(10, "days"),
              status: "Completed",
              notes: "First installment",
            },
            {
              redemption_id: 4,
              redeem_amount: 500,
              redeem_date: moment().subtract(5, "days"),
              status: "Completed",
              notes: "Second installment",
            },
            {
              redemption_id: 5,
              redeem_amount: 500,
              redeem_date: moment().subtract(1, "days"),
              status: "Completed",
              notes: "Third installment",
            },
          ],
          installments_given: 3,
          installments: 3,
          approval_required: false,
          turnover_required: 7500,
          turnover_met: 7500,
          expiry_date: moment().add(10, "days"),
        },
        {
          id: 4,
          award_amount: 500,
          award_date: moment().subtract(40, "days"),
          bonus_status: "Expired",
          bonus_category: "Joining Bonus",
          last_vest_date: moment().subtract(40, "days"),
          notes: "Expired bonus",
          redeemed_amount: 0,
          last_redeem_date: null,
          redemptions: [],
          installments_given: 0,
          installments: 3,
          approval_required: false,
          turnover_required: 2500,
          turnover_met: 500,
          expiry_date: moment().subtract(10, "days"),
        },
        {
          id: 5,
          award_amount: 3000,
          award_date: moment().subtract(3, "days"),
          bonus_status: "Awarded",
          bonus_category: "Deposit Bonus",
          last_vest_date: moment().subtract(3, "days"),
          notes: "Large deposit bonus",
          redeemed_amount: 0,
          last_redeem_date: null,
          redemptions: [],
          installments_given: 0,
          installments: 10,
          approval_required: true,
          turnover_required: 15000,
          turnover_met: 2000,
          expiry_date: moment().add(60, "days"),
        },
        {
          id: 6,
          award_amount: 750,
          award_date: moment().subtract(7, "days"),
          bonus_status: "Partially Redeemed",
          bonus_category: "Joining Bonus",
          last_vest_date: moment().subtract(7, "days"),
          notes: "Joining bonus partial",
          redeemed_amount: 250,
          last_redeem_date: moment().subtract(1, "days"),
          redemptions: [
            {
              redemption_id: 6,
              redeem_amount: 250,
              redeem_date: moment().subtract(1, "days"),
              status: "Completed",
              notes: "First installment",
            },
          ],
          installments_given: 1,
          installments: 3,
          approval_required: false,
          turnover_required: 3750,
          turnover_met: 1500,
          expiry_date: moment().add(23, "days"),
        },
      ];

      // Filter by bonus status
      let filteredData = dummyData;
      if (bonusStatus !== "All") {
        filteredData = filteredData.filter((item) => {
          const statusMap: { [key: string]: string } = {
            Awarded: "Awarded",
            "Partially Redeemed": "Partially Redeemed",
            Redeemed: "Redeemed",
            Expired: "Expired",
          };
          return item.bonus_status === statusMap[bonusStatus];
        });
      }

      // Filter by bonus type
      if (bonusType !== "All") {
        filteredData = filteredData.filter(
          (item) => item.bonus_category === bonusType
        );
      }

      // Filter by date range
      filteredData = filteredData.filter((item) => {
        const itemDate = moment(item.award_date);
        return (
          itemDate.isSameOrAfter(filters.fromDate.startOf("day")) &&
          itemDate.isSameOrBefore(filters.toDate.endOf("day"))
        );
      });

      // Simulate pagination
      const currentPage = filters.pageToken.length;
      const startIndex = currentPage * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      const hasNextPage = endIndex < filteredData.length;

      setNextPageToken(hasNextPage ? `page_${currentPage + 1}` : null);
      setBonusData(paginatedData);
    } catch (err) {
      console.log(err);
      setBonusData([]);
      setNextPageToken(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    getBonusData();
  }, [filters, bonusStatus, bonusType]);

  const fromDateChangeHandler = (d: Moment) => {
    setFilters({ ...filters, fromDate: d, pageToken: [], pageNum: 1 });
    setNextPageToken(null);
  };

  const toDateChangeHandler = (d: Moment) => {
    setFilters({ ...filters, toDate: d, pageToken: [], pageNum: 1 });
    setNextPageToken(null);
  };

  return (
    <div className="reports-ctn bonus-statement-ctn">
      <ReportBackBtn back={langData?.["back"]} />
      <ReportsHeader
        titleIcon={bonusStatementIcon}
        reportName={langData?.["bonus_statement"]}
        reportFilters={[
          {
            element: (
              <DateTemplate
                value={filters.fromDate}
                label={langData?.["from"]}
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
        ]}
      />

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
                          {langData?.["bonus_type"]}
                        </TableCell>
                        <TableCell
                          align="left"
                          className="th-col approval-req-cell"
                        >
                          {langData?.["approval_required_txt"]}
                        </TableCell>
                        <TableCell
                          align="left"
                          className="th-col awarded-date-cell"
                        >
                          {langData?.["awarded_date"]}
                        </TableCell>
                        <TableCell
                          align="left"
                          className="th-col awarded-amy-cell"
                        >
                          {langData?.["awarded_amount_txt"]}
                        </TableCell>
                        <TableCell
                          align="center"
                          className="th-col turnover-cell"
                        >
                          {langData?.["turnover"]}
                        </TableCell>
                        <TableCell
                          align="center"
                          className="th-col installments-cell"
                        >
                          {langData?.["installments"]}
                        </TableCell>
                        <TableCell
                          align="left"
                          className="th-col redeemed-amt-cell"
                        >
                          {isMobile
                            ? langData?.["redeemed_amount_short"]
                            : langData?.["redeemed_amount"]}
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
                          {langData?.["last_redeemed_date"]}
                        </TableCell>
                        <TableCell
                          align="left"
                          className="th-col last-date-cell"
                        >
                          {langData?.["expiry_date"]}
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    {bonusData?.length > 0 ? (
                      <TableBody className="myb-table-body">
                        {bonusData.map((row, idx) => (
                          <>
                            {row?.bonus_category === "LOSSBACK_BONUS" &&
                            row?.bonus_status === "Awarded" ? null : (
                              <TableRow key={"row-" + idx}>
                                <TableCell key={"row-" + idx + "-cell-3"}>
                                  <div className="b-text m-link">
                                    {row.bonus_category}
                                  </div>
                                </TableCell>
                                <TableCell key={"row-" + idx + "-cell-3"}>
                                  <div className="b-text m-link">
                                    {row.approval_required ? "Yes" : "No"}
                                  </div>
                                </TableCell>
                                <TableCell
                                  key={"row-" + idx + "-cell-1"}
                                  component="th"
                                >
                                  {moment(row.award_date).format(
                                    "DD/MM/YYYY, h:mm:ss A"
                                  )}
                                </TableCell>
                                <TableCell key={"row-" + idx + "-cell-7"}>
                                  {row?.award_amount?.toFixed(2)}
                                </TableCell>

                                <TableCell
                                  key={"row-" + idx + "-cell-8"}
                                  align="center"
                                >
                                  {(row.turnover_met ? row.turnover_met : "-") +
                                    "/" +
                                    (row.turnover_required
                                      ? row.turnover_required
                                      : "-")}
                                </TableCell>
                                <TableCell
                                  key={"row-" + idx + "-cell-10"}
                                  align="center"
                                >
                                  {(row.installments_given
                                    ? row.installments_given
                                    : "-") +
                                    "/" +
                                    (row.installments ? row.installments : "-")}
                                </TableCell>

                                <TableCell key={"row-" + idx + "-cell-7"}>
                                  {row?.redeemed_amount?.toFixed(2)}
                                </TableCell>
                                <TableCell
                                  key={"row-" + idx + "-cell-8"}
                                  align="center"
                                >
                                  {row.bonus_status}
                                </TableCell>

                                <TableCell
                                  key={"row-" + idx + "-cell-2"}
                                  component="th"
                                >
                                  {row.last_redeem_date
                                    ? moment(row.last_redeem_date).format(
                                        "DD/MM/YYYY, h:mm:ss A"
                                      )
                                    : "-"}
                                </TableCell>

                                <TableCell
                                  key={"row-" + idx + "-cell-3"}
                                  component="th"
                                >
                                  {row.expiry_date
                                    ? moment(row.expiry_date).format(
                                        "DD/MM/YYYY, h:mm:ss A"
                                      )
                                    : "-"}
                                </TableCell>
                              </TableRow>
                            )}

                            {open.open && row?.id === open.bonusId && (
                              <TableRow>
                                <TableCell className="pb-0-pt-0 " colSpan={12}>
                                  <TableContainer component={Paper}>
                                    <Table>
                                      <TableHead className="redeem-row-ctn">
                                        <TableCell colSpan={3}>
                                          {langData?.["redeemed_date"]}
                                        </TableCell>
                                        <TableCell colSpan={3}>
                                          {langData?.["amount"]}
                                        </TableCell>
                                        <TableCell colSpan={3}>
                                          {langData?.["status"]}
                                        </TableCell>
                                        <TableCell colSpan={3}>
                                          {langData?.["notes"]}
                                        </TableCell>
                                      </TableHead>
                                      {row?.redemptions?.map((redeem) => (
                                        <>
                                          <TableBody>
                                            <TableCell colSpan={3}>
                                              {moment(
                                                redeem.redeem_date
                                              ).format("DD/MM/YYYY, h:mm:ss A")}
                                            </TableCell>
                                            <TableCell colSpan={3}>
                                              {redeem?.redeem_amount?.toFixed(
                                                2
                                              )}
                                            </TableCell>
                                            <TableCell colSpan={3}>
                                              {redeem?.status
                                                ? redeem?.status
                                                : "-"}
                                            </TableCell>
                                            <TableCell colSpan={3}>
                                              {redeem.notes
                                                ? redeem.notes
                                                : "-"}
                                            </TableCell>
                                          </TableBody>
                                        </>
                                      ))}
                                    </Table>
                                  </TableContainer>
                                </TableCell>{" "}
                              </TableRow>
                            )}
                          </>
                        ))}
                      </TableBody>
                    ) : (
                      <TableCell className="no-data-row" colSpan={12}>
                        <div>{langData?.["no_data_found"]}</div>
                      </TableCell>
                    )}
                  </Table>
                </TableContainer>
              </div>

              <CustomTableMob
                headerParams={headerParams}
                bodyData={bonusData}
                upperRow={upperRow}
                lowerRow={lowerRow}
                noDataMessage={langData?.["no_data_found"]}
                langData={langData}
              />
            </>
          )}
          <IonRow className="bs-pagination">
            {filters.pageToken.length > 0 && !loading && (
              <button className="bs-page-btn" onClick={(e) => prevPage()}>
                ({langData?.["prev"]})({filters.pageNum - 1})
              </button>
            )}
            {nextPageToken && !loading ? (
              <button className="bs-page-btn" onClick={(e) => nextPage()}>
                ({langData?.["next"]})({filters.pageNum + 1})
              </button>
            ) : null}
          </IonRow>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    langData: state.common.langData,
  };
};

export default connect(mapStateToProps, null)(BonusStatement);
