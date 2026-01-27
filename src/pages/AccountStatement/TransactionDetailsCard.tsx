import React from "react";
import moment from "moment";
import { LedgerRecord } from "../../models/LedgerRecord";
import { CURRENCY_TYPE_FACTOR } from "../../constants/CurrencyTypeFactor";
import { getCurrencyTypeFromToken } from "../../store";
import { getTransactionNameByID, OutcomeDescMap } from "../../util/stringUtil";
import "./TransactionDetailsCard.scss";

interface TransactionDetailsCardProps {
  transactionDetails: LedgerRecord;
  subBodyData: any[];
  langData: any;
}

const TransactionDetailsCard: React.FC<TransactionDetailsCardProps> = ({
  transactionDetails,
  subBodyData,
  langData,
}) => {
  const cFactor = CURRENCY_TYPE_FACTOR[getCurrencyTypeFromToken()];

  if (!transactionDetails) return null;

  // Helper functions to format different types of data
  const formatAmount = (amount: number) => {
    return amount ? (Math.abs(amount) / cFactor).toFixed(2) : "0.00";
  };

  const formatBetType = (betType: number) => {
    return betType === 0 ? "Back" : betType === 1 ? "Lay" : "-";
  };

  const formatRate = (row: any) => {
    return row.odd_value && row.odd_value !== -1.0
      ? row.market_type === 2
        ? `${row?.outcome_name?.split(" ")[1]} / ${(
            (row?.odd_value - 1) *
            100
          )?.toFixed(2)}`
        : row.market_type === 1
        ? (row.odd_value * 100 - 100).toFixed(2)
        : row.market_type === 5
        ? (2).toFixed(2)
        : row.odd_value.toFixed(2)
      : "-";
  };

  const formatProfitLoss = (amount: number) => {
    const formattedAmount = (amount / cFactor).toFixed(2);
    return amount >= 0 ? `+${formattedAmount}` : formattedAmount;
  };

  const getMarketName = (row: any) => {
    // For casino transactions, show game code or market ID
    if (row.marketType === 4 || row.marketType === 6) {
      return row.gameCode || row.marketId || "-";
    }
    return row.market_name || row.marketName || row.marketId || "-";
  };

  const getOutcomeName = (row: any) => {
    return row.outcome_name || row.outcomeName || row.outcomeId || "-";
  };

  const isStandardSportsBet = () => {
    return (
      ![0, 1, 2, 3, 48].includes(+transactionDetails.transactionType) &&
      ![4, 6].includes(transactionDetails.marketType)
    );
  };

  const isCasinoTransaction = () => {
    return (
      [4, 6].includes(transactionDetails.marketType) ||
      [19, 20, 21].includes(+transactionDetails.transactionType)
    );
  };

  const isDepositWithdrawal = () => {
    return [0, 1, 2, 3, 48].includes(+transactionDetails.transactionType);
  };

  // Render the main event header
  const renderEventHeader = () => (
    <div className="transaction-card-header">
      <h3 className="event-title">
        {transactionDetails.eventName || "Transaction Details"}
      </h3>
    </div>
  );

  // Render sports bet details
  const renderSportsBetDetails = () => {
    if (!subBodyData || subBodyData.length === 0) return null;

    return (
      <div className="bet-details-section">
        <div className="bet-details-header">
          <div className="bet-header-grid">
            <div className="header-cell">Bet on</div>
            <div className="header-cell">Rate</div>
            <div className="header-cell">Amount</div>
            <div className="header-cell">W&L</div>
          </div>
        </div>

        {subBodyData.map((row, index) => (
          <div
            key={index}
            className={
              row?.bet_type === 0
                ? "bet-row back-bet-row"
                : row?.bet_type === 1
                ? "bet-row lay-bet-row"
                : "bet-row"
            }
          >
            <div className="bet-row-grid">
              <div className="bet-selection">
                {getOutcomeName(row)} - {getMarketName(row)}
                <div className="bet-side">{formatBetType(row.bet_type)}</div>
              </div>
              <div className="rate-value">{formatRate(row)}</div>
              <div className="amount-value">
                {formatAmount(row.stake_amount || row.stakeAmount || 0)}
              </div>
              <div
                className={`wl-value ${
                  (row.profit_amount || row.profitAmount || 0) >= 0
                    ? "profit"
                    : "loss"
                }`}
              >
                {formatProfitLoss(row.profit_amount || row.profitAmount || 0)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render casino transaction details
  const renderCasinoDetails = () => {
    if (!transactionDetails?.betId) return null;

    return (
      <div className="casino-details-section">
        <div className="casino-header">Casino Transaction Details</div>
        <div className="casino-row">
          <div className="casino-grid">
            <div className="casino-field">
              <span className="field-label">Round ID:</span>
              <span className="field-value">
                {transactionDetails?.sportId ||
                  transactionDetails?.sport_id ||
                  "-"}
              </span>
            </div>
            <div className="casino-field">
              <span className="field-label">Side:</span>
              <span className="field-value">
                {transactionDetails?.betType === 1 ? "Lay" : "Back"}
              </span>
            </div>
            <div className="casino-field">
              <span className="field-label">Game ID:</span>
              <span className="field-value">
                {transactionDetails?.eventId ||
                  transactionDetails?.event_id ||
                  "-"}
              </span>
            </div>
            <div className="casino-field">
              <span className="field-label">Game Code:</span>
              <span className="field-value">
                {transactionDetails?.gameCode ||
                  transactionDetails?.game_code ||
                  "-"}
              </span>
            </div>
            <div className="casino-field">
              <span className="field-label">Amount:</span>
              <span
                className={`field-value ${
                  transactionDetails?.amount >= 0 ? "profit" : "loss"
                }`}
              >
                {formatProfitLoss(transactionDetails?.amount || 0)}
              </span>
            </div>
            <div className="casino-field">
              <span className="field-label">Placed Date:</span>
              <span className="field-value">
                {moment(
                  transactionDetails?.transactionTime ||
                    transactionDetails?.transaction_time
                ).format("DD/MM/YYYY HH:mm:ss")}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render deposit/withdrawal details
  const renderDepositWithdrawalDetails = () => {
    if (!subBodyData || subBodyData.length === 0) return null;
    console.log(subBodyData);

    return (
      <div className="deposit-details-section">
        {subBodyData.map((row, index) => (
          <div key={index} className="deposit-row">
            <div className="deposit-grid">
              <div className="deposit-field">
                <span className="field-label">Date:</span>
                <span className="field-value">
                  {moment(row?.transaction_time).format("DD/MM/YYYY HH:mm:ss")}
                </span>
              </div>
              <div className="deposit-field">
                <span className="field-label">Transaction:</span>
                <span className="field-value">
                  {getTransactionNameByID(transactionDetails?.transactionType)}
                </span>
              </div>
              <div className="deposit-field">
                <span className="field-label">Balance Before:</span>
                <span className="field-value">
                  {row?.balance_before?.toFixed(2) || "-"}
                </span>
              </div>
              <div className="deposit-field">
                <span className="field-label">Balance After:</span>
                <span className="field-value">
                  {row?.balance_after?.toFixed(2) || "-"}
                </span>
              </div>
              <div className="deposit-field">
                <span className="field-label">Amount:</span>
                <span className="field-value">
                  {row?.profit_amount?.toFixed(2) || "-"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render additional information
  const renderAdditionalInfo = () => {
    const hasSubData = subBodyData && subBodyData.length > 0;

    // Find the row from subBodyData that matches the transactionId
    const matchedRow =
      hasSubData && transactionDetails.transactionId
        ? subBodyData.find(
            (row) => row.transactionId === transactionDetails.transactionId
          )
        : null;

    const referenceRow = hasSubData ? subBodyData[0] : transactionDetails;
    const placeDateRow = matchedRow || referenceRow;

    return (
      <div className="additional-info-section">
        <div className="info-grid">
          <div className="info-row">
            <span className="info-label">Nation:</span>
            <span className="info-value">
              {getMarketName(referenceRow)}{" "}
              {referenceRow.outcomeName ? `- ${referenceRow.outcomeName}` : ""}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Place Date:</span>
            <span className="info-value">
              {moment(
                placeDateRow.transactionTime ||
                  placeDateRow.transaction_time ||
                  transactionDetails.transactionTime
              ).format("DD/MM/YYYY HH:mm:ss")}
            </span>
          </div>

          <div className="info-row">
            <span className="info-label">Settled Time:</span>
            <span className="info-value">
              {moment(
                referenceRow.transactionTime ||
                  transactionDetails.transactionTime
              ).format("DD/MM/YYYY HH:mm:ss")}
            </span>
          </div>

          {referenceRow.betResult !== undefined && (
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span className="info-value">
                {OutcomeDescMap[referenceRow.betResult] || "-"}
              </span>
            </div>
          )}

          {/* {transactionDetails.transactionId && (
            <div className="info-row">
              <span className="info-label">Transaction ID:</span>
              <span className="info-value">{transactionDetails.transactionId}</span>
            </div>
          )} */}
        </div>
      </div>
    );
  };

  return (
    <div className="transaction-details-card">
      {renderEventHeader()}

      {isStandardSportsBet() && renderSportsBetDetails()}
      {isCasinoTransaction() && renderCasinoDetails()}
      {isDepositWithdrawal() && renderDepositWithdrawalDetails()}

      {renderAdditionalInfo()}
    </div>
  );
};

export default TransactionDetailsCard;
