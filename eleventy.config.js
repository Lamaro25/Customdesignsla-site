module.exports = function (eleventyConfig) {

  // ------------------------------
  // WATCH ALL FILES
  // ------------------------------
  eleventyConfig.addWatchTarget(".");

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

  eleventyConfig.addCollection("western", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("content/rings/western/**/*.md")
      .filter(item => item.data.sku)
      .sort((a, b) => a.data.sku.localeCompare(b.data.sku));
  });

  eleventyConfig.addCollection("charm", function (collectionApi) {
    return collectionApi
      .getFilteredByTag("charm")
      .filter(item => item.data.sku);
  });

// ------------------------------
// HEART OF FAITH (CHARMS)
// ------------------------------
eleventyConfig.addCollection("heart-of-faith", function (collectionApi) {
  return collectionApi
    .getFilteredByGlob("content/charms/heart-of-faith/**/index.md")
    .filter(item => item.data.sku);
});

  // ------------------------------
  // GLOBAL COMPUTED DATA
  // ------------------------------
  eleventyConfig.addGlobalData("eleventyComputed", {

    permalink: (data) => {
      const path = data.page.filePathStem || "";

      if (path.startsWith("rings/")) {
        return `/${path}/`;
      }

      if (path.startsWith("bracelets/")) {
        return `/${path}/`;
      }

      if (path.startsWith("charms/")) {
        return `/${path}/`;
      }

      if (path.startsWith("bronze/")) {
        return `/${path}/`;
      }

      return data.permalink;
    },

    layout: (data) => {
      const path = data.page.filePathStem || "";

      const isProductFamily =
        path.startsWith("rings/") ||
        path.startsWith("bracelets/") ||
        path.startsWith("charms/") ||
        path.startsWith("bronze/");

      const isCollectionIndex = path.endsWith("/index") || path.endsWith("index");

      if (isProductFamily && isCollectionIndex) {
        return "category.njk";
      }

      if (isProductFamily) {
        return "product.njk";
      }

      return data.layout || "base.njk";
    }

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
