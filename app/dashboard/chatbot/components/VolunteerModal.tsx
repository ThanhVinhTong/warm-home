'use client';

import { Language } from '../page';

interface VolunteerModalProps {
  language: Language;
  onConnect: () => void;
  onClose: () => void;
}

export function VolunteerModal({ language, onConnect, onClose }: VolunteerModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-mx-4">
        <h3 className="text-lg font-bold mb-4">
          {getModalTitle(language)}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {getModalDescription(language)}
        </p>

        <div className="flex space-x-3">
          <button
            onClick={onConnect}
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
          >
            {getConnectButtonText(language)}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
          >
            {getCancelButtonText(language)}
          </button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-blue-800">
          {getDisclaimerText(language)}
        </div>
      </div>
    </div>
  );
}

function getModalTitle(language: Language): string {
  const titles = {
    en: "Connect with Legal Volunteer",
    zh: "联系法律志愿者",
    vi: "Kết nối với Tình nguyện viên Pháp lý",
    ar: "التواصل مع متطوع قانوني",
    hi: "कानूनी स्वयंसेवक से जुड़ें",
    id: "Hubungkan dengan Relawan Hukum"
  };
  return titles[language];
}

function getModalDescription(language: Language): string {
  const descriptions = {
    en: "Our legal volunteers can provide personalized advice for your specific situation. Would you like to be connected with one now?",
    zh: "我们的法律志愿者可以为您的具体情况提供个性化建议。您想现在联系一位吗？",
    vi: "Các tình nguyện viên pháp lý của chúng tôi có thể cung cấp lời khuyên cá nhân cho tình huống cụ thể của bạn. Bạn có muốn được kết nối với một người ngay bây giờ không?",
    ar: "يمكن لمتطوعينا القانونيين تقديم نصائح شخصية لحالتك المحددة. هل تود أن تتواصل مع أحدهم الآن؟",
    hi: "हमारे कानूनी स्वयंसेवक आपकी विशिष्ट स्थिति के लिए व्यक्तिगत सलाह प्रदान कर सकते हैं। क्या आप अभी किसी एक से जुड़ना चाहेंगे?",
    id: "Relawan hukum kami dapat memberikan saran personal untuk situasi spesifik Anda. Apakah Anda ingin terhubung dengan salah satu sekarang?"
  };
  return descriptions[language];
}

function getConnectButtonText(language: Language): string {
  const texts = {
    en: "Yes, Connect Me",
    zh: "是的，联系我",
    vi: "Có, Kết nối tôi",
    ar: "نعم، اربطني",
    hi: "हाँ, मुझे जोड़ें",
    id: "Ya, Hubungkan Saya"
  };
  return texts[language];
}

function getCancelButtonText(language: Language): string {
  const texts = {
    en: "Maybe Later",
    zh: "以后再说",
    vi: "Có thể sau",
    ar: "ربما لاحقاً",
    hi: "शायद बाद में",
    id: "Mungkin Nanti"
  };
  return texts[language];
}

function getDisclaimerText(language: Language): string {
  const texts = {
    en: "💡 Note: This is general information only and not formal legal advice. Consult a qualified attorney for legal matters.",
    zh: "💡 注意：这仅为一般信息，不构成正式法律建议。法律事务请咨询合格律师。",
    vi: "💡 Lưu ý: Đây chỉ là thông tin chung và không phải lời khuyên pháp lý chính thức. Hãy tham khảo luật sư có trình độ cho các vấn đề pháp lý.",
    ar: "💡 ملاحظة: هذه معلومات عامة فقط وليست استشارة قانونية رسمية. استشر محامياً مؤهلاً للمسائل القانونية.",
    hi: "💡 नोट: यह केवल सामान्य जानकारी है और औपचारिक कानूनी सलाह नहीं है। कानूनी मामलों के लिए योग्य वकील से सलाह लें।",
    id: "💡 Catatan: Ini hanya informasi umum dan bukan nasihat hukum formal. Konsultasikan dengan pengacara yang berkualitas untuk masalah hukum."
  };
  return texts[language];
}