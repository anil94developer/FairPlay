import moment from "moment";
import "moment-timezone";

const timezone = "Asia/Calcutta";

export const formatDate1 = (date: any) => {
  try {
    return moment(date).format("DD MMM"); // Result Date: May 06
  } catch (error) {
    return date;
  }
};

export const formatDate2 = (date: any) => {
  try {
    return moment(date).format("dd-MM-yy hh :mm :ss a"); // Result Date: Fr-05-yy 03 :39 :58 pm
  } catch (error) {
    return date;
  }
};

export const formatDate3 = (date: any) => {
  try {
    return moment(date).format("DD-MM-YY, h:mm:ss A"); // Result Date: 06-05-22, 4:13:12 PM
  } catch (error) {
    return date;
  }
};

export const convertTimeToDefaultTimezone = (time) => {
  return moment(time).tz(timezone);
};

export const now = () => moment().tz(timezone);
