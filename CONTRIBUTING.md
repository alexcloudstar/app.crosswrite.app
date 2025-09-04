# Contributing to Cross Write

Thank you for your interest in contributing to Cross Write! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- A GitHub account

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/app.crosswrite.app.git
   cd app.crosswrite.app
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables**:
   ```bash
   cp example.env .env.local
   # Edit .env.local with your configuration
   ```
5. **Set up the database**:
   ```bash
   npm run db:generate
   npm run db:push
   ```
6. **Start the development server**:
   ```bash
   npm run dev
   ```

## 🐛 Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Use the issue template** when available
3. **Provide detailed information**:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Node.js version)

## 🔧 Making Changes

### Branch Naming

Use descriptive branch names:
- `feature/add-new-platform`
- `fix/editor-save-bug`
- `docs/update-readme`
- `refactor/cleanup-components`

### Commit Messages

Follow conventional commit format:
```
type(scope): description

feat(editor): add markdown preview toggle
fix(auth): resolve session timeout issue
docs(readme): update installation instructions
```

### Code Style

- **TypeScript**: Use strict typing
- **React**: Prefer functional components with hooks
- **Styling**: Use Tailwind CSS classes
- **Formatting**: Code is automatically formatted with Prettier
- **Linting**: Follow ESLint rules

### Testing

- Test your changes thoroughly
- Ensure the app builds without errors: `npm run build`
- Test in different browsers if applicable
- Verify responsive design on mobile devices

## 📝 Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following the guidelines above
3. **Test thoroughly** before submitting
4. **Update documentation** if needed
5. **Submit a pull request** with:
   - Clear title and description
   - Reference any related issues
   - Screenshots for UI changes
   - Testing instructions

### PR Review Process

- All PRs require review before merging
- Address feedback promptly
- Keep PRs focused and reasonably sized
- Update your branch if conflicts arise

## 🎯 Areas for Contribution

### High Priority
- **Bug fixes** - Any issues reported in the repository
- **Documentation** - Improving README, guides, and code comments
- **Testing** - Adding tests and improving test coverage
- **Performance** - Optimizing slow operations

### Medium Priority
- **New features** - Check with maintainers first
- **UI/UX improvements** - Better user experience
- **Accessibility** - Making the app more accessible
- **Internationalization** - Multi-language support

### Low Priority
- **Code refactoring** - Improving code structure
- **Dependencies** - Updating and optimizing packages
- **Build tools** - Improving development experience

## 🤝 Community Guidelines

- **Be respectful** and constructive in discussions
- **Help others** when you can
- **Follow the Code of Conduct**
- **Ask questions** if you're unsure about anything

## 📞 Getting Help

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and general discussion
- **Pull Request Comments** - For specific code-related questions

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributor statistics

Thank you for contributing to Cross Write! 🚀
