import type { TextSelection } from "./TextSelection";

export interface TextOperationResult {
  text: string;
  selection: TextSelection;
}
