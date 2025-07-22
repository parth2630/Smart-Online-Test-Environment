const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

app.use(bodyParser.json());

// Serve static files from the 'Frontend' directory
app.use(express.static(path.join(__dirname, 'Frontend')));

let tests = {};
let results = {};

// Route for the root URL
app.get('/', (req, res) => {
    res.send('Welcome to the Online Test API. Use the appropriate routes to create and take tests.');
});

// Route to create a test
app.post('/create-test', (req, res) => {
    const { questions, timeLimit } = req.body;
    const testCode = uuidv4();
    tests[testCode] = { questions, timeLimit };
    res.json({ testCode });
});

// Route to get test by code
app.get('/get-test/:testCode', (req, res) => {
    const { testCode } = req.params;
    if (tests[testCode]) {
        res.json(tests[testCode]);
    } else {
        res.status(404).send('Test not found');
    }
});

// Route to submit answers and calculate results
app.post('/submit', (req, res) => {
    const { testCode, answers } = req.body;
    if (!results[testCode]) {
        results[testCode] = [];
    }
    results[testCode].push(answers);

    // Calculate score
    let score = 0;
    let totalMarks = 0;

    answers.forEach(answer => {
        totalMarks += answer.marks;
        if (answer.answer === answer.correctAnswer) {
            score += answer.marks;
        }
    });

    const percentage = ((score / totalMarks) * 100).toFixed(2);

    // Return the score, total marks, and percentage
    res.json({ score, totalMarks, percentage });
});

// Start the server on port 3000
app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
