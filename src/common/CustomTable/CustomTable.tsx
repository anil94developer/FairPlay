import React from "react";
import "./CustomTable.scss";

type Props = {
  headerParams: any;
  bodyData: any;
  className?: string;
  noDataMessage?: string;
  subHeaderParams?: any;
  subBodyData?: any;
  headClassName?: string;
  subHeadClassName?: string;
  subRowClassName?: string;
  subTableNoDataMessage?: string;
  langData: any;
};

const CustomTable = (props: Props) => {
  const {
    headerParams,
    bodyData,
    className,
    noDataMessage,
    subHeaderParams,
    subBodyData,
    subHeadClassName,
    headClassName,
    subTableNoDataMessage,
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
    <div className={`wct-ctn ${className ? className : ""}`}>
      <div className="wct">
        <div className={`wct-h ${headClassName ? headClassName : ""}`}>
          {headerParams?.map((headerParam, idx) => {
            return (
              <div
                className={`wct-h-c${idx} wct-h-c`}
                style={{
                  width: headerParam.widthInPercent
                    ? headerParam.widthInPercent + "%"
                    : 100 / headerParams.length + "%",
                }}
              >
                {langData?.[headerParam.langKey] ?? headerParam.label}
              </div>
            );
          })}
        </div>
        <div className="wct-b">
          {bodyData?.length > 0 ? (
            <>
              {bodyData.map((row) => (
                <>
                  <div
                    className={`wct-r ${
                      row.rowClassName ? row.rowClassName : ""
                    }`}
                  >
                    {headerParams.map((headerParam, idx) => {
                      return (
                        <div
                          className={`wct-b-c${idx} wct-b-c`}
                          style={{
                            width: headerParam.widthInPercent
                              ? headerParam.widthInPercent + "%"
                              : 100 / headerParams.length + "%",
                          }}
                        >
                          {cellData(headerParam, row, idx)}
                        </div>
                      );
                    })}
                  </div>
                  {row.subTableExists && (
                    <CustomTable
                      headClassName={subHeadClassName ? subHeadClassName : ""}
                      headerParams={subHeaderParams}
                      bodyData={subBodyData}
                      noDataMessage={subTableNoDataMessage}
                      langData={langData}
                    />
                  )}
                </>
              ))}
            </>
          ) : (
            <div className="wct-no-data">
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

export default CustomTable;
