/**
 * Dịch vụ Đa Ngôn Ngữ tích hợp Google Translate API
 * Hỗ trợ dịch tự động toàn bộ nội dung ứng dụng từ Tiếng Việt sang Tiếng Anh
 * Kết hợp bộ nhớ đệm (LocalStorage Cache) để phản hồi tức thì và không phụ thuộc mạng liên tục
 */

import { STATIC_DICTIONARY } from '../constants/dictionary';

// Re-export từ điển tĩnh và các hàm dịch bộ dữ liệu
export { STATIC_DICTIONARY } from '../constants/dictionary';
export {
  translateDatasetPosts,
  translateDatasetTravelLocations,
  translateDatasetDestinations,
  translateDatasetSpecialties,
  translateDatasetStays
} from './datasetTranslate.service';

const STORAGE_CACHE_KEY = 'daksong_translate_cache';
const STORAGE_LANG_KEY = 'daksong_app_language';

// Bộ nhớ đệm trong RAM và LocalStorage
let memoryCache: Record<string, string> = {};

try {
  const cachedRaw = localStorage.getItem(STORAGE_CACHE_KEY);
  if (cachedRaw) {
    memoryCache = JSON.parse(cachedRaw);
  }
} catch (e) {
  memoryCache = {};
}

const saveCache = () => {
  try {
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(memoryCache));
  } catch (e) {
    // LocalStorage có thể đầy nếu lưu quá nhiều
  }
};

/**
 * Gọi Google Translate API miễn phí trực tiếp
 */
export const translateWithGoogle = async (
  text: string,
  targetLang: 'en' | 'vi' = 'en'
): Promise<string> => {
  if (!text || text.trim() === '') return text;
  if (targetLang === 'vi') return text; // Văn bản gốc đã là tiếng Việt

  const trimmed = text.trim();
  const cacheKey = `${targetLang}_${trimmed}`;

  // 1. Kiểm tra Cache
  if (memoryCache[cacheKey]) {
    return memoryCache[cacheKey];
  }

  // 2. Kiểm tra bộ từ điển tĩnh nhanh
  if (STATIC_DICTIONARY[trimmed]) {
    const translated = STATIC_DICTIONARY[trimmed];
    memoryCache[cacheKey] = translated;
    saveCache();
    return translated;
  }

  // 3. Nếu đoạn văn bản quá dài (> 1200 ký tự), chia nhỏ theo đoạn văn \n\n hoặc dấu chấm để không quá giới hạn URL
  if (trimmed.length > 1200) {
    const paragraphs = trimmed.split('\n');
    const translatedParagraphs = await Promise.all(
      paragraphs.map((p) => (p.trim() ? translateWithGoogle(p.trim(), targetLang) : Promise.resolve('')))
    );
    const fullResult = translatedParagraphs.join('\n');
    memoryCache[cacheKey] = fullResult;
    saveCache();
    return fullResult;
  }

  // 4. Gọi Google Translate API (Google Translate Single Endpoint)
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=vi&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      trimmed
    )}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Google Translate error: ${res.status}`);

    const data = await res.json();
    // Cấu trúc trả về: [[["Translated text 1","Original text 1"], ["Translated text 2", ...]]]
    if (Array.isArray(data) && Array.isArray(data[0])) {
      const translatedText = data[0]
        .map((item: any) => (item && item[0] ? item[0] : ''))
        .join('');
      if (translatedText) {
        memoryCache[cacheKey] = translatedText;
        saveCache();
        return translatedText;
      }
    }
  } catch (error) {
    console.warn('Google Translate API fallback for text:', text, error);
  }

  return text; // Giữ nguyên nếu mạng lỗi
};

/**
 * Dịch toàn bộ nội dung HTML phong phú của bài viết bằng Google Translate
 * Giữ nguyên thẻ <img>, <a>, layout mà chỉ dịch các đoạn văn bản
 */
export const translateHtmlContentWithGoogle = async (
  html: string,
  targetLang: 'en' | 'vi' = 'en'
): Promise<string> => {
  if (!html || html.trim() === '') return html;
  if (targetLang === 'vi') return html;

  const cacheKey = `html_${targetLang}_${html.length}_${html.slice(0, 40)}`;
  if (memoryCache[cacheKey]) {
    return memoryCache[cacheKey];
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Thu thập tất cả các text node có nội dung
    const textNodes: Node[] = [];
    const walk = (node: Node) => {
      if (node.nodeName === 'SCRIPT' || node.nodeName === 'STYLE') return;

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text && text.length > 1 && !/^\d+$/.test(text)) {
          textNodes.push(node);
        }
      } else {
        node.childNodes.forEach(walk);
      }
    };
    walk(doc.body);

    // Dịch các đoạn text theo lô
    for (let i = 0; i < textNodes.length; i += 6) {
      const chunk = textNodes.slice(i, i + 6);
      await Promise.all(
        chunk.map(async (n) => {
          const original = n.textContent || '';
          if (original.trim()) {
            const translated = await translateWithGoogle(original.trim(), targetLang);
            n.textContent = n.textContent ? n.textContent.replace(original.trim(), translated) : translated;
          }
        })
      );
    }

    const translatedHtml = doc.body.innerHTML;
    memoryCache[cacheKey] = translatedHtml;
    saveCache();
    return translatedHtml;
  } catch (err) {
    console.warn('HTML translation error:', err);
    return html;
  }
};

/**
 * Dịch đồng thời nhiều đoạn văn bản (batch)
 */
export const translateBatchWithGoogle = async (
  texts: string[],
  targetLang: 'en' | 'vi' = 'en'
): Promise<string[]> => {
  if (targetLang === 'vi') return texts;
  return Promise.all(texts.map((t) => translateWithGoogle(t, targetLang)));
};

/**
 * Lấy ngôn ngữ hiện tại đã lưu
 */
export const getStoredLanguage = (): 'vi' | 'en' => {
  try {
    const lang = localStorage.getItem(STORAGE_LANG_KEY);
    return lang === 'en' ? 'en' : 'vi';
  } catch {
    return 'vi';
  }
};

/**
 * Lưu ngôn ngữ lựa chọn
 */
export const setStoredLanguage = (lang: 'vi' | 'en') => {
  try {
    localStorage.setItem(STORAGE_LANG_KEY, lang);
  } catch {}
};

/**
 * Hàm dịch nhanh 1 từ/câu theo ngôn ngữ hiện tại
 */
export const t = (text?: string | null, currentLang: 'vi' | 'en' = 'vi'): string => {
  if (!text || currentLang === 'vi') return text || '';
  const trimmed = text.trim();
  if (STATIC_DICTIONARY[trimmed]) return STATIC_DICTIONARY[trimmed];
  if (memoryCache[`en_${trimmed}`]) return memoryCache[`en_${trimmed}`];
  return text;
};
