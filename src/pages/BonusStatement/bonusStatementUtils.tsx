import React from "react";
import {
  HeaderParamsType,
  RowType,
} from "../../common/CustomTableMob/CustomTableMob";
import moment from "moment";

const widths = {
  cellOne: 45,
  cellTwo: 25,
  cellThree: 30,
};

export const headerParams: HeaderParamsType[] = [
  {
    label: "Bonus type",
    langKey: "bonus_type",
    param: "",
    widthInPercent: widths.cellOne,
  },
  {
    label: "R. amount",
    langKey: "redeemed_amount_short",
    param: "",
    widthInPercent: widths.cellTwo,
  },
  {
    label: "Last R. date",
    langKey: "last_redeemed_date_short",
    param: "",
    widthInPercent: widths.cellThree,
  },
];

export const upperRow: RowType[] = [
  {
    param: "",
    widthInPercent: widths.cellOne,
    cellRender: (headerParam, row) => (
      <div className="bonus-statement-mob-cell">
        <div className="b-text m-link">{row.bonus_category}</div>
        <div>
          <span className="key-text">Awarded: </span>
          <span className="key-text-value">
            {moment(row.award_date).format("DD/MM/YYYY, h:mm:ss")}
          </span>
        </div>
      </div>
    ),
  },
  {
    param: "",
    widthInPercent: widths.cellTwo,
    cellRender: (headerParam, row) => (
      <div className="bonus-statement-mob-cell award-amt">
        {row?.award_amount?.toFixed(2)}
      </div>
    ),
  },
  {
    param: "",
    widthInPercent: widths.cellThree,
    cellRender: (headerParam, row) => (
      <div className="bonus-statement-mob-cell">
        <div className="last-date-text">
          {row.last_redeem_date
            ? moment(row.last_redeem_date).format("DD/MM/YYYY, h:mm:ss A")
            : "-"}
        </div>
      </div>
    ),
  },
];

export const lowerRow: RowType[] = [
  {
    param: "",
    widthInPercent: 50,
    cellRender: (headerParam, row) => (
      <div className="bonus-statement-mob-cell">
        <div>
          <span className="key-text">Approval Req. : </span>
          <span className="key-text-value">
            {row.approval_required ? "Yes" : "No"}
          </span>
        </div>

        <div>
          <span className="key-text">Installment: </span>
          <span className="key-text-value">
            {(row.installments_given ? row.installments_given : "-") +
              "/" +
              (row.installments ? row.installments : "-")}
          </span>
        </div>

        <div>
          <span className="key-text">Status: </span>
          <span className="key-text-value">
            {row.bonus_status ? row.bonus_status : "-"}
          </span>
        </div>
      </div>
    ),
  },
  {
    param: "",
    widthInPercent: 50,
    cellRender: (headerParam, row) => (
      <div className="bonus-statement-mob-cell">
        <div>
          <span className="key-text">Turnover: </span>
          <span className="key-text-value">
            {(row.turnover_met ? row.turnover_met : "-") +
              "/" +
              (row.turnover_required ? row.turnover_required : "-")}
          </span>
        </div>

        <div>
          <span className="key-text">Awarded Amt: </span>
          <span className="key-text-value">
            {row?.award_amount?.toFixed(2)}
          </span>
        </div>

        <div>
          <span className="key-text">Expiry Date: </span>
          <span className="key-text-value">
            {row.expiry_date
              ? moment(row.expiry_date).format("DD/MM/YYYY, h:mm:ss A")
              : "-"}
          </span>
        </div>
      </div>
    ),
  },
];
