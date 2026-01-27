import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";

import { ReactComponent as StakeSettingsIcon } from "../../assets/images/reportIcons/StakeSettings.svg?react";
import MinusIcon from "../../assets/images/StakeSettings/minus.svg";
import PlusIcon from "../../assets/images/StakeSettings/plus.svg";
import ReportsHeader from "../../common/ReportsHeader/ReportsHeader";
import Spinner from "../../components/Spinner/Spinner";
import { ButtonVariable } from "../../models/ButtonVariables";
import { RootState } from "../../models/RootState";
import { fetchButtonVariables } from "../../store";
import "./ButtonVariables.scss";
import { useHistory } from "react-router-dom";
import ReportBackBtn from "../../common/ReportBackBtn/ReportBackBtn";
import { setAlertMsg } from "../../store/common/commonActions";
import { AlertDTO } from "../../models/Alert";

type StoreProps = {
  buttonVariables: ButtonVariable[];
  fetchButtonVariables: () => void;
  setAlertMsg: Function;
  langData: any;
};

const MyBets: React.FC<StoreProps> = (props) => {
  const { buttonVariables, fetchButtonVariables, setAlertMsg, langData } =
    props;
  const dispatch = useDispatch();

  const [loading, setLoading] = useState<boolean>(false);
  const [updateVariables, setUpdateVariables] = useState<ButtonVariable[]>();

  const updateButtonVariables = async () => {
    setLoading(true);
    for (let uV of updateVariables) {
      if (!uV.label || !uV.stake) {
        dispatch(
          setAlertMsg({
            type: "error",
            message: langData?.["invalid_label_or_amount_txt"],
          })
        );
        setLoading(false);
        return 0;
      }
    }
    // Dummy data - removed API call
    // Simulate successful save
    setTimeout(() => {
      setAlertMsg({
        type: "success",
        message: langData?.["button_variables_save_success_txt"],
      });
      fetchButtonVariables();
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchButtonVariables();
  }, []);

  useEffect(() => {
    setUpdateVariables(buttonVariables);
  }, [buttonVariables]);

  const updateButtonLabel = (index: number, label: string) => {
    const updateBtnVars = [...updateVariables];
    updateBtnVars[index].label = label;
    setUpdateVariables(updateBtnVars);
  };

  const updateButtonAmount = (index: number, amt: number) => {
    const updateBtnVars = [...updateVariables];
    updateBtnVars[index].stake = amt;
    setUpdateVariables(updateBtnVars);
  };

  const addOrRemove = (index: number, stake: number, operation: string) => {
    if (stake === undefined || stake === null) {
      dispatch(
        setAlertMsg({
          type: "error",
          message: langData?.["enter_min_value_txt"],
        })
      );
    }

    const updateBtnVars = [...updateVariables];
    if (operation === "+") {
      updateBtnVars[index].stake += updateBtnVars[index].stake;
    } else {
      updateBtnVars[index].stake -= Math.floor(updateBtnVars[index].stake / 2);
      if (updateBtnVars[index].stake <= 0) {
        updateBtnVars[index].stake = 0;
      }
    }
    setUpdateVariables(updateBtnVars);
  };

  let history = useHistory();
  const onRedirectToHome = () => {
    history.push("/home");
  };

  return (
    <div className="button-variables-ctn">
      <div className="stake-settings">
        <ReportBackBtn back={langData?.["back"]} />
        {loading ? <Spinner /> : null}
        <ReportsHeader
          titleIcon={StakeSettingsIcon}
          reportName={langData?.["stake_settings"]}
          reportFilters={[
            {
              element: (
                <div className="text">
                  {langData?.["change_input_label_settings_txt"]}:
                </div>
              ),
            },
          ]}
          tabsOrBtns={[
            {
              label: langData?.["save"],
              onSelect: () => updateButtonVariables(),
              className: "black-font",
            },
          ]}
        />
        <div className="stake-settings-ctn">
          {buttonVariables.map((bV, idx) => (
            <div className="indv-stake-btn">
              <div className="label-text">
                <div className="label-text-sub">
                  {langData?.["button_label"]}
                </div>
                <input
                  type="text"
                  className="bt-input"
                  value={bV.label}
                  onChange={(e) => updateButtonLabel(idx, e.target.value)}
                />
              </div>

              <div className="label-number">
                <div className="label-text-sub">
                  {langData?.["input_value"]}
                </div>

                <div className="support-add-stake-input">
                  <div className="add-stake-input">
                    <div
                      className="plus-div"
                      onClick={() => addOrRemove(idx, bV.stake, "+")}
                    >
                      <img className="plus-btn" src={PlusIcon} alt="" />
                    </div>

                    <input
                      type="number"
                      className="bt-input width"
                      value={bV.stake}
                      onChange={(e) =>
                        updateButtonAmount(idx, parseFloat(e.target.value))
                      }
                    />

                    <div
                      className="minus-div"
                      onClick={() => addOrRemove(idx, bV.stake, "-")}
                    >
                      <img className="minus-btn" src={MinusIcon} alt="" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootState) => {
  return {
    buttonVariables: state.exchBetslip.buttonVariables,
    langData: state.common.langData,
  };
};

const mapDispatchToProps = (dispatch: Function) => {
  return {
    fetchButtonVariables: () => dispatch(fetchButtonVariables()),
    setAlertMsg: (alert: AlertDTO) => dispatch(setAlertMsg(alert)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MyBets);
