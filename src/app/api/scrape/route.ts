import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export const POST = async (req: NextRequest, res: NextResponse) => {
    const data = await req.json();
    const url = data.url;
    const MAX_RETRIES = 3;
    const TIMEOUT_DURATION = 30000; // 30 seconds

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    let retries = 0;
    let success = false;
    let result = null;

    while (retries < MAX_RETRIES && !success) {
        try {
            const page = await browser.newPage();

            await page.goto(url, {
                waitUntil: "domcontentloaded",
                timeout: TIMEOUT_DURATION
            });

            result = await page.evaluate(() => {
                const title = document.title;
                const description = document.querySelector("meta[name='description']")?.getAttribute("content") || "No description found.";
                const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6")).map(h => h.textContent);
                const imagesCount = document.querySelectorAll("img").length;

                return {
                    title,
                    description,
                    headings,
                    imagesCount,
                    pageLoadTime: 0
                };
            });

            const pageLoadTime = await page.metrics().then(data => data.TaskDuration);
            result.pageLoadTime = pageLoadTime as number;
            success = true;

        } catch (error: any) {
            retries++;
            if (retries === MAX_RETRIES) {
                console.error({ error });
                return Response.json({
                    error: error.message || 'Failed to scrape the page'
                }, { status: 500 });
            }
        }
    }

    await browser.close();
    return Response.json(result);
};
