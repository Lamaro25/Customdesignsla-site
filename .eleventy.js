module.exports = function(eleventyConfig) {
  // 🔹 Tell Eleventy where to find the product layout file
  // Any CMS entry using "layout: product.njk" will now render from storefront/product.njk
  eleventyConfig.addLayoutAlias('product', 'storefront/product.njk');

  // 🔹 Copy static assets and CMS to the build output
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addPassthroughCopy("styles.css");

  // 🔹 Define input/output folders for Eleventy
  return {
    dir: {
      input: ".",
      output: "_site"
    }
  };
};
