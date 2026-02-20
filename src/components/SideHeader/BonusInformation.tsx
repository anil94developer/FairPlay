import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import "./bonus.scss";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import USABET_API from "../../api-services/usabet-api";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { getCurrencyTypeFromToken } from "../../store";
import { RootState } from "../../models/RootState";
import Spinner from "../Spinner/Spinner";
import moment from "moment";

type LockedBonusItem = {
  _id: string;
  bonus_type: string;
  total_locked_bonus_amount: number;
  unlocked_bonus_amount: number;
  total_rolling_amount: number;
  used_rolling_amount: number;
  rolling_multiplier: number;
  status_str: string;
  is_expired: boolean;
  expire_at: string;
  created_at: string;
};

const formatBonusType = (bonusType: string): string => {
  if (!bonusType) return "-";
  if (bonusType === "EVERY_DEPOSIT_BONUS") return "Every Deposit Bonus";
  if (bonusType === "FIRST_DEPOSIT_BONUS") return "First Deposit Bonus";
  return bonusType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const BonusInformation = (props: { langData?: any }) => {
  const { langData } = props;
  const [open, setOpen] = useState(false);
  const [earnedBonus, setEarnedBonus] = useState<number>(0);
  const [lockedBonus, setLockedBonus] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [lockedBonusList, setLockedBonusList] = useState<LockedBonusItem[]>([]);
  const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];

  const fetchBonusAmounts = async () => {
    setLoading(true);
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
    } catch {
      setEarnedBonus(0);
      setLockedBonus(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchLockedBonusProgress = async () => {
    setModalLoading(true);
    try {
      const res = await USABET_API.post("/user/getLockedBonusProgress", {
        limit: 50,
        page: 1,
        status: "ALL",
      });
      if (res?.data?.status === true && Array.isArray(res?.data?.data)) {
        const list: LockedBonusItem[] = res.data.data.map((row: any) => ({
          _id: row._id,
          bonus_type: row.bonus_type,
          total_locked_bonus_amount: (row.total_locked_bonus_amount ?? 0) / cFactor,
          unlocked_bonus_amount: (row.unlocked_bonus_amount ?? 0) / cFactor,
          total_rolling_amount: (row.total_rolling_amount ?? 0) / cFactor,
          used_rolling_amount: (row.used_rolling_amount ?? 0) / cFactor,
          rolling_multiplier: row.rolling_multiplier ?? 0,
          status_str: row.status_str ?? "",
          is_expired: row.is_expired ?? false,
          expire_at: row.expire_at ?? "",
          created_at: row.created_at ?? "",
        }));
        setLockedBonusList(list);
      } else {
        setLockedBonusList([]);
      }
    } catch {
      setLockedBonusList([]);
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    fetchBonusAmounts();
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
    fetchLockedBonusProgress();
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <div
        className="bonus-information-container"
        style={{ backgroundColor: "#efefef" }}
      >
        <div className="header">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="bonusInformation"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M3 8m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z"></path>
            <path d="M12 8l0 13"></path>
            <path d="M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7"></path>
            <path d="M7.5 8a2.5 2.5 0 0 1 0 -5a4.8 8 0 0 1 4.5 5a4.8 8 0 0 1 4.5 -5a2.5 2.5 0 0 1 0 5"></path>
          </svg>
          <span className="title">Bonus Information</span>
        </div>
        <div className="stats-grid">
          {loading ? (
            <div className="stat-box full-width" style={{ padding: "8px" }}>
              <Spinner />
            </div>
          ) : (
            <>
              <div className="stat-box">
                <span className="label">
                  {langData?.["bonus_balance"] || "BONUS BALANCE"}
                </span>
                <span className="value ternary">
                  {earnedBonus.toFixed(2)}
                </span>
              </div>
              <div className="stat-box">
                <span className="label">
                  {langData?.["net_exposure"] || "NET EXPOSURE"}
                </span>
                <span className="value danger">0.00</span>
              </div>
              <div className="stat-box full-width">
                <button
                  className="bonus-btn"
                  type="button"
                  onClick={handleClickOpen}
                >
                  <span className="btn-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M3 8m0 1a1 1 0 0 1 1 -1h16a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1z"></path>
                      <path d="M12 8l0 13"></path>
                      <path d="M19 12v7a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-7"></path>
                      <path d="M7.5 8a2.5 2.5 0 0 1 0 -5a4.8 8 0 0 1 4.5 5a4.8 8 0 0 1 4.5 -5a2.5 2.5 0 0 1 0 5"></path>
                    </svg>
                    {langData?.["locked_bonus"] || "LOCKED BONUS"}: {lockedBonus.toFixed(2)}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{ className: "common-dialog-bg" }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title">
          {langData?.["locked_bonus"] || "Locked Bonus"}
        </DialogTitle>
        <DialogContent>
          <div className="bonus-content locked-bonus-modal-content">
            {modalLoading ? (
              <div style={{ padding: "24px", textAlign: "center" }}>
                <Spinner />
              </div>
            ) : lockedBonusList.length === 0 ? (
              <DialogContentText id="alert-dialog-description">
                {langData?.["no_locked_bonus_found_txt"] || "No Locked Bonus Found"}
              </DialogContentText>
            ) : (
              <TableContainer component={Paper} style={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>{langData?.["bonus_type"] || "Bonus Type"}</TableCell>
                      <TableCell align="right">{langData?.["amount"] || "Amount"}</TableCell>
                      <TableCell align="right">{langData?.["turnover"] || "Turnover"}</TableCell>
                      <TableCell>{langData?.["status"] || "Status"}</TableCell>
                      <TableCell>{langData?.["expires_on"] || "Expires On"}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lockedBonusList.map((row) => (
                      <TableRow key={row._id} style={{ backgroundColor: row.is_expired ? "#f0f0f0" : "white" }}>
                        <TableCell>{formatBonusType(row.bonus_type)}</TableCell>
                        <TableCell align="right">₹{row.total_locked_bonus_amount.toFixed(2)}</TableCell>
                        <TableCell align="right">
                          {row.rolling_multiplier}x ({row.used_rolling_amount.toFixed(0)} / {row.total_rolling_amount.toFixed(0)})
                        </TableCell>
                        <TableCell>{row.status_str || (row.is_expired ? "EXPIRED" : "IN_PROGRESS")}</TableCell>
                        <TableCell>
                          {row.expire_at ? moment(row.expire_at).format("DD/MM/YY HH:mm") : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" autoFocus>
            <svg
              height="24"
              width="24"
              fill="var(--color-quaternary)"
              aria-hidden="true"
              focusable="false"
              data-prefix="fad"
              data-icon="circle-xmark"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
            >
              <g className="fa-duotone-group">
                <path
                  fill="black"
                  d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"
                ></path>
                <path
                  fill="white"
                  d="M209 175c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47z"
                ></path>
              </g>
            </svg>
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const mapStateToProps = (state: RootState) => ({
  langData: state.common.langData,
});

export default connect(mapStateToProps, null)(BonusInformation);
