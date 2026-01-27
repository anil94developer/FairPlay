import MomentUtils from "@date-io/moment";
import { Moment } from "moment";

class CustomMomentUtils extends MomentUtils {
  getDayText(date: Moment) {
    return date.format("D");
  }

  getCalendarHeaderText(date: Moment) {
    return date.format("MMMM YYYY");
  }

  getDatePickerHeaderText(date: Moment) {
    return date.format("ddd, MMM D");
  }

  getDateTimePickerHeaderText(date: Moment) {
    return date.format("MMM D");
  }

  getMonthText(date: Moment) {
    return date.format("MMMM");
  }

  getYearText(date: Moment) {
    return date.format("YYYY");
  }

  getHourText(date: Moment, ampm: boolean) {
    return date.format(ampm ? "hh" : "HH");
  }

  getMinuteText(date: Moment) {
    return date.format("mm");
  }

  getSecondText(date: Moment) {
    return date.format("ss");
  }
}

export default CustomMomentUtils;
