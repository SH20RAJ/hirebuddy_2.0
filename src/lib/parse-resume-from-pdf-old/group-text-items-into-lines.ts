import type { TextItems, Lines, Line } from "../../types/resume";

/**
 * Step 2: Group text items into lines
 *
 * This groups text items that are on the same line (have similar y coordinates)
 * and sorts them by their x position to maintain reading order.
 */
export const groupTextItemsIntoLines = (textItems: TextItems): Lines => {
  const lines: Lines = [];
  
  // Group text items by similar y coordinates (allowing for small variations)
  const lineGroups: { [key: string]: TextItems } = {};
  
  for (const textItem of textItems) {
    // Round y coordinate to group items on the same line
    const roundedY = Math.round(textItem.y);
    const key = roundedY.toString();
    
    if (!lineGroups[key]) {
      lineGroups[key] = [];
    }
    lineGroups[key].push(textItem);
  }
  
  // Convert groups to lines
  for (const [yStr, items] of Object.entries(lineGroups)) {
    if (items.length === 0) continue;
    
    // Sort items by x position (left to right)
    items.sort((a, b) => a.x - b.x);
    
    // Combine text items into a single line
    const text = items.map(item => item.text).join(' ').trim();
    if (!text) continue;
    
    // Calculate line boundaries
    const minX = Math.min(...items.map(item => item.x));
    const maxX = Math.max(...items.map(item => item.x + item.width));
    const y = parseFloat(yStr);
    const height = Math.max(...items.map(item => item.height));
    
    const line: Line = {
      text,
      x: minX,
      y,
      width: maxX - minX,
      height
    };
    
    lines.push(line);
  }
  
  // Sort lines by y position (top to bottom, since PDF coordinates are bottom-up)
  lines.sort((a, b) => b.y - a.y);
  
  return lines;
}; 