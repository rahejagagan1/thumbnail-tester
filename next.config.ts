import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",

  // Next dev serves its client chunks only to the origin it was started on, and
  // 403s everything else. Reaching the dev server by LAN address — a phone, a
  // second machine, a browser sandboxed away from loopback — therefore renders
  // the server HTML and then silently fails to hydrate: the page looks right
  // but nothing works, and anything driven by client state (the feed's column
  // count, for one) is frozen at its server-rendered default. Allowing private
  // ranges makes that a working preview instead of a confusing half-page.
  // Matched as hostnames/globs, not CIDR ranges.
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    "192.168.*.*",
    "10.*.*.*",
  ],
};

export default nextConfig;
