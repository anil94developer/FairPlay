import React, { ReactComponentElement } from "react";
import "./ReportsHeader.scss";
import { TextField } from "@material-ui/core";
import { CancelRounded } from "@material-ui/icons";

type ReportFilters = {
  element: any;
  fullWidthInMob?: boolean;
};

type TabsOrBtns = {
  label: string;
  onSelect: Function;
  className?: string;
  cond?: boolean;
  icon?: any;
};

type Props = {
  titleIcon: any;
  reportName: string;
  reportFilters: ReportFilters[];
  tabsOrBtns?: TabsOrBtns[];
  setSearchTerm?: Function;
  searchTerm?: string;
  clearAll?: Function;
  langData?: any;
};

const ReportsHeader = (props: Props) => {
  const {
    setSearchTerm,
    reportName,
    reportFilters,
    tabsOrBtns,
    searchTerm,
    clearAll,
    langData,
  } = props;

  const showFilter = (filters) => {
    const noOfFilters = filters.length;
    let initial = 0;
    let elements = [];
    while (initial < noOfFilters) {
      if (filters[initial].fullWidthInMob) {
        elements.push(
          <div className="full-width">{filters[initial].element}</div>
        );
        initial++;
      } else {
        elements.push(
          <div className="two-filters">
            {filters[initial].element}
            {filters.length > initial + 1 && filters[initial + 1].element}
          </div>
        );
        initial += 2;
      }
    }
    return elements;
  };

  const handleSelect = (evnt, e) => {
    e.onSelect();
  };

  return (
    <div className="report-header">
      <div className="report-img-title">
        <div className="report-img-div-title">
          <div className="report-img-div">
            <props.titleIcon className="report-img" />
          </div>
          <div className="report-title">{reportName}</div>
        </div>
        <div className="tab-btns">
          {searchTerm !== undefined ? (
            <div className="search-games-ctn">
              <input
                className="search-games-input gradient-border"
                placeholder={langData?.["search_games"]}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <CancelRounded onClick={() => clearAll()} />
            </div>
          ) : null}

          {tabsOrBtns?.map(
            (e) =>
              e.cond !== false && (
                <button
                  className={`tab-btn ${e.className ? e.className : ""}`}
                  onClick={(evnt) => handleSelect(evnt, e)}
                >
                  {e.icon ? e.icon : null}
                  {e.label}
                </button>
              )
          )}
        </div>
      </div>
      <div className="report-filters rh-web-view">
        {reportFilters.map((indv) => indv.element)}
      </div>
      <div className="report-filters rh-mob-view">
        {showFilter(reportFilters)}
      </div>
    </div>
  );
};

export default React.memo(ReportsHeader);
