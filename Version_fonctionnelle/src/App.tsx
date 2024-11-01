import React, { useRef, useEffect, useState } from 'react';
import Loader from './components/loader';
import StartGame from './components/Canvas/controller'; // Assuming StartGame is a React component
import './App.css';

type Size = {
  height: number;
  width: number;
};

const App = () => {
  const [size, setSize] = useState<Size | null>(null);
  const container = useRef<HTMLDivElement>(null); // Specify the correct element type for ref
  const Padding = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (container.current) {
        setSize({
          height: 900,//container.current.clientHeight - (Padding * 2),
          width: 1620,//container.current.clientWidth - (Padding * 2),
        });
      }
    }, 100);
    return () => clearTimeout(timer); // Clean up the timeout
  }, []); // Removed container.current from dependency array to prevent unnecessary re-runs

  return (
    <div className="App" ref={container}>
      {size ? <StartGame height={size.height} width={size.width} /> : <Loader />}
    </div>
  );
};

export default App;
