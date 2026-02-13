import React, { useEffect, useRef, useState } from "react";

const PHRASE = "Welcome to the Matrix, Neo.";

function randomChar() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return chars[Math.floor(Math.random() * chars.length)];
}

export default function App() {
  const [playerX, setPlayerX] = useState(window.innerWidth / 2);
  const [lines, setLines] = useState([]);
  const [revealedIndex, setRevealedIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const keys = useRef({});

  // Keyboard input
  useEffect(() => {
    const handleDown = (e) => (keys.current[e.key] = true);
    const handleUp = (e) => (keys.current[e.key] = false);
    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
    };
  }, []);

  // Game loop
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      // Move player
      setPlayerX((x) => {
        let newX = x;
        if (keys.current["ArrowLeft"]) newX -= 6;
        if (keys.current["ArrowRight"]) newX += 6;
        return Math.max(0, Math.min(window.innerWidth - 20, newX));
      });

      // Move lines downward
      setLines((prev) =>
        prev
          .map((line) => ({ ...line, y: line.y + 4 }))
          .filter((line) => line.y < window.innerHeight)
      );

      // Add new line randomly
      if (Math.random() < 0.05) {
        setLines((prev) => [...prev, { y: 0 }]);
      }

      // Decrypt progress
      setRevealedIndex((i) => {
        if (i < PHRASE.length) return i + 1;
        return i;
      });

      setScore((s) => s + 1);
    }, 50);

    return () => clearInterval(interval);
  }, [gameOver]);

  // Collision detection
  useEffect(() => {
    lines.forEach((line) => {
      if (
        line.y > window.innerHeight - 40 &&
        line.y < window.innerHeight - 20
      ) {
        setGameOver(true);
      }
    });
  }, [lines]);

  const encryptedText = PHRASE.split("")
    .map((char, index) =>
      index < revealedIndex
        ? char
        : char === " "
        ? " "
        : randomChar()
    )
    .join("");

  return (
    <div className="game-container">
      <div className="text-container">
        <span
          className={
            revealedIndex === PHRASE.length ? "revealed" : "encrypted"
          }
        >
          {encryptedText}
        </span>
      </div>

      <div
        className="player"
        style={{ left: playerX, bottom: 20 }}
      />

      {lines.map((line, i) => (
        <div
          key={i}
          className="line"
          style={{ top: line.y }}
        />
      ))}

      <div className="score">
        Score: {score}
        {gameOver && <div>GAME OVER</div>}
      </div>
    </div>
  );
}
