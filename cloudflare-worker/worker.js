/**
 * Cloudflare Worker Proxy Trong Suốt cho Sa bàn VR 360° Đắk Song
 * - Nhiệm vụ duy nhất: Cứu file Leaflet và tài nguyên bị 404 từ máy chủ gốc
 * - Mở quyền CORS và cho phép nhúng iframe
 * - NGUYÊN BẢN 100%: Tuyệt đối không can thiệp, không chèn bất kỳ đoạn script nào vào giao diện VR
 */

const TARGET_HOST = 'daksong-daknong.vnasw.vn';
const LEAFLET_JS_CDN = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_CSS_CDN = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const FALLBACK_IMAGE_CDN = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // 2. Vá Leaflet JS khi máy chủ gốc bị thiếu (404)
    if (url.pathname.includes('3rdparty/leaflet/leaflet.js') || url.pathname.endsWith('/leaflet.js')) {
      const response = await fetch(LEAFLET_JS_CDN);
      const headers = new Headers(response.headers);
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Content-Type', 'application/javascript; charset=utf-8');
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      return new Response(response.body, {
        status: 200,
        headers,
      });
    }

    // 3. Vá Leaflet CSS khi máy chủ gốc bị thiếu (404)
    if (url.pathname.includes('3rdparty/leaflet/leaflet.css') || url.pathname.endsWith('/leaflet.css')) {
      const response = await fetch(LEAFLET_CSS_CDN);
      const headers = new Headers(response.headers);
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Content-Type', 'text/css; charset=utf-8');
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      return new Response(response.body, {
        status: 200,
        headers,
      });
    }

    // 4. Vá ảnh gallery nếu máy chủ gốc bị 404
    if (url.pathname.includes('assets/gallery/images/')) {
      const response = await fetch(FALLBACK_IMAGE_CDN);
      const headers = new Headers(response.headers);
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Content-Type', 'image/jpeg');
      return new Response(response.body, {
        status: 200,
        headers,
      });
    }

    // 5. Chuyển tiếp toàn bộ yêu cầu sang máy chủ gốc Đắk Song
    url.hostname = TARGET_HOST;
    url.protocol = 'https:';
    url.port = '';

    const modifiedRequest = new Request(url.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'follow',
    });

    modifiedRequest.headers.set('Host', TARGET_HOST);
    modifiedRequest.headers.delete('Origin');
    modifiedRequest.headers.delete('Referer');

    try {
      const originResponse = await fetch(modifiedRequest);

      // Thêm header cho phép nhúng vào Zalo Mini App
      const responseHeaders = new Headers(originResponse.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', '*');
      responseHeaders.delete('X-Frame-Options');
      responseHeaders.delete('Content-Security-Policy');

      // TRẢ VỀ NGUYÊN BẢN 100% TỪ MÁY CHỦ GỐC - KHÔNG CHÈN THÊM BẤT KỲ SCRIPT NÀO
      return new Response(originResponse.body, {
        status: originResponse.status,
        headers: responseHeaders,
      });
    } catch (error) {
      return new Response(`Lỗi kết nối máy chủ Đắk Song: ${error.message}`, {
        status: 502,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  },
};
