import { defineConfig, s } from "velite";

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: {
    posts: {
      name: "Post",
      pattern: "blog/**/*.md",
      schema: s
        .object({
          title: s.string().max(140),
          description: s.string().max(320),
          pubDate: s.isodate(),
          updatedDate: s.isodate().optional(),
          heroImage: s.string().optional(),
          animation: s.enum(["terminal", "filetree", "phishing-redirect", "websocket-skim"]).optional(),
          draft: s.boolean().default(false),
          slug: s.path(),
          body: s.markdown(),
        })
        .transform((data) => ({
          ...data,
          slug: data.slug.replace(/^blog\//, ""),
          permalink: `/blog/${data.slug.replace(/^blog\//, "")}`,
        })),
    },
  },
});
