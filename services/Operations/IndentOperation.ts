import type { TextOperation } from "~/models/TextOperation";
import type { TextOperationResult } from "~/models/TextOperationResult";
import type { TextSelection } from "~/models/TextSelection";

export class IndentOperation implements TextOperation {
  private indentation: string;

  constructor(spacesCount = 2) {
    this.indentation = " ".repeat(spacesCount);
  }

  apply(text: string, selection: TextSelection): TextOperationResult {
    // If multiple lines are selected
    if (
      selection.start !== selection.end &&
      text.substring(selection.start, selection.end).includes("\n")
    ) {
      const selectedText = text.substring(selection.start, selection.end);
      const lines = selectedText.split("\n");
      const newText = lines
        .map((line) => `${this.indentation}${line}`)
        .join("\n");

      const beforeSelection = text.substring(0, selection.start);
      const afterSelection = text.substring(selection.end);
      const newFullText = beforeSelection + newText + afterSelection;

      return {
        text: newFullText,
        selection: {
          start: selection.start,
          end: selection.start + newText.length,
        },
      };
    } else {
      // Single line or cursor
      const newText =
        text.substring(0, selection.start) +
        this.indentation +
        text.substring(selection.end);

      return {
        text: newText,
        selection: {
          start: selection.start + this.indentation.length,
          end: selection.start + this.indentation.length,
        },
      };
    }
  }
}
