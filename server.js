const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = process.env.VERCEL ? path.join('/tmp', 'answers.json') : path.join(__dirname, "answers.json");

app.use(cors());
app.use(bodyParser.json());

// Serve static files
app.use(express.static(__dirname));

// Ensure answers.json exists
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// API endpoint to receive answers
app.post("/api/submit-answers", (req, res) => {
  const { name, answers, timestamp } = req.body;

  // Read existing data
  let allAnswers = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));

  const userName = name || "Anonymous";

  // Check if this user already submitted
  const existingUserIndex = allAnswers.findIndex(
    (item) => item.name === userName,
  );

  if (existingUserIndex !== -1) {
    // User already submitted - update their answers instead of rejecting
    allAnswers[existingUserIndex].answers = {
      ...allAnswers[existingUserIndex].answers,
      ...answers,
    };
    allAnswers[existingUserIndex].timestamp = timestamp;
  } else {
    // New user - add new submission
    allAnswers.push({
      id: allAnswers.length + 1,
      name: userName,
      answers,
      timestamp,
    });
  }

  // Write back to file
  fs.writeFileSync(DATA_FILE, JSON.stringify(allAnswers, null, 2));

  res.json({ success: true, message: "Answer saved successfully" });
});

// API endpoint to get all answers (Admin)
app.get("/api/admin/answers", (req, res) => {
  const allAnswers = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  res.json(allAnswers);
});

// Serve admin page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// Serve main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "timepass.html"));
});

app.listen(PORT, () => {
  console.log(`✓ Server running at http://localhost:${PORT}`);
  console.log(`✓ Quiz: http://localhost:${PORT}`);
  console.log(`✓ Admin: http://localhost:${PORT}/admin`);
});
