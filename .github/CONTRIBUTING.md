# Contributing to Prompt Studio

Thank you for your interest in contributing to Prompt Studio! This document provides guidelines and instructions for contributing to the project.

## 🚀 Getting Started

### Prerequisites
- Node.js 20 or higher
- npm or yarn package manager
- Git
- Supabase account (for database functionality)

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/[username]/prompt-studio.git
   cd prompt-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials and other required environment variables

4. **Database Setup**
   ```bash
   npm run db:setup
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🤝 How to Contribute

### Reporting Issues
- Use the [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.yml) for bugs
- Use the [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.yml) for new features
- Search existing issues before creating a new one
- Provide detailed information and reproduction steps

### Development Workflow

1. **Fork the repository** to your GitHub account

2. **Create a feature branch** from `develop`
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** following our coding standards

4. **Test your changes**
   ```bash
   npm run lint
   npm run build
   # Add tests when available: npm test
   ```

5. **Commit your changes** following our commit conventions
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request** using our PR template

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add prompt template management
fix: resolve authentication issue with Supabase
docs: update API documentation
```

## 📋 Code Style Guidelines

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer functional programming patterns when appropriate

### React Components
- Use functional components with hooks
- Follow the component structure:
  ```typescript
  // Imports
  // Types/Interfaces
  // Component definition
  // Export
  ```
- Use proper prop typing with TypeScript
- Implement error boundaries for complex components

### File Organization
```
app/
├── (routes)/          # App router pages
├── api/              # API routes
├── components/       # Reusable components
│   ├── ui/          # Basic UI components
│   └── feature/     # Feature-specific components
lib/
├── utils/           # Utility functions
├── hooks/           # Custom React hooks
├── services/        # External service integrations
└── types/           # TypeScript type definitions
```

### CSS/Styling
- Use Tailwind CSS for styling
- Follow mobile-first responsive design
- Use semantic class names
- Maintain consistent spacing and colors

## 🧪 Testing

### Current Testing Setup
- ESLint for code quality
- TypeScript for type checking
- Build verification in CI/CD

### Future Testing Implementation
We plan to add:
- Jest for unit testing
- React Testing Library for component testing
- Cypress for end-to-end testing

## 📚 Documentation

### Code Documentation
- Document complex functions and classes
- Use TypeScript types for self-documenting code
- Add README files for major features

### API Documentation
- Document all API endpoints
- Include request/response examples
- Update API documentation with changes

## 🔍 Pull Request Guidelines

### Before Submitting
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Tests pass (when available)
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] Linked to relevant issues

### PR Review Process
1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Code Review**: Team members review the code
3. **Testing**: Manual testing if needed
4. **AI Review**: Automated AI-powered code review
5. **Approval**: At least one approval required
6. **Merge**: Squash and merge to maintain clean history

### Review Criteria
- Functionality works as expected
- Code is clean and maintainable
- Performance considerations addressed
- Security implications considered
- Documentation is adequate

## 🚨 Security

### Reporting Security Issues
- **DO NOT** create public issues for security vulnerabilities
- Email security concerns to [security@email.com]
- Provide detailed information about the vulnerability

### Security Best Practices
- Never commit sensitive information (API keys, passwords)
- Use environment variables for configuration
- Validate all user inputs
- Follow secure coding practices
- Keep dependencies updated

## 🌟 Community Guidelines

### Code of Conduct
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Maintain professional communication
- Follow GitHub's Community Guidelines

### Getting Help
- Check existing documentation first
- Search issues for similar questions
- Ask questions in discussions or issues
- Join our community channels (if available)

## 📋 Project Roadmap

### Current Focus
- Core prompt management features
- AI integration improvements
- User interface enhancements
- Performance optimizations

### Upcoming Features
- Advanced prompt templates
- Team collaboration features
- Integration with more AI services
- Mobile application

## 🏆 Recognition

Contributors who make significant improvements will be:
- Added to the contributors list
- Mentioned in release notes
- Invited to join the core team (for ongoing contributors)

## 📞 Contact

- Project Maintainer: [Your Name]
- Email: [your.email@example.com]
- GitHub: [@yourusername]

Thank you for contributing to Prompt Studio! 🎉