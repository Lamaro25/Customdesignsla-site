module.exports = function (eleventyConfig) {

  // ------------------------------
  // WATCH ALL FILES
  // ------------------------------
  eleventyConfig.addWatchTarget(".");

  // ------------------------------
  // LAYOUT ALIASES
  // ------------------------------
  eleventyConfig.addLayoutAlias("category", "category.njk");
  eleventyConfig.addLayoutAlias("base", "base.njk");
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
  // PRODUCT COLLECTIONS
  // ------------------------------
  eleventyConfig.addCollection("cuban-link", function (collectionApi) {
    return collectionApi.getFilteredByTag("cuban-link");
  });

  // ------------------------------
  // ** FIXED — Cowboy Hat Pick Collection **
  // ------------------------------
  eleventyConfig.addCollection("cowboy_hat_picks", function (collectionApi) {
    return collectionApi.getFilteredByGlob("content/LTR/cowboy-hat-picks/*.md");
  });

  // ------------------------------
  // GLOBAL COMPUTED DATA
  // ------------------------------
  eleventyConfig.addGlobalData("eleventyComputed", {

    // ----- PERMALINK CONTROLLER -----
    permalink: (data) => {
      const path = data.page.filePathStem || "";

      // Rings
      if (path.includes("content/rings/")) {
        return `/${path.replace("content/", "")}/index.html`;
      }

      // Bracelets
      if (path.includes("content/bracelets")) {
        return `/${path.replace("content/", "")}/index.html`;
      }

      // Charms
      if (path.includes("content/charms")) {
        return `/${path.replace("content/", "")}/index.html`;
      }

      // Bronze
      if (path.includes("content/bronze")) {
        return `/${path.replace("content/", "")}/index.html`;
      }

      // Otherwise follow frontmatter permalink
      return data.permalink;
    },

    // ----- LAYOUT AUTO-SELECTION -----
    layout: (data) => {
      const path = data.page.filePathStem || "";

      if (
        path.includes("content/rings/") ||
        path.includes("content/bracelets/") ||
        path.includes("content/charms/") ||
        path.includes("content/bronze/")
      ) {
        return "product.njk";
      }

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
