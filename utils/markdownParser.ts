import yaml from 'js-yaml';

export function parseMarkdown(content: string): { frontmatter: any; content: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, content };
  }
  
  const [, frontmatterText, bodyContent] = match;
  
  try {
    const frontmatter = yaml.load(frontmatterText) || {};
    return { frontmatter, content: bodyContent.trim() };
  } catch (error) {
    console.error('YAML parsing error:', error);
    return { frontmatter: {}, content: bodyContent.trim() };
  }
}