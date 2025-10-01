module.exports = function(eleventyConfig) {
  // Copy assets directly to the output folder
  eleventyConfig.addPassthroughCopy("styles.css");
  eleventyConfig.addPassthroughCopy("static");

  return {
    dir: {
      input: "content",       // all your markdown/products live here
      includes: "_includes",  // 👈 tells Eleventy to look in content/_includes
      layouts: "_includes",   // 👈 layouts also live in content/_includes
      output: "_site"         // Netlify serves this folder
    },
    templateFormats: ["md", "njk", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
