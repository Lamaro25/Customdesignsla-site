const path = require("path");

module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("cdla-eleventy-starter/styles.css");
  eleventyConfig.addPassthroughCopy("cdla-eleventy-starter/static");

  return {
    dir: {
      input: "cdla-eleventy-starter/content",
      includes: "cdla-eleventy-starter/content/_includes",
      layouts: "cdla-eleventy-starter/content/_includes",
      output: "_site"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
