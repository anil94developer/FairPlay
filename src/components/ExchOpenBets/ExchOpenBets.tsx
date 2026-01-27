import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import React from "react";
import { connect } from "react-redux";
import { UserBet } from "../../models/UserBet";
import { RootState } from "../../models/RootState";
import "./ExchOpenBets.scss";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { getCurrencyTypeFromToken } from "../../store";

type StoreProps = {
  openBets: UserBet[];
};

const getDisplayName = (runnerName: string) => {
  let name =
    runnerName.split(":").length > 1
      ? runnerName.split(":")[1]
      : runnerName.split(":")[0];
  if (name.toLowerCase().includes("crudeoil")) return "CRUDE OIL";
  else if (name.toLowerCase().includes("gold")) return "GOLD";
  else if (name.toLowerCase().includes("silver")) return "SILVER";
  else if (name.toLowerCase().includes("banknifty")) return "BANK NIFTY";
  return name;
};

const ExchOpenBets: React.FC<StoreProps> = (props) => {
  const { openBets } = props;
  const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];

  // Group bets by betType
  const backBets = openBets.filter((bet) => bet.betType === "BACK");
  const layBets = openBets.filter((bet) => bet.betType === "LAY");

  const getBetDisplayName = (bet: UserBet) => {
    switch (bet.marketType) {
      // TODO: remove binary
      case "FANCY":
      case "BINARY":
        return (
          <div>
            <div style={{ fontWeight: "bolder" }}>
              {(bet.marketType === "BINARY"
                ? getDisplayName(bet.outcomeDesc)
                : bet.marketName) +
                " @ " +
                Number(bet.oddValue * 100 - 100).toFixed(0)}
            </div>
            <div>Fancy</div>
          </div>
        );
      case "BOOKMAKER":
        return (
          <div>
            <div style={{ fontWeight: "bolder" }}>{bet.outcomeDesc}</div>
            <div>
              {bet.marketName.toLowerCase().includes("toss")
                ? "Toss"
                : "Bookmaker"}
            </div>
          </div>
        );
      case "MATCH_ODDS": {
        if (bet.marketName === "Completed Match") {
          return (
            <div>
              <div style={{ fontWeight: "bolder" }}>{bet.outcomeDesc}</div>
              <div>Completed Match</div>
            </div>
          );
        } else if (bet.marketName === "Tied Match") {
          return (
            <div>
              <div style={{ fontWeight: "bolder" }}>{bet.outcomeDesc}</div>
              <div>Tied Match</div>
            </div>
          );
        } else if (bet?.marketName?.toLowerCase()?.includes("who will win")) {
          return (
            <div>
              <div style={{ fontWeight: "bolder" }}>{bet.outcomeDesc}</div>
              <div>Who will win the match?</div>
            </div>
          );
        } else {
          return (
            <div>
              <div style={{ fontWeight: "bolder" }}>{bet.outcomeDesc}</div>
              <div>Match Odds</div>
            </div>
          );
        }
      }
      default:
        return bet.marketName + " - " + bet.outcomeDesc;
    }
  };

  const getBetType = (bet: UserBet) => {
    return bet.betType === "BACK" ? (
      <span
        style={{
          borderRadius: "10px",
          padding: "3px 7px",
          border: "1px solid rgb(69 69 69)",
          fontWeight: "bolder",
          marginRight: "5px",
          background: "#7bbaf6",
        }}
      >
        {bet?.marketType === "FANCY" ? "YES" : "BACK"}
      </span>
    ) : (
      <span
        style={{
          borderRadius: "10px",
          padding: "3px 7px",
          border: "1px solid rgb(69 69 69)",
          fontWeight: "bolder",
          marginRight: "5px",
          background: "#f99ac2",
        }}
      >
        {bet?.marketType === "FANCY" ? "NO" : "LAY"}
      </span>
    );
  };

  const getBetOddValue = (bet: UserBet) => {
    return bet.marketType === "FANCY" || bet.marketType === "BINARY"
      ? Number(bet.sessionRuns).toFixed(0)
      : bet.marketType === "BOOKMAKER"
      ? Number(bet.oddValue * 100 - 100).toFixed(2)
      : Number(bet.oddValue);
  };

  const getProfitLoss = (bet: UserBet) => {
    return bet?.marketType === "MATCH_ODDS"
      ? bet?.betType === "BACK"
        ? (bet?.stakeAmount * (bet?.oddValue - 1)).toFixed(2)
        : bet?.stakeAmount.toFixed(2)
      : bet?.marketType === "BOOKMAKER"
      ? bet?.betType === "BACK"
        ? ((bet?.oddValue - 1) * bet?.stakeAmount).toFixed(2)
        : bet?.stakeAmount.toFixed(2)
      : bet?.marketType === "PREMIUM"
      ? (bet?.stakeAmount * (bet?.oddValue - 1)).toFixed(2)
      : bet?.betType === "BACK"
      ? ((bet?.oddValue - 1) * 100).toFixed(2)
      : bet?.stakeAmount.toFixed(2);
  };

  const getBetStakeAmount = (bet: UserBet) =>
    Number(bet.stakeAmount / cFactor).toFixed(2);

  const renderBetRows = (bets: UserBet[], betType: string) => {
    return bets.map((bet, idx) => (
      <TableRow
        key={`${betType}-row-${idx}`}
        className={`${betType.toLowerCase()}-bet open-bets-table-row`}
      >
        <TableCell
          key={`${betType}-market-cell-row-${idx}`}
          className={`${betType.toLowerCase()}-bet open-bets-table-row`}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {getBetType(bet)}
            {getBetDisplayName(bet)}
          </div>
        </TableCell>
        <TableCell
          key={`${betType}-odds-cell-row-${idx}`}
          align="right"
          className={`${betType.toLowerCase()}-bet open-bets-table-row`}
        >
          {getBetOddValue(bet)}
        </TableCell>
        <TableCell
          key={`${betType}-stake-cell-row-${idx}`}
          align="right"
          className={`${betType.toLowerCase()}-bet open-bets-table-row`}
        >
          {getBetStakeAmount(bet)}
        </TableCell>
        {/* <TableCell
          key={`${betType}-stake-cell-row-${idx}`}
          align="right"
          className={`${betType.toLowerCase()}-bet open-bets-table-row`}
        >
          {getProfitLoss(bet)}
        </TableCell> */}
      </TableRow>
    ));
  };

  return (
    <div className="open-bets-ctn open-bts-dup">
      {/* BACK Bets Table */}
      {backBets.length > 0 && (
        <div className="bet-section">
          <Table className="exch-open-bets-table">
            <TableHead className="open-bets-table-head">
              <TableRow className="open-bets-table-row">
                <TableCell className="market-cell">Back (Bet for)</TableCell>
                <TableCell className="odds-cell" align="right">
                  Odds
                </TableCell>
                <TableCell className="stake-cell" align="right">
                  Stake
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody className="open-bets-table-body">
              {renderBetRows(backBets, "BACK")}
            </TableBody>
          </Table>
        </div>
      )}

      {/* LAY Bets Table */}
      {layBets.length > 0 && (
        <div className="bet-section">
          <Table className="exch-open-bets-table">
            <TableHead className="open-bets-table-head">
              <TableRow className="open-bets-table-row">
                <TableCell className="market-cell">Lay (Bet against)</TableCell>
                <TableCell className="odds-cell" align="right">
                  Odds
                </TableCell>
                <TableCell className="stake-cell" align="right">
                  Stake
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody className="open-bets-table-body">
              {renderBetRows(layBets, "LAY")}
            </TableBody>
          </Table>
        </div>
      )}

      {/* No bets message */}
      {openBets.length === 0 && (
        <div className="no-bets-message">No open bets</div>
      )}
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    openBets: state.exchBetslip.openBets,
  };
};

export default connect(mapStateToProps)(ExchOpenBets);
