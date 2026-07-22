import { getApiBaseUrl } from '@/services/api-config';
import type {
  ApiValidationError,
  ChildProfile,
  CreateChildRequest,
  GuidanceAskRequest,
  GuidanceAskResponse,
  RagSearchRequest,
  RagSearchResponse,
  TokenResponse,
  TopOfMindResponse,
  User,
} from '@/services/api-types';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiValidationError | { detail?: string };
    if (Array.isArray(body.detail)) {
      return body.detail.map((item) => item.msg).join(', ');
    }
    if (typeof body.detail === 'string') {
      return body.detail;
    }
  } catch {
    // Fall through to generic message.
  }
  return `Request failed (${response.status})`;
}

async function request<T>(path: string, init: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  register(email: string, password: string) {
    return request<User>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  login(email: string, password: string) {
    return request<TokenResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getMe(token: string) {
    return request<User>('/api/v1/auth/me', {}, token);
  },

  listChildren(token: string) {
    return request<ChildProfile[]>('/api/v1/children', {}, token);
  },

  createChild(token: string, data: CreateChildRequest) {
    return request<ChildProfile>('/api/v1/children', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  },

  getChildTopOfMind(token: string, childId: number) {
    return request<TopOfMindResponse>(`/api/v1/children/${childId}/top-of-mind`, {}, token);
  },

  askGuidance(token: string, data: GuidanceAskRequest) {
    return request<GuidanceAskResponse>('/api/v1/guidance/ask', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  },

  searchKnowledge(token: string, data: RagSearchRequest) {
    return request<RagSearchResponse>('/api/v1/rag/search', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  },
};
