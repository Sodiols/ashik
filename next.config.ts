import type { NextConfig } from "next";
const production = process.env.NODE_ENV === "production";
// WebKit upgrades localhost assets too. Only require HTTPS when the real
// HTTPS deployment origin is configured, so local production previews work.
const httpsDeployment = process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://");
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${production ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self' https://api.web3forms.com${production ? "" : " ws: wss:"}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://api.web3forms.com",
  "frame-ancestors 'none'",
  ...(production && httpsDeployment ? ["upgrade-insecure-requests"] : []),
].join("; ");
const config: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  poweredByHeader: false,
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};
export default config;
