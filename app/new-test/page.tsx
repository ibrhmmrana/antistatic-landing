"use client";

import { useState, useEffect } from "react";

type Platform = "instagram" | "facebook";

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

interface FacebookPage {
  id: string;
  name: string;
  username: string;
  about?: string;
  followers?: number;
  profilePicUrl?: string;
  verified?: boolean;
  website?: string;
}

interface FacebookPost {
  id: string;
  shortcode?: string;
  content: string;
  timestamp: string;
  likeCount: number;
  commentCount: number;
  shareCount?: number;
  mediaUrls?: string[];
  comments?: FacebookComment[];
}

interface FacebookComment {
  id: string;
  username: string;
  text: string;
  timestamp: string;
  likeCount: number;
}

interface FacebookPageData {
  success: boolean;
  data: {
    page: FacebookPage;
    posts: FacebookPost[];
  };
  stats: {
    totalPosts: number;
    totalComments: number;
    scrapeTime: string;
  };
  error?: string;
}

interface SessionStatus {
  healthy: boolean;
  message: string;
  session_age_hours?: number;
  needs_refresh?: boolean;
  has_session?: boolean;
}

export default function NewTestPage() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [username, setUsername] = useState("fynrestaurantcpt");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Instagram state
  const [instagramProfile, setInstagramProfile] = useState<InstagramProfile | null>(null);
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  
  // Facebook state
  const [facebookData, setFacebookData] = useState<FacebookPageData | null>(null);
  
  // Session status state
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [refreshingSession, setRefreshingSession] = useState(false);

  const handleScrape = async () => {
    setLoading(true);
    setError(null);
    setInstagramProfile(null);
    setInstagramPosts([]);
    setFacebookData(null);

    try {
      if (platform === "instagram") {
        const response = await fetch("/api/test/instagram-api", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username.trim(),
            includeComments: true,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        setInstagramProfile(data.profile);
        setInstagramPosts(data.posts || []);
      } else if (platform === "facebook") {
        const response = await fetch("/api/test/facebook-api", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pageName: username.trim(),
            maxPosts: 12,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        setFacebookData(data);
      }
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

  const formatDate = (timestamp: number | string): string => {
    if (typeof timestamp === "string") {
      return new Date(timestamp).toLocaleDateString();
    }
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  // Check session status on mount and when platform changes to Instagram
  const checkSessionStatus = async () => {
    if (platform !== "instagram") return;
    
    try {
      const response = await fetch("/api/instagram/session/status");
      if (response.ok) {
        const data = await response.json();
        setSessionStatus(data);
      }
    } catch (error) {
      console.error("Failed to check session status:", error);
    }
  };

  // Refresh session manually
  const handleRefreshSession = async () => {
    setRefreshingSession(true);
    try {
      const apiKey = prompt("Enter API key (or leave empty if not configured):");
      const headfulMode = confirm("Run in headful mode? (Click OK for headful, Cancel for headless)");
      
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiKey) {
        headers["X-API-Key"] = apiKey;
      }

      // Add headful parameter to URL
      const url = `/api/instagram/session/refresh?headful=${headfulMode}`;

      const response = await fetch(url, {
        method: "POST",
        headers,
      });

      const data = await response.json();
      if (data.success) {
        alert("Session refreshed successfully!");
        await checkSessionStatus();
      } else {
        alert(`Session refresh failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      alert(`Error refreshing session: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setRefreshingSession(false);
    }
  };

  // Check session status when component mounts or platform changes
  useEffect(() => {
    checkSessionStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Social Media Scraper Test</h1>

        {/* Session Status Indicator (Instagram only) */}
        {platform === "instagram" && sessionStatus && (
          <div className={`mb-6 rounded-lg shadow-md p-4 ${
            sessionStatus.healthy 
              ? "bg-green-50 border border-green-200" 
              : "bg-yellow-50 border border-yellow-200"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  sessionStatus.healthy ? "bg-green-500" : "bg-yellow-500"
                }`} />
                <div>
                  <p className={`font-medium ${
                    sessionStatus.healthy ? "text-green-800" : "text-yellow-800"
                  }`}>
                    Session Status: {sessionStatus.healthy ? "Healthy" : "Needs Refresh"}
                  </p>
                  <p className={`text-sm ${
                    sessionStatus.healthy ? "text-green-600" : "text-yellow-600"
                  }`}>
                    {sessionStatus.message}
                    {sessionStatus.session_age_hours !== undefined && (
                      <span className="ml-2">
                        (Age: {sessionStatus.session_age_hours.toFixed(1)} hours)
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRefreshSession}
                disabled={refreshingSession}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {refreshingSession ? "Refreshing..." : "Refresh Session"}
              </button>
            </div>
          </div>
        )}

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="space-y-4">
            {/* Platform Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="platform"
                    value="instagram"
                    checked={platform === "instagram"}
                    onChange={(e) => {
                      setPlatform(e.target.value as Platform);
                      setUsername("fynrestaurantcpt");
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Instagram</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="platform"
                    value="facebook"
                    checked={platform === "facebook"}
                    onChange={(e) => {
                      setPlatform(e.target.value as Platform);
                      setUsername("ryanair");
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Facebook</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                {platform === "instagram" ? "Instagram Username" : "Facebook Page Name"}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={platform === "instagram" ? "fynrestaurantcpt" : "ryanair"}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleScrape}
              disabled={loading || !username.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Scraping..." : `Scrape ${platform === "instagram" ? "Instagram" : "Facebook"} Profile`}
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

        {/* Instagram Profile Display */}
        {instagramProfile && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start space-x-6">
               <img
                 src={
                   instagramProfile.profilePicUrlHd || instagramProfile.profilePicUrl
                     ? `/api/proxy-image?url=${encodeURIComponent(instagramProfile.profilePicUrlHd || instagramProfile.profilePicUrl)}`
                     : ""
                 }
                 alt={instagramProfile.username}
                 className="w-24 h-24 rounded-full object-cover bg-gray-200"
                 onError={(e) => {
                   // Fallback if proxy fails, try direct URL
                   const target = e.target as HTMLImageElement;
                   const originalUrl = instagramProfile.profilePicUrlHd || instagramProfile.profilePicUrl;
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
                     placeholder.textContent = instagramProfile.username.charAt(0).toUpperCase();
                     target.parentElement?.appendChild(placeholder);
                   }
                 }}
               />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{instagramProfile.fullName}</h2>
                  {instagramProfile.isVerified && (
                    <span className="text-blue-500" title="Verified">
                      ✓
                    </span>
                  )}
                  {instagramProfile.isBusinessAccount && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Business
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-2">@{instagramProfile.username}</p>
                {instagramProfile.biography && (
                  <p className="text-gray-700 mb-4 whitespace-pre-line">{instagramProfile.biography}</p>
                )}
                <div className="flex space-x-6 text-sm">
                  <div>
                    <span className="font-semibold">{formatNumber(instagramProfile.postCount)}</span> posts
                  </div>
                  <div>
                    <span className="font-semibold">{formatNumber(instagramProfile.followerCount)}</span>{" "}
                    followers
                  </div>
                  <div>
                    <span className="font-semibold">{formatNumber(instagramProfile.followingCount)}</span>{" "}
                    following
                  </div>
                </div>
                {instagramProfile.category && (
                  <p className="text-sm text-gray-500 mt-2">Category: {instagramProfile.category}</p>
                )}
                {instagramProfile.website && (
                  <a
                    href={instagramProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                  >
                    {instagramProfile.website}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Facebook Profile Display */}
        {facebookData && facebookData.success && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start space-x-6">
              {facebookData.data.page.profilePicUrl && (
                <img
                  src={`/api/proxy-image?url=${encodeURIComponent(facebookData.data.page.profilePicUrl)}`}
                  alt={facebookData.data.page.name}
                  className="w-24 h-24 rounded-full object-cover bg-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const placeholder = document.createElement("div");
                    placeholder.className = "w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-xs";
                    placeholder.textContent = facebookData.data.page.name.charAt(0).toUpperCase();
                    target.parentElement?.appendChild(placeholder);
                  }}
                />
              )}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{facebookData.data.page.name}</h2>
                  {facebookData.data.page.verified && (
                    <span className="text-blue-500" title="Verified">
                      ✓
                    </span>
                  )}
                  <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                    Facebook
                  </span>
                </div>
                <p className="text-gray-600 mb-2">@{facebookData.data.page.username}</p>
                {facebookData.data.page.about && (
                  <p className="text-gray-700 mb-4 whitespace-pre-line">{facebookData.data.page.about}</p>
                )}
                <div className="flex space-x-6 text-sm">
                  <div>
                    <span className="font-semibold">{formatNumber(facebookData.stats.totalPosts)}</span> posts
                  </div>
                  {facebookData.data.page.followers && (
                    <div>
                      <span className="font-semibold">{formatNumber(facebookData.data.page.followers)}</span>{" "}
                      followers
                    </div>
                  )}
                </div>
                {facebookData.data.page.website && (
                  <a
                    href={facebookData.data.page.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                  >
                    {facebookData.data.page.website}
                  </a>
                )}
                <p className="text-xs text-gray-400 mt-2">Scraped in {facebookData.stats.scrapeTime}</p>
              </div>
            </div>
          </div>
        )}

        {/* Instagram Posts Display */}
        {instagramPosts.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Posts ({instagramPosts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {instagramPosts.map((post) => (
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

        {/* Facebook Posts Display */}
        {facebookData && facebookData.success && facebookData.data.posts.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Posts ({facebookData.data.posts.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facebookData.data.posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">📘 Facebook Post</span>
                      {post.timestamp && (
                        <span className="text-xs text-gray-500">
                          {formatDate(post.timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span>👍 {formatNumber(post.likeCount)}</span>
                      <span>💬 {formatNumber(post.commentCount)}</span>
                      {post.shareCount && (
                        <span>🔄 {formatNumber(post.shareCount)}</span>
                      )}
                    </div>
                    {post.content && (
                      <p className="text-sm text-gray-700 line-clamp-6 mb-2">{post.content}</p>
                    )}
                    <a
                      href={`https://www.facebook.com/${facebookData.data.page.username}/posts/${post.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs"
                    >
                      View on Facebook →
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
                                  @{comment.username}
                                </span>
                                <span className="text-gray-600 flex-1">{comment.text}</span>
                              </div>
                              {comment.likeCount > 0 && (
                                <span className="text-gray-400 ml-4">
                                  👍 {comment.likeCount}
                                </span>
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
            <p className="mt-4 text-gray-600">Scraping {platform === "instagram" ? "Instagram" : "Facebook"} data...</p>
          </div>
        )}
      </div>
    </div>
  );
}
