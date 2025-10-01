module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("static");

  return {
    dir: {
      input: "content",             // markdown lives here
      includes: "content/_includes", // 👈 correct full path to includes
      layouts: "content/_includes",  // 👈 layouts folder
      output: "_site"
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
