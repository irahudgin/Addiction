import express from "express";
import axios from "axios";
import path from "path";
import "dotenv/config";
import OpenAI from "openai";
import * as url from "url";
import bodyParser from "body-parser";
import AWS from "aws-sdk";
import { promises as fs } from "fs";

// Setup AWS Polly
AWS.config.update({
    region: "us-west-2", // specify the AWS region
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID, // set your access key id
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // set your secret access key
    },
});

const polly = new AWS.Polly();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const model = "text-davinci-003";
const app = express();
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    const blogs = [
        { title: "Blog 1", snippet: "Lorem ipsum dolor sit amet consectetur" },
        { title: "Blog 2", snippet: "Lorem ipsum dolor sit amet consectetur" },
        { title: "Blog 3", snippet: "Lorem ipsum dolor sit amet consectetur" },
    ];
    res.render("index", { title: "Homepage", blogs });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/register", (req, res) => {
    res.render("signup");
});

app.get("/testGPT", (req, res) => {
    res.render("testButton");
});

app.get("/profile", (req, res) => {
    res.render("profile");
});

app.get("/documentation", (req, res) => {
    res.render("documentation");
});

app.post("/testGPT", async (req, res) => {
    const { difficulty, genre } = req.body;
    var testPrompt = `Write a short story in the genre of ${genre} with a difficulty level of ${difficulty}. Make the story concise, within 15 words.`;

    try {
        const response = await openai.completions.create({
            model: model,
            prompt: testPrompt,
            max_tokens: 100,
            n: 1,
            stop: null,
            temperature: 0.5,
        });

        const chatText = response.choices[0].text.replace(/^\n\n/, "");
        const sentences = chatText.split(/(?<=\.|\?|\!)\s/g);
        let originalSentence = sentences.join(" ");

        // Use Amazon Polly to synthesize the speech
        const pollyParams = {
            Text: sentences.join(" "), // Combine sentences to a single text string
            OutputFormat: "mp3", // You can choose different formats like ogg, pcm
            VoiceId: "Joanna", // You can use different voices
        };

        polly.synthesizeSpeech(pollyParams, (err, data) => {
            if (err) {
                console.error("Error calling Amazon Polly", err);
                res.status(500).send("Error processing text to speech.");
            } else if (data) {
                // Directly send the audio stream as a response
                res.writeHead(200, {
                    "Content-Type": "audio/mp3",
                    "Content-Length": data.AudioStream.length,
                });

                res.write(data.AudioStream);
                res.end();
            }
        });
    } catch (error) {
        console.error("Error with OpenAI completion", error);
        res.status(500).json({ error: "Error processing your request" });
    }
});

/* API */
// Route to get stories based on difficulty and genre
app.get("/api/stories", async (req, res) => {
    const { difficulty, genre } = req.query;

    try {
        const data = await fs.readFile(
            new URL("stories.json", import.meta.url),
            "utf8"
        );
        const stories = JSON.parse(data);

        const filteredStories = stories.filter((story) => {
            return (
                (!difficulty || story.difficulty === difficulty) &&
                (!genre || story.genre === genre)
            );
        });

        if (filteredStories.length > 0) {
            res.json(filteredStories);
        } else {
            res.status(404).json({
                message: "No stories found matching the criteria.",
            });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Internal server error." });
    }
});

app.use((req, res) => {
    res.status(404).render("404");
});

app.listen(3000, "0.0.0.0", function () {
    console.log("Server is listening on port 3000");
});
