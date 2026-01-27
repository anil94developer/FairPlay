import moment from "moment";
import CustomMomentUtils from "./CustomMomentUtils"; // Adjust path as needed
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import React from "react";
import "./DateAndTimeTemplate.scss";
import { ParsableDate } from "@material-ui/pickers/constants/prop-types";
import calendarIcon from "../../assets/images/icons/calendarIcon.svg";

type Props = {
  value: any;
  label: string;
  onChange: Function;
  minDate?: ParsableDate;
  maxDate?: ParsableDate;
};

const DateTemplate = (props: Props) => {
  const { value, minDate, maxDate, label, onChange } = props;

  const handleChange = (date: any) => {
    onChange(date);
  };

  return (
    <div className="date-template">
      <div className="dt-label">{label}</div>
      <MuiPickersUtilsProvider utils={CustomMomentUtils}>
        <KeyboardDatePicker
          keyboardIcon={
            <img
              className="date-picker-keyboard-icon"
              src={calendarIcon}
              alt="calendar"
            />
          }
          disableFuture
          className="date-filter date-control"
          InputProps={{
            disableUnderline: true,
            readOnly: true,
          }}
          disableToolbar
          variant="inline"
          minDate={minDate}
          maxDate={maxDate}
          format="DD/MM/YYYY"
          margin="normal"
          value={value}
          onChange={handleChange}
        />
      </MuiPickersUtilsProvider>
    </div>
  );
};

export default DateTemplate;
