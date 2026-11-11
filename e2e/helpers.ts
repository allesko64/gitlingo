import { like } from "drizzle-orm";
import { expect, type Page } from "@playwright/test";
import { db } from "../src/db";
import { user } from "../src/db/schema";

export const PASSWORD = "password1234";
export const FIRST_LEVEL = "/lessons/start-a-repository";

export function newEmail(): string {
  return `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}

/** Deletes every test account. Sessions, accounts and progress go with them (cascade). */
export async function deleteTestUsers(): Promise<void> {
  await db.delete(user).where(like(user.email, "e2e-%@example.com"));
}

/** Types a command into the lesson terminal. Retries if the page has not hydrated yet. */
export async function run(page: Page, command: string): Promise<void> {
  const input = page.getByRole("textbox", { name: /Lesson terminal/ });
  const log = page.getByRole("log", { name: "Terminal output" });
  await expect(async () => {
    await input.fill(command);
    await input.press("Enter");
    await expect(log).toContainText(command, { timeout: 1_000 });
  }).toPass({ timeout: 10_000 });
}

export async function finishFirstLevel(page: Page): Promise<void> {
  await page.goto(FIRST_LEVEL);
  await run(page, "git init");

  // Ignore empty ProgressSync posts; wait for guest 401 or a save that includes level 1.
  const syncResponse = page.waitForResponse(async (response) => {
    if (!response.url().includes("/api/progress") || response.request().method() !== "POST") {
      return false;
    }
    if (response.status() === 401) {
      return true;
    }
    if (response.status() !== 200) {
      return false;
    }
    const body = (await response.json()) as { completed?: string[] };
    return (body.completed ?? []).includes("start-a-repository");
  }, { timeout: 15_000 });

  await run(page, "git status");
  await expect(page.getByText(/^level complete$/i)).toBeVisible();
  await expect(page.locator('[data-lesson-saved="true"]')).toBeVisible();
  await syncResponse;
}

export async function signUp(page: Page, email: string): Promise<void> {
  await page.goto("/signup");
  await page.getByLabel("Name").fill("E2E Learner");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/lessons$/);
}

export async function logIn(page: Page, email: string, password = PASSWORD): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
}
