import { describe, it, expect, beforeEach } from "@jest/globals";

// Mock modules — jest.mock is hoisted by Jest transform
// Mocks must be defined inside factories to avoid hoisting issues
jest.mock("@/lib/supabase-ssr", () => {
  const mock = {
    auth: { getUser: jest.fn() },
    from: jest.fn(),
  };
  return {
    createSupabaseServerClient: () => mock,
    __mock: mock,
  };
});

jest.mock("@/lib/admin-auth", () => ({
  isAllowedAdminEmail: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  logger: { error: jest.fn() },
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidate: jest.fn(),
  unstable_cache: jest.fn(),
}));

// Import mocks after jest.mock calls
// `__mock` only exists on the mocked module, so fetch via requireMock (keeps tsc happy)
type MockSupabase = { auth: { getUser: jest.Mock }; from: jest.Mock };
const { __mock: mockSupabase } = jest.requireMock<{ __mock: MockSupabase }>("@/lib/supabase-ssr");
import { isAllowedAdminEmail } from "@/lib/admin-auth";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";
import { getGenericErrorMessage, GENERIC_MESSAGES } from "@/lib/sanitize";

const mockRevalidatePath = revalidatePath as jest.Mock;
const mockLoggerError = logger.error as jest.Mock;

// Import after mocks (jest hoists mocks, so these resolve after mock factories)
import { createPost, updatePostStatus, deletePost, updatePostDetail } from "@/app/admin/actions";

// Generic error messages are imported from sanitize.ts

describe("admin/actions — createPost", () => {
  const mockUser = { id: "user-1", email: "admin@neowhisper.dev" };

  beforeEach(() => {
    jest.clearAllMocks();
    // Fresh `from` mock per test — some tests reassign it, so reset to avoid order dependence
    mockSupabase.from = jest.fn();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    (isAllowedAdminEmail as jest.Mock).mockReturnValue(true);
  });

  it("should return validation error for missing required fields", () => {
    const result = createPost({
      title: "",
      slug: "test-post",
      content: "content",
      locale: "en",
    });
    return expect(result).resolves.toEqual({ error: "Title, slug, locale, and content are required." });
  });

  it("should return access denied for non-admin email", () => {
    (isAllowedAdminEmail as jest.Mock).mockReturnValue(false);
    const result = createPost({
      title: "Test",
      slug: "test-post",
      content: "content",
      locale: "en",
    });
    return expect(result).resolves.toEqual({ error: "Access denied." });
  });

  it("should handle translation group fetch error with generic message", async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "DB connection failed" },
      }),
    });

    const result = await createPost({
      title: "Test",
      slug: "test-post",
      content: "content",
      locale: "en",
    });

    expect(result.error).toBe(GENERIC_MESSAGES.groupFetchError);
    expect(mockLoggerError).toHaveBeenCalledWith("Admin:CreatePost", "groupFetchError", expect.anything());
  });

  it("should handle group creation error with generic message", async () => {
    // First call: existing group lookup returns no group
    // Second call: group creation fails
    const fromMock = jest.fn();

    fromMock.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
    });

    fromMock.mockReturnValueOnce({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Unique constraint violation" },
      }),
    });

    mockSupabase.from = fromMock;

    const result = await createPost({
      title: "Test",
      slug: "test-post",
      content: "content",
      locale: "en",
    });

    expect(result.error).toBe(GENERIC_MESSAGES.createGroupError);
    expect(mockLoggerError).toHaveBeenCalledWith("Admin:CreatePost", "createGroupError", expect.anything());
  });

  it("should successfully create a draft post", async () => {
    // Mock: existing group found
    const fromMock = jest.fn();

    fromMock.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: { id: "group-1" },
        error: null,
      }),
    });

    // Mock: insert post succeeds
    fromMock.mockReturnValueOnce({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: "post-1" },
        error: null,
      }),
    });

    mockSupabase.from = fromMock;

    const result = await createPost({
      title: "Test Post",
      slug: "test-post",
      content: "Content here",
      locale: "en",
    });

    expect(result).toEqual({
      success: true,
      message: "Draft created.",
      postId: "post-1",
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/blog");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin");
  });

  it("should return post creation error with generic message", async () => {
    const fromMock = jest.fn();

    fromMock.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: { id: "group-1" },
        error: null,
      }),
    });

    fromMock.mockReturnValueOnce({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Post insert failed" },
      }),
    });

    mockSupabase.from = fromMock;

    const result = await createPost({
      title: "Test",
      slug: "test-post",
      content: "content",
      locale: "en",
    });

    expect(result.error).toBe(GENERIC_MESSAGES.createPostError);
    expect(mockLoggerError).toHaveBeenCalledWith("Admin:CreatePost", "createPostError", expect.anything());
  });

  it("should return error when slug is empty after normalization", () => {
    const result = createPost({
      title: "Test",
      slug: "!!!",
      content: "content",
      locale: "en",
    });
    return expect(result).resolves.toEqual({ error: "Slug is invalid." });
  });

  it("should return error when post is not found", async () => {
    const fromMock = jest.fn();
    fromMock.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: { id: "group-1" },
        error: null,
      }),
    });

    fromMock.mockReturnValueOnce({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Post not found" },
      }),
    });

    mockSupabase.from = fromMock;

    const result = await createPost({
      title: "Test",
      slug: "test-post",
      content: "content",
      locale: "en",
    });

    expect(result.error).toBe(GENERIC_MESSAGES.createPostError);
    expect(mockLoggerError).toHaveBeenCalledWith("Admin:CreatePost", "createPostError", expect.anything());
  });

  it("should return not authenticated when getUser errors", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "JWT expired" },
    });
    await expect(createPost({
      title: "Test",
      slug: "test-post",
      content: "content",
      locale: "en",
    })).resolves.toEqual({ error: "Not authenticated." });
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });
});

describe("admin/actions — updatePostStatus", () => {
  const mockUser = { id: "user-1", email: "admin@neowhisper.dev" };

  beforeEach(() => {
    jest.clearAllMocks();
    // Fresh `from` mock per test — some tests reassign it, so reset to avoid order dependence
    mockSupabase.from = jest.fn();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    (isAllowedAdminEmail as jest.Mock).mockReturnValue(true);
  });

  it("should deny access for non-authenticated users", () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = updatePostStatus("post-1", "published");
    return expect(result).resolves.toEqual({ error: "Access denied." });
  });

  it("should update post status successfully", async () => {
    const fromMock = jest.fn();
    fromMock.mockReturnValueOnce({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    });

    mockSupabase.from = fromMock;

    const result = await updatePostStatus("post-1", "published");
    expect(result).toEqual({
      success: true,
      message: "Post is now published.",
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/blog");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/posts");
  });

  it("should return error if DB update fails with generic message", async () => {
    const fromMock = jest.fn();
    fromMock.mockReturnValueOnce({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: { message: "DB timeout" } }),
    });

    mockSupabase.from = fromMock;

    const result = await updatePostStatus("post-1", "draft");

    expect(result.error).toBe(GENERIC_MESSAGES.statusUpdateError);
    expect(mockLoggerError).toHaveBeenCalledWith("Admin:UpdateStatus", "error", expect.anything());
  });

  it("should deny access for non-admin email", () => {
    (isAllowedAdminEmail as jest.Mock).mockReturnValue(false);
    const result = updatePostStatus("post-1", "published");
    return expect(result).resolves.toEqual({ error: "Access denied." });
  });
});

describe("admin/actions — deletePost", () => {
  const mockUser = { id: "user-1", email: "admin@neowhisper.dev" };

  beforeEach(() => {
    jest.clearAllMocks();
    // Fresh `from` mock per test — some tests reassign it, so reset to avoid order dependence
    mockSupabase.from = jest.fn();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    (isAllowedAdminEmail as jest.Mock).mockReturnValue(true);
  });

  it("should deny access for non-admin emails", () => {
    (isAllowedAdminEmail as jest.Mock).mockReturnValue(false);
    const result = deletePost("post-1");
    return expect(result).resolves.toEqual({ error: "Access denied." });
  });

  it("should delete post successfully", async () => {
    const fromMock = jest.fn();
    fromMock.mockReturnValueOnce({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    });

    mockSupabase.from = fromMock;

    const result = await deletePost("post-1");
    expect(result).toEqual({ success: true, message: "Post deleted successfully." });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/blog");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/posts");
  });

  it("should return error if delete fails with generic message", async () => {
    const fromMock = jest.fn();
    fromMock.mockReturnValueOnce({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: { message: "Delete failed" } }),
    });

    mockSupabase.from = fromMock;

    const result = await deletePost("post-1");

    expect(result.error).toBe(GENERIC_MESSAGES.deleteError);
    expect(mockLoggerError).toHaveBeenCalledWith("Admin:DeletePost", "error", expect.anything());
  });
});

describe("admin/actions — updatePostDetail", () => {
  const mockUser = { id: "user-1", email: "admin@neowhisper.dev" };

  beforeEach(() => {
    jest.clearAllMocks();
    // Fresh `from` mock per test — some tests reassign it, so reset to avoid order dependence
    mockSupabase.from = jest.fn();
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
    (isAllowedAdminEmail as jest.Mock).mockReturnValue(true);
  });

  it("should return error for invalid slug after normalization", () => {
    const result = updatePostDetail({
      postId: "post-1",
      title: "Test",
      slug: "!!!",
      locale: "en",
      content: "content",
    });
    return expect(result).resolves.toEqual({ error: "Slug is invalid." });
  });

  it("should return error if translation_groups update fails with generic message", async () => {
    const fromMock = jest.fn();

    // First query: get post
    fromMock.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { translation_group_id: "group-1" },
        error: null,
      }),
    });

    // Second query: update translation_groups fails
    fromMock.mockReturnValueOnce({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: { message: "Update failed" } }),
    });

    mockSupabase.from = fromMock;

    const result = await updatePostDetail({
      postId: "post-1",
      title: "Updated",
      slug: "updated-post",
      locale: "en",
      content: "Updated content",
    });

    expect(result.error).toBe(GENERIC_MESSAGES.groupUpdateError);
    expect(mockLoggerError).toHaveBeenCalledWith("Admin:UpdateDetail", "groupUpdateError", expect.anything());
    // posts_dynamic must not be touched after the group update fails
    expect(fromMock).toHaveBeenCalledTimes(2);
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("should return error if posts_dynamic update fails with generic message", async () => {
    const fromMock = jest.fn();

    fromMock.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { translation_group_id: "group-1" },
        error: null,
      }),
    });

    fromMock.mockReturnValueOnce({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    });

    fromMock.mockReturnValueOnce({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: { message: "Post update failed" } }),
    });

    mockSupabase.from = fromMock;

    const result = await updatePostDetail({
      postId: "post-1",
      title: "Updated",
      slug: "updated-post",
      locale: "en",
      content: "Updated content",
    });

    expect(result.error).toBe(GENERIC_MESSAGES.detailUpdateError);
    expect(mockLoggerError).toHaveBeenCalledWith("Admin:UpdateDetail", "error", expect.anything());
  });

  it("should deny access for non-admin email", () => {
    (isAllowedAdminEmail as jest.Mock).mockReturnValue(false);
    const result = updatePostDetail({
      postId: "post-1",
      title: "Test",
      slug: "test-post",
      locale: "en",
      content: "content",
    });
    return expect(result).resolves.toEqual({ error: "Access denied." });
  });

  it("should return error when post is not found", async () => {
    const fromMock = jest.fn();
    fromMock.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: "Post not found" },
      }),
    });

    mockSupabase.from = fromMock;

    const result = await updatePostDetail({
      postId: "post-1",
      title: "Updated",
      slug: "updated-post",
      locale: "en",
      content: "Updated content",
    });

    expect(result.error).toBe(GENERIC_MESSAGES.postNotFoundError);
  });

  it("should successfully update post detail", async () => {
    const fromMock = jest.fn();

    // First query: get post
    fromMock.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { translation_group_id: "group-1" },
        error: null,
      }),
    });

    // Second query: update translation_groups
    fromMock.mockReturnValueOnce({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    });

    // Third query: update posts_dynamic
    fromMock.mockReturnValueOnce({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    });

    mockSupabase.from = fromMock;

    const result = await updatePostDetail({
      postId: "post-1",
      title: "Updated Post",
      slug: "updated-post",
      locale: "en",
      content: "Updated content here",
    });

    expect(result).toEqual({
      success: true,
      message: "Post updated successfully.",
      postId: "post-1",
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/blog");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/admin/posts");
  });
});

describe("sanitize — getGenericErrorMessage", () => {
  it("returns the configured generic message for every error key", () => {
    for (const key of Object.keys(GENERIC_MESSAGES) as Array<keyof typeof GENERIC_MESSAGES>) {
      expect(getGenericErrorMessage(key)).toBe(GENERIC_MESSAGES[key]);
    }
  });
});
