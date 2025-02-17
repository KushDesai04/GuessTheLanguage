import { useCallback, useEffect, useState } from "react";

interface CodeSnippet {
  language: string;
  code: string;
}

const Home = () => {
  const [score, setScore] = useState<number>(0);
  const [guess, setGuess] = useState<string>("");
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [currentSnippet, setCurrentSnippet] = useState<CodeSnippet | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [correctGuess, setCorrectGuess] = useState<boolean>(false);

  const getRandomSnippet = useCallback(() => {
    if (snippets.length > 0) {
      const randomIndex = Math.floor(Math.random() * snippets.length);
      const selectedSnippet = snippets[randomIndex];
      setCurrentSnippet(selectedSnippet);
      setSnippets((prevSnippets) =>
        prevSnippets.filter((_, index) => index !== randomIndex)
      );
    } else {
      setCurrentSnippet(null);
    }
  }, [snippets]);

  useEffect(() => {
    const fetchSnippets = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("./code_snippets.json");
        const data: CodeSnippet[] = await response.json();
        setSnippets(data);
        getRandomSnippet();
      } catch (error) {
        console.error("Error loading code snippets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSnippets();
  }, []);

  const checkGuess = useCallback(() => {
    if (!guess) {
      document
        .getElementById("guessError")
        ?.style.setProperty("display", "block");
      return;
    }
    document.getElementById("guessError")?.style.setProperty("display", "none");
    console.log(currentSnippet?.language);
    if (currentSnippet?.language == guess.toLowerCase()) {
      setScore(score + 1);
      setCorrectGuess(true);
    } else {
      setCorrectGuess(false);
    }
    setShowAnswer(true);
  }, [guess, currentSnippet, score, getRandomSnippet]);

  const nextLanguage = () => {
    setShowAnswer(false);
    setGuess("");
    getRandomSnippet();
  };

  useEffect(() => {
    const handleKeyDown = (e: { key: string }) => {
      if (e.key === "Enter") {
        checkGuess();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Cleanup function to remove the event listener
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [checkGuess]); // Add checkGuess to the dependency array

  const resetGame = useCallback(() => {
    setIsLoading(true);
    fetch("./code_snippets.json")
      .then((response) => response.json())
      .then((data: CodeSnippet[]) => {
        setSnippets(data);
        getRandomSnippet();
      })
      .catch((error) => console.error("Error resetting game:", error))
      .finally(() => setIsLoading(false));
  }, [getRandomSnippet]);

  if (isLoading) {
    return <div>Loading snippets...</div>;
  }

  if (!currentSnippet) {
    return (
      <div>
        <p>Game Over!</p>
        <p>Score: {score}/10</p>
        <button onClick={resetGame}>Start New Game</button>
      </div>
    );
  }

  const handleGuessInput = (s: string) => {
    setGuess(s);
  };

  return (
    <>
      <p>Score: {score}</p>
      <h1>Guess The Language!</h1>
      {currentSnippet && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            border: "1px solid white",
            borderRadius: "5px",
          }}
        >
          <pre>
            <p style={{ textAlign: "left" }}>{currentSnippet.code}</p>
          </pre>
        </div>
      )}
      <div style={{ marginTop: "5vh" }}>
        <label htmlFor="guessInput" style={{ paddingRight: "1em" }}>
          Language:
        </label>
        <input
          type="text"
          id="guessInput"
          value={guess}
          onChange={(e) => handleGuessInput(e.target.value)}
        ></input>
      </div>

      {showAnswer && (
        <>
          <div style={{ marginTop: "5vh" }}>
            {correctGuess ? (
              <span style={{ color: "lightgreen" }}>Nice one!</span>
            ) : (
              <span style={{ color: "red" }}>Oops, it was actually {currentSnippet?.language}.</span>
            )}
          </div>
          <div>
            <button onClick={nextLanguage} style={{ marginTop: "5vh" }}>
              Next
            </button>
          </div>
        </>
      )}
      {!showAnswer && (
        <>
          <button
            style={{ marginTop: "5vh" }}
            onClick={checkGuess}
            id="guessButton"
          >
            Guess
          </button>
          <p id="guessError" style={{ color: "red", display: "none" }}>
            Make a guess
          </p>
        </>
      )}
    </>
  );
};

export default Home;
