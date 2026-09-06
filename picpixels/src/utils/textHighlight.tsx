import React from 'react';

/**
 * Parses a title or heading string and renders highlighted words/phrases with custom colors.
 * 
 * Supported syntaxes:
 * 1. Brand Highlight (defaults to brand orange #FF8A50):
 *    - `{Word}` or `{Multiple words}` -> e.g. "Why {Choose} Us"
 *    - `*Word*` or `**Word**`
 * 
 * 2. Custom Color Highlight:
 *    - `{#FF8A50}Word{/#}` or `{#FF8A50}Word{/}`
 *    - `{color:#FF8A50}Word{/color}` or `{color:red}Word{/color}`
 *    - `[color=#FF8A50]Word[/color]` or `[color:#FF8A50]Word[/color]`
 * 
 * 3. HTML Spans:
 *    - `<span style="color: #FF8A50">Word</span>`
 *    - `<span class="highlight">Word</span>`
 */
export function renderHighlightedText(text: string, baseColor?: string): React.ReactNode {
  if (!text) return null;

  // Regex matches custom color blocks, HTML spans/fonts, brand braces {text}, and markdown *text*
  const pattern = /(?:\{color:([#a-zA-Z0-9]+)\}(.*?)\{\/color\})|(?:\{(#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[a-zA-Z]+))\}(.*?)\{\/#?\})|(?:\[color[:=]([#a-zA-Z0-9]+)\](.*?)\[\/color\])|(?:<(?:span|font)[^>]*?(?:style=["'][^"']*?color:\s*([#a-zA-Z0-9]+)[^"']*?["']|color=["']([#a-zA-Z0-9]+)["'])[^>]*>(.*?)<\/(?:span|font)>)|(?:<span\s+class=["']([^"']+)["']>(.*?)<\/span>)|(?:\{([^{}\r\n]+)\})|(?:\*{1,2}([^*\r\n]+)\*{1,2})/gi;

  // Quick check: if no special characters, return plain text
  if (!/[{}*<\[]/.test(text)) {
    return text;
  }

  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIndex = 0;

  while ((match = pattern.exec(text)) !== null) {
    // Push preceding plain text
    if (match.index > lastIndex) {
      nodes.push(text.substring(lastIndex, match.index));
    }

    const [
      ,
      color1, text1,          // {color:...}...{/color}
      color2, text2,          // {#...}...{/#}
      color3, text3,          // [color=...]...[/color]
      color4a, color4b, text4,// <span/font style="color:..." / color="...">...</span>
      class5, text5,          // <span class="...">...</span>
      brandText6,             // {text}
      markdownText7,          // *text*
    ] = match;

    const customColor = color1 || color2 || color3 || color4a || color4b;
    const customContent = text1 || text2 || text3 || text4;

    if (customColor && customContent) {
      nodes.push(
        <span
          key={`hl-${keyIndex++}`}
          style={{ color: customColor }}
          className="title-highlight-custom"
        >
          {customContent}
        </span>
      );
    } else if (class5 && text5) {
      nodes.push(
        <span key={`hl-${keyIndex++}`} className={class5}>
          {text5}
        </span>
      );
    } else if (brandText6) {
      nodes.push(
        <span
          key={`hl-${keyIndex++}`}
          style={{ color: '#FF8A50' }}
          className="title-highlight-brand"
        >
          {brandText6}
        </span>
      );
    } else if (markdownText7) {
      nodes.push(
        <span
          key={`hl-${keyIndex++}`}
          style={{ color: '#FF8A50' }}
          className="title-highlight-brand"
        >
          {markdownText7}
        </span>
      );
    }

    lastIndex = pattern.lastIndex;
  }

  // Push trailing plain text
  if (lastIndex < text.length) {
    nodes.push(text.substring(lastIndex));
  }

  return nodes.length > 0 ? nodes : text;
}
