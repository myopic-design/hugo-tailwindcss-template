const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const tailwindcss = require("tailwindcss");

const tailwindConfig = process.env.HUGO_FILE_TAILWIND_CONFIG_JS || "./tailwind.config.js";

module.exports = {
  plugins: [
    tailwindcss(tailwindConfig),
    autoprefixer,
    ...(process.env.HUGO_ENVIRONMENT === "production" ? [cssnano] : []),
  ],
};
