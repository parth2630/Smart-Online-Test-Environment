# Smart Online Test Environment

## Overview

This project is a smart online test environment designed to facilitate secure and interactive online examinations. It provides a platform for teachers to create tests and for students to take them with real-time proctoring features such as face detection and tab-switch monitoring.

## Features

- **Teacher Portal**: Create tests with multiple questions, set marks, options, correct answers, and a time limit. Generate a unique test code for students.
- **Student Portal**: Enter a test code to take the exam. The system enforces full-screen mode and provides a secure environment for test-taking.
- **Tab Switch Detection**: The system continuously monitors for tab switches and issues warnings if the student leaves the test window.
- **Multiple Face Detection**: Uses AI to detect if more than one face is present in the camera view and issues warnings accordingly.
- **Continuous Face Detection**: The student's face is continuously monitored throughout the test using BlazeFace to ensure presence and prevent cheating.
- **Auto-Submit After 3 Warnings**: If the student accumulates 3 warnings (for tab switch, face not detected, or multiple faces), the test is automatically submitted.
- **Proctoring**: Uses webcam and AI (BlazeFace) to detect face presence, multiple faces, and significant face movement. Issues warnings and auto-submits the test after 3 warnings.
- **Result Calculation**: Automatic scoring and percentage calculation upon test submission. Results are displayed to the student.

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express
- **AI/ML**: @tensorflow-models/blazeface (for face detection)
- **Other Libraries**: uuid

## Directory Structure

```
Frontend/
  index.html           # Student portal
  exam.js              # Student exam logic
  result.html          # Result display
  shared/styles.css    # Shared styles
  teacher/
    index.html         # Teacher portal
    addQuestions.js    # Teacher test creation logic
server.js              # Express backend
package.json           # Project metadata and dependencies
```

## Setup Instructions

1. **Clone the repository**

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the server**

   ```bash
   npm start
   ```
   The server will run on [http://localhost:8000](http://localhost:8000).

4. **Access the application**
   - **Teacher Portal**: [http://localhost:8000/teacher/index.html](http://localhost:8000/teacher/index.html)
   - **Student Portal**: [http://localhost:8000/index.html](http://localhost:8000/index.html)

## Usage

### For Teachers
1. Go to the Teacher Portal.
2. Fill in the question, marks, options, correct answer, and time limit.
3. Add more questions as needed.
4. Submit to generate a unique test code.
5. Share the test code with students.

### For Students
1. Go to the Student Portal.
2. Enter the test code provided by your teacher.
3. Allow camera access when prompted.
4. The test will start in full-screen mode. Answer questions and navigate using the Next button.
5. The system will monitor for face presence, multiple faces, and tab switches. After 3 warnings, the test will auto-submit.
6. Submit the test to view your result.

## Security & Proctoring
- The system uses BlazeFace (TensorFlow.js) for real-time face detection.
- Monitors for tab switches and exits from full-screen mode.
- Issues warnings and auto-submits after 3 violations.

## License

This project is licensed under the ISC License. 