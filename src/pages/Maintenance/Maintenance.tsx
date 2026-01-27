import React, { useEffect, useState } from "react";
import MaintenanceImg from "../../assets/images/maintenance.webp";
import "./Maintenance.scss";
import {
  isSiteUnderMaintenance,
  setMaintenanceTimer,
} from "../../store/common/commonActions";
import { useHistory } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../models/RootState";

const Maintenance = () => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { maintenanceTimer } = useSelector((state: RootState) => state.common);

  // State to store the remaining time
  const [timeLeft, setTimeLeft] = useState(null);

  const checkSiteUnderMaintenance = async () => {
    try {
      const res = await isSiteUnderMaintenance();
      if (!res?.isSiteUnderMaintenance) {
        history.replace("/login");
      } else {
        // Clear session storage only when maintenance flag is true
        sessionStorage.removeItem("aid");
        sessionStorage.removeItem("jwt_token");
        sessionStorage.removeItem("username");

        // Clear refreshToken cookie
        document.cookie =
          "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        dispatch(setMaintenanceTimer(res.downtimeTimestamp));
      }
    } catch (error) {
      console.error("Error checking site maintenance:", error);
    }
  };

  // useEffect(() => {
  //   checkSiteUnderMaintenance();
  // }, []);

  function calculateTimeLeft() {
    const now = new Date().getTime(); // Current time in milliseconds
    const endTime = new Date(maintenanceTimer).getTime(); // End time in milliseconds
    const difference = endTime - now;

    if (difference <= 0) return { hours: "00", minutes: "00", seconds: "00" };

    return {
      hours: String(Math.floor(difference / (1000 * 60 * 60))).padStart(2, "0"),
      minutes: String(Math.floor((difference / (1000 * 60)) % 60)).padStart(
        2,
        "0"
      ),
      seconds: String(Math.floor((difference / 1000) % 60)).padStart(2, "0"),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, [maintenanceTimer]);

  return (
    <div className="maintenance-container">
      <div className="sub-container">
        <img src={MaintenanceImg} className="maintenance-img" />
        <div className="title">The site is under maintenance</div>
        <div className="text">
          Our website is currently undergoing maintenance to improve your
          experience. We appreciate your patience and will be back online
          shortly.
        </div>

        {timeLeft !== null ? (
          <div className="maintenance-timer">
            <div className="text-center">
              <div className="time-text">{timeLeft.hours}</div>
              <div className="time-info">Hours</div>
            </div>
            <div className="middle-line"></div>
            <div className="text-center">
              <div className="time-text">{timeLeft.minutes}</div>
              <div className="time-info">Minutes</div>
            </div>
            <div className="middle-line"></div>
            <div className="text-center">
              <div className="time-text">{timeLeft.seconds}</div>
              <div className="time-info">Seconds</div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Maintenance;
