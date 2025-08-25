# WealthAI1 Portal

AI-Powered Technology for Smarter Markets - Official web portal for WealthAI1 and MarketsAI1 platforms.

## 🚀 Features

- **WealthAI1 Homepage**: Complete overview of AI-powered fintech solutions
- **MarketsAI1 Platform**: Dedicated landing and application for trading strategies
- **Founders Story**: Detailed information about the founding team and their expertise
- **Contact System**: Comprehensive contact forms and information
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Google OAuth**: Secure authentication for MarketsAI1 platform

## 🛠️ Tech Stack

- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **Google OAuth2**: Secure authentication
- **Responsive Design**: Mobile-first approach

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Navigation.jsx
│   ├── WealthAI1Home.jsx
│   ├── MarketsAI1Landing.jsx
│   ├── MarketsAI1App.jsx
│   ├── FoundersPage.jsx
│   ├── ProductsPage.jsx
│   ├── ServicesPage.jsx
│   ├── InsightsPage.jsx
│   ├── ContactPage.jsx
│   ├── ContactSection.jsx
│   └── Footer.jsx
├── App.jsx
├── index.js
└── index.css
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/wealthai1-portal.git
cd wealthai1-portal
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Update environment variables in `.env.local`:
```
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
REACT_APP_WEALTHWISERS_URL=https://wealthwisers.in
```

5. Start development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 🎨 Brand Colors

- **Deep Trust Blue**: #1F497D (Primary brand)
- **Emerald Green**: #2ECC71 (Growth/positive)
- **Analytical Teal**: #00A8B5 (MarketsAI1)
- **Metallic Gold**: #C9A54D (Premium accents)

## 📱 Pages

- **Home** (`/`): Main WealthAI1 landing page
- **Products** (`/products`): Product ecosystem overview
- **Services** (`/services`): Custom development services
- **About Us** (`/founders`): Founders and team information
- **Insights** (`/insights`): Blog and research content
- **Contact** (`/contact`): Contact forms and information
- **MarketsAI1** (`/marketsai1`): MarketsAI1 platform landing
- **MarketsAI1 App** (`/marketsai1-app`): Protected application (requires auth)

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to AWS S3 + CloudFront
1. Build the project: `npm run build`
2. Upload `build/` contents to S3 bucket
3. Configure CloudFront distribution
4. Update DNS records

## 🔧 Configuration

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project
3. Enable Google+ API
4. Create OAuth 2.0 Client ID
5. Add authorized origins: `https://marketsai1.in`
6. Update `REACT_APP_GOOGLE_CLIENT_ID` in environment

### Environment Variables
- `REACT_APP_GOOGLE_CLIENT_ID`: Google OAuth client ID
- `REACT_APP_WEALTHWISERS_URL`: TradeAI1 portal URL
- `REACT_APP_ENVIRONMENT`: Environment (development/production)

## 📞 Contact

- **General**: contact@wealthai1.in
- **Support**: support@marketsai1.in
- **Partnerships**: partnerships@wealthai1.in
- **Projects**: projects@wealthai1.in

## 📄 License

© 2024 WealthAI1. All rights reserved.

---

**Built with ❤️ for the future of AI-powered trading**