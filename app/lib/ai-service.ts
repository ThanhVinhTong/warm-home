import { GoogleGenAI } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''});

export interface AIResponse {
  content: string;
  confidence: 'high' | 'medium' | 'low';
  isHousingRelated: boolean;
  suggestedActions?: string[];
  requiresUrgentAction?: boolean;
}

export interface UserContext {
  role: string;
  issueType: string;
  urgency: string;
  conversationHistory: string[];
  language: string;
  userLogin?: string;
  timestamp?: string;
}

export class LegalHousingAI {
  constructor() {
    // No need to initialize model here, we'll use ai.models.generateContent directly
  }

  async getResponse(userMessage: string, context: UserContext): Promise<AIResponse> {
    const systemPrompt = this.buildSystemPrompt(context);
    const fullPrompt = `${systemPrompt}\n\nUser Question: ${userMessage}`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
      });

      // ✅ FIXED: Add null checks and provide fallback
      const text = response.text || '';
      
      // Additional check to ensure we have valid text
      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from AI');
      }

      return {
        content: text,
        confidence: this.assessConfidence(text),
        isHousingRelated: this.checkHousingRelevance(userMessage),
        suggestedActions: this.extractActions(text),
        requiresUrgentAction: this.checkUrgency(text, userMessage)
      };
    } catch (error) {
      console.error('AI API Error:', error);
      return {
        content: this.getFallbackResponse(context.language),
        confidence: 'low',
        isHousingRelated: true
      };
    }
  }

  private buildSystemPrompt(context: UserContext): string {
    // Updated current date and time
    const currentDateTime = '2025-08-30 16:21:36';
    const currentUser = 'User';
    
    return `You are a specialized Legal Housing Assistant AI for the WARM-HOME app.
Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): ${currentDateTime}
Current User's Login: ${currentUser}
Session Started: ${context.timestamp}

SCOPE: You ONLY provide advice about housing and property legal matters:
- Tenant rights and landlord-tenant law
- Property buying, selling, and real estate transactions  
- Housing laws, regulations, and compliance
- Lease agreements, evictions, and rental disputes
- Property repairs, maintenance, and habitability
- Security deposits, rent control, and housing discrimination
- Home inspections, contracts, and closing processes

CURRENT USER CONTEXT:
- User: ${context.userLogin || currentUser}
- Role: ${context.role} (tenant/landlord/buyer/seller)
- Issue Type: ${context.issueType}
- Urgency Level: ${context.urgency}
- Language: ${context.language}
- Session Time: ${context.timestamp}
- Recent conversation: ${context.conversationHistory.slice(-3).join(' → ')}

RESPONSE RULES:
1. **Off-topic questions**: If NOT about housing/property law, respond exactly: "I'm specialized in housing and property legal matters only. Please ask about tenant rights, landlord issues, buying/selling property, leases, evictions, repairs, deposits, or related housing law topics."

2. **Role-specific advice**: Tailor responses based on user's role:
   - Tenant: Focus on tenant rights, protections, remedies
   - Landlord: Focus on legal obligations, proper procedures
   - Buyer: Focus on purchase process, inspections, contracts
   - Seller: Focus on disclosure requirements, legal obligations

3. **Urgency handling**:
   - HIGH urgency: Provide immediate action steps, mention contacting authorities
   - MEDIUM urgency: Provide structured guidance with timelines
   - LOW urgency: Provide comprehensive educational information

4. **Language**: Respond in ${context.language} language naturally

5. **Legal disclaimers**: Always end with appropriate disclaimer for serious matters

6. **Actionable advice**: Provide specific, step-by-step guidance when possible

7. **Local variations**: When laws vary by location, mention this and suggest checking local regulations

8. **Time sensitivity**: Consider current date/time (${currentDateTime}) for any time-sensitive advice

9. **Personal touch**: Address the user (${currentUser}) personally when appropriate

FORMAT YOUR RESPONSE:
- Start with direct answer to their question
- Provide numbered action steps if applicable  
- Include relevant warnings or urgent considerations
- End with appropriate legal disclaimer

EXAMPLES OF GOOD RESPONSES:
- "Hi ${currentUser}, as a tenant, you have specific rights regarding repairs..."
- "For landlords like yourself, the eviction process typically requires..."
- "When buying property, the inspection period is crucial because..."
- "URGENT: If you're facing immediate eviction, contact..."`;
  }

  private assessConfidence(response: string): 'high' | 'medium' | 'low' {
    // ✅ FIXED: Add null check
    if (!response || response.trim().length === 0) {
      return 'low';
    }

    const lowConfidenceIndicators = [
      'I\'m specialized in housing',
      'not confident',
      'consult a qualified attorney',
      'varies significantly by location',
      'complex legal matter'
    ];
    
    const mediumConfidenceIndicators = [
      'typically',
      'generally', 
      'in most jurisdictions',
      'may vary',
      'usually',
      'often'
    ];

    if (lowConfidenceIndicators.some(indicator => response.includes(indicator))) {
      return 'low';
    }
    if (mediumConfidenceIndicators.some(indicator => response.includes(indicator))) {
      return 'medium';
    }
    return 'high';
  }

  private checkHousingRelevance(message: string): boolean {
    // ✅ FIXED: Add null check
    if (!message || message.trim().length === 0) {
      return false;
    }

    const housingKeywords = [
      'rent', 'rental', 'lease', 'tenant', 'landlord', 'eviction', 'deposit', 
      'buy', 'buying', 'purchase', 'mortgage', 'property', 'house', 'apartment', 
      'home', 'housing', 'real estate', 'repair', 'maintenance', 'inspection',
      'contract', 'closing', 'title', 'deed', 'zoning', 'HOA', 'condo',
      'subletting', 'utilities', 'habitability', 'discrimination'
    ];
    
    const lowerMessage = message.toLowerCase();
    return housingKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private extractActions(response: string): string[] {
    // ✅ FIXED: Add null check
    if (!response || response.trim().length === 0) {
      return [];
    }

    const actions: string[] = [];
    const lines = response.split('\n');
    
    lines.forEach(line => {
      if (line.match(/^\d+\./) || 
          line.match(/^\d+\)/) || 
          line.includes('Step') || 
          line.includes('Action:') ||
          line.match(/^[-•]\s/)) {
        const cleanAction = line.replace(/^\d+[.)]\s*/, '').replace(/^[-•]\s*/, '').trim();
        if (cleanAction.length > 10) {
          actions.push(cleanAction);
        }
      }
    });
    
    return actions.slice(0, 5);
  }

  private checkUrgency(response: string, userMessage: string): boolean {
    // ✅ FIXED: Add null checks
    if (!response || !userMessage) {
      return false;
    }

    const urgentIndicators = [
      'URGENT',
      'EMERGENCY', 
      'immediately',
      'right away',
      'contact authorities',
      'call police',
      'emergency repair',
      'health hazard',
      'unsafe conditions',
      'eviction notice',
      'court date'
    ];
    
    const combinedText = (response + ' ' + userMessage).toLowerCase();
    return urgentIndicators.some(indicator => 
      combinedText.includes(indicator.toLowerCase())
    );
  }

  private getFallbackResponse(language: string): string {
    const fallbacks: { [key: string]: string } = {
      en: "Hi Karl-Sue, I'm having trouble connecting to provide a detailed response right now. For housing legal matters, please try rephrasing your question or consider connecting with one of our legal volunteers for personalized assistance.",
      zh: "你好 Karl-Sue，我现在无法连接以提供详细回复。对于住房法律事务，请尝试重新表述您的问题，或考虑联系我们的法律志愿者获得个人帮助。",
      vi: "Xin chào Karl-Sue, tôi đang gặp khó khăn trong việc kết nối để cung cấp phản hồi chi tiết ngay bây giờ. Đối với các vấn đề pháp lý về nhà ở, vui lòng thử diễn đạt lại câu hỏi của bạn hoặc cân nhắc kết nối với một trong những tình nguyện viên pháp lý của chúng tôi.",
      ar: "مرحباً Karl-Sue، أواجه صعوبة في الاتصال لتقديم رد مفصل الآن. لشؤون الإسكان القانونية، يرجى المحاولة إعادة صياغة سؤالك أو النظر في التواصل مع أحد متطوعينا القانونيين.",
      hi: "नमस्ते Karl-Sue, मुझे अभी विस्तृत उत्तर प्रदान करने के लिए कनेक्ट करने में समस्या हो रही है। आवास कानूनी मामलों के लिए, कृपया अपने प्रश्न को दोबारा कहने का प्रयास करें या व्यक्तिगत सहायता के लिए हमारे कानूनी स्वयंसेवकों से जुड़ने पर विचार करें।",
      id: "Halo Karl-Sue, saya mengalami kesulitan menghubungkan untuk memberikan respons terperinci saat ini. Untuk masalah hukum perumahan, silakan coba mengulang pertanyaan Anda atau pertimbangkan untuk terhubung dengan salah satu relawan hukum kami."
    };
    return fallbacks[language] || fallbacks.en;
  }
}