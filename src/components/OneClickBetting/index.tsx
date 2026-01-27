import React, { useEffect } from "react";
import { Checkbox } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import {
  enableOneClickBetting,
  setOneClickBettingStake,
} from "../../store/exchBetslip/exchBetslipActions";
import { NumericFormat } from "react-number-format";
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../models/RootState";
import { isMobile } from "react-device-detect";
import { CheckBoxOutlined, SaveAltRounded } from "@material-ui/icons";

const OneClickBetting = () => {
  const dispatch = useDispatch();
  const { oneClickBettingEnabled, oneClickBettingStake } = useSelector(
    (state: RootState) => state.exchBetslip
  );
  const { langData } = useSelector((state: RootState) => state.common);
  const [isEditMode, setIsEditMode] = useState(false);
  const [stakesInput, setStakesInput] = useState<number[]>([
    100, 500, 1000, 5000,
  ]);
  useEffect(() => {
    if (stakesInput?.length > 0) {
      dispatch(setOneClickBettingStake(stakesInput?.[0]));
    }
  }, []);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  return (
    <div className="one-click-betting-container">
      <div
        className="one-click-betting-text"
        style={{
          paddingLeft: isMobile ? "60px" : "0px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontSize: isMobile ? "12px" : "14px",
          }}
        >
          <Checkbox
            color="primary"
            onClick={() =>
              dispatch(enableOneClickBetting(!oneClickBettingEnabled))
            }
            checked={oneClickBettingEnabled}
          />{" "}
          {langData?.oneClickBettingEnabled}
        </div>
        {!isEditMode ? (
          <EditIcon
            onClick={() => {
              setIsEditMode(!isEditMode);
              if (!isEditMode) {
                dispatch(setOneClickBettingStake(null));
              }
            }}
            style={{ cursor: "pointer", marginRight: "8px" }}
          />
        ) : (
          <CheckBoxOutlined
            onClick={() => {
              setIsEditMode(!isEditMode);
              dispatch(setOneClickBettingStake(stakesInput?.[0]));
            }}
            style={{ cursor: "pointer", marginRight: "8px" }}
          />
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          margin: "0 8px",
          paddingBottom: "8px",
          paddingLeft: isMobile ? "60px" : "0px",
        }}
      >
        <div
          className="one-click-input-ctn"
          style={{
            width: !isMobile ? "100%" : "",
          }}
        >
          {stakesInput?.map((stake, index) => (
            <div
              key={`stake-${index}`}
              onClick={(e) => {
                if (!isEditMode) {
                  e.preventDefault();
                  e.stopPropagation();
                  dispatch(setOneClickBettingStake(stake));
                }
              }}
              className={oneClickBettingStake === stake ? "selected" : ""}
              style={{
                width: "25%",
                cursor: !isEditMode ? "pointer" : "default",
              }}
            >
              <NumericFormat
                thousandSeparator={true}
                className="one-click-input"
                name="stake"
                value={stake || 0}
                disabled={!isEditMode}
                getInputRef={(el) => {
                  inputRefs.current[index] = el;
                }}
                onValueChange={(values) => {
                  if (isEditMode) {
                    const newValue = values.floatValue || null;
                    const newStakes = [...stakesInput];
                    newStakes[index] = newValue;
                    setStakesInput(newStakes);
                    // Maintain focus after state update
                    setTimeout(() => {
                      if (inputRefs.current[index]) {
                        inputRefs.current[index]?.focus();
                      }
                    }, 0);
                  }
                }}
                style={{
                  width: "100%",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: isMobile ? "12px" : "14px",
                  padding: isMobile ? "0" : "4px",
                  backgroundColor: isEditMode
                    ? "white"
                    : oneClickBettingStake === stake
                    ? "var(--ion-color-primary)"
                    : !isEditMode
                    ? "#f5f5f5"
                    : "white",
                  cursor: !isEditMode ? "pointer" : "text",
                  pointerEvents: !isEditMode ? "none" : "auto",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OneClickBetting;
