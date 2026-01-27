import React, { useState } from "react";
import { Plus } from "../../shared/icon";
import Dialog from "../../shared/Dialog";
import ShareDialog from "./ShareDialog";

const users = [];

const UserListTab = () => {
  const [shareDialog, setShareDialog] = useState(false);
  return (
    <>
      <div class="af-table-wrapper">
        <table class="af-table default-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Balance</th>
              <th>Created Date Time</th>
              <th>Statement</th>
              <th>PL</th>
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
                  <td>{user.createdAt}</td>
                  <td>
                    <button>View</button>
                  </td>
                  <td className={user.pl >= 0 ? "pl-positive" : "pl-negative"}>
                    {user.pl}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <button
        class="primary-btn add-user-btn"
        onClick={() => setShareDialog(true)}
      >
        <Plus className="icon-margin-right" />
        ADD NEW USER
      </button>
      <ShareDialog show={shareDialog} onClose={() => setShareDialog(false)} />
    </>
  );
};

export default UserListTab;
