import { marked } from "marked";
import DOMPurify from "dompurify";

// Configure marked for todo-app use
marked.setOptions({
  breaks: true, // Line breaks without double-space
  gfm: true, // GitHub Flavored Markdown (task lists, tables)
});

export function renderMarkdown(src: string): string {
  if (!src) return "";
  const raw = marked.parse(src, { async: false }) as string;
  return DOMPurify.sanitize(raw);
}
