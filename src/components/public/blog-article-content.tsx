import type { ReactNode } from "react";

export function BlogArticleContent({ content }: { content: string }) {
  const blocks = parseBlocks(content);

  return (
    <div className="space-y-6 text-[17px] leading-8 text-slate-700">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}

type Block =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;

  const flushParagraph = () => {
    const text = paragraph.join(" ").trim();
    if (text) blocks.push({ type: "paragraph", text });
    paragraph = [];
  };

  const flushList = () => {
    if (list?.items.length) blocks.push(list);
    list = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "h3", text: line.slice(4).trim() });
      continue;
    }

    if (line.startsWith("> ")) {
      flushParagraph();
      flushList();
      blocks.push({ type: "quote", text: line.slice(2).trim() });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(line.replace(/^[-*]\s+/, ""));
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(line.replace(/^\d+\.\s+/, ""));
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}

function renderBlock(block: Block, index: number): ReactNode {
  if (block.type === "h2") {
    return <h2 key={index} className="pt-5 text-3xl font-black leading-tight text-[#071A3D]">{block.text}</h2>;
  }

  if (block.type === "h3") {
    return <h3 key={index} className="pt-3 text-2xl font-black leading-tight text-[#071A3D]">{block.text}</h3>;
  }

  if (block.type === "quote") {
    return <blockquote key={index} className="rounded-r-xl border-l-4 border-[#D4AF37] bg-amber-50 px-6 py-5 font-semibold italic text-slate-700">{block.text}</blockquote>;
  }

  if (block.type === "ul") {
    return (
      <ul key={index} className="space-y-2 pl-6">
        {block.items.map((item) => <li key={item} className="list-disc pl-1">{item}</li>)}
      </ul>
    );
  }

  if (block.type === "ol") {
    return (
      <ol key={index} className="space-y-2 pl-6">
        {block.items.map((item) => <li key={item} className="list-decimal pl-1">{item}</li>)}
      </ol>
    );
  }

  return <p key={index}>{block.text}</p>;
}
