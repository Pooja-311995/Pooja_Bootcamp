export function sanitizeHtml(html: string): string {
  if (!html) return '';

  const container = document.createElement('div');
  container.innerHTML = html;

  const allowedTags = new Set([
    'P', 'BR', 'STRONG', 'B', 'EM', 'I', 'UL', 'OL', 'LI', 'A', 'H1', 'H2', 'H3', 'H4'
  ]);

  const allowedAttrsByTag: Record<string, Set<string>> = {
    A: new Set(['href', 'title', 'target', 'rel'])
  };

  const isSafeUrl = (url: string) => {
    try {
      const trimmed = url.trim().toLowerCase();
      // Disallow potentially dangerous schemes
      if (/^javascript:/.test(trimmed) || /^data:/.test(trimmed)) return false;
      return true;
    } catch {
      return false;
    }
  };

  const sanitizeNode = (node: Node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;

      // Remove dangerous nodes entirely
      const tag = el.tagName;
      if (!allowedTags.has(tag)) {
        // Unwrap: replace the element with its children
        const parent = el.parentNode;
        if (parent) {
          while (el.firstChild) parent.insertBefore(el.firstChild, el);
          parent.removeChild(el);
        }
        return;
      }

      // Clean attributes
      const allowedAttrs = allowedAttrsByTag[tag] || new Set<string>();
      // Copy to array because attributes is live
      Array.from(el.attributes).forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = attr.value;
        if (name.startsWith('on')) {
          el.removeAttribute(attr.name);
          return;
        }
        if (!allowedAttrs.has(attr.name)) {
          el.removeAttribute(attr.name);
          return;
        }
        if (tag === 'A' && name === 'href' && !isSafeUrl(value)) {
          el.removeAttribute('href');
        }
        if (tag === 'A' && name === 'target') {
          // Ensure rel for security if target=_blank
          if (value === '_blank') {
            el.setAttribute('rel', 'noopener noreferrer');
          } else {
            el.removeAttribute('target');
          }
        }
      });
    }

    // Recurse
    const children = Array.from(node.childNodes);
    children.forEach(sanitizeNode);
  };

  sanitizeNode(container);
  return container.innerHTML;
}
