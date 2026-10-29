import { beforeEach, describe, expect, it } from 'vitest';
import { createMemoryRepository } from '../../../src/storage/memoryRepository';
import { createTicketService } from '../../../src/domain/ticketService';
import { makeTicket } from '../../helpers';
import { mountForTest } from '../../ui-test-utils';

beforeEach(() => { document.body.replaceChildren(); });

describe('seguridad de contenido de usuario', () => {
  it('muestra título y descripción como texto en listado, detalle y confirmación', () => {
    const title = '<img src=x onerror=alert(1)>';
    const description = '<script>alert("x")</script> texto de incidencia';
    const ticket = makeTicket({ titulo: title, descripcion: description });
    const service = createTicketService({ repository: createMemoryRepository([ticket]) });

    window.location.hash = '#/tickets';
    let mounted = mountForTest(service);
    expect(mounted.root.textContent).toContain(title);
    expect(mounted.root.querySelector('img, script')).toBeNull();
    mounted.unmount();

    window.location.hash = `#/tickets/${ticket.id}`;
    mounted = mountForTest(service);
    expect(mounted.root.textContent).toContain(title);
    expect(mounted.root.textContent).toContain(description);
    expect(mounted.root.querySelector('img, script')).toBeNull();
    mounted.root.querySelector<HTMLButtonElement>('[data-action="delete"]')!.click();
    const dialog = document.querySelector('dialog')!;
    expect(dialog.textContent).toContain(title);
    expect(dialog.querySelector('img, script')).toBeNull();
    dialog.querySelector<HTMLButtonElement>('[data-action="cancel"]')!.click();
    mounted.unmount();
  });
});
