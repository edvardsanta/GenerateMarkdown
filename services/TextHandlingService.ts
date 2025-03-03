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
    const hasTOC = content.includes("## Tabela de Conteúdos");
    let processedContent = content;

    if (hasTOC) {
      const tocSectionEnd = content.indexOf(
        "\n\n",
        content.indexOf("## Tabela de Conteúdos")
      );
      if (tocSectionEnd !== -1) {
        processedContent = content.substring(tocSectionEnd + 2);
      }
    }

    const sections: MarkdownSection[] = [];
    let currentSection: MarkdownSection | null = null;

    processedContent.split("\n").forEach((line) => {
      const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
      if (headerMatch) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          id: this.generateUniqueId(),
          headerLevel: String(headerMatch[1].length),
          title: headerMatch[2],
          content: "",
          hasUnsavedChanges: false,
        };
      } else if (currentSection) {
        currentSection.content += (currentSection.content ? "\n" : "") + line;
      }
    });

    if (currentSection) {
      sections.push(currentSection);
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
