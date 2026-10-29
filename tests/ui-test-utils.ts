import type { TicketService } from '../src/domain/ticketService';
import { mountApp } from '../src/ui/app';

export function mountForTest(service: TicketService) {
  const root = document.createElement('main');
  document.body.replaceChildren(root);
  const unmount = mountApp(root, service);
  return { root, unmount };
}

export function setField(name: string, value: string, root: ParentNode = document): HTMLElement {
  const field = root.querySelector<HTMLElement>(`[name="${name}"]`);
  if (!field || !('value' in field)) throw new Error(`No se encontró el campo ${name}`);
  (field as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value = value;
  field.dispatchEvent(new Event('input', { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
  return field;
}

export function submitForm(root: ParentNode = document): void {
  const form = root.querySelector('form');
  if (!form) throw new Error('No se encontró el formulario');
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

export function byText(root: ParentNode, selector: string, text: string): HTMLElement | null {
  return [...root.querySelectorAll<HTMLElement>(selector)].find((element) => element.textContent?.trim() === text) ?? null;
}
