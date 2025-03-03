use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
pub struct AutoCompletion {
    word: String,
    completions: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SnippetTemplate {
    name: String,
    content: String,
    description: String,
}

#[wasm_bindgen]
pub struct SmartEditor {
    completions_cache: Vec<String>,
    snippets: Vec<SnippetTemplate>,
    common_words: Vec<String>,
}

#[wasm_bindgen]
impl SmartEditor {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        let default_snippets = vec![
            SnippetTemplate {
                name: "table".to_string(),
                content:
                    "| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |"
                        .to_string(),
                description: "Basic Table".to_string(),
            },
            SnippetTemplate {
                name: "code".to_string(),
                content: "```\n\n```".to_string(),
                description: "Code Block".to_string(),
            },
            SnippetTemplate {
                name: "checklist".to_string(),
                content: "- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3".to_string(),
                description: "Checklist".to_string(),
            },
            SnippetTemplate {
                name: "link".to_string(),
                content: "[Link Text](url)".to_string(),
                description: "Hyperlink".to_string(),
            },
        ];

        // Initialize common markdown words for auto-completion
        let common_words = vec![
            "Header".to_string(),
            "Table".to_string(),
            "Image".to_string(),
            "Link".to_string(),
            "Code".to_string(),
            "List".to_string(),
            "Checklist".to_string(),
            "Bold".to_string(),
            "Italic".to_string(),
            "Blockquote".to_string(),
        ];

        SmartEditor {
            completions_cache: Vec::new(),
            snippets: default_snippets,
            common_words,
        }
    }

    #[wasm_bindgen]
    pub fn get_completions(&self, current_word: &str) -> Result<JsValue, JsValue> {
        // Combine cached words with common words
        let mut all_words: Vec<String> = self.completions_cache.clone();
        all_words.extend(self.common_words.clone());

        let completions: Vec<String> = all_words
            .iter()
            .filter(|word| {
                word.to_lowercase()
                    .starts_with(&current_word.to_lowercase())
            })
            .take(5) // Limit to 5 suggestions
            .cloned()
            .collect();

        let result = AutoCompletion {
            word: current_word.to_string(),
            completions,
        };

        Ok(serde_wasm_bindgen::to_value(&result)?)
    }

    #[wasm_bindgen]
    pub fn get_snippet(&self, name: &str) -> Result<JsValue, JsValue> {
        if let Some(snippet) = self.snippets.iter().find(|s| s.name == name) {
            Ok(serde_wasm_bindgen::to_value(snippet)?)
        } else {
            Ok(JsValue::NULL)
        }
    }

    #[wasm_bindgen]
    pub fn get_all_snippets(&self) -> Result<JsValue, JsValue> {
        Ok(serde_wasm_bindgen::to_value(&self.snippets)?)
    }

    #[wasm_bindgen]
    pub fn add_to_completions_cache(&mut self, word: &str) {
        if !self.completions_cache.contains(&word.to_string()) {
            self.completions_cache.push(word.to_string());
        }
    }

    #[wasm_bindgen]
    pub fn format_table(&self, table_text: &str) -> String {
        let lines: Vec<&str> = table_text.lines().collect();
        if lines.len() < 2 {
            return table_text.to_string();
        }

        // Parse header
        let headers: Vec<&str> = lines[0]
            .trim_matches('|')
            .split('|')
            .map(|s| s.trim())
            .collect();

        // Calculate column widths
        let mut col_widths: Vec<usize> = vec![0; headers.len()];

        // Update widths based on headers
        for (i, header) in headers.iter().enumerate() {
            col_widths[i] = header.len().max(col_widths[i]);
        }

        // Check cell widths
        for line in lines.iter().skip(2) {
            let cells: Vec<&str> = line
                .trim_matches('|')
                .split('|')
                .map(|s| s.trim())
                .collect();

            for (i, cell) in cells.iter().enumerate() {
                if i < col_widths.len() {
                    col_widths[i] = cell.len().max(col_widths[i]);
                }
            }
        }

        // Format table
        let mut formatted = String::new();

        // Add headers
        formatted.push('|');
        for (i, header) in headers.iter().enumerate() {
            formatted.push_str(&format!(" {:<width$} |", header, width = col_widths[i]));
        }
        formatted.push('\n');

        // Add separator
        formatted.push('|');
        for width in &col_widths {
            formatted.push_str(&format!("{}|", "-".repeat(width + 2)));
        }
        formatted.push('\n');

        // Add content
        for line in lines.iter().skip(2) {
            let cells: Vec<&str> = line
                .trim_matches('|')
                .split('|')
                .map(|s| s.trim())
                .collect();

            formatted.push('|');
            for (i, cell) in cells.iter().enumerate() {
                if i < col_widths.len() {
                    formatted.push_str(&format!(" {:<width$} |", cell, width = col_widths[i]));
                }
            }
            formatted.push('\n');
        }

        formatted
    }
}
