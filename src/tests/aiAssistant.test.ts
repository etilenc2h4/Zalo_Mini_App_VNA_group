// 1. Mock đầy đủ môi trường Browser an toàn cho ZMP SDK trên Node.js 24
const mockNav = { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' };
const mockWindow: any = {
  location: { href: 'http://localhost', hostname: 'localhost', search: '', protocol: 'http:' },
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  },
  document: { 
    createElement: () => ({ setAttribute: () => {}, appendChild: () => {} }),
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
  },
  navigator: mockNav,
};

(globalThis as any).window = mockWindow;
(globalThis as any).location = mockWindow.location;
(globalThis as any).localStorage = mockWindow.localStorage;
(globalThis as any).document = mockWindow.document;

try {
  Object.defineProperty(globalThis, 'navigator', {
    value: mockNav,
    configurable: true,
    writable: true,
  });
} catch {}

// 2. Import động sau khi đã mock browser globals
const { sendChatMessageToAI } = await import('../services/aiAssistant.service.js');

let passed = 0;
let total = 0;

const assert = (condition: boolean, testName: string, detail?: string) => {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    console.error(`  ❌ [FAIL] ${testName}`);
    if (detail) console.error(`     👉 Chi tiết: ${detail}`);
  }
};

const runFrontendAITests = async () => {
  console.log('================================================================');
  console.log('🧪 BẮT ĐẦU CHẠY BỘ TEST SUITE FRONTEND: AI ASSISTANT CLIENT');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // TEST GROUP 1: INTENT & ACTION DETECTION
  // -------------------------------------------------------------
  console.log('🎯 [GROUP 1] Kiểm tra nhận diện Intent & Action (Client Logic)...');

  // Case 1: Ý định tạo lịch trình
  console.log('  → Test Case 1: Nhận diện ý định tạo lịch trình 2 ngày...');
  const itinRes = await sendChatMessageToAI('Tôi muốn đi tour 2 ngày 1 đêm ở Đắk Song');
  assert(itinRes.intent === 'CREATE_ITINERARY', 'Frontend: Nhận diện intent CREATE_ITINERARY');
  assert(itinRes.action_required === true, 'Frontend: action_required phải là true');
  assert(itinRes.action?.type === 'OPEN_ITINERARY_CREATOR', 'Frontend: action.type là OPEN_ITINERARY_CREATOR');
  assert(itinRes.action?.payload?.duration === '2days', 'Frontend: duration nhận diện đúng 2days');
  assert(
    itinRes.message.includes('Tạo lịch trình cho tôi'),
    'Frontend: Hướng dẫn người dùng chọn nút tạo lịch trình thay vì tự ý tạo tour trong chat'
  );

  // Case 2: Ý định xem thực tế ảo VR 360
  console.log('\n  → Test Case 2: Nhận diện ý định xem Sa bàn VR 360°...');
  const vrRes = await sendChatMessageToAI('Cho tôi xem sa bàn thực tế ảo VR 360');
  assert(vrRes.intent === 'VR360', 'Frontend: Nhận diện intent VR360');
  assert(vrRes.action_required === true, 'Frontend: action_required là true');
  assert(vrRes.action?.type === 'OPEN_VR360', 'Frontend: action.type là OPEN_VR360');

  // Case 3: Ý định xem mục đã lưu (Favorites)
  console.log('\n  → Test Case 3: Nhận diện ý định xem mục đã lưu...');
  const favRes = await sendChatMessageToAI('Mở danh sách các điểm tôi đã lưu yêu thích');
  assert(favRes.intent === 'FAVORITE', 'Frontend: Nhận diện intent FAVORITE');
  assert(favRes.action_required === true, 'Frontend: action_required là true');
  assert(favRes.action?.type === 'OPEN_FAVORITES', 'Frontend: action.type là OPEN_FAVORITES');

  // Case 4: Hỏi đáp trò chuyện thông thường (Chat Mode)
  console.log('\n  → Test Case 4: Chế độ hội thoại thông thường (Chat Mode)...');
  const chatRes = await sendChatMessageToAI('Xin chào bạn, hôm nay thời tiết thế nào?');
  assert(chatRes.intent === 'CHAT', 'Frontend: Nhận diện intent CHAT');
  assert(chatRes.action_required === false, 'Frontend: action_required là false');
  assert(chatRes.action === null, 'Frontend: action là null trong Chat Mode');
  assert(typeof chatRes.message === 'string' && chatRes.message.length > 0, 'Frontend: Message trả về đầy đủ');

  // -------------------------------------------------------------
  // TEST GROUP 2: SCHEMA TIÊU CHUẨN ĐẦU RA
  // -------------------------------------------------------------
  console.log('\n📐 [GROUP 2] Kiểm tra tính toàn vẹn của Structured Response Schema...');
  const keys = Object.keys(chatRes);
  assert(keys.includes('message'), 'Schema: Có trường "message"');
  assert(keys.includes('intent'), 'Schema: Có trường "intent"');
  assert(keys.includes('action_required'), 'Schema: Có trường "action_required"');
  assert(keys.includes('action'), 'Schema: Có trường "action"');

  // -------------------------------------------------------------
  // TỔNG KẾT KẾT QUẢ
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`📊 KẾT QUẢ TEST FRONTEND: ${passed}/${total} TESTS ĐẠT (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================');

  if (passed === total) {
    console.log('🎉 TẤT CẢ CÁC TEST CASES FRONTEND ĐÃ VƯỢT QUA XUẤT SẮC!');
  } else {
    console.warn('⚠️ CÓ MỘT SỐ TEST CASE CHƯA ĐẠT.');
  }
};

await runFrontendAITests();

export {};
