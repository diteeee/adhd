import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Alert, Snackbar } from "@mui/material";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

const Notifications = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
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
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert onClose={() => handleClose(index)} severity="info" sx={{ width: "100%" }}>
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
