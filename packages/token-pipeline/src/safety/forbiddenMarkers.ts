export type ForbiddenMarker = string;

export const defaultForbiddenMarkers: readonly ForbiddenMarker[] = [
  "$extensions",
  "com.figma",
  "VariableID",
  "VariableCollectionId",
  "targetVariable",
  "PRIVATE_COMPANY_NAME_PLACEHOLDER"
];
