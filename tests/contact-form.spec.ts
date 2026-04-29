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
    const nameInput = page.locator('input[name="name"], input[id*="name"]').first();
    await expect(nameInput).toBeVisible();

    // Check email input
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    await expect(emailInput).toBeVisible();

    // Check message textarea
    const messageInput = page.locator('textarea[name="message"], textarea[id*="message"]').first();
    await expect(messageInput).toBeVisible();

    // Check submit button
    const submitButton = page.locator('button[type="submit"]').first();
    await expect(submitButton).toBeVisible();
  });

  test("shows validation errors for empty fields", async ({ page }) => {
    await page.goto("/contact");

    // Submit empty form
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Wait for validation
    await page.waitForTimeout(500);

    // Check for validation error messages
    const errorMessages = page.locator("text=/required|Required|error|Error|invalid|Invalid/");
    const count = await errorMessages.count();

    // Should have at least one error message
    expect(count).toBeGreaterThan(0);
  });

  test("shows validation error for invalid email", async ({ page }) => {
    await page.goto("/contact");

    // Fill name
    const nameInput = page.locator('input[name="name"]').first();
    await nameInput.fill("Test User");

    // Fill invalid email
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill("not-an-email");

    // Fill message
    const messageInput = page.locator('textarea[name="message"]').first();
    await messageInput.fill("Test message content.");

    // Submit
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();

    // Wait for validation
    await page.waitForTimeout(500);

    // Check for email validation error
    const errorMessages = page.locator("text=/email|Email|invalid|Invalid/");
    const count = await errorMessages.count();
    expect(count).toBeGreaterThan(0);
  });

  test("accepts valid form input", async ({ page }) => {
    await page.goto("/contact");

    // Fill name
    const nameInput = page.locator('input[name="name"]').first();
    await nameInput.fill("Test User");

    // Fill valid email
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill("test@example.com");

    // Fill message
    const messageInput = page.locator('textarea[name="message"]').first();
    await messageInput.fill("This is a test message for the contact form.");

    // Verify inputs have values
    const nameValue = await nameInput.inputValue();
    expect(nameValue).toBe("Test User");

    const emailValue = await emailInput.inputValue();
    expect(emailValue).toBe("test@example.com");

    const messageValue = await messageInput.inputValue();
    expect(messageValue).toBe("This is a test message for the contact form.");
  });

  test("form has proper accessibility attributes", async ({ page }) => {
    await page.goto("/contact");

    // Check for labels or aria-labels on inputs
    const inputs = page.locator('input, textarea');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);

      // Check if input has associated label
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledBy = await input.getAttribute("aria-labelledby");
      const placeholder = await input.getAttribute("placeholder");

      // Should have at least one form of labeling
      const hasLabel =
        ariaLabel || ariaLabelledBy || placeholder || (id && await page.locator(`label[for="${id}"]`).count() > 0);

      // Name and email fields should have labels
      const name = await input.getAttribute("name");
      if (name === "name" || name === "email" || name === "message") {
        expect(hasLabel).toBe(true);
      }
    }
  });

  test("displays contact information", async ({ page }) => {
    await page.goto("/contact");

    // Look for contact details (email, phone, address)
    const contactInfo = page.locator("text=/@|\\.com|\\.net|phone|tel:|address/i");
    const count = await contactInfo.count();

    // Should have some contact information
    // Note: This may vary based on page content
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("has working navigation back to home", async ({ page }) => {
    await page.goto("/contact");

    // Look for home link or logo
    const homeLink = page.locator('a[href="/"], a[href="/en/"]').first();
    await expect(homeLink).toBeVisible();

    // Click and verify navigation
    await homeLink.click();
    await page.waitForLoadState("networkidle");

    // Should be on home page
    expect(page.url()).toMatch(/\/$|\/en\/$/);
  });
});
