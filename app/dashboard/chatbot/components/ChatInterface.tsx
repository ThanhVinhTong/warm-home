'use client';

import { useState, useRef, useEffect } from 'react';
import { Message, ChatSession, Language } from '../page';

interface ChatInterfaceProps {
  messages: Message[];
  session: ChatSession | null;
  language: Language;
  isTyping: boolean;
  pendingFeedback: string | null;
  onSendMessage: (message: string) => void;
  onNewChat: () => void;
  onUserActivity: () => void;
  onFeedback: (isHelpful: boolean, questionId: string) => void;
}

export function ChatInterface({
  messages,
  session,
  language,
  isTyping,
  pendingFeedback,
  onSendMessage,
  onNewChat,
  onUserActivity,
  onFeedback
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, displayedText]);

  // Debug logging for messages
  useEffect(() => {
    console.log('Messages updated in ChatInterface:', messages);
    console.log('Messages length:', messages.length);
    if (messages.length > 0) {
      console.log('Last message:', messages[messages.length - 1]);
    }
  }, [messages]);

  // Streaming text effect for bot messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.type === 'bot' && lastMessage.id !== streamingMessageId) {
      setStreamingMessageId(lastMessage.id);
      setDisplayedText('');
      
      const fullText = lastMessage.content;
      let currentIndex = 0;
      
      const streamInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setDisplayedText(fullText.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(streamInterval);
          setStreamingMessageId(null);
        }
      }, 25); // Slightly faster streaming
      
      return () => clearInterval(streamInterval);
    }
  }, [messages, streamingMessageId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && session?.isActive) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    onUserActivity();
  };

  const handleQuickQuestion = (question: string) => {
    if (session?.isActive) {
      onUserActivity();
      onSendMessage(question);
    }
  };

  const handleFeedbackClick = (isHelpful: boolean, questionId: string) => {
    onUserActivity();
    onFeedback(isHelpful, questionId);
    // Add to feedback given set to hide buttons
    setFeedbackGiven(prev => new Set(prev).add(questionId));
  };

  const handleConnectVolunteer = () => {
    onUserActivity();
    // Trigger volunteer modal
    const event = new CustomEvent('requestVolunteer');
    window.dispatchEvent(event);
  };

  const formatMessage = (content: string) => {
    // Enhanced formatting for better readability
    return content
      .split('\n')
      .map((paragraph, index) => {
        if (paragraph.trim() === '') return null;
        
        // Handle headers with **text**
        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
          return (
            <h4 key={index} className="font-bold text-gray-800 mt-3 mb-2">
              {paragraph.replace(/\*\*/g, '')}
            </h4>
          );
        }
        
        // Handle numbered lists
        if (paragraph.match(/^\d+\./)) {
          return (
            <div key={index} className="ml-4 mb-2">
              <span className="font-semibold text-blue-600">{paragraph}</span>
            </div>
          );
        }
        
        // Handle bullet points
        if (paragraph.startsWith('•') || paragraph.startsWith('-')) {
          return (
            <div key={index} className="ml-4 mb-1 flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span>{paragraph.substring(1).trim()}</span>
            </div>
          );
        }
        
        // Handle disclaimers and important sections
        if (paragraph.toLowerCase().includes('disclaimer') || paragraph.startsWith('---')) {
          return (
            <div key={index} className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm italic text-gray-600">
              {paragraph.replace(/^---\s*/, '')}
            </div>
          );
        }
        
        // Handle bold text within paragraphs
        const formattedParagraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Regular paragraphs
        return (
          <p key={index} className="mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedParagraph }} />
        );
      })
      .filter(Boolean);
  };

  const quickQuestions = getSmartQuickQuestions(language);

  return (
    <div className="flex flex-col h-128 md:h-128 border rounded-lg shadow-lg bg-white">
      {/* Enhanced Quick Questions */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <p className="text-sm text-gray-600 mb-2 flex items-center">
          <span className="mr-2">🚀</span>
          {getQuickQuestionsLabel(language)}
        </p>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              disabled={!session?.isActive}
              className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 rounded-full text-xs hover:from-blue-200 hover:to-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-blue-200 hover:shadow-sm"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Messages with Enhanced Formatting */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onScroll={onUserActivity}
        onMouseMove={onUserActivity}
      >
       {messages.map((message, messageIndex) => (
          <div key={`${message.id}-${messageIndex}`}>
            <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                  message.type === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs">{message.timestamp.toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Enhanced typing indicator with animated dots */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 px-4 py-3 rounded-lg flex items-center space-x-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <div className="text-sm">
                <span className="font-medium text-blue-600">AI analyzing</span>
                <span className="text-gray-500 ml-1">your housing question...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Area */}
      <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-blue-50">
        {session?.isActive ? (
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={handleInputChange}
                onFocus={onUserActivity}
                onBlur={onUserActivity}
                placeholder={getInputPlaceholder(language)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                disabled={!session?.isActive}
              />
              {inputMessage && (
                <div className="absolute right-3 top-3 text-gray-400">
                  <span className="text-xs">{inputMessage.length}</span>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || !session?.isActive}
              onClick={onUserActivity}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <span>✨</span>
              <span>{getSendButtonText(language)}</span>
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-3">{getSessionEndedMessage(language)}</p>
            <button
              onClick={onNewChat}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2 mx-auto"
            >
              <span>🚀</span>
              <span>{getNewChatButtonText(language)}</span>
            </button>
          </div>
        )}
        
        {session?.volunteerConnected && (
          <div className="mt-3 p-3 bg-gradient-to-r from-green-100 to-green-200 border border-green-300 rounded-xl text-green-800 text-sm flex items-center shadow-sm">
            <span className="mr-2">✅</span>
            {getVolunteerConnectedMessage(language)}
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced helper functions
function getSmartQuickQuestions(language: Language): string[] {
  const questions: Partial<Record<Language, string[]>> = {
    en: [
      "My landlord won't return my security deposit",
      "Can I break my lease early without penalty?",
      "What are my rights for urgent repairs?",
      "Is my rent increase legal?",
      "How do I handle an eviction notice?",
      "What should I check before buying a house?"
    ],
    zh: [
      "房东不退还我的押金",
      "我可以提前终止租约而不受罚吗？",
      "我对紧急维修有什么权利？",
      "我的租金上涨合法吗？",
      "我如何处理驱逐通知？",
      "买房前我应该检查什么？"
    ],
    vi: [
      "Chủ nhà không trả lại tiền đặt cọc",
      "Tôi có thể chấm dứt hợp đồng sớm không?",
      "Quyền sửa chữa khẩn cấp của tôi là gì?",
      "Việc tăng tiền thuê có hợp pháp không?",
      "Làm thế nào để xử lý thông báo đuổi khách?",
      "Tôi nên kiểm tra gì trước khi mua nhà?"
    ],
    ar: [
      "المالك لا يرد الوديعة الأمنية",
      "هل يمكنني إنهاء الإيجار مبكراً بدون غرامة؟",
      "ما هي حقوقي للإصلاحات العاجلة؟",
      "هل زيادة الإيجار قانونية؟",
      "كيف أتعامل مع إشعار الإخلاء؟",
      "ماذا يجب أن أفحص قبل شراء منزل؟"
    ],
    hi: [
      "मेरा मकान मालिक सिक्योरिटी डिपॉजिट वापस नहीं कर रहा",
      "क्या मैं जुर्माने के बिना पट्टा तोड़ सकता हूँ?",
      "तत्काल मरम्मत के लिए मेरे अधिकार क्या हैं?",
      "क्या किराया बढ़ाना कानूनी है?",
      "बेदखली नोटिस को कैसे संभालूं?",
      "घर खरीदने से पहले मुझे क्या जांचना चाहिए?"
    ],
    id: [
      "Pemilik tidak mengembalikan deposit keamanan",
      "Bisakah saya mengakhiri sewa lebih awal tanpa denda?",
      "Apa hak saya untuk perbaikan mendesak?",
      "Apakah kenaikan sewa legal?",
      "Bagaimana menangani pemberitahuan pengusiran?",
      "Apa yang harus saya periksa sebelum membeli rumah?"
    ]
  };
  return questions[language] || questions.en!;
}

function getQuickQuestionsLabel(language: Language): string {
  const labels: Partial<Record<Language, string>> = {
    en: "Try these AI-powered housing questions:",
    zh: "尝试这些AI驱动的住房问题：",
    vi: "Thử những câu hỏi về nhà ở được hỗ trợ bởi AI:",
    ar: "جرب هذه الأسئلة السكنية المدعومة بالذكاء الاصطناعي:",
    hi: "इन AI-संचालित आवास प्रश्नों को आज़माएं:",
    id: "Coba pertanyaan perumahan bertenaga AI ini:"
  };
  return labels[language] || labels.en!;
}

function getActionIndicatorText(language: Language): string {
  const texts: Partial<Record<Language, string>> = {
    en: "Actionable steps provided",
    zh: "提供可行步骤",
    vi: "Các bước hành động được cung cấp",
    ar: "تم توفير خطوات قابلة للتنفيذ",
    hi: "कार्यान्वयन योग्य कदम प्रदान किए गए",
    id: "Langkah tindakan disediakan"
  };
  return texts[language] || texts.en!;
}

function getYesButtonText(language: Language): string {
  const texts: Partial<Record<Language, string>> = {
    en: "Yes, helpful",
    zh: "是的，有帮助",
    vi: "Có, hữu ích",
    ar: "نعم، مفيد",
    hi: "हाँ, सहायक",
    id: "Ya, membantu"
  };
  return texts[language] || texts.en!;
}

function getNoButtonText(language: Language): string {
  const texts: Partial<Record<Language, string>> = {
    en: "Need more help",
    zh: "需要更多帮助",
    vi: "Cần thêm trợ giúp",
    ar: "أحتاج مساعدة أكثر",
    hi: "अधिक सहायता चाहिए",
    id: "Butuh bantuan lebih"
  };
  return texts[language] || texts.en!;
}

function getConnectVolunteerText(language: Language): string {
  const texts: Partial<Record<Language, string>> = {
    en: "Connect with volunteer",
    zh: "联系志愿者",
    vi: "Kết nối với tình nguyện viên",
    ar: "اتصل بمتطوع",
    hi: "स्वयंसेवक से जुड़ें",
    id: "Hubungi relawan"
  };
  return texts[language] || texts.en!;
}

function getThankYouForFeedbackText(language: Language): string {
  const texts: Partial<Record<Language, string>> = {
    en: "Thank you for your feedback!",
    zh: "感谢您的反馈！",
    vi: "Cảm ơn phản hồi của bạn!",
    ar: "شكراً لك على ملاحظاتك!",
    hi: "आपकी प्रतिक्रिया के लिए धन्यवाद!",
    id: "Terima kasih atas masukan Anda!"
  };
  return texts[language] || texts.en!;
}

function getInputPlaceholder(language: Language): string {
  const placeholders: Partial<Record<Language, string>> = {
    en: "Ask about housing law, tenant rights, property issues... (AI-powered)",
    zh: "询问住房法律、租户权利、房产问题...（AI驱动）",
    vi: "Hỏi về luật nhà ở, quyền người thuê, vấn đề bất động sản... (Hỗ trợ AI)",
    ar: "اسأل عن قانون الإسكان، حقوق المستأجرين، قضايا العقارات... (مدعوم بالذكاء الاصطناعي)",
    hi: "आवास कानून, किरायेदार अधिकार, संपत्ति के मुद्दों के बारे में पूछें... (AI-संचालित)",
    id: "Tanyakan tentang hukum perumahan, hak penyewa, masalah properti... (Bertenaga AI)"
  };
  return placeholders[language] || placeholders.en!;
}

function getSendButtonText(language: Language): string {
  const texts: Partial<Record<Language, string>> = {
    en: "Ask AI",
    zh: "询问AI",
    vi: "Hỏi AI",
    ar: "اسأل الذكاء الاصطناعي",
    hi: "AI से पूछें",
    id: "Tanya AI"
  };
  return texts[language] || texts.en!;
}

function getSessionEndedMessage(language: Language): string {
  const messages: Partial<Record<Language, string>> = {
    en: "Your AI session has ended due to inactivity. Start a new chat to continue with intelligent assistance.",
    zh: "您的AI会话因无活动而结束。开始新聊天以继续获得智能协助。",
    vi: "Phiên AI của bạn đã kết thúc do không hoạt động. Bắt đầu cuộc trò chuyện mới để tiếp tục với hỗ trợ thông minh.",
    ar: "انتهت جلسة الذكاء الاصطناعي بسبب عدم النشاط. ابدأ محادثة جديدة للمتابعة بمساعدة ذكية.",
    hi: "निष्क्रियता के कारण आपका AI सेशन समाप्त हो गया है। बुद्धिमान सहायता जारी रखने के लिए नई चैट शुरू करें।",
    id: "Sesi AI Anda telah berakhir karena tidak aktif. Mulai obrolan baru untuk melanjutkan dengan bantuan cerdas."
  };
  return messages[language] || messages.en!;
}

function getNewChatButtonText(language: Language): string {
  const texts: Partial<Record<Language, string>> = {
    en: "Start New AI Chat",
    zh: "开始新的AI聊天",
    vi: "Bắt đầu Trò chuyện AI Mới",
    ar: "ابدأ محادثة ذكية جديدة",
    hi: "नई AI चैट शुरू करें",
    id: "Mulai Obrolan AI Baru"
  };
  return texts[language] || texts.en!;
}

function getVolunteerConnectedMessage(language: Language): string {
  const messages: Partial<Record<Language, string>> = {
    en: "Connected with legal volunteer - AI context shared for enhanced assistance",
    zh: "已连接法律志愿者 - AI上下文已共享以提供增强帮助",
    vi: "Đã kết nối với tình nguyện viên pháp lý - Ngữ cảnh AI được chia sẻ để hỗ trợ tốt hơn",
    ar: "متصل بمتطوع قانوني - تم مشاركة سياق الذكاء الاصطناعي للمساعدة المحسنة",
    hi: "कानूनी स्वयंसेवक से जुड़े - बेहतर सहायता के लिए AI संदर्भ साझा किया गया",
    id: "Terhubung dengan relawan hukum - Konteks AI dibagikan untuk bantuan yang ditingkatkan"
  };
  return messages[language] || messages.en!;
}