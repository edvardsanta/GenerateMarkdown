import { describe, it, expect, beforeEach } from "vitest";
import { TableFormattingOperation } from "~/services/Operations/TableFormattingOperation";
import type { TextSelection } from "~/models/TextSelection";

describe("TableFormattingOperation", () => {
  let operation: TableFormattingOperation;

  beforeEach(() => {
    operation = new TableFormattingOperation();
  });

  describe("apply method", () => {
    it("should format a basic table", () => {
      const text = "|Header1|Header2|\n|Data1|Data2|";
      const selection: TextSelection = { start: 0, end: text.length };
      const result = operation.apply(text, selection);

      expect(result.text).toBe(
        "| Header1 | Header2 |\n|---------|----------|\n| Data1   | Data2   |"
      );
    });

    it("should handle tables with uneven column widths", () => {
      const text = "|Header|Very Long Header|\n|Data|Short|";
      const selection: TextSelection = { start: 0, end: text.length };
      const result = operation.apply(text, selection);

      expect(result.text).toBe(
        "| Header | Very Long Header |\n|--------|------------------|\n| Data   | Short           |"
      );
    });

    it("should handle tables with missing cells", () => {
      const text = "|Header1|Header2|Header3|\n|Data1||Data3|";
      const selection: TextSelection = { start: 0, end: text.length };
      const result = operation.apply(text, selection);

      expect(result.text).toBe(
        "| Header1 | Header2 | Header3 |\n|---------|---------|----------|\n| Data1   |         | Data3   |"
      );
    });

    it("should handle tables with extra whitespace", () => {
      const text = "|  Header1  |   Header2   |\n| Data1 |  Data2  |";
      const selection: TextSelection = { start: 0, end: text.length };
      const result = operation.apply(text, selection);

      expect(result.text).toBe(
        "| Header1 | Header2 |\n|---------|----------|\n| Data1   | Data2   |"
      );
    });

    it("should do nothing for non-table text", () => {
      const text = "This is not a table";
      const selection: TextSelection = { start: 0, end: text.length };
      const result = operation.apply(text, selection);

      expect(result.text).toBe("This is not a table");
    });

    it("should do nothing with empty selection", () => {
      const text = "|Header1|Header2|\n|Data1|Data2|";
      const selection: TextSelection = { start: 5, end: 5 }; // Cursor only, no selection
      const result = operation.apply(text, selection);

      expect(result.text).toBe("|Header1|Header2|\n|Data1|Data2|");
    });

    it("should handle more than two rows", () => {
      const text = "|Header1|Header2|\n|Data1|Data2|\n|MoreData1|MoreData2|";
      const selection: TextSelection = { start: 0, end: text.length };
      const result = operation.apply(text, selection);

      expect(result.text).toBe(
        "| Header1   | Header2   |\n|-----------|------------|\n| Data1     | Data2     |\n| MoreData1 | MoreData2 |"
      );
    });

    it("should handle tables with varying column counts", () => {
      const text =
        "|Header1|Header2|Header3|\n|Data1|Data2|\n|MoreData1|MoreData2|MoreData3|MoreData4|";
      const selection: TextSelection = { start: 0, end: text.length };
      const result = operation.apply(text, selection);

      // Should normalize to the maximum column count (4 in this case)
      expect(result.text).toContain(
        "| Header1   | Header2   | Header3   |          |"
      );
      expect(result.text).toContain(
        "| Data1     | Data2     |           |          |"
      );
      expect(result.text).toContain(
        "| MoreData1 | MoreData2 | MoreData3 | MoreData4 |"
      );
    });
  });
});
