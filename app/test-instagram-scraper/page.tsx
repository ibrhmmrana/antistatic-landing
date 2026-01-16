"use client";

import { useState } from "react";

// =============================================================================
// INSTAGRAM TYPES
// =============================================================================

interface ProfileData {
  profilePictureUrl: string | null;
  username: string;
  fullName: string | null;
  biography: string | null;
  website: string | null;
  isVerified: boolean;
  category: string | null;
  postCount: number | null;
  followerCount: number | null;
  followingCount: number | null;
}

interface Comment {
  author: string;
  text: string;
}

interface Post {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  date: string | null;
  likeCount: number | null;
  commentCount: number | null;
  comments: Comment[];
}

interface ScrapeResult {
  profile: ProfileData;
  posts: Post[];
}

// =============================================================================
// FACEBOOK TYPES
// =============================================================================

interface FacebookComment {
  author: string | null;
  text: string | null;
  timeAgo: string | null;
  reactionCount: number | null;
}

interface FacebookPost {
  caption: string | null;
  likeCount: number | null;
  commentCount: number | null;
  mediaType: 'image' | 'video' | 'multiple_images' | 'unknown';
  comments: FacebookComment[];
}

interface FacebookProfileData {
  name: string | null;
  description: string | null;
  category: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours: string | null;
  serviceOptions: string | null;
  priceRange: string | null;
  reviewsRating: string | null;
  profilePictureUrl: string | null;
  posts: FacebookPost[];
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function TestSocialScraper() {
  // Instagram state
  const [igUsername, setIgUsername] = useState("");
  const [igLoading, setIgLoading] = useState(false);
  const [igResult, setIgResult] = useState<ScrapeResult | null>(null);
  const [igError, setIgError] = useState<string | null>(null);

  // Facebook state
  const [fbUsername, setFbUsername] = useState("");
  const [fbLoading, setFbLoading] = useState(false);
  const [fbResult, setFbResult] = useState<FacebookProfileData | null>(null);
  const [fbError, setFbError] = useState<string | null>(null);

  // Instagram submit handler
  const handleInstagramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIgLoading(true);
    setIgError(null);
    setIgResult(null);

    try {
      const response = await fetch("/api/test/instagram-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: igUsername }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Scraping failed");
      }

      const data = await response.json();
      setIgResult(data);
    } catch (err: any) {
      setIgError(err.message || "An error occurred");
    } finally {
      setIgLoading(false);
    }
  };

  // Facebook submit handler
  const handleFacebookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFbLoading(true);
    setFbError(null);
    setFbResult(null);

    try {
      const response = await fetch("/api/test/facebook-scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: fbUsername }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Scraping failed");
      }

      const data = await response.json();
      setFbResult(data);
    } catch (err: any) {
      setFbError(err.message || "An error occurred");
    } finally {
      setFbLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ================================================================= */}
        {/* FACEBOOK SECTION */}
        {/* ================================================================= */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔵 Facebook Scraper Test
          </h1>
          <p className="text-gray-600 mb-6">
            Enter a Facebook page username/URL to scrape profile data (uses same navigation as screenshotter)
          </p>

          <form onSubmit={handleFacebookSubmit} className="flex gap-4">
            <input
              type="text"
              value={fbUsername}
              onChange={(e) => setFbUsername(e.target.value)}
              placeholder="Enter Facebook page username or URL (e.g., cafecapriceCT)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={fbLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {fbLoading ? "Scraping..." : "Scrape"}
            </button>
          </form>
        </div>

        {fbError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-red-800 mb-2">❌ Facebook Error</h2>
            <p className="text-red-600">{fbError}</p>
          </div>
        )}

        {fbResult && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Facebook Profile Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fbResult.profilePictureUrl && (
                <div className="md:col-span-2">
                  <img
                    src={fbResult.profilePictureUrl}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                </div>
              )}
              {fbResult.name && (
                <div>
                  <label className="text-sm font-semibold text-gray-500">Page Name</label>
                  <p className="text-gray-900">{fbResult.name}</p>
                </div>
              )}
              {fbResult.category && (
                <div>
                  <label className="text-sm font-semibold text-gray-500">Category</label>
                  <p className="text-gray-900">{fbResult.category}</p>
                </div>
              )}
              {fbResult.description && (
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-500">Description</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{fbResult.description}</p>
                </div>
              )}
              {fbResult.address && (
                <div>
                  <label className="text-sm font-semibold text-gray-500">📍 Address</label>
                  <p className="text-gray-900">{fbResult.address}</p>
                </div>
              )}
              {fbResult.phone && (
                <div>
                  <label className="text-sm font-semibold text-gray-500">📞 Phone</label>
                  <p className="text-gray-900">{fbResult.phone}</p>
                </div>
              )}
              {fbResult.email && (
                <div>
                  <label className="text-sm font-semibold text-gray-500">📧 Email</label>
                  <p className="text-gray-900">{fbResult.email}</p>
                </div>
              )}
              {fbResult.website && (
                <div>
                  <label className="text-sm font-semibold text-gray-500">🌐 Website</label>
                  <p className="text-gray-900">
                    <a 
                      href={fbResult.website.startsWith("http") ? fbResult.website : `https://${fbResult.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {fbResult.website}
                    </a>
                  </p>
                </div>
              )}
              {fbResult.hours && (
                <div>
                  <label className="text-sm font-semibold text-gray-500">🕐 Hours</label>
                  <p className="text-gray-900">{fbResult.hours}</p>
                </div>
              )}
              {fbResult.serviceOptions && (
                <div>
                  <label className="text-sm font-semibold text-gray-500">🍽️ Service Options</label>
                  <p className="text-gray-900">{fbResult.serviceOptions}</p>
                </div>
              )}
              {fbResult.priceRange && (
                <div>
                  <label className="text-sm font-semibold text-gray-500">💰 Price Range</label>
                  <p className="text-gray-900">{fbResult.priceRange}</p>
                </div>
              )}
              {fbResult.reviewsRating && (
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-gray-500">⭐ Reviews/Rating</label>
                  <p className="text-gray-900">{fbResult.reviewsRating}</p>
                </div>
              )}
            </div>
            
            {/* Posts Section */}
            {fbResult.posts && fbResult.posts.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Posts ({fbResult.posts.length})
                </h3>
                <div className="space-y-6">
                  {fbResult.posts.map((post, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-sm font-semibold text-gray-500">Post {index + 1}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          post.mediaType === 'video' ? 'bg-purple-100 text-purple-700' :
                          post.mediaType === 'multiple_images' ? 'bg-blue-100 text-blue-700' :
                          post.mediaType === 'image' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {post.mediaType === 'video' ? '🎥 Video' :
                           post.mediaType === 'multiple_images' ? '🖼️ Multiple Images' :
                           post.mediaType === 'image' ? '📷 Image' :
                           '❓ Unknown'}
                        </span>
                      </div>
                      
                      {post.caption && (
                        <p className="text-gray-800 whitespace-pre-wrap mb-3">{post.caption}</p>
                      )}
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                        {post.likeCount !== null && (
                          <span>👍 {post.likeCount.toLocaleString()} likes</span>
                        )}
                        {post.commentCount !== null && (
                          <span>💬 {post.commentCount.toLocaleString()} comments</span>
                        )}
                        {post.likeCount === null && post.commentCount === null && (
                          <span className="text-gray-400 italic">No engagement data found</span>
                        )}
                      </div>
                      
                      {/* Comments Section */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-blue-200">
                          <h4 className="font-semibold text-gray-700 mb-2 text-sm">
                            Comments ({post.comments.length})
                          </h4>
                          <div className="space-y-3">
                            {post.comments.map((comment, commentIndex) => (
                              <div key={commentIndex} className="text-sm bg-gray-50 rounded p-2">
                                <div className="flex items-center gap-2 mb-1">
                                  {comment.author && (
                                    <span className="font-semibold text-gray-900">{comment.author}</span>
                                  )}
                                  {comment.timeAgo && (
                                    <span className="text-gray-500 text-xs">{comment.timeAgo}</span>
                                  )}
                                  {comment.reactionCount !== null && comment.reactionCount > 0 && (
                                    <span className="text-gray-500 text-xs">❤️ {comment.reactionCount}</span>
                                  )}
                                </div>
                                {comment.text && (
                                  <p className="text-gray-700">{comment.text}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <hr className="my-12 border-gray-300" />

        {/* ================================================================= */}
        {/* INSTAGRAM SECTION */}
        {/* ================================================================= */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Instagram Scraper Test
          </h1>
          <p className="text-gray-600 mb-6">
            Enter an Instagram username to scrape profile data, posts, and comments
          </p>

          <form onSubmit={handleInstagramSubmit} className="flex gap-4">
            <input
              type="text"
              value={igUsername}
              onChange={(e) => setIgUsername(e.target.value)}
              placeholder="Enter Instagram username (without @)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={igLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {igLoading ? "Scraping..." : "Scrape"}
            </button>
          </form>
        </div>

        {igError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-red-800 mb-2">❌ Instagram Error</h2>
            <p className="text-red-600">{igError}</p>
          </div>
        )}

        {igResult && (
          <div className="space-y-8">
            {/* Profile Data */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Data</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {igResult.profile.profilePictureUrl && (
                  <div className="md:col-span-2">
                    <img
                      src={`/api/proxy-image?url=${encodeURIComponent(igResult.profile.profilePictureUrl)}`}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <label className="text-sm font-semibold text-gray-500">Username</label>
                  <p className="text-gray-900 flex items-center gap-2">
                    {igResult.profile.username}
                    {igResult.profile.isVerified && (
                      <span className="text-blue-500" title="Verified">✓</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Full Name</label>
                  <p className="text-gray-900">{igResult.profile.fullName || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Verification Status</label>
                  <p className="text-gray-900">{igResult.profile.isVerified ? "✓ Verified" : "Not Verified"}</p>
                </div>
                {igResult.profile.category && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Category</label>
                    <p className="text-gray-900">{igResult.profile.category}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-semibold text-gray-500">Posts</label>
                  <p className="text-gray-900">{igResult.profile.postCount?.toLocaleString() || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Followers</label>
                  <p className="text-gray-900">{igResult.profile.followerCount?.toLocaleString() || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500">Following</label>
                  <p className="text-gray-900">{igResult.profile.followingCount?.toLocaleString() || "N/A"}</p>
                </div>
                {igResult.profile.website && (
                  <div>
                    <label className="text-sm font-semibold text-gray-500">Website</label>
                    <p className="text-gray-900">
                      <a 
                        href={igResult.profile.website.startsWith("http") ? igResult.profile.website : `https://${igResult.profile.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {igResult.profile.website}
                      </a>
                    </p>
                  </div>
                )}
                {igResult.profile.biography && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-semibold text-gray-500">Biography</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{igResult.profile.biography}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Posts */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Last 5 Posts ({igResult.posts.length})
              </h2>
              <div className="space-y-8">
                {igResult.posts.map((post, index) => (
                  <div key={index} className="border-b border-gray-200 pb-8 last:border-b-0">
                    <div className="mb-4">
                      <div className="flex items-center gap-4 mb-2">
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Open post ↗
                        </a>
                        {post.date && (
                          <span className="text-gray-500 text-sm">
                            {new Date(post.date).toLocaleString()}
                          </span>
                        )}
                        {post.likeCount != null && (
                          <span className="text-gray-500 text-sm">❤️ {post.likeCount.toLocaleString()} likes</span>
                        )}
                        {post.commentCount != null && (
                          <span className="text-gray-500 text-sm">💬 {post.commentCount.toLocaleString()} comments</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Post ID: {post.id}</p>
                    </div>

                    {/* Thumbnail */}
                    <div className="mb-4">
                      {post.thumbnailUrl ? (
                        <img
                          src={post.thumbnailUrl}
                          alt={`Post ${index + 1} thumbnail`}
                          className="w-full max-w-xl rounded-lg object-cover"
                        />
                      ) : (
                        <p className="text-sm text-gray-500">No thumbnail found.</p>
                      )}
                    </div>

                    {/* Caption */}
                    {post.caption && (
                      <div className="mb-4">
                        <p className="text-gray-900 whitespace-pre-wrap">{post.caption}</p>
                      </div>
                    )}

                    {/* Comments */}
                    {post.comments.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200">
                        <h4 className="font-semibold text-gray-700 mb-2">
                          Comments ({post.comments.length})
                        </h4>
                        <div className="space-y-3">
                          {post.comments.map((comment, commentIndex) => (
                            <div key={commentIndex} className="text-sm">
                              <span className="font-semibold text-gray-900">{comment.author}</span>
                              <span className="text-gray-700 ml-2">{comment.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
