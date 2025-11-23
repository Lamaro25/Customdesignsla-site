module.exports = function (eleventyConfig) {
  // ------------------------------
  // WATCH ALL FILES
  // ------------------------------
  eleventyConfig.addWatchTarget(".");

  // ------------------------------
  // LAYOUT ALIASES
  // ------------------------------
  eleventyConfig.addLayoutAlias("category", "category.njk");
  eleventyConfig.addLayoutAlias("layouts/category.njk", "category.njk");
  eleventyConfig.addLayoutAlias("base", "base.njk");
  eleventyConfig.addLayoutAlias("layouts/base.njk", "base.njk");
  eleventyConfig.addLayoutAlias("product", "product.njk");
  eleventyConfig.addLayoutAlias("layouts/product.njk", "product.njk");

  // ------------------------------
  // PASSTHROUGH FILES
  // ------------------------------
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addPassthroughCopy("styles.css");

  // ------------------------------
  // PROCESS ALL MARKDOWN IN /content
  // ------------------------------
  eleventyConfig.addCollection("contentPages", function (collectionApi) {
    return collectionApi.getFilteredByGlob("content/**/*.md");
  });

  // ------------------------------
  // PRODUCT COLLECTIONS (BY TAG)
  // ------------------------------
  eleventyConfig.addCollection("cuban-link", function (collectionApi) {
    return collectionApi.getFilteredByTag("cuban-link");
  });

  // ------------------------------
  // GLOBAL COMPUTED DATA
  // ------------------------------
  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink: (data) => {
      const path = data.page.filePathStem || "";

      // Rings (individual product pages)
      // Example: content/rings/cuban-link/cl-001... → /rings/cuban-link/cl-001/index.html
      if (path.includes("content/rings/")) {
        // Use the folder structure as part of the permalink
        const cleanPath = path.replace("content/", "");
        return `/${cleanPath}/index.html`;
      }

      // Bracelets
      if (path.includes("content/bracelets")) {
        const cleanPath = path.replace("content/", "");
        return `/${cleanPath}/index.html`;
      }

      // Charms
      if (path.includes("content/charms")) {
        const cleanPath = path.replace("content/", "");
        return `/${cleanPath}/index.html`;
      }

      // Bronze
      if (path.includes("content/bronze")) {
        const cleanPath = path.replace("content/", "");
        return `/${cleanPath}/index.html`;
      }

      return data.permalink;
    },

    layout: (data) => {
      const path = data.page.filePathStem || "";

      // Any product page inside these folders uses product.njk
      if (
        path.includes("content/rings/") ||
        path.includes("content/bracelets/") ||
        path.includes("content/charms/") ||
        path.includes("content/bronze/")
      ) {
        return "product.njk";
      }

      // Default fallback layout
      return data.layout || "base.njk";
    },
  });

  // ------------------------------
  // ELEVENTY DIRECTORY SETTINGS
  // ------------------------------
  return {
    dir: {
      input: "content",
      includes: "../_includes",
      data: "../data",
      output: "_site",
    },
  };
};
