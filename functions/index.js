
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
app.use(cors({ origin: true }));

// --- IMPORTANT: Replace with your actual database credentials ---
const dbConfig = {
  host: "194.59.164.14",
  user: "u573621538_IT",
  password: "A@a0908225224",
  database: "u573621538_Dich_vu_cong_nghe",
};

let connection;

function handleDisconnect() {
  connection = mysql.createConnection(dbConfig);

  connection.connect(err => {
    if (err) {
      console.error("Error when connecting to db:", err);
      setTimeout(handleDisconnect, 2000); // Retry connection after 2 seconds
    }
    console.log("Connected to the database.");
  });

  connection.on("error", err => {
    console.error("DB error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      handleDisconnect(); // Reconnect if connection is lost
    } else {
      throw err;
    }
  });
}

handleDisconnect();


// Test route
app.get("/test", (req, res) => {
  res.status(200).send("Hello from Firebase and Express!");
});

// Example route to get data from a table named 'users'
app.get("/users", (req, res) => {
  connection.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      return res.status(500).send("Error querying database");
    }
    res.status(200).json(results);
  });
});

exports.api = functions.https.onRequest(app);
