import puppeteer from "puppeteer";

export const takeScreenshotUrl = async (url: string) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const image = await page.screenshot({ type: "webp", encoding: "base64" });
  await browser.close();

  return image;
};
