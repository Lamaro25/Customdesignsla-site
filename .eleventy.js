module.exports = function (eleventyConfig) {
  // Copy static assets and admin folder
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("static");
  eleventyConfig.addPassthroughCopy("styles.css");

  // Automatic permalink + default layout for product collections
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
        return "layouts/product.njk";
      }
      return data.layout;
    },
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      layouts: "_includes/layouts",
    },
  };
};
