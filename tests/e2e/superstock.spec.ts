import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("đăng nhập, xem dashboard và mở phiếu nhập nhiều dòng", async ({page}) => {
  const user=JSON.parse(await readFile("test-results/e2e-user.json","utf8")) as {email:string;password:string};
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Mật khẩu").fill(user.password);
  await page.getByRole("button",{name:"Đăng nhập"}).click();
  await expect(page).toHaveURL(/\/dashboard$/, {timeout: 15_000});
  await expect(page.getByRole("heading",{name:"Nhịp kho hôm nay"})).toBeVisible({timeout: 15_000});
  await page.goto("/stock/inbound/new");
  await expect(page.getByRole("heading",{name:"Tạo phiếu nhập"})).toBeVisible();
  await page.getByRole("button",{name:"+ Thêm dòng"}).click();
  await expect(page.getByText("Dòng 2",{exact:true})).toBeVisible();
  const accessibility=await new AxeBuilder({page}).analyze();
  expect(accessibility.violations).toEqual([]);
});
