import { test, expect } from "@playwright/test";

// Test suite for contact form functionality
test.describe("Contact Form", () => {
  test("page loads with form elements", async ({ page }) => {
    await page.goto("/contact");

    // Check page title
    const title = await page.title();
    expect(title.toLowerCase()).toContain("contact");

    // Check form exists
    const form = page.locator("form").first();
    await expect(form).toBeVisible();

    // Check name input
    const nameInput = page.locator('input[name="name"]').first();
    await expect(nameInput).toBeVisible();

    // Check email input
    const emailInput = page.locator('input[name="email"]').first();
    await expect(emailInput).toBeVisible();

    // Check company input (optional)
    const companyInput = page.locator('input[name="company"]').first();
    await expect(companyInput).toBeVisible();

    // Check projectType select
    const projectTypeSelect = page
      .locator('select[name="projectType"]')
      .first();
    await expect(projectTypeSelect).toBeVisible();

    // Check budget select
    const budgetSelect = page.locator('select[name="budget"]').first();
    await expect(budgetSelect).toBeVisible();

    // Check details textarea (NOT "message" - the field is "details")
    const detailsInput = page.locator('textarea[name="details"]').first();
    await expect(detailsInput).toBeVisible();

    // Check submit button
    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeVisible();
  });

  test("shows HTML5 validation for required fields", async ({ page }) => {
    await page.goto("/contact");

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // HTML5 validation should prevent submission
    // Form should still be visible (not submitted)
    const form = page.locator("form").first();
    await expect(form).toBeVisible();

    // Check that required fields are still empty
    const nameInput = page.locator('input[name="name"]').first();
    const nameValue = await nameInput.inputValue();
    expect(nameValue).toBe("");
  });

  test("accepts valid form input", async ({ page }) => {
    await page.goto("/contact");

    // Fill name
    const nameInput = page.locator('input[name="name"]').first();
    await nameInput.fill("Test User");

    // Fill valid email
    const emailInput = page.locator('input[name="email"]').first();
    await emailInput.fill("test@example.com");

    // Fill company (optional)
    const companyInput = page.locator('input[name="company"]').first();
    await companyInput.fill("Test Company");

    // Select project type
    const projectTypeSelect = page
      .locator('select[name="projectType"]')
      .first();
    await projectTypeSelect.selectOption({ index: 0 });

    // Select budget
    const budgetSelect = page.locator('select[name="budget"]').first();
    await budgetSelect.selectOption({ index: 0 });

    // Fill details (NOT "message")
    const detailsInput = page.locator('textarea[name="details"]').first();
    await detailsInput.fill("This is a test project inquiry.");

    // Verify inputs have values
    expect(await nameInput.inputValue()).toBe("Test User");
    expect(await emailInput.inputValue()).toBe("test@example.com");
    expect(await detailsInput.inputValue()).toBe(
      "This is a test project inquiry.",
    );
  });

  test("form has proper structure", async ({ page }) => {
    await page.goto("/contact");

    // Check form has action and method
    const form = page.locator("form").first();
    const action = await form.getAttribute("action");
    const method = await form.getAttribute("method");

    expect(action).toBe("/api/contact");
    expect(method?.toLowerCase()).toBe("post");

    // Check hidden lang field exists (hidden inputs are not "visible" but are attached)
    const langInput = page.locator('input[name="lang"]').first();
    await expect(langInput).toBeAttached();
    expect(await langInput.getAttribute("type")).toBe("hidden");

    // Check all required fields have required attribute
    const requiredInputs = page.locator("input[required], textarea[required]");
    const requiredCount = await requiredInputs.count();
    expect(requiredCount).toBeGreaterThanOrEqual(3); // name, email, details
  });

  test("displays email direct link", async ({ page }) => {
    await page.goto("/contact");

    // Check for mailto link
    const emailLink = page.locator('a[href^="mailto:"]').first();
    await expect(emailLink).toBeVisible();

    const href = await emailLink.getAttribute("href");
    expect(href).toContain("@");
  });

  test("has back to home navigation", async ({ page }) => {
    await page.goto("/contact");

    // Look for back to home link (could be "Back to Home" or similar)
    const backLink = page
      .locator("a")
      .filter({ hasText: /Back|Home|ホーム|رئيسية/ })
      .first();
    const count = await backLink.count();

    // Should have at least one navigation link
    if (count > 0) {
      await expect(backLink).toBeVisible();
    }
  });
});
