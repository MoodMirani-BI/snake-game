import { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snake, setSnake] = useState([[10, 10]]);
  const [food, setFood] = useState([15, 15]);
  const [direction, setDirection] = useState([1, 0]); // Moving right initially
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(200); // Milliseconds between moves

  const gridSize = 20; // Grid size
  const tileSize = 30; // Size of each grid square

  // This useRef stores the interval ID for the game loop
  const gameLoopRef = useRef<number | null>(null);

  // Game loop logic
  const updateGame = () => {
    const newSnake = [...snake];
    const head = newSnake[newSnake.length - 1];
    const newHead = [head[0] + direction[0], head[1] + direction[1]];

    // Check collisions with walls or itself
    if (
      newHead[0] < 0 ||
      newHead[1] < 0 ||
      newHead[0] >= gridSize ||
      newHead[1] >= gridSize ||
      newSnake.some(([x, y]) => x === newHead[0] && y === newHead[1])
    ) {
      setIsGameOver(true);
      return;
    }

    // Add new head
    newSnake.push(newHead);

    // Check if the snake eats the food
    if (newHead[0] === food[0] && newHead[1] === food[1]) {
      setFood([Math.floor(Math.random() * gridSize), Math.floor(Math.random() * gridSize)]);
      setScore((prev) => prev + 10);

      // Increase snake speed slightly with each food eaten
      setSpeed((prev) => Math.max(50, prev - 10));
    } else {
      // Remove the tail
      newSnake.shift();
    }

    setSnake(newSnake);
  };

  // Start and stop the game loop
  useEffect(() => {
    if (!isGameOver) {
      gameLoopRef.current = window.setInterval(updateGame, speed);
    } else if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [snake, direction, isGameOver, speed]);

  // Handle keyboard input for controlling the snake
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          if (direction[1] !== 1) setDirection([0, -1]);
          break;
        case 'ArrowDown':
          if (direction[1] !== -1) setDirection([0, 1]);
          break;
        case 'ArrowLeft':
          if (direction[0] !== 1) setDirection([-1, 0]);
          break;
        case 'ArrowRight':
          if (direction[0] !== -1) setDirection([1, 0]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  // Draw the game (snake and food)
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the snake
      snake.forEach(([x, y]) => {
        context.fillStyle = 'limegreen';
        context.strokeStyle = 'darkgreen';
        context.lineWidth = 2;
        context.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        context.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
      });

      // Draw the food
      context.fillStyle = 'red';
      context.beginPath();
      context.arc(
        food[0] * tileSize + tileSize / 2,
        food[1] * tileSize + tileSize / 2,
        tileSize / 2.5,
        0,
        2 * Math.PI
      );
      context.fill();
    }
  }, [snake, food]);

  // Restart the game
  const restartGame = () => {
    setSnake([[10, 10]]);
    setFood([15, 15]);
    setDirection([1, 0]);
    setScore(0);
    setSpeed(200);
    setIsGameOver(false);
  };

  return (
    <div id="root">
      <h1>Snake Game</h1>
      {isGameOver && (
        <h2>
          Game Over! Your Score: {score}{' '}
          <button className="restart-button" onClick={restartGame}>
            Restart
          </button>
        </h2>
      )}
      <p>Score: {score}</p>
      <canvas
        ref={canvasRef}
        width={gridSize * tileSize}
        height={gridSize * tileSize}
        style={{ border: '2px solid #444', background: '#222', margin: '0 auto' }}
      ></canvas>
    </div>
  );
};

export default App;
