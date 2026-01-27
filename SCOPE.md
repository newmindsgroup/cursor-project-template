# Scope

## In Scope

- Modern local dev + build system (Vite-based dev/build/preview commands)
- Reusable component/section architecture (standalone HTML partials)
- Design token system (Tailwind config as source of truth)
- Handoff Overlay system (toggleable UI showing specs/boundaries/tokens)
- Handoff Exporter (generates elementor-map.md/.json, page-index.json)
- Handoff Portal (self-contained /handoff page with downloads, QA checklist, screenshots)
- Container-friendly development (Dockerfile, docker-compose)
- Documentation templates and guides
- Accessibility and performance best practices

## Out of Scope

- Backend implementation or API development
- CMS integration or database setup
- Production deployment infrastructure
- SEO optimization beyond basic meta tags
- E-commerce functionality
- User authentication

## Non-goals

- Becoming a full-featured component library
- Replacing Elementor for production sites
- Supporting frameworks other than vanilla JS/TS

## Constraints

- Must work as a static site (no server-side rendering required)
- Must maintain compatibility with Elementor Pro implementation
- Must not require proprietary tools or paid services for core functionality
