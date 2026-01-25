"use client";

import { useState } from "react";

interface InstagramProfile {
  username: string;
  fullName: string;
  biography: string;
  profilePicUrl: string;
  profilePicUrlHd: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  isVerified: boolean;
  isBusinessAccount: boolean;
  category: string | null;
  website: string | null;
  userId: string;
}

interface InstagramPost {
  id: string;
  shortcode: string;
  mediaType: number;
  likeCount: number;
  commentCount: number;
  caption: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  takenAt: number | null;
  owner: {
    username: string;
    userId: string;
  };
  comments?: InstagramComment[];
}

interface InstagramComment {
  id: string;
  text: string;
  createdAt: number;
  likeCount: number;
  owner: {
    username: string;
    fullName: string;
    userId: string;
    profilePicUrl: string;
    isVerified: boolean;
  };
  replies?: InstagramComment[];
}

export default function NewTestPage() {
  const [username, setUsername] = useState("fynrestaurantcpt");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<InstagramProfile | null>(null);
  const [posts, setPosts] = useState<InstagramPost[]>([]);

  const handleScrape = async () => {
    setLoading(true);
    setError(null);
    setProfile(null);
    setPosts([]);

    try {
      const response = await fetch("/api/test/instagram-api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          includeComments: true, // Always fetch comments for all posts
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setProfile(data.profile);
      setPosts(data.posts || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Instagram API Scraper Test</h1>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Instagram Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="fynrestaurantcpt"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>


            <button
              onClick={handleScrape}
              disabled={loading || !username.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Scraping..." : "Scrape Instagram Profile"}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">Error:</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Profile Display */}
        {profile && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start space-x-6">
               <img
                 src={
                   profile.profilePicUrlHd || profile.profilePicUrl
                     ? `/api/proxy-image?url=${encodeURIComponent(profile.profilePicUrlHd || profile.profilePicUrl)}`
                     : ""
                 }
                 alt={profile.username}
                 className="w-24 h-24 rounded-full object-cover bg-gray-200"
                 onError={(e) => {
                   // Fallback if proxy fails, try direct URL
                   const target = e.target as HTMLImageElement;
                   const originalUrl = profile.profilePicUrlHd || profile.profilePicUrl;
                   if (originalUrl && target.src.includes("/api/proxy-image")) {
                     console.log("Proxy failed, trying direct URL:", originalUrl);
                     target.src = originalUrl;
                     target.crossOrigin = "anonymous";
                     target.referrerPolicy = "no-referrer";
                   } else {
                     // If direct URL also fails, show placeholder
                     target.style.display = "none";
                     const placeholder = document.createElement("div");
                     placeholder.className = "w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs";
                     placeholder.textContent = profile.username.charAt(0).toUpperCase();
                     target.parentElement?.appendChild(placeholder);
                   }
                 }}
               />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{profile.fullName}</h2>
                  {profile.isVerified && (
                    <span className="text-blue-500" title="Verified">
                      ✓
                    </span>
                  )}
                  {profile.isBusinessAccount && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Business
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-2">@{profile.username}</p>
                {profile.biography && (
                  <p className="text-gray-700 mb-4 whitespace-pre-line">{profile.biography}</p>
                )}
                <div className="flex space-x-6 text-sm">
                  <div>
                    <span className="font-semibold">{formatNumber(profile.postCount)}</span> posts
                  </div>
                  <div>
                    <span className="font-semibold">{formatNumber(profile.followerCount)}</span>{" "}
                    followers
                  </div>
                  <div>
                    <span className="font-semibold">{formatNumber(profile.followingCount)}</span>{" "}
                    following
                  </div>
                </div>
                {profile.category && (
                  <p className="text-sm text-gray-500 mt-2">Category: {profile.category}</p>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                  >
                    {profile.website}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Posts Display */}
        {posts.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Posts ({posts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                   {post.thumbnailUrl && (
                     <div className="w-full aspect-[9/16] bg-gray-100 overflow-hidden">
                       <img
                         src={`/api/proxy-image?url=${encodeURIComponent(post.thumbnailUrl)}`}
                         alt={post.shortcode}
                         className="w-full h-full object-cover"
                         onError={(e) => {
                           // Fallback to direct URL if proxy fails
                           const target = e.target as HTMLImageElement;
                           if (target.src.includes("/api/proxy-image") && post.thumbnailUrl) {
                             target.src = post.thumbnailUrl;
                           } else {
                             target.style.display = 'none';
                           }
                         }}
                       />
                     </div>
                   )}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">
                        {post.mediaType === 2 ? "📹 Video" : "📷 Photo"}
                      </span>
                      {post.takenAt && (
                        <span className="text-xs text-gray-500">
                          {formatDate(post.takenAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span>❤️ {formatNumber(post.likeCount)}</span>
                      <span>💬 {formatNumber(post.commentCount)}</span>
                    </div>
                    {post.caption && (
                      <p className="text-sm text-gray-700 line-clamp-3 mb-2">{post.caption}</p>
                    )}
                    <a
                      href={`https://www.instagram.com/p/${post.shortcode}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs"
                    >
                      View on Instagram →
                    </a>

                    {/* Comments Section */}
                    {post.comments && post.comments.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Comments ({post.comments.length})
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {post.comments.map((comment) => (
                            <div key={comment.id} className="text-xs">
                              <div className="flex items-start space-x-2">
                                <span className="font-semibold text-gray-900">
                                  @{comment.owner.username}
                                </span>
                                <span className="text-gray-600 flex-1">{comment.text}</span>
                              </div>
                              {comment.likeCount > 0 && (
                                <span className="text-gray-400 ml-4">
                                  ❤️ {comment.likeCount}
                                </span>
                              )}
                              {comment.replies && comment.replies.length > 0 && (
                                <div className="ml-4 mt-1 space-y-1">
                                  {comment.replies.map((reply) => (
                                    <div key={reply.id} className="text-xs text-gray-600">
                                      <span className="font-semibold">@{reply.owner.username}</span>{" "}
                                      {reply.text}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Scraping Instagram data...</p>
          </div>
        )}
      </div>
    </div>
  );
}
