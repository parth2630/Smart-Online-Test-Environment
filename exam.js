document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('test-code-form');
    const testCodeInput = document.getElementById('test-code');
    const examContainer = document.getElementById('exam-container');
    const questionContainer = document.getElementById('question-container');
    const nextButton = document.getElementById('next-question');
    const submitButton = document.getElementById('submit-test');
    const timerElement = document.getElementById("time-left");
    const videoElement = document.getElementById("camera-stream");

    let currentQuestion = 0;
    let test = {};
    let answers = [];
    let warnings = 0;
    const maxWarnings = 3;
    let timeLeft;
    let cameraStream;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const testCode = testCodeInput.value;
        const response = await fetch(`/get-test/${testCode}`);
        if (response.status === 404) {
            alert('Test not found');
            return;
        }
        test = await response.json();
        timeLeft = test.timeLimit * 60;
        startExam();
    });

    async function startExam() {
        try {
            // Enter full-screen mode
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) { // Firefox
                await document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari, and Opera
                await document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
                await document.documentElement.msRequestFullscreen();
            }
        } catch (err) {
            console.error("Error entering full-screen mode:", err);
        }

        examContainer.style.display = "block";
        form.style.display = "none";
        startTimer();
        displayQuestion();
        startVideoStream();
        detectTabSwitch();
        detectRetina();  // Call retina detection function
    }

    function startTimer() {
        const timerInterval = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                submitTest();
            }
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
            timeLeft--;
        }, 1000);
    }

    function displayQuestion() {
        const question = test.questions[currentQuestion];
        questionContainer.innerHTML = `
            <div>
                <h2>${question.question}</h2>
                <label><input type="radio" name="answer" value="A"> ${question.options.A}</label>
                <label><input type="radio" name="answer" value="B"> ${question.options.B}</label>
                <label><input type="radio" name="answer" value="C"> ${question.options.C}</label>
                <label><input type="radio" name="answer" value="D"> ${question.options.D}</label>
            </div>
        `;
    }

    nextButton.addEventListener('click', () => {
        const answer = document.querySelector('input[name="answer"]:checked');
        if (answer) {
            answers.push({
                question: test.questions[currentQuestion].question,
                answer: answer.value,
                correctAnswer: test.questions[currentQuestion].correctAnswer,
                marks: test.questions[currentQuestion].marks
            });
        }
        if (currentQuestion < test.questions.length - 1) {
            currentQuestion++;
            displayQuestion();
        } else {
            nextButton.style.display = 'none';
            submitButton.style.display = 'block';
        }
    });

    submitButton.addEventListener('click', submitTest);

    async function submitTest() {
        stopVideoStream();
        // Exit full-screen mode on test submission
        if (document.fullscreenElement) {
            await document.exitFullscreen();
        }
        const response = await fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ testCode: test.testCode, answers })
        });
        
        const result = await response.json();

        const params = new URLSearchParams({
            score: result.score,
            totalMarks: result.totalMarks,
            percentage: result.percentage
        });
        window.location.href = `/result.html?${params.toString()}`;
    }

    function startVideoStream() {
        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
            cameraStream = stream;
            videoElement.srcObject = stream;
            videoElement.play();
        }).catch(err => {
            console.error("Error accessing camera:", err);
            alert("Unable to access camera. Please check your browser permissions.");
        });
    }

    function stopVideoStream() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }
    }

    async function detectRetina() {
        try {
            const model = await blazeface.load();
            console.log("BlazeFace model loaded successfully.");
    
            let previousFacePosition = null;
    
            const detectInterval = setInterval(async () => {
                const predictions = await model.estimateFaces(videoElement, false);
                console.log("Face predictions:", predictions);
    
                if (predictions.length === 0) {
                    // No face detected
                    warnings++;
                    alert(`Warning ${warnings}: Eyes not detected!`);
                } else if (predictions.length > 1) {
                    // Multiple faces detected
                    warnings++;
                    alert(`Warning ${warnings}: Multiple faces detected!`);
                } else {
                    // Single face detected, check for movement
                    const currentFace = predictions[0];
                    if (previousFacePosition) {
                        const faceMoved = detectFaceMovement(previousFacePosition, currentFace);
                        if (faceMoved) {
                            warnings++;
                            alert(`Warning ${warnings}: Face movement detected!`);
                        }
                    }
                    previousFacePosition = currentFace;
                }
    
                if (warnings >= maxWarnings) {
                    clearInterval(detectInterval);
                    submitTest();
                } else {
                    // Re-enter full-screen mode if exited
                    if (!document.fullscreenElement) {
                        await enterFullScreen();
                    }
                }
            }, 1000);
        } catch (err) {
            console.error("Error with retina detection or BlazeFace model:", err);
        }
    }
    
    /**
     * Detect if the face has moved significantly compared to the previous detection.
     * @param {Object} previousFace - The previous face detection.
     * @param {Object} currentFace - The current face detection.
     * @returns {boolean} - Returns true if significant face movement is detected.
     */
    function detectFaceMovement(previousFace, currentFace) {
        const movementThreshold = 50; // Adjust this threshold for sensitivity
    
        // Compare key face landmarks: top-left and bottom-right corners of the bounding box
        const [prevX, prevY] = previousFace.topLeft;
        const [currX, currY] = currentFace.topLeft;
    
        const [prevX2, prevY2] = previousFace.bottomRight;
        const [currX2, currY2] = currentFace.bottomRight;
    
        // Calculate the Euclidean distance between previous and current face positions
        const distanceMoved = Math.sqrt(Math.pow(currX - prevX, 2) + Math.pow(currY - prevY, 2)) +
            Math.sqrt(Math.pow(currX2 - prevX2, 2) + Math.pow(currY2 - prevY2, 2));
    
        return distanceMoved > movementThreshold;
    }
    

    function detectTabSwitch() {
        document.addEventListener('visibilitychange', async () => {
            if (document.hidden) {
                warnings++;
                alert(`Warning ${warnings}: Tab switch detected!`);
                if (warnings >= maxWarnings) {
                    submitTest();
                } else {
                    if (!document.fullscreenElement) {
                        await enterFullScreen();
                    }
                }
            }
        });
    }

    async function enterFullScreen() {
        try {
            if (document.documentElement.requestFullscreen) {
                await document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                await document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                await document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                await document.documentElement.msRequestFullscreen();
            }
        } catch (err) {
            console.error("Error re-entering full-screen mode:", err);
        }
    }
});
