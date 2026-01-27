import React from "react";
import "./CustomButton.scss";

export type ButtonProps = {
  text: string;
  onClick?: Function;
  variant?: 1 | 2;
  className?: string;
  type?: "submit" | "reset" | "button";
};

const CustomButton = (props: ButtonProps) => {
  const { onClick, text, variant, className, type } = props;

  const handleClick = () => {
    onClick && onClick();
  };

  return (
    <button
      className={`cb ${
        variant && variant === 2 ? "cb-variant-2" : "cb-variant-1"
      } ${className ? className : ""}`}
      onClick={handleClick}
      type={type}
    >
      {text}
    </button>
  );
};

export default CustomButton;
