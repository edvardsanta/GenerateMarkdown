// TextHandlingService.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { TextHandlingService } from "~/services/TextHandlingService";
import type { MarkdownSection } from "~/models/MarkdownSection";
import type { TextSelection } from "~/models/TextSelection";

describe("TextHandlingService", () => {
  let service: TextHandlingService;

  beforeEach(() => {
    service = new TextHandlingService(2);
  });

  describe("text operations", () => {
    it("should indent single line at cursor", () => {
      const text = "This is a line of text";
      const selection: TextSelection = { start: 5, end: 5 };
      const result = service.indent(text, selection);

      expect(result.text).toBe("This   is a line of text");
      expect(result.selection.start).toBe(7);
      expect(result.selection.end).toBe(7);
    });

    it("should indent multiple selected lines", () => {
      const text = "Line 1\nLine 2\nLine 3";
      const selection: TextSelection = { start: 0, end: 13 }; // Select first two lines
      const result = service.indent(text, selection);

      expect(result.text).toBe("  Line 1\n  Line 2\nLine 3");
    });

    it("should unindent indented lines", () => {
      const text = "  Line 1\n  Line 2\nLine 3";
      const selection: TextSelection = { start: 0, end: 17 }; // Select first two lines
      const result = service.unindent(text, selection);

      expect(result.text).toBe("Line 1\nLine 2\nLine 3");
    });

    it("should insert content at cursor", () => {
      const text = "Hello  world";
      const selection: TextSelection = { start: 6, end: 6 };
      const result = service.insertContent("beautiful ", text, selection);

      expect(result.text).toBe("Hello beautiful  world");
    });

    it("should format a simple table", () => {
      const text = "|Header 1|Header 2|\n|Content|More content|";
      const selection: TextSelection = { start: 0, end: text.length };
      const result = service.formatTable(text, selection);

      expect(result.text).toContain("| Header 1 | Header 2     |");
      expect(result.text).toContain("| Content  | More content |");
    });
  });

  describe("markdown parsing and generation", () => {
    it("should parse markdown content into sections", () => {
      const markdown =
        "# Title 1\nContent 1\n\n## Title 2\nContent 2\nMore content";
      const { sections } = service.parseMarkdownContent(markdown);

      expect(sections).toHaveLength(2);
      expect(sections[0].headerLevel).toBe("1");
      expect(sections[0].title).toBe("Title 1");
      expect(sections[0].content).toBe("Content 1");
      expect(sections[1].headerLevel).toBe("2");
      expect(sections[1].title).toBe("Title 2");
      expect(sections[1].content).toBe("Content 2\nMore content");
    });

    it("should generate markdown content from sections", () => {
      const sections: MarkdownSection[] = [
        { headerLevel: "1", title: "Title 1", content: "Content 1" },
        {
          headerLevel: "2",
          title: "Title 2",
          content: "Content 2\nMore content",
        },
      ];

      const markdown = service.generateMarkdownContent(sections, false);
      expect(markdown).toBe(
        "# Title 1\nContent 1\n\n## Title 2\nContent 2\nMore content"
      );
    });

    it("should generate TOC when requested", () => {
      const sections: MarkdownSection[] = [
        { headerLevel: "1", title: "Title 1", content: "Content 1" },
        { headerLevel: "2", title: "Title 2", content: "Content 2" },
      ];

      const markdown = service.generateMarkdownContent(sections, true);
      expect(markdown).toContain("## Tabela de Conteúdos");
      expect(markdown).toContain("- [Title 1](#title-1)");
      expect(markdown).toContain("  - [Title 2](#title-2)");
    });

    it("should preserve whitespace in content", () => {
      const markdown =
        "# Title\n  Indented line\n    Double indented\nRegular line";
      const { sections } = service.parseMarkdownContent(markdown);

      expect(sections[0].content).toBe(
        "  Indented line\n    Double indented\nRegular line"
      );

      const regenerated = service.generateMarkdownContent(sections);
      expect(regenerated).toBe(
        "# Title\n  Indented line\n    Double indented\nRegular line"
      );
    });
  });

  describe("edge cases", () => {
    it("should handle empty content", () => {
      const { sections } = service.parseMarkdownContent("");
      expect(sections).toHaveLength(0);
    });

    it("should handle content with no headers", () => {
      const { sections } = service.parseMarkdownContent(
        "Just some text\nwithout headers"
      );
      expect(sections).toHaveLength(0);
    });

    it("should handle headers with no content", () => {
      const { sections } = service.parseMarkdownContent(
        "# Just a title\n## Another title"
      );
      expect(sections).toHaveLength(2);
      expect(sections[0].content).toBe("");
      expect(sections[1].content).toBe("");
    });
  });
});
