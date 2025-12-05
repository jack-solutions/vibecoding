import axios from './axios';

// Auth endpoints
export const authAPI = {
  signup: (data) => axios.post('/auth/signup', data),
  login: (data) => axios.post('/auth/login', data),
  getMe: () => axios.get('/auth/me'),
};

// Video endpoints
export const videoAPI = {
  getAllVideos: () => axios.get('/videos'),
  getVideo: (id) => axios.get(`/videos/${id}`),
  uploadVideo: (formData) => axios.post('/videos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateVideo: (id, data) => axios.put(`/videos/${id}`, data),
  getMyVideos: () => axios.get('/videos/my/videos'),
  likeVideo: (id) => axios.put(`/videos/${id}/like`),
  dislikeVideo: (id) => axios.put(`/videos/${id}/dislike`),
  deleteVideo: (id) => axios.delete(`/videos/${id}`),
  getTrending: () => axios.get('/videos/trending'),
  getRecommended: (tags) => axios.get('/videos/recommended', { params: { tags } }),
  search: (query) => axios.get('/videos/search', { params: { q: query } }),
};

// Channel endpoints
export const channelAPI = {
  getChannel: (id) => axios.get(`/channels/${id}`),
  getChannelVideos: (id) => axios.get(`/channels/${id}/videos`),
  createOrUpdateChannel: (data) => axios.post('/channels', data),
  getMyChannel: () => axios.get('/channels/my/channel'),
  toggleSubscribe: (id) => axios.put(`/channels/${id}/subscribe`),
};

// Comment endpoints
export const commentAPI = {
  addComment: (data) => axios.post('/comments', data),
  getVideoComments: (videoId) => axios.get(`/comments/${videoId}`),
  deleteComment: (id) => axios.delete(`/comments/${id}`),
};

// Analytics endpoints
export const analyticsAPI = {
  getCreatorAnalytics: () => axios.get('/analytics'),
};

// User endpoints (Admin)
export const userAPI = {
  getAllUsers: () => axios.get('/users'),
  toggleBlockUser: (id) => axios.put(`/users/${id}/block`),
};
