import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Simple in-memory cache for Kick avatars
  const avatarCache = new Map<string, { data: any, timestamp: number }>();
  const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

  // API Proxy for Kick Channel Info (Robust version with fallbacks)
  app.get("/api/kick-channel/:username", async (req, res) => {
    const { username } = req.params;
    const cleanUsername = username.toLowerCase().trim();
    
    // Check cache first for speed
    if (avatarCache.has(cleanUsername)) {
      const cached = avatarCache.get(cleanUsername)!;
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`Serving cached avatar for ${cleanUsername}`);
        return res.json(cached.data);
      }
    }

    // Avoid fetching for very short usernames to reduce 403s during typing
    if (cleanUsername.length < 3 && cleanUsername !== 'n0') {
      return res.status(400).json({ error: 'Username too short' });
    }

    const commonHeaders = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'max-age=0',
      'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"macOS"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'Connection': 'keep-alive'
    };

    // Parallelize API and HTML fetching for ultra-fast response
    const fetchTasks = [
      // API v2
      (async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        try {
          const response = await fetch(`https://kick.com/api/v2/channels/${cleanUsername}`, { 
            headers: { ...commonHeaders, 'Accept': 'application/json' },
            signal: controller.signal
          });
          if (response.ok) {
            const data = await response.json();
            if (data?.user?.profile_pic) return data;
          }
        } finally {
          clearTimeout(timeout);
        }
        throw new Error('API v2 failed');
      })(),
      // API v1
      (async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        try {
          const response = await fetch(`https://kick.com/api/v1/channels/${cleanUsername}`, { 
            headers: { ...commonHeaders, 'Accept': 'application/json' },
            signal: controller.signal
          });
          if (response.ok) {
            const data = await response.json();
            if (data?.user?.profile_pic) return data;
          }
        } finally {
          clearTimeout(timeout);
        }
        throw new Error('API v1 failed');
      })(),
      // HTML Scraping
      (async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        try {
          const response = await fetch(`https://kick.com/${cleanUsername}`, { 
            headers: commonHeaders,
            signal: controller.signal
          });
          if (response.ok) {
            const html = await response.text();
            const match = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
            if (match?.[1]) return { user: { profile_pic: match[1] } };
          }
        } finally {
          clearTimeout(timeout);
        }
        throw new Error('HTML scraping failed');
      })()
    ];

    try {
      const result = await Promise.any(fetchTasks);
      console.log(`[KickProxy] Success for ${cleanUsername} via direct fetch`);
      avatarCache.set(cleanUsername, { data: result, timestamp: Date.now() });
      return res.json(result);
    } catch (e) {
      console.warn(`[KickProxy] Direct fetch failed for ${cleanUsername}, trying proxies...`);
    }

    // Last resort: Try public proxies
    const proxies = [
      { name: 'Codetabs', url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(`https://kick.com/api/v2/channels/${cleanUsername}`)}` },
      { name: 'AllOrigins', url: `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://kick.com/api/v2/channels/${cleanUsername}`)}` },
      { name: 'CorsProxyIO', url: `https://corsproxy.io/?${encodeURIComponent(`https://kick.com/api/v2/channels/${cleanUsername}`)}` }
    ];

    for (const proxy of proxies) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const response = await fetch(proxy.url, { 
          headers: { 'User-Agent': commonHeaders['User-Agent'] },
          signal: controller.signal 
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const text = await response.text();
          
          // Try to parse as JSON first
          try {
            const data = JSON.parse(text);
            if (data?.user?.profile_pic) {
              console.log(`[KickProxy] Success for ${cleanUsername} via ${proxy.name} (JSON)`);
              avatarCache.set(cleanUsername, { data, timestamp: Date.now() });
              return res.json(data);
            }
          } catch (e) {
            // Not JSON, continue to HTML scraping
          }

          // HTML Scraping from proxy response
          const ogImageMatch = text.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
          if (ogImageMatch?.[1]) {
            console.log(`[KickProxy] Success for ${cleanUsername} via ${proxy.name} (HTML Scraping)`);
            const result = { user: { profile_pic: ogImageMatch[1] } };
            avatarCache.set(cleanUsername, { data: result, timestamp: Date.now() });
            return res.json(result);
          }

          // Try finding profile_pic in a script tag (common in Next.js/React apps)
          const scriptMatch = text.match(/"profile_pic":"([^"]+)"/);
          if (scriptMatch?.[1]) {
            const pic = scriptMatch[1].replace(/\\u002F/g, '/');
            console.log(`[KickProxy] Success for ${cleanUsername} via ${proxy.name} (Script Match)`);
            const result = { user: { profile_pic: pic } };
            avatarCache.set(cleanUsername, { data: result, timestamp: Date.now() });
            return res.json(result);
          }
        }
      } catch (e) {
        console.error(`[KickProxy] Proxy ${proxy.name} failed for ${cleanUsername}`);
      }
    }

    res.status(404).json({ error: 'Channel not found' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
