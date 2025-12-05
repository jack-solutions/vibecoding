// Types
export interface Video {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelName: string;
  channelAvatar: string;
  thumbnail: string;
  videoUrl: string;
  views: number;
  likes: number;
  duration: string;
  createdAt: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  avatar: string;
  banner: string;
  subscribers: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  videoId: string;
  author: string;
  avatar: string;
  content: string;
  likes: number;
  createdAt: string;
}

// Storage keys
const STORAGE_KEYS = {
  VIDEOS: 'youtube_videos',
  CHANNELS: 'youtube_channels',
  COMMENTS: 'youtube_comments',
  SUBSCRIPTIONS: 'youtube_subscriptions',
};

// Mock data
const mockChannels: Channel[] = [
  {
    id: 'channel-1',
    name: 'TechVision',
    description: 'Your daily dose of technology news, reviews, and tutorials. Join millions of tech enthusiasts!',
    avatar: 'https://images.unsplash.com/photo-1535303311164-664fc9ec6532?w=100&h=100&fit=crop',
    banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=300&fit=crop',
    subscribers: 2450000,
    createdAt: '2020-03-15T10:00:00Z',
  },
  {
    id: 'channel-2',
    name: 'Creative Studio',
    description: 'Design tutorials, creative inspiration, and artistic workflows for digital creators.',
    avatar: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop',
    banner: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=300&fit=crop',
    subscribers: 890000,
    createdAt: '2019-07-22T10:00:00Z',
  },
  {
    id: 'channel-3',
    name: 'GameZone',
    description: 'Gaming news, walkthroughs, and live streams. Level up your gaming experience!',
    avatar: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=100&h=100&fit=crop',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=300&fit=crop',
    subscribers: 5200000,
    createdAt: '2018-11-08T10:00:00Z',
  },
  {
    id: 'channel-4',
    name: 'Wanderlust Adventures',
    description: 'Travel vlogs, destination guides, and adventure stories from around the world.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    banner: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=300&fit=crop',
    subscribers: 1780000,
    createdAt: '2021-01-12T10:00:00Z',
  },
  {
    id: 'channel-5',
    name: 'Cooking Masters',
    description: 'Delicious recipes, cooking techniques, and culinary adventures for food lovers.',
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&h=100&fit=crop',
    banner: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=300&fit=crop',
    subscribers: 3100000,
    createdAt: '2019-05-20T10:00:00Z',
  },
];

const mockVideos: Video[] = [
  {
    id: 'video-1',
    title: 'The Future of AI: What to Expect in 2025',
    description: 'An in-depth look at artificial intelligence trends and predictions for the coming year. We explore machine learning breakthroughs, ethical considerations, and practical applications.',
    channelId: 'channel-1',
    channelName: 'TechVision',
    channelAvatar: 'https://images.unsplash.com/photo-1535303311164-664fc9ec6532?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=640&h=360&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    views: 1250000,
    likes: 89000,
    duration: '15:42',
    createdAt: '2024-12-01T10:00:00Z',
  },
  {
    id: 'video-2',
    title: 'Mastering UI Design: Complete Figma Tutorial',
    description: 'Learn professional UI design techniques in Figma from scratch. Perfect for beginners and intermediate designers.',
    channelId: 'channel-2',
    channelName: 'Creative Studio',
    channelAvatar: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=640&h=360&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    views: 456000,
    likes: 32000,
    duration: '28:15',
    createdAt: '2024-11-28T14:30:00Z',
  },
  {
    id: 'video-3',
    title: 'Epic Gaming Moments Compilation 2024',
    description: 'The best gaming clips from this year! Featuring incredible plays, funny fails, and unforgettable moments.',
    channelId: 'channel-3',
    channelName: 'GameZone',
    channelAvatar: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=640&h=360&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    views: 3200000,
    likes: 245000,
    duration: '12:08',
    createdAt: '2024-12-03T18:00:00Z',
  },
  {
    id: 'video-4',
    title: 'Hidden Gems of Japan: Travel Guide',
    description: 'Discover the most beautiful and lesser-known destinations in Japan. From ancient temples to modern marvels.',
    channelId: 'channel-4',
    channelName: 'Wanderlust Adventures',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=640&h=360&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    views: 890000,
    likes: 67000,
    duration: '22:30',
    createdAt: '2024-11-25T09:00:00Z',
  },
  {
    id: 'video-5',
    title: 'Perfect Homemade Pizza Recipe',
    description: 'Learn to make restaurant-quality pizza at home with this easy-to-follow recipe. Crispy crust guaranteed!',
    channelId: 'channel-5',
    channelName: 'Cooking Masters',
    channelAvatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=640&h=360&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    views: 2100000,
    likes: 156000,
    duration: '18:45',
    createdAt: '2024-12-02T12:00:00Z',
  },
  {
    id: 'video-6',
    title: 'Building a Smart Home Setup 2025',
    description: 'Complete guide to setting up your smart home ecosystem. From lighting to security, we cover everything.',
    channelId: 'channel-1',
    channelName: 'TechVision',
    channelAvatar: 'https://images.unsplash.com/photo-1535303311164-664fc9ec6532?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=640&h=360&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    views: 780000,
    likes: 54000,
    duration: '24:18',
    createdAt: '2024-11-30T16:00:00Z',
  },
  {
    id: 'video-7',
    title: 'Color Theory for Digital Artists',
    description: 'Master the fundamentals of color theory and apply them to your digital artwork. Boost your design skills!',
    channelId: 'channel-2',
    channelName: 'Creative Studio',
    channelAvatar: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=640&h=360&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    views: 345000,
    likes: 28000,
    duration: '19:22',
    createdAt: '2024-11-22T11:00:00Z',
  },
  {
    id: 'video-8',
    title: 'Best Strategy Games of All Time',
    description: 'Our definitive ranking of the greatest strategy games ever made. From classics to modern masterpieces.',
    channelId: 'channel-3',
    channelName: 'GameZone',
    channelAvatar: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=100&h=100&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1552820728-8b83bb6b2b34?w=640&h=360&fit=crop',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    views: 1890000,
    likes: 134000,
    duration: '31:15',
    createdAt: '2024-11-20T20:00:00Z',
  },
];

const mockComments: Record<string, Comment[]> = {
  'video-1': [
    {
      id: 'comment-1',
      videoId: 'video-1',
      author: 'TechEnthusiast',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop',
      content: 'This is exactly what I needed to understand AI trends. Great breakdown!',
      likes: 234,
      createdAt: '2024-12-02T14:30:00Z',
    },
    {
      id: 'comment-2',
      videoId: 'video-1',
      author: 'FutureDev',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop',
      content: 'The section on ethical AI was particularly insightful. More content like this please!',
      likes: 156,
      createdAt: '2024-12-02T16:45:00Z',
    },
    {
      id: 'comment-3',
      videoId: 'video-1',
      author: 'DataScientist_Sarah',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop',
      content: 'As someone working in ML, I can confirm these predictions are spot on. Subscribed!',
      likes: 89,
      createdAt: '2024-12-03T09:15:00Z',
    },
  ],
};

// Helper functions
export const formatViews = (views: number): string => {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`;
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`;
  }
  return `${views} views`;
};

export const formatSubscribers = (subs: number): string => {
  if (subs >= 1000000) {
    return `${(subs / 1000000).toFixed(1)}M subscribers`;
  } else if (subs >= 1000) {
    return `${(subs / 1000).toFixed(1)}K subscribers`;
  }
  return `${subs} subscribers`;
};

export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} months ago`;
  return `${Math.floor(seconds / 31536000)} years ago`;
};

// Storage functions
export const initializeStorage = (): void => {
  if (!localStorage.getItem(STORAGE_KEYS.CHANNELS)) {
    localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(mockChannels));
  }
  if (!localStorage.getItem(STORAGE_KEYS.VIDEOS)) {
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(mockVideos));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(mockComments));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS)) {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify([]));
  }
};

// Videos
export const getVideos = (): Video[] => {
  const videos = localStorage.getItem(STORAGE_KEYS.VIDEOS);
  return videos ? JSON.parse(videos) : [];
};

export const getVideoById = (id: string): Video | undefined => {
  const videos = getVideos();
  return videos.find((video) => video.id === id);
};

export const getVideosByChannel = (channelId: string): Video[] => {
  const videos = getVideos();
  return videos.filter((video) => video.channelId === channelId);
};

export const addVideo = (video: Omit<Video, 'id' | 'createdAt'>): Video => {
  const videos = getVideos();
  const newVideo: Video = {
    ...video,
    id: `video-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  videos.unshift(newVideo);
  localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
  return newVideo;
};

export const incrementViews = (videoId: string): void => {
  const videos = getVideos();
  const index = videos.findIndex((v) => v.id === videoId);
  if (index !== -1) {
    videos[index].views += 1;
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
  }
};

export const toggleLike = (videoId: string, liked: boolean): void => {
  const videos = getVideos();
  const index = videos.findIndex((v) => v.id === videoId);
  if (index !== -1) {
    videos[index].likes += liked ? 1 : -1;
    localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
  }
};

// Channels
export const getChannels = (): Channel[] => {
  const channels = localStorage.getItem(STORAGE_KEYS.CHANNELS);
  return channels ? JSON.parse(channels) : [];
};

export const getChannelById = (id: string): Channel | undefined => {
  const channels = getChannels();
  return channels.find((channel) => channel.id === id);
};

export const addChannel = (channel: Omit<Channel, 'id' | 'createdAt' | 'subscribers'>): Channel => {
  const channels = getChannels();
  const newChannel: Channel = {
    ...channel,
    id: `channel-${Date.now()}`,
    subscribers: 0,
    createdAt: new Date().toISOString(),
  };
  channels.push(newChannel);
  localStorage.setItem(STORAGE_KEYS.CHANNELS, JSON.stringify(channels));
  return newChannel;
};

// Comments
export const getCommentsByVideo = (videoId: string): Comment[] => {
  const comments = localStorage.getItem(STORAGE_KEYS.COMMENTS);
  const commentsObj: Record<string, Comment[]> = comments ? JSON.parse(comments) : {};
  return commentsObj[videoId] || [];
};

export const addComment = (videoId: string, author: string, content: string): Comment => {
  const comments = localStorage.getItem(STORAGE_KEYS.COMMENTS);
  const commentsObj: Record<string, Comment[]> = comments ? JSON.parse(comments) : {};
  
  const newComment: Comment = {
    id: `comment-${Date.now()}`,
    videoId,
    author,
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop`,
    content,
    likes: 0,
    createdAt: new Date().toISOString(),
  };

  if (!commentsObj[videoId]) {
    commentsObj[videoId] = [];
  }
  commentsObj[videoId].unshift(newComment);
  localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(commentsObj));
  return newComment;
};

// Subscriptions
export const getSubscriptions = (): string[] => {
  const subs = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
  return subs ? JSON.parse(subs) : [];
};

export const isSubscribed = (channelId: string): boolean => {
  const subs = getSubscriptions();
  return subs.includes(channelId);
};

export const toggleSubscription = (channelId: string): boolean => {
  const subs = getSubscriptions();
  const index = subs.indexOf(channelId);
  
  if (index === -1) {
    subs.push(channelId);
  } else {
    subs.splice(index, 1);
  }
  
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subs));
  return index === -1;
};

export const getSubscribedChannels = (): Channel[] => {
  const subs = getSubscriptions();
  const channels = getChannels();
  return channels.filter((channel) => subs.includes(channel.id));
};

// Search
export const searchVideos = (query: string): Video[] => {
  const videos = getVideos();
  const lowerQuery = query.toLowerCase();
  return videos.filter(
    (video) =>
      video.title.toLowerCase().includes(lowerQuery) ||
      video.description.toLowerCase().includes(lowerQuery) ||
      video.channelName.toLowerCase().includes(lowerQuery)
  );
};
