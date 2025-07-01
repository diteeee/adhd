import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Alert, Snackbar } from "@mui/material";
import { io } from "socket.io-client";

const Notifications = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const socket = io("http://localhost:3001");

    console.log("Joining room with userId:", userId);
    socket.emit("joinRoom", userId);

    socket.on("newNotification", (notification) => {
      console.log("Received notification:", notification);
      setNotifications((prev) => [...prev, notification]);
    });

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  const handleClose = (index) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      {notifications.map((notif, index) => (
        <Snackbar
          key={index}
          open={true}
          autoHideDuration={8000}
          onClose={() => handleClose(index)}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          sx={{
            transform: "scale(1)",
            animation: "popup 0.5s ease-in-out",
          }}
          PaperProps={{
            sx: {
              backgroundColor: "transparent", // make Snackbar background transparent
              boxShadow: "none", // remove shadow if needed
            },
          }}
        >
          <Alert
            onClose={() => handleClose(index)}
            severity="info"
            sx={{
              backgroundColor: "#fbfbf0", // beige
              color: "#5a4d00",
              fontWeight: "bold",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)", // optional subtle shadow
            }}
          >
            {notif.mesazhi ? notif.mesazhi : "No message"}
          </Alert>
        </Snackbar>
      ))}
    </div>
  );
};

Notifications.propTypes = {
  userId: PropTypes.string.isRequired,
};

export default Notifications;
