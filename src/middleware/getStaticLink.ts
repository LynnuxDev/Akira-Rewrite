import fs from 'fs';
import path from 'path';

export type Links = {
  [key: string]: string;
};

export function getLink(key: keyof Links): string {
  try {
    const filePath = path.join(process.cwd(), 'static/links.json');

    if (!fs.existsSync(filePath)) {
      return 'Error: links.json file does not exist.';
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    let links: Links;

    try {
      links = JSON.parse(rawData);
    } catch (err) {
      return 'Error: links.json is not a valid JSON file.';
    }

    if (key in links) {
      return links[key];
    } else {
      return `Error: Key "${key}" not found in links.json`;
    }
  } catch (err) {
    console.error('Error reading links.json:', err);
    return 'Error: Unable to read links file.';
  }
}
