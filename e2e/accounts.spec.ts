import { expect, test } from "@playwright/test";
import { deleteTestUsers, finishFirstLevel, logIn, newEmail, signUp } from "./helpers";

test.afterAll(deleteTestUsers);

// 9.2 Sign up -> lesson -> log out -> log in -> progress kept
test("progress survives logging out and back in", async ({ page }) => {
  const email = newEmail();

  await signUp(page, email);
  await finishFirstLevel(page);

  await page.goto("/profile");
  await expect(page.getByText("1 of 6 levels done")).toBeVisible();

  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();

  // Logging out clears this browser, so the next visitor starts fresh.
  await page.goto("/lessons");
  await expect(page.getByText("0 of 6 levels done")).toBeVisible();

  await logIn(page, email);
  await expect(page).toHaveURL(/\/lessons$/);
  await expect(page.getByText("1 of 6 levels done")).toBeVisible();
});

test("guest progress is merged into a new account", async ({ page }) => {
  await finishFirstLevel(page);
  await signUp(page, newEmail());

  await page.goto("/profile");
  await expect(page.getByText("1 of 6 levels done")).toBeVisible();
});

test("a wrong password shows an error", async ({ page }) => {
  const email = newEmail();
  await signUp(page, email);
  await page.getByRole("button", { name: "Log out" }).click();
  await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();

  await logIn(page, email, "not-the-password");
  await expect(page.getByText("Invalid email or password")).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("protected pages send logged-out visitors to log in", async ({ page }) => {
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login\?next=%2Fprofile/);

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/login\?next=%2Fadmin/);
});

test("a normal user cannot open the admin dashboard", async ({ page }) => {
  await signUp(page, newEmail());
  await page.goto("/admin");
  await expect(page.getByText("This page does not exist.")).toBeVisible();
  await expect(page.getByText("TOTAL USERS")).toHaveCount(0);
});
