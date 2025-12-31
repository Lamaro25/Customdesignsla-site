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

  eleventyConfig.addCollection("western", function (collectionApi) {
  return collectionApi
    .getFilteredByGlob("content/rings/western/**/*.md")
    .filter(item => item.data.sku)
    .sort((a, b) => a.data.sku.localeCompare(b.data.sku));
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
    const path = (data.page.filePathStem || "").replace(/^\/+/, "");

    if (path.startsWith("rings/")) return `/${path}/index.html`;
    if (path.startsWith("bracelets/")) return `/${path}/index.html`;
    if (path.startsWith("charms/")) return `/${path}/index.html`;
    if (path.startsWith("bronze/")) return `/${path}/index.html`;

    return data.permalink;
  },

  layout: (data) => {
    const path = (data.page.filePathStem || "").replace(/^\/+/, "");

    const isProductFamily =
      path.startsWith("rings/") ||
      path.startsWith("bracelets/") ||
      path.startsWith("charms/") ||
      path.startsWith("bronze/");

    // Detect ONLY true collection landing pages
    // Example: rings/cuban-link/index
    const parts = path.split("/");
    const isCollectionIndex =
      parts.length === 3 && parts[2] === "index";

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
