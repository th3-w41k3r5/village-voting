const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

let names = fs.readFileSync('server/villagename.txt', 'utf-8').split('\n').map(name => name.trim()).filter(name => name);
let votes = {};
let round = 1;

app.get('/names', (req, res) => {
  res.json(names);
});

app.post('/vote', (req, res) => {
  const { voter, name } = req.body;
  if (!votes[round]) votes[round] = {};
  votes[round][voter] = name;
  res.status(200).send('Vote submitted');
});

app.get('/results', (req, res) => {
  const currentVotes = votes[round] || {};
  const voteCounts = names.reduce((acc, name) => {
    acc[name] = Object.values(currentVotes).filter(vote => vote === name).length;
    return acc;
  }, {});
  res.json(voteCounts);
});

app.post('/next-round', (req, res) => {
  const currentVotes = votes[round] || {};
  const voteCounts = names.reduce((acc, name) => {
    acc[name] = Object.values(currentVotes).filter(vote => vote === name).length;
    return acc;
  }, {});

  const minVotes = Math.min(...Object.values(voteCounts));
  names = names.filter(name => voteCounts[name] !== minVotes);

  if (names.length > 1) {
    round++;
    res.status(200).send('Next round started');
  } else {
    res.status(200).send('Voting complete');
  }
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
