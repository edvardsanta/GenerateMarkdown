export interface MarkdownSection {
  id: string;       // Unique identifier for the section
  headerLevel: string; // Header level (1-6)
  title: string;    // Section title
  content: string;  // Section content
  hasUnsavedChanges: boolean; // Flag to track if this section has unsaved changes
}