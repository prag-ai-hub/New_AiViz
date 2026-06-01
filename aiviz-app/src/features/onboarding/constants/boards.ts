export const BOARDS = [
  { value: "cbse", label: "CBSE" },
  { value: "icse", label: "ICSE" },
  { value: "maharashtra_state", label: "Maharashtra State" },
  { value: "other", label: "Other" },
] as const;

export type BoardValue = (typeof BOARDS)[number]["value"];
