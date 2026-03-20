const fs = require('fs');
const path = require('path');

const DATA_FILE = process.env.VERCEL ? '/tmp/answers.json' : path.join(process.cwd(), 'answers.json');

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  if (!fs.existsSync(DATA_FILE)) {
    return res.status(200).json([]);
  }

  try {
    const allAnswers = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    return res.status(200).json(allAnswers);
  } catch (e) {
    return res.status(200).json([]);
  }
}
