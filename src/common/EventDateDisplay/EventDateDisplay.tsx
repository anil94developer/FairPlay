import moment from "moment";
import React from "react";
import LiveEvent from "../../assets/images/liveEvent.gif";
import "./EventDateDisplay.scss";
import { useLocation } from "react-router";
import { isMobile } from "react-device-detect";

type Props = {
  openDate: any;
  forcedInplay: boolean;
  status?: string;
  sportId?: string;
};

const EventDateDisplay = (props: Props) => {
  const { openDate, forcedInplay, status, sportId } = props;
  const pathname = useLocation().pathname;
  return (
    <>
      {(sportId != "2" && moment(openDate).diff(moment(), "seconds") <= 0) ||
      forcedInplay ||
      status == "IN_PLAY" ||
      (sportId === "2" && moment(openDate).diff(moment(), "minutes") <= 5) ? (
        !isMobile && (
          <img
            className={
              pathname?.includes("/inplay") || pathname?.includes("/home")
                ? "live-img-display inplay-img-display"
                : "live-img-display"
            }
            src={LiveEvent}
          />
        )
      ) : (
        <div className="date-display">
          <div>
            {moment(moment(openDate).format("DD MMM YYYY")).isSame(
              moment().format("DD MMM YYYY")
            )
              ? "Today"
              : moment(openDate).format("DD MMM")}
          </div>
          <div>{moment(openDate).format("hh:mm A")}</div>
        </div>
      )}
    </>
  );
};

export default EventDateDisplay;
