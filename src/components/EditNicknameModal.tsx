import React, { useState } from 'react';
import { X, Pencil, Check } from 'lucide-react';

interface EditNicknameModalProps {
  isOpen: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (newName: string) => void;
  language?: 'vi' | 'en';
}

export const EditNicknameModal: React.FC<EditNicknameModalProps> = ({
  isOpen,
  currentName,
  onClose,
  onSave,
  language = 'vi'
}) => {
  const isEn = language === 'en';
  const [name, setName] = useState(currentName);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-xs bg-white rounded-3xl p-5 shadow-2xl z-10 space-y-4 border border-stone-200 animate-scaleUp">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#ff9600] flex items-center justify-center">
              <Pencil className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm text-stone-900">
              {isEn ? 'Change Display Name' : 'Đổi Tên Hiển Thị'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-100 text-stone-400 hover:text-stone-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-stone-500 mb-1 block">
              {isEn ? 'Visitor name or nickname:' : 'Tên hoặc biệt danh du khách:'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isEn ? 'Enter display name...' : 'Nhập tên hiển thị...'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#ff9600] focus:border-transparent font-medium"
              autoFocus
              maxLength={30}
            />
          </div>

          <div className="flex space-x-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl text-xs font-bold bg-stone-100 text-stone-600 hover:bg-stone-200"
            >
              {isEn ? 'Cancel' : 'Hủy'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-[#ff9600] text-white shadow-md shadow-orange-500/20 hover:opacity-95 flex items-center justify-center space-x-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isEn ? 'Save' : 'Lưu'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

