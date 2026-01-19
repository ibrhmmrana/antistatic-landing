# Data Extraction Breakdown

This document provides a comprehensive breakdown of all information extracted from each data source in the Antistatic platform.

---

## 1. Website Crawl (`/api/scan/website`)

### Scrape Metadata
- `domain`: Website domain
- `timestamp`: When the crawl was performed
- `crawl_duration_seconds`: How long the crawl took
- `pages_crawled`: Total number of pages crawled
- `crawl_depth`: Maximum depth reached

### Site Overview
- `homepage_url`: Main website URL
- `robots_txt`: Contents of robots.txt file
- `sitemap_urls`: URLs found in sitemaps
- `primary_domain`: Primary domain name
- `cms_detected`: Detected CMS (WordPress, Shopify, etc.)
- `https_enforced`: Whether HTTPS is enforced
- `favicon_url`: Favicon URL

### Per-Page Data (`PageData`)

#### Basic Page Info
- `url`: Page URL
- `depth`: Crawl depth (0 = homepage)
- `http_status`: HTTP status code
- `redirect_chain`: URLs redirected through
- `page_type`: Classified page type (home, about, contact, blog, service, etc.)

#### SEO Elements
- `title`: Page title
- `title_length`: Character count of title
- `meta_description`: Meta description text
- `meta_desc_length`: Character count of meta description
- `h1_text`: Array of all H1 headings
- `h1_count`: Number of H1 tags
- `headings.h2`: Array of H2 headings
- `headings.h3`: Array of H3 headings
- `headings.h4`: Array of H4 headings
- `canonical_url`: Canonical URL
- `canonical_consistent`: Whether canonical matches current URL

#### Indexability
- `indexability.meta_robots`: Meta robots tag value
- `indexability.x_robots_tag`: X-Robots-Tag header value
- `indexability.is_indexable`: Whether page is indexable

#### Content Analysis
- `primary_intent`: Detected page intent (informational, transactional, etc.)
- `word_count`: Total word count on page
- `content_digest`: Content analysis including:
  - `top_phrases`: Most frequent phrases
  - `entity_mentions`: Named entities found
  - `duplicate_content_hash`: Hash for duplicate detection
  - `content_snippets`: Key content snippets

#### Links
- `internal_links`: Array of internal link URLs
- `internal_link_count`: Count of internal links
- `external_links.social`: Social media links
- `external_links.booking`: Booking platform links
- `external_links.reviews`: Review platform links
- `external_links.other`: Other external links
- `money_page_links`: Links to important pages (pricing, contact, etc.)

#### Contact Methods
- `contact_methods.phone`: Array of phone numbers found
- `contact_methods.email`: Array of email addresses found
- `contact_methods.whatsapp`: Array of WhatsApp links/numbers
- `contact_methods.forms`: Number of contact forms found
- `contact_methods.locations`: Array of location mentions

#### Clickable Actions
- `clickable_actions.tel_links`: Clickable phone number links
- `clickable_actions.mailto_links`: Email links
- `clickable_actions.whatsapp_links`: WhatsApp links

#### CTAs & Forms
- `primary_cta.button_text`: Text of primary CTA button
- `primary_cta.destination`: Where CTA links to
- `primary_cta.above_fold`: Whether CTA is above the fold
- `forms[]`: Array of form information:
  - `type`: Form type (contact, newsletter, booking, etc.)
  - `fields`: Array of field names
  - `required_fields`: Array of required field names
  - `submit_endpoint`: Form submission URL

#### Trust Signals
- `trust_signals.testimonials`: Array of testimonial text snippets
- `trust_signals.review_widgets`: Array of review widget identifiers
- `trust_signals.awards`: Array of award mentions
- `trust_signals.case_studies`: Number of case studies found
- `trust_signals.team_members`: Number of team member profiles
- `enhanced_trust_signals`: Additional trust signals:
  - `certifications`: Certifications mentioned
  - `partnerships`: Partnership mentions
  - `press_mentions`: Press/media mentions

#### Pricing
- `pricing_signals.has_pricing`: Whether pricing is mentioned
- `pricing_signals.price_ranges`: Array of price ranges found
- `pricing_signals.hidden_pricing`: Whether pricing requires contact

#### Local SEO
- `local_seo.location_pages`: Array of location-specific page URLs
- `local_seo.has_embedded_map`: Whether page has embedded map
- `local_seo.opening_hours`: Opening hours text found

#### Structured Data
- `structured_data[]`: Array of structured data items:
  - `type`: Schema.org type (LocalBusiness, Organization, etc.)
  - `format`: Format (JSON-LD, Microdata, RDFa)
  - `data`: Structured data object

#### Social Meta Tags
- `social_meta.og_title`: Open Graph title
- `social_meta.og_description`: Open Graph description
- `social_meta.og_image`: Open Graph image URL
- `social_meta.twitter_card`: Twitter card type

#### Images
- `images.total_images`: Total image count
- `images.images_with_alt`: Count of images with alt text
- `images.images_without_alt`: Count of images missing alt text
- `images.largest_image_url`: URL of largest image
- `images.has_logo`: Whether logo is detected

#### Performance
- `performance.load_time_ms`: Estimated load time
- `performance.has_lazy_loading`: Whether lazy loading is used
- `performance.image_optimization`: Image optimization indicators

#### Analytics
- `analytics.has_google_analytics`: Whether GA is detected
- `analytics.has_facebook_pixel`: Whether Facebook Pixel is detected
- `analytics.has_other_trackers`: Whether other trackers are detected

#### Brand Consistency
- `brand_consistency.logo_consistency`: Whether logo appears consistently
- `brand_consistency.color_scheme`: Detected color scheme
- `brand_consistency.font_usage`: Font consistency indicators

#### Security
- `security.has_ssl`: Whether SSL certificate is present
- `security.security_headers`: Security headers detected

#### Freshness
- `freshness.last_updated`: Last update date if found
- `freshness.has_blog`: Whether blog/news section exists
- `freshness.recent_content`: Indicators of recent content

#### Viewport Checks
- `viewport_checks.is_mobile_friendly`: Mobile responsiveness check
- `viewport_checks.has_viewport_meta`: Whether viewport meta tag exists
- `viewport_checks.above_fold_content`: Content visibility above fold

#### UX Checks
- `ux_checks.has_clear_contact_path`: Whether contact is easy to find
- `ux_checks.has_local_intent_terms`: Local business terms found
- `ux_checks.has_service_terms`: Service-related terms found
- `ux_checks.has_pricing_signals`: Pricing information found
- `ux_checks.has_faq`: FAQ section detected
- `ux_checks.blocked_by_captcha`: Whether page is blocked by CAPTCHA

### Site Graph
- `internal_link_matrix`: Map of page URLs to their internal links
- `orphan_pages`: Pages with no internal links pointing to them

### Summary Metrics
- `total_pages`: Total pages crawled
- `indexable_pages`: Pages that are indexable
- `pages_with_issues`: Pages with SEO/technical issues
- `seo_score`: Overall SEO score (0-100)
- `technical_score`: Technical SEO score (0-100)

### Site Report Summary
- Aggregated findings and recommendations
- Key issues and opportunities
- Overall site health assessment

### Business Identity (Resolved)
- `website_host`: Website domain
- `business_name`: Resolved business name
- `category_label`: Business category (Restaurant, Dentist, etc.)
- `service_keywords`: Extracted service keywords
- `location_label`: Full location string
- `location_suburb`: Suburb/neighborhood
- `location_city`: City
- `location_country`: Country
- `latlng`: Latitude/longitude coordinates
- `place_id`: Google Places place_id
- `place_types`: Google Places types array
- `rating`: Google rating (if available)
- `review_count`: Number of reviews
- `sources`: Data sources used (gbp, places, website)
- `confidence`: Confidence level (high, medium, low)
- `debug_info`: Resolution debug log

### Search Visibility
- `queries[]`: Array of search query results:
  - `query`: Search query text
  - `intent`: branded or non_branded
  - `rationale`: Why this query was generated
  - `mapPack.rank`: Rank in Google Maps pack (1-3 or null)
  - `mapPack.results[]`: Top 3 map pack results:
    - `place_id`: Place ID
    - `name`: Business name
    - `rating`: Rating
    - `user_ratings_total`: Review count
    - `address`: Address
    - `website`: Website URL
  - `organic.rank`: Rank in organic search (1-10 or null)
  - `organic.results[]`: Top 10 organic results:
    - `position`: Position (1-10)
    - `title`: Result title
    - `link`: Result URL
    - `displayLink`: Display domain
    - `snippet`: Result snippet
    - `domain`: Domain name
    - `faviconUrl`: Favicon URL
- `visibility_score`: Overall visibility score (0-100)
- `share_of_voice`: Percentage of queries ranking in top 10
- `branded_visibility`: Branded query visibility score
- `non_branded_visibility`: Non-branded query visibility score
- `top_competitor_domains`: Top competitor domains from search
- `directory_domains`: Directory/platform domains found
- `business_domains`: Business competitor domains found
- `identity_used`: Identity data used for query generation
- `query_generation_debug`: Debug info for query generation

### Competitors Snapshot
- `competitors_places[]`: Array of competitor businesses:
  - `place_id`: Google Places ID
  - `name`: Business name
  - `rating`: Rating
  - `user_ratings_total`: Review count
  - `website`: Website URL
  - `phone`: Phone number
  - `address`: Address
  - `opening_hours`: Opening hours object
  - `types`: Business types array
  - `distance_meters`: Distance from target business
  - `comparison_notes`: Comparison notes
- `reputation_gap`: Comparison metrics:
  - `your_rating`: Target business rating
  - `your_reviews`: Target business review count
  - `competitor_median_rating`: Median competitor rating
  - `competitor_median_reviews`: Median competitor reviews
  - `competitor_top_rating`: Top competitor rating
  - `competitor_top_reviews`: Top competitor reviews
  - `rating_gap`: Rating difference
  - `reviews_gap`: Review count difference
  - `status`: ahead, behind, competitive, or unknown
- `competitors_with_website`: Count of competitors with websites
- `competitors_without_website`: Count without websites
- `search_method`: How competitors were found (nearby, text, stage1_enriched, etc.)
- `search_radius_meters`: Search radius used
- `search_queries_used`: Queries used to find competitors
- `location_used`: Location used for search
- `your_place_id`: Target business place_id
- `competitor_source`: Source of competitor data
- `error`: Error message if search failed
- `debug_info`: Debug log

---

## 2. Instagram Scrape (`/api/test/instagram-scrape`)

### Profile Data
- `username`: Instagram username
- `fullName`: Full name from profile
- `profilePictureUrl`: Profile picture URL
- `biography`: Bio text
- `website`: Website URL from profile
- `isVerified`: Whether account is verified
- `category`: Business category (if set)
- `postCount`: Total number of posts
- `followerCount`: Number of followers
- `followingCount`: Number of accounts following

### Posts Data
- `posts[]`: Array of posts:
  - `id`: Post ID
  - `url`: Post URL
  - `thumbnailUrl`: Thumbnail image URL
  - `date`: Post date (ISO format, best effort)
  - `caption`: Post caption text
  - `likeCount`: Number of likes
  - `commentCount`: Number of comments
  - `comments[]`: Array of comments:
    - `author`: Comment author username
    - `text`: Comment text

---

## 3. Facebook Scrape (`/api/test/facebook-scrape`)

### Profile Data
- `name`: Business/page name
- `description`: Page description
- `category`: Business category
- `address`: Business address
- `phone`: Phone number
- `email`: Email address
- `website`: Website URL
- `hours`: Opening hours text
- `serviceOptions`: Service options (Dine-in, Takeout, etc.)
- `priceRange`: Price range ($, $$, $$$, $$$$)
- `reviewsRating`: Reviews rating display
- `profilePictureUrl`: Profile picture URL

### Posts Data
- `posts[]`: Array of posts:
  - `caption`: Post caption/text
  - `likeCount`: Number of likes/reactions
  - `commentCount`: Number of comments
  - `mediaType`: Type of media (image, video, multiple_images, unknown)
  - `comments[]`: Array of comments:
    - `author`: Comment author name
    - `text`: Comment text
    - `timeAgo`: Time ago string
    - `reactionCount`: Number of reactions on comment

---

## 4. Google Business Profile Analysis (`/api/gbp/place-details`)

### Place Details (from Google Places API)
- `name`: Business name
- `address`: Formatted address
- `lat`: Latitude
- `lng`: Longitude
- `website`: Website URL
- `phone`: Phone number (formatted or international)
- `rating`: Google rating (1-5)
- `reviews`: Number of reviews
- `openingHours`: Opening hours object:
  - `weekday_text[]`: Array of weekday hours strings
  - `open_now`: Whether currently open
- `priceLevel`: Price level (0-4, $ to $$$$)
- `types[]`: Array of business types
- `businessStatus`: Business status (OPERATIONAL, etc.)
- `description`: General description from editorial_summary
- `photoRef`: Photo reference for first photo
- `url`: Google Maps URL

### Analysis Results

#### Business Info
- `businessName`: Business name
- `rating`: Rating (if available)
- `reviews`: Review count (if available)

#### Checklist Items
Each item includes:
- `key`: Item identifier
- `label`: Display label
- `status`: good, warn, or bad
- `value`: Optional summary value
- `extractedValue`: The actual extracted data
- `helper`: Explanation text

**Checklist Items:**
1. **First-party website**
   - Status: good (if website exists) or bad (if missing)
   - Extracted: Website URL

2. **Description**
   - Status: good (if description exists) or bad (if missing)
   - Extracted: Full description text from editorial_summary

3. **Business hours**
   - Status: good (if hours configured) or bad (if missing)
   - Extracted: All weekday hours (one per line)

4. **Phone number**
   - Status: good (if phone exists) or bad (if missing)
   - Extracted: Phone number

5. **Price range**
   - Status: good (if set) or warn (if not set)
   - Extracted: Price level ($, $$, $$$, $$$$)

6. **Social media links**
   - Status: good (if found on website), bad (if website exists but no links), or warn (if no website)
   - Extracted: Array of social media URLs found on website

7. **Description includes relevant keywords**
   - Status: good (if 50%+ match), warn (if <50% match), or warn (if no description)
   - Extracted: Matched keywords and all extracted keywords

8. **Categories match keywords**
   - Status: good (if business types found) or warn (if only generic types)
   - Extracted: Business types found

#### Keyword Checks
- `extractedKeywords[]`: Keywords extracted from address and business types
- `descriptionKeywordMatchPct`: Percentage of keywords found in description
- `categoryKeywordMatchPct`: Category keyword match percentage

---

## Summary

### Website Crawl
- **Most Comprehensive**: Extracts 100+ data points per page
- **Focus Areas**: SEO, technical performance, content analysis, contact methods, trust signals, business intelligence
- **Output**: Per-page analysis + site-wide summary + business identity + search visibility + competitors

### Instagram Scrape
- **Focus**: Profile metadata + posts + comments
- **Output**: Profile info + array of posts with engagement metrics

### Facebook Scrape
- **Focus**: Business page info + posts + comments
- **Output**: Complete page data + posts with engagement

### GBP Analysis
- **Focus**: Google Business Profile completeness checklist
- **Output**: Place details + 8-item checklist with extracted values + keyword analysis
