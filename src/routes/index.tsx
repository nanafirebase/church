import { createFileRoute } from "@tanstack/react-router";
import { Homepage } from "@/components/homepage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Unfold Jesus — Questions about Jesus, explained simply" },
      { name: "description", content: "Explore honest questions about Jesus, faith, and the Bible through clear explanations rooted in Scripture." },
      { property: "og:title", content: "Unfold Jesus — Questions about Jesus, explained simply" },
      { property: "og:description", content: "Ask the question. Open Scripture. Understand it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Homepage,
});
