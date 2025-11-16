module.exports = function (eleventyConfig) {
  // Watch all files
  eleventyConfig.addWatchTarget(".");

  // Layout aliases
  eleventyConfig.addLayoutAlias("category", "category.njk");
  eleventyConfig.addLayoutAlias("layouts/category.njk", "category.njk");
  eleventyConfig.addLayoutAlias("base", "base.njk");
  eleventyConfig.addLayoutAlias("layouts/base.njk", "base.njk");
  eleventyConfig.addLayoutAlias("product", "product.njk");
  eleventyConfig.addLayoutAlias("layouts/product.njk", "product.njk");

  // Passthrough
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addPassthroughCopy("styles.css");

  // --- IMPORTANT FIX ---
  // Tell Eleventy that all Markdown inside /content should be processed as pages
  eleventyConfig.addCollection("contentPages", function (collectionApi) {
    return collectionApi.getFilteredByGlob("content/**/*.md");
  });

  // Computed permalink + layout
  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink: (data) => {
      const path = data.page.filePathStem || "";

      if (path.includes("content/bracelets"))
        return `/bracelets/${data.page.fileSlug}/index.html`;

      if (path.includes("content/rings"))
        return `/rings/${data.page.fileSlug}/index.html`;

      if (path.includes("content/charms"))
        return `/charms/${data.page.fileSlug}/index.html`;

      if (path.includes("content/bronze"))
        return `/bronze/${data.page.fileSlug}/index.html`;

      return data.permalink;
    },

    layout: (data) => {
      const path = data.page.filePathStem || "";

      if (
        path.includes("content/bracelets") ||
        path.includes("content/rings") ||
        path.includes("content/charms") ||
        path.includes("content/bronze")
      ) {
        return "category.njk";
      }

      return data.layout || "base.njk";
    },
  });

  return {
    dir: {
      input: ".",        // keep root input
      includes: "_includes",
      output: "_site",
    },
  };
};
