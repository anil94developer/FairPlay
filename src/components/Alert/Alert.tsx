import React from "react";

interface AlertProps {
  message: string;
}

const Alert: React.FC<AlertProps> = ({ message }) => {
  return (
    <div style={{ padding: "16px", marginBottom: "16px", backgroundColor: "#fee", border: "1px solid #fcc", borderRadius: "4px", color: "#c33" }}>
      {message}
    </div>
  );
};

export default Alert;
