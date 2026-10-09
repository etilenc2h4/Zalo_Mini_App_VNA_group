import React from 'react';
import { ArrowLeft, ShieldAlert, Phone } from 'lucide-react';
import { EMERGENCY_CONTACTS } from '../../data/mockData';
import { makePhoneCall } from '../../services/zalo';

interface EmergencySOSViewProps {
  language: 'vi' | 'en';
  onBack: () => void;
}

export const EmergencySOSView: React.FC<EmergencySOSViewProps> = ({
  language,
  onBack
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 pb-1">
        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-[#ff9600] text-xs font-bold flex items-center shadow-sm active:scale-95 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          {language === 'en' ? 'Back' : 'Quay lại'}
        </button>
        <h3 className="text-sm font-black text-stone-900">
          {language === 'en' ? 'Emergency SOS Rescue' : 'Cứu Hộ Khẩn Cấp SOS'}
        </h3>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-start space-x-2.5">
        <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="text-xs text-red-900">
          <span className="font-bold block">
            {language === 'en' ? 'Emergency Rescue Call Center' : 'Tổng đài cứu hộ khẩn cấp'}
          </span>
          {language === 'en'
            ? 'Save the phone numbers below to contact immediately if any incident occurs in Dak Song.'
            : 'Lưu lại các số điện thoại dưới đây để liên hệ ngay khi gặp sự cố trên hành trình tại Đắk Song.'}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {EMERGENCY_CONTACTS.map((contact, index) => {
          const cleanPhone = contact.phone.replace(/\s+/g, '');
          const isCommittee = cleanPhone.includes('3781122');
          const isPolice = cleanPhone.includes('3781113');
          const isMedical = cleanPhone.includes('3781234');

          const displayTitle = language === 'en'
            ? (isCommittee ? 'Dak Song District People’s Committee' : isPolice ? 'Dak Song District Police' : isMedical ? 'Dak Song District Medical Center' : contact.title)
            : contact.title;

          const displayDesc = language === 'en'
            ? (isCommittee ? 'Dak Song District state administrative agency' : isPolice ? 'Security, public order & emergency assistance' : isMedical ? 'Emergency medical care & visitor health support' : contact.desc)
            : contact.desc;

          return (
            <div
              key={contact.phone + index}
              className="bg-white rounded-2xl p-3.5 border border-stone-200 shadow-sm flex items-center justify-between"
            >
              <div>
                <h4 className="font-black text-stone-900 text-xs sm:text-sm">
                  {displayTitle}
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  {displayDesc}
                </p>
                <span className="font-mono font-bold text-red-600 text-xs block mt-1">
                  {contact.phone}
                </span>
              </div>

              <button
                onClick={() => makePhoneCall(contact.phone)}
                className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold flex items-center shadow-md shadow-red-600/20 transition-all shrink-0 ml-2"
              >
                <Phone className="w-3.5 h-3.5 mr-1 fill-current" />
                {language === 'en' ? 'Call now' : 'Gọi ngay'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

