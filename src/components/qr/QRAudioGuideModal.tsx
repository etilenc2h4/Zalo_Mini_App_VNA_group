import React, { useState, useRef, useEffect } from 'react';
import { 
  X, QrCode, Camera, Play, Pause, Volume2, Compass, MapPin, 
  Sparkles, CheckCircle2, ChevronRight, Music, Mic, Printer, ArrowLeft
} from 'lucide-react';
import { scanQRCode } from 'zmp-sdk/apis';
import { 
  QRGuideItem, DAKSONG_QR_GUIDE_LIST, resolveQRCodeContent, getPrintableQRCodeImageUrl 
} from '../../services/qrGuide.service';

interface QRAudioGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: 'vi' | 'en';
  initialItem?: QRGuideItem | null;
  onOpenVRNode?: (nodeId: string) => void;
}

export const QRAudioGuideModal: React.FC<QRAudioGuideModalProps> = ({
  isOpen,
  onClose,
  language = 'vi',
  initialItem = null,
  onOpenVRNode
}) => {
  const isEn = language === 'en';
  const [selectedItem, setSelectedItem] = useState<QRGuideItem | null>(initialItem || null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioMode, setAudioMode] = useState<'voice' | 'music'>('voice');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (initialItem) {
      setSelectedItem(initialItem);
    }
  }, [initialItem]);

  // Tự động phát khi chọn điểm đến mới
  useEffect(() => {
    if (selectedItem && audioRef.current) {
      const activeUrl = audioMode === 'voice' 
        ? selectedItem.audioUrl 
        : (selectedItem.ambientMusicUrl || selectedItem.audioUrl);
      
      audioRef.current.src = activeUrl;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [selectedItem, audioMode]);

  // Dừng phát khi đóng modal
  useEffect(() => {
    if (!isOpen && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Gọi API Camera Zalo Quét Mã QR thật
  const handleTriggerZaloCameraScan = async () => {
    setScanError(null);
    setIsScanning(true);
    try {
      const res = await scanQRCode();
      if (res && res.content) {
        const item = resolveQRCodeContent(res.content);
        if (item) {
          setSelectedItem(item);
        } else {
          setScanError(isEn 
            ? 'QR Code recognized but not mapped to Dak Song Tourism spots.' 
            : `Đã quét được mã: "${res.content.substring(0, 40)}" nhưng chưa nằm trong danh mục điểm đến.`);
        }
      }
    } catch (err: any) {
      setScanError(isEn 
        ? 'Scan cancelled or camera permission not granted.' 
        : 'Quét bị hủy hoặc chưa cấp quyền truy cập Camera trên thiết bị.');
    } finally {
      setIsScanning(false);
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-stone-200">
        
        {/* Header Modal */}
        <div className="px-4 py-3 bg-gradient-to-r from-stone-900 to-stone-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-[#ff9600] flex items-center justify-center text-white shadow-md">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black tracking-tight flex items-center space-x-1.5">
                <span>{isEn ? 'QR Audio Tour Guide' : 'Thuyết Minh Đa Phương Tiện QR'}</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-1.5 py-0.2 rounded-full font-bold">
                  LIVE
                </span>
              </h3>
              <p className="text-[10px] text-stone-300">
                {isEn ? 'Scan on-site QR to listen & view spot facts' : 'Quét mã tại điểm đến để nghe thuyết minh tự động'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-stone-300 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung Modal */}
        <div className="p-4 overflow-y-auto space-y-4 no-scrollbar">

          {/* NÚT QUÉT CAMERA ZALO THẬT */}
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 rounded-2xl p-3.5 border border-amber-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-[#ff9600] uppercase tracking-wider flex items-center">
                <Camera className="w-3.5 h-3.5 mr-1" />
                {isEn ? 'Zalo Camera Scanner' : 'Máy Quét Mã QR Zalo'}
              </span>
              <span className="text-[10px] font-bold text-stone-500">
                {isEn ? 'Auto Audio Activation' : 'Tự động phát giọng đọc'}
              </span>
            </div>

            <button
              onClick={handleTriggerZaloCameraScan}
              disabled={isScanning}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-[#ff9600] hover:from-amber-600 hover:to-[#e68400] text-white font-black text-xs flex items-center justify-center space-x-2 shadow-md shadow-orange-500/30 active:scale-98 transition-all"
            >
              <Camera className="w-4 h-4 animate-bounce" />
              <span>{isScanning ? (isEn ? 'Opening Camera...' : 'Đang bật Camera...') : (isEn ? 'Scan QR Code Now' : 'Quét Mã QR Tại Điểm Đến')}</span>
            </button>

            {scanError && (
              <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 p-2 rounded-xl mt-2 border border-rose-200">
                ⚠️ {scanError}
              </p>
            )}
          </div>

          {/* KHI ĐÃ CÓ ĐIỂM ĐẾN ĐƯỢC CHỌN (TRÌNH CHIẾU AUDIO & THÔNG TIN) */}
          {selectedItem ? (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              {/* Thẻ Card Điểm Đến */}
              <div className="relative rounded-2xl overflow-hidden shadow-md border border-stone-200 bg-stone-900 h-44">
                <img
                  src={selectedItem.imageUrl}
                  alt={selectedItem.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                
                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-400 text-[10px] font-extrabold border border-amber-400/40">
                    {selectedItem.code}
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <h4 className="text-sm font-black drop-shadow-md leading-tight">
                    {selectedItem.title}
                  </h4>
                  <p className="text-[10px] text-amber-300 font-semibold drop-shadow mt-0.5">
                    {selectedItem.subTitle}
                  </p>
                  <p className="text-[10px] text-stone-300 flex items-center mt-1 truncate">
                    <MapPin className="w-3 h-3 mr-1 text-stone-400 shrink-0" />
                    <span className="truncate">{selectedItem.address}</span>
                  </p>
                </div>
              </div>

              {/* TRÌNH PHÁT AUDIO TOUR TOUR GUIDE PLAYER */}
              <div className="bg-stone-900 text-white rounded-2xl p-3.5 border border-stone-800 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Volume2 className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[11px] font-extrabold text-stone-200 block leading-tight">
                        {audioMode === 'voice' ? (isEn ? 'Voice Audio Tour' : 'Thuyết Minh Tự Động') : (isEn ? 'Highland Melody' : 'Âm Sắc Cồng Chiêng')}
                      </span>
                      <span className="text-[9px] text-stone-400">
                        {selectedItem.title}
                      </span>
                    </div>
                  </div>

                  {/* Nút chuyển chế độ Giọng đọc / Nhạc cụ */}
                  <div className="flex bg-stone-800 p-0.5 rounded-xl border border-stone-700 text-[9px] font-bold">
                    <button
                      onClick={() => setAudioMode('voice')}
                      className={`px-2 py-1 rounded-lg flex items-center space-x-1 transition-all ${audioMode === 'voice' ? 'bg-[#ff9600] text-white' : 'text-stone-400'}`}
                    >
                      <Mic className="w-2.5 h-2.5" />
                      <span>{isEn ? 'Voice' : 'Lời Bình'}</span>
                    </button>
                    <button
                      onClick={() => setAudioMode('music')}
                      className={`px-2 py-1 rounded-lg flex items-center space-x-1 transition-all ${audioMode === 'music' ? 'bg-[#ff9600] text-white' : 'text-stone-400'}`}
                    >
                      <Music className="w-2.5 h-2.5" />
                      <span>{isEn ? 'Music' : 'Nhạc'}</span>
                    </button>
                  </div>
                </div>

                {/* Sóng âm Equalizer & Nút Play/Pause */}
                <div className="flex items-center space-x-3 pt-1">
                  <button
                    onClick={togglePlayAudio}
                    className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-[#ff9600] hover:scale-105 active:scale-95 flex items-center justify-center text-white shadow-lg shadow-orange-500/40 shrink-0 transition-all"
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                  </button>

                  <div className="flex-1 space-y-1">
                    {/* Thanh Sóng Âm Equalizer mô phỏng */}
                    <div className="flex items-center space-x-1 h-5 overflow-hidden">
                      {[14, 22, 10, 28, 18, 25, 12, 20, 26, 16, 22, 12, 24, 18, 28, 14].map((h, i) => (
                        <span
                          key={i}
                          style={{ height: isPlaying ? `${h}px` : '4px' }}
                          className={`flex-1 rounded-full transition-all duration-300 ${isPlaying ? 'bg-gradient-to-t from-emerald-500 to-amber-400' : 'bg-stone-700'}`}
                        />
                      ))}
                    </div>

                    <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                      <span>{formatSeconds(currentTime)}</span>
                      <span>{duration > 0 ? formatSeconds(duration) : (selectedItem.duration || '03:00')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mô tả chi tiết điểm đến */}
              <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/90 text-xs text-stone-700 leading-relaxed">
                <h5 className="font-extrabold text-stone-900 text-xs mb-1 flex items-center">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1" />
                  {isEn ? 'Spot Overview' : 'Giới thiệu di tích & thắng cảnh'}
                </h5>
                <p>{selectedItem.desc}</p>
              </div>

              {/* Nút Hành Động Liên Kết VR360 & Chỉ Đường & In Mã QR */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenVRNode?.(selectedItem.vrNodeId || 'windfarm_node_1');
                  }}
                  className="py-2.5 px-3 rounded-xl bg-stone-900 text-amber-400 font-black text-xs flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Compass className="w-4 h-4" />
                  <span>{isEn ? 'Open VR 360°' : 'Mở Sa Bàn VR 360°'}</span>
                </button>

                <button
                  onClick={() => setShowPrintModal(true)}
                  className="py-2.5 px-3 rounded-xl bg-orange-50 text-[#ff9600] border border-orange-200 font-bold text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isEn ? 'View QR to Print' : 'Xem Mã QR In Bảng'}</span>
                </button>
              </div>
            </div>
          ) : null}

          {/* MỤC THỬ NGHIỆM NHANH (DEMO 1-CHẠM DÀNH CHO BÁO CÁO & THUYẾT TRÌNH) */}
          <div className="space-y-2 pt-1 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-stone-700 uppercase tracking-wider flex items-center">
                <Sparkles className="w-3 h-3 text-amber-500 mr-1" />
                {isEn ? 'Quick Demo Spots (1-Click)' : 'Mã QR Điểm Đến Tiêu Biểu (Bấm Thử Ngay)'}
              </span>
              <span className="text-[10px] text-stone-400">
                {DAKSONG_QR_GUIDE_LIST.length} {isEn ? 'spots' : 'địa điểm'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {DAKSONG_QR_GUIDE_LIST.map((item) => {
                const isCur = selectedItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-98 ${
                      isCur
                        ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-400/30'
                        : 'bg-white hover:bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-stone-100 border border-stone-200">
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-extrabold text-xs text-stone-900 truncate flex items-center">
                          {item.title}
                          {isCur && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-1 shrink-0" />}
                        </h5>
                        <p className="text-[10px] text-stone-500 truncate mt-0.5">
                          {item.subTitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 text-[#ff9600] font-black text-[11px]">
                      <span>{isCur ? (isEn ? 'Playing' : 'Đang phát') : (isEn ? 'Try' : 'Nghe')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* POPUP HIỂN THỊ MÃ QR CODE IN ẤN THỰC ĐỊA */}
      {showPrintModal && selectedItem && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full text-center space-y-3 border border-stone-200 shadow-2xl">
            <h4 className="font-black text-stone-900 text-sm">
              Mã QR Bảng Hiệu Thực Địa
            </h4>
            <p className="text-[11px] text-stone-500">
              In mã này và gắn tại <strong>{selectedItem.title}</strong> để du khách quét trực tiếp qua Zalo.
            </p>
            <div className="w-56 h-56 mx-auto p-2 bg-white rounded-2xl border-2 border-dashed border-orange-300 flex items-center justify-center shadow-inner">
              <img
                src={getPrintableQRCodeImageUrl(selectedItem)}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-[10px] font-mono text-stone-400">
              Code: {selectedItem.code} | DeepLink Zalo
            </p>
            <button
              onClick={() => setShowPrintModal(false)}
              className="w-full py-2 bg-stone-900 text-white rounded-xl text-xs font-bold active:scale-95"
            >
              Đóng lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

