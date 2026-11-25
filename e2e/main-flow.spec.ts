import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";

test.beforeAll(async () => { await mkdir("docs/screenshots", { recursive: true }); });

test("основной сценарий высокого риска", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Проверка подозрительного письма" })).toBeVisible();
  await page.screenshot({ path: `docs/screenshots/${test.info().project.name}-empty.png`, fullPage: true });
  await page.getByRole("button", { name: /Новые реквизиты/u }).click();
  await expect(page.getByRole("heading", { name: "Высокая подозрительность" })).toBeVisible();
  await expect(page.getByText("Изменение платёжных реквизитов", { exact: true })).toBeVisible();
  await page.screenshot({ path: `docs/screenshots/${test.info().project.name}-high-risk.png`, fullPage: true });
});

test("обычное письмо и повторная проверка", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Обычное письмо/u }).click();
  await expect(page.getByRole("heading", { name: "Явных признаков не обнаружено" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Проверить ещё раз" })).toBeEnabled();
  await page.screenshot({ path: `docs/screenshots/${test.info().project.name}-low-risk.png`, fullPage: true });
});

test("AI без конфигурации честно переключается на правила", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: /Срочный вход/u }).click();
  await expect(page.getByText(/AI-режим не настроен/u)).toBeVisible();
  await expect(page.getByText("Анализ по правилам", { exact: true }).last()).toBeVisible();
});

test("валидация пустого ввода", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Проверить письмо" }).click();
  await expect(page.getByText(/минимум 20 символов/u)).toBeVisible();
});
