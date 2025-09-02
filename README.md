# Under Construction
This project is a work in progress.

# 🔗 LinkVault

**Your personal hub for organizing and sharing important links**

LinkVault is a modern, intuitive web application that helps you organize, manage, and access your important links in one centralized location. Say goodbye to scattered bookmarks and hello to a beautifully organized link management system.

## Features

### Current Features
- **Google OAuth Authentication** - Secure login with your Google account
- **Organized Sections** - Create custom sections to categorize your links
- **Pin Important Links** - Pin frequently used links for quick access
- **Quick Actions** - One-click pin, copy, edit, and external link access
- **Drag & Drop Reordering** - Easily reorder sections with intuitive drag & drop
- **Inline Editing** - Edit links and sections without complex modals
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Modern UI** - Beautiful, gradient-enhanced interface with smooth animations

### Enhanced User Experience
- **Always-visible controls** - Pin and action buttons visible on every card
- **Smart visual feedback** - Color-coded pin states and copy confirmations
- **Smooth animations** - Polished interactions and hover effects
- **Quick copy-to-clipboard** - Share links instantly with one click
- **Enhanced pinned section** - Special styling for your most important links

## Upcoming Features

### Collaboration & Sharing
- **Share Sections** - Share entire sections with other users
- **Public Link Collections** - Create public, shareable link collections
- **Team Workspaces** - Collaborate on link collections with your team
- **Comments & Notes** - Add collaborative notes to shared links

### Advanced Organization
- **Tags & Labels** - Tag links for better categorization
- **Advanced Search** - Find links quickly with full-text search
- **Usage Analytics** - Track which links you use most
- **Nested Folders** - Create hierarchical folder structures

### Productivity Features
- **Link Previews** - Automatic website previews and metadata
- **Mobile App** - Native iOS and Android applications
- **Link Monitoring** - Get notified when links go offline
- **Bulk Import/Export** - Import from browsers, export to various formats
- 🤖 **AI Categorization** - Automatic link categorization using AI

### Integration & Automation
- 🔌 **Browser Extensions** - Quick-save links from any website
- ⚡ **API Access** - Developer API for custom integrations
- 🔄 **Zapier Integration** - Connect with your favorite productivity tools
- 📧 **Email Integration** - Save links directly from emails

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development for better code quality
- **Vite** - Fast development build tool
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **React Query (@tanstack/react-query)** - Powerful data fetching and caching
- **React Router DOM** - Client-side routing
- **React Hook Form** - Performant forms with easy validation
- **@dnd-kit** - Modern drag and drop library
- **Lucide React** - Beautiful, customizable icons

### Backend
- **FastAPI** - Modern, fast web framework for Python
- **SQLAlchemy** - Powerful SQL toolkit and ORM
- **SQLite** - Lightweight, serverless database (easily upgradeable to PostgreSQL)
- **Pydantic** - Data validation using Python type annotations
- **Authlib** - Comprehensive OAuth library
- **Uvicorn** - Lightning-fast ASGI server

### Authentication & Security
- **Google OAuth 2.0** - Secure authentication via Google
- **Session-based auth** - Secure session management
- **CORS protection** - Cross-origin request security
- **Environment-based configuration** - Secure credential management

### Development & Deployment
- **Python 3.8+** - Modern Python features
- **Node.js 16+** - JavaScript runtime for frontend tooling
- **Git** - Version control
- **Environment variables** - Secure configuration management

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Environment Configuration
Create a `.env` file in the backend directory:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SECRET_KEY=your_secret_key
DATABASE_URL=sqlite:///./linkvault.db
```

