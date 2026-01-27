import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import React from "react";
import "./SelectTemplate.scss";
import selectIcon from "../../assets/images/icons/select-icon.svg";

type List = {
  value: string | number;
  name: string | number;
  allow?: boolean;
};

type Props = {
  label: string;
  list: List[];
  value: unknown;
  onChange: Function;
  placeholder?: string;
  disable?: boolean;
  size?: "default" | "large";
};

const SelectTemplate = (props: Props) => {
  const {
    label,
    list,
    value,
    onChange,
    placeholder,
    disable,
    size = "default",
  } = props;

  const handleChange = (e) => {
    onChange(e);
  };
  return (
    <div
      className={`select-template ${
        size === "large" ? "select-template--large" : ""
      }`}
    >
      <div className="st-label">{label}</div>
      <Select
        value={value}
        disabled={disable}
        onChange={handleChange}
        placeholder={placeholder}
        MenuProps={{
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "left",
          },
          getContentAnchorEl: null,
        }}
        className="select-compo"
      >
        {list.map(
          (indv) =>
            indv.allow !== false && (
              <MenuItem value={indv.value}>{indv.name}</MenuItem>
            )
        )}
      </Select>
    </div>
  );
};

export default SelectTemplate;
