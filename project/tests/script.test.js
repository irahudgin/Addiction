import { GptObj, fetchAndPlayAudio } from "../public/script.js";
import { jest } from "@jest/globals";

test("GptObj initialization", () => {
    const gptObj = new GptObj();
    expect(gptObj.sentences).toEqual([]);
    expect(gptObj.currentSentenceIndex).toBe(0);
});

test("GptObj addSentences", () => {
    const gptObj = new GptObj();
    gptObj.addSentences(["yo wassup", "sup bro"]);
    expect(gptObj.sentences).toEqual([
        ["yo", "wassup"],
        ["sup", "bro"],
    ]);
    expect(gptObj.currentSentenceIndex).toBe(0);
});

test("gptobj giveNextWord", () => {
    const gptObj = new GptObj();
    gptObj.addSentences(["hello world", "goodbye world"]);
    expect(gptObj.giveNextWord()).toBe("hello");
    expect(gptObj.getCurrentSentence()).toEqual(["world"]);
    expect(gptObj.giveNextWord()).toBe("world");
    expect(gptObj.getCurrentSentence()).toEqual(["goodbye", "world"]);
    expect(gptObj.giveNextWord()).toBe("goodbye");
    expect(gptObj.getCurrentSentence()).toEqual(["world"]);
    expect(gptObj.giveNextWord()).toBe("world");
});
// global.fetch = jest.fn(() =>
//     Promise.resolve({
//         ok: true,
//         blob: () => Promise.resolve(new Blob(["audio data"])), // Mock the blob method
//     })
// );
// test("fetchAndPlayAudio", async () => {
//     const difficulty = "easy";
//     const genre = "romance";
//     const audio = await fetchAndPlayAudio(difficulty, genre);
//     console.log(audio);
// });

test("GptObj getCurrentSentence", () => {
    const gptObj = new GptObj();
    gptObj.addSentences(["hello world", "goodbye world"]);
    expect(gptObj.getCurrentSentence()).toEqual(["hello", "world"]);
});

describe("fetchAndPlayAudio", () => {
    beforeEach(() => {
        // Mock the required browser functions and objects
        global.fetch = jest.fn();
        global.Blob = jest.fn();
        global.URL.createObjectURL = jest.fn();
        global.Audio = jest.fn(() => ({
            play: jest.fn(),
            addEventListener: jest.fn(),
        }));
        document.getElementById = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should fetch, create audio, and manipulate the DOM", async () => {
        // Mock fetch
        global.fetch.mockResolvedValue({
            ok: true,
            blob: jest.fn(),
        });

        // Mock Blob
        global.Blob.mockReturnValue({});

        // Mock URL.createObjectURL
        global.URL.createObjectURL.mockReturnValue("mock-audio-url");

        // Mock document.getElementById
        document.getElementById.mockReturnValue({ disabled: false });

        await fetchAndPlayAudio("easy", "romance");

        // Assertions:
        expect(global.fetch).toHaveBeenCalled();
    });
});
