# Business Context (Local Only)

This folder is for local reference context to inform AI-powered content generation.

## Structure

```
business-context/
├── templates/                        # Templates for gathering business information
│   ├── company-profile.md            # Company overview template
│   ├── target-audience.md            # Audience persona template
│   └── extracted-context.example.json # Example of parsed output structure
├── uploads/                          # Files uploaded via the Setup Wizard (gitignored)
│   └── .gitkeep
├── extracted-context.json            # Parsed text from uploaded files (generated, gitignored)
└── README.md
```

## Getting Started

### Option 1: Use the Setup Wizard (Recommended)
1. Run `npm run wizard` to start the Setup Wizard
2. Upload files in Step 3 (Upload Context)
3. Files are automatically parsed and consolidated
4. The AI uses extracted content to generate website copy

### Option 2: Manual Template Approach
1. Copy templates from `templates/` folder
2. Fill in the information for your project
3. Save completed templates to `uploads/`
4. Run `npm run generate:analyze` to parse the content

## Templates Included

### company-profile.md
Comprehensive company information template including:
- Basic information (name, tagline, location)
- Mission, vision, and values
- Products/services with USP
- Brand voice guidelines
- Competitive landscape
- Contact information

### target-audience.md
Detailed audience persona template including:
- Demographics and psychographics
- Goals and motivations
- Pain points and objections
- Buying journey mapping
- Content implications

### extracted-context.example.json
Example of the JSON structure generated after parsing uploads. Review this to understand:
- How company information is structured
- Expected fields for each section
- Data format used by AI generation scripts

## What to Upload

The Setup Wizard accepts these file types:
- **PDF** (.pdf) - Brochures, reports, brand guidelines
- **Word** (.doc, .docx) - Content documents, discovery notes
- **Excel/CSV** (.xls, .xlsx, .csv) - Product catalogs, pricing data
- **Images** (.png, .jpg, .webp) - Logos, reference images
- **Text/Markdown** (.txt, .md) - Notes, specifications

## Best Practices

1. **Quality over quantity**: A well-filled company profile template is more valuable than many incomplete documents
2. **Include specifics**: Real numbers, actual testimonials, and concrete examples help AI generate better content
3. **Brand voice matters**: Clear brand guidelines produce more consistent website copy
4. **Keep it current**: Update uploads when business information changes

## Important Notes

- **Do not commit client-sensitive files** - All uploads are gitignored by default
- The `uploads/` folder and `extracted-context.json` are in `.gitignore`
- Templates in `templates/` are safe to commit (they contain no client data)
- For shared references, use a separate private repo or approved shared storage
