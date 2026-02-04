import React from "react";
import Box from "@material-ui/core/Box";

interface TabPanelProps {
  children?: React.ReactNode;
  className?: string;
  index: any;
  value: any;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, className, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      className={className}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
};

export default TabPanel;
