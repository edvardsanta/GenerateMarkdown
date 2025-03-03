import type { TextOperation } from "~/models/TextOperation";
import { IndentOperation } from "./Operations/IndentOperation";
import { UnindentOperation } from "./Operations/UnindentOperation";
import { TableFormattingOperation } from "./Operations/TableFormattingOperation";
import type { TextOperationResult } from "~/models/TextOperationResult";
import type { TextSelection } from "~/models/TextSelection";
import type { MarkdownSection } from "~/models/MarkdownSection";
import { InsertContentOperation } from "./Operations/InsertContentOperation";

export class TextHandlingService {
  private indentOperation: TextOperation;
  private unindentOperation: TextOperation;
  private tableFormattingOperation: TextOperation;

  constructor(indentSize = 2) {
    this.indentOperation = new IndentOperation(indentSize);
    this.unindentOperation = new UnindentOperation(indentSize);
    this.tableFormattingOperation = new TableFormattingOperation();
  }

  indent(text: string, selection: TextSelection): TextOperationResult {
    return this.indentOperation.apply(text, selection);
  }

  unindent(text: string, selection: TextSelection): TextOperationResult {
    return this.unindentOperation.apply(text, selection);
  }

  insertContent(
    content: string,
    text: string,
    selection: TextSelection
  ): TextOperationResult {
    const operation = new InsertContentOperation(content);
    return operation.apply(text, selection);
  }

  formatTable(text: string, selection: TextSelection): TextOperationResult {
    return this.tableFormattingOperation.apply(text, selection);
  }

  parseMarkdownContent(
    content: string,
    _includeTOC = false
  ): {
    sections: MarkdownSection[];
    hasTOC: boolean;
  } {
    const hasTOC =
      content.includes("## Tabela de Conteúdos") ||
      content.includes("## Table of Contents");
    let processedContent = content;

    // Remove TOC section if present
    if (hasTOC) {
      let tocSectionEnd = -1;

      if (content.includes("## Tabela de Conteúdos")) {
        tocSectionEnd = content.indexOf(
          "\n\n",
          content.indexOf("## Tabela de Conteúdos")
        );
      } else if (content.includes("## Table of Contents")) {
        tocSectionEnd = content.indexOf(
          "\n\n",
          content.indexOf("## Table of Contents")
        );
      }

      if (tocSectionEnd !== -1) {
        processedContent = content.substring(tocSectionEnd + 2);
      }
    }

    const sections: MarkdownSection[] = [];
    let currentSection: MarkdownSection | null = null;

    // Split by line and process
    const lines = processedContent.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const headerMatch = line.match(/^(#{1,6})\s+(.*)/);

      if (headerMatch) {
        // If we have a section in progress, save it
        if (currentSection) {
          // Trim trailing whitespace from content
          currentSection.content = currentSection.content.replace(/\s+$/, "");
          sections.push(currentSection);
        }

        // Start a new section
        currentSection = {
          id: this.generateUniqueId(),
          headerLevel: String(headerMatch[1].length),
          title: headerMatch[2],
          content: "",
          hasUnsavedChanges: false,
        };
      } else if (currentSection) {
        // Add to existing section
        currentSection.content += (currentSection.content ? "\n" : "") + line;
      } else {
        // No section yet, create default one for content before first header
        currentSection = {
          id: this.generateUniqueId(),
          headerLevel: "1",
          title: "Introduction",
          content: line,
          hasUnsavedChanges: false,
        };
      }
    }

    // Don't forget the last section
    if (currentSection) {
      // Trim trailing whitespace from content
      currentSection.content = currentSection.content.replace(/\s+$/, "");
      sections.push(currentSection);
    }

    // If no sections were found, create a default one
    if (sections.length === 0) {
      sections.push({
        id: this.generateUniqueId(),
        headerLevel: "1",
        title: "Untitled Document",
        content: processedContent.trim(),
        hasUnsavedChanges: false,
      });
    }

    return { sections, hasTOC };
  }
  generateMarkdownContent(
    sections: MarkdownSection[],
    includeTOC = false
  ): string {
    let content = sections
      .map((section) => {
        const headerPrefix = "#".repeat(parseInt(section.headerLevel));
        return `${headerPrefix} ${section.title}\n${section.content}`;
      })
      .join("\n\n");

    if (includeTOC) {
      const toc = this.generateTOC(sections);
      if (toc.trim()) {
        content = `## Tabela de Conteúdos\n${toc}\n\n${content}`;
      }
    }

    return content;
  }

  /**
   * Generates table of contents from sections
   */
  generateTOC(sections: MarkdownSection[]): string {
    return sections
      .filter((section) => section.title.trim() !== "")
      .map((section) => {
        const sanitizedTitle = section.title.replace(/\s/g, "-").toLowerCase();
        const indentation = "  ".repeat(parseInt(section.headerLevel) - 1);
        return `${indentation}- [${section.title}](#${sanitizedTitle})`;
      })
      .join("\n");
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
