const getHexColor = (color) => {
  switch (color) {
    case "black":
      return "#222222";
    case "brown":
      return "#815537";
    case "dark_gray":
      return "#444444";
    case "gray":
      return "#666666";
    case "light_gray":
      return "#aaaaaa";
    case "dark_ginger":
      return "#cf4914";
    case "ginger":
      return "#f1701a";
    case "dark_blonde":
      return "#d1c55d";
    case "blonde":
      return "#f1eaab";
    case "light_blonde":
      return "#f9f2c4";
    case "white":
      return "#f0f0f0";
    default:
      return "#222222";
  }
};

export default getHexColor;
