// Central API service — connects to Node.js/Express backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getToken = (): string | null => localStorage.getItem('authToken');

const buildHeaders = (auth = true): HeadersInit => {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) { const t = getToken(); if (t) h['Authorization'] = `Bearer ${t}`; }
  return h;
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const res = await fetch(`${API_BASE_URL}${path}`, { ...options, headers: { ...buildHeaders(), ...(options.headers || {}) } });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const authAPI = {
  sendOtp: (body: any) => request<any>('/auth/send-otp', { method: 'POST', body: JSON.stringify(body) }),
  register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request<any>('/auth/me'),
  updateProfile: (profile: any) => request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify({ profile }) }),
  changePassword: (body: any) => request('/auth/change-password', { method: 'PUT', body: JSON.stringify(body) }),
  seedAdmin: (secretKey: string) => request<any>('/auth/seed-admin', { method: 'POST', body: JSON.stringify({ secretKey }) }),
};

export const levelAPI = {
  getLevels: (language: string) => request<any>(`/levels/${language}`),
  getLevelDetails: (language: string, levelNumber: number) => request<any>(`/levels/${language}/${levelNumber}`),
  evaluateMCQ: (body: any) => request<any>('/levels/evaluate-mcq', { method: 'POST', body: JSON.stringify(body) }),
  evaluate: (body: any) => request<any>('/levels/evaluate', { method: 'POST', body: JSON.stringify(body) }),
};

export const problemsAPI = {
  getAll: (params?: any) => { const qs = params ? '?' + new URLSearchParams(params).toString() : ''; return request<any>(`/problems${qs}`); },
  getAdminAll: () => request<any>('/problems/admin/all'),
  getOne: (slug: string) => request<any>(`/problems/${slug}`),
  getDaily: () => request<any>('/problems/daily'),
  create: (data: any) => request('/problems', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => request(`/problems/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

export const codeAPI = {
  run: (body: any) => request<any>('/code/run', { method: 'POST', body: JSON.stringify(body) }),
  runLevel: (body: any) => request<any>('/code/run-level', { method: 'POST', body: JSON.stringify(body) }),
  submit: (problemId: string, body: any) => request<any>(`/code/submit/${problemId}`, { method: 'POST', body: JSON.stringify(body) }),
  getSubmissions: (params?: any) => { const qs = params ? '?' + new URLSearchParams(params).toString() : ''; return request<any>(`/code/submissions${qs}`); },
};

export const groupsAPI = {
  create: (body: any) => request('/groups', { method: 'POST', body: JSON.stringify(body) }),
  join: (joinCode: string) => request('/groups/join', { method: 'POST', body: JSON.stringify({ joinCode }) }),
  getMy: () => request<any>('/groups/my'),
  getOne: (id: string) => request<any>(`/groups/${id}`),
  deleteGroup: (groupId: string) => request(`/groups/${groupId}`, { method: 'DELETE' }),
  // Assignments
  createAssignment: (groupId: string, body: any) => request(`/groups/${groupId}/assignments`, { method: 'POST', body: JSON.stringify(body) }),
  submitAssignment: (groupId: string, assignmentId: string, body: any) => request(`/groups/${groupId}/assignments/${assignmentId}/submit`, { method: 'POST', body: JSON.stringify(body) }),
  // Announcements
  postAnnouncement: (groupId: string, body: any) => request(`/groups/${groupId}/announcements`, { method: 'POST', body: JSON.stringify(body) }),
  deleteAnnouncement: (groupId: string, annId: string) => request(`/groups/${groupId}/announcements/${annId}`, { method: 'DELETE' }),
  // Students
  removeStudent: (groupId: string, studentId: string) => request(`/groups/${groupId}/students/${studentId}`, { method: 'DELETE' }),
  // Performance
  getPerformance: (groupId: string) => request<any>(`/groups/${groupId}/performance`),
};

export const aiAPI = {
  generateResume: () => request<any>('/ai/resume/generate', { method: 'POST', body: '{}' }),
  analyzeResume: (resumeText: string) => request<any>('/ai/resume/analyze', { method: 'POST', body: JSON.stringify({ resumeText }) }),
  getRecommendations: () => request<any>('/ai/recommendations'),
  chat: (message: string, context?: string) => request<any>('/ai/chat', { method: 'POST', body: JSON.stringify({ message, context }) }),
};

export const usersAPI = {
  getLeaderboard: () => request<any>('/users/leaderboard'),
  getProfile: (id: string) => request<any>(`/users/${id}/profile`),
  getNotes: () => request<any>('/users/notes'),
  addNote: (body: any) => request('/users/notes', { method: 'POST', body: JSON.stringify(body) }),
  deleteNote: (noteId: string) => request(`/users/notes/${noteId}`, { method: 'DELETE' }),
  getNotifications: () => request<any>('/users/notifications'),
  markNotificationsRead: () => request('/users/notifications/read', { method: 'PUT', body: '{}' }),
  getAllUsers: () => request<any>('/users/admin/all'),
  blockUser: (id: string, isBlocked: boolean) => request(`/users/admin/${id}/block`, { method: 'PUT', body: JSON.stringify({ isBlocked }) }),
  setRole: (id: string, role: string) => request(`/users/admin/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  deleteUser: (id: string) => request(`/users/admin/${id}`, { method: 'DELETE' }),
  updateUser: (id: string, data: any) => request<any>(`/users/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getAdminStats: () => request<any>('/users/admin/stats'),
};

// Admin level management API
export const adminLevelAPI = {
  getLevels: (language: string) => request<any>(`/levels/admin/${language}/all`),
  getLevel: (language: string, levelNumber: number) => request<any>(`/levels/admin/${language}/${levelNumber}`),
  updateLevel: (id: string, data: any) => request<any>(`/levels/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// Legacy compatibility exports
export const progressAPI = {
  getUserProgress: async (language: string) => { const s = localStorage.getItem(`progress_${language}`); return s ? JSON.parse(s) : null; },
  updateProgress: async (progress: any) => progress,
};
export const courseAPI = { getLevels: async () => [], getLevel: async () => null };
export const submissionAPI = {
  submitMCQ: async () => ({}),
  submitCode: (id: string, body: any) => codeAPI.submit(id, body),
  executeCode: (code: string, language: string, input: string) => codeAPI.run({ code, language, input }),
};
