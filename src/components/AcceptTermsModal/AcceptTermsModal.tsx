import React, { useState } from "react";
import moment, { Moment } from "moment";
import { useFormik } from "formik";
import * as Yup from "yup";

import { IonSpinner, IonLabel } from "@ionic/react";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import MomentUtils from "@date-io/moment";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import FormHelperText from "@material-ui/core/FormHelperText";

import API from "../../api/index";
import { AuthResponse } from "../../models/api/AuthResponse";
import "./AcceptTermsModal.scss";

type AcceptTermsProps = {
  closeHandler: () => void;
  successHandler: () => void;
  langData: any;
};

type UserPersonalDetails = {
  firstName: string;
  lastName: string;
  dob: Moment;
};

const AcceptTermsModal: React.FC<AcceptTermsProps> = (props) => {
  const { successHandler, langData } = props;
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [progress, setProgress] = useState<boolean>(false);
  const [dob, setDOB] = useState<Moment>(moment().subtract(18, "years"));
  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      dob: moment().subtract(18, "years"),
      acceptTerms: false,
    },
    validationSchema: Yup.object({
      lastName: Yup.string().required(langData?.["required"]),
      acceptTerms: Yup.bool().test(
        "pointsType",
        langData?.["please_accept_tc_txt"],
        () => {
          return formik.values.acceptTerms;
        }
      ),
    }),
    onSubmit: (values) => {
      let data: UserPersonalDetails = {
        firstName: values.firstName,
        lastName: values.lastName,
        dob: values.dob,
      };
      setUserDetailsRequest(data);
    },
  });

  const setUserDetailsRequest = async (data) => {
    setProgress(true);
    try {
      const response: AuthResponse = await API.put("/user/dob", data, {
        headers: {
          Authorization: sessionStorage.getItem("jwt_token"),
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        setProgress(false);
        successHandler();
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setErrorMsg(err.response.data.error);
      }
    }
  };

  return (
    <>
      <form
        onSubmit={formik.handleSubmit}
        className="accept-terms-form-ctn"
        autoComplete="off"
      >
        <div className="first-name-input">
          <IonLabel className="input-label">
            {langData?.["first_name"]}
          </IonLabel>
          <TextField
            className="login-input-field first-name-field"
            type="text"
            name="firstName"
            variant="outlined"
            {...formik.getFieldProps("firstName")}
          />
        </div>

        <div className="last-name-input">
          <IonLabel className="input-label">{langData?.["last_name"]}</IonLabel>
          <TextField
            className="login-input-field last-name-field"
            type="text"
            name="lastName"
            variant="outlined"
            error={
              formik.touched.lastName && formik.errors.lastName ? true : false
            }
            helperText={
              formik.touched.lastName && formik.errors.lastName
                ? formik.errors.lastName
                : null
            }
            {...formik.getFieldProps("lastName")}
          />
        </div>

        <div className="dob-input">
          <IonLabel className="input-label">{langData?.["dob"]}</IonLabel>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <KeyboardDatePicker
              className="dob-field date-control"
              disableToolbar
              variant="inline"
              format="DD/MM/yyyy"
              margin="normal"
              id="date-picker-inline"
              value={dob}
              onChange={(e) => {
                formik.values.dob = e;
                setDOB(e);
              }}
              maxDate={moment().subtract(18, "years")}
              InputProps={{
                disableUnderline: true,
              }}
              KeyboardButtonProps={{
                "aria-label": langData?.["change_date"],
              }}
            />
          </MuiPickersUtilsProvider>
        </div>

        <div className="accept-terms-input">
          <FormControlLabel
            className="accept-terms-field"
            control={
              <Checkbox
                checked={formik.values.acceptTerms}
                onChange={(e) => {
                  formik.handleChange(e);
                }}
                className="accept-terms-checkbox"
                name="acceptTerms"
                color="default"
              />
            }
            label={langData?.["accept_tc_txt"]}
            labelPlacement="end"
          />
          {formik.touched.acceptTerms && formik.errors.acceptTerms ? (
            <FormHelperText id="my-helper-text" className="my-helper-text">
              {formik.errors.acceptTerms}
            </FormHelperText>
          ) : null}
        </div>

        {errorMsg !== "" ? <span className="error-msg">{errorMsg}</span> : null}

        <Button
          className="submit-form-btn-accept-terms"
          color="primary"
          endIcon={progress ? <IonSpinner name="lines-small" /> : ""}
          type="submit"
          variant="contained"
        >
          {langData?.["submit"]}
        </Button>
      </form>
    </>
  );
};

export default AcceptTermsModal;
