export function parseJsonText(text: string, label: string): unknown {
  try {
    return JSON.parse(stripLeadingByteOrderMark(text));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON in ${label}: ${message}`);
  }
}

export function stripLeadingByteOrderMark(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}
