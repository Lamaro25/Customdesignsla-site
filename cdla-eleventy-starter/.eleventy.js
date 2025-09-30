module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("static");

  return {
    dir: {
      input: "content",
      includes: "../_includes",  // point to correct folder
      layouts: "../_includes",   // ensure layouts are found
      output: "_site"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
