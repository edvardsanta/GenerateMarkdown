import { describe, it, expect, beforeEach } from "vitest";
import { UnindentOperation } from "~/services/Operations/UnindentOperation";
import type { TextSelection } from "~/models/TextSelection";

describe("UnindentOperation", () => {
  let operation: UnindentOperation;

  beforeEach(() => {
    operation = new UnindentOperation(2);
  });

  describe("apply method", () => {
    it("should remove indentation from a single line", () => {
      const text = "  This is an indented line";
      const selection: TextSelection = { start: 5, end: 5 };
      const result = operation.apply(text, selection);

      expect(result.text).toBe("This is an indented line");
      expect(result.selection.start).toBe(3);
      expect(result.selection.end).toBe(3);
    });

    it("should unindent multiple selected lines", () => {
      const text = "  Line 1\n  Line 2\n  Line 3";
      const selection: TextSelection = { start: 0, end: 21 }; // Select all lines
      const result = operation.apply(text, selection);

      expect(result.text).toBe("Line 1\nLine 2\nLine 3");
      expect(result.selection.start).toBe(0);
      expect(result.selection.end).toBe(15); // 6 spaces removed in total
    });

    it("should unindent only lines that have indentation", () => {
      const text = "  Line 1\nLine 2\n  Line 3";
      const selection: TextSelection = { start: 0, end: 19 }; // Select all lines
      const result = operation.apply(text, selection);

      expect(result.text).toBe("Line 1\nLine 2\nLine 3");
      expect(result.selection.start).toBe(0);
    });

    it("should handle selection starting mid-line", () => {
      const text = "  Line 1\n  Line 2\n  Line 3";
      const selection: TextSelection = { start: 4, end: 21 }; // Start in middle of first line
      const result = operation.apply(text, selection);

      expect(result.text).toBe("  Line 1\nLine 2\nLine 3");
      expect(result.selection.start).toBe(4);
    });

    it("should do nothing when line has no indentation", () => {
      const text = "Line 1\nLine 2";
      const selection: TextSelection = { start: 0, end: 0 };
      const result = operation.apply(text, selection);

      expect(result.text).toBe("Line 1\nLine 2");
      expect(result.selection.start).toBe(0);
      expect(result.selection.end).toBe(0);
    });

    it("should handle custom indentation size", () => {
      const customOperation = new UnindentOperation(4); // 4 spaces
      const text = "    Line 1\n    Line 2";
      const selection: TextSelection = { start: 0, end: 17 };
      const result = customOperation.apply(text, selection);

      expect(result.text).toBe("Line 1\nLine 2");
      expect(result.selection.start).toBe(0);
    });
  });
});
