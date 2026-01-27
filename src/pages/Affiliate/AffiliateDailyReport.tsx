import { IonCol, IonRow } from "@ionic/react";
import React, { useEffect, useState } from "react";
import Spinner from "../../components/Spinner/Spinner";
import DateTemplate from "../../common/DateAndTimeTemplate/DateAndTimeTemplate";
import "./AffiliateDailyReport.scss";
import moment, { Moment } from "moment";
import { AffiliateDailyReportRecord } from "../../models/AffiliateDailyReportRecord";
import CustomTable from "../../common/CustomTable/CustomTable";
import CustomTableMob, {
  HeaderParamsType,
  RowType,
} from "../../common/CustomTableMob/CustomTableMob";
import SVLS_API from "../../svls-api";
type DailyReportProps = {
  langData: any;
};

type Filters = {
  fromDate: any;
  toDate: any;
  pageToken: string[];
};

const AffiliateDailyReport: React.FC<DailyReportProps> = (props) => {
  const { langData } = props;

  const defaultFilters: Filters = {
    fromDate: moment().subtract(7, "d"),
    toDate: moment(),
    pageToken: [],
  };

  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [nextPageToken, setNextPageToken] = useState<string>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<AffiliateDailyReportRecord[]>();

  const pageSize = 25;

  const fromDateChangeHandler = (d: Moment) => {
    setFilters({ ...filters, fromDate: d, pageToken: [] });
    setNextPageToken(null);
  };

  const toDateChangeHandler = (d: Moment) => {
    setFilters({ ...filters, toDate: d, pageToken: [] });
    setNextPageToken(null);
  };

  function dateCellRender(param, row) {
    return (
      <div className="aff-date-param">
        {moment(row.date).format("DD-MM-YY")}
      </div>
    );
  }

  function depositsCellRender(param, row) {
    return (
      <div className="afiliate-row-cell">
        {row.firstDeposits ? row.firstDeposits : "-"}
      </div>
    );
  }

  function depositsAmountCellRender(param, row) {
    return (
      <div className="afiliate-row-cell">
        {row.firstDepositAmount ? row.firstDepositAmount : "-"}
      </div>
    );
  }

  function eleigibleDepositsCellrender(param, row) {
    return (
      <div className="afiliate-row-cell">
        {row.commissionEligibleFirstDeposits
          ? row.commissionEligibleFirstDeposits
          : "-"}
      </div>
    );
  }

  function eleigibleDepositAmountCellrender(param, row) {
    return (
      <div className="afiliate-row-cell">
        {row.commissionEligibleFirstDepositsAmount
          ? row.commissionEligibleFirstDepositsAmount
          : "-"}
      </div>
    );
  }

  function commissionCellRender(param, row) {
    return (
      <div className="afiliate-row-cell">
        {row.ftdCommission ? row.ftdCommission : "-"}
      </div>
    );
  }

  function addedCommissionCellRender(param, row) {
    return (
      <div className="afiliate-row-cell">
        {row.commissionTransferred ? "Yes" : "No"}
      </div>
    );
  }

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await SVLS_API.get(
        "/marketing/v1/affiliate-accounts/daily",
        {
          headers: {
            Authorization: sessionStorage.getItem("jwt_token"),
            Accept: "application/json",
          },
          params: {
            reportType: "USER",
            startDate: filters.fromDate.startOf("day").toISOString(),
            endDate: filters.toDate.endOf("day").toISOString(),
            pageSize: pageSize,
            pageToken: filters.pageToken[filters.pageToken.length - 1],
          },
        }
      );

      console.log("response is", response);
      setRecords(response.data.day_wise_entries);
      setNextPageToken(
        response.data.next_page_token ? response.data.next_page_token : null
      );
    } catch (error) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
  }, [filters]);

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

  const headerParams = [
    {
      label: "DATE",
      langKey: "date_caps",
      param: "",
      cellRender: dateCellRender,
      widthInPercent: 10,
    },
    {
      label: "FTD",
      langKey: "ftd",
      param: "",
      cellRender: depositsCellRender,
      widthInPercent: 15,
    },
    {
      label: "FTD amount",
      langKey: "ftd_amount",
      param: "",
      cellRender: depositsAmountCellRender,
      widthInPercent: 15,
    },
    {
      label: "Eligible  FTD",
      langKey: "eligible_ftd",
      param: "",
      cellRender: eleigibleDepositsCellrender,
      widthInPercent: 15,
    },
    {
      label: "Eligible  FTD amount",
      langKey: "eligible_ftd_amount",
      param: "",
      cellRender: eleigibleDepositAmountCellrender,
      widthInPercent: 15,
    },
    {
      label: "Commision",
      langKey: "commission",
      param: "",
      cellRender: commissionCellRender,
      widthInPercent: 15,
    },
    {
      label: "Commission redeemed",
      langKey: "commission_redeemed",
      param: "",
      cellRender: addedCommissionCellRender,
      widthInPercent: 15,
    },
  ];

  const mobHeaderParams: HeaderParamsType[] = [
    { label: "Date", langKey: "date", param: "", widthInPercent: 15 },
    { label: "FTD", langKey: "ftd", param: "", widthInPercent: 10 },
    {
      label: "FTD amount",
      langKey: "ftd_amount",
      param: "",
      widthInPercent: 25,
    },
    {
      label: "Eligible FTD",
      langKey: "eligible_ftd",
      param: "",
      widthInPercent: 25,
    },
    {
      label: "Commission",
      langKey: "commission",
      param: "",
      widthInPercent: 25,
    },
  ];

  const upperRow: RowType[] = [
    {
      param: "",
      widthInPercent: 20,
      cellRender: dateCellRender,
    },
    {
      param: "",
      widthInPercent: 10,
      cellRender: depositsCellRender,
    },
    {
      param: "",
      widthInPercent: 25,
      cellRender: depositsAmountCellRender,
    },
    {
      param: "",
      widthInPercent: 25,
      cellRender: eleigibleDepositsCellrender,
    },
    {
      param: "",
      widthInPercent: 25,
      cellRender: commissionCellRender,
    },
  ];

  const lowerRow: RowType[] = [
    {
      param: "",
      widthInPercent: 50,
      cellRender: (headerParam, row) => (
        <div className="afiliate-row-cell lower-row">
          <span className="mob-key">
            {langData?.["eligible_ftd_amount"]} :{" "}
          </span>
          <span className="mob-value">
            {row.commissionEligibleFirstDepositsAmount
              ? row.commissionEligibleFirstDepositsAmount
              : "-"}
          </span>
        </div>
      ),
    },
    {
      param: "",
      widthInPercent: 50,
      cellRender: (headerParam, row) => (
        <div className="afiliate-row-cell lower-row">
          <span className="mob-key">
            {langData?.["commission_redeemed"]} :{" "}
          </span>
          <span className="mob-value">
            {row.commissionTransferred ? langData?.["yes"] : langData?.["no"]}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="affiliate-daily-report">
      <IonRow className="aff-dr-ctn">
        <div className="date-filters">
          <DateTemplate
            value={filters.fromDate}
            label={langData?.["from"]}
            onChange={fromDateChangeHandler}
            minDate={moment().subtract(1, "months").calendar()}
            maxDate={filters.toDate}
          />
          <DateTemplate
            value={filters.toDate}
            label={langData?.["to"]}
            onChange={toDateChangeHandler}
            minDate={filters.fromDate}
            maxDate={moment().calendar()}
          />
        </div>
        <IonCol>
          <div className="affiliate-data">
            {loading ? (
              <Spinner></Spinner>
            ) : (
              <>
                <CustomTableMob
                  headerParams={mobHeaderParams}
                  upperRow={upperRow}
                  lowerRow={lowerRow}
                  bodyData={records}
                  langData={langData}
                />

                <CustomTable
                  className="web-view"
                  headerParams={headerParams}
                  bodyData={records}
                  noDataMessage={langData?.["data_not_found_txt"]}
                  langData={langData}
                />

                <IonRow className="aff-pagination">
                  {filters.pageToken.length > 0 && !loading && (
                    <button
                      className="aff-page-btn"
                      onClick={(e) => prevPage()}
                    >
                      ({langData?.["prev"]})({filters.pageToken.length})
                    </button>
                  )}
                  {nextPageToken && !loading ? (
                    <button
                      className="aff-page-btn"
                      onClick={(e) => nextPage()}
                    >
                      ({langData?.["next"]})({filters.pageToken.length + 2})
                    </button>
                  ) : null}
                </IonRow>
              </>
            )}
          </div>
        </IonCol>
      </IonRow>
    </div>
  );
};

export default AffiliateDailyReport;
