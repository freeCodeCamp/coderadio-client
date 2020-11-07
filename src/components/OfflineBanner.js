import React, { useEffect, useState } from "react";

const OfflineBanner = () => {
  const [online, setOnline] = useState(window.navigator.onLine);

  useEffect(() => {
    window.addEventListener("online", () => setOnline(true));
    window.addEventListener("offline", () => setOnline(false));

    return () => {
      window.removeEventListener("online", () => setOnline(true));
      window.removeEventListener("offline", () => setOnline(false));
    };
  }, []);

  return (
    !online && (
      <div className="offline-banner">
        Radio appears to be offline. Trying to reconnect...
      </div>
    )
  );
};

export default OfflineBanner;
