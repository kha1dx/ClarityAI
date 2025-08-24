# Prompt Studio

An AI-powered prompt development studio built with Next.js 15 and Supabase. Create, test, manage, and optimize prompts for various AI models with an intuitive interface and powerful backend.

## Features

- **Prompt Management**: Create, edit, and organize prompts with version control
- **AI Integration**: Test prompts with multiple AI models (OpenAI, Claude, etc.)
- **Real-time Collaboration**: Share and collaborate on prompts with your team
- **Performance Analytics**: Track prompt performance and optimization metrics
- **Template Library**: Pre-built prompt templates for common use cases
- **Version Control**: Track changes and maintain prompt history
- **Export/Import**: Share prompts across different environments

## Tech Stack

- **Frontend**: Next.js 15 with React 19
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Type Safety**: TypeScript
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod validation
- **AI Integration**: OpenAI API (extensible to other providers)

## Quick Start

### Prerequisites

- Node.js 20 or higher
- npm or yarn package manager
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/[username]/prompt-studio.git
   cd prompt-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # AI API Keys
   OPENAI_API_KEY=your_openai_api_key
   
   # Optional: Other AI providers
   ANTHROPIC_API_KEY=your_anthropic_key
   ```

4. **Set up the database**
   ```bash
   npm run db:setup
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Development

### Project Structure

```
prompt-studio/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main application pages
│   └── api/               # API routes
├── lib/                   # Utilities and configurations
│   ├── services/          # External service integrations
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Helper functions
│   └── types/             # TypeScript type definitions
├── stores/                # Zustand state management
├── supabase/             # Database migrations and types
├── scripts/              # Database and deployment scripts
└── .github/              # GitHub workflows and templates
```

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:setup` - Set up database with migrations
- `npm run db:types` - Generate TypeScript types from Supabase schema
- `npm run db:reset` - Reset database (development only)
- `npm run db:status` - Check database connection status

### Database Schema

The application uses Supabase with the following main tables:

- **users** - User profiles and authentication
- **workspaces** - Team workspaces for collaboration
- **prompts** - Prompt storage and metadata
- **prompt_versions** - Version history for prompts
- **prompt_executions** - Execution history and analytics
- **templates** - Reusable prompt templates

See [DATABASE_SETUP_GUIDE.md](DATABASE_SETUP_GUIDE.md) for detailed schema information.

## API Documentation

The application exposes several API endpoints for prompt management:

- `POST /api/prompts` - Create new prompt
- `GET /api/prompts` - List prompts with filtering
- `PUT /api/prompts/[id]` - Update existing prompt
- `DELETE /api/prompts/[id]` - Delete prompt
- `POST /api/prompts/[id]/execute` - Execute prompt with AI model

For complete API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npx vercel
   ```

2. **Configure environment variables** in the Vercel dashboard

3. **Deploy**
   ```bash
   npx vercel --prod
   ```

### Docker

```dockerfile
# Build and run with Docker
docker build -t prompt-studio .
docker run -p 3000:3000 prompt-studio
```

### Environment Variables for Production

Make sure to set these in your production environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- Additional AI provider keys as needed

## Contributing

We welcome contributions! Please read our [Contributing Guide](.github/CONTRIBUTING.md) for details on:

- Code of conduct
- Development setup
- Coding standards
- Pull request process
- Issue reporting

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test them
4. Commit: `git commit -m 'feat: add amazing feature'`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

## Security

- All API keys should be stored as environment variables
- Never commit sensitive information to the repository
- Use Supabase Row Level Security (RLS) for data protection
- Report security vulnerabilities privately

## Roadmap

### Current Focus (v0.1.x)
- [ ] Core prompt management features
- [ ] Basic AI model integration
- [ ] User authentication and profiles
- [ ] Workspace collaboration

### Upcoming (v0.2.x)
- [ ] Advanced prompt templates
- [ ] Performance analytics dashboard
- [ ] Multi-model comparison
- [ ] API rate limiting and usage tracking

### Future (v0.3.x+)
- [ ] Mobile application
- [ ] Plugin system for custom AI providers
- [ ] Advanced collaboration features
- [ ] Prompt marketplace

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/[username]/prompt-studio/issues)
- 💬 [Discussions](https://github.com/[username]/prompt-studio/discussions)
- 📧 Email: [support@promptstudio.dev]

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [Supabase](https://supabase.com/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)

---

Made with ❤️ for the AI development community