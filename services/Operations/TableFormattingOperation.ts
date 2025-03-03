import type { TextOperation } from '~/models/TextOperation';
import type { TextOperationResult } from '~/models/TextOperationResult';
import type { TextSelection } from '~/models/TextSelection';

export class TableFormattingOperation implements TextOperation {
  apply(text: string, selection: TextSelection): TextOperationResult {
    // Get selected text
    const selectedText = text.substring(selection.start, selection.end);
    
    // Check if it's a table
    if (!selectedText.includes('|')) {
      return { text, selection };
    }
    
    const lines = selectedText.split('\n');
    if (lines.length < 2) {
      return { text, selection };
    }
    
    // Parse headers
    const headers = lines[0]
      .trim()
      .split('|')
      .filter(header => header.trim() !== '')
      .map(header => header.trim());
    
    if (headers.length === 0) {
      return { text, selection };
    }
    
    // Calculate column widths
    const columnWidths = new Array(headers.length).fill(0);
    
    // Update widths based on headers
    headers.forEach((header, index) => {
      columnWidths[index] = Math.max(columnWidths[index], header.length);
    });
    
    // Check all rows for content width
    for (let i = 1; i < lines.length; i++) {
      if (i === 1 && lines[i].includes('--')) continue; // Skip separator line
      
      const cells = lines[i]
        .trim()
        .split('|')
        .filter(cell => cell !== '')
        .map(cell => cell.trim());
      
      cells.forEach((cell, index) => {
        if (index < columnWidths.length) {
          columnWidths[index] = Math.max(columnWidths[index], cell.length);
        }
      });
    }
    
    // Format table
    let formattedTable = '';
    
    // Add headers
    formattedTable += '|';
    headers.forEach((header, index) => {
      formattedTable += ` ${header.padEnd(columnWidths[index])} |`;
    });
    formattedTable += '\n';
    
    // Add separator
    formattedTable += '|';
    columnWidths.forEach(width => {
      formattedTable += `${'-'.repeat(width + 2)}|`;
    });
    formattedTable += '\n';
    
    // Add content
    for (let i = 1; i < lines.length; i++) {
      // Skip existing separator line
      if (i === 1 && lines[i].includes('--')) continue;
      
      const cells = lines[i]
        .trim()
        .split('|')
        .filter(cell => cell !== '')
        .map(cell => cell.trim());
      
      formattedTable += '|';
      cells.forEach((cell, index) => {
        if (index < columnWidths.length) {
          formattedTable += ` ${cell.padEnd(columnWidths[index])} |`;
        }
      });
      formattedTable += '\n';
    }
    
    // Replace the selected text with formatted table
    const newText = 
      text.substring(0, selection.start) + 
      formattedTable.trim() + 
      text.substring(selection.end);
    
    return {
      text: newText,
      selection: { 
        start: selection.start, 
        end: selection.start + formattedTable.length
      }
    };
  }
}