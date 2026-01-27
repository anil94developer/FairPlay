import React, { useState } from "react";
import ellip from "../../assets/ellip.svg";
import affiinviteimg from "../../assets/affi-invite-img.svg";
import inviteGift from "../../assets/invite-gift.svg";
import QR from "../../assets/qr.png";
import affiBonus from "../../assets/affi-bonus.svg";
import affiBonus2 from "../../assets/affi-bonus-2.svg";
import { Copy, Plus } from "../../shared/icon";
import ShareDialog from "./ShareDialog";
import Dialog from "../../shared/Dialog";

const plData = [
  { type: "Sports", pl: 0 },
  { type: "Casino", pl: 0 },
  { type: "International Casino (QT)", pl: 0 },
];

const DashboardTab = () => {
  const [shareDialog, setShareDialog] = useState(false);
  return (
    <>
      <div class="affiliate-dashboard">
        <section class="affiliate-card">
          <img src={ellip} class="card-bg" alt="" />

          <h3 class="card-title">Today Status</h3>

          <div class="status-grid">
            <div class="status-item">
              <span class="status-value">0</span>
              <p>Total Deposit</p>
            </div>
            <div class="status-item">
              <span class="status-value">0</span>
              <p>Total Deposit Count</p>
            </div>
            <div class="status-item">
              <span class="status-value">0</span>
              <p>Total User</p>
            </div>
            <div class="status-item">
              <span class="status-value">0</span>
              <p>Total Commission</p>
            </div>
          </div>
        </section>

        <section class="invite-card">
          <div className="invite-card-header">
            <div class="invite-content">
              <h4>Invite your friends</h4>
              <p className="invite-sub-text">
                To join and receive huge bonuses
              </p>
            </div>

            <img src={affiinviteimg} alt="" class="invite-image" />
          </div>

          <button class="primary-btn" onClick={() => setShareDialog(true)}>
            <Plus />
            ADD NEW USER
          </button>
          <div class="qr-card">
            <h5>
              <img className="icon-margin-right" src={inviteGift} alt="" />
              Invitation Code
            </h5>

            <div class="invite-link">https://usabet9.com?af_code=sofia292</div>

            <div class="qr-actions">
              <div class="qr-box">
                <img className="qr" src={QR} alt="" />
                <span class="download-text">Download</span>
              </div>

              <div class="action-buttons">
                <button class="secondary-btn">
                  <Copy /> Copy Link
                </button>
                <button class="share-btn" onClick={() => setShareDialog(true)}>
                  Share
                </button>
              </div>
            </div>
          </div>
        </section>

        <div class="nw-affi-graph-wrapper">
          <div class="nw-affi-graph-box">
            <h4 class="nw-affi-heading-text">Top 5 Loss Users</h4>
          </div>
        </div>

        <section class="affiliate-card">
          <img src={ellip} class="card-bg" alt="" />
          <h3 class="card-title">Bonus Information</h3>

          <div class="bonus-grid">
            <div class="bonus-info">
              <img src={affiBonus} alt="" />
              <p>How to get bonus?</p>
            </div>
            <div class="bonus-info">
              <img src={affiBonus2} alt="" />
              <p>Commission Info</p>
            </div>
          </div>
        </section>
        <div class="af-top-user-sec">
          <div class="af-header">
            <h6 class="af-heading">Today Profit and Loss</h6>
          </div>

          <table class="af-table">
            <thead>
              <tr>
                <th class="table-text-left">Type</th>
                <th class="table-text-center">PL</th>
              </tr>
            </thead>
            <tbody id="plTableBody">
              {plData.map((item, index) => (
                <tr key={index}>
                  <td class="table-text-left">{item.type}</td>
                  <td className="table-text-center green-text">{item.pl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ShareDialog show={shareDialog} onClose={() => setShareDialog(false)} />
    </>
  );
};

export default DashboardTab;
