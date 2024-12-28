import { useEffect, useRef, useState } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('Type this as fast as you can!');
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [correctChars, setCorrectChars] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [textWords, setTextWords] = useState(text.split(' '));
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    if (!startTime) setStartTime(new Date());

    if (currentWordIndex + 1 == textWords.length) {
      if (value.slice(-1) === textWords[currentWordIndex].slice(-1)) {
        setCurrentWordIndex((prev) => prev + 1);
        setEndTime(new Date());
      }

      if (value.endsWith(' ')) {
        setEndTime(new Date());
      }
    }

    if (value.endsWith(' ')) {
      const currentWord = value.trim();
      if (currentWord === textWords[currentWordIndex]) {
        setCorrectChars((prev) => prev + currentWord.length);
      }
      setCurrentWordIndex((prev) => prev + 1);
      setInput('');
    }

    if (currentWordIndex === textWords.length - 1 && value.trim() === textWords[currentWordIndex]) {
      setEndTime(new Date());
    }
  };

  const calculateWPM = () => {
    if (!endTime || !startTime) return 0;
    const timeTaken = (endTime.getTime() - startTime.getTime()) / 1000 / 60;
    return Math.round(textWords.length / timeTaken);
  };

  const accuracy = () => {
    if (input.length === 0) return 0;
    return Math.round((correctChars / textWords.join(' ').length) * 100);
  };

  const resetGame = () => {
    setInput('');
    setStartTime(null);
    setEndTime(null);
    setCorrectChars(0);
    setCurrentWordIndex(0);
  };

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta' || e.key === 'Tab') {
        return;
      }

      if (e.key === 'Backspace') {
        setInput((prev) => prev.slice(0, -1));
        return;
      }

      if (e.key === 'Escape') {
        resetGame();
        return;
      }

      if (inputRef.current) {
        inputRef.current.focus();

        const newValue = input + e.key;
        inputRef.current.value = newValue;
        handleInputChange({ target: { value: newValue } });
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [input]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Typing Game</h1>
      <p>
        {currentWordIndex} / {textWords.length}
      </p>
      <div style={{ marginBottom: '10px', fontSize: '18px' }}>
        {textWords.map((word, idx) => {
          return (
            <span key={idx} style={{ marginRight: '5px' }}>
              {word.split('').map((char, charIdx) => {
                const isCurrentWord = idx === currentWordIndex;
                const isCorrect = isCurrentWord && input[charIdx] === char;
                const isIncorrect = isCurrentWord && input[charIdx] && input[charIdx] !== char;
                return (
                  <span
                    key={charIdx}
                    style={{
                      color: isCorrect ? 'green' : isIncorrect ? 'red' : 'black',
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </span>
          );
        })}
      </div>
      <input ref={inputRef} type="hidden" value={input} onChange={handleInputChange} />
      <div style={{ marginTop: '20px' }}>
        <p>WPM: {calculateWPM()}</p>
        <p>Accuracy: {accuracy()}%</p>
        <button onClick={resetGame}>Restart</button>
      </div>
    </div>
  );
}

export default App;
