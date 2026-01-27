import React, { useCallback, useEffect, useState } from "react";
import InputTemplate from "../../common/InputTemplate/InputTemplate";
import "./PersonalInfo.scss";
import SVLS_API from "../../svls-api";

import Spinner from "../Spinner/Spinner";
import Button from "@material-ui/core/Button";
import { demoUser, demoUserPrefix } from "../../util/stringUtil";
import { useDispatch } from "react-redux";
import { setAlertMsg } from "../../store/common/commonActions";
import CustomButton from "../../common/CustomButton/CustomButton";

enum UserDetailFields {
  fullName = "full name",
  username = "username",
  phoneNumber = "phoneNumber",
  emailId = "email address",
  address = "address",
  city = "city",
  pinCode = "pincode",
}

const PersonalInfo: React.FC<{ langData: any }> = (props) => {
  const { langData } = props;
  const username = sessionStorage.getItem("username");
  const pinCodeRegex = /^[1-9][0-9]{5}$/;
  const [fullName, setFullName] = useState<string>(null);
  const [phoneNumber, setPhoneNumber] = useState<number>(null);
  const [emailId, setEmailId] = useState<string>(null);
  const [address, setAddress] = useState<string>(null);
  const [city, setCity] = useState<string>(null);
  const [pinCode, setPinCode] = useState<string>(null);
  const [err, setErr] = useState<string>(null);
  const [progress, setProgress] = useState<boolean>(false);
  const dispatch = useDispatch();

  const getDetails = useCallback(async () => {
    try {
      // Dummy data instead of API call
      const dummyData = {
        fullName: "John Doe",
        phoneNumber: "1234567890",
        pinCode: "10001",
        city: "New York",
        address: "123 Main Street",
        emailId: "john.doe@example.com",
      };
      setFullName(dummyData.fullName);
      setPhoneNumber(dummyData.phoneNumber);
      setPinCode(dummyData.pinCode);
      setCity(dummyData.city);
      setAddress(dummyData.address);
      setEmailId(dummyData.emailId);
      setErr(null);
    } catch (err) {
      setErr(err?.response?.data?.message);
    }
  }, []);

  useEffect(() => {
    getDetails();
  }, []);

  const handleChange = (value, label) => {
    switch (label) {
      case UserDetailFields.fullName:
        setFullName(value);
        break;
      case UserDetailFields.emailId:
        setEmailId(value);
        break;
      case UserDetailFields.phoneNumber:
        setPhoneNumber(value);
        break;
      case UserDetailFields.city:
        setCity(value);
        break;
      case UserDetailFields.address:
        setAddress(value);
        break;
      case UserDetailFields.pinCode:
        setPinCode(value);
        break;
    }
  };

  const validateAndUpdateDetails = () => {
    const data = {
      fullName: fullName,
      phoneNumber: phoneNumber,
      emailId: emailId,
      address: address,
      city: city,
      pinCode: pinCode,
    };
    console.log(data);
    validateData(data);
  };

  const removeEveryField = () => {
    setFullName("");
    setEmailId("");
    setCity("");
    setAddress("");
    setPinCode("");
  };

  const validateData = (data) => {
    if (!data.emailId.includes("@")) {
      setErr(langData?.["invalid_email_id_txt"]);
      setTimeout(() => {
        setErr(null);
      }, 5000);
      return;
    }
    updateDetails(data);
  };

  const updateDetails = async (data) => {
    try {
      setErr("");
      setProgress(true);
      const userName = sessionStorage.getItem("username");
      await SVLS_API.put(`/account/v2/users/${userName}/profile`, data, {
        headers: {
          Authorization: sessionStorage.getItem("jwt_token"),
        },
      });
      dispatch(
        setAlertMsg({
          type: "success",
          message: langData?.["details_saved_success_txt"],
        })
      );

      getDetails();
    } catch (err) {
      setErr(err?.response?.data?.message);
      dispatch(
        setAlertMsg({
          type: "error",
          message: langData?.["details_save_failed_txt"],
        })
      );
    }
    setProgress(false);
  };

  return (
    <div className="pi-ctn">
      {progress ? (
        <Spinner />
      ) : (
        <>
          <InputTemplate
            label={langData?.["full_name"]}
            value={fullName}
            placeholder={langData?.["enter"]}
            onChange={(e) => handleChange(e, UserDetailFields.fullName)}
          />
          <InputTemplate
            label={langData?.["username"]}
            value={demoUser() ? langData?.["demo_user"] : username}
            placeholder={langData?.["enter"]}
            // onChange={(e) => handleChange(e, UserDetailFields.username)}
            disabled={true}
          />
          <InputTemplate
            label={langData?.["phone_number"]}
            value={phoneNumber}
            type="number"
            disabled={true}
            placeholder={langData?.["enter"]}
          />
          <InputTemplate
            label={langData?.["email_address"]}
            value={emailId}
            type={"email"}
            placeholder={langData?.["enter"]}
            onChange={(e) => handleChange(e, UserDetailFields.emailId)}
          />
          <InputTemplate
            label={langData?.["address"]}
            value={address}
            placeholder={langData?.["enter"]}
            onChange={(e) => handleChange(e, UserDetailFields.address)}
          />
          <InputTemplate
            label={langData?.["city"]}
            value={city}
            placeholder={langData?.["enter"]}
            onChange={(e) => handleChange(e, UserDetailFields.city)}
          />
          <InputTemplate
            label={langData?.["pincode"]}
            value={pinCode}
            placeholder={langData?.["enter"]}
            onChange={(e) => handleChange(e, UserDetailFields.pinCode)}
          />
          <div className="mp-error-save">
            <p className="error">{err}</p>
            <div className="mp-reset-save-btn">
              <CustomButton
                text={langData?.["reset"]}
                onClick={removeEveryField}
                variant={2}
              />
              <CustomButton
                text={langData?.["save"]}
                onClick={validateAndUpdateDetails}
                variant={1}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PersonalInfo;
