# Hopitaliko Frontend

A modern, responsive Angular application for hospital management with beautiful UI components.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
ng serve

# Open in browser
# The application will automatically open at http://localhost:4200
```

## 🏥 Available Components

### 1. **Public Info** (`/public-info`)
- Hospital information display
- Doctor listings with search/filter
- Department information
- Contact forms
- **Features:** Hero section, doctor search, department cards, contact form

### 2. **Hospital Services** (`/services`)
- Comprehensive service listings
- Department-based filtering
- Service categories
- Booking options
- **Features:** Service search, category browsing, detailed service cards

### 3. **Insurance Providers** (`/insurance`)
- Accepted insurance providers
- Coverage details
- Provider contact information
- Billing support
- **Features:** Provider search, coverage information, contact options

### 4. **FAQ** (`/faq`)
- Frequently asked questions
- Category-based filtering
- Expandable answers
- Support contact options
- **Features:** Searchable FAQ, category browsing, interactive Q&A

### 5. **Emergency Information** (`/emergency`)
- Emergency contacts
- Emergency instructions
- Nearest hospitals
- Emergency tips
- **Features:** Prominent emergency banner, one-click calling, directions

## 🎨 Design Features

- **Modern UI/UX** with medical blue theme
- **Responsive design** for all devices
- **Smooth animations** and transitions
- **Accessibility features** with proper focus states
- **Professional styling** with card-based layouts
- **Interactive elements** with hover effects

## 🔧 Configuration

### Mock Data
The application currently uses mock data for testing. To switch to real backend:

1. Update `public.service.ts`
2. Set `useMockData = false`
3. Ensure your backend is running on `http://localhost:3000`

### Navigation
- Use the top navigation bar to switch between components
- Emergency button is prominently displayed
- All components are accessible without authentication

## 📱 Responsive Design

- **Mobile:** Single column layout, optimized touch targets
- **Tablet:** Two-column grid for better space utilization
- **Desktop:** Three-column grid for maximum information display

## 🛠️ Development

### Project Structure
```
src/app/
├── components/          # All UI components
│   ├── public-info.component.ts
│   ├── hospital-services.component.ts
│   ├── insurance-providers.component.ts
│   ├── faq.component.ts
│   ├── emergency-info.component.ts
│   └── navigation.component.ts
├── services/           # Data services
│   ├── public.service.ts
│   └── mock-data.service.ts
├── ui/                 # Reusable UI components
│   ├── card.component.ts
│   ├── button.component.ts
│   ├── input.component.ts
│   └── icon.component.ts
└── app.routes.ts       # Application routing
```

### Adding New Components
1. Create component in `components/` directory
2. Add route in `app.routes.ts`
3. Add navigation link in `navigation.component.ts`
4. Update mock data if needed

## 🎯 Key Features

### Search & Filter
- Real-time search across all components
- Department-based filtering
- Category browsing
- Advanced filtering options

### Interactive Elements
- Hover effects on cards
- Smooth transitions
- Loading states
- Error handling

### Accessibility
- Proper focus states
- Keyboard navigation
- Screen reader support
- High contrast design

## 🚀 Deployment

### Build for Production
```bash
ng build --configuration production
```

### Serve Production Build
```bash
ng serve --configuration production
```

## 📞 Support

For questions or issues:
- Check the FAQ component
- Contact support through the contact form
- Review the emergency information for urgent matters

---

**Note:** This is a frontend-only application with mock data. Connect to your backend API by updating the service configuration.
