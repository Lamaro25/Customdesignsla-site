module.exports = function (eleventyConfig) {

  // ------------------------------
  // WATCH ALL FILES
  // ------------------------------
  eleventyConfig.addWatchTarget(".");

  // ------------------------------
  // LAYOUT ALIASES (FIXED)
  // ------------------------------
  eleventyConfig.addLayoutAlias("base", "base.njk");
  eleventyConfig.addLayoutAlias("category", "category.njk");
  eleventyConfig.addLayoutAlias("product", "product.njk");

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
  // PRODUCT COLLECTIONS (EXISTING)
  // ------------------------------
  eleventyConfig.addCollection("cuban-link", function (collectionApi) {
    return collectionApi.getFilteredByTag("cuban-link");
  });

  // ------------------------------
  // LTR — Cowboy Hat Pick Collection (FIXED)
  // ------------------------------
  eleventyConfig.addCollection("cowboy_hat_picks", function (collectionApi) {
    return collectionApi.getFilteredByGlob("content/LTR/cowboy-hat-picks/*.md");
  });

  // ------------------------------
  // GLOBAL COMPUTED DATA
  // ------------------------------
  eleventyConfig.addGlobalData("eleventyComputed", {

    permalink: (data) => {
      const path = data.page.filePathStem || "";

      // Rings
      if (path.includes("content/rings/")) {
        const cleanPath = path.replace("content/", "");
        return `/${cleanPath}/index.html`;
      }

      // Bracelets
      if (path.includes("content/bracelets/")) {
        const cleanPath = path.replace("content/", "");
        return `/${cleanPath}/index.html`;
      }

      // Charms
      if (path.includes("content/charms/")) {
        const cleanPath = path.replace("content/", "");
        return `/${cleanPath}/index.html`;
      }

      // Bronze
      if (path.includes("content/bronze/")) {
        const cleanPath = path.replace("content/", "");
        return `/${cleanPath}/index.html`;
      }

      // All other files use their own permalink
      return data.permalink;
    },

    layout: (data) => {
      const path = data.page.filePathStem || "";

      // Assign product layout automatically for product directories
      if (
        path.includes("content/rings/") ||
        path.includes("content/bracelets/") ||
        path.includes("content/charms/") ||
        path.includes("content/bronze/")
      ) {
        return "product.njk";
      }

      // Default fallback
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
