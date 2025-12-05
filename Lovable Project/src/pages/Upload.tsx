import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, X, Image, Film, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addVideo, getChannels, addChannel, type Channel } from '@/lib/storage';
import { toast } from 'sonner';

const Upload = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const [channels, setChannels] = useState<Channel[]>(getChannels());
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a video file');
        return;
      }
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateChannel = () => {
    if (!newChannelName.trim()) {
      toast.error('Please enter a channel name');
      return;
    }

    const channel = addChannel({
      name: newChannelName,
      description: newChannelDescription || 'New channel',
      avatar: `https://images.unsplash.com/photo-${Date.now()}?w=100&h=100&fit=crop`,
      banner: `https://images.unsplash.com/photo-${Date.now()}?w=1200&h=300&fit=crop`,
    });

    setChannels([...channels, channel]);
    setSelectedChannel(channel.id);
    setIsCreatingChannel(false);
    setNewChannelName('');
    setNewChannelDescription('');
    toast.success('Channel created successfully!');
  };

  const handleUpload = async () => {
    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!selectedChannel) {
      toast.error('Please select a channel');
      return;
    }

    setIsUploading(true);

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const channel = channels.find((c) => c.id === selectedChannel);
    if (!channel) {
      toast.error('Channel not found');
      setIsUploading(false);
      return;
    }

    const video = addVideo({
      title,
      description,
      channelId: channel.id,
      channelName: channel.name,
      channelAvatar: channel.avatar,
      thumbnail: thumbnailPreview || 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=640&h=360&fit=crop',
      videoUrl: videoPreview,
      views: 0,
      likes: 0,
      duration: '00:00',
    });

    setIsUploading(false);
    toast.success('Video uploaded successfully!');
    navigate(`/watch/${video.id}`);
  };

  const clearVideo = () => {
    setVideoFile(null);
    setVideoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload Video</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column - Video upload */}
        <div className="space-y-6">
          {/* Video upload area */}
          <div className="relative">
            {!videoPreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-12 text-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-all"
              >
                <Film className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Select a video to upload</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop or click to browse
                </p>
                <Button variant="secondary">
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden bg-black">
                <video
                  src={videoPreview}
                  controls
                  className="w-full aspect-video object-contain"
                />
                <button
                  onClick={clearVideo}
                  className="absolute top-2 right-2 p-2 bg-black/70 rounded-full hover:bg-black transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              className="hidden"
            />
          </div>

          {/* Thumbnail upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Thumbnail</label>
            <div className="flex gap-4 items-start">
              {thumbnailPreview ? (
                <div className="relative w-40 aspect-video rounded-lg overflow-hidden">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setThumbnailPreview('')}
                    className="absolute top-1 right-1 p-1 bg-black/70 rounded-full hover:bg-black transition-colors"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="w-40 aspect-video border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center hover:border-primary hover:bg-accent/50 transition-all"
                >
                  <Image className="w-8 h-8 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Add thumbnail</span>
                </button>
              )}
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Right column - Details */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              className="bg-secondary border-border"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers about your video"
              rows={5}
              className="bg-secondary border-border resize-none"
            />
          </div>

          {/* Channel selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Channel *</label>
            {isCreatingChannel ? (
              <div className="space-y-3 p-4 bg-secondary rounded-lg">
                <Input
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="Channel name"
                  className="bg-background border-border"
                />
                <Input
                  value={newChannelDescription}
                  onChange={(e) => setNewChannelDescription(e.target.value)}
                  placeholder="Channel description (optional)"
                  className="bg-background border-border"
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreateChannel} size="sm">
                    Create Channel
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCreatingChannel(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                  <SelectTrigger className="bg-secondary border-border flex-1">
                    <SelectValue placeholder="Select a channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        <div className="flex items-center gap-2">
                          <img
                            src={channel.avatar}
                            alt={channel.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          {channel.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setIsCreatingChannel(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Upload button */}
          <Button
            onClick={handleUpload}
            disabled={!videoFile || !title || !selectedChannel || isUploading}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <UploadIcon className="w-4 h-4 mr-2" />
                Upload Video
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Upload;
