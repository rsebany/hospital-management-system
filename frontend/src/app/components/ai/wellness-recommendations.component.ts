import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../services/ai.service';

interface WellnessProfile {
  age: number;
  gender: string;
  activityLevel: string;
  healthGoals: string[];
  currentHealth: string[];
  lifestyle: string[];
}

interface WellnessRecommendation {
  category: string;
  title: string;
  description: string;
  tips: string[];
  priority: 'high' | 'medium' | 'low';
}

@Component({
  selector: 'app-wellness-recommendations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div class="container mx-auto px-4 max-w-6xl">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🌟 Personalized Wellness Recommendations
          </h1>
          <p class="text-gray-600 dark:text-gray-300">
            Get AI-powered health and lifestyle recommendations tailored to your profile
          </p>
        </div>

        <!-- Profile Form -->
        <div *ngIf="!recommendations" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">Your Wellness Profile</h2>
          
          <form (ngSubmit)="generateRecommendations()" #wellnessForm="ngForm">
            <!-- Basic Information -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Age
                </label>
                <input 
                  type="number" 
                  [(ngModel)]="profile.age" 
                  name="age"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your age"
                  required>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Gender
                </label>
                <select 
                  [(ngModel)]="profile.gender" 
                  name="gender"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Activity Level
                </label>
                <select 
                  [(ngModel)]="profile.activityLevel" 
                  name="activityLevel"
                  class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required>
                  <option value="">Select activity level</option>
                  <option value="sedentary">Sedentary (little to no exercise)</option>
                  <option value="lightly_active">Lightly Active (light exercise 1-3 days/week)</option>
                  <option value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</option>
                  <option value="very_active">Very Active (hard exercise 6-7 days/week)</option>
                  <option value="extremely_active">Extremely Active (very hard exercise, physical job)</option>
                </select>
              </div>
            </div>

            <!-- Health Goals -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Health Goals (Select all that apply)
              </label>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <label *ngFor="let goal of healthGoals" class="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input 
                    type="checkbox" 
                    [value]="goal"
                    (change)="toggleSelection(goal, 'healthGoals')"
                    class="mr-3 text-yellow-600">
                  <span class="text-gray-900 dark:text-white">{{ goal }}</span>
                </label>
              </div>
            </div>

            <!-- Current Health -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Current Health Conditions (Select all that apply)
              </label>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <label *ngFor="let condition of healthConditions" class="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input 
                    type="checkbox" 
                    [value]="condition"
                    (change)="toggleSelection(condition, 'currentHealth')"
                    class="mr-3 text-yellow-600">
                  <span class="text-gray-900 dark:text-white">{{ condition }}</span>
                </label>
              </div>
            </div>

            <!-- Lifestyle Factors -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Lifestyle Factors (Select all that apply)
              </label>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <label *ngFor="let factor of lifestyleFactors" class="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input 
                    type="checkbox" 
                    [value]="factor"
                    (change)="toggleSelection(factor, 'lifestyle')"
                    class="mr-3 text-yellow-600">
                  <span class="text-gray-900 dark:text-white">{{ factor }}</span>
                </label>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="text-center">
              <button 
                type="submit"
                [disabled]="isLoading || !wellnessForm.valid"
                class="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center mx-auto">
                <span *ngIf="isLoading" class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                {{ isLoading ? 'Generating Recommendations...' : 'Get Recommendations' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Recommendations Results -->
        <div *ngIf="recommendations" class="space-y-6">
          <!-- Back Button -->
          <div class="text-left">
            <button 
              (click)="resetForm()"
              class="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200">
              ← Back to Profile
            </button>
          </div>

          <!-- Recommendations Summary -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span class="text-2xl mr-2">🌟</span>
              Your Personalized Recommendations
            </h2>
            <p class="text-gray-600 dark:text-gray-300 mb-6">
              Based on your profile, here are tailored recommendations to help you achieve your health goals.
            </p>
          </div>

          <!-- Recommendation Cards -->
          <div *ngFor="let recommendation of recommendations" 
               class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">{{ recommendation.title }}</h3>
              <span class="px-3 py-1 rounded-full text-sm font-medium"
                    [ngClass]="recommendation.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                              recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'">
                {{ recommendation.priority | titlecase }} Priority
              </span>
            </div>
            
            <p class="text-gray-600 dark:text-gray-300 mb-4">{{ recommendation.description }}</p>
            
            <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 dark:text-white mb-3">Actionable Tips:</h4>
              <ul class="space-y-2">
                <li *ngFor="let tip of recommendation.tips" class="flex items-start">
                  <span class="text-yellow-600 dark:text-yellow-400 mr-2 mt-1">•</span>
                  <span class="text-gray-700 dark:text-gray-300">{{ tip }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Wellness Tracker -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Track Your Progress</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div class="text-2xl mb-2">📊</div>
                <h4 class="font-medium text-gray-900 dark:text-white">Weekly Goals</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">Set and track weekly wellness goals</p>
              </div>
              <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div class="text-2xl mb-2">📈</div>
                <h4 class="font-medium text-gray-900 dark:text-white">Progress Reports</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">Monitor your health improvements</p>
              </div>
              <div class="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div class="text-2xl mb-2">🔄</div>
                <h4 class="font-medium text-gray-900 dark:text-white">Regular Updates</h4>
                <p class="text-sm text-gray-600 dark:text-gray-300">Get updated recommendations</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Error Message -->
        <div *ngIf="errorMessage" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-6">
          <div class="flex items-center">
            <span class="text-red-600 dark:text-red-400 text-lg mr-2">❌</span>
            <p class="text-red-800 dark:text-red-200">{{ errorMessage }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class WellnessRecommendationsComponent {
  profile: WellnessProfile = {
    age: 0,
    gender: '',
    activityLevel: '',
    healthGoals: [],
    currentHealth: [],
    lifestyle: []
  };

  recommendations: WellnessRecommendation[] | null = null;
  isLoading: boolean = false;
  errorMessage: string = '';

  healthGoals = [
    'Weight Loss', 'Muscle Gain', 'Better Sleep', 'Stress Reduction',
    'Heart Health', 'Mental Health', 'Energy Boost', 'Flexibility',
    'Better Nutrition', 'Quit Smoking', 'Reduce Alcohol', 'Better Posture'
  ];

  healthConditions = [
    'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma',
    'Arthritis', 'Depression', 'Anxiety', 'Insomnia',
    'Obesity', 'High Cholesterol', 'None'
  ];

  lifestyleFactors = [
    'Sedentary Job', 'High Stress', 'Poor Sleep', 'Irregular Meals',
    'Smoking', 'Alcohol Use', 'Travel Frequently', 'Shift Work',
    'Family History', 'Limited Time', 'Budget Constraints'
  ];

  constructor(private aiService: AiService) {}

  toggleSelection(item: string, arrayName: keyof WellnessProfile): void {
    const array = this.profile[arrayName] as string[];
    const index = array.indexOf(item);
    
    if (index > -1) {
      array.splice(index, 1);
    } else {
      array.push(item);
    }
  }

  generateRecommendations(): void {
    if (!this.profile.age || !this.profile.gender || !this.profile.activityLevel) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.recommendations = null;

    // Simulate API call
    setTimeout(() => {
      this.recommendations = this.generatePersonalizedRecommendations();
      this.isLoading = false;
    }, 2000);
  }

  generatePersonalizedRecommendations(): WellnessRecommendation[] {
    const recommendations: WellnessRecommendation[] = [];

    // Activity Level Recommendations
    if (this.profile.activityLevel === 'sedentary') {
      recommendations.push({
        category: 'Physical Activity',
        title: 'Start Moving: Begin Your Fitness Journey',
        description: 'Since you have a sedentary lifestyle, it\'s important to gradually increase your physical activity.',
        priority: 'high',
        tips: [
          'Start with 10-minute walks 3 times per day',
          'Use a standing desk or take regular breaks to stand',
          'Try gentle exercises like yoga or tai chi',
          'Set a goal to reach 150 minutes of moderate activity per week',
          'Use fitness apps to track your daily steps'
        ]
      });
    }

    // Age-based Recommendations
    if (this.profile.age > 50) {
      recommendations.push({
        category: 'Health Screening',
        title: 'Preventive Health Screenings',
        description: 'Regular health screenings become increasingly important as we age.',
        priority: 'high',
        tips: [
          'Schedule annual physical exams',
          'Get regular blood pressure and cholesterol checks',
          'Consider bone density testing',
          'Stay up to date with vaccinations',
          'Discuss cancer screening options with your doctor'
        ]
      });
    }

    // Goal-based Recommendations
    if (this.profile.healthGoals.includes('Weight Loss')) {
      recommendations.push({
        category: 'Nutrition',
        title: 'Sustainable Weight Loss Strategy',
        description: 'Focus on creating a sustainable calorie deficit through diet and exercise.',
        priority: 'medium',
        tips: [
          'Track your daily calorie intake',
          'Increase protein consumption to 1.2-1.6g per kg body weight',
          'Include plenty of vegetables and fiber',
          'Practice portion control and mindful eating',
          'Combine cardio and strength training'
        ]
      });
    }

    if (this.profile.healthGoals.includes('Better Sleep')) {
      recommendations.push({
        category: 'Sleep Hygiene',
        title: 'Optimize Your Sleep Environment',
        description: 'Create a sleep-friendly environment and establish healthy sleep habits.',
        priority: 'medium',
        tips: [
          'Maintain a consistent sleep schedule',
          'Create a relaxing bedtime routine',
          'Keep your bedroom cool, dark, and quiet',
          'Avoid screens 1 hour before bedtime',
          'Limit caffeine after 2 PM'
        ]
      });
    }

    // Lifestyle-based Recommendations
    if (this.profile.lifestyle.includes('High Stress')) {
      recommendations.push({
        category: 'Stress Management',
        title: 'Stress Reduction Techniques',
        description: 'Learn effective stress management techniques to improve your overall well-being.',
        priority: 'high',
        tips: [
          'Practice deep breathing exercises daily',
          'Try meditation or mindfulness apps',
          'Engage in regular physical activity',
          'Maintain a gratitude journal',
          'Consider therapy or counseling if needed'
        ]
      });
    }

    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push({
        category: 'General Wellness',
        title: 'Foundation for Good Health',
        description: 'Build a solid foundation for your health and wellness journey.',
        priority: 'medium',
        tips: [
          'Aim for 7-9 hours of quality sleep per night',
          'Eat a balanced diet with plenty of whole foods',
          'Stay hydrated by drinking 8-10 glasses of water daily',
          'Engage in regular physical activity',
          'Practice stress management techniques'
        ]
      });
    }

    return recommendations;
  }

  resetForm(): void {
    this.profile = {
      age: 0,
      gender: '',
      activityLevel: '',
      healthGoals: [],
      currentHealth: [],
      lifestyle: []
    };
    this.recommendations = null;
    this.errorMessage = '';
  }
} 