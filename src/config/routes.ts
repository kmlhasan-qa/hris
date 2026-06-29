/**
 * Centralised route table. Paths are relative — `baseURL` (Playwright config)
 * resolves the host, so the whole suite can be repointed at another environment
 * by changing a single env var. Never build URLs inline in page objects or specs.
 */
export const routes = {
  login: '/login',
  adminRoot: '/admin',
  dashboard: '/admin',

  departments: {
    list: '/admin/departments',
    create: '/admin/departments/create',
    edit: (id: string | number) => `/admin/departments/${id}/edit`,
  },

  pushNotifications: {
    list: '/admin/push-notifications',
    create: '/admin/push-notifications/create',
  },
} as const;
