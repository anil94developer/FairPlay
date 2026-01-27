import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";

import MinusIcon from "../../assets/images/StakeSettings/minus.svg";
import PlusIcon from "../../assets/images/StakeSettings/plus.svg";
import Spinner from "../Spinner/Spinner";
import { ButtonVariable } from "../../models/ButtonVariables";
import { RootState } from "../../models/RootState";
import { fetchButtonVariables } from "../../store";
import { setAlertMsg } from "../../store/common/commonActions";
import { AlertDTO } from "../../models/Alert";
import "./ButtonVariablesModal.scss";

type StoreProps = {
  buttonVariables: ButtonVariable[];
  fetchButtonVariables: () => void;
  setAlertMsg: Function;
  langData: any;
  onSave?: () => void;
};

const ButtonVariablesModal: React.FC<StoreProps> = (props) => {
  const {
    buttonVariables,
    fetchButtonVariables,
    setAlertMsg,
    langData,
    onSave,
  } = props;
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
      if (onSave) {
        onSave();
      }
      fetchButtonVariables();
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    if (buttonVariables.length === 0) {
      fetchButtonVariables();
    }
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
      return;
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

  return (
    <div className="button-variables-modal-ctn">
      {loading && (
        <div className="modal-spinner">
          <Spinner />
        </div>
      )}
      <div className="stake-settings-modal-ctn">
        {updateVariables &&
          updateVariables.map((bV, idx) => (
            <div
              key={`modal-stake-btn-${idx}`}
              className="indv-stake-btn-modal"
            >
              <div className="label-text-modal">
                {idx === 0 && (
                  <div className="label-text-sub-modal">
                    {langData?.["button_label"]}
                  </div>
                )}

                <input
                  type="text"
                  className="bt-input-modal"
                  value={bV.label}
                  onChange={(e) => updateButtonLabel(idx, e.target.value)}
                />
              </div>

              <div className="label-number-modal">
                {idx === 0 && (
                  <div className="label-text-sub-modal">
                    {langData?.["input_value"]}
                  </div>
                )}

                <input
                  type="number"
                  className="bt-input-modal"
                  value={bV.stake}
                  onChange={(e) =>
                    updateButtonAmount(idx, parseFloat(e.target.value))
                  }
                />
              </div>
            </div>
          ))}
      </div>

      <div className="modal-actions">
        <button
          className="save-btn-modal"
          onClick={updateButtonVariables}
          disabled={loading}
        >
          {langData?.["save"]}
        </button>
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ButtonVariablesModal);
