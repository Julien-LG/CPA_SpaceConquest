// Triangle.js
import React, { useState, useEffect } from 'react';
import './Shapes.css'; // Styles for shapes

const Triangle = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "ArrowUp":
          setPosition(prevPosition => ({ ...prevPosition, y: prevPosition.y - 10 }));
          break;
        case "ArrowDown":
          setPosition(prevPosition => ({ ...prevPosition, y: prevPosition.y + 10 }));
          break;
        case "ArrowLeft":
          setPosition(prevPosition => ({ ...prevPosition, x: prevPosition.x - 10 }));
          break;
        case "ArrowRight":
          setPosition(prevPosition => ({ ...prevPosition, x: prevPosition.x + 10 }));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="triangle" style={{ top: position.y, left: position.x }}>
      <div className="triangle-up"></div>
    </div>
  );
}

export default Triangle;
