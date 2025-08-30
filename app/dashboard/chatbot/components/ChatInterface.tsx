'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, ChatSession, Language } from '../page';

interface ChatInterfaceProps {
  messages: Message[];
  session: ChatSession | null;
  language: Language;
  isTyping: boolean;
  onSendMessage: (message: string) => void;
  onNewChat: () => void;
}

export function ChatInterface({
  messages,
  session,
  language,
  isTyping,
  onSendMessage,
  onNewChat
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && session?.isActive) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const quickQuestions = getQuickQuestions(language);

  return (
    <div className="flex flex-col h-96">
      {/* Quick Questions */}
      <div className="p-4 border-b bg-gray-50">
        <p className="text-sm text-gray-600 mb-2">{getQuickQuestionsLabel(language)}</p>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => session?.isActive && onSendMessage(question)}
              disabled={!session?.isActive}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : message.type === 'system'
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        {session?.isActive ? (
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={getInputPlaceholder(language)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!session?.isActive}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || !session?.isActive}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {getSendButtonText(language)}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-2">{getSessionEndedMessage(language)}</p>
            <button
              onClick={onNewChat}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              {getNewChatButtonText(language)}
            </button>
          </div>
        )}
        
        {session?.volunteerConnected && (
          <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-green-800 text-sm">
            {getVolunteerConnectedMessage(language)}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions for translations
function getQuickQuestions(language: Language): string[] {
  const questions = {
    en: [
      "How do I break a lease?",
      "What are my rights as a tenant?",
      "How much can landlord increase rent?",
      "What should I check before buying?",
      "How do security deposits work?"
    ],
    zh: [
      "如何终止租约？",
      "作为租户我有什么权利？",
      "房东可以涨多少租金？",
      "买房前应该检查什么？",
      "押金如何运作？"
    ],
    vi: [
      "Làm thế nào để hủy hợp đồng thuê?",
      "Quyền của tôi là gì với tư cách là người thuê?",
      "Chủ nhà có thể tăng giá thuê bao nhiêu?",
      "Tôi nên kiểm tra gì trước khi mua?",
      "Tiền đặt cọc hoạt động như thế nào?"
    ],
    ar: [
      "كيف يمكنني إنهاء عقد الإيجار؟",
      "ما هي حقوقي كمستأجر؟",
      "كم يمكن للمالك زيادة الإيجار؟",
      "ماذا يجب أن أتحقق منه قبل الشراء؟",
      "كيف تعمل الودائع الأمنية؟"
    ],
    hi: [
      "मैं पट्टा कैसे तोड़ूं?",
      "किरायेदार के रूप में मेरे क्या अधिकार हैं?",
      "मकान मालिक कितना किराया बढ़ा सकता है?",
      "खरीदने से पहले मुझे क्या जांचना चाहिए?",
      "सिक्योरिटी डिपॉजिट कैसे काम करता है?"
    ],
    id: [
      "Bagaimana cara membatalkan sewa?",
      "Apa hak saya sebagai penyewa?",
      "Berapa banyak pemilik dapat menaikkan sewa?",
      "Apa yang harus saya periksa sebelum membeli?",
      "Bagaimana cara kerja deposit keamanan?"
    ]
  };
  return questions[language] || questions.en;
}

function getQuickQuestionsLabel(language: Language): string {
  const labels = {
    en: "Quick questions:",
    zh: "快速问题：",
    vi: "Câu hỏi nhanh:",
    ar: "أسئلة سريعة:",
    hi: "त्वरित प्रश्न:",
    id: "Pertanyaan cepat:"
  };
  return labels[language];
}

function getInputPlaceholder(language: Language): string {
  const placeholders = {
    en: "Type your legal question here...",
    zh: "在这里输入您的法律问题...",
    vi: "Nhập câu hỏi pháp lý của bạn ở đây...",
    ar: "اكتب سؤالك القانوني هنا...",
    hi: "यहाँ अपना कानूनी प्रश्न टाइप करें...",
    id: "Ketik pertanyaan hukum Anda di sini..."
  };
  return placeholders[language];
}

function getSendButtonText(language: Language): string {
  const texts = {
    en: "Send",
    zh: "发送",
    vi: "Gửi",
    ar: "إرسال",
    hi: "भेजें",
    id: "Kirim"
  };
  return texts[language];
}

function getSessionEndedMessage(language: Language): string {
  const messages = {
    en: "Your session has ended. Start a new chat to continue.",
    zh: "您的会话已结束。开始新聊天以继续。",
    vi: "Phiên của bạn đã kết thúc. Bắt đầu cuộc trò chuyện mới để tiếp tục.",
    ar: "انتهت جلستك. ابدأ محادثة جديدة للمتابعة.",
    hi: "आपका सेशन समाप्त हो गया है। जारी रखने के लिए नई चैट शुरू करें।",
    id: "Sesi Anda telah berakhir. Mulai obrolan baru untuk melanjutkan."
  };
  return messages[language];
}

function getNewChatButtonText(language: Language): string {
  const texts = {
    en: "Start New Chat",
    zh: "开始新聊天",
    vi: "Bắt đầu Trò chuyện Mới",
    ar: "بدء محادثة جديدة",
    hi: "नई चैट शुरू करें",
    id: "Mulai Obrolan Baru"
  };
  return texts[language];
}

function getVolunteerConnectedMessage(language: Language): string {
  const messages = {
    en: "✅ Connected with legal volunteer - You can now ask specific questions",
    zh: "✅ 已连接法律志愿者 - 您现在可以询问具体问题",
    vi: "✅ Đã kết nối với tình nguyện viên pháp lý - Bây giờ bạn có thể đặt câu hỏi cụ thể",
    ar: "✅ متصل بمتطوع قانوني - يمكنك الآن طرح أسئلة محددة",
    hi: "✅ कानूनी स्वयंसेवक से जुड़े - अब आप विशिष्ट प्रश्न पूछ सकते हैं",
    id: "✅ Terhubung dengan relawan hukum - Sekarang Anda dapat mengajukan pertanyaan spesifik"
  };
  return messages[language];
}