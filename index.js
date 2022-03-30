//setup express and dependencies
const express = require("express");
const bp = require("body-parser");
const app = express();
const fs = require("fs");
const path = require('path');
const { v4: uuidv4 } = require('uuid');

//setup bodyParser
app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());

//setting some file paths
const indexHtml = path.resolve('index.html');
const questionsJson = path.resolve('questions.json');

//'database' helpers
let db = [];
const writedb = submission => {
  submission.id = uuidv4();
  db.push(submission);
};

const readdb = accepted => {
  return JSON.stringify(db.filter(x => x.accepted === accepted));
};

//read in questions with answer files, setup validation helper
const questions = JSON.parse(fs.readFileSync(questionsJson, 'utf-8'));
const validAnswers = questions.map(x => x.a);
const isAccepted = givenAnswers => JSON.stringify(givenAnswers) == JSON.stringify(validAnswers);

//home page and all data pages
app.get('/', (req, res) => res.sendFile(indexHtml));
app.get('/q', (req, res) => res.sendFile(questionsJson));
app.get('/a', (req, res) => res.end(readdb(true)));
app.get('/r', (req, res) => res.end(readdb(false)));
app.get('/all', (req, res) => res.end(JSON.stringify(db)));

//checker
app.post('/check', (req, res) => {
  const submission = req.body;
  submission.accepted = isAccepted(submission.answers);
  submission.timestamp = Date.now();
  writedb(submission);
  res.end(JSON.stringify(submission));
});

//resetter
app.get('/reset', (req, res) => {
  db = []
  res.end(JSON.stringify(db))
});

//listen
app.listen(5000, () => {
  console.log("Running on port 5000.");
});

// Export the Express API
module.exports = app;