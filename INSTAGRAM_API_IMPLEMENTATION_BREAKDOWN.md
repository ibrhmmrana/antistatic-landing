# Instagram API Scraper - Implementation Breakdown & Current Error Analysis

**Date:** 2025-01-11  
**Status:** ⚠️ **AUTHENTICATION HEADER EXTRACTION FAILING**

---

## 📋 **WHAT HAS BEEN IMPLEMENTED**

### **1. Frontend Test Page** (`app/new-test/page.tsx`)
✅ **Complete and Working**
- React component with form input for username
- Checkbox to optionally include comments
- Displays profile information (name, bio, followers, etc.)
- Displays posts in a grid layout
- Shows comments when enabled
- Error handling and loading states

### **2. Backend API Route** (`app/api/test/instagram-api/route.ts`)
✅ **Structure Complete, ⚠️ Auth Header Issue**

#### **Core Functions Implemented:**

1. **`decodeSessionId(encoded: string)`** ✅
   - URL-decodes the session ID from environment variable
   - Handles errors gracefully

2. **`getAuthorizationHeader(sessionId, username)`** ⚠️ **ISSUE HERE**
   - Makes request to Instagram API endpoint
   - Attempts to extract `ig-set-authorization` header
   - **PROBLEM:** Header not found in `response.headers`

3. **`fetchProfile(username, sessionId, authHeader)`** ✅
   - Fetches user profile data
   - Returns structured profile object
   - Works with or without auth header

4. **`fetchUserFeed(userId, sessionId, authHeader, count)`** ✅
   - Fetches user's posts (feed)
   - Returns array of post objects
   - Works with or without auth header

5. **`fetchPostByShortcode(shortcode, sessionId, authHeader)`** ✅
   - Gets post details by shortcode
   - Used for getting post PK for comments

6. **`fetchCommentsREST(postPk, sessionId, authHeader, count)`** ✅
   - Fetches comments using REST API
   - Returns structured comment objects

7. **`fetchCommentsGraphQL(shortcode, sessionId, authHeader, first)`** ✅
   - Fetches comments using GraphQL endpoint
   - Includes nested replies
   - Fallback if REST fails

8. **`scrapeInstagramAPI(username)`** ⚠️ **FAILS AT AUTH HEADER STEP**
   - Main orchestrator function
   - Calls all other functions in sequence
   - **CURRENTLY FAILING** at authorization header extraction

---

## 🔴 **CURRENT ERROR**

### **Error Message:**
```
Failed to get authorization header. Session may be invalid.
```

### **Error Location:**
- **File:** `app/api/test/instagram-api/route.ts`
- **Function:** `getAuthorizationHeader()`
- **Line:** ~441 (when called from `scrapeInstagramAPI()`)

### **Error Flow:**
1. ✅ Session ID decoded successfully
2. ✅ Request made to Instagram API endpoint
3. ✅ Response received (likely 200 OK)
4. ❌ **`ig-set-authorization` header NOT found in `response.headers`**
5. ❌ Function returns `null` or throws error
6. ❌ Scraper fails before fetching profile

---

## 🔍 **ROOT CAUSE ANALYSIS**

### **The Problem:**

**PowerShell vs Node.js Fetch Behavior:**

In **PowerShell** (working):
```powershell
curl.exe -i -sS -L ...  # -i flag includes headers in response BODY
$authHeader = ($response | Select-String 'ig-set-authorization: (.+)').Matches.Groups[1].Value
```
- `curl -i` includes HTTP headers in the response **body text**
- Headers are extracted using **regex from the response text**
- Headers are NOT in a separate headers object

In **Node.js** (failing):
```typescript
const response = await fetch(url, {...});
const authHeader = response.headers.get("ig-set-authorization");
```
- `fetch()` API separates headers from body
- Headers are in `response.headers` object
- **BUT:** `ig-set-authorization` might not be exposed in `response.headers`

### **Why the Header Might Not Be Accessible:**

1. **CORS/Exposed Headers:** Instagram might not expose `ig-set-authorization` in the `Access-Control-Expose-Headers`
2. **Custom Header:** It's a custom Instagram header that might be filtered
3. **Response Body Consumption:** We're calling `response.text()` which might affect header access
4. **Header Name Case:** Node.js might normalize header names differently

### **Evidence from Your PowerShell Output:**

Looking at your successful PowerShell response, I notice:
- The response shows `ig-set-authorization` header in the **response body** (when using `-i`)
- But in the actual headers list shown, I don't see `ig-set-authorization` explicitly listed
- This suggests the header might be set via a different mechanism

---

## 🛠️ **IMPLEMENTATION DETAILS**

### **API Endpoints Used:**

1. **Profile Info:**
   ```
   GET /api/v1/users/web_profile_info/?username={username}
   ```

2. **User Feed:**
   ```
   GET /api/v1/feed/user/{userId}/?count=12
   ```

3. **Post by Shortcode:**
   ```
   GET /api/v1/media/shortcode/{shortcode}/
   ```

4. **Comments (REST):**
   ```
   GET /api/v1/media/{postPk}/comments/?can_support_threading=true&permalink_enabled=false&count=100
   ```

5. **Comments (GraphQL):**
   ```
   GET /graphql/query/?query_hash=bc3296d1ce80a24b1b6e40b1e72903f5&variables={...}
   ```

### **Headers Used:**
- `User-Agent: Instagram 267.0.0.19.301 Android`
- `X-IG-App-ID: 567067343352427`
- `Cookie: sessionid={decodedSessionId}`
- `Authorization: {authHeader}` (if available)

### **Data Structures:**

**Profile:**
- username, fullName, biography
- profilePicUrl, profilePicUrlHd
- followerCount, followingCount, postCount
- isVerified, isBusinessAccount, category, website
- userId

**Post:**
- id, shortcode, mediaType
- likeCount, commentCount, caption
- thumbnailUrl, videoUrl, takenAt
- owner (username, userId)
- comments[] (optional)

**Comment:**
- id, text, createdAt, likeCount
- owner (username, fullName, userId, profilePicUrl, isVerified)
- replies[] (optional)

---

## 🎯 **WHAT WORKS**

✅ **Session ID Decoding** - Correctly decodes URL-encoded session  
✅ **Request Structure** - All requests use correct headers and endpoints  
✅ **Error Handling** - Comprehensive try/catch and logging  
✅ **Data Parsing** - Correctly extracts data from JSON responses  
✅ **UI Components** - Frontend displays data correctly when received  

---

## ❌ **WHAT DOESN'T WORK**

❌ **Authorization Header Extraction** - Cannot get `ig-set-authorization` from response  
❌ **Profile Fetching** - Fails because auth header step fails first  
❌ **Post Fetching** - Never reached due to earlier failure  
❌ **Comment Fetching** - Never reached due to earlier failure  

---

## 🔧 **POTENTIAL SOLUTIONS**

### **Solution 1: Extract Header from Response Body (Like PowerShell)**
Instead of using `response.headers.get()`, we could:
1. Get the raw response as text (including headers if possible)
2. Use regex to extract `ig-set-authorization: (.+)`
3. **Problem:** Node.js `fetch()` doesn't include headers in body by default

### **Solution 2: Continue Without Auth Header**
The code already has fallback logic to continue without auth header if session is valid. But it's currently throwing an error instead of continuing.

### **Solution 3: Use Different HTTP Client**
Use a library like `axios` or `node-fetch` that might expose headers differently, or use `undici` which is Node.js's native fetch implementation.

### **Solution 4: Check if Session Cookie Alone Works**
Based on your PowerShell example, the second request works WITH the auth header. But we should test if requests work WITHOUT it, using only the session cookie.

### **Solution 5: Make Two Requests (Like PowerShell)**
1. First request: Get auth header (even if we can't extract it, make the request)
2. Second request: Use the auth header (if we had it)
3. **But:** We need to actually GET the header somehow

---

## 📊 **CURRENT CODE FLOW**

```
1. POST /api/test/instagram-api
   ↓
2. scrapeInstagramAPI(username)
   ↓
3. decodeSessionId(encodedSession) ✅
   ↓
4. getAuthorizationHeader(sessionId, username) ❌ FAILS HERE
   - Makes request to Instagram
   - Tries to get header from response.headers
   - Header not found
   - Returns null or throws error
   ↓
5. [NEVER REACHED] fetchProfile()
6. [NEVER REACHED] fetchUserFeed()
7. [NEVER REACHED] fetchComments()
```

---

## 🐛 **DEBUGGING INFORMATION NEEDED**

To fix this, we need to know:

1. **What headers ARE present in the response?**
   - The code logs first 5 headers, but we need ALL headers
   - Check console logs for: `[API] Response headers: ...`

2. **What is the actual response status?**
   - Is it 200 OK?
   - Is it a redirect?

3. **What is the response body?**
   - Is it valid JSON?
   - Does it contain `{"status": "ok"}`?

4. **Does the session cookie work without auth header?**
   - Can we skip the auth header step and just use session cookie?

---

## 💡 **RECOMMENDED FIX**

**Immediate Fix:**
1. Modify `getAuthorizationHeader()` to NOT throw error if header not found
2. Return `null` and let the code continue
3. Test if profile fetching works with just session cookie

**Long-term Fix:**
1. Investigate if we can get raw response with headers
2. Consider using a different HTTP client
3. Or: Accept that auth header might not be needed if session cookie works

---

## 📝 **NEXT STEPS**

1. **Check console logs** - What headers are actually present?
2. **Test without auth header** - Does session cookie alone work?
3. **If session works without header** - Remove the requirement for auth header
4. **If session doesn't work** - Find alternative way to get auth header

---

**End of Breakdown**
