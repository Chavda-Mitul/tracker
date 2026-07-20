import { ApiError } from "@/lib/api-error"
import { AUTH_TOKEN_COOKIE } from "@/constants/auth"
import { getCookie } from "@/lib/cookies"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL
const APP_SECRET = process.env.NEXT_PUBLIC_APP_SECRET ?? ""

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getCookie(AUTH_TOKEN_COOKIE)

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      "x-app-secret": APP_SECRET,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new ApiError(data?.message ?? "Something went wrong.", res.status)
  }

  return data as T
}

export const apiClient = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, { ...options, method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, { ...options, method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string, options?: RequestInit) => request<T>(path, { ...options, method: "DELETE" }),
  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, { ...options, method: "PUT", body: body ? JSON.stringify(body) : undefined }),
}
