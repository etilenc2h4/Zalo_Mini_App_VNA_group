import React from 'react';
import { Destination, LivePortalPost } from '../types';
import { DetailModal } from './DetailModal';
import { SavedModal } from '../pages/SavedModal';
import { BlogModal } from './BlogModal';
import { PhotoGalleryModal } from './PhotoGalleryModal';
import { AuthModal } from './AuthModal';

interface GlobalModalsProps {
  // Detail Modal
  selectedDestination: Destination | null;
  isDetailOpen: boolean;
  onCloseDetail: () => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onOpenVRNode: (nodeId: string) => void;

  // Saved Modal
  isSavedModalOpen: boolean;
  onCloseSavedModal: () => void;
  savedDestinations: Destination[];
  onSelectDestination: (dest: Destination) => void;

  // Blog Modal
  activeBlogPost: LivePortalPost | null;
  onCloseBlogModal: () => void;

  // Gallery Modal
  isGalleryOpen: boolean;
  onCloseGallery: () => void;

  // Auth Modal
  authModal: {
    isOpen: boolean;
    title?: string;
    description?: string;
  };
  onCloseAuthModal: () => void;
  onConfirmLogin: () => void;
  isAuthLoading: boolean;

  language: 'vi' | 'en';
}

export const GlobalModals: React.FC<GlobalModalsProps> = ({
  selectedDestination,
  isDetailOpen,
  onCloseDetail,
  savedIds,
  onToggleSave,
  onOpenVRNode,
  isSavedModalOpen,
  onCloseSavedModal,
  savedDestinations,
  onSelectDestination,
  activeBlogPost,
  onCloseBlogModal,
  isGalleryOpen,
  onCloseGallery,
  authModal,
  onCloseAuthModal,
  onConfirmLogin,
  isAuthLoading,
  language
}) => {
  return (
    <>
      {/* Modal Xem chi tiết điểm đến */}
      <DetailModal
        destination={selectedDestination}
        isOpen={isDetailOpen}
        onClose={onCloseDetail}
        isSaved={selectedDestination ? savedIds.includes(selectedDestination.id) : false}
        onToggleSave={onToggleSave}
        onOpenVRNode={onOpenVRNode}
        language={language}
      />

      {/* Modal Danh sách điểm đã lưu */}
      <SavedModal
        isOpen={isSavedModalOpen}
        onClose={onCloseSavedModal}
        savedDestinations={savedDestinations}
        onRemoveSave={onToggleSave}
        onSelectDestination={onSelectDestination}
        language={language}
      />

      {/* Modal Đọc bài viết Blog Du Lịch Real-time */}
      <BlogModal
        post={activeBlogPost}
        isOpen={!!activeBlogPost}
        onClose={onCloseBlogModal}
        language={language}
        isSaved={activeBlogPost ? savedIds.includes(activeBlogPost.id) : false}
        onToggleSave={onToggleSave}
      />

      {/* Modal Thư Viện Ảnh Đắk Song */}
      <PhotoGalleryModal
        isOpen={isGalleryOpen}
        onClose={onCloseGallery}
        language={language}
      />

      {/* Modal Đăng Nhập Zalo Cao Cấp */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={onCloseAuthModal}
        onConfirmLogin={onConfirmLogin}
        isLoading={isAuthLoading}
        title={authModal.title}
        description={authModal.description}
        language={language}
      />
    </>
  );
};

