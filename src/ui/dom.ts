export type Child = Node | string | number | null | undefined | false;
export type ElementAttributes = Record<string, string | number | boolean | EventListener | null | undefined>;

export function h(tag: string, attrs: ElementAttributes | null = null, ...children: Child[]): HTMLElement {
  const element = document.createElement(tag);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === null || value === undefined) continue;
      if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === 'className') {
        element.className = String(value);
      } else if (key === 'htmlFor' && element instanceof HTMLLabelElement) {
        element.htmlFor = String(value);
      } else if (key === 'value' && 'value' in element) {
        (element as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value = String(value);
      } else if (['disabled', 'hidden', 'checked', 'required', 'open', 'novalidate'].includes(key) && value === true) {
        element.setAttribute(key, '');
      } else if (typeof value === 'boolean') {
        if (key.startsWith('aria-') || key.startsWith('data-')) element.setAttribute(key, String(value));
      } else {
        element.setAttribute(key, String(value));
      }
    }
  }

  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (child instanceof Node) element.append(child);
    else element.append(document.createTextNode(String(child)));
  }
  return element;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}
