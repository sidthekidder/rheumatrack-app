/**
 * Exercise video URLs. Constants ready to wire when immunocare.in goes live;
 * Wellness tab does NOT render a "Watch Videos" button per design decision
 * (see v3.3 spec section 8 / Phase 3 design § Wellness exercise videos).
 */
export const VIDEO_BASE = 'https://immunocare.in/exercises';

export const VIDEO_URLS: Record<string, string> = {
  rheumatoid_arthritis: `${VIDEO_BASE}/rheumatoid-arthritis`,
  ankylosing_spondylitis: `${VIDEO_BASE}/ankylosing-spondylitis`,
  knee_oa: `${VIDEO_BASE}/knee-osteoarthritis`,
  gout: `${VIDEO_BASE}/gout`,
  general: `${VIDEO_BASE}/general`,
};
