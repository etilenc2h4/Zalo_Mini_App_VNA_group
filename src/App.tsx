import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { BottomNavigation, TabKey } from './components/BottomNavigation';
import { GlobalModals } from './components/GlobalModals';
import { AIAssistantModal } from './components/ai/AIAssistantModal';
import { QRAudioGuideModal } from './components/qr/QRAudioGuideModal';
import { resolveQRCodeContent, QRGuideItem } from './services/qrGuide.service';
import { HomeTab } from './pages/HomeTab';
import { DiscoverTab } from './pages/DiscoverTab';
import { VR360Tab } from './pages/VR360Tab';
import { MapTab } from './pages/MapTab';
import { SavedTab } from './pages/SavedTab';
import { AITab } from './pages/AITab';
import { Destination, LivePortalPost } from './types';
import { getStoredZaloUser, loginZaloUser } from './services/zalo';
import { 
  fetchUserFavorites, 
  fetchUserFavoriteDetails, 
  syncToggleFavorite, 
  syncUserProfile, 
  isSupabaseConfigured,
  UserFavorite 
} from './services/supabase.service';
import { getStoredLanguage, setStoredLanguage } from './services/translate.service';
import { usePortalData } from './hooks/usePortalData';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [prevTab, setPrevTab] = useState<TabKey>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [activeVRNode, setActiveVRNode] = useState<string>('');
  const [language, setLanguage] = useState<'vi' | 'en'>(() => getStoredLanguage());
  
  // Quản lý nạp và tự động dịch dữ liệu từ backend Portal
  const {
    banners,
    portalConfig,
    isLoadingPosts,
    postError,
    fetchPortalData,
    displayPosts,
    displayTravelLocations,
    displayDestinations,
    displaySpecialties,
    displayStays
  } = usePortalData(language);

  // Modals state
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [activeBlogPost, setActiveBlogPost] = useState<LivePortalPost | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isQRGuideOpen, setIsQRGuideOpen] = useState(false);
  const [selectedQRItem, setSelectedQRItem] = useState<QRGuideItem | null>(null);

  // Xử lý DeepLink từ mã QR quét bên ngoài Zalo (ví dụ: ?qrId=thac_luu_ly hoặc ?destId=thac_luu_ly)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const targetId = params.get('qrId') || params.get('destId') || params.get('id');
      if (targetId) {
        const item = resolveQRCodeContent(targetId);
        if (item) {
          setSelectedQRItem(item);
          setIsQRGuideOpen(true);
        }
      }
    } catch (e) {
      console.warn('Lỗi phân tích URL params:', e);
    }
  }, []);

  // Danh sách ID các điểm đã lưu
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('daksong_saved_places');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Chi tiết các mục yêu thích lấy trực tiếp từ CSDL Supabase
  const [supabaseFavorites, setSupabaseFavorites] = useState<UserFavorite[]>([]);

  // State điều khiển Bottom Sheet Modal Đăng nhập Zalo
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    pendingDestId?: string;
    title?: string;
    description?: string;
  }>({ isOpen: false });
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Nạp danh sách yêu thích từ Supabase khi người dùng đã đăng nhập Zalo
  const loadRemoteFavorites = async (userId: string) => {
    try {
      const [remoteIds, remoteDetails] = await Promise.all([
        fetchUserFavorites(userId),
        fetchUserFavoriteDetails(userId)
      ]);

      if (remoteIds && remoteIds.length > 0) {
        setSavedIds((prev) => Array.from(new Set([...prev, ...remoteIds])));
      }
      if (remoteDetails && remoteDetails.length > 0) {
        setSupabaseFavorites(remoteDetails);
      }
    } catch (e) {
      console.warn('[Favorites] Lỗi tải yêu thích từ Supabase:', e);
    }
  };

  useEffect(() => {
    const user = getStoredZaloUser();
    if (user && isSupabaseConfigured()) {
      loadRemoteFavorites(user.id);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('daksong_saved_places', JSON.stringify(savedIds));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }, [savedIds]);

  /**
   * Tạo metadata chuẩn từ các nguồn dữ liệu để lưu độc lập vào CSDL Supabase
   */
  const getItemMetadata = (id: string) => {
    // 1. Kiểm tra trong Destination (MockData)
    const dest = displayDestinations.find((d) => d.id === id);
    if (dest) {
      return {
        title: dest.name,
        image: dest.image,
        address: dest.address,
        category_label: dest.categoryLabel,
        target_type: 'destination',
        extra_data: {
          lat: dest.lat,
          lng: dest.lng,
          phone: dest.phone,
          vrNodeId: dest.vrNodeId,
          highlights: dest.highlights
        }
      };
    }

    // 2. Kiểm tra trong TravelLocation (Live API Core-360)
    const loc = displayTravelLocations.find((l) => l.id === id);
    if (loc) {
      return {
        title: loc.name,
        image: loc.imageUrl,
        address: loc.address || 'Đắk Song, Đắk Nông',
        category_label: loc.travelCategoryIcon || 'Khám phá',
        target_type: 'travel_location',
        extra_data: {
          lat: loc.lat,
          lng: loc.lng,
          phone: loc.phone,
          content: loc.content,
          link: loc.link
        }
      };
    }

    // 3. Kiểm tra trong Cơ sở lưu trú
    const stay = displayStays.find((s) => s.id === id);
    if (stay) {
      return {
        title: stay.name,
        image: stay.image,
        address: stay.address,
        category_label: stay.typeLabel || 'Lưu trú',
        target_type: 'stay',
        extra_data: {
          phone: stay.phone,
          price: stay.pricePerNight
        }
      };
    }

    // 4. Kiểm tra trong Đặc sản
    const spec = displaySpecialties.find((s) => s.id === id);
    if (spec) {
      return {
        title: spec.name,
        image: spec.image,
        address: spec.whereToBuy,
        category_label: spec.categoryLabel || 'Đặc sản',
        target_type: 'specialty',
        extra_data: {
          hotline: spec.hotline
        }
      };
    }

    // 5. Kiểm tra trong Bài viết & Cẩm nang (Live CMS API)
    const post = displayPosts.find((p) => p.id === id);
    if (post) {
      return {
        title: post.name,
        image: post.imageUrl || post.image,
        address: post.categoryName || 'Cẩm nang Đắk Song',
        category_label: post.categoryName || 'Bài viết',
        target_type: 'post',
        extra_data: {
          slug: post.slug,
          quote: post.quote,
          views: post.view,
          publishDate: post.publishDate,
          creator: post.creator,
          isPost: true
        }
      };
    }

    return undefined;
  };

  const handleToggleSave = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const user = getStoredZaloUser();
    if (!user) {
      setAuthModal({
        isOpen: true,
        pendingDestId: id,
        title: 'Lưu Vào Điểm Đến Yêu Thích',
        description: 'Vui lòng kết nối Zalo với 1-chạm để lưu địa điểm này và đồng bộ trên mọi thiết bị.'
      });
      return;
    }

    const willBeSaved = !savedIds.includes(id);

    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );

    const metadata = getItemMetadata(id);

    // Cập nhật state Supabase Favorites tức thì trên UI
    if (willBeSaved && metadata) {
      setSupabaseFavorites((prev) => [
        {
          user_id: user.id,
          destination_id: id,
          title: metadata.title,
          image: metadata.image,
          address: metadata.address,
          category_label: metadata.category_label,
          target_type: metadata.target_type,
          extra_data: metadata.extra_data,
          created_at: new Date().toISOString()
        },
        ...prev.filter((f) => f.destination_id !== id)
      ]);
    } else {
      setSupabaseFavorites((prev) => prev.filter((f) => f.destination_id !== id));
    }

    // Đồng bộ trực tiếp vào CSDL Supabase
    syncToggleFavorite(user.id, id, willBeSaved, metadata);
  };

  const handleConfirmAuthModal = async () => {
    setIsAuthLoading(true);
    try {
      const user = await loginZaloUser();
      if (isSupabaseConfigured() && user) {
        await syncUserProfile(user);
        await loadRemoteFavorites(user.id);
      }

      // Tự động lưu địa điểm đang chờ
      if (authModal.pendingDestId) {
        const destId = authModal.pendingDestId;
        setSavedIds((prev) => (prev.includes(destId) ? prev : [...prev, destId]));
        if (user) {
          const meta = getItemMetadata(destId);
          syncToggleFavorite(user.id, destId, true, meta);
        }
      }

      setAuthModal({ isOpen: false });
    } catch (err) {
      console.warn('AuthModal login error:', err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSelectDestination = (dest: Destination) => {
    // Nếu đây là bài viết được lưu, mở trực tiếp BlogModal
    if (dest.extra_data?.isPost || dest.categoryLabel === 'Bài viết') {
      const existingPost = displayPosts.find(
        (p) => p.id === dest.id || (dest.extra_data?.slug && p.slug === dest.extra_data.slug)
      );
      if (existingPost) {
        setActiveBlogPost(existingPost);
        return;
      }
      setActiveBlogPost({
        id: dest.id,
        name: dest.name,
        slug: (dest.extra_data?.slug as string) || dest.id,
        categoryId: 'culture',
        categoryName: dest.categoryLabel || 'Bài viết',
        quote: dest.description,
        content: dest.description,
        imageUrl: dest.image,
        image: dest.image,
        publishDate: (dest.extra_data?.publishDate as string) || new Date().toLocaleDateString('vi-VN'),
        view: (dest.extra_data?.views as number) || 120,
        creator: (dest.extra_data?.creator as string) || 'Cổng TTĐT Đắk Song'
      });
      return;
    }

    setSelectedDestination(dest);
    setIsDetailOpen(true);
  };

  const handleOpenVRNode = (nodeId: string) => {
    setPrevTab(activeTab);
    setActiveVRNode(nodeId);
    setActiveTab('vr360');
  };

  const [langToast, setLangToast] = useState<string | null>(null);

  const handleToggleLanguage = () => {
    const nextLang = language === 'vi' ? 'en' : 'vi';
    setLanguage(nextLang);
    setStoredLanguage(nextLang);
    if (nextLang === 'en') {
      setLangToast('🌐 Đã kích hoạt Google Translate sang Tiếng Anh');
    } else {
      setLangToast('🇻🇳 Đã chuyển về Tiếng Việt');
    }
    setTimeout(() => setLangToast(null), 2500);
  };

  /**
   * Hợp nhất thông minh danh sách địa điểm đã lưu:
   * Kết hợp dữ liệu từ Supabase + Mock Destinations + Live Travel Locations từ CMS
   * Đảm bảo 100% mục đã lưu đều hiển thị ảnh, tên, danh mục và chỉ đường hoàn chỉnh
   */
  const savedDestinations: Destination[] = useMemo(() => {
    const list: Destination[] = [];
    const addedIds = new Set<string>();

    // 1. Ưu tiên các mục từ Supabase (có đầy đủ metadata tự chủ)
    for (const fav of supabaseFavorites) {
      if (savedIds.includes(fav.destination_id) && !addedIds.has(fav.destination_id)) {
        addedIds.add(fav.destination_id);
        const isPost = fav.target_type === 'post' || Boolean(fav.extra_data?.isPost);
        // Bổ sung thông tin nếu mục Supabase cũ chưa có trường phone hoặc tọa độ
        const matchedLoc = displayTravelLocations.find((l) => l.id === fav.destination_id);
        const matchedDest = displayDestinations.find((d) => d.id === fav.destination_id);
        const matchedStay = displayStays.find((s) => s.id === fav.destination_id);
        const matchedSpec = displaySpecialties.find((s) => s.id === fav.destination_id);

        const phone = fav.extra_data?.phone || matchedLoc?.phone || matchedDest?.phone || matchedStay?.phone || fav.extra_data?.hotline || matchedSpec?.hotline;
        const lat = fav.extra_data?.lat || matchedLoc?.lat || matchedDest?.lat;
        const lng = fav.extra_data?.lng || matchedLoc?.lng || matchedDest?.lng;
        const vrNodeId = fav.extra_data?.vrNodeId || matchedDest?.vrNodeId;

        list.push({
          id: fav.destination_id,
          name: fav.title || 'Mục đã lưu',
          category: isPost ? 'culture' : 'nature',
          categoryLabel: fav.category_label || (isPost ? 'Bài viết' : 'Khám phá'),
          rating: 5,
          reviewsCount: isPost ? (fav.extra_data?.views || 100) : 12,
          address: fav.address || (isPost ? 'Cẩm nang Đắk Song' : 'Đắk Song, Đắk Nông'),
          distance: isPost ? 'Bài viết' : 'Đang cập nhật',
          ticketPrice: 'Miễn phí',
          openHours: isPost ? 'Đọc bài viết' : 'Mở cả ngày',
          image: fav.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
          gallery: [fav.image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'],
          description: fav.extra_data?.quote || fav.extra_data?.content || fav.title || '',
          phone: phone,
          lat: lat,
          lng: lng,
          vrNodeId: vrNodeId,
          googleMapsUrl: fav.extra_data?.link || matchedLoc?.link || matchedDest?.googleMapsUrl,
          highlights: isPost ? ['Bài viết cẩm nang văn hóa du lịch'] : ['Điểm đến đã lưu vào CSDL cá nhân'],
          tips: [],
          extra_data: {
            ...fav.extra_data,
            phone: phone,
            lat: lat,
            lng: lng,
            vrNodeId: vrNodeId,
            isPost: isPost,
            target_type: fav.target_type
          }
        });
      }
    }

    // 2. Bổ sung từ displayDestinations
    for (const d of displayDestinations) {
      if (savedIds.includes(d.id) && !addedIds.has(d.id)) {
        addedIds.add(d.id);
        list.push(d);
      }
    }

    // 3. Bổ sung từ displayTravelLocations (Live API Core-360)
    for (const l of displayTravelLocations) {
      if (savedIds.includes(l.id) && !addedIds.has(l.id)) {
        addedIds.add(l.id);
        list.push({
          id: l.id,
          name: l.name,
          category: 'nature',
          categoryLabel: l.travelCategoryIcon || 'Khám phá',
          rating: 5,
          reviewsCount: 12,
          address: l.address || 'Đắk Song, Đắk Nông',
          distance: 'Đang cập nhật',
          ticketPrice: 'Miễn phí',
          openHours: 'Mở cả ngày',
          image: l.imageUrl,
          gallery: [l.imageUrl],
          description: l.content || l.name,
          phone: l.phone || undefined,
          lat: l.lat || undefined,
          lng: l.lng || undefined,
          googleMapsUrl: l.link || undefined,
          highlights: ['Địa điểm thực tế Cổng Du Lịch Đắk Song'],
          tips: ['Nên liên hệ trước khi đến']
        });
      }
    }

    // 4. Bổ sung từ displayPosts (Bài viết & Cẩm nang CMS)
    for (const p of displayPosts) {
      if (savedIds.includes(p.id) && !addedIds.has(p.id)) {
        addedIds.add(p.id);
        list.push({
          id: p.id,
          name: p.name,
          category: 'culture',
          categoryLabel: p.categoryName || 'Bài viết',
          rating: 5,
          reviewsCount: p.view || 12,
          address: 'Cẩm nang Đắk Song',
          distance: 'Bài viết',
          ticketPrice: 'Miễn phí',
          openHours: 'Đọc bài viết',
          image: p.imageUrl,
          gallery: [p.imageUrl],
          description: p.quote || p.name,
          highlights: ['Bài viết cẩm nang văn hóa du lịch'],
          tips: [],
          extra_data: {
            isPost: true,
            slug: p.slug
          }
        });
      }
    }

    return list;
  }, [savedIds, supabaseFavorites, displayDestinations, displayTravelLocations, displayPosts]);

  return (
    <div className="min-h-screen bg-stone-100 flex justify-center">
      {/* Mobile container giới hạn bề ngang max-w-md chuẩn Zalo Mini App */}
      <div className="w-full max-w-md bg-stone-50 min-h-screen shadow-2xl relative flex flex-col border-x border-stone-200">
        {/* Toast thông báo chuyển đổi ngôn ngữ */}
        {langToast && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-stone-900/90 text-white text-xs font-bold px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-sm animate-fadeIn flex items-center space-x-1.5 border border-white/20">
            <span>{langToast}</span>
          </div>
        )}

        {/* Header với nhận diện thương hiệu Cam Vàng chính thức */}
        <Header
          savedCount={savedIds.length}
          onOpenSaved={() => setIsSavedModalOpen(true)}
          language={language}
          onToggleLanguage={handleToggleLanguage}
          onOpenQRScanner={() => setIsQRGuideOpen(true)}
          portalConfig={portalConfig}
        />

        {/* Tab Content */}
        <main className={`flex-1 ${activeTab === 'vr360' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
          {activeTab === 'home' && (
            <HomeTab
              destinations={displayDestinations}
              specialties={displaySpecialties}
              stays={displayStays}
              savedIds={savedIds}
              posts={displayPosts}
              banners={banners}
              portalConfig={portalConfig}
              travelLocations={displayTravelLocations}
              isLoadingPosts={isLoadingPosts}
              postError={postError}
              onRetryPosts={fetchPortalData}
              onToggleSave={handleToggleSave}
              onSelectDestination={handleSelectDestination}
              onChangeTab={setActiveTab}
              onSelectCategoryFilter={(cat) => setSelectedCategory(cat)}
              onOpenVRNode={handleOpenVRNode}
              onOpenBlog={(post) => setActiveBlogPost(post)}
              onOpenGallery={() => setIsGalleryOpen(true)}
              onOpenQRScanner={() => setIsQRGuideOpen(true)}
              language={language}
            />
          )}

          {activeTab === 'explore' && (
            <DiscoverTab
              initialCategory={selectedCategory}
              onOpenBlog={(post) => setActiveBlogPost(post)}
              onOpenVRNode={handleOpenVRNode}
              onSelectLocation={(loc) => {
                setSelectedDestination({
                  id: loc.id,
                  name: loc.name,
                  category: 'nature',
                  categoryLabel: loc.travelCategoryIcon || 'Khám phá',
                  rating: 5,
                  reviewsCount: 12,
                  address: loc.address || 'Đắk Song, Đắk Nông',
                  distance: 'Đang cập nhật',
                  ticketPrice: 'Miễn phí',
                  openHours: 'Mở cả ngày',
                  image: loc.imageUrl,
                  gallery: [loc.imageUrl],
                  description: loc.content || loc.name,
                  phone: loc.phone || undefined,
                  lat: loc.lat || undefined,
                  lng: loc.lng || undefined,
                  googleMapsUrl: loc.link || undefined,
                  highlights: ['Địa điểm thực tế Cổng Du Lịch Đắk Song', 'Cảnh quan cao nguyên thơ mộng'],
                  tips: ['Nên ghé thăm vào buổi sáng hoặc hoàng hôn', 'Liên hệ trước để được hỗ trợ chu đáo nhất']
                });
                setIsDetailOpen(true);
              }}
              onChangeTab={(tab) => setActiveTab(tab as TabKey)}
              language={language}
              posts={displayPosts}
              travelLocations={displayTravelLocations}
              savedIds={savedIds}
              onToggleSave={handleToggleSave}
            />
          )}

          {activeTab === 'ai' && (
            <AITab
              language={language}
              onNavigateTab={(tab) => setActiveTab(tab as TabKey)}
              onSelectDestination={handleSelectDestination}
              onOpenVRNode={handleOpenVRNode}
              travelLocations={displayTravelLocations}
              destinations={savedDestinations}
              specialties={displaySpecialties}
              stays={displayStays}
            />
          )}

          {activeTab === 'vr360' && (
            <VR360Tab
              initialNodeId={activeVRNode}
              onBack={() => setActiveTab(prevTab || 'home')}
              language={language}
            />
          )}

          {activeTab === 'map' && (
            <MapTab
              onSelectDestination={handleSelectDestination}
              onOpenVRNode={handleOpenVRNode}
              language={language}
              travelLocations={displayTravelLocations}
              savedIds={savedIds}
              onToggleSave={handleToggleSave}
            />
          )}

          {activeTab === 'planner' && (
            <SavedTab
              savedIds={savedIds}
              destinations={savedDestinations}
              travelLocations={displayTravelLocations}
              stays={displayStays}
              specialties={displaySpecialties}
              onToggleSave={handleToggleSave}
              onSelectDestination={handleSelectDestination}
              onOpenVRNode={handleOpenVRNode}
              onChangeTab={(tab) => setActiveTab(tab as TabKey)}
              initialSubTab="planner"
              language={language}
            />
          )}

          {activeTab === 'saved' && (
            <SavedTab
              savedIds={savedIds}
              destinations={savedDestinations}
              travelLocations={displayTravelLocations}
              stays={displayStays}
              specialties={displaySpecialties}
              onToggleSave={handleToggleSave}
              onSelectDestination={handleSelectDestination}
              onOpenVRNode={handleOpenVRNode}
              onChangeTab={(tab) => setActiveTab(tab as TabKey)}
              language={language}
            />
          )}
        </main>

        {/* Bottom Navigation Bar chuẩn Cam Vàng (4 Tab Cốt Lõi) */}
        <BottomNavigation
          activeTab={activeTab === 'planner' ? 'saved' : activeTab}
          onChangeTab={setActiveTab}
          savedCount={savedIds.length}
          language={language}
        />



        {/* Modal Trợ Lý Du Lịch AI Gemini */}
        <AIAssistantModal
          isOpen={isAIChatOpen}
          onClose={() => setIsAIChatOpen(false)}
          language={language}
          onNavigateTab={(tab) => setActiveTab(tab as TabKey)}
          onSelectDestination={handleSelectDestination}
          onOpenVRNode={handleOpenVRNode}
        />

        {/* Modal Thuyết Minh Đa Phương Tiện QR Code Điểm Đến */}
        <QRAudioGuideModal
          isOpen={isQRGuideOpen}
          onClose={() => {
            setIsQRGuideOpen(false);
            setSelectedQRItem(null);
          }}
          language={language}
          initialItem={selectedQRItem}
          onOpenVRNode={handleOpenVRNode}
        />

        {/* Các Modal toàn cục */}
        <GlobalModals
          selectedDestination={selectedDestination}
          isDetailOpen={isDetailOpen}
          onCloseDetail={() => setIsDetailOpen(false)}
          savedIds={savedIds}
          onToggleSave={handleToggleSave}
          onOpenVRNode={handleOpenVRNode}
          isSavedModalOpen={isSavedModalOpen}
          onCloseSavedModal={() => setIsSavedModalOpen(false)}
          savedDestinations={savedDestinations}
          onSelectDestination={handleSelectDestination}
          activeBlogPost={activeBlogPost}
          onCloseBlogModal={() => setActiveBlogPost(null)}
          isGalleryOpen={isGalleryOpen}
          onCloseGallery={() => setIsGalleryOpen(false)}
          authModal={authModal}
          onCloseAuthModal={() => setAuthModal({ isOpen: false })}
          onConfirmLogin={handleConfirmAuthModal}
          isAuthLoading={isAuthLoading}
          language={language}
        />
      </div>
    </div>
  );
};

export default App;
