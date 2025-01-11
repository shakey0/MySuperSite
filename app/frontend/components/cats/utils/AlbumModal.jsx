import './AlbumModal.scoped.scss';
import Color from "color";
import getHexColor from "./getHexColor";

function adjustColor(inputColor, maxDarknessLevel = 0.85, minLightnessLevel = 0.85) {
  try {
    const color = Color(inputColor);

    // Calculate relative luminance manually
    const [r, g, b] = color.rgb().array().map((channel) => {
      const normalized = channel / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Adjust color if luminance is below maxDarknessLevel
    if (luminance < maxDarknessLevel) {
      const adjusted = color.lightness(100 * maxDarknessLevel);
      return adjusted.hex();
    }

    // Adjust color if luminance is above minLightnessLevel
    if (luminance > minLightnessLevel) {
      const adjusted = color.lightness(100 * minLightnessLevel);
      return adjusted.hex();
    }

    return color.hex();
  } catch (error) {
    console.error("Error adjusting color:", inputColor, error);
    return "#FFFFFF";
  }
}

export default function AlbumModal({ isOpen, onClose, colors, children }) {
  if (!isOpen) return null;

  let color_1, color_2;
  if (colors && typeof colors === 'object') {
    ({ color_1, color_2 } = colors);
  } else {
    color_1 = 'gray';
    color_2 = null;
  }  

  const modalContentBackground = { style: { background: `linear-gradient(to bottom right, white` } };

  for (let i = 1; i <= 4; i++) {
    const color = i % 2 === 0 ? getHexColor(color_1) : color_2 ? getHexColor(color_2) : getHexColor(color_1);
    modalContentBackground.style.background += `, ${adjustColor(color)}, white`;
  }
  modalContentBackground.style.background += `)`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={modalContentBackground.style}>
        <div className="modal-close-box">
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
