const path = require("path");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("static");

  return {
    dir: {
      input: "content",
      includes: path.join("content", "_includes"), // ✅ absolute-safe path
      layouts: path.join("content", "_includes"),
      output: "_site"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
