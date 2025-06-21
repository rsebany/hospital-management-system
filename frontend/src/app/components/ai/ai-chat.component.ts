import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../services/ai.service';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

@Component({
  selector: 'app-ai-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <!-- Header -->
      <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div class="max-w-4xl mx-auto">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <span class="text-2xl mr-3">💬</span>
              <div>
                <h1 class="text-xl font-bold text-gray-900 dark:text-white">AI Medical Assistant</h1>
                <p class="text-sm text-gray-600 dark:text-gray-300">Ask me anything about your health</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span class="text-sm text-gray-600 dark:text-gray-300">Online</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Container -->
      <div class="flex-1 max-w-4xl mx-auto w-full p-4">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg h-full flex flex-col">
          <!-- Messages Area -->
          <div 
            #messagesContainer
            class="flex-1 overflow-y-auto p-6 space-y-4"
            style="max-height: calc(100vh - 200px);">
            
            <!-- Welcome Message -->
            <div *ngIf="messages.length === 0" class="text-center py-8">
              <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-2xl">🤖</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to AI Medical Assistant
              </h3>
              <p class="text-gray-600 dark:text-gray-300 mb-6">
                I'm here to help you with medical questions, symptom analysis, and health guidance.
              </p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-md mx-auto">
                <button 
                  (click)="sendQuickMessage('What are the symptoms of diabetes?')"
                  class="text-left p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <div class="font-medium text-gray-900 dark:text-white">Diabetes symptoms</div>
                  <div class="text-sm text-gray-600 dark:text-gray-300">Learn about warning signs</div>
                </button>
                <button 
                  (click)="sendQuickMessage('How to maintain a healthy diet?')"
                  class="text-left p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <div class="font-medium text-gray-900 dark:text-white">Healthy diet tips</div>
                  <div class="text-sm text-gray-600 dark:text-gray-300">Nutrition guidance</div>
                </button>
                <button 
                  (click)="sendQuickMessage('What exercises are good for heart health?')"
                  class="text-left p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <div class="font-medium text-gray-900 dark:text-white">Heart health exercises</div>
                  <div class="text-sm text-gray-600 dark:text-gray-300">Cardiovascular fitness</div>
                </button>
                <button 
                  (click)="sendQuickMessage('How to manage stress and anxiety?')"
                  class="text-left p-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <div class="font-medium text-gray-900 dark:text-white">Stress management</div>
                  <div class="text-sm text-gray-600 dark:text-gray-300">Mental health tips</div>
                </button>
              </div>
            </div>

            <!-- Chat Messages -->
            <div 
              *ngFor="let message of messages" 
              class="flex"
              [ngClass]="message.isUser ? 'justify-end' : 'justify-start'">
              
              <div 
                class="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg"
                [ngClass]="message.isUser 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'">
                
                <!-- Loading Indicator -->
                <div *ngIf="message.isLoading" class="flex items-center space-x-2">
                  <div class="flex space-x-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  </div>
                  <span class="text-sm">AI is thinking...</span>
                </div>

                <!-- Message Text -->
                <div *ngIf="!message.isLoading" [innerHTML]="formatMessage(message.text)"></div>
                
                <!-- Timestamp -->
                <div class="text-xs mt-1 opacity-70">
                  {{ message.timestamp | date:'shortTime' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Input Area -->
          <div class="border-t border-gray-200 dark:border-gray-700 p-4">
            <form (ngSubmit)="sendMessage()" class="flex space-x-3">
              <input 
                type="text" 
                [(ngModel)]="newMessage" 
                name="message"
                placeholder="Type your medical question..."
                class="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                [disabled]="isLoading">
              
              <button 
                type="submit"
                [disabled]="!newMessage.trim() || isLoading"
                class="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors duration-200 flex items-center">
                <span *ngIf="isLoading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                <span *ngIf="!isLoading">Send</span>
                <span *ngIf="isLoading">Sending...</span>
              </button>
            </form>
            
            <!-- Quick Actions -->
            <div class="flex flex-wrap gap-2 mt-3">
              <button 
                *ngFor="let action of quickActions"
                (click)="sendQuickMessage(action.text)"
                [disabled]="isLoading"
                class="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full transition-colors">
                {{ action.text }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class AiChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  messages: ChatMessage[] = [];
  newMessage: string = '';
  isLoading: boolean = false;

  quickActions = [
    { text: 'Symptom check' },
    { text: 'Medication info' },
    { text: 'Health tips' },
    { text: 'Emergency signs' },
    { text: 'Diet advice' },
    { text: 'Exercise tips' }
  ];

  constructor(private aiService: AiService) {}

  ngOnInit(): void {
    // Initialize chat
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || this.isLoading) return;

    const userMessage: ChatMessage = {
      id: this.generateId(),
      text: this.newMessage,
      isUser: true,
      timestamp: new Date()
    };

    this.messages.push(userMessage);
    const userInput = this.newMessage;
    this.newMessage = '';

    // Add loading message
    const loadingMessage: ChatMessage = {
      id: this.generateId(),
      text: '',
      isUser: false,
      timestamp: new Date(),
      isLoading: true
    };
    this.messages.push(loadingMessage);

    this.isLoading = true;

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse = this.generateAIResponse(userInput);
      
      // Remove loading message
      this.messages = this.messages.filter(m => !m.isLoading);
      
      // Add AI response
      const aiMessage: ChatMessage = {
        id: this.generateId(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      };
      this.messages.push(aiMessage);
      this.isLoading = false;
    }, 1500);
  }

  sendQuickMessage(text: string): void {
    this.newMessage = text;
    this.sendMessage();
  }

  generateAIResponse(userInput: string): string {
    const input = userInput.toLowerCase();
    
    if (input.includes('diabetes') || input.includes('diabetic')) {
      return `Diabetes symptoms can include:<br><br>
      • <strong>Frequent urination</strong> - especially at night<br>
      • <strong>Increased thirst</strong> and hunger<br>
      • <strong>Unexplained weight loss</strong><br>
      • <strong>Fatigue</strong> and irritability<br>
      • <strong>Blurred vision</strong><br>
      • <strong>Slow-healing wounds</strong><br><br>
      <em>If you're experiencing these symptoms, please consult with a healthcare provider for proper diagnosis and treatment.</em>`;
    }
    
    if (input.includes('diet') || input.includes('nutrition')) {
      return `Here are some general healthy diet tips:<br><br>
      • <strong>Eat plenty of fruits and vegetables</strong> - aim for 5 servings daily<br>
      • <strong>Choose whole grains</strong> over refined grains<br>
      • <strong>Include lean proteins</strong> like fish, poultry, and legumes<br>
      • <strong>Limit processed foods</strong> and added sugars<br>
      • <strong>Stay hydrated</strong> - drink plenty of water<br>
      • <strong>Control portion sizes</strong><br><br>
      <em>For personalized nutrition advice, consult with a registered dietitian.</em>`;
    }
    
    if (input.includes('exercise') || input.includes('workout')) {
      return `Great question! Here are some heart-healthy exercises:<br><br>
      • <strong>Aerobic exercises:</strong> Walking, jogging, swimming, cycling<br>
      • <strong>Strength training:</strong> Weight lifting, resistance bands<br>
      • <strong>Flexibility:</strong> Yoga, stretching<br>
      • <strong>Balance:</strong> Tai chi, balance exercises<br><br>
      <strong>Recommendation:</strong> 150 minutes of moderate exercise per week.<br><br>
      <em>Always consult your doctor before starting a new exercise program.</em>`;
    }
    
    if (input.includes('stress') || input.includes('anxiety')) {
      return `Here are some effective stress management techniques:<br><br>
      • <strong>Deep breathing exercises</strong> - 4-7-8 technique<br>
      • <strong>Regular exercise</strong> - releases endorphins<br>
      • <strong>Mindfulness meditation</strong> - 10-15 minutes daily<br>
      • <strong>Proper sleep</strong> - 7-9 hours per night<br>
      • <strong>Time management</strong> - prioritize tasks<br>
      • <strong>Social support</strong> - talk to friends/family<br><br>
      <em>If stress is overwhelming, consider speaking with a mental health professional.</em>`;
    }
    
    if (input.includes('emergency') || input.includes('urgent')) {
      return `<strong>🚨 Emergency Warning Signs:</strong><br><br>
      Seek immediate medical attention for:<br>
      • <strong>Chest pain</strong> or pressure<br>
      • <strong>Difficulty breathing</strong><br>
      • <strong>Severe bleeding</strong><br>
      • <strong>Loss of consciousness</strong><br>
      • <strong>Sudden severe headache</strong><br>
      • <strong>Paralysis or weakness</strong><br><br>
      <strong>Call emergency services immediately if experiencing these symptoms!</strong>`;
    }
    
    // Default response
    return `Thank you for your question about "${userInput}". I'm here to provide general health information, but please remember that I cannot provide medical diagnosis or treatment advice.<br><br>
    <strong>For specific medical concerns:</strong><br>
    • Consult with a qualified healthcare provider<br>
    • Schedule an appointment with your doctor<br>
    • Contact emergency services for urgent situations<br><br>
    <em>How else can I help you with general health information?</em>`;
  }

  formatMessage(text: string): string {
    return text.replace(/\n/g, '<br>');
  }

  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  scrollToBottom(): void {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch (err) {
      // Handle error
    }
  }
} 