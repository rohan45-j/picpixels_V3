const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://admin.picpixels.com';

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  type_display: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
  created_at_display: string;
  time_ago: string;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchNotifications(filter?: 'unread'): Promise<NotificationItem[]> {
  const params = filter ? `?filter=${filter}` : '';
  const resp = await fetch(`${API_URL}/api/v1/notifications/${params}`, {
    headers: getAuthHeaders(),
    cache: 'no-store',
  });
  if (!resp.ok) return [];
  const data = await resp.json();
  return data.results || data || [];
}

export async function fetchUnreadCount(): Promise<number> {
  try {
    const resp = await fetch(`${API_URL}/api/v1/notifications/unread_count/`, {
      headers: getAuthHeaders(),
      cache: 'no-store',
    });
    if (!resp.ok) return 0;
    const data = await resp.json();
    return data.unread_count || 0;
  } catch {
    return 0;
  }
}

export async function markNotificationRead(id: number): Promise<boolean> {
  try {
    const resp = await fetch(`${API_URL}/api/v1/notifications/${id}/mark_one_read/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

export async function markAllNotificationsRead(ids?: number[]): Promise<boolean> {
  try {
    const resp = await fetch(`${API_URL}/api/v1/notifications/mark_read/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(ids ? { ids } : {}),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

export async function deleteNotification(id: number): Promise<boolean> {
  try {
    const resp = await fetch(`${API_URL}/api/v1/notifications/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return resp.ok;
  } catch {
    return false;
  }
}
