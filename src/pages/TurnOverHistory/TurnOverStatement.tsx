import { IonButton, IonCol, IonRow } from "@ionic/react";
import moment, { Moment } from "moment";
import React, { useEffect, useState } from "react";
import SVLS_API from "../../api-services/svls-api";
import { ReactComponent as TurnOverHistory } from "../../assets/images/reportIcons/TurnOverHistory.svg?react";
import CustomTable from "../../common/CustomTable/CustomTable";
import CustomTableMob, {
  HeaderParamsType,
  RowType,
} from "../../common/CustomTableMob/CustomTableMob";
import DateTemplate from "../../common/DateAndTimeTemplate/DateAndTimeTemplate";
import ReportBackBtn from "../../common/ReportBackBtn/ReportBackBtn";
import ReportsHeader from "../../common/ReportsHeader/ReportsHeader";
import SelectTemplate from "../../common/SelectTemplate/SelectTemplate";
import Spinner from "../../components/Spinner/Spinner";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { getCurrencyTypeFromToken } from "../../store";
import { transactionTypesMap } from "../../util/stringUtil";
import "./TurnOverStatement.scss";
import { connect } from "react-redux";
import { RootState } from "../../models/RootState";

type TurnoverDTO = {
  id: number;
  account_id: number;
  username: string;
  account_path: string;
  transaction_type: string;
  amount: number;
  turnover_balance: number;
  event_date: number;
  event_id: string;
  event_name: string;
  market_type: string;
  market_id: string;
  market_name: string;
  create_time: number;
};

type Filters = {
  dateFrom: any;
  dateTo: any;
  pageToken: string[];
  transactionType: string;
};

type Props = {
  langData: any;
};

const TurnOverStatement: React.FC<Props> = (props: Props) => {
  const { langData } = props;

  const defaultFilters: Filters = {
    dateFrom: moment().subtract(7, "d"),
    dateTo: moment(),
    pageToken: [],
    transactionType: "ALL",
  };
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 720);

  const headerParams: HeaderParamsType[] = [
    {
      label: "Event Type",
      langKey: "event_type",
      param: "",
      widthInPercent: 40,
    },
    { label: "Balance", langKey: "balance", param: "", widthInPercent: 20 },
    { label: "Amount", langKey: "amount", param: "", widthInPercent: 20 },
    { label: "Txn ID", langKey: "txn_id", param: "", widthInPercent: 20 },
  ];

  const webHeaderParams = [
    {
      label: "event date",
      langKey: "event_date",
      param: "",
      widthInPercent: 15,
      cellRender: eventDateRender,
    },
    {
      label: "transaction type",
      langKey: "transaction_type",
      param: "",
      widthInPercent: 15,
      cellRender: transactionTypeRender,
    },
    {
      label: "event name",
      langKey: "event_name",
      param: "event_name",
      widthInPercent: 20,
    },
    {
      label: "market",
      langKey: "market",
      param: "market_name",
      widthInPercent: 20,
    },
    {
      label: "market Type",
      langKey: "market_type",
      param: "market_type",
      widthInPercent: 10,
    },
    { label: "amount", langKey: "amount", param: "amount", widthInPercent: 10 },
    {
      label: "turnover balance",
      langKey: "turnover_balance",
      param: "turnover_balance",
      widthInPercent: 20,
    },
  ];
  const upperRow: RowType[] = [
    { param: "", widthInPercent: 40, cellRender: upperRowRender1 },
    {
      param: "turnover_balance",
      widthInPercent: 20,
    },
    {
      param: "amount",
      widthInPercent: 20,
    },
    {
      param: "id",
      widthInPercent: 20,
    },
  ];
  const lowerRow: RowType[] = [
    { param: "", widthInPercent: 40, cellRender: lowerRowRender1 },
    { param: "", widthInPercent: 60, cellRender: lowerRowRender2 },
  ];

  const [turnover, setTurnover] = useState<TurnoverDTO[]>([]);
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
      // Replaced API call with dummy data
      const dummyTurnoverEntries: TurnoverDTO[] = [
        {
          id: 1,
          account_id: 12345,
          username: "dummyuser",
          account_path: "/account/12345",
          transaction_type: "0",
          amount: 1000,
          turnover_balance: 5000,
          event_date: Date.now(),
          event_id: "EVT001",
          event_name: "Dummy Event 1",
          market_type: "1",
          market_id: "MKT001",
          market_name: "Match Odds",
          create_time: Date.now(),
        },
        {
          id: 2,
          account_id: 12345,
          username: "dummyuser",
          account_path: "/account/12345",
          transaction_type: "1",
          amount: -500,
          turnover_balance: 4500,
          event_date: Date.now(),
          event_id: "EVT002",
          event_name: "Dummy Event 2",
          market_type: "2",
          market_id: "MKT002",
          market_name: "Fancy Market",
          create_time: Date.now(),
        },
      ];

      setNextPageToken(null);
      setTurnover(dummyTurnoverEntries);
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

  const handleTranxTypeChange = (e: any) => {
    setFilters({ ...filters, pageToken: [], transactionType: e });
    setNextPageToken(null);
  };

  function eventDateRender(param, row) {
    return moment(row.event_date).format("DD-MM-YY, h:mm:ss A");
  }

  function transactionTypeRender(param, row) {
    return transactionTypesMap[row.transaction_type];
  }

  const TransactionFilters = [
    { value: "ALL", name: langData?.["all"] },
    { value: "BET_PLACEMENT", name: langData?.["bet_placement"] },
    { value: "BET_SETTLEMENT", name: langData?.["bet_settlement"] },
    { value: "BINARY_BET_ROLLBACK", name: langData?.["binary_bet_rollback"] },
    {
      value: "BINARY_BET_SETTLEMENT",
      name: langData?.["binary_bet_settlement"],
    },
    { value: "BINARY_BET_VOID", name: langData?.["binary_bet_void"] },
    { value: "CASINO_BET_PLACEMENT", name: langData?.["casino_bet_placement"] },
    { value: "CASINO_BET_ROLLBACK", name: langData?.["casino_bet_rollback"] },
    {
      value: "CASINO_BET_SETTLEMENT",
      name: langData?.["casino_bet_settlement"],
    },
    { value: "GAP_BET_ROLLBACK", name: langData?.["gap_bet_rollback"] },
    { value: "GAP_BET_SETTLEMENT", name: langData?.["gap_bet_settlement"] },
    {
      value: "ROLLBACK_BET_SETTLEMENT",
      name: langData?.["rollback_bet_settlement"],
    },
    {
      value: "ROLLBACK_VOID_BET_SETTLEMENT",
      name: langData?.["rollback_void_bet_settlement"],
    },
    {
      value: "SPORT_BOOK_BET_ROLLBACK",
      name: langData?.["sport_book_bet_rollback"],
    },
    {
      value: "SPORT_BOOK_BET_SETTLEMENT",
      name: langData?.["sport_book_bet_settlement"],
    },
    {
      value: "VOID_BET_SETTLEMENT",
      name: langData?.["void_bet_settlement"],
    },
  ];

  function upperRowRender1(param, row) {
    return (
      <div className="toh-event-market-name">
        <div className="toh-event-name">{row.event_name}</div>
        <div className="toh-market-name">
          {moment(row.event_date).format("DD-MM-YY, h:mm:ss A")}
        </div>
      </div>
    );
  }

  function lowerRowRender1(param, row) {
    return (
      <div className="toh-market-type">
        <span className="toh-market-label">{langData?.["market"]}:</span>
        <span>{row.market_name}</span>
      </div>
    );
  }

  function lowerRowRender2(param, row) {
    return (
      <div className="toh-trx-type">
        <span className="toh-trx-label">{langData?.["txn_type"]}:</span>
        <span>{transactionTypesMap[row.transaction_type]}</span>
      </div>
    );
  }

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
          reportName={langData?.["turnover_history"]}
          reportFilters={[
            {
              element: (
                <SelectTemplate
                  label={langData?.["transaction_type"]}
                  list={TransactionFilters}
                  value={filters.transactionType}
                  onChange={(e) => {
                    handleTranxTypeChange(e.target.value);
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
                    {isMobile ? (
                      <CustomTableMob
                        headerParams={headerParams}
                        upperRow={upperRow}
                        lowerRow={lowerRow}
                        bodyData={turnover}
                        noDataMessage={langData?.["no_history_found_txt"]}
                        langData={langData}
                      />
                    ) : (
                      <CustomTable
                        className={"toh-table-new"}
                        headerParams={webHeaderParams}
                        bodyData={turnover}
                        noDataMessage={langData?.["no_history_found_txt"]}
                        langData={langData}
                      />
                    )}
                  </>
                )}
                <IonRow>
                  {filters.pageToken.length > 0 && !loading && (
                    <IonButton className="myb-btn-prev" onClick={prevPage}>
                      ({langData?.["prev"]})({filters.pageToken.length})
                    </IonButton>
                  )}
                  {nextPageToken && !loading ? (
                    <IonButton className="myb-btn-next" onClick={nextPage}>
                      ({langData?.["next"]})({filters.pageToken.length + 2})
                    </IonButton>
                  ) : null}
                </IonRow>
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

export default connect(mapStateToProps, null)(TurnOverStatement);
