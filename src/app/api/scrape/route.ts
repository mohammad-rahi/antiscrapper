import { NextRequest, NextResponse } from "next/server";
import puppeteer, { Page } from "puppeteer";

const MAX_RETRIES = 3;
const TIMEOUT_DURATION = 30000; // 30 seconds 

const launchBrowser = async () => {
    return await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
};

const scrapeContent = async (page: Page) => {
    return await page.evaluate(() => {
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
};

const getPageMetrics = async (page: Page) => {
    const metrics = await page.metrics();
    return metrics.TaskDuration as number;
};

export const POST = async (req: NextRequest) => {
    const data = await req.json();
    const url = data.url;
    const browser = await launchBrowser();
    let result = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const page = await browser.newPage();
            await page.goto(url, {
                waitUntil: "networkidle2",
                timeout: TIMEOUT_DURATION
            });

            result = await scrapeContent(page);
            result.pageLoadTime = await getPageMetrics(page);
            break;
        } catch (error: any) {
            if (attempt === MAX_RETRIES - 1) { // last retry
                console.error({ error });
                await browser.close();
                return NextResponse.json({
                    error: error.message || 'Failed to scrape the page'
                }, { status: 500 });
            }
        }
    }

    await browser.close();

    if (!result) {
        return NextResponse.json({
            error: 'Failed after all retries.'
        }, { status: 500 });
    }

    return NextResponse.json(result);
};
