const BASE = '';

export async function apiFetch<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'HTTP ' + res.status);
  return data as T;
}

export const api = {
  // Settings
  getSettings: () => apiFetch('/api/settings'),
  updateSettings: (body: any) => apiFetch('/api/settings', { method: 'PUT', body: JSON.stringify(body) }),

  // Groups
  getGroups: () => apiFetch<any[]>('/api/groups'),
  createGroup: (body: any) => apiFetch('/api/groups', { method: 'POST', body: JSON.stringify(body) }),
  updateGroup: (id: number, body: any) => apiFetch('/api/groups/' + id, { method: 'PUT', body: JSON.stringify(body) }),
  deleteGroup: (id: number) => apiFetch('/api/groups/' + id, { method: 'DELETE' }),

  // SKUs
  getSkus: (groupId?: string) => apiFetch<any[]>('/api/skus' + (groupId ? '?groupId=' + groupId : '')),
  createSku: (body: any) => apiFetch('/api/skus', { method: 'POST', body: JSON.stringify(body) }),
  updateSku: (id: number, body: any) => apiFetch('/api/skus/' + id, { method: 'PUT', body: JSON.stringify(body) }),
  deleteSku: (id: number) => apiFetch('/api/skus/' + id, { method: 'DELETE' }),

  // Orders
  getOrders: () => apiFetch<any[]>('/api/orders'),
  getOrder: (id: number) => apiFetch('/api/orders/' + id),
  createOrder: (body: any) => apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
  updateOrder: (id: number, body: any) => apiFetch('/api/orders/' + id, { method: 'PUT', body: JSON.stringify(body) }),
  deleteOrder: (id: number) => apiFetch('/api/orders/' + id, { method: 'DELETE' }),

  // Sync
  exportDb: () => apiFetch('/api/export'),
  importDb: (data: any) => apiFetch('/api/import', { method: 'POST', body: JSON.stringify(data) }),
  importExcel: (body: any) => apiFetch('/api/import-excel', { method: 'POST', body: JSON.stringify(body) }),
};
