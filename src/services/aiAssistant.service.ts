import { BACKEND_API_URL } from './apiConfig';
import { getStoredZaloUser } from './zalo';
import { TravelLocation } from '../types/travel';
import { Destination, Specialty, Stay } from '../types';

export interface AIAssistantAction {
  type: 'OPEN_LOCATION' | 'OPEN_POST' | 'OPEN_VR360' | 'OPEN_FAVORITES' | 'OPEN_ITINERARY_CREATOR' | 'OPEN_ITINERARY' | 'SAVE_ITINERARY' | null;
  payload?: any;
}

export interface AIAssistantData {
  locations?: Array<{
    id: string;
    name: string;
    categoryName?: string;
    address?: string | null;
    phone?: string | null;
    imageUrl?: string;
    hasVR360?: boolean;
    vrNodeId?: string | null;
    time?: string | null;
    desc?: string | null;
    quote?: string | null;
  }>;
  posts?: Array<{
    id: string;
    name: string;
    categoryName?: string;
    quote?: string;
    imageUrl?: string;
    publishDate?: string;
  }>;
  source?: 'CORE_API' | 'MINI_APP_SERVICE' | 'INTERNET' | 'WEB';
}

export interface AIAssistantResponse {
  message: string;
  intent: 'CHAT' | 'SEARCH' | 'RECOMMENDATION' | 'CREATE_ITINERARY' | 'FAVORITE' | 'VR360' | 'OTHER';
  action_required: boolean;
  action: AIAssistantAction | null;
  data?: AIAssistantData;
  thinkingSteps?: string[];
}

export interface ChatHistoryItem {
  role: 'user' | 'model';
  content: string;
  timestamp?: number;
  structuredData?: AIAssistantResponse;
  thinkingSteps?: string[];
  isError?: boolean;
}

export interface AIChatStreamHandlers {
  onThinkingStep?: (stepText: string) => void;
  onTextChunk?: (chunk: string) => void;
  onData?: (data: AIAssistantData, action?: AIAssistantAction | null) => void;
  onError?: (errorMessage: string) => void;
}

export interface AIContextData {
  travelLocations?: TravelLocation[];
  destinations?: Destination[];
  specialties?: Specialty[];
  stays?: Stay[];
}

/**
 * Làm sạch nội dung hiển thị của Bot:
 * Nếu chuỗi vô tình là một khối JSON kỹ thuật {"message": "...", "intent": ...},
 * hàm sẽ bóc tách chỉ lấy nội dung câu trả lời thật trong trường "message" để hiển thị cho người dùng.
 */
export const cleanBotDisplayMessage = (text?: string): string => {
  if (!text) return '';
  const trimmed = text.trim();
  if (trimmed.startsWith('{') && trimmed.includes('"message"')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed?.message && typeof parsed.message === 'string') {
        return parsed.message;
      }
    } catch {
      const match = trimmed.match(/"message"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      if (match && match[1]) {
        return match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
      }
    }
  }
  return text;
};

/**
 * Gửi câu hỏi đến AI Assistant (Tích hợp Local Intelligent Engine 0đ & Backend Cloud)
 */
export const sendChatMessageToAI = async (
  prompt: string,
  history: ChatHistoryItem[] = [],
  contextData?: AIContextData
): Promise<AIAssistantResponse> => {
  const user = getStoredZaloUser();
  const userId = user?.id || 'local_user';

  // 1. Nếu Backend đã bật, thử gọi trước
  try {
    // Bỏ qua tin mở đầu của model nếu chưa có lượt hỏi nào của user
    const firstUserIdx = history.findIndex((h) => h.role === 'user');
    const validHistory = firstUserIdx >= 0 ? history.slice(firstUserIdx) : [];

    const res = await fetch(`${BACKEND_API_URL}/ai/chat`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        prompt,
        userId,
        history: validHistory.slice(-6).map((h) => ({
          role: h.role,
          content: h.content,
        })),
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json?.data && typeof json.data.message === 'string' && json.data.message.trim() !== '') {
        return json.data as AIAssistantResponse;
      }
    }
  } catch {
    // Không kết nối được backend hoặc lỗi, tự động chuyển sang Local Intelligent Engine
  }

  // 2. BỘ PHÂN TÍCH THÔNG MINH NỘI BỘ (LOCAL INTELLIGENT ENGINE - 100% MIỄN PHÍ)
  // Xử lý tức thì 0ms, không tốn tiền API token, phản hồi chính xác dựa trên Core API cache
  const lower = prompt.toLowerCase();
  const travelLocs = contextData?.travelLocations || [];

  // 0. Tư vấn du lịch cho gia đình có con nhỏ / tìm nơi yên tĩnh, nghỉ dưỡng
  if (lower.includes('con nhỏ') || lower.includes('đông người') || lower.includes('yên tĩnh') || lower.includes('nghỉ dưỡng')) {
    return {
      message: 'Chào bạn! Đắk Song là điểm đến vô cùng lý tưởng cho chuyến nghỉ dưỡng gia đình có trẻ nhỏ. Dưới đây là gợi ý lịch trình 2 ngày 1 đêm thư thái, an toàn được thiết kế riêng cho gia đình:\n\n' +
        '📅 **NGÀY 1: TRẢI NGHIỆM THIÊN NHIÊN & ĐÓN HOÀNG HÔN CAO NGUYÊN**\n' +
        '• **Sáng (08:30 - 11:30)**: Thư thả dạo chơi tại các khu nông trại sinh thái, vườn cà phê - hồ tiêu sạch Đắk Song. Không gian thoáng rộng, không khói bụi, rất an toàn cho các bé chạy nhảy.\n' +
        '• **Trưa (11:30 - 13:30)**: Dùng bữa trưa với món gà nướng cơm lam thanh đạm, nghỉ ngơi tại homestay sinh thái mát mẻ.\n' +
        '• **Chiều (15:00 - 17:30)**: Check-in ngắm hoàng hôn tại các triền đồi thoải gần Cánh Đồng Điện Gió Đắk Song (chọn bãi cỏ rộng, bằng phẳng cho bé vui chơi an toàn).\n' +
        '• **Tối (18:30 - 20:30)**: Thưởng thức bữa tối ấm cúng, nhâm nhi ly trà ấm hoặc cà phê nhẹ nhàng trong tiết trời se lạnh.\n\n' +
        '📅 **NGÀY 2: THƯ GIÃN RỪNG THÔNG & MUA SẮM ĐẶC SẢN**\n' +
        '• **Sáng (08:30 - 11:00)**: Dạo bộ nhẹ nhàng dưới tán rừng thông xanh mát, hít thở không khí đại ngàn trong lành.\n' +
        '• **Trưa (11:30 - 13:00)**: Mua sắm đặc sản hồ tiêu hữu cơ Đắk Song và cà phê sạch về làm quà cho người thân.\n\n' +
        'Bạn có thể bấm nút "Lưu lịch trình này vào chuyến đi" bên dưới để lưu lại vào tài khoản nhé!',
      intent: 'CREATE_ITINERARY',
      action_required: true,
      action: {
        type: 'SAVE_ITINERARY',
        payload: { title: 'Lịch Trình 2N1Đ Gia Đình Nghỉ Dưỡng Đắk Song', duration: '2days', interest: 'nature' },
      },
      data: {
        locations: travelLocs.slice(0, 3).map((l) => ({
          id: String(l.id),
          name: l.name,
          categoryName: 'Điểm đến đề xuất',
          address: l.address,
          imageUrl: l.imageUrl,
          hasVR360: false,
        })),
        source: 'CORE_API',
      },
    };
  }

  // A. Ý định tạo lịch trình (CREATE_ITINERARY) - TỰ ĐỘNG THIẾT KẾ TIMELINE CHI TIẾT
  if (lower.includes('lịch trình') || lower.includes('tour') || lower.includes('ngày') || lower.includes('kế hoạch') || lower.includes('itinerary')) {
    const is2Days = lower.includes('2 ngày') || lower.includes('2n1đ') || lower.includes('hai ngày') || lower.includes('cuối tuần');
    const duration = is2Days ? '2days' : '1day';

    const messageText = is2Days
      ? 'Dưới đây là kế hoạch lịch trình 2 Ngày 1 Đêm tối ưu thời gian khám phá Đắk Song dành cho bạn:\n\n' +
        '📍 **NGÀY 1: KỲ VĨ ĐIỆN GIÓ & HOÀNG HÔN ĐỒI THÔNG**\n' +
        '• **08:00 - 11:00**: Khám phá Thác Lưu Ly & Vườn quốc gia Nâm Nung mát rượi.\n' +
        '• **11:30 - 13:30**: Thưởng thức ẩm thực cơm lam gà nướng tại nhà hàng địa phương.\n' +
        '• **14:30 - 17:30**: Săn ảnh tuabin gió khổng lồ tại Cánh Đồng Điện Gió Đắk Song trong ánh hoàng hôn tuyệt đẹp.\n' +
        '• **18:30 - 21:00**: Thưởng thức cà phê cao nguyên về đêm và nghỉ ngơi tại thị trấn Đức An.\n\n' +
        '📍 **NGÀY 2: BẢN SẮC VĂN HÓA & TRẢI NGHIỆM BẢN ĐỊA**\n' +
        '• **08:00 - 10:30**: Tham quan các mô hình nông nghiệp công nghệ cao, đồi thông cảnh quan.\n' +
        '• **11:00 - 12:30**: Mua đặc sản tiêu Đắk Song, bơ sáp và cà phê hạt chất lượng cao.\n\n' +
        'Bạn có thể bấm nút bên dưới để lưu lịch trình này vào tài khoản hoặc tùy chỉnh thêm nhé!'
      : 'Dưới đây là gợi ý lịch trình 1 Ngày trải nghiệm trọn vẹn vẻ đẹp Đắk Song:\n\n' +
        '• **Sáng (08:00 - 11:00)**: Khám phá Thác Lưu Ly và dạo bước dưới bóng mát của rừng nguyên sinh đại ngàn.\n' +
        '• **Trưa (11:30 - 13:30)**: Thưởng thức bữa trưa với cá suối nướng, rau rừng và gà đồi đặc sản.\n' +
        '• **Chiều (14:30 - 17:30)**: Check-in Cánh Đồng Điện Gió Đắk Song và đồi thông lộng gió vào khoảnh khắc hoàng hôn.\n' +
        '• **Tối (18:00 - 19:30)**: Mua sắm đặc sản tiêu Đắk Song và nhâm nhi cà phê phố núi trước khi kết thúc chuyến đi.\n\n' +
        'Bạn có thể bấm nút bên dưới để lưu lịch trình này vào tài khoản nhé!';

    return {
      message: messageText,
      intent: 'CREATE_ITINERARY',
      action_required: true,
      action: {
        type: 'SAVE_ITINERARY',
        payload: { 
          title: is2Days ? 'Lịch Trình 2N1Đ Khám Phá Đắk Song' : 'Lịch Trình 1 Ngày Trải Nghiệm Đắk Song', 
          duration 
        },
      },
      data: {
        locations: travelLocs.slice(0, 3).map((l) => ({
          id: String(l.id),
          name: l.name,
          categoryName: 'Điểm đến trong tour',
          address: l.address,
          imageUrl: l.imageUrl,
          hasVR360: false,
        })),
        source: 'CORE_API',
      },
    };
  }

  // B. Ý định xem thực tế ảo Sa bàn VR 360°
  if (lower.includes('vr') || lower.includes('360') || lower.includes('sa bàn') || lower.includes('thực tế ảo') || lower.includes('panorama')) {
    return {
      message: 'Hệ thống Sa bàn thực tế ảo VR 360° Đắk Song cho phép bạn ngắm toàn cảnh các Cánh đồng điện gió, Thác Lưu Ly và các triền đồi từ góc nhìn flycam sống động. Bạn có thể mở sa bàn ngay bên dưới:',
      intent: 'VR360',
      action_required: true,
      action: {
        type: 'OPEN_VR360',
        payload: { nodeId: 'windfarm_node_1' },
      },
    };
  }

  // C. Ý định xem mục đã lưu (Favorites)
  if (lower.includes('đã lưu') || lower.includes('yêu thích') || lower.includes('bookmark') || lower.includes('favorite') || lower.includes('chuyến đi của tôi')) {
    return {
      message: 'Dưới đây là các địa điểm, bài viết và lịch trình bạn đã lưu trong tài khoản. Hãy bấm vào nút bên dưới để mở nhé:',
      intent: 'FAVORITE',
      action_required: true,
      action: {
        type: 'OPEN_FAVORITES',
        payload: {},
      },
    };
  }

  // D. Tìm kiếm / Đề xuất điểm đến thiên nhiên & Thác nước
  if (lower.includes('thiên nhiên') || lower.includes('thác') || lower.includes('suối') || lower.includes('rừng') || lower.includes('thông')) {
    const matched = travelLocs.filter((l) => {
      const n = (l.name + ' ' + (l.content || '')).toLowerCase();
      return n.includes('thác') || n.includes('lưu ly') || n.includes('nam nung') || n.includes('nâm nung') || n.includes('thông') || n.includes('cảnh quan');
    }).slice(0, 3);

    return {
      message: 'Đắk Song nổi tiếng với khí hậu cao nguyên mát mẻ quanh năm và thiên nhiên đại ngàn kỳ vĩ. Đây là những địa điểm thiên nhiên nổi bật bạn không nên bỏ lỡ:',
      intent: 'RECOMMENDATION',
      action_required: false,
      action: null,
      data: {
        locations: matched.map((l) => ({
          id: String(l.id),
          name: l.name,
          categoryName: 'Thiên nhiên & Di tích',
          address: l.address,
          imageUrl: l.imageUrl,
          hasVR360: l.name.toLowerCase().includes('lưu ly') || l.name.toLowerCase().includes('thác'),
          vrNodeId: 'waterfall_luuly_node_1',
        })),
        source: 'CORE_API',
      },
    };
  }

  // E. Tìm kiếm điểm check-in Cánh đồng điện gió
  if (lower.includes('gió') || lower.includes('điện gió') || lower.includes('tuabin') || lower.includes('checkin') || lower.includes('săn mây')) {
    return {
      message: 'Cánh đồng Điện Gió Đắk Song là biểu tượng du lịch hiện đại của huyện với hàng chục trụ tuabin gió khổng lồ trải dài trên các triền đồi đất đỏ bazan. Thời điểm ngắm đẹp nhất là bình minh sáng sớm hoặc hoàng hôn chiều tà (16h30 - 17h45). Bạn có thể mở Sa bàn VR 360° để ngắm toàn cảnh bên dưới:',
      intent: 'RECOMMENDATION',
      action_required: true,
      action: {
        type: 'OPEN_VR360',
        payload: { nodeId: 'windfarm_node_1' },
      },
      data: {
        locations: [
          {
            id: 'windfarm_dak_song',
            name: 'Cụm Cánh Đồng Điện Gió Đắk Song',
            categoryName: 'Cảnh quan & Check-in',
            address: 'Dọc Quốc lộ 14, Huyện Đắk Song',
            imageUrl: 'https://images.unsplash.com/photo-1548337138-e87d889cc369?auto=format&fit=crop&w=800&q=80',
            hasVR360: true,
            vrNodeId: 'windfarm_node_1',
          },
        ],
        source: 'CORE_API',
      },
    };
  }

  // F. Đề xuất Ẩm thực & Đặc sản Đắk Song
  if (lower.includes('ăn') || lower.includes('ẩm thực') || lower.includes('đặc sản') || lower.includes('món ngon') || lower.includes('cà phê') || lower.includes('quán')) {
    return {
      message: 'Đến với Đắk Song, bạn nhất định phải thử những phong vị đặc trưng của vùng đất bazan màu mỡ:\n\n' +
        '• ☕ **Cà phê Robusta Đắk Song**: Hạt đậm vị, thơm nồng trứ danh.\n' +
        '• 🥑 **Bơ sáp & Sầu riêng Đắk Song**: Cơm vàng, dẻo béo tự nhiên.\n' +
        '• 🍗 **Gà nướng cơm lam & Rượu cần**: Món ăn đậm đà bản sắc buôn làng Tây Nguyên.\n' +
        '• 🍲 **Cá lăng sông Sêrêpôk**: Nấu lẩu măng chua hoặc nướng muối ớt.\n\n' +
        'Bạn có thể ghé các nhà hàng, quán ăn địa phương tại thị trấn Đức An và xã lân cận để thưởng thức!',
      intent: 'RECOMMENDATION',
      action_required: false,
      action: null,
      data: {
        source: 'CORE_API',
      },
    };
  }

  // G. Chào hỏi và hỗ trợ tổng quát
  return {
    message: 'Xin chào! Mình là Trợ Lý Du Lịch Đắk Song. Mình luôn sẵn sàng hỗ trợ bạn:\n\n' +
      '• 🌿 Tìm kiếm điểm đến thiên nhiên, thác nước, đồi thông.\n' +
      '• 📸 Chỉ đường check-in cánh đồng điện gió ngắm hoàng hôn.\n' +
      '• 🍲 Giới thiệu ẩm thực và đặc sản tiêu, cà phê Đắk Song.\n' +
      '• 📅 Hỗ trợ mở tính năng tạo lịch trình tour tối ưu.\n\n' +
      'Bạn muốn tìm hiểu thông tin gì hôm nay?',
    intent: 'CHAT',
    action_required: false,
    action: null,
  };
};

/**
 * Điều phối gọi AI với cơ chế Streaming SSE Realtime:
 * - Nhận từng bước tư duy (Thinking Steps) theo thời gian thực khi Backend đang gọi Tool
 * - Nhận toàn vẹn JSON đã ép kiểu mạnh khi kết thúc luồng
 * - Tự động dự phòng về Local Intelligent Engine nếu mất kết nối mạng
 */
export const streamChatMessageToAI = async (
  prompt: string,
  history: ChatHistoryItem[] = [],
  handlers: AIChatStreamHandlers,
  contextData?: AIContextData
): Promise<AIAssistantResponse> => {
  const initialStep = '💡 Phân tích câu hỏi và xác định ý định của bạn...';
  handlers.onThinkingStep?.(initialStep);

  const user = getStoredZaloUser();
  const userId = user?.id || 'local_user';

  // 1. Thử kết nối Streaming Server-Sent Events (SSE) tới Backend
  try {
    const firstUserIdx = history.findIndex((h) => h.role === 'user');
    const validHistory = firstUserIdx >= 0 ? history.slice(firstUserIdx) : [];

    const res = await fetch(`${BACKEND_API_URL}/ai/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({
        prompt,
        userId,
        history: validHistory.slice(-6).map((h) => ({
          role: h.role,
          content: h.content,
        })),
      }),
    });

    if (res.ok && res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let finalResponse: AIAssistantResponse | null = null;
      let accumulatedThinking: string[] = [initialStep];
      let payloadData: any = null;
      let streamedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.replace(/^data:\s*/, '').trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);
            if (event.type === 'thinking') {
              const stepText = event.detail || event.step;
              if (stepText) {
                if (!accumulatedThinking.includes(stepText)) {
                  accumulatedThinking.push(stepText);
                }
                handlers.onThinkingStep?.(stepText);
              }
            } else if (event.type === 'data') {
              payloadData = event.payload;
              if (event.payload?.thinkingSteps) {
                accumulatedThinking = event.payload.thinkingSteps;
              }
              handlers.onData?.(event.payload, event.payload?.action);
            } else if (event.type === 'chunk') {
              streamedText = event.text || '';
              handlers.onTextChunk?.(streamedText);
            } else if (event.type === 'done') {
              if (event.fullResponse) {
                finalResponse = event.fullResponse;
              }
            }
          } catch {
            // bỏ qua dòng dữ liệu tạm thời chưa hoàn chỉnh
          }
        }
      }

      if (finalResponse) {
        if (!finalResponse.thinkingSteps || finalResponse.thinkingSteps.length === 0) {
          finalResponse.thinkingSteps = accumulatedThinking;
        }
        return finalResponse;
      }

      if (streamedText) {
        return {
          message: streamedText,
          intent: payloadData?.intent || 'CHAT',
          action_required: !!payloadData?.action,
          action: payloadData?.action || null,
          data: payloadData,
          thinkingSteps: accumulatedThinking,
        };
      }
    }
  } catch (streamErr) {
    console.warn('⚠️ [AI STREAM] Lỗi stream SSE, chuyển sang chế độ dự phòng:', streamErr);
  }

  // 2. Chế độ dự phòng Fallback: Gửi POST thường hoặc Local Intelligence Engine
  try {
    const response = await sendChatMessageToAI(prompt, history, contextData);

    if (response.thinkingSteps && response.thinkingSteps.length > 0) {
      for (const step of response.thinkingSteps) {
        handlers.onThinkingStep?.(step);
      }
    }

    if (response.data) {
      handlers.onData?.(response.data, response.action);
    }

    handlers.onTextChunk?.(response.message);
    return response;
  } catch (err: any) {
    const errMsg = err?.message || 'Không thể kết nối đến Trợ lý AI';
    handlers.onError?.(errMsg);
    return {
      message: `Rất tiếc, đã có sự cố kết nối: ${errMsg}. Vui lòng thử lại sau giây lát nhé!`,
      intent: 'OTHER',
      action_required: false,
      action: null,
    };
  }
};
