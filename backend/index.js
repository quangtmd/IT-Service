const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
// Allow all origins for simplicity. In a real production environment,
// you might want to restrict this to your actual frontend URL.
app.use(cors());

// --- Database Credentials ---
// It's a best practice to use environment variables for this.
// Render makes it easy to set them. We'll use your hardcoded values as fallbacks.
const dbConfig = {
  host: process.env.DB_HOST || "194.59.164.14",
  user: process.env.DB_USER || "u573621538_IT",
  password: process.env.DB_PASSWORD || "A@a0908225224",
  database: process.env.DB_DATABASE || "u573621538_Dich_vu_cong_nghe",
};

let connection;

function handleDisconnect() {
  connection = mysql.createConnection(dbConfig);

  connection.connect(err => {
    if (err) {
      console.error("Error when connecting to db:", err);
      setTimeout(handleDisconnect, 2000); // Retry connection after 2 seconds
    } else {
        console.log("Connected to the database.");
    }
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

// Root route for keep-alive services and to check if the server is up
app.get("/", (req, res) => {
    res.status(200).send("Backend server is running!");
});

// Test route
app.get("/test", (req, res) => {
  res.status(200).send("Hello from Render and Express!");
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

// Start the server
// Render provides the PORT environment variable.
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
