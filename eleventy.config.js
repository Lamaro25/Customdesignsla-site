module.exports = function (eleventyConfig) {
  // ✅ Force full rebuild on Netlify to clear cached layouts
  eleventyConfig.addWatchTarget(".");

  // ✅ Layout aliases (resolves any layout: "layouts/..." or direct references)
  eleventyConfig.addLayoutAlias("base", "base.njk");
  eleventyConfig.addLayoutAlias("product", "product.njk");
  eleventyConfig.addLayoutAlias("category", "category.njk");
  eleventyConfig.addLayoutAlias("layouts/base.njk", "base.njk");
  eleventyConfig.addLayoutAlias("layouts/product.njk", "product.njk");
  eleventyConfig.addLayoutAlias("layouts/category.njk", "category.njk");

  // ✅ Copy static assets and CMS admin folder
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addPassthroughCopy("styles.css");

  // ✅ Dynamic permalink + auto layout assignment for collections
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

      // fallback to front-matter layout
      return data.layout || "base.njk";
    },
  });

  return {
    dir: {
      input: ".",
      includes: "_includes",
      output: "_site",
    },
  };
};
