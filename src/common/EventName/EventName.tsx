import React from "react";
import "./EventName.scss";
import moment from "moment";
import { useLocation } from "react-router";
import LiveEvent from "../../assets/images/liveEvent.gif";
import { isMobile } from "react-device-detect";

type Props = {
  homeTeam?: string;
  awayTeam?: string;
  eventName?: string;
  openDate?: any;
  forcedInplay?: boolean;
  status?: string;
  sportId?: string;
};

const EventName = (props: Props) => {
  const {
    homeTeam,
    awayTeam,
    eventName,
    openDate,
    forcedInplay,
    status,
    sportId,
  } = props;
  const pathname = useLocation().pathname;

  return (
    <div className="home-away-team">
      {eventName ? (
        <div className="team-names">{eventName}</div>
      ) : (
        <div className="team-names">
          {homeTeam} &nbsp; V &nbsp;{awayTeam}
        </div>
      )}
      <div className="team-names flex-team">
        <span className="date">
          {(sportId != "2" &&
            moment(openDate).diff(moment(), "seconds") <= 0) ||
          forcedInplay ||
          status == "IN_PLAY" ||
          (sportId === "2" && moment(openDate).diff(moment(), "minutes") <= 5)
            ? "(" + moment(openDate).format("DD/MM/YY , hh:mm A") + ")"
            : null}
        </span>
        {isMobile && status == "IN_PLAY" && (
          <img
            className={
              pathname?.includes("/inplay") || pathname?.includes("/home")
                ? "live-img-display inplay-img-display"
                : "live-img-display"
            }
            src={LiveEvent}
          />
        )}
        {isMobile && status === "UPCOMING" && (
          <div className="upcoming-badge">Upcoming</div>
        )}
      </div>
    </div>
  );
};

export default EventName;
