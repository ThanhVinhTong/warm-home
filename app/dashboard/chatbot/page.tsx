'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatInterface } from './components/ChatInterface';
import { LanguageSelector } from './components/LanguageSelector';
import { VolunteerModal } from './components/VolunteerModal';
import { SessionTimer } from './components/SessionTimer';
import { LegalHousingAI } from '@/app/lib/ai-service';

export type Language = 'en' | 'zh' | 'vi' | 'ar' | 'hi' | 'id';
export type MessageType = 'user' | 'bot' | 'system' | 'feedback';
export type UserRole = 'tenant' | 'landlord' | 'buyer' | 'seller' | 'unknown';
export type IssueType = 'deposit' | 'repairs' | 'eviction' | 'lease_break' | 'rent_increase' | 'buying_process' | 'inspection' | 'contract' | 'unknown';

export interface UserContext {
  role: UserRole;
  issueType: IssueType;
  location?: string;
  urgency: 'low' | 'medium' | 'high';
  specificDetails: string[];
  conversationHistory: string[];
}

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  language: Language;
  questionId?: string;
  isHelpful?: boolean;
  confidence?: 'high' | 'medium' | 'low';
  hasActions?: boolean;
}

export interface ChatSession {
  id: string;
  startTime: Date;
  lastActivity: Date;
  isActive: boolean;
  volunteerConnected: boolean;
  language: Language;
  questionAttempts: { [questionId: string]: number };
  userContext: UserContext;
}

export default function ChatBotPage() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [pendingFeedback, setPendingFeedback] = useState<string | null>(null);
  
  // Initialize AI service
  const [aiService] = useState(() => new LegalHousingAI());
  
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<Date>(new Date());
  const messagesRef = useRef<Message[]>([]);

  // Update ref whenever messages change
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Debug: Monitor messages changes
  useEffect(() => {
    console.log('Messages state changed:', messages);
    console.log('Messages length:', messages.length);
    if (messages.length > 0) {
      console.log('Last message:', messages[messages.length - 1].content);
    }
  }, [messages]);

  const resetInactivityTimer = useCallback(() => {
    const now = new Date();
    lastActivityRef.current = now;
    
    if (session?.isActive) {
      setSession(prev => prev ? { ...prev, lastActivity: now } : null);
    }

    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    
    inactivityTimeoutRef.current = setTimeout(() => {
      endSessionDueToInactivity();
    }, 15 * 60 * 1000);
  }, [session?.isActive]);

  useEffect(() => {
    startNewSession();
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, []);

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
      questionAttempts: {},
      userContext: {
        role: 'unknown',
        issueType: 'unknown',
        urgency: 'low',
        specificDetails: [],
        conversationHistory: []
      }
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
    resetInactivityTimer();
  };

  const analyzeUserContext = (message: string, currentContext: UserContext): UserContext => {
    const lowerMessage = message.toLowerCase();
    let newContext = { ...currentContext };
    
    // Add to conversation history
    newContext.conversationHistory = [...currentContext.conversationHistory, message].slice(-5);
    
    // Determine user role
    if (lowerMessage.includes('tenant') || lowerMessage.includes('renting') || lowerMessage.includes('my landlord')) {
      newContext.role = 'tenant';
    } else if (lowerMessage.includes('landlord') || lowerMessage.includes('my tenant')) {
      newContext.role = 'landlord';
    } else if (lowerMessage.includes('buying') || lowerMessage.includes('purchase') || lowerMessage.includes('buyer')) {
      newContext.role = 'buyer';
    } else if (lowerMessage.includes('selling') || lowerMessage.includes('seller')) {
      newContext.role = 'seller';
    }
    
    // Determine issue type
    if (lowerMessage.includes('deposit') || lowerMessage.includes('security')) {
      newContext.issueType = 'deposit';
    } else if (lowerMessage.includes('repair') || lowerMessage.includes('maintenance') || lowerMessage.includes('broken')) {
      newContext.issueType = 'repairs';
    } else if (lowerMessage.includes('evict') || lowerMessage.includes('kicked out')) {
      newContext.issueType = 'eviction';
    } else if (lowerMessage.includes('break lease') || lowerMessage.includes('end lease') || lowerMessage.includes('terminate')) {
      newContext.issueType = 'lease_break';
    } else if (lowerMessage.includes('rent increase') || lowerMessage.includes('raise rent')) {
      newContext.issueType = 'rent_increase';
    } else if (lowerMessage.includes('home inspection') || lowerMessage.includes('house inspection')) {
      newContext.issueType = 'inspection';
    } else if (lowerMessage.includes('contract') || lowerMessage.includes('agreement')) {
      newContext.issueType = 'contract';
    } else if (lowerMessage.includes('mortgage') || lowerMessage.includes('financing') || lowerMessage.includes('loan')) {
      newContext.issueType = 'buying_process';
    }
    
    // Determine urgency
    if (lowerMessage.includes('urgent') || lowerMessage.includes('emergency') || lowerMessage.includes('immediately') || lowerMessage.includes('asap')) {
      newContext.urgency = 'high';
    } else if (lowerMessage.includes('soon') || lowerMessage.includes('worried') || lowerMessage.includes('problem')) {
      newContext.urgency = 'medium';
    }
    
    // Extract specific details (amounts, timeframes)
    const details = [];
    if (lowerMessage.includes('$')) {
      const amounts = lowerMessage.match(/\$[\d,]+/g);
      if (amounts) details.push(...amounts);
    }
    if (lowerMessage.includes('month') || lowerMessage.includes('week') || lowerMessage.includes('day')) {
      const timeframes = lowerMessage.match(/\d+\s*(month|week|day)s?/g);
      if (timeframes) details.push(...timeframes);
    }
    
    newContext.specificDetails = [...new Set([...currentContext.specificDetails, ...details])].slice(-10);
    
    return newContext;
  };

  const handleSendMessage = (content: string) => {
    console.log('=== handleSendMessage called ===');
    console.log('Content:', content);
    console.log('Session active:', session?.isActive);
    console.log('Current messages length:', messages.length);
    
    if (!session?.isActive) return;

    resetInactivityTimer();
    const questionId = Date.now().toString();
    
    // Analyze user context
    const updatedContext = analyzeUserContext(content, session.userContext);
    setSession(prev => prev ? { ...prev, userContext: updatedContext } : null);
    
    const userMessage: Message = {
      id: questionId,
      content,
      type: 'user',
      timestamp: new Date(),
      language: currentLanguage,
    };

    console.log('About to add user message:', userMessage);
    console.log('Current messages before adding:', messages);

    // Add user message immediately and ensure it's rendered
    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      return newMessages;
    });
    
    // Show typing indicator immediately after user message
    setIsTyping(true);

    const attemptCount = (session.questionAttempts[questionId] || 0) + 1;
    
    setSession(prev => prev ? {
      ...prev,
      questionAttempts: {
        ...prev.questionAttempts,
        [questionId]: attemptCount
      }
    } : null);

    // Process AI response asynchronously
    (async () => {
      try {
        // Use AI service for smart responses with updated timestamp
        const aiResponse = await aiService.getResponse(content, {
          role: updatedContext.role,
          issueType: updatedContext.issueType,
          urgency: updatedContext.urgency,
          conversationHistory: updatedContext.conversationHistory,
          language: currentLanguage,
          userLogin: 'Karl-Sue',
          timestamp: '2025-08-30 16:24:47' // Updated timestamp
        });

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse.content,
          type: 'bot',
          timestamp: new Date(),
          language: currentLanguage,
          questionId: questionId,
          confidence: aiResponse.confidence,
          hasActions: (aiResponse.suggestedActions?.length || 0) > 0
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);

        // Handle response based on AI assessment
        if (aiResponse.isHousingRelated) {
          if (aiResponse.confidence === 'high' || aiResponse.confidence === 'medium') {
            // Good response, ask for feedback
            setTimeout(() => {
              setPendingFeedback(botMessage.id);
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                content: getFeedbackMessage(currentLanguage),
                type: 'feedback',
                timestamp: new Date(),
                language: currentLanguage,
                questionId: questionId,
              }]);
            }, 2000);
          } else if (aiResponse.confidence === 'low' || attemptCount >= 2) {
            // Low confidence or multiple attempts, offer volunteer
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                content: getOfferVolunteerMessage(currentLanguage),
                type: 'system',
                timestamp: new Date(),
                language: currentLanguage,
              }]);
              setTimeout(() => setShowVolunteerModal(true), 1000);
            }, 1500);
          }

          // Show urgent action warning if needed
          if (aiResponse.requiresUrgentAction) {
            setTimeout(() => {
              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                content: getUrgentActionWarning(currentLanguage),
                type: 'system',
                timestamp: new Date(),
                language: currentLanguage,
              }]);
            }, 3000);
          }
        } else {
          // Off-topic, show clarification
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              content: getHousingTopicReminder(currentLanguage),
              type: 'feedback',
              timestamp: new Date(),
              language: currentLanguage,
              questionId: questionId,
            }]);
          }, 1000);
        }

      } catch (error) {
        console.error('AI Error:', error);
        
        // Fallback to basic response
        const fallbackMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: getAIErrorFallback(currentLanguage),
          type: 'bot',
          timestamp: new Date(),
          language: currentLanguage,
          questionId: questionId,
          confidence: 'low'
        };

        setMessages(prev => [...prev, fallbackMessage]);
        setIsTyping(false);

        // Offer volunteer after AI error
        setTimeout(() => {
          setShowVolunteerModal(true);
        }, 2000);
      }
    })();
  };

  const handleFeedback = (isHelpful: boolean, questionId: string) => {
    resetInactivityTimer();
    
    if (isHelpful) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: getThankYouMessage(currentLanguage),
        type: 'system',
        timestamp: new Date(),
        language: currentLanguage,
      }]);
    } else {
      const attemptCount = session?.questionAttempts[questionId] || 0;
      
      if (attemptCount >= 2) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: getOfferVolunteerMessage(currentLanguage),
          type: 'system',
          timestamp: new Date(),
          language: currentLanguage,
        }]);
        
        setTimeout(() => {
          setShowVolunteerModal(true);
        }, 1000);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          content: getAskMoreDetailsMessage(currentLanguage),
          type: 'system',
          timestamp: new Date(),
          language: currentLanguage,
        }]);
      }
    }
    
    setPendingFeedback(null);
  };

  const handleConnectVolunteer = () => {
    if (session) {
      setSession(prev => prev ? { ...prev, volunteerConnected: true } : null);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: getVolunteerConnectMessage(currentLanguage, session.userContext),
        type: 'system',
        timestamp: new Date(),
        language: currentLanguage,
      }]);
    }
    setShowVolunteerModal(false);
    resetInactivityTimer();
  };

  const handleNewChat = () => {
    setMessages([]);
    setPendingFeedback(null);
    startNewSession();
  };

  const handleUserActivity = () => {
    if (session?.isActive) {
      resetInactivityTimer();
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-bold flex items-center">
                  <span className="mr-2">🤖</span>
                  {getTitle(currentLanguage)}
                </h1>
                <p className="text-blue-100 text-sm">
                  {getSubtitle(currentLanguage)}
                </p>
                {/* Show user context if available */}
                {session?.userContext && session.userContext.role !== 'unknown' && (
                  <p className="text-blue-200 text-xs mt-1">
                    {getContextDisplay(session.userContext, currentLanguage)}
                  </p>
                )}
                {/* Show user info with timestamp */}
                <p className="text-blue-300 text-xs mt-1">
                  User: Karl-Sue • Session: {session?.id.slice(-6)} • Time: 16:24:47 UTC
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
            pendingFeedback={pendingFeedback}
            onSendMessage={handleSendMessage}
            onNewChat={handleNewChat}
            onUserActivity={handleUserActivity}
            onFeedback={handleFeedback}
          />
        </div>
      </div>

      {showVolunteerModal && (
        <VolunteerModal
          language={currentLanguage}
          onConnect={handleConnectVolunteer}
          onClose={() => {
            setShowVolunteerModal(false);
            resetInactivityTimer();
          }}
        />
      )}
    </div>
  );
}

// Enhanced helper functions with AI integration
function getWelcomeMessage(language: Language): string {
  const messages: Partial<Record<Language, string>> = {
    en: "Hello Karl-Sue! 👋 I'm your AI-powered Legal Housing Assistant, enhanced by Google Gemini 2.5-Flash.\n\nI can provide intelligent help with:\n\n🏠 **Tenant rights & landlord disputes**\n🏡 **Property buying & selling guidance**\n📋 **Lease agreements & eviction processes**\n🔧 **Repairs & maintenance legal issues**\n💰 **Security deposits & rent regulations**\n🚨 **Emergency housing situations**\n\n**Smart Features:**\n• Context-aware responses\n• Urgency detection\n• Personalized legal advice\n• Multi-language support\n\nJust tell me: Are you a tenant, landlord, buyer, or seller? What specific housing issue can I help you with today?",
    
    zh: "您好 Karl-Sue！👋 我是您的AI法律住房助手，由Google Gemini 2.5-Flash增强。\n\n我可以为以下问题提供智能帮助：\n\n🏠 **租户权利和房东纠纷**\n🏡 **房产买卖指导**\n📋 **租约协议和驱逐程序**\n🔧 **维修和维护法律问题**\n💰 **押金和租金规定**\n🚨 **紧急住房情况**\n\n**智能功能：**\n• 上下文感知回复\n• 紧急情况检测\n• 个性化法律建议\n• 多语言支持\n\n请告诉我：您是租户、房东、买家还是卖家？我今天可以帮您解决什么具体的住房问题？",
    
    vi: "Xin chào Karl-Sue! 👋 Tôi là Trợ lý Pháp lý Nhà ở được hỗ trợ bởi AI, được tăng cường bởi Google Gemini 2.5-Flash.\n\nTôi có thể cung cấp trợ giúp thông minh về:\n\n🏠 **Quyền của người thuê & tranh chấp chủ nhà**\n🏡 **Hướng dẫn mua bán bất động sản**\n📋 **Hợp đồng thuê & quy trình đuổi khách**\n🔧 **Vấn đề pháp lý về sửa chữa & bảo trì**\n💰 **Tiền đặt cọc & quy định về tiền thuê**\n🚨 **Tình huống nhà ở khẩn cấp**\n\nHãy cho tôi biết: Bạn là người thuê nhà, chủ nhà, người mua hay người bán? Tôi có thể giúp bạn giải quyết vấn đề nhà ở cụ thể nào hôm nay?",
    
    ar: "مرحباً Karl-Sue! 👋 أنا مساعدك القانوني للإسكان المدعوم بالذكاء الاصطناعي، المعزز بـ Google Gemini 2.5-Flash.\n\nيمكنني تقديم مساعدة ذكية في:\n\n🏠 **حقوق المستأجرين ونزاعات المالكين**\n🏡 **إرشادات شراء وبيع العقارات**\n📋 **عقود الإيجار وإجراءات الإخلاء**\n🔧 **القضايا القانونية للإصلاحات والصيانة**\n💰 **الودائع الأمنية ولوائح الإيجار**\n🚨 **حالات الإسكان الطارئة**\n\nأخبرني: هل أنت مستأجر أم مالك أم مشتري أم بائع؟ ما هي مشكلة الإسكان المحددة التي يمكنني مساعدتك فيها اليوم؟",
    
    hi: "नमस्ते Karl-Sue! 👋 मैं आपका AI-संचालित कानूनी आवास सहायक हूँ, Google Gemini 2.5-Flash द्वारा संवर्धित।\n\nमैं निम्नलिखित में बुद्धिमान सहायता प्रदान कर सकता हूँ:\n\n🏠 **किरायेदार अधिकार और मकान मालिक विवाद**\n🏡 **संपत्ति खरीद-बिक्री मार्गदर्शन**\n📋 **पट्टा समझौते और बेदखली प्रक्रियाएं**\n🔧 **मरम्मत और रखरखाव कानूनी मुद्दे**\n💰 **सिक्योरिटी डिपॉजिट और किराया नियम**\n🚨 **आपातकालीन आवास स्थितियां**\n\nकृपया बताएं: क्या आप किरायेदार, मकान मालिक, खरीदार या विक्रेता हैं? आज मैं आपकी किस विशिष्ट आवास समस्या में सहायता कर सकता हूँ?",
    
    id: "Halo Karl-Sue! 👋 Saya adalah Asisten Hukum Perumahan bertenaga AI Anda, yang ditingkatkan oleh Google Gemini 2.5-Flash.\n\nSaya dapat memberikan bantuan cerdas untuk:\n\n🏠 **Hak penyewa & sengketa pemilik**\n🏡 **Panduan jual beli properti**\n📋 **Kontrak sewa & proses pengusiran**\n🔧 **Masalah hukum perbaikan & pemeliharaan**\n💰 **Deposit keamanan & peraturan sewa**\n🚨 **Situasi perumahan darurat**\n\nBeritahu saya: Apakah Anda penyewa, pemilik, pembeli, atau penjual? Masalah perumahan spesifik apa yang bisa saya bantu hari ini?"
  };
  return messages[language] || messages.en!;
}

function getFeedbackMessage(language: Language): string {
  const messages: Partial<Record<Language, string>> = {
    en: "Was this AI-generated advice helpful for your specific housing situation? 🤖",
    zh: "这个AI生成的建议对您的具体住房情况有帮助吗？🤖",
    vi: "Lời khuyên do AI tạo ra này có hữu ích cho tình huống nhà ở cụ thể của bạn không? 🤖",
    ar: "هل كانت هذه النصيحة المولدة بالذكاء الاصطناعي مفيدة لوضعك السكني المحدد؟ 🤖",
    hi: "क्या यह AI-जनित सलाह आपकी विशिष्ट आवास स्थिति के लिए सहायक थी? 🤖",
    id: "Apakah saran yang dihasilkan AI ini membantu untuk situasi perumahan spesifik Anda? 🤖"
  };
  return messages[language] || messages.en!;
}

function getOfferVolunteerMessage(language: Language): string {
  const messages: Partial<Record<Language, string>> = {
    en: "Your situation may benefit from personalized legal guidance beyond AI capabilities. Would you like to connect with one of our qualified legal volunteers who can review your specific circumstances in detail?",
    zh: "您的情况可能需要超出AI能力的个性化法律指导。您想要联系我们的合格法律志愿者来详细审查您的具体情况吗？",
    vi: "Tình huống của bạn có thể được hưởng lợi từ hướng dẫn pháp lý cá nhân hóa vượt ra ngoài khả năng của AI. Bạn có muốn kết nối với một trong những tình nguyện viên pháp lý đủ điều kiện của chúng tôi không?",
    ar: "قد تستفيد حالتك من التوجيه القانوني الشخصي الذي يتجاوز قدرات الذكاء الاصطناعي. هل تود التواصل مع أحد متطوعينا القانونيين المؤهلين؟",
    hi: "आपकी स्थिति को AI क्षमताओं से परे व्यक्तिगत कानूनी मार्गदर्शन से लाभ हो सकता है। क्या आप हमारे योग्य कानूनी स्वयंसेवकों में से किसी एक से जुड़ना चाहेंगे?",
    id: "Situasi Anda mungkin mendapat manfaat dari bimbingan hukum yang dipersonalisasi di luar kemampuan AI. Apakah Anda ingin terhubung dengan salah satu relawan hukum berkualitas kami?"
  };
  return messages[language] || messages.en!;
}

function getVolunteerConnectMessage(language: Language, context: UserContext): string {
  const messages: Partial<Record<Language, string>> = {
    en: `🔗 Connecting you with a legal volunteer specialized in ${context.role} ${context.issueType} issues. They'll have access to our AI conversation context to provide enhanced assistance. Please wait...`,
    zh: `🔗 正在为您连接专门处理${context.role} ${context.issueType}问题的法律志愿者。他们将获得我们AI对话上下文以提供增强帮助。请稍候...`,
    vi: `🔗 Đang kết nối bạn với tình nguyện viên pháp lý chuyên về vấn đề ${context.role} ${context.issueType}. Họ sẽ có quyền truy cập vào ngữ cảnh cuộc trò chuyện AI của chúng ta. Vui lòng đợi...`,
    ar: `🔗 جاري ربطك بمتطوع قانوني متخصص في قضايا ${context.role} ${context.issueType}. سيكون لديهم وصول إلى سياق محادثة الذكاء الاصطناعي لدينا. يرجى الانتظار...`,
    hi: `🔗 आपको ${context.role} ${context.issueType} मुद्दों में विशेषज्ञ कानूनी स्वयंसेवक से जोड़ा जा रहा है। उनके पास हमारे AI वार्तालाप संदर्भ तक पहुंच होगी। कृपया प्रतीक्षा करें...`,
    id: `🔗 Menghubungkan Anda dengan relawan hukum yang mengkhususkan diri dalam masalah ${context.role} ${context.issueType}. Mereka akan memiliki akses ke konteks percakapan AI kami. Mohon tunggu...`
  };
  return messages[language] || messages.en!;
}

function getUrgentActionWarning(language: Language): string {
  const messages: Partial<Record<Language, string>> = {
    en: "⚠️ **URGENT AI ALERT**: Based on your situation analysis, immediate action may be required. Time-sensitive legal matters need prompt attention. Consider contacting local authorities or emergency legal services if applicable.",
    zh: "⚠️ **紧急AI警报**：根据您的情况分析，可能需要立即采取行动。时间敏感的法律事务需要及时关注。如适用，请考虑联系当地当局或紧急法律服务。",
    vi: "⚠️ **CẢNH BÁO AI KHẨN CẤP**: Dựa trên phân tích tình huống của bạn, có thể cần hành động ngay lập tức. Các vấn đề pháp lý nhạy cảm về thời gian cần được chú ý kịp thời.",
    ar: "⚠️ **تنبيه ذكي عاجل**: بناءً على تحليل وضعك، قد تكون هناك حاجة لاتخاذ إجراء فوري. المسائل القانونية الحساسة للوقت تحتاج انتباهاً عاجلاً.",
    hi: "⚠️ **तत्काल AI चेतावनी**: आपकी स्थिति के विश्लेषण के आधार पर, तत्काल कार्रवाई की आवश्यकता हो सकती है। समय-संवेदनशील कानूनी मामलों पर तुरंत ध्यान देने की आवश्यकता है।",
    id: "⚠️ **PERINGATAN AI MENDESAK**: Berdasarkan analisis situasi Anda, tindakan segera mungkin diperlukan. Masalah hukum yang sensitif terhadap waktu memerlukan perhatian segera."
  };
  return messages[language] || messages.en!;
}

function getHousingTopicReminder(language: Language): string {
  const messages: Partial<Record<Language, string>> = {
    en: "🏠 I'm specialized in housing and property legal matters only. Please ask about tenant rights, landlord issues, buying/selling property, leases, evictions, repairs, deposits, or related housing law topics.",
    zh: "🏠 我只专门处理住房和房产法律事务。请询问租户权利、房东问题、房产买卖、租约、驱逐、维修、押金或相关住房法律话题。",
    vi: "🏠 Tôi chỉ chuyên về các vấn đề pháp lý nhà ở và bất động sản. Vui lòng hỏi về quyền của người thuê nhà, vấn đề chủ nhà, mua/bán bất động sản, thuê nhà, đuổi khách, sửa chữa, tiền đặt cọc.",
    ar: "🏠 أنا متخصص في المسائل القانونية للإسكان والعقارات فقط. يرجى السؤال عن حقوق المستأجرين، قضايا المالكين، شراء/بيع العقارات، الإيجارات، الإخلاء، الإصلاحات، الودائع.",
    hi: "🏠 मैं केवल आवास और संपत्ति कानूनी मामलों में विशेषज्ञ हूँ। कृपया किरायेदार अधिकार, मकान मालिक मुद्दे, संपत्ति खरीद/बिक्री, पट्टे, बेदखली, मरम्मत, जमा के बारे में पूछें।",
    id: "🏠 Saya hanya mengkhususkan diri dalam masalah hukum perumahan dan properti. Silakan tanyakan tentang hak penyewa, masalah pemilik, jual beli properti, sewa, pengusiran, perbaikan, deposit."
  };
  return messages[language] || messages.en!;
}

function getAIErrorFallback(language: Language): string {
  const messages: Partial<Record<Language, string>> = {
    en: "🤖 I'm experiencing technical difficulties with my AI system. Let me connect you with a legal volunteer who can provide immediate human assistance with your housing question.",
    zh: "🤖 我的AI系统遇到了技术困难。让我为您联系一位法律志愿者，他可以立即提供人工协助解答您的住房问题。",
    vi: "🤖 Tôi đang gặp khó khăn kỹ thuật với hệ thống AI của mình. Hãy để tôi kết nối bạn với tình nguyện viên pháp lý có thể cung cấp hỗ trợ ngay lập tức.",
    ar: "🤖 أواجه صعوبات تقنية مع نظام الذكاء الاصطناعي الخاص بي. دعني أوصلك بمتطوع قانوني يمكنه تقديم المساعدة البشرية الفورية.",
    hi: "🤖 मुझे अपने AI सिस्टम के साथ तकनीकी कठिनाइयों का सामना कर रहा हूँ। मैं आपको एक कानूनी स्वयंसेवक से जोड़ता हूँ जो तत्काल मानवीय सहायता प्रदान कर सकते हैं।",
    id: "🤖 Saya mengalami kesulitan teknis dengan sistem AI saya. Biarkan saya menghubungkan Anda dengan relawan hukum yang dapat memberikan bantuan manusia segera."
  };
  return messages[language] || messages.en!;
}

function getThankYouMessage(language: Language): string {
  const messages: Partial<Record<Language, string>> = {
    en: "Excellent! 🎉 I'm glad my AI-powered advice was helpful for your housing situation. Do you have any other housing questions I can assist with using my advanced AI capabilities?",
    zh: "太好了！🎉 我很高兴我的AI建议对您的住房情况有帮助。您还有其他住房问题需要我用先进的AI能力协助吗？",
    vi: "Tuyệt vời! 🎉 Tôi rất vui vì lời khuyên được hỗ trợ bởi AI của tôi hữu ích cho tình huống nhà ở của bạn. Bạn có câu hỏi nào khác về nhà ở mà tôi có thể hỗ trợ không?",
    ar: "ممتاز! 🎉 أنا سعيد لأن نصيحتي المدعومة بالذكاء الاصطناعي كانت مفيدة لوضعك السكني. هل لديك أي أسئلة أخرى حول الإسكان يمكنني مساعدتك فيها؟",
    hi: "उत्कृष्ट! 🎉 मुझे खुशी है कि मेरी AI-संचालित सलाह आपकी आवास स्थिति के लिए सहायक थी। क्या आपके पास कोई अन्य आवास प्रश्न हैं जिनमें मैं अपनी उन्नत AI क्षमताओं से सहायता कर सकता हूँ?",
    id: "Luar biasa! 🎉 Saya senang saran bertenaga AI saya berguna untuk situasi perumahan Anda. Apakah Anda memiliki pertanyaan perumahan lain yang bisa saya bantu dengan kemampuan AI canggih saya?"
  };
  return messages[language] || messages.en!;
}

function getAskMoreDetailsMessage(language: Language): string {
  const messages: Partial<Record<Language, string>> = {
    en: "Let me use my AI analysis to help you better. Could you provide more specific details about your situation? For example: timeline, location, specific circumstances, any documents involved, or financial amounts?",
    zh: "让我使用AI分析来更好地帮助您。您能提供更多关于您情况的具体细节吗？例如：时间表、地点、具体情况、涉及的文件或金额？",
    vi: "Hãy để tôi sử dụng phân tích AI để giúp bạn tốt hơn. Bạn có thể cung cấp thêm chi tiết cụ thể về tình huống của mình không? Ví dụ: thời gian, địa điểm, hoàn cảnh cụ thể, tài liệu liên quan?",
    ar: "دعني أستخدم تحليل الذكاء الاصطناعي لمساعدتك بشكل أفضل. هل يمكنك تقديم المزيد من التفاصيل المحددة حول وضعك؟ على سبيل المثال: الجدول الزمني، الموقع، الظروف المحددة؟",
    hi: "मुझे आपकी बेहतर सहायता के लिए अपने AI विश्लेषण का उपयोग करने दें। क्या आप अपनी स्थिति के बारे में अधिक विशिष्ट विवरण प्रदान कर सकते हैं? उदाहरण: समयसीमा, स्थान, विशिष्ट परिस्थितियां?",
    id: "Biarkan saya menggunakan analisis AI untuk membantu Anda lebih baik. Bisakah Anda memberikan detail yang lebih spesifik tentang situasi Anda? Misalnya: timeline, lokasi, keadaan spesifik, dokumen yang terlibat?"
  };
  return messages[language] || messages.en!;
}

function getSessionExpiredMessage(language: Language): string {
  const messages: Partial<Record<Language, string>> = {
    en: "Your AI chat session has expired due to 15 minutes of inactivity. Please start a new chat to continue receiving intelligent legal assistance.",
    zh: "您的AI聊天会话因15分钟无活动而过期。请开始新的聊天以继续接受智能法律协助。",
    vi: "Phiên trò chuyện AI của bạn đã hết hạn do không hoạt động trong 15 phút. Vui lòng bắt đầu cuộc trò chuyện mới để tiếp tục nhận hỗ trợ pháp lý thông minh.",
    ar: "انتهت صلاحية جلسة الدردشة بالذكاء الاصطناعي بسبب عدم النشاط لمدة 15 دقيقة. يرجى بدء محادثة جديدة لمواصلة تلقي المساعدة القانونية الذكية.",
    hi: "निष्क्रियता के 15 मिनट के कारण आपका AI चैट सेशन समाप्त हो गया है। बुद्धिमान कानूनी सहायता प्राप्त करना जारी रखने के लिए कृपया नई चैट शुरू करें।",
    id: "Sesi obrolan AI Anda telah berakhir karena tidak aktif selama 15 menit. Silakan mulai obrolan baru untuk terus menerima bantuan hukum yang cerdas."
  };
  return messages[language] || messages.en!;
}

function getTitle(language: Language): string {
  const titles: Partial<Record<Language, string>> = {
    en: "WARM-HOME AI Legal Assistant",
    zh: "WARM-HOME AI法律助手",
    vi: "Trợ lý Pháp lý AI WARM-HOME",
    ar: "مساعد WARM-HOME القانوني بالذكاء الاصطناعي",
    hi: "WARM-HOME AI कानूनी सहायक",
    id: "Asisten Hukum AI WARM-HOME"
  };
  return titles[language] || titles.en!;
}

function getSubtitle(language: Language): string {
  const subtitles: Partial<Record<Language, string>> = {
    en: "Advanced housing law guidance • Powered by Google Gemini 2.5-Flash",
    zh: "先进的住房法律指导 • 由Google Gemini 2.5-Flash提供支持",
    vi: "Hướng dẫn luật nhà ở tiên tiến • Được hỗ trợ bởi Google Gemini 2.5-Flash",
    ar: "إرشادات قانون الإسكان المتقدمة • مدعوم بـ Google Gemini 2.5-Flash",
    hi: "उन्नत आवास कानून मार्गदर्शन • Google Gemini 2.5-Flash द्वारा संचालित",
    id: "Panduan hukum perumahan canggih • Didukung oleh Google Gemini 2.5-Flash"
  };
  return subtitles[language] || subtitles.en!;
}

function getContextDisplay(context: UserContext, language: Language): string {
  const roleLabels: Partial<Record<Language, Record<UserRole, string>>> = {
    en: { tenant: "Tenant", landlord: "Landlord", buyer: "Buyer", seller: "Seller", unknown: "Unknown" },
    zh: { tenant: "租户", landlord: "房东", buyer: "买家", seller: "卖家", unknown: "未知" },
    vi: { tenant: "Người thuê", landlord: "Chủ nhà", buyer: "Người mua", seller: "Người bán", unknown: "Không rõ" },
    ar: { tenant: "مستأجر", landlord: "مالك", buyer: "مشتري", seller: "بائع", unknown: "غير معروف" },
    hi: { tenant: "किरायेदार", landlord: "मकान मालिक", buyer: "खरीदार", seller: "विक्रेता", unknown: "अज्ञात" },
    id: { tenant: "Penyewa", landlord: "Pemilik", buyer: "Pembeli", seller: "Penjual", unknown: "Tidak diketahui" }
  };
  
  const role = roleLabels[language]?.[context.role] || roleLabels.en![context.role];
  const urgency = context.urgency === 'high' ? '🔴' : context.urgency === 'medium' ? '🟡' : '🟢';
  const aiIndicator = '🤖';
  
  return `${aiIndicator} ${role} • ${context.issueType} ${urgency}`;
}