import React, { useEffect } from "react";
import { getBaseUrl } from "../../api-services/environment-url/environment-url";

const WidgetTestPage: React.FC = () => {
  useEffect(() => {
    // Dynamically load the widget loader script
    const script = document.createElement("script");
    script.src =
      getBaseUrl(process.env.REACT_APP_NODE_ENV, "WIDGET_BASE_URL") +
      "/widget-loader.js";
    script.async = true;
    script.setAttribute("data-container", "cricket-battle-widget-container");
    script.setAttribute("data-bundle", "standalone");
    // Using relative path for CDN url since we copied files to public/widget
    script.setAttribute(
      "data-cdn-url",
      getBaseUrl(process.env.REACT_APP_NODE_ENV, "WIDGET_BASE_URL") + "/widget"
    );

    document.body.appendChild(script);

    return () => {
      // Cleanup script
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div
      id="cricket-battle-widget-container"
      data-api-url={getBaseUrl(
        process.env.REACT_APP_NODE_ENV,
        "REACT_APP_REST_API_URL"
      )}
      // Token will be picked up by the widget automatically if we use the auth token from session storage
      // But for this test, we might want to pass it explicitly or let the widget handle it if it was designed to read from window/localstorage?
      // The widget code reads from data-auth-token.
      // In the integration context, the host site must provide the token.
      data-auth-token={sessionStorage.getItem("jwt_token") || ""}
      data-theme="dark"
    ></div>
  );
};

export default WidgetTestPage;
