import React, { useState } from 'react';
import { ArrowLeft, CalendarRange } from 'lucide-react';
import { Destination, Stay, Specialty } from '../types';
import { TravelLocation } from '../types/travel';
import { DESTINATIONS } from '../data/mockData';
import { 
  scanQRCode, 
  getStoredZaloUser, 
  loginZaloUser, 
  logoutZaloUser, 
  updateStoredUserProfile,
  ZaloUserData 
} from '../services/zalo';
import { syncUserProfile, fetchUserProfile, fetchUserFavorites, isSupabaseConfigured } from '../services/supabase.service';
import { PlannerTab } from './PlannerTab';
import { AuthModal } from '../components/AuthModal';
import { EditNicknameModal } from '../components/EditNicknameModal';
import { SavedMenu } from '../components/saved/SavedMenu';
import { BookmarksView } from '../components/saved/BookmarksView';
import { EmergencySOSView } from '../components/saved/EmergencySOSView';

interface SavedTabProps {
  savedIds: string[];
  onToggleSave: (id: string, e?: React.MouseEvent) => void;
  onSelectDestination: (dest: Destination) => void;
  onOpenVRNode: (nodeId: string) => void;
  onChangeTab?: (tab: string) => void;
  initialSubTab?: 'bookmarks' | 'planner' | 'sos';
  language?: 'vi' | 'en';
  destinations?: Destination[];
  travelLocations?: TravelLocation[];
  stays?: Stay[];
  specialties?: Specialty[];
}

export const SavedTab: React.FC<SavedTabProps> = ({
  savedIds,
  onToggleSave,
  onSelectDestination,
  onOpenVRNode,
  onChangeTab,
  initialSubTab,
  language = 'vi',
  destinations = DESTINATIONS,
  travelLocations = [],
  stays = [],
  specialties = []
}) => {
  const isEn = language === 'en';
  // Quản lý view hiển thị: 'menu' (danh sách menu dạng hàng) hoặc màn hình chi tiết tương ứng
  const [activeView, setActiveView] = useState<'menu' | 'bookmarks' | 'planner' | 'sos'>(
    initialSubTab ? initialSubTab : 'menu'
  );
  const [currentUser, setCurrentUser] = useState<ZaloUserData | null>(() => getStoredZaloUser());
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // Quản lý Modal UI
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState<{ title: string; description: string }>({
    title: 'Kết Nối Tài Khoản Zalo',
    description: 'Đăng nhập tài khoản Zalo với 1-chạm để lưu trữ địa điểm yêu thích và đồng bộ lịch trình tour của bạn.'
  });
  const [isEditNicknameOpen, setIsEditNicknameOpen] = useState(false);

  const activeDestinations = destinations || DESTINATIONS;
  const savedList = activeDestinations.filter((d) => savedIds.includes(d.id));

  const handleOpenLoginModal = (title: string, description: string) => {
    setAuthModalConfig({ title, description });
    setIsAuthModalOpen(true);
  };

  const handleScanQR = async () => {
    const code = await scanQRCode();
    if (code) {
      const matched = activeDestinations.find((d) => code.includes(d.id) || (d.vrNodeId && code.includes(d.vrNodeId)));
      if (matched) {
        onSelectDestination(matched);
      } else {
        alert(`Nội dung QR: ${code}`);
      }
    } else {
      alert('Không nhận diện được mã QR hoặc camera bị hủy.');
    }
  };

  const handleAuthZalo = async () => {
    setIsAuthenticating(true);
    setAuthNotice(null);
    try {
      const user = await loginZaloUser();
      
      // Kiểm tra xem trên Supabase đã có hồ sơ lưu trước đó của ID này chưa
      if (isSupabaseConfigured()) {
        const remoteProfile = await fetchUserProfile(user.id);
        if (remoteProfile && remoteProfile.name) {
          user.name = remoteProfile.name;
          if (remoteProfile.avatar) user.avatar = remoteProfile.avatar;
          updateStoredUserProfile(user);
        } else {
          await syncUserProfile(user);
        }

        const remoteFavorites = await fetchUserFavorites(user.id);
        if (remoteFavorites && remoteFavorites.length > 0) {
          try {
            const currentLocal = JSON.parse(localStorage.getItem('daksong_saved_places') || '[]');
            const merged = Array.from(new Set([...currentLocal, ...remoteFavorites]));
            localStorage.setItem('daksong_saved_places', JSON.stringify(merged));
          } catch (e) {}
        }
      }

      setCurrentUser(user);
      setIsAuthModalOpen(false);
      setAuthNotice(language === 'en' ? `Welcome ${user.name} connected to Zalo!` : `Chào mừng ${user.name} đã kết nối Zalo!`);
    } catch (err: any) {
      setAuthNotice(language === 'en' ? 'Account connected successfully!' : 'Đã kết nối tài khoản thành công!');
    } finally {
      setIsAuthenticating(false);
      setTimeout(() => setAuthNotice(null), 4000);
    }
  };

  const handleSaveNickname = async (newName: string) => {
    if (!currentUser) return;
    const updated = updateStoredUserProfile({ name: newName });
    if (updated) {
      setCurrentUser(updated);
      if (isSupabaseConfigured()) {
        await syncUserProfile(updated);
      }
      setAuthNotice(language === 'en' ? 'Display name updated successfully!' : 'Đã cập nhật tên hiển thị thành công!');
      setTimeout(() => setAuthNotice(null), 3000);
    }
  };

  const handleLogout = () => {
    logoutZaloUser();
    setCurrentUser(null);
    setAuthNotice(language === 'en' ? 'Logged out from this device.' : 'Đã đăng xuất tài khoản trên thiết bị này.');
    setTimeout(() => setAuthNotice(null), 3000);
  };

  return (
    <div className="space-y-4 pb-24 px-3.5 pt-3">
      {/* 1. MÀN HÌNH CHÍNH: MENU DẠNG HÀNG GỌN GÀNG, SANG TRỌNG */}
      {activeView === 'menu' && (
        <SavedMenu
          currentUser={currentUser}
          isAuthenticating={isAuthenticating}
          authNotice={authNotice}
          savedCount={savedList.length}
          language={language}
          onOpenLoginModal={handleOpenLoginModal}
          onLogout={handleLogout}
          onOpenEditNickname={() => setIsEditNicknameOpen(true)}
          onNavigateView={setActiveView}
          onScanQR={handleScanQR}
          onChangeTab={onChangeTab}
        />
      )}

      {/* 2. MÀN HÌNH CHI TIẾT: LỊCH TRÌNH CỦA TÔI */}
      {activeView === 'planner' && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 pb-1">
            <button
              onClick={() => setActiveView('menu')}
              className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-[#ff9600] text-xs font-bold flex items-center shadow-sm active:scale-95 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              {isEn ? 'Back' : 'Quay lại'}
            </button>
            <h3 className="text-sm font-black text-stone-900">
              {isEn ? 'Discovery Itinerary' : 'Lịch Trình Khám Phá'}
            </h3>
          </div>

          <PlannerTab
            onSelectDestination={onSelectDestination}
            onOpenVRNode={onOpenVRNode}
            embedded={true}
            language={language}
            destinations={activeDestinations}
            travelLocations={travelLocations}
            stays={stays}
            specialties={specialties}
            savedDestinations={savedList}
          />
        </div>
      )}

      {/* 3. MÀN HÌNH CHI TIẾT: ĐỊA ĐIỂM ĐÃ LƯU */}
      {activeView === 'bookmarks' && (
        <BookmarksView
          currentUser={currentUser}
          savedList={savedList}
          language={language}
          isAuthenticating={isAuthenticating}
          onBack={() => setActiveView('menu')}
          onOpenLoginModal={handleOpenLoginModal}
          onSelectDestination={onSelectDestination}
          onToggleSave={onToggleSave}
          onOpenVRNode={onOpenVRNode}
        />
      )}

      {/* 4. MÀN HÌNH CHI TIẾT: CỨU HỘ SOS KHẨN CẤP */}
      {activeView === 'sos' && (
        <EmergencySOSView
          language={language}
          onBack={() => setActiveView('menu')}
        />
      )}

      {/* Bottom Sheet Modal Đăng nhập Zalo 1-chạm */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onConfirmLogin={handleAuthZalo}
        isLoading={isAuthenticating}
        title={authModalConfig.title}
        description={authModalConfig.description}
        language={language}
      />

      {/* Modal Chỉnh Sửa Biệt Danh / Tên Hiển Thị */}
      <EditNicknameModal
        isOpen={isEditNicknameOpen}
        currentName={currentUser?.name || ''}
        onClose={() => setIsEditNicknameOpen(false)}
        onSave={handleSaveNickname}
        language={language}
      />
    </div>
  );
};
