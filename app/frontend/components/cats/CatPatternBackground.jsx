import { useState, useRef, useEffect } from "react";
import RandomNumberInRange from "../shared/RandomNumberInRange";
import Color from "color";
import getHexColor from "./getHexColor";

function drawRandomTriangle(ctx, canvasWidth, canvasHeight, colors, sizeRange) {
  const size = RandomNumberInRange(sizeRange[0], sizeRange[1]);
  const top = RandomNumberInRange(0, canvasHeight);
  const left = RandomNumberInRange(0, canvasWidth);
  const color = colors[RandomNumberInRange(0, colors.length - 1)];

  const rotation = RandomNumberInRange(0, 360);

  ctx.save();
  ctx.translate(left, top); // Move to random position
  ctx.rotate((rotation * Math.PI) / 180); // Rotate to random angle
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size, 0);
  ctx.lineTo(0, size);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

const CatPatternBackground = ({ colors, children }) => {
  const [count, setCount] = useState(0);
  const canvasRef1 = useRef(null);
  const canvasRef2 = useRef(null);
  const canvasRef3 = useRef(null);
  const canvasRef4 = useRef(null);
  let { color_1, color_1_pattern, color_1_pattern_percent, color_2, color_2_pattern, color_2_pattern_percent, white_percent } = colors || {};
  if (!color_1) {
    color_1 = 'gray';
    color_1_pattern = 'black';
    color_1_pattern_percent = 40;
    color_2 = null;
    color_2_pattern = null;
    color_2_pattern_percent = 0;
    white_percent = 30;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prevCount => prevCount + 1);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const mapBackground = (canvasRef, index) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const quantityReducer = (canvas.width * canvas.height) / 2000000;
      const sizeReducer = quantityReducer > 0.5 ? 1 : quantityReducer > 0.375 ? 0.875 : quantityReducer > 0.25 ? 0.75 : 0.625;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mainColor = index % 2 === 0 ? getHexColor(color_1) : color_2 ? getHexColor(color_2) : getHexColor(color_1);
      const mainColors = [Color(mainColor).lighten(0.05).hex(), Color(mainColor).darken(0.05).hex()];
      for (let i = 0; i < 50 * (quantityReducer / sizeReducer); i++) {
        drawRandomTriangle(ctx, canvas.width, canvas.height, mainColors, [200 * sizeReducer, 300 * sizeReducer]);
      }

      const patternColor = index % 2 === 0 ? color_1_pattern : color_2 ? color_2_pattern : color_1_pattern;
      if (patternColor) {
        const patternPercent = index % 2 === 0 ? color_1_pattern_percent : color_2 ? color_2_pattern_percent : color_1_pattern_percent;
        const patternColors = [getHexColor(patternColor), Color(getHexColor(patternColor)).lighten(0.1).hex(), Color(getHexColor(patternColor)).darken(0.1).hex()];
        for (let i = 0; i < patternPercent * (quantityReducer / sizeReducer); i++) {
          drawRandomTriangle(ctx, canvas.width, canvas.height, patternColors, [150 * sizeReducer, 250 * sizeReducer]);
        }
      }

      if (white_percent > 0) {
        const whiteColors = ['#f0f0f0', Color('#f0f0f0').lighten(0.1).hex()];
        const whiteSizeBreak = white_percent > 35 ? 1.75 : white_percent > 30 ? 1.5 : white_percent > 25 ? 1.25 : 1;
        const whitePercentAdjust = quantityReducer > 0.5 ? white_percent * 1 : quantityReducer > 0.375 ? white_percent * 0.875 : quantityReducer > 0.25 ? white_percent * 0.75 : white_percent * 0.625;
        for (let i = 0; i < (whitePercentAdjust / whiteSizeBreak) * (quantityReducer / sizeReducer); i++) {
          drawRandomTriangle(ctx, canvas.width, canvas.height, whiteColors, [100 * whiteSizeBreak, 200 * whiteSizeBreak]);
        }
      }
    }
  }

  useEffect(() => {
    mapBackground(canvasRef1, 1);
    mapBackground(canvasRef2, 2);
    mapBackground(canvasRef3, 3);
    mapBackground(canvasRef4, 4);
  }, [colors, count]);

  return (
    <>
      <canvas
        ref={canvasRef1}
        style={{
          position: "fixed",
          background: color_2 ? getHexColor(color_2) : getHexColor(color_1),
          top: 0,
          right: 0,
          width: "50%",
          height: "50%",
          zIndex: -1,
          pointerEvents: "none",
        }}
      />
      <canvas
        ref={canvasRef2}
        style={{
          position: "fixed",
          background: getHexColor(color_1),
          top: 0,
          left: 0,
          width: "50%",
          height: "50%",
          zIndex: -1,
          pointerEvents: "none",
        }}
      />
      <canvas
        ref={canvasRef3}
        style={{
          position: "fixed",
          background: color_2 ? getHexColor(color_2) : getHexColor(color_1),
          bottom: 0,
          left: 0,
          width: "50%",
          height: "50%",
          zIndex: -1,
          pointerEvents: "none",
        }}
      />
      <canvas
        ref={canvasRef4}
        style={{
          position: "fixed",
          background: getHexColor(color_1),
          bottom: 0,
          right: 0,
          width: "50%",
          height: "50%",
          zIndex: -1,
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </>
  );
};

export default CatPatternBackground;
