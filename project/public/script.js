export class GptObj {
    constructor() {
        this.sentences = [];
        this.currentSentenceIndex = 0;
    }

    addSentences(sentences) {
        this.sentences = sentences.map((sentence) => sentence.split(" "));
        this.currentSentenceIndex = 0;
    }

    getCurrentSentence() {
        return this.sentences[this.currentSentenceIndex];
    }

    giveNextWord() {
        const currentSentence = this.sentences[this.currentSentenceIndex] || [];
        const word = currentSentence.shift();
        if (!currentSentence.length) {
            this.currentSentenceIndex++;
        }
        return word || "";
    }
}

const gptObj = new GptObj();

export function fetchAndPlayAudio(difficulty, genre) {
    fetch("/testGPT", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty, genre }),
    })
        .then((response) => {
            if (!response.ok) throw new Error("Network response was not ok.");
            return response.blob();
        })
        .then((blob) => {
            const audioURL = URL.createObjectURL(blob);
            const audio = new Audio(audioURL);
            audio.play();
            document.getElementById("getData").disabled = true;
            audio.onended = () => {
                document.getElementById("getData").disabled = false;
            };
        })
        .catch((error) => console.error("Fetch error:", error));
}

document.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("getData").addEventListener("click", () => {
        const difficulty = document.getElementById("difficultySelect").value;
        const genre = document.getElementById("genreSelect").value;

        if (!difficulty || !genre) {
            alert("Please select both difficulty and genre.");
            return;
        }

        fetchAndPlayAudio(difficulty, genre);
    });
});
