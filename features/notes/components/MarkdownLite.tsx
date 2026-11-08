import { Fragment, type ReactNode } from 'react'

/** **bold** → <strong>; everything else stays plain text (no HTML is ever interpreted) */
function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={i} className='font-semibold text-[var(--text-primary)]'>
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}

/**
 * Safe renderer for transcriptions and AI output: headings, bullet lists, paragraphs, bold.
 * Text is rendered as React text nodes, so note content can't inject markup (docs/SECURITY.md).
 */
export function MarkdownLite({ source }: { source: string }) {
  const blocks: ReactNode[] = []
  let list: string[] = []
  const flushList = () => {
    if (!list.length) return
    blocks.push(
      <ul key={`ul-${blocks.length}`} className='my-3 space-y-1.5 pl-5 [&>li]:list-disc [&>li]:marker:text-[var(--color-brand)]'>
        {list.map((item, i) => (
          <li key={i}>{inline(item)}</li>
        ))}
      </ul>,
    )
    list = []
  }

  source.split('\n').forEach((raw) => {
    const line = raw.trimEnd()
    if (/^[-*]\s+/.test(line)) {
      list.push(line.replace(/^[-*]\s+/, ''))
      return
    }
    flushList()
    if (!line.trim()) return
    if (line.startsWith('## ')) {
      blocks.push(
        <h3 key={blocks.length} className='mt-6 mb-1 font-serif text-xl font-semibold text-[var(--text-primary)]'>
          {inline(line.slice(3))}
        </h3>,
      )
    } else if (line.startsWith('# ')) {
      blocks.push(
        <h2 key={blocks.length} className='mt-2 mb-2 font-serif text-2xl font-semibold text-[var(--text-primary)]'>
          {inline(line.slice(2))}
        </h2>,
      )
    } else {
      blocks.push(
        <p key={blocks.length} className='my-3'>
          {inline(line)}
        </p>,
      )
    }
  })
  flushList()

  return <div className='font-serif text-[17px] leading-[1.75] text-[var(--text-secondary)]'>{blocks}</div>
}
