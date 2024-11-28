# Hidden Gems Finder

A tool to discover valuable but lesser-known GitHub repositories, focusing on quality metrics beyond just star counts.

## Features

- Smart repository discovery based on multiple quality metrics
- Advanced filtering by language, time period, and quality factors
- Clean, modern interface with smooth animations
- Intelligent caching and rate limit handling
- Detailed repository insights

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hidden-gems-finder.git
cd hidden-gems-finder
```

2. Install dependencies:
```bash
npm install
```

3. Set up GitHub authentication:

Create a `.env` file in the root directory with your GitHub personal access token:
```env
# Generate a token at https://github.com/settings/tokens
# Required scopes: public_repo, read:user, read:org
GITHUB_TOKEN=your_github_token_here
```

To create a GitHub token:
1. Go to [GitHub Settings > Developer Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "Hidden Gems Finder")
4. Select the following scopes:
   - `public_repo`
   - `read:user`
   - `read:org`
5. Copy the generated token and paste it in your `.env` file

> **Note:** Without a GitHub token, the application will use unauthenticated requests, which have a much lower rate limit (60 requests per hour vs 5,000 requests per hour with authentication).

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173)

## Quality Metrics

The application uses several metrics to evaluate repository quality:

- **Documentation Score**: Based on readme quality and documentation completeness
- **Maintenance Score**: Evaluates commit frequency and update recency
- **Community Score**: Measures contributor activity and community engagement
- **Code Quality Score**: Analyzes various code quality indicators

## Architecture

- **Frontend**: Remix.js with shadcn/ui components
- **Caching**: In-memory caching with configurable TTL
- **Rate Limiting**: Smart rate limit handling with queuing
- **API Integration**: GitHub API v3 with proper error handling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.