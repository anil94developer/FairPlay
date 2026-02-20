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
import Modal from "../../components/Modal/Modal";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { getCurrencyTypeFromToken } from "../../store";
import "./DepositTurnoverReport.scss";
import { connect, useDispatch } from "react-redux";
import { RootState } from "../../models/RootState";
import USABET_API from "../../api-services/usabet-api";
import { setAlertMsg } from "../../store/common/commonActions";
import { WalletSummaryItemDTO } from "../../models/deposit";

type Filters = {
  dateFrom: Moment;
  dateTo: Moment;
  pageToken: string[];
  status: string;
};

const DepositTurnoverReport: React.FC<{
  langData: any;
  userProfileId?: string | null;
}> = (props) => {
  const { langData, userProfileId } = props;
  const dispatch = useDispatch();
  const defaultFilters: Filters = {
    dateFrom: moment().subtract(7, "d"),
    dateTo: moment(),
    pageToken: [],
    status: "ALL",
  };
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 720);

  const [deposits, setDeposits] = useState<WalletSummaryItemDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const pageSize = 25;
  const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];

  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);

  const fetchData = async () => {
   
    setLoading(true);
    try {
      const userId =sessionStorage.getItem("aid");

      
      const res = await USABET_API.post("/wallet/getwalletsummary", {
        user_id: userId,
        from_date: filters.dateFrom.format("YYYY-MM-DD"),
        to_date: filters.dateTo.format("YYYY-MM-DD"),
      });

      if (res?.data?.status && res?.data?.data?.getData) {
        let items: WalletSummaryItemDTO[] = res.data.data.getData;

        // Filter only deposit requests
        items = items.filter(
          (item) => item.statement_type === "DEPOSIT_REQUEST"
        );

        // Filter by status
        if (filters.status !== "ALL") {
          items = items.filter((item) => item.status === filters.status);
        }

        // Client-side pagination
        const currentPage = filters.pageToken.length;
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = items.slice(startIndex, endIndex);
        const hasNextPage = endIndex < items.length;

        setNextPageToken(hasNextPage ? `page_${currentPage + 1}` : null);
        setDeposits(paginatedData);
      } else {
        setDeposits([]);
      }
    } catch (err: any) {
      console.error("[DepositTurnoverReport] fetchData error:", err);
      setDeposits([]);
      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
        err?.message;
      if (msg) {
        dispatch(
          setAlertMsg({
            type: "error",
            message: msg,
          })
        );
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [filters.dateFrom, filters.dateTo, filters.status, filters.pageToken]);

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
      const pagetokens = [...filters.pageToken];
      pagetokens.pop();
      setFilters({
        ...filters,
        pageToken: pagetokens,
      });
      setNextPageToken(null);
    }
  };

  const handleStartDateChange = (d: Moment) => {
    setFilters({ ...filters, pageToken: [], dateFrom: d });
    setNextPageToken(null);
  };

  const handleEndDateChange = (d: Moment) => {
    setFilters({ ...filters, pageToken: [], dateTo: d });
    setNextPageToken(null);
  };

  const handleStatusChange = (value: string) => {
    setFilters({ ...filters, pageToken: [], status: value || "ALL" });
    setNextPageToken(null);
  };

  const getPaymentMethod = (row: WalletSummaryItemDTO) => {
    const pd = row.payment_deatails?.[0];
    if (!pd) return "-";
    return pd.method_name || pd.bank_holder_name || "-";
  };

  const TransactionFilters = [
    { value: "ALL", name: langData?.["all"] || "All" },
    { value: "PENDING", name: langData?.["pending"] || "Pending" },
    { value: "ACCEPTED", name: langData?.["accepted"] || "Accepted" },
    { value: "REJECTED", name: langData?.["rejected"] || "Rejected" },
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
          reportName={langData?.["deposit_turnover"] || "Deposit List"}
          reportFilters={[
            {
              element: (
                <SelectTemplate
                  label={langData?.["status"] || "Status"}
                  list={TransactionFilters}
                  value={filters.status}
                  onChange={(e) =>
                    handleStatusChange(e?.target?.value ?? "ALL")
                  }
                  placeholder={langData?.["select_one"] || "Select"}
                />
              ),
              fullWidthInMob: true,
            },
            {
              element: (
                <DateTemplate
                  value={filters.dateFrom}
                  label={langData?.["from"] || "From"}
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
                  label={langData?.["to"] || "To"}
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
                        <div className="tbl-ctn my-bets-tbl no-hov-style web-view">
                          <TableContainer component={Paper}>
                            <Table className="myb-table" size="small">
                              <TableHead className="myb-table-header">
                                <TableRow>
                                  <TableCell
                                    align="left"
                                    className="th-col bonus-type-cell"
                                  >
                                    {langData?.["transaction_time"] ||
                                      "Transaction Time"}
                                  </TableCell>
                                  <TableCell
                                    align="left"
                                    className="th-col approval-req-cell"
                                  >
                                    {langData?.["amount"] || "Amount"}
                                  </TableCell>
                                  <TableCell
                                    align="left"
                                    className="th-col awarded-date-cell"
                                  >
                                    {langData?.["reference_no"] ||
                                      "Reference No"}
                                  </TableCell>
                                  <TableCell
                                    align="left"
                                    className="th-col turnover-cell"
                                  >
                                    {langData?.["description"] ||
                                      "Description"}
                                  </TableCell>
                                  <TableCell
                                    align="left"
                                    className="th-col turnover-cell"
                                  >
                                    {langData?.["payment_method"] ||
                                      "Payment Method"}
                                  </TableCell>
                                  <TableCell
                                    align="center"
                                    className="th-col status-cell"
                                  >
                                    {langData?.["status"] || "Status"}
                                  </TableCell>
                                  <TableCell
                                    align="left"
                                    className="th-col last-date-cell"
                                  >
                                    {langData?.["image"] || "Image"}
                                  </TableCell>
                                </TableRow>
                              </TableHead>

                              {deposits?.length > 0 ? (
                                <TableBody className="myb-table-body">
                                  {deposits.map((row, idx) => (
                                    <TableRow key={`row-${row._id}-${idx}`}>
                                      <TableCell>
                                        <div className="b-text m-link">
                                          {row.generated_at
                                            ? moment(
                                                row.generated_at
                                              ).format("DD/MM/YYYY, h:mm:ss A")
                                            : "-"}
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {row.amount != null
                                          ? (row.amount * cFactor).toFixed(2)
                                          : "-"}
                                      </TableCell>
                                      <TableCell>
                                        {row.payment_deatails?.[0]?._id || "-"}
                                      </TableCell>
                                      <TableCell>
                                        {row.remark || "-"}
                                      </TableCell>
                                      <TableCell>
                                        {getPaymentMethod(row)}
                                      </TableCell>
                                      <TableCell align="center">
                                        {row.status}
                                      </TableCell>
                                      <TableCell>
                                        {row.images ? (
                                          <button
                                            type="button"
                                            onClick={() => setImageModalUrl(row.images)}
                                            className="deposit-image-link"
                                          >
                                           <img src={row.images} alt="Deposit" style={{ width: "20px", height: "20px" }} />
                                          </button>
                                        ) : (
                                          "-"
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              ) : (
                                <TableBody>
                                  <TableRow>
                                    <TableCell
                                      className="no-data-row"
                                      colSpan={7}
                                    >
                                      <div>
                                        {langData?.["no_data_found"] ||
                                          "No data found"}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              )}
                            </Table>
                          </TableContainer>
                        </div>
                        <IonRow>
                          {filters.pageToken.length > 0 && !loading && (
                            <IonButton
                              className="myb-btn-prev"
                              onClick={prevPage}
                            >
                              {langData?.["prev"] || "Prev"} (
                              {filters.pageToken.length})
                            </IonButton>
                          )}
                          {nextPageToken && !loading ? (
                            <IonButton
                              className="myb-btn-next"
                              onClick={nextPage}
                            >
                              {langData?.["next"] || "Next"} (
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
      <Modal
        open={!!imageModalUrl}
        closeHandler={() => setImageModalUrl(null)}
        title={langData?.["view"] || "View"}
        size="sm"
        customClass="deposit-turnover-image-modal"
      >
        {imageModalUrl && (
          <div className="deposit-turnover-image-modal-content">
            <img
              src={imageModalUrl}
              alt="Deposit"
              style={{ maxWidth: "100%", height: "auto", display: "block" }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    langData: state.common.langData,
    userProfileId: state.auth.userProfile?._id ?? null,
  };
};

export default connect(mapStateToProps, null)(DepositTurnoverReport);
