import { describe, it, expect } from "vitest";
import { ZodError, z } from "zod";
import {
  ForbiddenError,
  ConflictError,
  handleApiError,
  parseQueryParams,
} from "@/lib/api-auth";

describe("ForbiddenError", () => {
  it("has name ForbiddenError", () => {
    const e = new ForbiddenError("No access");
    expect(e.name).toBe("ForbiddenError");
    expect(e.message).toBe("No access");
    expect(e instanceof Error).toBe(true);
  });

  it("uses default message", () => {
    expect(new ForbiddenError().message).toBe("Forbidden");
  });
});

describe("ConflictError", () => {
  it("has name ConflictError", () => {
    const e = new ConflictError("Already applied");
    expect(e.name).toBe("ConflictError");
    expect(e.message).toBe("Already applied");
    expect(e instanceof Error).toBe(true);
  });

  it("uses default message", () => {
    expect(new ConflictError().message).toBe("Conflict");
  });
});

describe("handleApiError", () => {
  it("maps ZodError to 400 with field errors", async () => {
    const schema = z.object({ name: z.string().min(3) });
    let zodError!: ZodError;
    try {
      schema.parse({ name: "x" });
    } catch (e) {
      zodError = e as ZodError;
    }
    const res = handleApiError(zodError);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Validation error");
    expect(body.fields).toBeDefined();
    expect(body.fields["name"]).toBe("String must contain at least 3 character(s)");
  });

  it("maps ForbiddenError to 403", async () => {
    const res = handleApiError(new ForbiddenError("No access"));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBe("No access");
  });

  it("maps ConflictError to 409", async () => {
    const res = handleApiError(new ConflictError("Already applied"));
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toBe("Already applied");
  });

  it("maps generic Error to 400", async () => {
    const res = handleApiError(new Error("Something failed"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Something failed");
  });

  it("maps unknown to 500", async () => {
    const res = handleApiError("oops");
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Internal server error");
  });
});

describe("parseQueryParams", () => {
  it("parses valid params", () => {
    const schema = z.object({
      status: z.enum(["ACTIVE", "DRAFT"]).optional(),
    });
    const params = new URLSearchParams("status=ACTIVE");
    const result = parseQueryParams(schema, params);
    expect(result).toEqual({ status: "ACTIVE" });
  });

  it("returns undefined for missing optional param", () => {
    const schema = z.object({ status: z.string().optional() });
    const result = parseQueryParams(schema, new URLSearchParams());
    expect(result.status).toBeUndefined();
  });

  it("throws ZodError for invalid enum value", () => {
    const schema = z.object({ status: z.enum(["ACTIVE", "DRAFT"]) });
    const params = new URLSearchParams("status=INVALID");
    expect(() => parseQueryParams(schema, params)).toThrow(ZodError);
  });
});
