// A tiny, client-only HTML sanitizer for our demo content
// This removes script/style/iframe and dangerous attributes like on*, srcdoc, javascript: URLs

const DANGEROUS_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta']);

const DANGEROUS_ATTR_PREFIXES = ['on']; // onclick, onload, etc.
const DANGEROUS_ATTRS = new Set(['srcdoc']);

function isJavascriptHref(value: string): boolean {
  if (!value) return false;
  return /\s*javascript:/i.test(value);
}

export function sanitizeHtml(input: string): string {
  if (typeof window === 'undefined') return input || '';
  if (!input) return '';

  const template = document.createElement('template');
  template.innerHTML = input;

  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT, null);
  const elementsToRemove: Element[] = [];

  while (walker.nextNode()) {
    const el = walker.currentNode as Element;

    // Remove dangerous tags entirely
    if (DANGEROUS_TAGS.has(el.tagName.toLowerCase())) {
      elementsToRemove.push(el);
      continue;
    }

    // Remove dangerous attributes
    const attrs = Array.from(el.attributes);
    for (const attr of attrs) {
      const name = attr.name.toLowerCase();
      const value = attr.value;

      if (DANGEROUS_ATTRS.has(name)) {
        el.removeAttribute(attr.name);
        continue;
      }

      if (DANGEROUS_ATTR_PREFIXES.some(prefix => name.startsWith(prefix))) {
        el.removeAttribute(attr.name);
        continue;
      }

      if ((name === 'href' || name === 'src') && isJavascriptHref(value)) {
        el.removeAttribute(attr.name);
      }
    }
  }

  // Remove collected elements
  for (const el of elementsToRemove) {
    el.remove();
  }

  return template.innerHTML;
}

export default sanitizeHtml;


