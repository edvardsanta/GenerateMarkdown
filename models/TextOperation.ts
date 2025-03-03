import type { TextOperationResult } from "./TextOperationResult";
import type { TextSelection } from "./TextSelection";

export interface TextOperation {
  apply(text: string, selection: TextSelection): TextOperationResult;
}
