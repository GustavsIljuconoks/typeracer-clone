import { useEffect, useRef, useState, useMemo } from 'react';
import { generate } from 'random-words';
import './App.css';

import { DropdownMenuCheckboxItemProps } from '@radix-ui/react-dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Checked = DropdownMenuCheckboxItemProps['checked'];

function App() {
  const [text, setText] = useState('Type this as fast as you can!');
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [correctChars, setCorrectChars] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const textWords = useMemo(() => text.split(' '), [text]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [wordCount, setWordCount] = useState<number>(20);
  const [quote, setQuote] = useState<boolean>(false);
  const [showFirstBar, setShowFirstBar] = useState<Checked>(true);
  const [showSecondBar, setShowSecondBar] = useState<Checked>(false);
  const [showQuote, setShowQuote] = useState<Checked>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setShowDropdown(false);

    if (!startTime) setStartTime(new Date());

    const currentWord = textWords[currentWordIndex];
    let correctCharCount = 0;

    // Calculate correct characters typed so far
    for (let i = 0; i < Math.min(value.length, currentWord.length); i++) {
      if (value[i] === currentWord[i] && currentWord[i] !== ' ') {
        correctCharCount++;
      }
    }

    if (value.endsWith(' ')) {
      setCorrectChars((prev) => prev + correctCharCount);
      setCurrentWordIndex((prev) => prev + 1);
      setInput('');
    }

    if (currentWordIndex === textWords.length - 1 && value.trim().length >= currentWord.length) {
      setCorrectChars((prev) => prev + correctCharCount);
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
    return Math.round((correctChars / textWords.join('').length) * 100);
  };

  const resetGame = async () => {
    const newText = quote ? await getRandomQuote() : generateRandomWords();
    setText(newText);
    setInput('');
    setStartTime(null);
    setEndTime(null);
    setCorrectChars(0);
    setCurrentWordIndex(0);
    setShowDropdown(true);
  };

  const generateRandomWords = () => {
    const words = generate(wordCount);
    return words.join(' ');
  };

  const getRandomQuote = async () => {
    // TODO: Fetch random quote from an API
    return 'Failure is the stepping stone to success.';
  };

  useEffect(() => {
    resetGame();
  }, [wordCount, quote]);

  const handleWordCountChange = (count: number | string) => {
    const isQuote = typeof count !== 'number';
    setQuote(isQuote);
    setWordCount(isQuote ? 0 : count);
    setShowFirstBar(count === 20);
    setShowSecondBar(count === 30);
    setShowQuote(isQuote && count === 'quote');
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
    <div className="h-full flex flex-col items-center">
      <div className="container">
        <div className="header">
          <h1 className="text-5xl font-semibold">Typing Game</h1>
        </div>
        <div className="mt-32 flex flex-col">
          <div className="flex flex-col items-center">
            {showDropdown && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="default">Change mode</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuCheckboxItem checked={showFirstBar} onCheckedChange={() => handleWordCountChange(20)}>
                    Random 20 words
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={showSecondBar} onCheckedChange={() => handleWordCountChange(30)}>
                    Random 30 words
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={showQuote} onCheckedChange={() => handleWordCountChange('quote')}>
                    Random quote
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {!showDropdown && (
            <p className="ml-[0.5em] text-2xl">
              {currentWordIndex} / {textWords.length}
            </p>
          )}
          <div className="words">
            {textWords.map((word, idx) => {
              return (
                <div key={idx} className="word">
                  {word.split('').map((char, charIdx) => {
                    const isCurrentWord = idx === currentWordIndex;
                    const isCorrect = isCurrentWord && input[charIdx] === char;
                    const isIncorrect = isCurrentWord && input[charIdx] && input[charIdx] !== char;
                    return (
                      <div
                        key={charIdx}
                        style={{
                          color: isCorrect ? 'green' : isIncorrect ? 'red' : 'black',
                        }}
                      >
                        {char}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <input ref={inputRef} type="hidden" value={input} onChange={handleInputChange} />

          {endTime && (
            <div className="flex flex-col items-center mt-8 gap-4">
              <div className="flex flex-row gap-4">
                <p>WPM: {calculateWPM()}</p>
                <p>Accuracy: {accuracy()}%</p>
              </div>
              <button onClick={resetGame}>Restart</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
