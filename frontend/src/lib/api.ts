import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 30000,
})

api.interceptors.response.use(
  (res: any) => res.data,
  (err: any) => {
    const msg = err.response?.data?.detail || err.message || 'Unknown error'
    return Promise.reject(new Error(msg))
  }
)

// ── Trends ────────────────────────────────────────────────────────────────────
export const trendsApi = {
  fetch: (keywords: string[], category: string = 'general', geo: string = 'IN', timeframe: string = 'today 3-m') =>
    api.post('/trends/fetch', { keywords, category, geo, timeframe }),

  forecast: (keywords: string[], category: string = 'general', periods: number = 12) =>
    api.post('/trends/forecast', null, {
      params: { keywords, category, periods },
    }),

  compare: (keywords: string[], geo: string = 'IN', timeframe: string = 'today 3-m') =>
    api.get('/trends/compare', { params: { keywords, geo, timeframe } }),

  categories: () => api.get('/trends/categories'),
}

// ── Insights ──────────────────────────────────────────────────────────────────
export const insightsApi = {
  generate: (category: string, focus: string | null = null) =>
    api.post('/insights/generate', { category, focus }),

  byCategory: (category: string) =>
    api.get('/insights/categories', { params: { category } }),
}

// ── Products ──────────────────────────────────────────────────────────────────
export const productsApi = {
  recommend: (category: string, region: string | null = null, top_n: number = 5) =>
    api.post('/products/recommend', { category, region, top_n }),

  categories: () => api.get('/products/categories'),
}

// ── Health ────────────────────────────────────────────────────────────────────
export const healthApi = {
  check: () => api.get('/health'),
}

// ── Settings ──────────────────────────────────────────────────────────────────
export const settingsApi = {
  get: () => api.get('/settings'),
  update: (updates: Record<string, any>) => api.patch('/settings', updates),
}

export default api
