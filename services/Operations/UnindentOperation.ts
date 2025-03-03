import type { TextOperation } from '~/models/TextOperation';
import type { TextOperationResult } from '~/models/TextOperationResult';
import type { TextSelection } from '~/models/TextSelection';

export class UnindentOperation implements TextOperation {
  private indentSize: number;

  constructor(indentSize = 2) {
    this.indentSize = indentSize;
  }

  apply(text: string, selection: TextSelection): TextOperationResult {
    const lines = text.split('\n');
    const startLine = text.substring(0, selection.start).split('\n').length - 1;
    const endLine = text.substring(0, selection.end).split('\n').length - 1;
    
    let resultText = '';
    let lineStart = 0;
    let newStart = selection.start;
    let newEnd = selection.end;
    let removedChars = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length;
      let line = lines[i];
      
      if (i >= startLine && i <= endLine) {
        // Check for leading spaces to remove
        const leadingSpaces = line.match(/^[ \t]+/);
        if (leadingSpaces) {
          const spaceCount = Math.min(leadingSpaces[0].length, this.indentSize);
          line = line.substring(spaceCount);
          
          // Update selection position
          if (i === startLine) {
            newStart = Math.max(selection.start - spaceCount, lineStart);
          }
          
          removedChars += spaceCount;
        }
      }
      
      resultText += (i > 0 ? '\n' : '') + line;
      lineStart += lineLength + 1; // +1 for the newline
    }
    
    newEnd = Math.max(selection.end - removedChars, newStart);
    
    return {
      text: resultText,
      selection: { start: newStart, end: newEnd }
    };
  }
}