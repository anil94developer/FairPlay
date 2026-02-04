import { IonBadge, IonButton, IonCol, IonRow } from "@ionic/react";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableSortLabel from "@material-ui/core/TableSortLabel";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { connect } from "react-redux";
import { ReactComponent as paperSvg } from "../../assets/images/icons/paper.svg?react";
import CustomTableMob, {
  HeaderParamsType,
  RowType,
} from "../../common/CustomTableMob/CustomTableMob";
import DateTemplate from "../../common/DateAndTimeTemplate/DateAndTimeTemplate";
import ReportBackBtn from "../../common/ReportBackBtn/ReportBackBtn";
import ReportsHeader from "../../common/ReportsHeader/ReportsHeader";
import SelectTemplate from "../../common/SelectTemplate/SelectTemplate";
import { CONFIG_PERMISSIONS } from "../../constants/ConfigPermission";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { RootState } from "../../models/RootState";
import { UserBet } from "../../models/UserBet";
import { getCurrencyTypeFromToken } from "../../store";
import {
  MarketTypeByEnumMap,
  capitalize,
  getOutcomeDescByEnumName,
  getSportNameByIdMap,
} from "../../util/stringUtil";
import Spinner from "../Spinner/Spinner";
import "./MyBets.scss";
import { Tabs } from "@material-ui/core";
import USABET_API from "../../api-services/usabet-api";

type StoreProps = {
  allowedConfig: number;
  langData: any;
};

type Filters = {
  startDate: any;
  endDate: any;
  selectedGame: string;
  status: string;
  pageToken: string[];
  sport: string;
};

const MyBets: React.FC<StoreProps> = (props) => {
  const { allowedConfig, langData } = props;
  const selectGamesOptions = [
    {
      value: "All",
      // TODO: check if need to move this logic to select template.
      name: langData?.["all"],
      allow: true,
    },
    {
      value: "SPORTS",
      name: langData?.["sports"],
      allow: (allowedConfig & CONFIG_PERMISSIONS.sports) !== 0,
    },
    {
      value: "SPORTS_BOOK",
      name: langData?.["sports_book"],
      allow: (allowedConfig & CONFIG_PERMISSIONS.sports) !== 0,
    },
    { value: "PREMIUM", name: langData?.["premium"], allow: true },
    {
      value: "CASINO",
      name: langData?.["casino"],
      allow: (allowedConfig & CONFIG_PERMISSIONS.live_casino) !== 0,
    },
    // {value: 'INDIAN_CASINO', name: 'Indian Casino', allow: (allowedConfig & CONFIG_PERMISSIONS.indian_casino) !== 0},
  ];
  // TODO: check if need to move this logic to select template.
  const betStatusOptions = [
    { value: "All", name: langData?.["all"] },
    { value: "Open", name: langData?.["open"] },
    { value: "Settled", name: langData?.["settled"] },
    { value: "Won", name: langData?.["won"] },
    { value: "Lost", name: langData?.["lost"] },
    { value: "Voided", name: langData?.["void"] },
  ];
  const sportOptions = [
    {
      value: "All",
      name: "All",
      langKey: "all",
      allow: (allowedConfig & CONFIG_PERMISSIONS.sports) !== 0,
    },
    {
      value: "4",
      name: "Cricket",
      langKey: "cricket",
      allow: (allowedConfig & CONFIG_PERMISSIONS.cricket) !== 0,
    },
    {
      value: "1",
      name: "Football",
      langKey: "football",
      allow: (allowedConfig & CONFIG_PERMISSIONS.football) !== 0,
    },
    {
      value: "2",
      name: "Tennis",
      langKey: "tennis",
      allow: (allowedConfig & CONFIG_PERMISSIONS.tennis) !== 0,
    },
    {
      value: "99990",
      name: "Binary",
      langKey: "binary",
      allow: (allowedConfig & CONFIG_PERMISSIONS.cricket) !== 0,
    },
    {
      value: "2378961",
      name: "Politics",
      langKey: "politics",
      allow: (allowedConfig & CONFIG_PERMISSIONS.cricket) !== 0,
    },
    {
      value: "99994",
      name: "Kabaddi",
      langKey: "kabaddi",
      allow: (allowedConfig & CONFIG_PERMISSIONS.cricket) !== 0,
    },
  ];
  const headerParams: HeaderParamsType[] = [
    {
      label: "Event name",
      langKey: "event_name",
      param: "",
      widthInPercent: 40,
    },
    { label: "Winnings", langKey: "winnings", param: "", widthInPercent: 20 },
    { label: "Amount", langKey: "amount", param: "", widthInPercent: 20 },
    { label: "Odds", langKey: "odds", param: "", widthInPercent: 20 },
  ];

  const upperRow: RowType[] = [
    {
      param: "",
      widthInPercent: 40,
      cellRender: eventNameCellRender,
    },
    {
      param: "",
      widthInPercent: 20,
      cellRender: winningsCellRender,
    },
    {
      param: "",
      widthInPercent: 20,
      cellRender: amountCellRender,
    },
    {
      param: "",
      widthInPercent: 20,
      cellRender: oddsCellRender,
    },
  ];
  const lowerRow: RowType[] = [
    { param: "", widthInPercent: 40, cellRender: lowerRowCellRender1 },
    { param: "", widthInPercent: 60, cellRender: lowerRowCellRender2 },
  ];
  const defaultFilters: Filters = {
    selectedGame: "SPORTS",
    status: "Open",
    startDate: moment().subtract(7, "d"),
    endDate: moment(),
    pageToken: [],
    sport: "All",
  };
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [bets, setBets] = useState<UserBet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortDesc, setsortDesc] = useState<boolean>(true);

  const pageSize = 25;
  const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];

  const [nextPageToken, setNextPageToken] = useState<string>(null);

  function eventNameCellRender(headerParam, row) {
    return (
      <div className="mb-event-name-date">
        <div className="b-700">{row.eventName}</div>
        <div className="mb-bet-date">
          {moment(row.betPlacedTime).format("DD-MM-YY, h:mm:ss A")}
        </div>
      </div>
    );
  }

  function winningsCellRender(headerParam, row) {
    return (
      <div
        className={
          row.payOutAmount > 0
            ? "profit-bet"
            : row.payOutAmount < 0
            ? "loss-bet"
            : "none-bet"
        }
      >
        {row.outcomeResult === "Open" ? "-" : row.payOutAmount.toFixed(2)}
      </div>
    );
  }

  function amountCellRender(headerParam, row) {
    return <div className="mb-amount-odd">{row.stakeAmount}</div>;
  }

  function oddsCellRender(headerParam, row) {
    return (
      <div className="mb-amount-odd">
        {row.oddValue && row.oddValue !== -1.0
          ? row.marketType === "FANCY" || row.marketType === "BINARY"
            ? Number(row.sessionRuns).toFixed(0)
            : row.marketType === "BOOKMAKER"
            ? (row.oddValue * 100 - 100).toFixed(2)
            : row.oddValue.toFixed(2)
          : "-"}
      </div>
    );
  }

  function lowerRowCellRender1(headerParam, row) {
    return (
      <div>
        <div className="display-flex">
          <div className="b-500">market:</div>{" "}
          <div className="b-400">{row.marketName}</div>
        </div>
        <div className="display-flex">
          <div className="b-500">bet on:</div>
          <div className="b-400">
            {row.marketType === "FANCY"
              ? row.marketName +
                " @ " +
                Number(row.oddValue * 100 - 100).toFixed(0)
              : row.marketType === "BINARY"
              ? row.outcomeDesc + " @ " + Number(row.sessionRuns).toFixed(0)
              : row.outcomeDesc}{" "}
            - ({getSportNameByIdMap(row?.sportId)})
          </div>
        </div>
      </div>
    );
  }

  function lowerRowCellRender2(headerParam, row) {
    return (
      <div>
        <div className="display-flex">
          <div className="b-500">{langData?.["results"]}:</div>
          <div className="b-400">
            {getOutcomeDescByEnumName(row.outcomeResult.toString())
              ? getOutcomeDescByEnumName(row.outcomeResult.toString())
              : "Unsettled"}
          </div>
        </div>
        <div className="display-flex">
          <div className="b-500">{langData?.["bet_type"]}:</div>
          <div className="b-400 txt-bldin-mob">{row.betType}</div>
        </div>
      </div>
    );
  }

  const sortOrderHandler = () => {
    setsortDesc(!sortDesc);
    setFilters({ ...filters, pageToken: [] });
    setNextPageToken(null);
  };

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
    setNextPageToken(null);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch data from API
      const response = await USABET_API.get("/match/homeMatchesOpen");

      if (response?.data?.status === true && Array.isArray(response.data.data)) {
        let allMatches = response.data.data;

        // Filter by selected sport if not "All"
        let filteredMatches = allMatches;
        if (filters.sport !== "All" && filters.selectedGame === "SPORTS") {
          filteredMatches = allMatches.filter((match: any) => {
            const sportId = match.sportId || match.sport_id || "";
            return sportId === filters.sport;
          });
        }

        // Transform API data to UserBet format
        const betList: UserBet[] = filteredMatches.map((match: any, index: number) => {
          const sportId = match.sportId || match.sport_id || "";
          const bet: UserBet & { sportId?: string; payOutAmount?: number; sessionRuns?: number | null; rowClassName?: string; categoryType?: string } = {
            id: match.eventId || match.event_id || `bet-${index}`,
            eventId: match.eventId || match.event_id || "",
            eventName: match.eventName || match.event_name || "",
            betPlacedTime: match.openDate || match.open_date || new Date().toISOString(),
            stakeAmount: (match.stakeAmount || match.stake_amount || 0) / cFactor,
            payOutAmount: (match.payOutAmount || match.pay_out_amount || 0) / cFactor,
            oddValue: match.oddValue || match.odd_value || 0,
            marketType: (match.marketType || match.market_type || "MATCH_ODDS") as UserBet["marketType"],
            marketName: match.marketName || match.market_name || "Match Odds",
            outcomeDesc: match.outcomeDesc || match.outcome_desc || "",
            outcomeResult: match.outcomeResult || match.outcome_result || "Open",
            betType: (match.betType || match.bet_type || "BACK") as UserBet["betType"],
            sportId: sportId,
            sessionRuns: match.sessionRuns || match.session_runs || null,
            rowClassName: "",
            categoryType: match.categoryType || match.category_type || "SPORTS",
          };

          // Set row className based on bet type
          if (bet.betType === "BACK") {
            bet.rowClassName = "mb-profit-amount";
          } else {
            bet.rowClassName = "mb-loss-amount";
          }

          return bet;
        });

        // Sort by betPlacedTime
        betList.sort((a, b) => {
          const dateA = new Date(a.betPlacedTime).getTime();
          const dateB = new Date(b.betPlacedTime).getTime();
          return sortDesc ? dateB - dateA : dateA - dateB;
        });

        setBets(betList);
        setNextPageToken(response.data?.pageToken || null);
      } else {
        // Fallback to empty array if API response is invalid
        setBets([]);
        setNextPageToken(null);
      }
    } catch (err) {
      console.error("Error fetching bets data:", err);
      setBets([]);
      setNextPageToken(null);
    }
    setLoading(false);
  }, [filters, cFactor, sortDesc]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onSportFilterChange = (sport: string) => {
    setFilters({ ...filters, sport: sport, pageToken: [] });
    setNextPageToken(null);
  };

  const handleBetStatusChange = (e) => {
    setFilters({ ...filters, status: e.target.value, pageToken: [] });
    setNextPageToken(null);
  };

  const handleStartDateChange = (e) => {
    setFilters({ ...filters, startDate: e, pageToken: [] });
    setNextPageToken(null);
  };

  const handleEndDateChange = (e) => {
    setFilters({ ...filters, endDate: e, pageToken: [] });
    setNextPageToken(null);
  };

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

  return (
    <div className="my-bets-page">
      <ReportBackBtn back={langData?.["back"]} />
      <ReportsHeader
        titleIcon={paperSvg}
        reportName={langData?.["my_bets"]}
        reportFilters={[
          {
            element: (
              <SelectTemplate
                label={langData?.["bet_status"]}
                list={betStatusOptions}
                value={filters.status}
                onChange={(e) => handleBetStatusChange(e)}
              />
            ),
          },
          {
            element: (
              <SelectTemplate
                label={langData?.["select_games"]}
                list={selectGamesOptions}
                value={filters.selectedGame}
                onChange={handleSelectedGameChange}
              />
            ),
          },
          {
            element: (
              <DateTemplate
                value={filters.startDate}
                label={langData?.["from"]}
                onChange={(e) => handleStartDateChange(e)}
                minDate={moment().subtract(30, "days").calendar()}
              />
            ),
          },
          {
            element: (
              <DateTemplate
                value={filters.endDate}
                label={langData?.["to"]}
                onChange={(e) => handleEndDateChange(e)}
                minDate={moment().subtract(90, "days").calendar()}
              />
            ),
          },
        ]}
      />

      {filters.selectedGame === "SPORTS" ? (
        <IonRow>
          <div className="sports-filters-row-ctn">
            <div className="ion-btns sports-filters-row">
              {sportOptions.map(
                (opt) =>
                  opt.allow && (
                    <Button
                      variant="outlined"
                      className={
                        filters.sport === opt.value ? "primary" : "secondary"
                      }
                      onClick={() => onSportFilterChange(opt.value)}
                    >
                      {langData?.[opt.langKey]}
                    </Button>
                  )
              )}
            </div>
          </div>
        </IonRow>
      ) : null}

      <IonRow>
        <IonCol className="mob-px-0 my-bets-ctn-col">
          <div className="reports-ctn my-bets-ctn">
            <div className="header-ctn">
              <div className="content-ctn light-bg my-bets-content">
                <div className="myb-bets-div">
                  {loading ? (
                    <Spinner />
                  ) : (
                    <>
                      <div className="tbl-ctn my-bets-tbl no-hov-style web-view">
                        <TableContainer component={Paper}>
                          <Table className="myb-table">
                            <TableHead>
                              <TableRow>
                                <TableCell className="th-date">
                                  {langData?.["place_date"]}
                                  <IconButton
                                    aria-label="Change Order"
                                    size="medium"
                                    onClick={() => sortOrderHandler()}
                                  >
                                    {sortDesc ? (
                                      <TableSortLabel
                                        active={true}
                                        direction="desc"
                                      />
                                    ) : (
                                      <TableSortLabel
                                        active={true}
                                        direction="asc"
                                      />
                                    )}
                                  </IconButton>
                                </TableCell>
                                <TableCell align="left" className="th-match">
                                  {langData?.["event_name"]}
                                </TableCell>
                                <TableCell align="left" className="th-market">
                                  {langData?.["market"]}
                                </TableCell>
                                <TableCell align="left" className="th-bet-on">
                                  {langData?.["bet_on"]}
                                </TableCell>
                                <TableCell align="left" className="th-bet-on">
                                  {langData?.["bet_type"]}
                                </TableCell>
                                <TableCell align="right">
                                  {langData?.["odds"]}
                                </TableCell>
                                <TableCell align="right">
                                  {langData?.["amount"]}
                                </TableCell>
                                <TableCell
                                  align="left"
                                  className="th-outcome-cell mb-result"
                                >
                                  {langData?.["result"]}
                                </TableCell>
                                <TableCell className="th-returns" align="right">
                                  {langData?.["winnings"]}
                                </TableCell>
                              </TableRow>
                            </TableHead>

                            {bets.length > 0 ? (
                              <TableBody className="myb-table-body">
                                {bets.map((row) => {
                                  return (
                                    row.outcomeResult != "Abandoned" && (
                                      <Row key={row.id} row={row} />
                                    )
                                  );
                                })}
                              </TableBody>
                            ) : (
                              <TableCell
                                className="my-bets-no-data-row"
                                colSpan={9}
                              >
                                <div className="no-bets-msg">
                                  {langData?.["bet_not_found_txt"]}
                                </div>
                              </TableCell>
                            )}
                          </Table>
                        </TableContainer>
                      </div>
                      <CustomTableMob
                        headerParams={headerParams}
                        bodyData={bets}
                        upperRow={upperRow}
                        lowerRow={lowerRow}
                        noDataMessage={langData?.["bet_not_found_txt"]}
                        langData={langData}
                      />
                    </>
                  )}
                  <IonRow>
                    {filters.pageToken.length > 0 && !loading && (
                      <IonButton
                        className="myb-btn-prev"
                        onClick={(e) => prevPage()}
                      >
                        ({langData?.["prev"]})({filters.pageToken.length})
                      </IonButton>
                    )}
                    {nextPageToken && !loading ? (
                      <IonButton
                        className="myb-btn-next"
                        onClick={(e) => nextPage()}
                      >
                        ({langData?.["next"]})({filters.pageToken.length + 2})
                      </IonButton>
                    ) : null}
                  </IonRow>
                </div>
              </div>
            </div>
          </div>
        </IonCol>
      </IonRow>
    </div>
  );
};

function Row(props: { row: UserBet }) {
  const { row } = props;

  return (
    <TableRow
      className={
        (row.oddValue && row.betType === "BACK") || row.eventName === "CASINO"
          ? "myb-table-row back-odd-row"
          : row.oddValue && row.betType === "LAY"
          ? "myb-table-row lay-odd-row"
          : "myb-table-row"
      }
    >
      <TableCell className="td-date" component="th" scope="row">
        {moment(row.betPlacedTime).format("DD-MM-YY, h:mm:ss A")}
      </TableCell>

      <TableCell className="myb-table-cell td-match second-cell" align="left">
        <div className="web-view">
          <div className="event-link">{row.eventName}</div>
        </div>

        <div className="mob-view">
          <div className="game-label col-data-header mob-fs-13">
            {row.eventName}
          </div>
          <div className="market-label col-data-header">
            {" "}
            {row.marketType === "FANCY"
              ? row.marketName +
                " @ " +
                Number(row.oddValue * 100 - 100).toFixed(0)
              : row.marketType === "BINARY"
              ? row.outcomeDesc + " @ " + Number(row.sessionRuns).toFixed(0)
              : row.outcomeDesc}
          </div>
          <div className="col-data-desc">
            {moment(row.betPlacedTime).format("DD-MM-YY, h:mm:ss A")}
          </div>
          <span className="event-name">
            ({getSportNameByIdMap(row?.sportId)})
          </span>
        </div>
      </TableCell>

      <TableCell className="myb-table-cell td-market" align="left">
        {row.marketType === "BOOKMAKER" || "MATCH_ODDS"
          ? row.marketName || MarketTypeByEnumMap[row.marketType]
          : MarketTypeByEnumMap[row.marketType]
          ? MarketTypeByEnumMap[row.marketType]
          : "Casino"}
        {row.categoryType === "SPORTS_BOOK" ? (
          <IonBadge class="text-white bet-badge">Sportsbook</IonBadge>
        ) : null}
        {/* {row.sportId !== 'sports book' && row.marketType === 3 ? (
            <IonBadge class="text-white bet-badge">
              {MarketTypeMap[row?.marketType]}
            </IonBadge>
          ) : null} */}
        <span className="event-name">
          {" "}
          - {getSportNameByIdMap(row?.sportId)}
        </span>
      </TableCell>
      <TableCell className="myb-table-cell td-bet-on" align="left">
        {row.marketType === "FANCY"
          ? row.marketName + " @ " + Number(row.oddValue * 100 - 100).toFixed(0)
          : row.marketType === "BINARY"
          ? row.outcomeDesc + " @ " + Number(row.sessionRuns).toFixed(0)
          : row.outcomeDesc}
      </TableCell>
      <TableCell className="myb-table-cell td-bet-on" align="left">
        {capitalize(row.betType)}
      </TableCell>

      <TableCell className="myb-table-cell td-odd" align="right">
        <span className="mob-fs-13">
          {row.oddValue && row.oddValue !== -1.0
            ? row.marketType === "FANCY" || row.marketType === "BINARY"
              ? Number(row.sessionRuns).toFixed(0)
              : row.marketType === "BOOKMAKER"
              ? (row.oddValue * 100 - 100).toFixed(2)
              : row.oddValue.toFixed(2)
            : "-"}
        </span>
      </TableCell>
      <TableCell className="myb-table-cell td-stake" align="right">
        <span className="mob-fs-14">{row.stakeAmount}</span>
      </TableCell>
      <TableCell className="myb-table-cell td-outcome" align="left">
        {getOutcomeDescByEnumName(row.outcomeResult.toString())
          ? getOutcomeDescByEnumName(row.outcomeResult.toString())
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
          {row.outcomeResult === "Open" ? "-" : row.payOutAmount.toFixed(2)}
        </span>
      </TableCell>
    </TableRow>
  );
}

const mapStateToProps = (state: RootState) => {
  return {
    allowedConfig: state.common.allowedConfig,
    langData: state.common.langData,
  };
};

export default connect(mapStateToProps, null)(MyBets);
