module.exports = function (eleventyConfig) {
  // ✅ Force full rebuilds (useful on Netlify for clearing cached templates)
  eleventyConfig.addWatchTarget(".");

  // ✅ Layout aliases for compatibility
  eleventyConfig.addLayoutAlias("category", "category.njk");
  eleventyConfig.addLayoutAlias("layouts/category.njk", "category.njk");
  eleventyConfig.addLayoutAlias("base", "base.njk");
  eleventyConfig.addLayoutAlias("layouts/base.njk", "base.njk");
  eleventyConfig.addLayoutAlias("product", "product.njk");
  eleventyConfig.addLayoutAlias("layouts/product.njk", "product.njk");

  // ✅ Passthrough copies (these files/folders get sent to _site as-is)
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addPassthroughCopy("styles.css"); // <-- ensures styling loads live

  // ✅ Computed data for automatic permalink + default layout logic
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

      return data.layout || "base.njk"; // ✅ fallback for safety
    },
  });

  // ✅ Return Eleventy directory structure
  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site",
    },
  };
};
