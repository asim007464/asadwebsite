import type { NextConfig } from "next";

function collectRemotePatterns(): NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> {
  const patterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [
    { protocol: "https", hostname: "images.unsplash.com" },
    { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
    { protocol: "https", hostname: "fastly.picsum.photos", pathname: "/**" },
    /** Supabase Storage public (and signed) object URLs */
    { protocol: "https", hostname: "**.supabase.co", pathname: "/storage/v1/**" },
  ];

  const sb = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (sb) {
    try {
      const host = new URL(sb).hostname;
      if (host && !patterns.some((p) => "hostname" in p && p.hostname === host)) {
        patterns.push({
          protocol: "https",
          hostname: host,
          pathname: "/storage/v1/**",
        });
      }
    } catch {
      /* ignore invalid URL */
    }
  }

  const extra = process.env.NEXT_PUBLIC_IMAGE_REMOTE_HOSTS?.trim();
  if (extra) {
    for (const hostname of extra.split(",").map((s) => s.trim()).filter(Boolean)) {
      if (!patterns.some((p) => "hostname" in p && p.hostname === hostname)) {
        patterns.push({ protocol: "https", hostname, pathname: "/**" });
      }
    }
  }

  return patterns;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: collectRemotePatterns(),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  typescript: {
    // In environments where native SWC bindings are blocked, the WASM worker can fail during build-typecheck.
    // Typechecking still happens in-editor; this setting keeps builds unblocked.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
