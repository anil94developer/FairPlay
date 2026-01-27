import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

import API from "../../api";
import Modal from "../../components//Modal/Modal";
import UserResetPwdForm from "../../components/UserResetPassword/UserResetPassword";
import MessageDialog from "../../components/MessageDialog/MessageDialog";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPassword = () => {
  const [showResetPwdModal, setShowResetPwdModal] = useState(false);
  const [messageModal, setMessageModal] = useState(false);
  const [keyValue, setKeyValue] = useState<string>(null);
  const [username, setUsername] = useState<string>(null);
  const [messageText, setMessageText] = useState<string>(null);

  const resetKey = useQuery().get("key");

  const checkUserResetPwdStatus = useCallback(async () => {
    try {
      const exp_time = JSON.parse(window.atob(resetKey.split(".")[1])).exp;
      console.log(new Date());
      console.log(new Date(exp_time * 1000));
      if (new Date(exp_time * 1000) < new Date()) {
        setMessageText("Password rest link expired!");
        setMessageModal(true);
      } else {
        const response = await API.get(`/user/reset-password/${resetKey}`);
        if (response.status === 200) {
          if (response.data.status) {
            setUsername(response.data.username);
            setKeyValue(resetKey);
            setShowResetPwdModal(true);
          } else {
            setMessageModal(true);
            setMessageText("Invalid password reset key");
          }
        } else {
          setMessageText(response.data.message);
          setMessageModal(true);
        }
      }
    } catch (ex) {
      setMessageText("Something went wrong!");
      setMessageModal(true);
    }
  }, [resetKey]);

  useEffect(() => {
    if (resetKey) {
      checkUserResetPwdStatus();
    }
  }, [checkUserResetPwdStatus, resetKey]);

  return (
    <div className="ve-ctn">
      <Modal
        open={showResetPwdModal}
        closeHandler={() => setShowResetPwdModal(true)}
        title="Reset Password"
        size="xs"
      >
        <UserResetPwdForm
          username={username}
          keyValue={keyValue}
          closeHandler={() => setShowResetPwdModal(false)}
        />
      </Modal>
      <Modal
        open={messageModal}
        closeHandler={() => setMessageModal(true)}
        title="Reset Password"
        size="xs"
      >
        <MessageDialog
          open={true}
          handleClose={() => setMessageModal(false)}
          message={messageText}
        />
      </Modal>
    </div>
  );
};

export default ResetPassword;
