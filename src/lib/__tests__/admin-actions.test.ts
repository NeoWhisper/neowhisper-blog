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

jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({ data, init }),
    redirect: (url: string, status?: number) => ({ redirect: url, status }),
  },
}));

// Import mocks after jest.mock calls
// `__mock` only exists on the mocked module, so fetch it via requireMock (keeps tsc happy)
type MockSupabase = { auth: { getUser: jest.Mock }; from: jest.Mock };
const { __mock: mockSupabase } = jest.requireMock<{ __mock: MockSupabase }>("@/lib/supabase-ssr");
import { isAllowedAdminEmail } from "@/lib/admin-auth";
import { logger } from "@/lib/logger";
import { revalidatePath } from "next/cache";

const mockRevalidatePath = revalidatePath as jest.Mock;
const mockLoggerError = logger.error as jest.Mock;

// Import after mocks (jest hoists mocks, so these resolve after mock factories)
import { createPost, updatePostStatus, deletePost, updatePostDetail } from "@/app/admin/actions";

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

  it("should return validation error for missing required fields", async () => {
    const result = await createPost({
      title: "",
      slug: "test-post",
      content: "content",
      locale: "en",
    });
    expect(result).toEqual({ error: "Title, slug, locale, and content are required." });
  });

  it("should return access denied for non-admin email", async () => {
    (isAllowedAdminEmail as jest.Mock).mockReturnValue(false);
    const result = await createPost({
      title: "Test",
      slug: "test-post",
      content: "content",
      locale: "en",
    });
    expect(result).toEqual({ error: "Access denied." });
  });

  it("should handle translation group fetch error", async () => {
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
    expect(result.error).toContain("Failed to check translation group");
    expect(mockLoggerError).toHaveBeenCalledWith("Admin:CreatePost", "groupFetchError", expect.anything());
  });

  it("should handle group creation error", async () => {
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
    expect(result.error).toContain("Failed to create translation group");
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

  it("should return post creation error from DB", async () => {
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
    expect(result.error).toContain("Failed to create post");
  });

  it("should return error when slug is empty after normalization", async () => {
    const result = await createPost({
      title: "Test",
      slug: "!!!",
      content: "content",
      locale: "en",
    });
    expect(result).toEqual({ error: "Slug is invalid after normalization." });
  });

  it("should return not authenticated when getUser errors", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "JWT expired" },
    });
    const result = await createPost({
      title: "Test",
      slug: "test-post",
      content: "content",
      locale: "en",
    });
    expect(result).toEqual({ error: "Not authenticated." });
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

  it("should deny access for non-authenticated users", async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await updatePostStatus("post-1", "published");
    expect(result).toEqual({ error: "Access denied." });
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

  it("should return error if DB update fails", async () => {
    const fromMock = jest.fn();
    fromMock.mockReturnValueOnce({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: { message: "DB timeout" } }),
    });

    mockSupabase.from = fromMock;

    const result = await updatePostStatus("post-1", "draft");
    expect(result.error).toContain("Failed to update status");
    expect(mockLoggerError).toHaveBeenCalled();
  });

  it("should deny access for non-admin email", async () => {
    (isAllowedAdminEmail as jest.Mock).mockReturnValue(false);
    const result = await updatePostStatus("post-1", "published");
    expect(result).toEqual({ error: "Access denied." });
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

  it("should deny access for non-admin emails", async () => {
    (isAllowedAdminEmail as jest.Mock).mockReturnValue(false);
    const result = await deletePost("post-1");
    expect(result).toEqual({ error: "Access denied." });
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

  it("should return error if delete fails", async () => {
    const fromMock = jest.fn();
    fromMock.mockReturnValueOnce({
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: { message: "Delete failed" } }),
    });

    mockSupabase.from = fromMock;

    const result = await deletePost("post-1");
    expect(result.error).toContain("Failed to delete post");
    expect(mockLoggerError).toHaveBeenCalled();
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

  it("should return error for invalid slug after normalization", async () => {
    const result = await updatePostDetail({
      postId: "post-1",
      title: "Test",
      slug: "!!!",
      locale: "en",
      content: "content",
    });
    expect(result).toEqual({ error: "Slug is invalid after normalization." });
  });

  it("should return error if translation_groups update fails", async () => {
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

    expect(result).toEqual({ error: "Failed to update translation group: Update failed" });
    expect(mockLoggerError).toHaveBeenCalledWith("Admin:UpdateDetail", "groupUpdateError", expect.anything());
    // posts_dynamic must not be touched after the group update fails
    expect(fromMock).toHaveBeenCalledTimes(2);
    expect(mockRevalidatePath).not.toHaveBeenCalled();
  });

  it("should return error if posts_dynamic update fails", async () => {
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
    expect(result.error).toContain("Failed to update post");
  });

  it("should deny access for non-admin email", async () => {
    (isAllowedAdminEmail as jest.Mock).mockReturnValue(false);
    const result = await updatePostDetail({
      postId: "post-1",
      title: "Test",
      slug: "test-post",
      locale: "en",
      content: "content",
    });
    expect(result).toEqual({ error: "Access denied." });
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

    expect(result).toEqual({ error: "Failed to find post." });
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
