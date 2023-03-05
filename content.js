const questionContainer = document.querySelector('.content-container');
const launchGameBtn = document.getElementById("launch-game");
const title = document.getElementById("title");
const instructions = document.getElementById("instructions");
const displayedSongs = [];
let numDisplayedSongs = 0;
let correctAnswersCount = 0;

async function getRandomSong() {
    const token = await APIController.getToken();
    const tracks = await APIController.getPlaylist(token, '2jYwEpPbrNzb1sKsqQwxZP');
    let song, correctAnswer, wrongAnswers, songIndex;
    do {
        const randomIndex = Math.floor(Math.random() * tracks.items.length);
        song = tracks.items[randomIndex].track;
        correctAnswer = song.album.name;
        songIndex = tracks.items.findIndex(item => item.track.album.name === correctAnswer);
        wrongAnswers = incorrectAnswersBySong[songIndex].incorrectAnswers;
    } while (displayedSongs.includes(song.id));
    displayedSongs.push(song.id);
    numDisplayedSongs++;
    return { song, correctAnswer, wrongAnswers };
}

function createQuestionElement(song) {
    const questionWrapper = document.createElement("div");
    questionWrapper.className = "question-wrapper";
    const albumCover = document.createElement("img");
    albumCover.src = song.album.images[1].url;
    const altText = "Cover of the album by " + song.artists[0].name;
    albumCover.alt = altText;
    questionWrapper.appendChild(albumCover);
    return questionWrapper;
  }
  


function createAnswerChoices(correctAnswer, wrongAnswers) {
    const answerChoicesWrapper = document.createElement("div");
    answerChoicesWrapper.className = "answers-wrapper";
    const answerChoices = [];
    answerChoices.push(correctAnswer);
    answerChoices.push(...wrongAnswers);
    answerChoices.sort(() => Math.random() - 0.5);
    answerChoices.forEach(answer => {
        const answerButton = document.createElement("button");
        answerButton.className = "answer-button";
        answerButton.textContent = answer;
        answerButton.addEventListener("click", () => {
            if (answerButton.textContent === correctAnswer) {
                answerButton.classList.add("correct-answer");
                correctAnswersCount += 1;
            } else {
                answerButton.classList.add("wrong-answer");
            }
            answerChoices.forEach(choice => {
                const choiceButton = answerChoicesWrapper.querySelector(`button.answer-button:nth-of-type(${answerChoices.indexOf(choice) + 1})`);
                choiceButton.disabled = true;
            });
            setTimeout(() => {
                launchNextQuestion();
            }, 1300);
        });
        answerChoicesWrapper.appendChild(answerButton);
    });
    return answerChoicesWrapper;
}

function createGameOverMessage(correctAnswersCount) {
    const questionText = document.createElement("p");
    questionText.className = "gameover-message";
    questionText.textContent = `Ton score est de ${correctAnswersCount}/10.`;
    return questionText;
}

function createReplayButton() {
    const replayButton = document.createElement("button");
    replayButton.className = "replay-button";
    const replayIcon = document.createElement("i");
    replayIcon.className = "fa-solid fa-rotate-right";
    replayButton.textContent = "Rejouer";
    replayButton.appendChild(replayIcon);
    return replayButton;
}

function getPreviousScores() {
    const previousScoresJSON = localStorage.getItem("previousScores");
    if (previousScoresJSON) {
        return JSON.parse(previousScoresJSON);
    } else {
        return [];
    }
}

function updatePreviousScores(score) {
    const previousScores = getPreviousScores();
    previousScores.push(score);
    if (previousScores.length > 3) {
        previousScores.shift();
    }
    localStorage.setItem("previousScores", JSON.stringify(previousScores));
}

function createPreviousScores() {
    const previousScoresScreen = document.createElement("div");
    previousScoresScreen.className = "previous-scores-screen";
    updatePreviousScores(correctAnswersCount);
    const previousScores = getPreviousScores();
    const previousScoresHeader = document.createElement("h3");
    previousScoresHeader.className = "previous-scores-header";
    previousScoresHeader.textContent = "Tes derniers scores :";
    previousScoresScreen.appendChild(previousScoresHeader);
    for (let i = previousScores.length - 1; i >= 0; i--) {
        const scoreElement = document.createElement("p");
        scoreElement.textContent = `${previousScores[i]}/10`;
        previousScoresScreen.appendChild(scoreElement);
    }
    return previousScoresScreen;
}

async function launchNextQuestion() {
    try {
        const { song, correctAnswer, wrongAnswers } = await getRandomSong();
        const questionWrapper = createQuestionElement(song);
        const answerChoicesWrapper = createAnswerChoices(correctAnswer, wrongAnswers);
        questionWrapper.appendChild(answerChoicesWrapper);
        const currentQuestion = document.querySelector(".question-wrapper");
        if (numDisplayedSongs > 10) {
            const previousScoresScreen = createPreviousScores();
            const gameOverMessage = createGameOverMessage(correctAnswersCount);
            const replayButton = createReplayButton();
            currentQuestion.innerHTML = "";
            currentQuestion.appendChild(gameOverMessage);
            currentQuestion.appendChild(previousScoresScreen);
            currentQuestion.appendChild(replayButton);
            replayButton.addEventListener("click", replay);
        } else {
            currentQuestion.replaceWith(questionWrapper);
        }
    } catch (err) {
        console.error(err);
    }
}

function replay() {
    displayedSongs.length = 0;
    numDisplayedSongs = 0;
    correctAnswersCount = 0;
    launchNextQuestion();
}

launchGameBtn.addEventListener("click", async () => {
    try {
        const { song, correctAnswer, wrongAnswers } = await getRandomSong();
        const questionWrapper = createQuestionElement(song);
        const answerChoicesWrapper = createAnswerChoices(correctAnswer, wrongAnswers);
        questionWrapper.appendChild(answerChoicesWrapper);
        questionContainer.append(questionWrapper);
        title.classList.add("animate");
        instructions.remove();
        scrollContainer.remove();
        launchGameBtn.remove();
    } catch (err) {
        console.error(err);
    }
});