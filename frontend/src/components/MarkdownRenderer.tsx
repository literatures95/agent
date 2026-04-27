import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import { Alert, AlertDescription } from './ui/alert';
import { Card } from './ui/card';
import { cn } from '../lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const components = {
    h1: ({ children }: any) => (
      <h1 className="text-2xl font-bold mt-4 mb-2 text-primary">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-xl font-semibold mt-4 mb-2 text-primary">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-lg font-semibold mt-3 mb-2 text-primary">{children}</h3>
    ),
    p: ({ children }: any) => (
      <p className="mb-3 leading-relaxed">{children}</p>
    ),
    ul: ({ children }: any) => (
      <ul className="mb-3 space-y-1 ml-4 list-disc">{children}</ul>
    ),
    ol: ({ children }: any) => (
      <ol className="mb-3 space-y-1 ml-4 list-decimal">{children}</ol>
    ),
    li: ({ children }: any) => (
      <li className="leading-relaxed">{children}</li>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-600">
        {children}
      </blockquote>
    ),
    code: ({ inline, children }: any) => {
      if (inline) {
        return (
          <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
            {children}
          </code>
        );
      }
      return (
        <Card className="my-4">
          <pre className="p-4 overflow-x-auto">
            <code className="text-sm font-mono">{children}</code>
          </pre>
        </Card>
      );
    },
    pre: ({ children }: any) => (
      <Card className="my-4">
        <pre className="p-4 overflow-x-auto">{children}</pre>
      </Card>
    ),
    table: ({ children }: any) => (
      <Card className="my-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {children}
          </table>
        </div>
      </Card>
    ),
    th: ({ children }: any) => (
      <th className="border-b border-gray-200 p-3 text-left font-semibold bg-gray-50">
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className="border-b border-gray-200 p-3">
        {children}
      </td>
    ),
    hr: () => <hr className="my-4 border-gray-200" />,
    a: ({ href, children }: any) => (
      <a
        href={href}
        className="text-primary hover:text-primary/80 underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    img: ({ src, alt }: any) => (
      <div className="my-4">
        <img
          src={src}
          alt={alt}
          className="rounded-lg max-w-full h-auto"
        />
      </div>
    ),
  };

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}