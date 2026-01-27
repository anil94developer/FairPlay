import React, { useState } from "react";
import calendarIcon from "../../assets/images/icons/calendarIcon.svg";
import searchIcon from "../../assets/images/icons/search.svg";
import transferIcon from "../../assets/images/reportIcons/MyTransaction.svg";

const users = [];

const ReportTab = () => {
  const [activeTab, setActiveTab] = useState("commission");
  return (
    <>
      <div class="report-toggle">
        <div
          className={`report-tab ${
            activeTab === "commission" ? "active-tab" : ""
          }`}
          onClick={() => setActiveTab("commission")}
        >
          <span>Commission Report</span>
        </div>

        <div
          className={`report-tab ${activeTab === "user" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("user")}
        >
          <span>User Report</span>
        </div>
      </div>

      <div class="filter-card">
        <div class="filter-inner">
          <div class="date-search-row">
            <div class="date-range-box">
              <div class="date-text">
                <div class="date-values">
                  <span>December 30, 2025</span>
                  <img
                    src={transferIcon}
                    alt="transfer"
                    className="arrow-icon"
                  />
                  <span>January 6, 2026</span>
                </div>
              </div>
              <img
                src={calendarIcon}
                alt="calendar"
                className="calendar-icon"
              />
            </div>
            <button class="icon-btn" type="button">
              <img src={searchIcon} alt="search" />
            </button>
            {activeTab === "user" && (
              <form class="filter-form">
                <select id="countries" class="filter-select">
                  <option value="user">User Added</option>
                  <option value="deposit">Deposit / Withdraw</option>
                </select>
              </form>
            )}
          </div>

          <div class="quick-filters">
            <div class="quick-filter active-filter">Last 7 days</div>
            <div class="quick-filter">Last 14 days</div>
            <div class="quick-filter">Last 28 days</div>
          </div>
        </div>
      </div>
      <div class="af-table-wrapper">
        <table class="af-table default-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Commision</th>
            </tr>
          </thead>

          <tbody id="userTableBody">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="no-records">
                  No Records Found
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={index}>
                  <td>{user.username}</td>
                  <td>{user.balance}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ReportTab;
