import { expect, test } from "@playwright/test";
import { finishFirstLevel } from "./helpers";

// 9.1 Guest completes lesson 1
test("a guest completes level 1 and keeps the progress after a refresh", async ({ page }) => {
  await finishFirstLevel(page);

  await page.goto("/lessons");
  await expect(page.getByText("1 of 6 levels done")).toBeVisible();

  await page.reload();
  await expect(page.getByText("1 of 6 levels done")).toBeVisible();
});

test("level 2 is locked until level 1 is done", async ({ page }) => {
  await page.goto("/lessons/stage-a-file");
  await expect(page.getByRole("heading", { name: "Level 2 is locked" })).toBeVisible();
});

test("the learner counter shows at least 100", async ({ page }) => {
  await page.goto("/");
  const counter = page.getByText("learners and counting");
  await expect(counter).toBeVisible();
  const value = Number((await counter.locator("span").first().textContent())?.replace(/,/g, ""));
  expect(value).toBeGreaterThanOrEqual(100);
});
