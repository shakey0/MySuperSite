import { useRef, useEffect } from "react";

const CatPatternBackground = ({ color1, color2, children }) => {
  const canvasRef = useRef(null);

  const drawBlotch = (ctx, x, y, color, size) => {
    ctx.beginPath();
    // Create a random blob-like shape with multiple control points
    const points = 6 + Math.floor(Math.random() * 6); // Random number of "sides"
    for (let i = 0; i < points; i++) {
      const angle = (Math.PI * 2 * i) / points;
      const offsetX = Math.cos(angle) * (size * Math.random());
      const offsetY = Math.sin(angle) * (size * Math.random());
      if (i === 0) {
        ctx.moveTo(x + offsetX, y + offsetY);
      } else {
        ctx.lineTo(x + offsetX, y + offsetY);
      }
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.5 + Math.random() * 0.5; // Vary transparency for natural blending
    ctx.fill();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = window.innerWidth;
    const height = window.innerHeight;
  
    canvas.width = width;
    canvas.height = height;
  
    ctx.clearRect(0, 0, width, height);
  
    const numberOfBlotches = Math.floor((width * height) / 5000); // Dynamic based on screen size
  
    for (let i = 0; i < numberOfBlotches; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = Math.random() * 150 + 50; // Random size
      const color = Math.random() > 0.5 ? color1 : color2;
      drawBlotch(ctx, x, y, color, size);
    }
  }, [color1, color2]);

  console.log('canvasRef', canvasRef);

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          backgroundColor: "white",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1, // Place it behind the children
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </>
  );  
};

export default CatPatternBackground;
