module.exports = function (eleventyConfig) {
  // ✅ Force full Eleventy rebuild on Netlify (clears cached layouts)
  eleventyConfig.addWatchTarget(".");

  // ✅ Map any old references to the correct layout
  eleventyConfig.addLayoutAlias("category", "category.njk");
  eleventyConfig.addLayoutAlias("layouts/category.njk", "category.njk"); // <- hard redirect old path

  // ✅ Copy static assets and admin folder
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addPassthroughCopy("styles.css");

  // ✅ Automatic permalink + default layout for product collections
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
      return data.layout;
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
