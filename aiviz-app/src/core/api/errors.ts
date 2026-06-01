export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId: string | null;
  readonly detail: unknown;

  constructor(opts: { status: number; code: string; message: string; requestId?: string | null; detail?: unknown }) {
    super(opts.message);
    this.name = "ApiError";
    this.status = opts.status;
    this.code = opts.code;
    this.requestId = opts.requestId ?? null;
    this.detail = opts.detail;
  }
}
