'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { LanguageSelector } from './components/LanguageSelector';
import { VolunteerModal } from './components/VolunteerModal';
import { SessionTimer } from './components/SessionTimer';

export type Language = 'en' | 'zh' | 'vi' | 'ar' | 'hi' | 'id';
export type MessageType = 'user' | 'bot' | 'system';

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  language: Language;
}

export interface ChatSession {
  id: string;
  startTime: Date;
  lastActivity: Date; // Track last activity for inactivity timer
  isActive: boolean;
  volunteerConnected: boolean;
  language: Language;
}

export default function ChatBotPage() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Refs for inactivity timer
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<Date>(new Date());

  // Reset inactivity timer - called whenever user is active
  const resetInactivityTimer = useCallback(() => {
    const now = new Date();
    lastActivityRef.current = now;
    
    // Update session last activity
    if (session?.isActive) {
      setSession(prev => prev ? { ...prev, lastActivity: now } : null);
    }

    // Clear existing timeout
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }

    // Set new 15-minute inactivity timeout
    inactivityTimeoutRef.current = setTimeout(() => {
      endSessionDueToInactivity();
    }, 15 * 60 * 1000); // 15 minutes
  }, [session?.isActive]);

  // Initialize session
  useEffect(() => {
    startNewSession();
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, []);

  // Reset timer whenever there's activity
  useEffect(() => {
    if (session?.isActive) {
      resetInactivityTimer();
    }
  }, [session?.isActive, resetInactivityTimer]);

  const startNewSession = () => {
    const now = new Date();
    const newSession: ChatSession = {
      id: Date.now().toString(),
      startTime: now,
      lastActivity: now,
      isActive: true,
      volunteerConnected: false,
      language: currentLanguage,
    };

    setSession(newSession);
    lastActivityRef.current = now;
    
    setMessages([{
      id: Date.now().toString(),
      content: getWelcomeMessage(currentLanguage),
      type: 'bot',
      timestamp: now,
      language: currentLanguage,
    }]);

    // Start inactivity timer
    resetInactivityTimer();
  };

  const endSessionDueToInactivity = () => {
    if (session?.isActive) {
      setSession(prev => prev ? { ...prev, isActive: false, volunteerConnected: false } : null);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: getSessionExpiredMessage(currentLanguage),
        type: 'system',
        timestamp: new Date(),
        language: currentLanguage,
      }]);
    }
    
    // Clear the timeout ref
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }
  };

  const endSession = () => {
    endSessionDueToInactivity();
  };

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    if (session) {
      setSession(prev => prev ? { ...prev, language } : null);
    }
    // Language change counts as activity
    resetInactivityTimer();
  };

  const handleSendMessage = async (content: string) => {
    if (!session?.isActive) return;

    // Reset inactivity timer - user is active
    resetInactivityTimer();

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      type: 'user',
      timestamp: new Date(),
      language: currentLanguage,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse = getBotResponse(content, currentLanguage);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse.content,
        type: 'bot',
        timestamp: new Date(),
        language: currentLanguage,
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      // Show volunteer option if bot can't answer
      if (botResponse.showVolunteerOption) {
        setTimeout(() => {
          setShowVolunteerModal(true);
        }, 1000);
      }
    }, 1000 + Math.random() * 2000);
  };

  const handleConnectVolunteer = () => {
    if (session) {
      setSession(prev => prev ? { ...prev, volunteerConnected: true } : null);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: getVolunteerConnectMessage(currentLanguage),
        type: 'system',
        timestamp: new Date(),
        language: currentLanguage,
      }]);
    }
    setShowVolunteerModal(false);
    
    // Connecting to volunteer counts as activity
    resetInactivityTimer();
  };

  const handleNewChat = () => {
    setMessages([]);
    startNewSession();
  };

  // Handle user typing/interaction activity
  const handleUserActivity = () => {
    if (session?.isActive) {
      resetInactivityTimer();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold">
                  {getTitle(currentLanguage)}
                </h1>
                <p className="text-blue-100 text-sm">
                  {getSubtitle(currentLanguage)}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <LanguageSelector
                  currentLanguage={currentLanguage}
                  onLanguageChange={handleLanguageChange}
                />
                {session && (
                  <SessionTimer
                    session={session}
                    language={currentLanguage}
                    onSessionEnd={endSession}
                    lastActivityRef={lastActivityRef}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <ChatInterface
            messages={messages}
            session={session}
            language={currentLanguage}
            isTyping={isTyping}
            onSendMessage={handleSendMessage}
            onNewChat={handleNewChat}
            onUserActivity={handleUserActivity}
          />
        </div>
      </div>

      {/* Volunteer Modal */}
      {showVolunteerModal && (
        <VolunteerModal
          language={currentLanguage}
          onConnect={handleConnectVolunteer}
          onClose={() => {
            setShowVolunteerModal(false);
            resetInactivityTimer(); // Closing modal counts as activity
          }}
        />
      )}
    </div>
  );
}

// Helper functions for translations and bot logic
function getWelcomeMessage(language: Language): string {
  const messages = {
    en: "Hello! I'm here to help with legal questions about renting and buying houses. How can I assist you today?",
    zh: "您好！我在这里帮助您解答有关租房和买房的法律问题。今天我可以为您提供什么帮助？",
    vi: "Xin chào! Tôi ở đây để giúp bạn giải đáp các câu hỏi pháp lý về thuê và mua nhà. Hôm nay tôi có thể hỗ trợ bạn điều gì?",
    ar: "مرحباً! أنا هنا لمساعدتك في الأسئلة القانونية حول استئجار وشراء المنازل. كيف يمكنني مساعدتك اليوم؟",
    hi: "नमस्ते! मैं घर किराए पर लेने और खरीदने के बारे में कानूनी सवालों में आपकी मदद के लिए यहाँ हूँ। आज मैं आपकी कैसे सहायता कर सकता हूँ?",
    id: "Halo! Saya di sini untuk membantu pertanyaan hukum tentang menyewa dan membeli rumah. Bagaimana saya bisa membantu Anda hari ini?"
  };
  return messages[language];
}

function getSessionExpiredMessage(language: Language): string {
  const messages = {
    en: "Your chat session has expired due to 15 minutes of inactivity. Please start a new chat to continue.",
    zh: "您的聊天会话因15分钟无活动而过期。请开始新的聊天以继续。",
    vi: "Phiên trò chuyện của bạn đã hết hạn do không hoạt động trong 15 phút. Vui lòng bắt đầu cuộc trò chuyện mới để tiếp tục.",
    ar: "انتهت صلاحية جلسة الدردشة بسبب عدم النشاط لمدة 15 دقيقة. يرجى بدء محادثة جديدة للمتابعة.",
    hi: "निष्क्रियता के 15 मिनट के कारण आपका चैट सेशन समाप्त हो गया है। जारी रखने के लिए कृपया नई चैट शुरू करें।",
    id: "Sesi obrolan Anda telah berakhir karena tidak aktif selama 15 menit. Silakan mulai obrolan baru untuk melanjutkan."
  };
  return messages[language];
}

function getVolunteerConnectMessage(language: Language): string {
  const messages = {
    en: "Connecting you with a legal volunteer... Please wait a moment.",
    zh: "正在为您连接法律志愿者...请稍候。",
    vi: "Đang kết nối bạn với tình nguyện viên pháp lý... Vui lòng đợi một chút.",
    ar: "جاري ربطك بمتطوع قانوني... يرجى الانتظار لحظة.",
    hi: "आपको एक कानूनी स्वयंसेवक से जोड़ा जा रहा है... कृपया एक क्षण प्रतीक्षा करें।",
    id: "Menghubungkan Anda dengan relawan hukum... Mohon tunggu sebentar."
  };
  return messages[language];
}

function getTitle(language: Language): string {
  const titles = {
    en: "Legal Housing Assistant",
    zh: "法律住房助手",
    vi: "Trợ lý Pháp lý Nhà ở",
    ar: "مساعد الإسكان القانوني",
    hi: "कानूनी आवास सहायक",
    id: "Asisten Hukum Perumahan"
  };
  return titles[language];
}

function getSubtitle(language: Language): string {
  const subtitles = {
    en: "Get help with renting and buying property",
    zh: "获得租房和买房帮助",
    vi: "Nhận trợ giúp về thuê và mua bất động sản",
    ar: "احصل على المساعدة في استئجار وشراء العقارات",
    hi: "संपत्ति किराए पर लेने और खरीदने में सहायता प्राप्त करें",
    id: "Dapatkan bantuan untuk menyewa dan membeli properti"
  };
  return subtitles[language];
}

function getBotResponse(userMessage: string, language: Language): { content: string; showVolunteerOption: boolean } {
  // Simple FAQ matching logic
  const lowerMessage = userMessage.toLowerCase();
  
  // FAQ responses by language
  const faqs = getFAQs(language);
  
  for (const faq of faqs) {
    if (faq.keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
      return { content: faq.answer, showVolunteerOption: false };
    }
  }
  
  // If no FAQ matches, suggest volunteer
  const noAnswerMessages = {
    en: "I'm sorry, I don't have specific information about that. Would you like to connect with a legal volunteer who can provide personalized assistance?",
    zh: "抱歉，我没有关于那个的具体信息。您想要联系法律志愿者获得个性化帮助吗？",
    vi: "Xin lỗi, tôi không có thông tin cụ thể về điều đó. Bạn có muốn kết nối với tình nguyện viên pháp lý để được hỗ trợ cá nhân không?",
    ar: "أعتذر، ليس لدي معلومات محددة حول ذلك. هل تود التواصل مع متطوع قانوني يمكنه تقديم المساعدة الشخصية؟",
    hi: "खुशी है, मेरे पास इसके बारे में विशिष्ट जानकारी नहीं है। क्या आप एक कानूनी स्वयंसेवक से जुड़ना चाहेंगे जो व्यक्तिगत सहायता प्रदान कर सकते हैं?",
    id: "Maaf, saya tidak memiliki informasi spesifik tentang itu. Apakah Anda ingin terhubung dengan relawan hukum yang dapat memberikan bantuan personal?"
  };
  
  return { 
    content: noAnswerMessages[language], 
    showVolunteerOption: true 
  };
}

function getFAQs(language: Language) {
  const faqsByLanguage = {
    en: [
      {
        keywords: ["rent", "rental", "lease", "tenant", "landlord"],
        answer: "For rental issues: Always read your lease agreement carefully. Landlords must provide 24-hour notice before entering. You have rights regarding deposits, repairs, and habitability."
      },
      {
        keywords: ["buy", "buying", "purchase", "mortgage", "down payment"],
        answer: "For buying property: Get a home inspection, review all contracts carefully, understand your financing options, and consider hiring a real estate attorney for complex transactions."
      },
      {
        keywords: ["deposit", "security deposit", "refund"],
        answer: "Security deposits must be returned within 30 days in most jurisdictions. Landlords can only deduct for damages beyond normal wear and tear. Always document the property's condition."
      },
      {
        keywords: ["eviction", "evict", "notice"],
        answer: "Eviction procedures vary by location but typically require proper written notice and legal grounds. Tenants have rights to contest evictions in court."
      },
      {
        keywords: ["repairs", "maintenance", "habitability"],
        answer: "Landlords are generally responsible for major repairs and maintaining habitability. Tenants should report issues in writing and keep records of all communications."
      }
    ],
    zh: [
      {
        keywords: ["租", "租赁", "租户", "房东"],
        answer: "租赁问题：仔细阅读租赁协议。房东进入前必须提前24小时通知。您在押金、维修和适居性方面享有权利。"
      },
      {
        keywords: ["买", "购买", "抵押", "首付"],
        answer: "购买房产：进行房屋检查，仔细审查所有合同，了解融资选择，对于复杂交易考虑聘请房地产律师。"
      },
      {
        keywords: ["押金", "保证金", "退还"],
        answer: "大多数司法管辖区内押金必须在30天内退还。房东只能扣除超出正常磨损的损害费用。务必记录房产状况。"
      }
    ],
    vi: [
      {
        keywords: ["thuê", "cho thuê", "người thuê", "chủ nhà"],
        answer: "Vấn đề cho thuê: Luôn đọc kỹ hợp đồng thuê. Chủ nhà phải thông báo trước 24 giờ trước khi vào. Bạn có quyền về tiền đặt cọc, sửa chữa và điều kiện sống."
      },
      {
        keywords: ["mua", "mua bán", "thế chấp", "tiền trả trước"],
        answer: "Mua bất động sản: Kiểm tra nhà, xem xét tất cả hợp đồng cẩn thận, hiểu các lựa chọn tài chính, và cân nhắc thuê luật sư bất động sản cho giao dịch phức tạp."
      }
    ],
    ar: [
      {
        keywords: ["إيجار", "استئجار", "مستأجر", "مالك"],
        answer: "لقضايا الإيجار: اقرأ اتفاقية الإيجار بعناية دائماً. يجب على المالكين إعطاء إشعار 24 ساعة قبل الدخول. لديك حقوق بشأن الودائع والإصلاحات والصالحية للسكن."
      },
      {
        keywords: ["شراء", "شراء", "رهن عقاري", "دفعة أولى"],
        answer: "لشراء العقارات: احصل على فحص للمنزل، راجع جميع العقود بعناية، فهم خيارات التمويل، واعتبر تعيين محامي عقارات للمعاملات المعقدة."
      }
    ],
    hi: [
      {
        keywords: ["किराया", "किराए पर", "किरायेदार", "मकान मालिक"],
        answer: "किराये की समस्याओं के लिए: हमेशा अपना पट्टा समझौता ध्यान से पढ़ें। मकान मालिकों को प्रवेश से पहले 24 घंटे की सूचना देनी चाहिए। आपके पास जमा, मरम्मत और रहने योग्यता के संबंध में अधिकार हैं।"
      },
      {
        keywords: ["खरीदना", "खरीद", "बंधक", "डाउन पेमेंट"],
        answer: "संपत्ति खरीदने के लिए: घर का निरीक्षण कराएं, सभी अनुबंधों की सावधानीपूर्वक समीक्षा करें, अपने वित्तपोषण विकल्पों को समझें, और जटिल लेनदेन के लिए रियल एस्टेट वकील काम पर रखने पर विचार करें।"
      }
    ],
    id: [
      {
        keywords: ["sewa", "menyewa", "penyewa", "pemilik"],
        answer: "Untuk masalah sewa: Selalu baca perjanjian sewa dengan hati-hati. Pemilik harus memberikan pemberitahuan 24 jam sebelum masuk. Anda memiliki hak mengenai deposit, perbaikan, dan kelayakan huni."
      },
      {
        keywords: ["beli", "membeli", "hipotek", "uang muka"],
        answer: "Untuk membeli properti: Lakukan inspeksi rumah, tinjau semua kontrak dengan hati-hati, pahami opsi pembiayaan Anda, dan pertimbangkan menyewa pengacara real estat untuk transaksi kompleks."
      }
    ]
  };
  
  return faqsByLanguage[language] || faqsByLanguage.en;
}