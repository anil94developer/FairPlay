import React from "react";
import "./CustomTableMob.scss";

export type HeaderParamsType = {
  label: string;
  langKey: string;
  param: string;
  widthInPercent?: number;
  cellRender?: Function;
};

export type RowType = {
  param: string;
  widthInPercent?: number;
  cellRender?: Function;
};

type Props = {
  headerParams: HeaderParamsType[];
  upperRow: RowType[];
  lowerRow: RowType[];
  bodyData: any;
  noDataMessage?: string;
  langData: string;
};

const CustomTableMob = (props: Props) => {
  const {
    headerParams,
    bodyData,
    noDataMessage,
    lowerRow,
    upperRow,
    langData,
  } = props;

  const cellData = (headerParam, row, idx) => {
    if (headerParam.cellRender) {
      return headerParam.cellRender(headerParam, row);
    } else {
      return row[headerParam.param] ? row[headerParam.param] : "-";
    }
  };

  return (
    <div className="mct-ctn mob-view">
      <div className="mct">
        <div className="mct-h">
          {headerParams.map((headerParam, idx) => {
            return (
              <div
                className={`mct-h-c${idx} mct-h-c`}
                style={{
                  width: headerParam.widthInPercent
                    ? headerParam.widthInPercent + "%"
                    : 100 / headerParams.length + "%",
                }}
              >
                {langData?.[headerParam.langKey]}
              </div>
            );
          })}
        </div>
        <div className="mct-b">
          {bodyData?.length > 0 ? (
            <>
              {bodyData.map((row, idx) => (
                <div
                  className={`mct-b-r ${
                    row.rowClassName ? row.rowClassName : ""
                  }`}
                >
                  {upperRow?.length > 0 && (
                    <div className="mct-b-sr1">
                      {upperRow.map((indv, idx) => (
                        <div
                          className={`mct-b-c mct-b-c${idx}`}
                          style={{
                            width: indv.widthInPercent
                              ? indv.widthInPercent + "%"
                              : 100 / upperRow.length + "%",
                          }}
                        >
                          {cellData(indv, row, idx)}
                        </div>
                      ))}
                    </div>
                  )}
                  {lowerRow?.length > 0 && (
                    <div className="mct-b-sr1">
                      {lowerRow.map((indv, idx) => (
                        <div
                          className={`mct-b-c mct-b-c${idx}`}
                          style={{
                            width: indv.widthInPercent
                              ? indv.widthInPercent + "%"
                              : 100 / lowerRow.length + "%",
                          }}
                        >
                          {cellData(indv, row, idx)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="mct-b-no-data">
              {noDataMessage
                ? noDataMessage
                : langData
                ? langData?.["data_not_available_txt"]
                : "-"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomTableMob;
