import React from "react";
import { IonRow } from "@ionic/react";
import moment from "moment";
import { EventDTO } from "../../models/common/EventDTO";

type RouteParams = {
  eventType: string;
  competition: string;
  eventId: string;
  eventInfo: string;
};

interface MatchInfoProps {
  eventData?: EventDTO | null;
  routeParams: RouteParams;
}

const MatchInfo: React.FC<MatchInfoProps> = ({ eventData, routeParams }) => {
  // Determine if we should show eventData date or routeParams date
  // Check both eventData and eventData?.openDate
  const hasEventDataDate = !!eventData && !!eventData?.openDate;

  // Get epoch time from routeParams for fallback
  const getEpochTimeFromRoute = () => {
    try {
      const decodedInfo = atob(routeParams.eventInfo || "");
      return Number(decodedInfo.split(":")[4]);
    } catch {
      return null;
    }
  };

  return (
    <IonRow className="eam-info-header eam-info-header-name">
      <div className="eam-teams-name">
        <div className="eam-date-ctn">
          <div className="eam-date">
            {hasEventDataDate ? (
              <>
                <div className="eam-dates">
                  <div className="eam-date-time">
                    <span>
                      {moment(
                        eventData?.customOpenDate
                          ? eventData?.customOpenDate
                          : eventData?.openDate
                      ).format("hh")}
                    </span>
                    :
                    <span>
                      {moment(
                        eventData?.customOpenDate
                          ? eventData?.customOpenDate
                          : eventData?.openDate
                      ).format("mm A")}
                    </span>
                  </div>
                  <div className="eam-date-text">
                    {!eventData?.openDate
                      ? moment().format("DD MMM YYYY")
                      : moment(
                          eventData?.customOpenDate
                            ? eventData?.customOpenDate
                            : eventData?.openDate
                        ).format("DD MMM YYYY")}
                  </div>
                </div>
              </>
            ) : (
              <div className="eam-dates">
                <div className="eam-date-time">
                  <span>
                    {moment.unix(getEpochTimeFromRoute() || 0).format("hh")}
                  </span>
                  :
                  <span>
                    {moment.unix(getEpochTimeFromRoute() || 0).format("mm A")}
                  </span>
                </div>
                <div className="eam-date-text">
                  {moment
                    .unix(getEpochTimeFromRoute() || 0)
                    .format("DD MMM YYYY")}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="eam-teams-name-ctn">
          {eventData?.customEventName ? (
            <div className="eam-team-1">{eventData?.customEventName}</div>
          ) : eventData?.homeTeam && eventData?.awayTeam ? (
            <>
              <div className="eam-team-1">{eventData?.homeTeam}</div>
              {eventData?.awayTeam && eventData?.awayTeam !== "" && (
                <>
                  <span>
                    {"  "} V {"  "}
                  </span>
                  <div className="eam-team-2">{eventData?.awayTeam}</div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="eam-team-1">
                {routeParams.eventId?.toLowerCase() === "binary"
                  ? "Binary"
                  : routeParams.eventId?.split("-").join(" ")}
              </div>
            </>
          )}
        </div>
      </div>
    </IonRow>
  );
};

export default MatchInfo;
