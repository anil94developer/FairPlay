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
import USABET_API from "../../api-services/usabet-api";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { getCurrencyTypeFromToken } from "../../store";

type options = { name: string; value: string };

type BonusProps = {
  award_amount: number;
  award_date: Moment;
  bonus_status: string;
  bonus_category: string;
  id: number | string;
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
  const [earnedBonus, setEarnedBonus] = useState<number>(0);
  const [lockedBonus, setLockedBonus] = useState<number>(0);
  const [bonusAmountsLoading, setBonusAmountsLoading] = useState<boolean>(true);
  const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];

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

  const fetchBonusAmounts = async () => {
    setBonusAmountsLoading(true);
    try {
      const response = await USABET_API.post("/user/getBonusAmounts", {});
      const resData = response?.data;
      if (resData?.status === true && resData?.data) {
        setEarnedBonus((resData.data.earnedBonus ?? 0) / cFactor);
        setLockedBonus((resData.data.lockedBonus ?? 0) / cFactor);
      } else {
        setEarnedBonus(0);
        setLockedBonus(0);
      }
    } catch (err) {
      setEarnedBonus(0);
      setLockedBonus(0);
    } finally {
      setBonusAmountsLoading(false);
    }
  };

  const mapStatusToApi = (): string => {
    if (bonusStatus === "All") return "ALL";
    if (bonusStatus === "Expired") return "EXPIRED";
    if (bonusStatus === "Awarded" || bonusStatus === "Partially Redeemed" || bonusStatus === "Redeemed") return "IN_PROGRESS";
    return "ALL";
  };

  const getBonusData = async () => {
    setLoading(true);
    try {
      const page = filters.pageNum || 1;
      const res = await USABET_API.post("/user/getLockedBonusProgress", {
        limit: pageSize,
        page,
        status: mapStatusToApi(),
      });
      const resData = res?.data;
      const list: BonusProps[] = [];
      if (resData?.status === true && Array.isArray(resData.data)) {
        resData.data.forEach((row: any) => {
          const createdMoment = row.created_at ? moment(row.created_at) : moment();
          const expireMoment = row.expire_at ? moment(row.expire_at) : null;
          const totalRolling = (row.total_rolling_amount ?? 0) / cFactor;
          const usedRolling = (row.used_rolling_amount ?? 0) / cFactor;
          const lockedAmount = (row.total_locked_bonus_amount ?? 0) / cFactor;
          const unlockedAmount = (row.unlocked_bonus_amount ?? 0) / cFactor;
          list.push({
            id: row._id ?? row.id ?? `row-${list.length}`,
            award_amount: lockedAmount,
            award_date: createdMoment,
            bonus_status: row.status_str || (row.status ? "IN_PROGRESS" : "EXPIRED"),
            bonus_category: formatBonusType(row.bonus_type),
            last_vest_date: createdMoment,
            notes: "",
            redeemed_amount: unlockedAmount,
            last_redeem_date: null,
            redemptions: [],
            installments_given: 0,
            installments: row.rolling_multiplier ?? 0,
            approval_required: false,
            turnover_required: totalRolling,
            turnover_met: usedRolling,
            expiry_date: expireMoment || moment().add(1, "day"),
          });
        });
      }
      const extras = resData?.extras;
      const totalPages = extras?.total_pages ?? 1;
      const hasNextPage = page < totalPages;
      setNextPageToken(hasNextPage ? String(page + 1) : null);
      setBonusData(list);
    } catch (err) {
      setBonusData([]);
      setNextPageToken(null);
    }
    setLoading(false);
  };

  const formatBonusType = (bonusTypeStr: string): string => {
    if (!bonusTypeStr) return "-";
    if (bonusTypeStr === "EVERY_DEPOSIT_BONUS") return "Every Deposit Bonus";
    return bonusTypeStr.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  useEffect(() => {
    fetchBonusAmounts();
  }, []);

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
        <div className="bonus-amounts-summary">
          {bonusAmountsLoading ? (
            <Spinner />
          ) : (
            <div className="bonus-amounts-cards">
              <div className="bonus-amount-card earned">
                <span className="bonus-amount-label">
                  {langData?.["earned_bonus"] || "Earned Bonus"}
                </span>
                <span className="bonus-amount-value">
                  {earnedBonus.toFixed(2)}
                </span>
              </div>
              <div className="bonus-amount-card earned">
                <span className="bonus-amount-label">
                  {langData?.["locked_bonus"] || "Locked Bonus"}
                </span>
                <span className="bonus-amount-value">
                  {lockedBonus.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
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
