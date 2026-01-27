import { IonCol, IonRow } from "@ionic/react";
import moment, { Moment } from "moment";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";

import Spinner from "../../components/Spinner/Spinner";
import { LedgerRecord } from "../../models/LedgerRecord";
import {
  fetchBettingCurrency,
  getCurrencyTypeFromToken,
  logout,
} from "../../store";

import API from "../../api";
import { ReactComponent as AccountStatement } from "../../assets/images/reportIcons/AccountStatement.svg?react";
import CustomTable from "../../common/CustomTable/CustomTable";
import DateTemplate from "../../common/DateAndTimeTemplate/DateAndTimeTemplate";
import ReportBackBtn from "../../common/ReportBackBtn/ReportBackBtn";
import ReportsHeader from "../../common/ReportsHeader/ReportsHeader";
import SelectTemplate from "../../common/SelectTemplate/SelectTemplate";
import Modal from "../../components/Modal/Modal";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { Currency } from "../../models/Currency";
import { RootState } from "../../models/RootState";
import REPORTING_API from "../../reporting-api";
import {
  MarketTypeMap,
  OutcomeDescMap,
  SportNameByIdMap,
  TransactionTypeMap,
  getTransactionNameByID,
} from "../../util/stringUtil";
import AccStmtTableMob from "./AccStmtTableMob";
import "./AccountStatement.scss";
import CustomTableMob, {
  HeaderParamsType,
  RowType,
} from "../../common/CustomTableMob/CustomTableMob";
import { DomainConfig } from "../../models/DomainConfig";
import TransactionDetailsCard from "./TransactionDetailsCard";

type LedgerProps = {
  fetchBettingCurrency: Function;
  bettingCurrency: Currency;
  logout: Function;
  langData: any;
  domainConfig: DomainConfig;
};

type Filters = {
  transaction: string;
  fromDate: any;
  toDate: any;
  pageToken: string[];
};

const Ledger: React.FC<LedgerProps> = (props) => {
  const defaultFilters: Filters = {
    transaction: "-1",
    fromDate: moment().subtract(7, "d"),
    toDate: moment(),
    pageToken: [],
  };
  const {
    logout,
    fetchBettingCurrency,
    bettingCurrency,
    langData,
    domainConfig,
  } = props;
  const headerParams = [
    {
      label: "S No",
      langKey: "sr_no",
      param: "",
      cellRender: srNoCellRender,
      widthInPercent: 5,
    },
    {
      label: "DATE",
      langKey: "date_caps",
      param: "",
      cellRender: dateCellRender,
      widthInPercent: 16,
    },
    {
      label: "CREDIT",
      langKey: "credit",
      param: "",
      cellRender: creditCellRender,
      widthInPercent: 9,
    },
    {
      label: "DEBIT",
      langKey: "debit",
      param: "eventName",
      widthInPercent: 9,
      cellRender: debitCellRender,
    },
    {
      label: "BALANCE",
      langKey: "balance",
      param: "",
      cellRender: closingBalanceCellRender,
      widthInPercent: 13,
    },
    {
      label: "TRANSACTION ID",
      langKey: "transaction_id_caps",
      param: "transactionId",
      widthInPercent: 16,
    },
    {
      label: "SPORTS",
      langKey: "sports",
      param: "",
      cellRender: sportsCellRender,
      widthInPercent: 13,
    },
    {
      label: "REMARK",
      langKey: "remark",
      param: "",
      cellRender: remarkCellRender,
      widthInPercent: 34,
    },
    // {
    //   label: 'TRANSACTION ID',
    //   langKey: 'transaction_id_caps',
    //   param: 'transactionId',
    //   widthInPercent: 12,
    // },
    {
      label: "",
      langKey: "",
      param: "",
      cellRender: moreCellRender,
      widthInPercent: 5,
    },
  ];

  const subHeaderParams1 = [
    {
      label: "Sr No",
      langKey: "sr_no",
      param: "srNo",
      cellRender: srNoCellRender,
      widthInPercent: 6,
    },
    {
      label: "Nation",
      langKey: "nation",
      param: "",
      cellRender: marketNameCellRender,
      widthInPercent: 15,
    },
    {
      label: "Side",
      langKey: "side",
      param: "",
      cellRender: betTypeCellRender,
      widthInPercent: 7,
    },
    {
      label: "Rate",
      langKey: "rate",
      param: "",
      cellRender: betOnCellRender,
      widthInPercent: 8,
    },
    // {
    //   label: 'Odds',
    //   langKey: 'odds',
    //   param: '',
    //   cellRender: oddCellRender,
    // },
    {
      label: "Amount",
      langKey: "amount",
      param: "",
      cellRender: stakeCellRender,
      widthInPercent: 15,
    },
    {
      label: "Win/Loss",
      langKey: "win_loss",
      param: "",
      cellRender: returnsCellRender,
      widthInPercent: 15,
    },
    {
      label: "Placed date",
      langKey: "placed_date",
      param: "",
      cellRender: placeDateCellRender,
      widthInPercent: 17,
    },
    {
      label: "Settled time",
      langKey: "settled_time",
      param: "",
      cellRender: matchDateCellRender,
      widthInPercent: 17,
    },
  ];

  const subHeaderParams2 = [
    {
      label: "Date",
      langKey: "date",
      param: "",
      cellRender: dateCellRender,
    },
    {
      label: "Transaction",
      langKey: "transaction",
      param: "fromUser",
    },
    {
      label: "Balance Before",
      langKey: "balance_before",
      param: "",
      cellRender: balanceBeforeCellRender,
    },
    {
      label: "Balance After",
      langKey: "balance_after",
      param: "",
      cellRender: closingBalanceCellRender,
    },
    {
      label: "Amount",
      langKey: "amount",
      param: "",
      cellRender: profitAmountCellRender,
    },
  ];

  const mobHeaderParams = [
    { label: "event name", langKey: "event_name", param: "" },
    { label: "cre/dbt", langKey: "credit_debit_mob_txt", param: "" },
    { label: "trx", langKey: "txn_mob_txt", param: "" },
    { label: "tx id", langKey: "txn_id_mob_txt", param: "" },
  ];

  const mobSubHeaderParams1 = [
    {
      label: "Placed date",
      langKey: "placed_date",
      param: "",
      widthInPercent: 32,
    },
    { label: "Market", langKey: "market", param: "", widthInPercent: 25 },
    { label: "Event", langKey: "event", param: "", widthInPercent: 25 },
    { label: "Bet on", langKey: "bet_on", param: "", widthInPercent: 18 },
  ];

  const upperRow1: RowType[] = [
    {
      param: "",
      widthInPercent: 32,
      cellRender: dateCellRender,
    },
    {
      param: "",
      widthInPercent: 26,
      cellRender: marketNameCellRender,
    },
    {
      param: "",
      widthInPercent: 26,
      cellRender: eventNameCellRender,
    },
    {
      param: "",
      widthInPercent: 16,
      cellRender: betOnCellRender,
    },
  ];

  const lowerRow1: RowType[] = [
    {
      param: "",
      widthInPercent: 25,
      cellRender: (headerParam, row) => (
        <div className="acnt-statement-row-cell lower-row">
          <span className="mob-key">{langData?.["odds"]} : </span>
          <span className="mob-value">
            {row.oddValue && row.oddValue !== -1.0
              ? row.marketType === 2
                ? row.outcomeName
                  ? row.outcomeName.split(" ")[1]
                  : "-"
                : row.marketType === 1
                ? (row.oddValue * 100 - 100).toFixed(2)
                : row.marketType === 5
                ? (2).toFixed(2)
                : row.oddValue.toFixed(2)
              : "-"}
          </span>
        </div>
      ),
    },
    {
      param: "",
      widthInPercent: 25,
      cellRender: (headerParam, row) => (
        <div className="acnt-statement-row-cell lower-row">
          <span className="mob-key">{langData?.["stake"]} : </span>
          <span className="mob-value">
            {row.stakeAmount ? (row.stakeAmount / cFactor).toFixed(2) : "-"}
          </span>
        </div>
      ),
    },
    {
      param: "",
      widthInPercent: 25,
      cellRender: (headerParam, row) => (
        <div className="acnt-statement-row-cell lower-row">
          <span className="mob-key">{langData?.["returns"]} : </span>
          <span
            className={`${
              row.profitAmount > 0
                ? "credit-profit"
                : row.profitAmount < 0
                ? "credit-loss"
                : ""
            }`}
          >
            {row.profitAmount ? (row.profitAmount / cFactor).toFixed(2) : "-"}
          </span>
        </div>
      ),
    },
    {
      param: "",
      widthInPercent: 25,
      cellRender: (headerParam, row) => (
        <div className="acnt-statement-row-cell lower-row">
          <span className="mob-key">{langData?.["status"]} : </span>
          <span className="mob-value">
            {row.betResult !== undefined ? OutcomeDescMap[row.betResult] : "-"}
          </span>
        </div>
      ),
    },
  ];

  const mobSubHeaderParams2: HeaderParamsType[] = [
    { label: "DATE", langKey: "date", param: "", widthInPercent: 40 },
    {
      label: "Transaction",
      langKey: "transaction",
      param: "",
      widthInPercent: 30,
    },
    { label: "Amount", langKey: "amount", param: "", widthInPercent: 30 },
  ];

  const upperRow2: RowType[] = [
    {
      param: "",
      widthInPercent: 40,
      cellRender: dateCellRender,
    },
    {
      param: "",
      widthInPercent: 30,
      cellRender: profitAmountCellRender,
    },
    {
      param: "",
      widthInPercent: 30,
    },
  ];

  const lowerRow2: RowType[] = [
    {
      param: "",
      widthInPercent: 50,
      cellRender: (headerParam, row) => (
        <div className="acnt-statement-row-cell lower-row">
          <span className="mob-key">{langData?.["balance_before"]} : </span>
          <span className="mob-value">{row.balanceBefore?.toFixed(2)}</span>
        </div>
      ),
    },
    {
      param: "",
      widthInPercent: 50,
      cellRender: (headerParam, row) => (
        <div className="acnt-statement-row-cell lower-row">
          <span className="mob-key">{langData?.["balance_after"]} : </span>
          <span className="mob-value">{row.balanceAfter?.toFixed(2)}</span>
        </div>
      ),
    },
  ];

  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [records, setRecords] = useState<any[]>([]);
  const [sortDesc, setsortDesc] = useState<boolean>(true);
  const [subHeaderParams, setSubHeaderParams] =
    useState<any[]>(subHeaderParams1);
  const [mobsubHeaderParams, setMobSubHeaderParams] =
    useState<HeaderParamsType[]>(mobSubHeaderParams1);
  const [upperRow, setUpperRow] = useState<RowType[]>(upperRow1);
  const [lowerRow, setLowerRow] = useState<RowType[]>(lowerRow1);
  const [subBodyData, setSubBodyData] = useState<any[]>([]);
  const [showTransactionDetailsModal, setShowTransactionDetailsModal] =
    useState<boolean>(false);
  const [transactionDetails, setTransactionDetails] =
    useState<LedgerRecord>(null);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [nextPageToken, setNextPageToken] = useState<string>(null);

  const pageSize = 25;
  const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];
  const TransactionFilters = [
    { value: "-1", name: langData?.["all"], allow: true },
    { value: "0", name: langData?.["deposit"], allow: true },
    { value: "1", name: langData?.["withdraw"], allow: true },
    { value: "2", name: langData?.["settlement_deposit"], allow: true },
    { value: "3", name: langData?.["settlement_withdraw"], allow: true },
    { value: "27", name: langData?.["bet_settlement"], allow: true },
    {
      value: "19-20-21",
      name: langData?.["casino_bets"] || "Casino Bets",
      allow: true,
    },
    { value: "6-10-21-28-38-42", name: langData?.["rollback"], allow: true },
    { value: "7-29", name: langData?.["voided"], allow: true },
    {
      value: "45",
      name: langData?.["bonus_redeemed"],
      allow: domainConfig.b2cEnabled && domainConfig.bonus,
    },
    {
      value: "46",
      name: langData?.["bonus_rollback"],
      allow: domainConfig.b2cEnabled && domainConfig.bonus,
    },
    { value: "47", name: langData?.["refund"], allow: true },
  ];

  function srNoCellRender(param, row) {
    return (
      <div
        onClick={() => onShowTransactionDetails(row)}
        className="as-date-param"
      >
        {row.srNo || "-"}
      </div>
    );
  }

  function dateCellRender(param, row) {
    return (
      <div
        onClick={() => onShowTransactionDetails(row)}
        className="as-date-param"
      >
        {moment(row.transactionTime).format("DD-MM-YY, h:mm:ss A")}
      </div>
    );
  }

  function placeDateCellRender(param, row) {
    return (
      <div className="as-date-param">
        {moment(row.initiated_time).format("DD-MM-YY, h:mm:ss A")}
      </div>
    );
  }

  function matchDateCellRender(param, row) {
    return (
      <div className="as-date-param">
        {moment(row.placed_time).format("DD-MM-YY, h:mm:ss A")}
      </div>
    );
  }

  function tranxCellRender(param, row) {
    return (
      <div onClick={() => onShowTransactionDetails(row)}>
        {/* TODO: update this as well. */}
        {getTransactionNameByID(row.transactionType)}
      </div>
    );
  }

  function eventNameCellRender(param, row) {
    return (
      <div onClick={() => onShowTransactionDetails(row)}>
        {/* For casino transactions, show event name */}
        {row?.eventName || "-"}
      </div>
    );
  }

  function eventNameWithResultCellRender(param, row) {
    return (
      <div onClick={() => onShowTransactionDetails(row)}>
        {row?.eventName
          ? row?.marketType == "0" ||
            row?.marketType == "1" ||
            row?.marketType == "2"
            ? row?.eventName + (row?.result ? ` @ ${row?.result}` : "")
            : row?.eventName
          : "-"}
      </div>
    );
  }

  function marketNameCellRender(param, row) {
    return (
      <div onClick={() => onShowTransactionDetails(row)}>
        {/* For casino transactions, show game code or market ID */}
        {row.marketType === 4 || row.marketType === 6
          ? row.gameCode || row.marketId || "-"
          : row.market_name || row.marketId || "-"}
      </div>
    );
  }

  function remarkCellRender(param, row) {
    if (row?.remarks) {
      return (
        <div onClick={() => onShowTransactionDetails(row)}>{row?.remarks}</div>
      );
    }
    // For casino transactions, show the game code and transaction ID
    if (row?.remarks) {
      return (
        <div onClick={() => onShowTransactionDetails(row)}>{row?.remarks}</div>
      );
    }
    if (row.marketType === 4 || row.marketType === 6) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            textAlign: "center",
            padding: "0px 4px",
          }}
          onClick={() => onShowTransactionDetails(row)}
        >
          <span>
            {TransactionTypeMap[row?.transactionType]} - {row.eventName || "-"}{" "}
            [{row.marketId || "-"}]
          </span>
        </div>
      );
    } else if (!(row?.eventId || row?.marketId || row?.betId)) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            textAlign: "center",
            padding: "0px 4px",
          }}
          onClick={() => onShowTransactionDetails(row)}
        >
          {TransactionTypeMap[row?.transactionType]}
        </div>
      );
    }

    // For sports transactions, show event > market > outcome format
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          textAlign: "center",
          padding: "0px 4px",
        }}
        onClick={() => onShowTransactionDetails(row)}
      >
        {row?.eventName ?? "-"}
        {"  "}
        {">"}
        {row?.marketType != null && MarketTypeMap[row.marketType]
          ? MarketTypeMap[row.marketType]
          : "-"}
        {">  "}
        {row?.marketName}
        {"  "}[{row?.result}]
        {/* {row?.marketType === 1 || row?.marketType === 0
          ? row?.result
            ? ` @ ${row?.result}`
            : ''
          : row.marketType === 2
            ? row.marketName +
              ' @ ' +
              Number(row.oddValue * 100 - 100).toFixed(0)
            : row.marketType === 5
              ? row?.outcomeName + ' @ ' + Number(row.oddValue).toFixed(0)
              : row?.outcomeName} */}
      </div>
    );
  }

  function marketTypeCellRender(param, row) {
    return (
      <div onClick={() => onShowTransactionDetails(row)}>
        {row?.marketType != null && MarketTypeMap[row?.marketType]
          ? MarketTypeMap[row?.marketType]
          : "-"}
      </div>
    );
  }

  function creditOrDebitCellRender(param, row) {
    return (
      <div
        onClick={() => onShowTransactionDetails(row)}
        className={
          row?.amount > 0
            ? "credit-profit"
            : row?.amount < 0
            ? "credit-loss "
            : null
        }
      >
        {row?.amount > 0
          ? "+" + row?.amount.toFixed(2)
          : row?.amount.toFixed(2)}
      </div>
    );
  }

  function creditCellRender(param, row) {
    return (
      <div
        onClick={() => onShowTransactionDetails(row)}
        className={row?.amount > 0 ? "credit-profit" : null}
      >
        {row?.amount > 0
          ? "+" +
            (row?.amount % 1 === 0
              ? row?.amount.toFixed(0)
              : row?.amount.toFixed(2))
          : "-"}
      </div>
    );
  }

  function debitCellRender(param, row) {
    return (
      <div
        onClick={() => onShowTransactionDetails(row)}
        className={row?.amount < 0 ? "credit-loss " : null}
      >
        {row?.amount < 0
          ? row?.amount % 1 === 0
            ? row?.amount.toFixed(0)
            : row?.amount.toFixed(2)
          : "-"}
      </div>
    );
  }

  function betOnCellRender(param, row) {
    if (row?.marketType === 2) {
      return row?.outcome_name;
    } else if (row?.marketType === 5) {
      return row?.outcome_name
        ? row?.outcome_name + " @ " + Number(row?.odd_value).toFixed(0)
        : "-";
    } else {
      return row?.odd_value || "-";
    }
  }

  function betTypeCellRender(param, row) {
    return row?.betType === 1 ? "Lay" : "Back";
  }

  function oddCellRender(param, row) {
    if (!row?.odd_value || row?.odd_value === -1.0) {
      return "-";
    }

    if (row?.marketType === 2) {
      return row?.outcome_name ? row?.outcome_name.split(" ")[1] : "-";
    } else if (row?.marketType === 1) {
      return (row?.odd_value * 100 - 100).toFixed(2);
    } else if (row?.marketType === 5) {
      return (2).toFixed(2);
    } else {
      return row?.odd_value.toFixed(2);
    }
  }

  function stakeCellRender(param, row) {
    return row?.stake_amount ? (row?.stake_amount / cFactor).toFixed(2) : "-";
  }

  function statusCellRender(param, row) {
    return row?.betResult !== undefined ? OutcomeDescMap[row?.betResult] : "-";
  }

  function returnsCellRender(param, row) {
    return (
      <span
        className={`${
          row?.profit_amount > 0
            ? "credit-profit"
            : row?.profit_amount < 0
            ? "credit-loss"
            : ""
        }`}
      >
        {row?.profit_amount ? (row?.profit_amount / cFactor).toFixed(2) : "-"}
      </span>
    );
  }

  function closingBalanceCellRender(param, row) {
    return (
      <div onClick={() => onShowTransactionDetails(row)}>
        {row?.balanceAfter % 1 === 0
          ? row?.balanceAfter?.toFixed(0)
          : row?.balanceAfter?.toFixed(2)}
        {/* {Math.floor(row.balanceAfter).toFixed(2)} */}
      </div>
    );
  }

  function balanceBeforeCellRender(param, row) {
    return row?.balanceBefore?.toFixed(2);
  }

  function sportsCellRender(param, row) {
    // For sports transactions, show the sport name
    return (
      <div className="capitalize">{SportNameByIdMap[row?.sportId] ?? "-"}</div>
    );
  }

  function profitAmountCellRender(param, row) {
    return row?.profitAmount?.toFixed(2);
  }

  function remarksCellRender(param, row) {
    return (
      <div onClick={() => onShowTransactionDetails(row)}>
        {row?.remarks ? row?.remarks : "-"}
      </div>
    );
  }

  function moreCellRender(param, row) {
    return (
      <button
        className="arrow-btn"
        onClick={() => onShowTransactionDetails(row)}
      >
        <i
          className={`arrow ${
            transactionDetails?.transactionId === row?.transactionId
              ? "up"
              : "right"
          }`}
        ></i>
      </button>
    );
  }

  useEffect(() => {
    fetchBettingCurrency();
  }, [fetchBettingCurrency]);

  const fromDateChangeHandler = (d: Moment) => {
    setFilters({ ...filters, fromDate: d, pageToken: [] });
    setNextPageToken(null);
  };

  const toDateChangeHandler = (d: Moment) => {
    setFilters({ ...filters, toDate: d, pageToken: [] });
    setNextPageToken(null);
  };

  const transactionChangeHandler = (e) => {
    setFilters({ ...filters, transaction: e.target.value, pageToken: [] });
    setNextPageToken(null);
  };

  // const sortOrderHandler = () => {
  //   setsortDesc(!sortDesc);
  // };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      if (!bettingCurrency) return false;

      // Replaced API call with dummy data
      let statements = [
        {
          transactionId: "TXN001",
          transactionType: 0,
          amount: 1000 / cFactor,
          balanceAfter: 11000 / cFactor,
          transactionTime: new Date().toISOString(),
          remarks: "Dummy Deposit",
          eventName: "Dummy Event",
          marketType: 0,
        },
        {
          transactionId: "TXN002",
          transactionType: 1,
          amount: -500 / cFactor,
          balanceAfter: 10500 / cFactor,
          transactionTime: new Date().toISOString(),
          remarks: "Dummy Withdrawal",
          eventName: "Dummy Event",
          marketType: 0,
        },
      ];

      statements = statements.filter(
        (st) => ![28, 29, 50, 51].includes(st.transactionType)
      );

      // Add serial numbers to records
      statements = statements.map((statement, index) => ({
        ...statement,
        srNo: filters.pageToken.length * pageSize + index + 1,
      }));

      setRecords(statements);
      setNextPageToken(null);
    } catch (err) {
      if (err?.response) {
        setErrorMsg(err.response.data.message);
      }
      if (err.response && err.response.status === 401) {
        logout();
      }
      setNextPageToken(null);
    }
    setLoading(false);
  };

  const fetchData = async () => {
    try {
      // For casino transactions, we don't need to make an API call since we use main data
      if (
        transactionDetails.marketType === 4 ||
        transactionDetails.marketType === 6
      ) {
        // Casino transactions are handled in onShowTransactionDetails
        return;
      }

      // Replaced API call with dummy data
      let data: any[] = [
        {
          transactionId: transactionDetails.transactionId,
          transactionType: transactionDetails.transactionType,
          amount: 1000,
          balanceAfter: 11000,
          transactionTime: new Date().toISOString(),
          remarks: "Dummy Transaction Detail",
          srNo: 1,
          betType: 0,
          outcomeName: "Dummy Outcome",
          stakeAmount: 1000,
          profitAmount: 500,
          oddValue: 2.5,
          eventId: transactionDetails.eventId,
          marketId: transactionDetails.marketId,
        },
      ];

      data.map((indv, index) => {
        indv.srNo = index + 1;
      });
      if ([19, 20, 21].includes(+transactionDetails.transactionType)) {
        // Handle casino bet settlement transactions
        data.map((indv, index) => {
          indv.marketId = transactionDetails.marketId;
        });

        // For casino settlement, show different headers for inline sub-table
        const casinoSettlementSubHeaders = [
          {
            label: "Nation",
            langKey: "nation",
            param: "outcomeName",
            cellRender: (param, row) => row.outcomeName || row.nation || "-",
          },
          {
            label: "Side",
            langKey: "side",
            param: "betType",
            cellRender: (param, row) => (row.betType === 1 ? "Lay" : "Back"),
          },
          {
            label: "Rate",
            langKey: "rate",
            param: "oddValue",
            cellRender: (param, row) =>
              row.oddValue
                ? `${row.oddValue.toFixed(2)}/ ${(
                    row.oddValue * 100 -
                    100
                  ).toFixed(2)}`
                : "-",
          },
          {
            label: "Amount",
            langKey: "amount",
            param: "stakeAmount",
            cellRender: (param, row) => (row.stakeAmount / cFactor).toFixed(2),
          },
          {
            label: "Win/loss",
            langKey: "win_loss",
            param: "profitAmount",
            cellRender: (param, row) => (
              <span
                className={
                  row.profitAmount > 0 ? "credit-profit" : "credit-loss"
                }
              >
                {(row.profitAmount / cFactor).toFixed(2)}
              </span>
            ),
          },
          {
            label: "Place Date",
            langKey: "place_date",
            param: "transactionTime",
            cellRender: (param, row) =>
              moment(row.transactionTime).format("YYYY-MM-DD HH:mm"),
          },
          {
            label: "Settled time",
            langKey: "settled_time",
            param: "transactionTime",
            cellRender: (param, row) =>
              moment(row.transactionTime).format("YYYY-MM-DD HH:mm"),
          },
        ];

        setSubHeaderParams(casinoSettlementSubHeaders);

        // Mobile headers for casino settlement
        setMobSubHeaderParams([
          { label: "Nation", langKey: "nation", param: "", widthInPercent: 30 },
          { label: "Side", langKey: "side", param: "", widthInPercent: 15 },
          { label: "Amount", langKey: "amount", param: "", widthInPercent: 25 },
          {
            label: "Win/Loss",
            langKey: "win_loss",
            param: "",
            widthInPercent: 30,
          },
        ]);

        // Mobile upper row for casino settlement
        setUpperRow([
          {
            param: "",
            widthInPercent: 30,
            cellRender: (param, row) => row.outcomeName || row.nation || "-",
          },
          {
            param: "",
            widthInPercent: 15,
            cellRender: (param, row) => (row.betType === 1 ? "Lay" : "Back"),
          },
          {
            param: "",
            widthInPercent: 25,
            cellRender: (param, row) => (row.stakeAmount / cFactor).toFixed(2),
          },
          {
            param: "",
            widthInPercent: 30,
            cellRender: (param, row) => (
              <span
                className={
                  row.profitAmount > 0 ? "credit-profit" : "credit-loss"
                }
              >
                {(row.profitAmount / cFactor).toFixed(2)}
              </span>
            ),
          },
        ]);

        // Mobile lower row for casino settlement
        setLowerRow([
          {
            param: "",
            widthInPercent: 50,
            cellRender: (param, row) => (
              <div className="acnt-statement-row-cell lower-row">
                <span className="mob-key">{langData?.["rate"]} : </span>
                <span className="mob-value">
                  {row.oddValue
                    ? `${row.oddValue.toFixed(2)}/ ${(
                        row.oddValue * 100 -
                        100
                      ).toFixed(2)}`
                    : "-"}
                </span>
              </div>
            ),
          },
          {
            param: "",
            widthInPercent: 50,
            cellRender: (param, row) => (
              <div className="acnt-statement-row-cell lower-row">
                <span className="mob-key">{langData?.["place_date"]} : </span>
                <span className="mob-value">
                  {moment(row.transactionTime).format("YYYY-MM-DD HH:mm")}
                </span>
              </div>
            ),
          },
        ]);
      } else if (
        ![0, 1, 2, 3, 48].includes(+transactionDetails.transactionType)
      ) {
        // Handle sports transactions
        data.map((indv) => {
          if (indv.betType === 1) {
            indv.rowClassName = "as-loss";
          }
          if (indv.betType === 0) {
            indv.rowClassName = "as-profit";
          }
        });
        setSubHeaderParams(subHeaderParams1);
        setMobSubHeaderParams(mobSubHeaderParams1);
        setUpperRow(upperRow1);
        setLowerRow(lowerRow1);
      } else {
        // Handle deposit/withdrawal transactions
        setSubHeaderParams(subHeaderParams2);
        setMobSubHeaderParams(mobSubHeaderParams2);
        setUpperRow(upperRow2);
        setLowerRow(lowerRow2);
      }
      setSubBodyData(data);
    } catch (err) {
      console.log(err);
    }
  };

  const onShowTransactionDetails = (row: LedgerRecord) => {
    let recordsReplica = records;
    setSubHeaderParams([]);
    setSubBodyData([]);
    recordsReplica.forEach((indv) => {
      let hit = false;
      if (transactionDetails?.transactionId === indv?.transactionId) {
        indv.subTableExists = false;
        hit = true;
      }
      if (!hit && indv?.transactionId === row?.transactionId) {
        indv.subTableExists = true;
      }
    });

    if (transactionDetails?.transactionId === row?.transactionId) {
      // Collapse the sub-table
      setTransactionDetails(null);
      setShowTransactionDetailsModal(false);
      setSubHeaderParams([]);
      setSubBodyData([]);
    } else {
      // Expand the sub-table
      setTransactionDetails(row);
      setShowTransactionDetailsModal(true);

      // For casino transactions, create sub-table data from the main records
      if (row.marketType === 4 || row.marketType === 6) {
        // Find related casino transactions with the same correlationId or betId
        const relatedTransactions = records.filter(
          (record) =>
            (record.correlationId === row.correlationId ||
              record.betId === row.betId) &&
            record.marketType === 4
        );

        // Create sub-table data from related transactions
        const subTableData = relatedTransactions.map((record, index) => ({
          transactionId: record.transactionId,
          betType: +record.transactionType === 19 ? 0 : 1, // 19 = bet placement (back), 20 = settlement
          gameId: record.eventId, // Use eventId as Game Id for casino
          marketId: record.marketId,
          gameCode: record.gameCode,
          stakeAmount: Math.abs(record.amount),
          transactionTime: record.transactionTime,
          srNo: index + 1, // Serial number for sub-table
        }));

        // Set casino transaction headers for inline sub-table
        const casinoSubHeaders = [
          {
            label: "Sr No",
            langKey: "sr_no",
            param: "srNo",
            cellRender: (param, row) => row.srNo,
          },
          {
            label: "Round Id",
            langKey: "round_id",
            param: "transactionId",
            cellRender: (param, row) => row.marketId,
          },
          {
            label: "Side",
            langKey: "side",
            param: "betType",
            cellRender: (param, row) => (row.betType === 1 ? "Lay" : "Back"),
          },
          {
            label: "Game Id",
            langKey: "game_id",
            param: "gameId",
            cellRender: (param, row) => row.gameId,
          },
          {
            label: "Game Code",
            langKey: "game_code",
            param: "gameCode",
            cellRender: (param, row) => row.gameCode || "-",
          },
          {
            label: "Amount",
            langKey: "amount",
            param: "stakeAmount",
            cellRender: (param, row) => (row.stakeAmount / cFactor).toFixed(2),
          },
          {
            label: "Place Date",
            langKey: "place_date",
            param: "transactionTime",
            cellRender: (param, row) =>
              moment(row.transactionTime).format("YYYY-MM-DD HH:mm"),
          },
        ];

        setSubHeaderParams(casinoSubHeaders);
        setSubBodyData(subTableData); // Use filtered data instead of all data

        // Mobile headers for casino
        setMobSubHeaderParams([
          {
            label: "Round Id",
            langKey: "round_id",
            param: "",
            widthInPercent: 25,
          },
          { label: "Side", langKey: "side", param: "", widthInPercent: 15 },
          {
            label: "Game Code",
            langKey: "game_code",
            param: "",
            widthInPercent: 30,
          },
          { label: "Amount", langKey: "amount", param: "", widthInPercent: 30 },
        ]);

        // Mobile upper row for casino
        setUpperRow([
          {
            param: "",
            widthInPercent: 25,
            cellRender: (param, row) => row.transactionId,
          },
          {
            param: "",
            widthInPercent: 15,
            cellRender: (param, row) => (row.betType === 1 ? "Lay" : "Back"),
          },
          {
            param: "",
            widthInPercent: 30,
            cellRender: (param, row) => row.gameCode || "-",
          },
          {
            param: "",
            widthInPercent: 30,
            cellRender: (param, row) => (row.stakeAmount / cFactor).toFixed(2),
          },
        ]);

        // Mobile lower row for casino
        setLowerRow([
          {
            param: "",
            widthInPercent: 50,
            cellRender: (param, row) => (
              <div className="acnt-statement-row-cell lower-row">
                <span className="mob-key">{langData?.["game_id"]} : </span>
                <span className="mob-value">{row.gameId}</span>
              </div>
            ),
          },
          {
            param: "",
            widthInPercent: 50,
            cellRender: (param, row) => (
              <div className="acnt-statement-row-cell lower-row">
                <span className="mob-key">{langData?.["place_date"]} : </span>
                <span className="mob-value">
                  {moment(row.transactionTime).format("YYYY-MM-DD HH:mm")}
                </span>
              </div>
            ),
          },
        ]);
      } else if ([19, 20, 21].includes(+row.transactionType)) {
        // For casino settlement transactions, still use the API call
        // This will be handled by the fetchData function
        setSubHeaderParams(subHeaderParams1);
      } else if (![0, 1, 2, 3, 48].includes(+row.transactionType)) {
        // Sports transaction headers for inline sub-table
        setSubHeaderParams(subHeaderParams1);
      } else {
        // Deposit/withdrawal transaction headers for inline sub-table
        setSubHeaderParams(subHeaderParams2);
      }
    }

    setRecords(recordsReplica);
  };

  useEffect(() => {
    fetchRecords();
  }, [filters, bettingCurrency, sortDesc]);

  useEffect(() => {
    // Only call fetchData for non-casino transactions
    if (
      transactionDetails &&
      transactionDetails.marketType !== 4 &&
      transactionDetails.marketType !== 6
    ) {
      fetchData();
    }
  }, [transactionDetails]);

  const nextPage = () => {
    if (nextPageToken) {
      setFilters({
        ...filters,
        pageToken: [...filters.pageToken, nextPageToken],
      });
    }
    setNextPageToken(null);
  };

  const prevPage = () => {
    if (filters.pageToken.length > 0) {
      let pagetokens = filters.pageToken;
      pagetokens.pop();
      setFilters({ ...filters, pageToken: [...pagetokens] });
    }
    setNextPageToken(null);
  };

  return (
    <div className=" acc-stmt-ctn">
      <ReportBackBtn back={langData?.["back"]} />
      <IonRow className="as-ctn">
        <ReportsHeader
          titleIcon={AccountStatement}
          reportName={langData?.["account_statement"]}
          reportFilters={[
            {
              element: (
                <SelectTemplate
                  label={langData?.["transaction_type"]}
                  list={TransactionFilters}
                  value={filters.transaction}
                  onChange={transactionChangeHandler}
                />
              ),
              fullWidthInMob: true,
            },
            {
              element: (
                <DateTemplate
                  value={filters.fromDate}
                  label={langData?.["from"]}
                  onChange={fromDateChangeHandler}
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
                  onChange={toDateChangeHandler}
                  minDate={filters.fromDate}
                  maxDate={filters.toDate}
                />
              ),
            },
          ]}
        />
        <IonCol className="mob-px-0">
          <div className="">
            {loading ? (
              <Spinner />
            ) : (
              <>
                {/* <AccStmtTableMob
                  mobHeaderParams={mobHeaderParams}
                  records={records}
                  setShowTransactionDetailsModal={(row) => {
                    onShowTransactionDetails(row);
                  }}
                  tranxDetails={transactionDetails}
                  langData={langData}
                /> */}
                <div>
                  <CustomTable
                    // className="web-view"
                    headerParams={headerParams}
                    bodyData={records}
                    noDataMessage={langData?.["no_transactions_txt"]}
                    // subHeaderParams={subHeaderParams}
                    // subBodyData={subBodyData}
                    subHeadClassName="wct-sh"
                    subTableNoDataMessage={
                      langData?.["no_txns_for_selected_criteria_txt"]
                    }
                    langData={langData}
                  />
                </div>
                <IonRow className="as-pagination">
                  {filters.pageToken.length > 0 && !loading && (
                    <button className="as-page-btn" onClick={(e) => prevPage()}>
                      ({langData?.["prev"]})({filters.pageToken.length})
                    </button>
                  )}
                  {nextPageToken && !loading ? (
                    <button className="as-page-btn" onClick={(e) => nextPage()}>
                      ({langData?.["next"]})({filters.pageToken.length + 2})
                    </button>
                  ) : null}
                </IonRow>
              </>
            )}
          </div>
        </IonCol>
      </IonRow>
      <Modal
        open={showTransactionDetailsModal}
        closeHandler={() => onShowTransactionDetails(transactionDetails)}
        title={
          transactionDetails &&
          (transactionDetails.marketType === 4 ||
            transactionDetails.marketType === 6 ||
            ![0, 1, 2, 3, 48].includes(+transactionDetails.transactionType))
            ? langData?.["bet_history"] || "Bet History"
            : langData?.["account_statement"]
        }
        size="sm"
        customClass="acc-statement-modal transaction-details-card-modal"
      >
        <TransactionDetailsCard
          transactionDetails={transactionDetails}
          subBodyData={subBodyData}
          langData={langData}
        />
      </Modal>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    bettingCurrency: state.common.bettingCurrency,
    langData: state.common.langData,
    domainConfig: state.common.domainConfig,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    logout: () => dispatch(logout()),
    fetchBettingCurrency: () => dispatch(fetchBettingCurrency()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Ledger);
