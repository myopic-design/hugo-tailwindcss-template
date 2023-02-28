const typography = require("@tailwindcss/typography");

module.exports = {
  content: ["./content/**/*.md", "./layouts/**/*.html"],
  plugins: [typography],
  darkMode: "class",
};
