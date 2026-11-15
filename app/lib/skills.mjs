// The skills a job posting can ask for, with the words a posting uses for each and, where known, the guides
// (or `guide:section`) that cover it. Whether a skill is "covered" is computed from the card bank, never written
// here, so it cannot go stale: the optional `guides` only widen what counts as a match.
//
// Aliases are matched as whole terms, case-insensitively (the character on each side must not be a letter or a
// digit), longest alias first. They avoid everyday words a posting uses in another sense: no bare `rest`,
// `express`, `spring`, `swift`, `cursor` or `go`. Keep to that rule when adding a skill.

/** @typedef {{id: string, label: string, aliases: string[], guides?: string[]}} Skill */

/** @type {Skill[]} */
export const SKILLS = [
  { id: 'javascript', label: 'JavaScript', aliases: ['javascript', 'js', 'es6', 'ecmascript'], guides: ['javascript', 'interview-prep:js'] },
  { id: 'typescript', label: 'TypeScript', aliases: ['typescript'], guides: ['typescript', 'interview-prep:ts'] },
  { id: 'react', label: 'React', aliases: ['react', 'react.js', 'reactjs', 'react hooks'], guides: ['react-training', 'reactjs', 'interview-prep:react'] },
  { id: 'nextjs', label: 'Next.js', aliases: ['next.js', 'nextjs', 'next js', 'app router', 'server components'], guides: ['nextjs', 'interview-prep:nextjs'] },
  { id: 'node', label: 'Node.js', aliases: ['node.js', 'nodejs', 'node js', 'node', 'express.js', 'expressjs', 'nestjs', 'fastify'], guides: ['nodejs', 'interview-prep:node'] },
  { id: 'css', label: 'CSS', aliases: ['css', 'css3', 'sass', 'scss', 'flexbox', 'responsive design'], guides: ['tailwind-css', 'interview-prep:css'] },
  { id: 'tailwind', label: 'Tailwind CSS', aliases: ['tailwind', 'tailwindcss'], guides: ['tailwind-css'] },
  { id: 'a11y', label: 'Accessibility', aliases: ['accessibility', 'a11y', 'wcag', 'aria'] },
  { id: 'testing', label: 'Testing', aliases: ['testing', 'unit tests', 'unit testing', 'tdd', 'jest', 'vitest', 'react testing library'], guides: ['testing', 'interview-prep:testing'] },
  { id: 'e2e', label: 'End-to-end testing', aliases: ['playwright', 'cypress', 'end-to-end', 'e2e'], guides: ['testing'] },
  { id: 'sql', label: 'SQL and PostgreSQL', aliases: ['sql', 'postgresql', 'postgres', 'mysql', 'relational database', 'relational databases'], guides: ['sql', 'interview-prep:db'] },
  { id: 'nosql', label: 'NoSQL', aliases: ['nosql', 'mongodb', 'dynamodb', 'document database'], guides: ['sql:sq8'] },
  { id: 'caching', label: 'Caching', aliases: ['redis', 'caching', 'memcached'] },
  { id: 'rest', label: 'REST APIs', aliases: ['restful', 'rest api', 'rest apis', 'api design', 'openapi', 'swagger'] },
  { id: 'graphql', label: 'GraphQL', aliases: ['graphql', 'apollo'] },
  { id: 'security', label: 'Auth and security', aliases: ['oauth', 'oauth2', 'oidc', 'jwt', 'authentication', 'authorisation', 'authorization', 'owasp', 'xss', 'csrf', 'web security'], guides: ['interview-prep:security', 'web-platform'] },
  { id: 'system-design', label: 'System design', aliases: ['system design', 'distributed systems', 'scalability', 'high availability'], guides: ['system-design', 'system-design-scale', 'interview-prep:sysdesign'] },
  { id: 'architecture', label: 'Architecture', aliases: ['microservices', 'micro-frontends', 'event-driven', 'software architecture', 'domain-driven design', 'cqrs'], guides: ['architecture', 'interview-prep:arch'] },
  { id: 'messaging', label: 'Messaging', aliases: ['kafka', 'rabbitmq', 'sqs', 'message queue', 'message queues', 'pub/sub'] },
  { id: 'performance', label: 'Performance', aliases: ['web performance', 'core web vitals', 'web vitals', 'performance optimisation', 'performance optimization', 'lighthouse'], guides: ['performance-optimization', 'interview-prep:perf'] },
  { id: 'aws', label: 'AWS', aliases: ['aws', 'amazon web services', 'lambda', 's3', 'ec2', 'ecs', 'cloudfront'], guides: ['aws'] },
  { id: 'azure', label: 'Azure', aliases: ['azure'] },
  { id: 'gcp', label: 'Google Cloud', aliases: ['gcp', 'google cloud'] },
  { id: 'docker', label: 'Docker', aliases: ['docker', 'containers', 'containerisation', 'containerization'] },
  { id: 'kubernetes', label: 'Kubernetes', aliases: ['kubernetes', 'k8s', 'helm'] },
  { id: 'cicd', label: 'CI/CD', aliases: ['ci/cd', 'ci cd', 'continuous integration', 'continuous delivery', 'github actions', 'jenkins', 'gitlab ci'] },
  { id: 'iac', label: 'Infrastructure as code', aliases: ['terraform', 'infrastructure as code', 'cloudformation', 'cdk'] },
  { id: 'git', label: 'Git', aliases: ['git', 'version control'] },
  { id: 'genai', label: 'Generative AI', aliases: ['generative ai', 'genai', 'llm', 'llms', 'rag', 'prompt engineering', 'ai agents', 'agentic'], guides: ['genai'] },
  { id: 'ai-dev', label: 'AI-assisted development', aliases: ['copilot', 'claude code', 'ai-assisted', 'ai coding tools'], guides: ['ai-dev'] },
  { id: 'state', label: 'State management', aliases: ['redux', 'zustand', 'state management', 'react query', 'tanstack query'] },
  { id: 'bundlers', label: 'Build tooling', aliases: ['webpack', 'vite', 'turbopack', 'babel'] },
  { id: 'realtime', label: 'Real-time', aliases: ['websocket', 'websockets', 'real-time', 'realtime', 'server-sent events'] },
  { id: 'observability', label: 'Observability', aliases: ['observability', 'monitoring', 'logging', 'datadog', 'opentelemetry', 'grafana', 'prometheus'] },
  { id: 'algorithms', label: 'Algorithms', aliases: ['algorithms', 'data structures', 'problem solving'], guides: ['coding-questions', 'interview-prep:coding'] },
  { id: 'behavioural', label: 'Working with people', aliases: ['agile', 'scrum', 'stakeholders', 'mentoring', 'leadership', 'collaboration', 'communication skills'], guides: ['behavioural'] },
  { id: 'i18n', label: 'Internationalisation', aliases: ['i18n', 'internationalisation', 'internationalization', 'localisation', 'localization'] },
  { id: 'python', label: 'Python', aliases: ['python', 'django', 'flask', 'fastapi'] },
  { id: 'java', label: 'Java', aliases: ['java', 'spring boot', 'spring framework'] },
  { id: 'golang', label: 'Go', aliases: ['golang', 'go lang'] },
  { id: 'dotnet', label: 'C# and .NET', aliases: ['c#', '.net', 'dotnet', 'asp.net'] },
  { id: 'php', label: 'PHP', aliases: ['php', 'laravel'] },
  { id: 'ruby', label: 'Ruby', aliases: ['ruby', 'rails'] },
  { id: 'rust', label: 'Rust', aliases: ['rust'] },
  { id: 'angular', label: 'Angular', aliases: ['angular'] },
  { id: 'vue', label: 'Vue', aliases: ['vue', 'vue.js', 'nuxt'] },
  { id: 'svelte', label: 'Svelte', aliases: ['svelte', 'sveltekit'] },
  { id: 'mobile', label: 'Mobile', aliases: ['react native', 'flutter', 'swiftui', 'kotlin', 'ios', 'android'] },
];
