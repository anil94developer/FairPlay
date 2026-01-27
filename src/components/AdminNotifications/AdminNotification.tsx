import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import moment from "moment";
import React, { useEffect, useState } from "react";
import SVLS_API from "../../api-services/svls-api";
import { ReactComponent as ExpandMoreIcon } from "../../assets/images/Notifications/expand_icon.svg?react";
import Spinner from "../Spinner/Spinner";
import "./AdminNotification.scss";
import { notificationsData } from "../../description/notificationsData";

type Notification = {
  active: boolean;
  allowedConfig: number;
  createdBy: string;
  dateCreated: Date;
  endTime: Date;
  houseId: number;
  id: number;
  lastUpdated: Date;
  message: string;
  startTime: Date;
  title: string;
  updatedBy: string;
};

const AdminNotification = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [openAccordion, setOpenAccordion] = useState<number>(-1);

  const fetchNotifications = () => {
    setNotifications(notificationsData);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleClick = (id) =>
    id === openAccordion ? setOpenAccordion(-1) : setOpenAccordion(id);

  return (
    <div className="notifi-ctn">
      {loading ? (
        <Spinner />
      ) : (
        <>
          {notifications?.map((row, idx) => (
            <Accordion defaultExpanded={true} className="notifi-accordion">
              <AccordionSummary aria-controls="panel1a-content">
                <div className="notifi-expand-more-title">
                  <button
                    className="notifi-expand-btn"
                    onClick={() => handleClick(row.id)}
                  >
                    <ExpandMoreIcon
                      className={
                        openAccordion === row.id
                          ? "notifi-expand-less"
                          : "notifi-expand-more"
                      }
                    />
                  </button>
                  <div className="notifi-title-time">
                    <div className="date-title">
                      {moment(row.startTime).format("DD MMM")},
                      {moment(row.startTime).format("HH:mm")}
                    </div>
                    <div className="date-title">{row.title}</div>
                  </div>
                </div>
              </AccordionSummary>
              <AccordionDetails className="indv-notification">
                {row.message}
              </AccordionDetails>
            </Accordion>
          ))}
        </>
      )}
    </div>
  );
};

export default AdminNotification;
