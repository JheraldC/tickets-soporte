export type RouteHandler = (params: Record<string, string>, path: string) => void;
export interface RouteMatch { pattern: string; params: Record<string, string>; handler: RouteHandler }

function normalize(path: string): string {
  const withoutHash = path.startsWith('#') ? path.slice(1) : path;
  const pathname = withoutHash.split('?')[0] ?? '';
  const segments = pathname.split('/').filter(Boolean);
  return `/${segments.join('/')}`;
}

function matchPattern(pattern: string, path: string): Record<string, string> | null {
  const patternParts = normalize(pattern).split('/').filter(Boolean);
  const pathParts = normalize(path).split('/').filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;
  const params: Record<string, string> = {};
  for (let index = 0; index < patternParts.length; index += 1) {
    const expected = patternParts[index]!;
    const actual = pathParts[index]!;
    if (expected.startsWith(':')) {
      try {
        params[expected.slice(1)] = decodeURIComponent(actual);
      } catch {
        return null;
      }
    } else if (expected !== actual) return null;
  }
  return params;
}

export function createRouter(
  routes: Record<string, RouteHandler>,
  onNotFound: (path: string) => void,
  targetWindow: Window = window,
) {
  const ordered = Object.entries(routes).sort(([a], [b]) => {
    const aDynamic = (a.match(/:[^/]+/g) ?? []).length;
    const bDynamic = (b.match(/:[^/]+/g) ?? []).length;
    return aDynamic - bDynamic || b.length - a.length;
  });
  let started = false;

  function currentPath(): string {
    return normalize(targetWindow.location.hash || '/tickets');
  }

  function resolve(path: string = currentPath()): RouteMatch | null {
    const normalizedPath = normalize(path);
    for (const [pattern, handler] of ordered) {
      const params = matchPattern(pattern, normalizedPath);
      if (params) return { pattern, params, handler };
    }
    return null;
  }

  function dispatch(): void {
    const path = currentPath();
    const match = resolve(path);
    if (match) {
      match.handler(match.params, path);
      return;
    }
    onNotFound(path);
    const redirected = resolve(currentPath());
    if (redirected) redirected.handler(redirected.params, currentPath());
  }

  return {
    resolve,
    start() {
      if (started) return;
      started = true;
      targetWindow.addEventListener('hashchange', dispatch);
      dispatch();
    },
    stop() {
      if (!started) return;
      targetWindow.removeEventListener('hashchange', dispatch);
      started = false;
    },
    refresh: dispatch,
    navigate(path: string) {
      targetWindow.location.hash = normalize(path);
      dispatch();
    },
  };
}
