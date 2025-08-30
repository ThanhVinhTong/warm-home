# Warm Home 🏠

Warm Home is a comprehensive Next.js application for analyzing house prices across Australian suburbs, providing interactive data visualization, and helping users make informed real estate decisions.

## ✨ Features

### 🎯 **Core Functionality**
- **House Price Analysis Dashboard**: Comprehensive analytics with interactive charts and statistics
- **Multi-Level Data Filtering**: State → Suburb cascading filters for precise data exploration
- **Real-Time Data Visualization**: Dynamic charts that update based on user selections
- **Property Search & Management**: Find and analyze properties with detailed information
- **User-Friendly Interface**: Designed for both tech-savvy users and those needing assistance

### 📊 **Analytics & Charts**
- **Bar Charts**: House prices by suburb, filtered by state
- **Line Graphs**: Price trends over time for specific suburbs
- **State Comparisons**: Average house prices across different states
- **Statistical Overview**: Min/Max/Average price calculations
- **Interactive Filters**: Searchable dropdowns with autocomplete

- Node.js (v18+ recommended)
- PNPM (or NPM) for package management
- MongoDB Atlas account (free tier works)
- Optional: Domain API key for real property data (from [developer.domain.com.au](https://developer.domain.com.au/))

### 🎨 **User Experience**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Loading States**: Professional loading indicators and skeleton components
- **Error Handling**: Graceful error handling with user-friendly messages
- **Accessibility**: Proper labels, ARIA attributes, and keyboard navigation

## 🚀 **Getting Started**

### Prerequisites
- **Node.js** (v18+ recommended)
- **PNPM** or **NPM** for package management
- **MongoDB Atlas** account (free tier works perfectly)
- **Modern Browser** with ES6+ support

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/warm-home.git
   cd warm-home
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Start the development server**:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## 🗃️ **Database Setup**

### Seeding Sample Data
The app includes comprehensive sample data for testing:

1. **Ensure the app is running**
2. **Visit** [http://localhost:3000/seed](http://localhost:3000/seed)
3. **Check the response**: `{ "message": "Database seeded successfully" }`

### Sample Data Includes
- **8 States**: VIC, NSW, QLD, WA, SA, TAS, NT, ACT
- **80 Suburbs**: 10 suburbs per state with realistic data
- **800 Properties**: 10 properties per suburb with varied characteristics
- **Price Ranges**: $400K - $2M with realistic variations
- **Property Types**: Houses, Apartments, Townhouses

## 📱 **Usage Guide**

### 🏠 **Landing Page** (`/`)
- **Welcome Screen**: Introduction to Warm Home features
- **Feature Overview**: Market analysis, property search, price insights
- **Quick Navigation**: Direct access to dashboard

### 📊 **Dashboard** (`/dashboard`)
- **Summary Cards**: States count, suburbs count, houses count, average price
- **Price Charts**: Suburb median prices visualization
- **Latest Properties**: Recent property listings
- **House Price Analysis**: Comprehensive analytics section

### 📈 **House Price Analysis**
1. **Bar Chart Section**: Select state → view suburb prices
2. **Line Graph Section**: Select state → search suburb → view trends
3. **City Comparison**: View average prices across states
4. **Statistics Section**: Select state → optional suburb → view min/max/avg

### 🔍 **Navigation Features**
- **State Selection**: Dropdown with all available states
- **Suburb Search**: Type-to-search with autocomplete
- **Cascading Filters**: State → Suburb → Data loading
- **Loading States**: Professional feedback during data fetching

## 🛠️ **Technical Architecture**

### **Frontend**
- **Next.js 15**: Latest version with App Router
- **React 18**: Modern React with hooks and Suspense
- **TypeScript**: Full type safety and better development experience
- **Tailwind CSS**: Utility-first CSS framework for responsive design

### **Backend**
- **API Routes**: Server-side data processing
- **MongoDB**: NoSQL database with aggregation pipelines
- **Data Validation**: Type-safe data handling
- **Error Handling**: Comprehensive error management

### **Data Flow**
1. **User Selection** → State/Suburb filters
2. **API Calls** → MongoDB queries with proper aggregation
3. **Data Processing** → Format and structure for charts
4. **UI Updates** → Dynamic rendering with loading states

## 🔧 **Development**

### **Project Structure**
```
warm-home/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── ui/                # Reusable UI components
│   └── lib/               # Utility functions
├── components/             # Shared components
├── public/                 # Static assets
└── package.json           # Dependencies
```

### **Key Components**
- **Chart Components**: Recharts-based visualizations
- **Skeleton Components**: Loading state placeholders
- **Filter Components**: State and suburb selection
- **Layout Components**: Dashboard structure and navigation

### **API Endpoints**
- `/api/data/states` - Get all states
- `/api/data/suburbs` - Get suburbs by state
- `/api/data/properties` - Get properties with filters
- `/api/data/bar-chart` - Bar chart data
- `/api/data/line-graph` - Line graph data
- `/api/data/stats` - Statistical calculations

## 🚀 **Deployment**

### **Environment Variables**
- `MONGODB_URI`: MongoDB connection string
- `NEXT_PUBLIC_BASE_URL`: Public URL for API calls

### **Build Commands**
```bash
# Development
pnpm dev

# Production build
pnpm build
pnpm start

# Linting
pnpm lint
```

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit with clear messages**: `git commit -m 'Add amazing feature'`
5. **Push to your branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request** with detailed description

### **Development Guidelines**
- **TypeScript**: Use strict typing
- **Component Design**: Follow React best practices
- **Error Handling**: Implement proper error boundaries
- **Testing**: Add tests for new features
- **Documentation**: Update README for new features

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Documentation**: Check this README and code comments

## 🔮 **Future Enhancements**

- **Real-time Data**: Live property updates
- **Advanced Filters**: More sophisticated search options
- **User Accounts**: Personalized dashboards
- **Mobile App**: React Native companion app
- **AI Insights**: Machine learning price predictions

---

**Built with ❤️ for the Australian real estate community**

*For questions, support, or collaboration, reach out through GitHub or open an issue.*