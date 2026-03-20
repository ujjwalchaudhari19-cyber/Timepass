const fs = require('fs');
const path = require('path');

const DATA_FILE = process.env.VERCEL ? '/tmp/answers.json' : path.join(process.cwd(), 'answers.json');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // Ensure answers.json exists
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }

  const { name, answers, timestamp } = req.body;
  let allAnswers = [];
  
  try {
    const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
    if (fileContent) {
      allAnswers = JSON.parse(fileContent);
    }
  } catch (e) {
    allAnswers = [];
  }

  const userName = name || 'Anonymous';
  const existingUserIndex = allAnswers.findIndex((item) => item.name === userName);

  if (existingUserIndex !== -1) {
    allAnswers[existingUserIndex].answers = {
      ...allAnswers[existingUserIndex].answers,
      ...answers,
    };
    allAnswers[existingUserIndex].timestamp = timestamp;
  } else {
    allAnswers.push({
      id: allAnswers.length + 1,
      name: userName,
      answers,
      timestamp,
    });
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(allAnswers, null, 2));

  return res.status(200).json({ success: true, message: 'Answer saved successfully' });
}
