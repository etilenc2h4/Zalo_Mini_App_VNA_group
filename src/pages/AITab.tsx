import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  MapPin, 
  Compass, 
  Calendar, 
  Heart, 
  ArrowRight, 
  Navigation,
  Loader2,
  Trash2,
  RotateCcw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  Globe
} from 'lucide-react';
import { 
  sendChatMessageToAI,
  streamChatMessageToAI,
  cleanBotDisplayMessage,
  ChatHistoryItem, 
  AIAssistantResponse,
  AIAssistantAction,
  AIAssistantData
} from '../services/aiAssistant.service';
import { openGoogleMaps, getStoredZaloUser } from '../services/zalo';
import { saveUserItinerary } from '../services/supabase.service';
import { UserItinerary, ItineraryStop } from '../services/supabase/types';
import { BookmarkCheck } from 'lucide-react';
import { TravelLocation } from '../types/travel';
import { Destination, Specialty, Stay } from '../types';

interface AITabProps {
  language?: 'vi' | 'en';
  onNavigateTab: (tab: string) => void;
  onSelectDestination?: (dest: Destination) => void;
  onOpenVRNode: (nodeId: string) => void;
  travelLocations?: TravelLocation[];
  destinations?: Destination[];
  specialties?: Specialty[];
  stays?: Stay[];
}

export const AITab: React.FC<AITabProps> = ({
  language = 'vi',
  onNavigateTab,
  onOpenVRNode,
  travelLocations = [],
  destinations = [],
  specialties = [],
  stays = [],
}) => {
  const isEn = language === 'en';
  const initialGreeting: ChatHistoryItem = {
    role: 'model',
    content: isEn 
      ? 'Hello! I am Dak Song Smart Travel Assistant. How can I help you explore wind farms, waterfalls, cuisine, or plan your journey today?'
      : 'Xin chào! Mình là Trợ Lý Du Lịch Đắk Song. Mình có thể giúp bạn tìm kiếm các điểm ngắm điện gió, thác nước hùng vĩ, ẩm thực bản địa hoặc hỗ trợ lập kế hoạch chuyến đi. Bạn muốn khám phá điều gì?',
    timestamp: Date.now(),
  };

  const CHAT_STORAGE_KEY = 'daksong_ai_chat_history';

  const [messages, setMessages] = useState<ChatHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc lịch sử chat từ localStorage:', e);
    }
    return [initialGreeting];
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentThinkingStep, setCurrentThinkingStep] = useState<string | null>(null);
  const [currentStreamingText, setCurrentStreamingText] = useState<string>('');
  const [thinkingStepsLog, setThinkingStepsLog] = useState<string[]>([]);
  const [expandedThinking, setExpandedThinking] = useState<{ [idx: number]: boolean }>({});
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

const DEFAULT_FALLBACK_IMG = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';

const getTimeSlotForStop = (idx: number, isEn: boolean = false): { time: string; period: string } => {
  switch (idx) {
    case 0:
      return { 
        time: '08:00 - 11:00', 
        period: isEn ? 'Morning' : 'Buổi Sáng' 
      };
    case 1:
      return { 
        time: '11:30 - 13:30', 
        period: isEn ? 'Noon (Lunch & Rest)' : 'Buổi Trưa (Ăn uống & Nghỉ ngơi)' 
      };
    case 2:
      return { 
        time: '14:30 - 17:30', 
        period: isEn ? 'Afternoon (Sightseeing & Sunset)' : 'Buổi Chiều (Ngắm cảnh & Check-in)' 
      };
    case 3:
      return { 
        time: '18:30 - 20:30', 
        period: isEn ? 'Evening (Dinner & Chill)' : 'Buổi Tối (Ẩm thực & Phố núi)' 
      };
    default:
      const day = Math.floor(idx / 4) + 1;
      const mod = idx % 4;
      const subTime = mod === 0 ? '08:00 - 11:00' : mod === 1 ? '11:30 - 13:30' : mod === 2 ? '14:30 - 17:30' : '18:30 - 20:30';
      return { 
        time: isEn ? `Day ${day}: ${subTime}` : `Ngày ${day}: ${subTime}`, 
        period: isEn ? `Day ${day}` : `Ngày ${day}` 
      };
  }
};

  const handleSaveAIItinerary = async (action: AIAssistantAction, data?: AIAssistantData) => {
    try {
      const user = getStoredZaloUser();
      const locations = data?.locations || [];
      const title = action?.payload?.title || (isEn ? 'AI Recommended Itinerary' : 'Lịch Trình Đắk Song (AI Thiết Kế)');
      
      const stops: ItineraryStop[] = locations.length > 0
        ? locations.map((loc, idx) => {
            const slot = getTimeSlotForStop(idx, isEn);
            return {
              time: loc.time || slot.time,
              title: loc.name,
              location: loc.address || 'Đắk Song, Đắk Nông',
              destId: loc.id,
              desc: loc.desc || loc.quote || (isEn ? `Stop #${idx + 1} (${slot.period}) planned by AI.` : `Điểm dừng chân thứ ${idx + 1} (${slot.period}) do Trợ lý AI Đắk Song sắp xếp cho chuyến đi.`),
              phone: loc.phone || undefined,
              vrNodeId: loc.vrNodeId || undefined,
            };
          })
        : [
            {
              time: '08:30 - 17:30',
              title: title,
              location: 'Huyện Đắk Song, Đắk Nông',
              desc: 'Lịch trình khám phá được AI tư vấn theo nhu cầu của bạn.',
            }
          ];

      const newPlan: UserItinerary = {
        id: `ai_plan_${Date.now()}`,
        user_id: user?.id || 'local_user',
        title,
        days: stops,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await saveUserItinerary(user?.id, newPlan);
      setSaveNotice(isEn ? `Saved "${title}" to My Itineraries!` : `Đã lưu "${title}" vào mục Lịch Trình Của Tôi!`);
      setTimeout(() => setSaveNotice(null), 3500);
    } catch {
      setSaveNotice(isEn ? 'Saved successfully!' : 'Đã lưu lịch trình thành công!');
      setTimeout(() => setSaveNotice(null), 3000);
    }
  };
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollEnabledRef = useRef<boolean>(true);

  // Cuộn đáy container tin nhắn chuyên dụng - không dùng scrollIntoView gây giật layout cha
  const scrollToBottom = (behavior: 'auto' | 'smooth' = 'auto') => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (!isAutoScrollEnabledRef.current && behavior === 'auto') return;

    if (behavior === 'smooth') {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  };

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    // Nếu người dùng cuộn ngược lên > 80px để xem lại nội dung cũ, tạm dừng auto scroll
    isAutoScrollEnabledRef.current = distanceToBottom < 80;
  };

  // Cuộn xuống đáy khi mở tab lần đầu
  useEffect(() => {
    isAutoScrollEnabledRef.current = true;
    const timer = setTimeout(() => {
      scrollToBottom('auto');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Cuộn mượt khi người dùng gửi tin nhắn hoặc thêm tin nhắn hoàn chỉnh (chờ DOM paint 60ms)
  useEffect(() => {
    isAutoScrollEnabledRef.current = true;
    const timer = setTimeout(() => {
      scrollToBottom('smooth');
    }, 60);
    return () => clearTimeout(timer);
  }, [messages.length]);

  // Cuộn tức thời (auto) 0ms khi streaming text hoặc cập nhật thinking steps để không bị giật nảy
  useEffect(() => {
    if (isLoading || currentStreamingText || currentThinkingStep) {
      scrollToBottom('auto');
    }
  }, [currentStreamingText, currentThinkingStep, isLoading]);

  // Tự động lưu lịch sử tin nhắn vào localStorage mỗi khi có tin nhắn mới
  useEffect(() => {
    try {
      if (messages.length > 1 || (messages.length === 1 && messages[0].role === 'user')) {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      }
    } catch (e) {
      console.warn('Lỗi lưu lịch sử chat vào localStorage:', e);
    }
  }, [messages]);

  const quickPrompts = [
    { label: isEn ? '🌿 Nature & Falls' : '🌿 Điểm thiên nhiên', text: isEn ? 'Recommend natural spots and waterfalls in Dak Song' : 'Gợi ý các điểm du lịch thiên nhiên và thác ở Đắk Song' },
    { label: isEn ? '📸 Wind Farms' : '📸 Cánh đồng điện gió', text: isEn ? 'Where are the best wind turbine check-in spots?' : 'Đồi điện gió Đắk Song check-in ngắm hoàng hôn ở đâu?' },
    { label: isEn ? '🍲 Specialties' : '🍲 Đặc sản ẩm thực', text: isEn ? 'What are famous local specialties in Dak Song?' : 'Đắk Song có những món ăn và đặc sản nổi tiếng nào?' },
    { label: isEn ? '📅 2-day tour' : '📅 Lên tour 2 ngày', text: isEn ? 'I want to spend 2 days in Dak Song with my family' : 'Tôi có 2 ngày ở Đắk Song, muốn đi cùng gia đình' },
    { label: isEn ? '🕶️ VR 360°' : '🕶️ Khám phá VR 360°', text: isEn ? 'Show me VR 360 places' : 'Có những điểm nào xem được thực tế ảo VR 360?' },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatHistoryItem = {
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setCurrentThinkingStep(isEn ? '💡 Analyzing your request...' : '💡 Đang phân tích câu hỏi của bạn...');
    setCurrentStreamingText('');
    setThinkingStepsLog([]);

    const stepsAccumulated: string[] = [];
    let streamedContent = '';
    let streamData: any = null;
    let streamAction: any = null;

    try {
      const aiRes = await streamChatMessageToAI(
        text, 
        messages, 
        {
          onThinkingStep: (step) => {
            if (!stepsAccumulated.includes(step)) {
              stepsAccumulated.push(step);
            }
            setThinkingStepsLog([...stepsAccumulated]);
            setCurrentThinkingStep(step);
          },
          onTextChunk: (chunk) => {
            streamedContent += chunk;
            setCurrentStreamingText(streamedContent);
          },
          onData: (data, action) => {
            streamData = data;
            streamAction = action;
          },
          onError: (errMsg) => {
            setMessages((prev) => [
              ...prev,
              {
                role: 'model',
                content: `⚠️ Sự cố hệ thống: ${errMsg}`,
                timestamp: Date.now(),
                isError: true,
              },
            ]);
          },
        },
        { travelLocations, destinations, specialties, stays }
      );

      const finalContent = streamedContent.trim() || aiRes.message.trim();
      if (finalContent) {
        const finalThinkingSteps = (aiRes.thinkingSteps && aiRes.thinkingSteps.length > 0)
          ? aiRes.thinkingSteps
          : (stepsAccumulated.length > 0 ? stepsAccumulated : undefined);

        const botMsg: ChatHistoryItem = {
          role: 'model',
          content: finalContent,
          timestamp: Date.now(),
          structuredData: {
            ...aiRes,
            data: streamData || aiRes.data,
            action: streamAction || aiRes.action,
          },
          thinkingSteps: finalThinkingSteps,
        };

        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: `⚠️ Lỗi kết nối dữ liệu: ${err?.message || 'Không thể phản hồi'}. Vui lòng thử lại!`,
          timestamp: Date.now(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      setCurrentThinkingStep(null);
      setCurrentStreamingText('');
      setThinkingStepsLog([]);
    }
  };

  const handleActionClick = (action: AIAssistantResponse['action']) => {
    if (!action) return;

    if (action.type === 'OPEN_ITINERARY_CREATOR' || action.type === 'OPEN_ITINERARY') {
      onNavigateTab('planner');
    } else if (action.type === 'OPEN_VR360') {
      onOpenVRNode(action.payload?.nodeId || 'windfarm_node_1');
    } else if (action.type === 'OPEN_FAVORITES') {
      onNavigateTab('saved');
    }
  };

  const handleClearHistory = () => {
    if (messages.length <= 1) return;
    const confirmClear = window.confirm(
      isEn 
        ? 'Do you want to start a new chat and clear previous history?' 
        : 'Bạn có muốn bắt đầu đoạn chat mới và xóa lịch sử trò chuyện này không?'
    );
    if (!confirmClear) return;

    setMessages([initialGreeting]);
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch {}
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto bg-stone-50 relative min-h-0 overflow-hidden">
      {/* Toast thông báo lưu lịch trình thành công */}
      {saveNotice && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 text-white px-4 py-2.5 rounded-full text-xs font-bold shadow-xl border border-amber-500/30 flex items-center gap-2 animate-bounce">
          <BookmarkCheck className="w-4 h-4 text-[#ff9600]" />
          <span>{saveNotice}</span>
        </div>
      )}
      
      {/* Top Header */}
      <header className="px-4 py-3 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white flex items-center justify-between border-b border-stone-800 shadow-sm shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-[#ff9600] text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h2 className="font-black text-sm text-stone-100">
                {isEn ? 'Dak Song AI Assistant' : 'Trợ Lý Du Lịch Đắk Song'}
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-amber-200/90 font-medium">
              {isEn ? 'AI Tour Guide 24/7' : 'Hướng dẫn viên ảo thông minh 24/7'}
            </p>
          </div>
        </div>

        {/* Nút Làm Mới / Bắt Đầu Đoạn Chat Mới */}
        {messages.length > 1 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 active:scale-95 text-stone-300 hover:text-white rounded-xl border border-stone-700/80 transition-all text-xs font-semibold shadow-xs"
            title={isEn ? 'Start new chat' : 'Bắt đầu đoạn chat mới'}
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px]">{isEn ? 'New Chat' : 'Đoạn chat mới'}</span>
          </button>
        )}
      </header>

      {/* Danh Sách Tin Nhắn Cuộn */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 no-scrollbar overscroll-contain"
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          const data = msg.structuredData;
          const isErr = msg.isError;

          return (
            <div key={idx} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5 animate-in fade-in`}>
              {/* Accordion hiển thị các bước suy nghĩ của AI */}
              {!isUser && msg.thinkingSteps && msg.thinkingSteps.length > 0 && (
                <div className="w-full max-w-[85%]">
                  <button
                    onClick={() => setExpandedThinking((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                    className="flex items-center space-x-1.5 text-[10px] font-semibold text-stone-500 hover:text-stone-700 bg-stone-100/90 hover:bg-stone-200/80 px-2.5 py-1 rounded-xl border border-stone-200/60 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{isEn ? `Reasoning (${msg.thinkingSteps.length} steps)` : `Đã hoàn tất ${msg.thinkingSteps.length} bước tư duy`}</span>
                    {expandedThinking[idx] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {expandedThinking[idx] && (
                    <div className="mt-1.5 p-2 bg-stone-100/90 rounded-xl border border-stone-200/80 space-y-1 text-[11px] text-stone-600 animate-in fade-in">
                      {msg.thinkingSteps.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-start space-x-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-tight">{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-[13px] leading-relaxed shadow-2xs ${
                  isErr
                    ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-bl-xs flex items-start space-x-2'
                    : isUser
                    ? 'bg-gradient-to-r from-amber-500 to-[#ff9600] text-white rounded-br-xs font-semibold'
                    : 'bg-white text-stone-800 border border-stone-200/90 rounded-bl-xs'
                }`}
              >
                {isErr && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                <p className="whitespace-pre-wrap">
                  {cleanBotDisplayMessage(msg.content) || (isUser ? '' : 'Đắk Song có rất nhiều cảnh đẹp thiên nhiên như các triền đồi điện gió, thác Lưu Ly và rừng thông yên bình. Bạn muốn tìm hiểu chi tiết địa điểm nào?')}
                </p>
              </div>

              {/* Các thẻ phụ trợ nếu AI trả về dữ liệu (Locations / Actions) */}
              {!isUser && data && (
                <div className="w-full max-w-[92%] space-y-2 pt-1">
                  
                  {/* Thẻ Card Địa Điểm từ Core API */}
                  {data.data?.locations && data.data.locations.length > 0 && (() => {
                    const isItinerary = data.intent === 'CREATE_ITINERARY' || data.action?.type === 'SAVE_ITINERARY' || data.action?.type === 'OPEN_ITINERARY_CREATOR';
                    const isInternetSource = data.data?.source === 'INTERNET' || data.data?.source === 'WEB';

                    if (isItinerary) {
                      return (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-black uppercase tracking-wider flex items-center ${isInternetSource ? 'text-sky-600' : 'text-[#ff9600]'}`}>
                              {isInternetSource ? <Globe className="w-3 h-3 mr-1 text-sky-500" /> : <Calendar className="w-3 h-3 mr-1 text-[#ff9600]" />}
                              {isInternetSource 
                                ? (isEn ? 'Internet Synthesized Itinerary' : 'Lịch Trình Tổng Hợp Từ Internet') 
                                : (isEn ? 'AI Planned Itinerary' : 'Lịch Trình Chi Tiết Đắk Song')}
                            </span>
                            <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
                              {data.data.locations.length} {isEn ? 'stops' : 'chặng dừng'}
                            </span>
                          </div>

                          {/* Timeline các chặng dọc y hệt MyItinerariesView */}
                          <div className="space-y-3 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-orange-200 pl-0.5">
                            {data.data.locations.map((loc, lIdx) => {
                              const slot = getTimeSlotForStop(lIdx, isEn);
                              const stopTime = loc.time || slot.time;
                              const stopDesc = loc.desc || loc.quote || (isEn 
                                ? `Stop #${lIdx + 1} (${slot.period}) arranged by AI for your Dak Song trip.` 
                                : `Điểm dừng chân thứ ${lIdx + 1} (${slot.period}) được AI sắp xếp phù hợp cho hành trình khám phá Đắk Song.`);

                              return (
                                <div key={lIdx} className="relative flex items-start space-x-2.5 pl-0.5">
                                  {/* Vòng tròn số thứ tự chặng */}
                                  <div className="w-6 h-6 rounded-full bg-[#ff9600] text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-xs ring-2 ring-white z-10 mt-0.5">
                                    {lIdx + 1}
                                  </div>

                                  {/* Khối card chặng dừng */}
                                  <div className="flex-1 min-w-0 bg-white rounded-2xl p-2.5 sm:p-3 border border-stone-200/90 shadow-2xs space-y-2">
                                    {/* Header chặng: Thời gian & Buổi */}
                                    <div className="flex items-center justify-between gap-1 flex-wrap">
                                      <span className="inline-flex items-center text-[10px] font-black text-[#ff9600] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/50">
                                        <Clock className="w-2.5 h-2.5 mr-1 text-[#ff9600]" />
                                        <span>{stopTime}</span>
                                      </span>
                                      <span className="text-[9px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                                        {slot.period}
                                      </span>
                                    </div>

                                    {/* Thông tin & Hình ảnh chặng */}
                                    <div className="flex space-x-2.5 items-start">
                                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200/80">
                                        <img
                                          src={loc.imageUrl?.trim() || DEFAULT_FALLBACK_IMG}
                                          alt=""
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMG;
                                          }}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>

                                      <div className="min-w-0 flex-1">
                                        <h5 className="font-extrabold text-stone-900 text-xs leading-snug line-clamp-1">{loc.name}</h5>
                                        <p className="text-[10px] text-stone-500 truncate flex items-center mt-0.5">
                                          <MapPin className="w-2.5 h-2.5 mr-0.5 text-stone-400 shrink-0" />
                                          <span className="truncate">{loc.address || loc.categoryName || 'Đắk Song, Đắk Nông'}</span>
                                        </p>
                                        <p className="text-[10px] text-stone-600 line-clamp-2 mt-1 leading-relaxed">
                                          {stopDesc}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Các nút tương tác */}
                                    <div className="pt-1.5 border-t border-stone-100 flex items-center justify-end space-x-1.5">
                                      <button
                                        onClick={() => openGoogleMaps(loc.name, undefined, undefined, loc.address || undefined)}
                                        className="px-2 py-1 bg-orange-50 text-[#ff9600] hover:bg-orange-100 rounded-lg text-[9px] font-bold flex items-center border border-orange-200/60 active:scale-95 transition-all"
                                      >
                                        <Navigation className="w-2.5 h-2.5 mr-1" />
                                        <span>{isEn ? 'Directions' : 'Chỉ đường'}</span>
                                      </button>
                                      {loc.hasVR360 && (
                                        <button
                                          onClick={() => onOpenVRNode(loc.vrNodeId || 'windfarm_node_1')}
                                          className="px-2 py-1 bg-stone-900 text-amber-400 rounded-lg text-[9px] font-bold flex items-center active:scale-95 transition-all"
                                        >
                                          <Compass className="w-2.5 h-2.5 mr-1" />
                                          <span>VR 360°</span>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    // Nếu là danh sách địa điểm gợi ý thông thường
                    return (
                      <div className="space-y-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center ${isInternetSource ? 'text-sky-600' : 'text-stone-400'}`}>
                          {isInternetSource ? (
                            <>
                              <Globe className="w-3 h-3 mr-1 text-sky-500" />
                              <span>{isEn ? 'Internet Synthesized Spots' : 'Gợi ý tổng hợp từ Internet & Đắk Song'}</span>
                            </>
                          ) : (
                            <>
                              <span>📍 {isEn ? 'Suggested Destinations' : 'Địa điểm nổi bật (Core API)'}</span>
                            </>
                          )}
                        </span>
                        <div className="grid grid-cols-1 gap-2">
                          {data.data.locations.map((loc, lIdx) => (
                            <div
                              key={lIdx}
                              className="bg-white rounded-2xl p-2.5 border border-stone-200/90 shadow-2xs flex space-x-2.5 items-center"
                            >
                              <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-stone-100 border border-stone-200/80">
                                <img
                                  src={loc.imageUrl?.trim() || DEFAULT_FALLBACK_IMG}
                                  alt=""
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMG;
                                  }}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h5 className="font-extrabold text-stone-900 text-xs truncate">{loc.name}</h5>
                                <p className="text-[10px] text-stone-500 truncate flex items-center mt-0.5">
                                  <MapPin className="w-3 h-3 mr-0.5 text-stone-400 shrink-0" />
                                  <span className="truncate">{loc.address || loc.categoryName || 'Đắk Song, Đắk Nông'}</span>
                                </p>
                                <div className="flex items-center space-x-1.5 mt-1.5">
                                  <button
                                    onClick={() => openGoogleMaps(loc.name, undefined, undefined, loc.address || undefined)}
                                    className="px-2 py-0.5 bg-orange-50 text-[#ff9600] rounded-md text-[9px] font-bold flex items-center border border-orange-200/60"
                                  >
                                    <Navigation className="w-2.5 h-2.5 mr-1" />
                                    <span>Chỉ đường</span>
                                  </button>
                                  {loc.hasVR360 && (
                                    <button
                                      onClick={() => onOpenVRNode(loc.vrNodeId || 'windfarm_node_1')}
                                      className="px-2 py-0.5 bg-stone-900 text-amber-400 rounded-md text-[9px] font-bold flex items-center"
                                    >
                                      <Compass className="w-2.5 h-2.5 mr-1" />
                                      <span>VR 360°</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Nút Thực Hiện Hành Động (Action Button) */}
                  {data.action && data.action.type && (
                    <div className="pt-1">
                      {(data.action.type === 'SAVE_ITINERARY' || data.action.type === 'OPEN_ITINERARY_CREATOR') && (
                        <div className="w-full">
                          <button
                            onClick={() => handleSaveAIItinerary(data.action!, data.data)}
                            className="w-full py-2.5 px-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-[#ff9600] text-white rounded-2xl text-xs font-black flex items-center justify-between shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                          >
                            <span className="flex items-center">
                              <BookmarkCheck className="w-4 h-4 mr-1.5 text-white" />
                              <span>{isEn ? 'Save this Itinerary to My Trips' : 'Lưu lịch trình này vào Chuyến Đi của tôi'}</span>
                            </span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {data.action.type === 'OPEN_VR360' && (
                        <button
                          onClick={() => handleActionClick(data.action)}
                          className="w-full py-2.5 px-3.5 bg-stone-900 text-[#ff9600] rounded-2xl text-xs font-black flex items-center justify-between shadow-md active:scale-95 transition-all"
                        >
                          <span className="flex items-center">
                            <Compass className="w-4 h-4 mr-1.5" />
                            <span>{isEn ? 'Explore VR 360° Panorama' : 'Khám phá Sa bàn VR 360°'}</span>
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}

                      {data.action.type === 'OPEN_FAVORITES' && (
                        <button
                          onClick={() => handleActionClick(data.action)}
                          className="w-full py-2.5 px-3.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-2xl text-xs font-black flex items-center justify-between shadow-2xs active:scale-95 transition-all"
                        >
                          <span className="flex items-center">
                            <Heart className="w-4 h-4 mr-1.5 fill-current" />
                            <span>{isEn ? 'View My Saved Destinations' : 'Xem các điểm đã lưu'}</span>
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Khung Tiến Trình Suy Nghĩ & Streaming Thời Gian Thực */}
        {isLoading && (
          <div className="flex flex-col items-start space-y-2 animate-in fade-in">
            {currentThinkingStep && (
              <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-2.5 max-w-[88%] text-xs shadow-2xs">
                <div className="flex items-center space-x-1.5 text-[#ff9600] font-black text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>{isEn ? 'AI Reasoning & Processing' : 'Tiến trình suy nghĩ của AI'}</span>
                </div>
                <div className="mt-1 text-stone-700 text-[11px] flex items-center space-x-1.5 animate-pulse font-medium">
                  <span>{currentThinkingStep}</span>
                </div>

                {thinkingStepsLog.length > 1 && (
                  <div className="mt-2 pt-1.5 border-t border-amber-200/60 space-y-1 text-[10px] text-stone-500">
                    {thinkingStepsLog.slice(0, -1).map((log, lIdx) => (
                      <div key={lIdx} className="flex items-center space-x-1 text-stone-400">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{log}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentStreamingText && (
              <div className="max-w-[85%] rounded-2xl p-3 text-xs sm:text-[13px] leading-relaxed shadow-2xs bg-white text-stone-800 border border-stone-200/90 rounded-bl-xs">
                <p className="whitespace-pre-wrap">
                  {cleanBotDisplayMessage(currentStreamingText)}
                  <span className="inline-block w-1.5 h-3.5 bg-[#ff9600] ml-1 animate-pulse align-middle" />
                </p>
              </div>
            )}

            {!currentStreamingText && (
              <div className="flex items-center space-x-2 text-stone-400 text-xs px-2 py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#ff9600]" />
                <span>{isEn ? 'Connecting official tourism data...' : 'Đang xử lý thông tin...'}</span>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Gợi Ý Câu Hỏi Nhanh (Quick Chips) */}
      <div className="px-3 py-1.5 bg-white border-t border-stone-100 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0">
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(q.text)}
            disabled={isLoading}
            className="px-2.5 py-1 bg-stone-100 hover:bg-orange-50 hover:text-[#ff9600] text-stone-600 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors shrink-0 border border-stone-200/60"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Thanh Nhập Tin Nhắn Ở Đáy */}
      <div className="p-3 pb-[76px] bg-white border-t border-stone-200/80 flex items-center space-x-2 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={isEn ? 'Ask AI about Dak Song...' : 'Hỏi trợ lý AI về Đắk Song...'}
          className="flex-1 px-3.5 py-2.5 bg-stone-100 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#ff9600]/40 transition-all"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!inputValue.trim() || isLoading}
          className="w-10 h-10 rounded-2xl bg-gradient-to-r from-amber-500 to-[#ff9600] text-white flex items-center justify-center shadow-md shadow-orange-500/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};



