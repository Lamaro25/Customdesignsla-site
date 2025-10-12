module.exports = function (eleventyConfig) {
  // ✅ Copy static assets and admin folder
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addPassthroughCopy("styles.css");

  // ✅ Automatically generate permalinks for product collections
  eleventyConfig.addGlobalData("eleventyComputed", {
    permalink: (data) => {
      const path = data.page.filePathStem || "";

      // Bracelets
      if (path.includes("content/bracelets")) {
        return `/bracelets/${data.page.fileSlug}/index.html`;
      }

      // Rings
      if (path.includes("content/rings")) {
        return `/rings/${data.page.fileSlug}/index.html`;
      }

      // Charms
      if (path.includes("content/charms")) {
        return `/charms/${data.page.fileSlug}/index.html`;
      }

      // Bronze Age
      if (path.includes("content/bronze")) {
        return `/bronze/${data.page.fileSlug}/index.html`;
      }

      // Default: use whatever Eleventy would normally output
      return data.permalink;
    },
  });

  // ✅ Define Eleventy input and output directories
  return {
    dir: {
      input: ".",
      output: "_site",
    },
  };
};
