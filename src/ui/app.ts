import { h } from './dom';
import { createRouter } from './router';
import { createToast } from './components/toast';
import type { TicketService } from '../domain/ticketService';
import { createListView } from './views/listView';
import { createFormView } from './views/formView';
import { createDetailView } from './views/detailView';
import { createTicketQueryStore } from './state';
import { createStatsView } from './views/statsView';

export function mountApp(root: HTMLElement, service: TicketService): () => void {
  const toast = createToast();
  const content = h('div', { className: 'page-content', id: 'page-content' });
  const queryStore = createTicketQueryStore();
  const ticketsLink = h('a', { href: '#/tickets', className: 'nav-link' }, 'Tickets');
  const statsLink = h('a', { href: '#/estadisticas', className: 'nav-link' }, 'Estadísticas');
  const navigation = h('nav', { className: 'main-nav', 'aria-label': 'Navegación principal' }, ticketsLink, statsLink);
  const header = h('header', { className: 'app-header' },
    h('a', { href: '#/tickets', className: 'brand', 'aria-label': 'Tickets de soporte, inicio' },
      h('span', { className: 'brand-mark', 'aria-hidden': 'true' }, 'T'),
      h('span', null, 'Tickets de soporte')),
    navigation,
  );
  const warning = service.getLoadWarning();
  const permanentWarning = warning?.kind === 'unavailable'
    ? h('p', { className: 'persistent-warning', role: 'alert' }, 'El almacenamiento del navegador no está disponible. Los cambios se conservarán solo mientras esta pestaña permanezca abierta.')
    : null;
  const shell = h('div', { className: 'app-shell' }, header, permanentWarning, toast.element, content);
  root.replaceChildren(shell);

  function setNavigation(path: string): void {
    ticketsLink.setAttribute('aria-current', path.startsWith('/tickets') ? 'page' : 'false');
    statsLink.setAttribute('aria-current', path === '/estadisticas' ? 'page' : 'false');
  }

  const router = createRouter({
    '/tickets': (_params, path) => {
      setNavigation(path);
      document.title = 'Tickets | Tickets de soporte';
      content.replaceChildren(createListView({ service, toast, navigate: (next) => router.navigate(next), queryStore }));
    },
    '/tickets/nuevo': (_params, path) => {
      setNavigation(path);
      document.title = 'Nuevo ticket | Tickets de soporte';
      content.replaceChildren(createFormView({ service, toast, navigate: (next) => router.navigate(next) }));
    },
    '/tickets/:id/editar': (params, path) => {
      setNavigation(path);
      document.title = 'Editar ticket | Tickets de soporte';
      content.replaceChildren(createFormView({ service, toast, navigate: (next) => router.navigate(next), id: params.id }));
    },
    '/tickets/:id': (params, path) => {
      setNavigation(path);
      document.title = 'Detalle | Tickets de soporte';
      content.replaceChildren(createDetailView({ service, id: params.id!, toast, navigate: (next) => router.navigate(next) }));
    },
    '/estadisticas': (_params, path) => {
      setNavigation(path);
      document.title = 'Estadísticas | Tickets de soporte';
      content.replaceChildren(createStatsView(service));
    },
  }, () => { window.location.hash = '#/tickets'; });

  const unsubscribe = service.subscribe(() => router.refresh());
  if (warning && warning.kind !== 'unavailable') toast.error(warning.message);
  router.start();

  return () => {
    unsubscribe();
    router.stop();
    toast.dispose();
    root.replaceChildren();
  };
}
