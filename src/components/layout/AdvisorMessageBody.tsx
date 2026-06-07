import { Fragment } from "react";

const INLINE_PATTERN = /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = INLINE_PATTERN.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(
        <Fragment key={`${keyPrefix}-t-${index++}`}>{text.slice(last, match.index)}</Fragment>,
      );
    }

    const token = match[0];
    const inner = token.slice(
      token.startsWith("***") ? 3 : token.startsWith("**") || token.startsWith("`") ? 2 : 1,
      token.endsWith("***") ? -3 : -1,
    );

    if (token.startsWith("***")) {
      parts.push(
        <strong key={`${keyPrefix}-b-${index++}`} className="font-semibold text-gray-900">
          {inner}
        </strong>,
      );
    } else if (token.startsWith("**")) {
      parts.push(
        <strong key={`${keyPrefix}-b-${index++}`} className="font-semibold text-gray-900">
          {inner}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      parts.push(
        <code
          key={`${keyPrefix}-c-${index++}`}
          className="px-1 py-0.5 rounded bg-gray-100 text-[11px] font-mono text-blue-900"
        >
          {inner}
        </code>,
      );
    } else {
      parts.push(<em key={`${keyPrefix}-i-${index++}`}>{inner}</em>);
    }

    last = match.index + token.length;
  }

  if (last < text.length) {
    parts.push(<Fragment key={`${keyPrefix}-t-${index}`}>{text.slice(last)}</Fragment>);
  }

  return parts.length > 0 ? parts : [text];
}

function normalizeLine(line: string): string {
  return line.replace(/\\_/g, "_");
}

type AdvisorMessageBodyProps = {
  content: string;
};

/** Renders assistant chat text with basic Markdown formatting (no raw ** or ***). */
export default function AdvisorMessageBody({ content }: AdvisorMessageBodyProps) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let blockIndex = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = normalizeLine(rawLine);

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (/^#{1,3}\s+/.test(line)) {
      const heading = line.replace(/^#{1,3}\s+/, "");
      blocks.push(
        <p key={`h-${blockIndex++}`} className="font-semibold text-gray-900 mt-2 mb-1 first:mt-0">
          {renderInline(heading, `h-${i}`)}
        </p>,
      );
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[-*]\s+/.test(normalizeLine(lines[i]))) {
        const item = normalizeLine(lines[i]).replace(/^[-*]\s+/, "");
        items.push(
          <li key={`li-${i}`} className="pl-0.5">
            {renderInline(item, `li-${i}`)}
          </li>,
        );
        i += 1;
      }
      blocks.push(
        <ul key={`ul-${blockIndex++}`} className="list-disc pl-4 space-y-1 my-1.5">
          {items}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(normalizeLine(lines[i]))) {
        const item = normalizeLine(lines[i]).replace(/^\d+\.\s+/, "");
        items.push(
          <li key={`li-${i}`} className="pl-0.5">
            {renderInline(item, `li-${i}`)}
          </li>,
        );
        i += 1;
      }
      blocks.push(
        <ol key={`ol-${blockIndex++}`} className="list-decimal pl-4 space-y-1 my-1.5">
          {items}
        </ol>,
      );
      continue;
    }

    const paragraph: React.ReactNode[] = [renderInline(line, `p-${i}`)];
    i += 1;
    while (i < lines.length) {
      const next = normalizeLine(lines[i]);
      if (
        !next.trim() ||
        /^#{1,3}\s+/.test(next) ||
        /^[-*]\s+/.test(next) ||
        /^\d+\.\s+/.test(next)
      ) {
        break;
      }
      paragraph.push(<br key={`br-${i}`} />);
      paragraph.push(renderInline(next, `p-${i}-c`));
      i += 1;
    }

    blocks.push(
      <p key={`p-${blockIndex++}`} className="my-1 first:mt-0 last:mb-0">
        {paragraph}
      </p>,
    );
  }

  return <div className="space-y-0.5">{blocks}</div>;
}
