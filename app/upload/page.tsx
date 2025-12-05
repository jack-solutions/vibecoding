"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRequireRole } from "@/lib/auth/hooks";

export default function UploadPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useRequireRole("creator");

    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "General",
        tags: "",
        visibility: "public",
    });

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type.startsWith("video/")) {
                setFile(droppedFile);
            } else {
                alert("Please upload a valid video file");
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type.startsWith("video/")) {
                setFile(selectedFile);
            } else {
                alert("Please upload a valid video file");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            alert("Please select a video file");
            return;
        }

        if (!formData.title.trim()) {
            alert("Please enter a title");
            return;
        }

        setUploading(true);
        setUploadProgress(10);

        try {
            const uploadFormData = new FormData();
            uploadFormData.append("video", file);
            uploadFormData.append("title", formData.title);
            uploadFormData.append("description", formData.description);
            uploadFormData.append("category", formData.category);
            uploadFormData.append("tags", formData.tags);
            uploadFormData.append("visibility", formData.visibility);

            setUploadProgress(30);

            const res = await fetch("/api/videos/upload", {
                method: "POST",
                body: uploadFormData,
            });

            setUploadProgress(80);

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Upload failed");
            }

            setUploadProgress(100);

            // Redirect to video page
            setTimeout(() => {
                router.push(`/watch/${data.data.video.id}`);
            }, 500);
        } catch (err: any) {
            alert(err.message || "Failed to upload video");
            setUploading(false);
            setUploadProgress(0);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Upload Video</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Upload Zone */}
                    {!file ? (
                        <Card>
                            <CardContent className="pt-6">
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${dragActive
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/10"
                                            : "border-border hover:border-blue-400"
                                        }`}
                                >
                                    <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-lg mb-2">Drag and drop video file here</p>
                                    <p className="text-sm text-muted-foreground mb-4">or</p>
                                    <label htmlFor="file-upload">
                                        <Button type="button" variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                                            Select File
                                        </Button>
                                    </label>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        accept="video/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Upload className="w-10 h-10 text-blue-600" />
                                        <div>
                                            <p className="font-medium">{file.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setFile(null)}
                                        disabled={uploading}
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                {/* Upload Progress */}
                                {uploading && (
                                    <div className="mt-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>Uploading...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Video Details */}
                    {file && !uploading && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Video Details</CardTitle>
                                <CardDescription>Add information about your video</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input
                                        id="title"
                                        placeholder="Enter video title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        maxLength={100}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Tell viewers about your video"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={5}
                                        maxLength={5000}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="General">General</SelectItem>
                                                <SelectItem value="Music">Music</SelectItem>
                                                <SelectItem value="Gaming">Gaming</SelectItem>
                                                <SelectItem value="Education">Education</SelectItem>
                                                <SelectItem value="Entertainment">Entertainment</SelectItem>
                                                <SelectItem value="Technology">Technology</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="visibility">Visibility</Label>
                                        <Select value={formData.visibility} onValueChange={(value) => setFormData({ ...formData, visibility: value })}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="public">Public</SelectItem>
                                                <SelectItem value="unlisted">Unlisted</SelectItem>
                                                <SelectItem value="private">Private</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tags">Tags</Label>
                                    <Input
                                        id="tags"
                                        placeholder="music, tutorial, gaming (comma separated)"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Add tags to help people find your video
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Submit Button */}
                    {file && !uploading && (
                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                Publish Video
                            </Button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
