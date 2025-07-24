export function parseMarkdown(content: string): { frontmatter: any; content: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return { frontmatter: {}, content };
  }
  
  const [, frontmatterText, bodyContent] = match;
  
  // Simple YAML parser for frontmatter
  const frontmatter: any = {};
  const lines = frontmatterText.split('\n');
  let currentKey = '';
  let currentObject: any = null;
  let inArray = false;
  let arrayItems: any[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Handle array items
    if (inArray && trimmedLine.startsWith('- ')) {
      arrayItems.push(trimmedLine.substring(2).trim());
      continue;
    } else if (inArray && !trimmedLine.startsWith(' ') && !trimmedLine.startsWith('-')) {
      // End of array
      frontmatter[currentKey] = arrayItems;
      inArray = false;
      arrayItems = [];
    }
    
    // Handle object properties
    if (currentObject && trimmedLine.includes(':') && trimmedLine.startsWith(' ')) {
      const [key, value] = trimmedLine.split(':').map(s => s.trim());
      const parsedValue = parseValue(value);
      currentObject[key] = parsedValue;
      continue;
    }
    
    // Handle main key-value pairs
    if (trimmedLine.includes(':')) {
      const colonIndex = trimmedLine.indexOf(':');
      const key = trimmedLine.substring(0, colonIndex).trim();
      const value = trimmedLine.substring(colonIndex + 1).trim();
      
      currentKey = key;
      
      // Check if it's an empty array
      if (value === '[]') {
        frontmatter[key] = [];
        currentObject = null;
      }
      // Check if it's an object
      else if (!value) {
        currentObject = {};
        frontmatter[key] = currentObject;
      }
      // Check if it's the start of an array
      else if (value === '' && lines[lines.indexOf(line) + 1]?.trim().startsWith('- ')) {
        inArray = true;
        arrayItems = [];
      }
      // Regular value
      else {
        frontmatter[key] = parseValue(value);
        currentObject = null;
      }
    }
  }
  
  // Handle any remaining array
  if (inArray) {
    frontmatter[currentKey] = arrayItems;
  }
  
  return { frontmatter, content: bodyContent.trim() };
}

function parseValue(value: string): any {
  // Remove quotes
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  
  // Parse numbers
  if (/^\d+$/.test(value)) {
    return parseInt(value, 10);
  }
  
  if (/^\d+\.\d+$/.test(value)) {
    return parseFloat(value);
  }
  
  // Parse booleans
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  
  return value;
}