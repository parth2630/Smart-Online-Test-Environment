document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('question-form');
    const questionsContainer = document.getElementById('questions-container');
    const addQuestionButton = document.getElementById('add-question');
    const testCodeDiv = document.getElementById('test-code');

    addQuestionButton.addEventListener('click', () => {
        const newQuestion = document.createElement('div');
        newQuestion.classList.add('question');
        newQuestion.innerHTML = `
            <label>Question: <input type="text" name="question" required></label>
            <label>Marks: <input type="number" name="marks" required></label>
            <label>Option A: <input type="text" name="optionA" required></label>
            <label>Option B: <input type="text" name="optionB" required></label>
            <label>Option C: <input type="text" name="optionC" required></label>
            <label>Option D: <input type="text" name="optionD" required></label>
            <label>Correct Answer:
                <select name="correctAnswer" required>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                </select>
            </label>
        `;
        questionsContainer.appendChild(newQuestion);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const questions = [];

        for (let i = 0; i < formData.getAll('question').length; i++) {
            questions.push({
                question: formData.getAll('question')[i],
                marks: formData.getAll('marks')[i],
                options: {
                    A: formData.getAll('optionA')[i],
                    B: formData.getAll('optionB')[i],
                    C: formData.getAll('optionC')[i],
                    D: formData.getAll('optionD')[i]
                },
                correctAnswer: formData.getAll('correctAnswer')[i]
            });
        }

        const timeLimit = formData.get('timeLimit');

        const response = await fetch('/create-test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ questions, timeLimit })
        });
        const result = await response.json();
        testCodeDiv.innerHTML = `Test Code: ${result.testCode}`;
    });
});
