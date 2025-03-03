import type { TextOperation } from '~/models/TextOperation';
import type { TextOperationResult } from '~/models/TextOperationResult';
import type { TextSelection } from '~/models/TextSelection';

export class InsertContentOperation implements TextOperation {
  private content: string;

  constructor(content: string) {
    this.content = content;
  }

  apply(text: string, selection: TextSelection): TextOperationResult {
    // Replace selection with new content
    const newText = 
      text.substring(0, selection.start) + 
      this.content + 
      text.substring(selection.end);
    
    // Calculate new cursor position
    const newPosition = selection.start + this.content.length;
    
    return {
      text: newText,
      selection: { start: newPosition, end: newPosition }
    };
  }
}