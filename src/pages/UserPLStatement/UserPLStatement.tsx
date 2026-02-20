import { IonButton, IonCol, IonRow } from "@ionic/react";
import moment, { Moment } from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { ReactComponent as PLStatementIcon } from "../../assets/images/reportIcons/PLStatement.svg?react";
import DateTemplate from "../../common/DateAndTimeTemplate/DateAndTimeTemplate";
import ReportBackBtn from "../../common/ReportBackBtn/ReportBackBtn";
import ReportsHeader from "../../common/ReportsHeader/ReportsHeader";
import ProfitLossStatement from "../../components/ProfitLossStatement/ProfitLossStatement";
import CashoutHistoryStatement from "../../components/CashoutHistoryStatement/CashoutHistoryStatement";
import Spinner from "../../components/Spinner/Spinner";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { PLStatement } from "../../models/PLStatement";
import { AuthResponse } from "../../models/api/AuthResponse";
import { getCurrencyTypeFromToken } from "../../store";
import "./UserPLStatement.scss";
import SelectTemplate from "../../common/SelectTemplate/SelectTemplate";
import { CONFIG_PERMISSIONS } from "../../constants/ConfigPermission";
import { connect, useSelector } from "react-redux";
import { RootState } from "../../models/RootState";
import USABET_API from "../../api-services/usabet-api";

type Filters = {
  fromDate: any;
  toDate: any;
  pageToken: string[];
  selectedGame: string;
  sport: string;
  statementType: string;
};

type Props = {
  langData: any;
};

const UserPLStatement: React.FC<Props> = (props: Props) => {
  const { langData } = props;

  const defaultFilters: Filters = {
    fromDate: moment().subtract(7, "d"),
    toDate: moment(),
    pageToken: [],
    selectedGame: "SPORTS",
    sport: "SPORTS",
    statementType: "MAIN_PL",
  };
  const [errorMsg, setErrorMsg] = useState(null);
  const [progress, setProgress] = useState<Boolean>(false);
  const [plStatement, setplStatement] = useState<PLStatement[]>([]);
  const [cashoutHistory, setCashoutHistory] = useState<any[]>([]);
  const [totalPL, setTotalPL] = useState<Map<string, number>>(new Map());
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [myTotalProfit, setMyTotalProfit] = useState<number>(0);
  const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];
  const { allowedConfig } = useSelector((state: RootState) => state.common);

  const statementTypeOptions = [
    {
      value: "MAIN_PL",
      name: "Main Profit and Loss",
      allow: true,
    },
    // {
    //   value: "TURBO_PL",
    //   name: "Speed Cash Profit and Loss",
    //   allow: true,
    // },
  ];

  const [nextPageToken, setNextPageToken] = useState<string>(null);
  const pageSize = 50;

  const fetchPLStatement = useCallback(async () => {
    setProgress(true);
    setErrorMsg(null);
    setNextPageToken(null);
    try {
      let response: AuthResponse;
      let pl_records;

      if (filters.statementType === "TURBO_PL") {
        // Dummy cashout history data
        response = {
          status: 200,
          data: {
            entries: [
              {
                cashoutAmount: 150 * cFactor,
                cashoutCommission: 5 * cFactor,
                netCashoutAmount: 145 * cFactor,
                betId: "bet-001",
                betPlacedTime: new Date().toISOString(),
              },
              {
                cashoutAmount: 180 * cFactor,
                cashoutCommission: 8 * cFactor,
                netCashoutAmount: 172 * cFactor,
                betId: "bet-002",
                betPlacedTime: new Date(Date.now() - 86400000).toISOString(),
              },
            ],
            nextPageToken: null,
          },
        } as AuthResponse;
        pl_records = response.data.entries;
      } else if (
        filters.selectedGame === "SPORTS_BOOK" ||
        filters.selectedGame === "SPORTS"
      ) {
        const page = filters.pageToken?.length ? filters.pageToken.length + 1 : 1;
        const from_date = filters.fromDate
          ? moment(filters.fromDate).startOf("day").toISOString()
          : moment().subtract(7, "days").startOf("day").toISOString();
        const to_date = filters.toDate
          ? moment(filters.toDate).endOf("day").toISOString()
          : moment().endOf("day").toISOString();

        const apiRes = await USABET_API.post("/report/eventsProfitLoss", {
          from_date,
          to_date,
          limit: pageSize,
          page,
        });

        const pl_records_raw: any[] = [];
        let nextToken = null;

        if (apiRes?.data?.status === true && apiRes?.data?.data) {
          const resData = apiRes.data.data;
          const meta = Array.isArray(resData.metadata) && resData.metadata[0] ? resData.metadata[0] : null;
          const rows = Array.isArray(resData.data) ? resData.data : [];

          rows.forEach((row: any) => {
            pl_records_raw.push({
              eventId: row.match_id || row.event_id || "",
              eventName: row.match_name || "",
              marketId: row.event_id || "",
              marketName: row.event_name || "Match Odds",
              categoryType: filters.selectedGame,
              betPlacedTime: row.match_date || "",
              payOutDate: row.result_date || row.match_date || "",
              profit: row.user_pl ?? row.net_pl ?? 0,
              commission: row.user_commission_pl ?? 0,
              gameType: row.sport_name || "",
            });
          });

          if (meta && page * pageSize < (meta.total || 0)) {
            nextToken = String(page + 1);
          }
        }

        pl_records = pl_records_raw;
        response = {
          status: 200,
          data: { nextPageToken: nextToken },
        } as AuthResponse;
      } else {
        // Dummy orders data
        response = {
          status: 200,
          data: {
            orders: [
              {
                id: "order-001",
                eventName: "Casino Game 1",
                stakeAmount: 100 * cFactor,
                payOutAmount: 150 * cFactor,
                outcomeResult: "Settled",
                categoryType: filters.selectedGame,
                betPlacedTime: new Date().toISOString(),
              },
              {
                id: "order-002",
                eventName: "Casino Game 2",
                stakeAmount: 200 * cFactor,
                payOutAmount: 180 * cFactor,
                outcomeResult: "Settled",
                categoryType: filters.selectedGame,
                betPlacedTime: new Date(Date.now() - 86400000).toISOString(),
              },
            ],
            nextPageToken: null,
          },
        } as AuthResponse;
        pl_records = response.data.orders;
      }

      setNextPageToken(response.data.nextPageToken);

      if (filters.statementType === "TURBO_PL") {
        // Process cashout history data
        for (const record of pl_records) {
          record.cashoutAmount = record.cashoutAmount / cFactor;
          record.cashoutCommission = record.cashoutCommission / cFactor;
          record.netCashoutAmount = record.netCashoutAmount / cFactor;
        }
        setCashoutHistory(pl_records);
        setplStatement([]);
      } else {
        // Process regular P&L data
        for (const pl of pl_records) {
          pl.profit = pl.profit / cFactor;
          pl.commission = pl.commission ? pl.commission / cFactor : 0;
        }
        setplStatement(pl_records);
        setCashoutHistory([]);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setErrorMsg(err.response.data.error);
      }
      console.log(err);
      setplStatement([]);
      setCashoutHistory([]);
      setNextPageToken(null);
    }
    setProgress(false);
  }, [filters]);

  useEffect(() => {
    fetchPLStatement();
  }, [fetchPLStatement]);

  const nextPage = () => {
    if (nextPageToken) {
      setFilters({
        ...filters,
        pageToken: [...filters.pageToken, nextPageToken],
      });
    }
  };

  const prevPage = () => {
    if (filters.pageToken.length > 0) {
      let pagetokens = filters.pageToken;
      pagetokens.pop();
      setFilters({ ...filters, pageToken: [...pagetokens] });
    }
  };

  const fromDateChangeHandler = (d: Moment) => {
    setFilters({ ...filters, fromDate: d, pageToken: [] });
  };

  const toDateChangeHandler = (d: Moment) => {
    setFilters({ ...filters, toDate: d, pageToken: [] });
  };

  const selectGamesOptions = [
    {
      value: "SPORTS",
      name: "Sports",
      allow: (allowedConfig & CONFIG_PERMISSIONS.sports) !== 0,
    },
    // {
    //   value: "SPORTS_BOOK",
    //   name: "Sportsbook",
    //   allow: (allowedConfig & CONFIG_PERMISSIONS.sports) !== 0,
    // },
    // { value: "PREMIUM", name: "Premium", allow: true },
    {
      value: "CASINO",
      name: "Casino",
      allow: (allowedConfig & CONFIG_PERMISSIONS.live_casino) !== 0,
    },
    // {value: 'INDIAN_CASINO', name: 'Indian Casino', allow: (allowedConfig & CONFIG_PERMISSIONS.indian_casino) !== 0},
  ];

  const handleSelectedGameChange = (e) => {
    let sportId = filters.sport;
    if (e.target.value !== "SPORTS") {
      sportId = null;
    }
    setFilters({
      ...filters,
      selectedGame: e.target.value,
      sport: sportId,
      pageToken: [],
    });
    setNextPageToken(null);
  };

  const handleStatementTypeChange = (e) => {
    setFilters({
      ...filters,
      statementType: e.target.value,
      pageToken: [],
    });
    setNextPageToken(null);
  };

  return (
    <>
      <div className="betting-pl-ctn">
        <ReportBackBtn back={langData?.["back"]} />
        <IonRow className="as-ctn">
          <ReportsHeader
            titleIcon={PLStatementIcon}
            reportName={langData?.["betting_profit_and_loss"]}
            reportFilters={[
              {
                element: (
                  <SelectTemplate
                    label={"Statement Type"}
                    list={statementTypeOptions}
                    value={filters.statementType}
                    onChange={handleStatementTypeChange}
                    size="large"
                  />
                ),
              },
              {
                element: (
                  <SelectTemplate
                    label={"Select Games"}
                    list={selectGamesOptions}
                    value={filters.selectedGame}
                    onChange={handleSelectedGameChange}
                  />
                ),
              },
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

          <IonCol className="mob-px-0">
            <div className="reports-ctn my-bets-ctn">
              <div className="content-ctn light-bg my-bets-content">
                <div className="myb-bets-div">
                  {progress ? (
                    <Spinner />
                  ) : (
                    <>
                      {filters.statementType === "TURBO_PL" ? (
                        <CashoutHistoryStatement
                          items={cashoutHistory}
                          startDate={filters.fromDate}
                          endDate={filters.toDate}
                          searchName={""}
                          langData={langData}
                          selectedGame={filters.selectedGame}
                        />
                      ) : (
                        <ProfitLossStatement
                          items={plStatement}
                          startDate={filters.fromDate}
                          endDate={filters.toDate}
                          searchName={""}
                          langData={langData}
                          selectedGame={filters.selectedGame}
                        />
                      )}
                    </>
                  )}

                  <IonRow className="ml-5">
                    {filters.pageToken.length > 0 && !progress && (
                      <IonButton
                        className="myb-btn-prev"
                        onClick={(e) => prevPage()}
                      >
                        ({langData?.["prev"]})({filters.pageToken.length - 1})
                      </IonButton>
                    )}
                    {nextPageToken && !progress && (
                      <IonButton
                        className="myb-btn-next"
                        onClick={(e) => nextPage()}
                      >
                        ({langData?.["next"]})({filters.pageToken.length + 1})
                      </IonButton>
                    )}
                  </IonRow>
                </div>
              </div>
            </div>
          </IonCol>
        </IonRow>
      </div>
    </>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    langData: state.common.langData,
  };
};

export default connect(mapStateToProps, null)(UserPLStatement);
