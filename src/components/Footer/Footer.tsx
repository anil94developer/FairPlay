import React from "react";

const Footer: React.FC = () => {
  return (
    <footer style={{ padding: "20px", textAlign: "center", marginTop: "auto" }}>
      <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
    </footer>
  );
};

export default Footer;
