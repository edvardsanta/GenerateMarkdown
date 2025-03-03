import type { MarkdownSection } from "@/models/MarkdownSection";

export interface Tab {
  id: string;
  title: string;
  type: "markdown";
  sections: MarkdownSection[];
  hasUnsavedChanges: boolean;
  includeTOC: boolean;
}

export interface TabStorageData {
  id: string;
  title: string;
  type: "markdown";
  hasUnsavedChanges: boolean;
  includeTOC: boolean;
  sections: MarkdownSection[];
}
