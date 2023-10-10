"use client";
import { useEffect, useState } from "react"

export default function Home() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState<{ title: string, description: string, headings: string[], imagesCount: number, pageLoadTime: number }>({
    title: "",
    description: "",
    headings: [],
    imagesCount: 0,
    pageLoadTime: 0
  });
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<{ url: string, data: typeof data }[]>([]);


  const isValidURL = (url: string) => {
    const regex = /^(https?:\/\/)?(([\da-z.-]+)\.([a-z.]{2,6})|((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))(\/[\w.-]*)*\/?$/;
    return regex.test(url);
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem("scrapingHistory");

    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);


  const handleScrap = async () => {
    if (url && isValidURL(url)) {
      setLoading(true);

      try {
        const response = await fetch("/api/scrape", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        });
        const jsonData = await response.json();

        const updatedHistory = [...history, { url, data: jsonData }];

        setHistory(updatedHistory);
        setData(jsonData);

        localStorage.setItem("scrapingHistory", JSON.stringify(updatedHistory));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please enter a valid URL.");
    }
  };


  const handleHistoryClick = (clickedUrl: string) => {
    const historyItem = history.find(item => item.url === clickedUrl);
    if (historyItem) {
      setData(historyItem.data);
    }
  };


  return (
    <main className="bg-gray-100 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white p-6 rounded-xl shadow-md flex max-h-[calc(100vh-100px)]">

        {/* Left Side - Input & Dashboard */}
        <div className="w-1/2 space-y-6 pr-4 border-r border-gray-200 sticky top-1/2 transform translate-y-(-50%)">
          <h2 className="text-2xl font-extrabold text-gray-900">
            Enter URL
          </h2>
          <div className="rounded-md shadow-sm">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="https://example.com"
            />
          </div>
          <div className="mt-4">
            <button
              onClick={handleScrap}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              {loading ? "Scraping..." : "Scrap"}
            </button>
          </div>


          <div className="w-1/2 space-y-6 sticky top-1/2 transform translate-y-(-50%)">
            <h3 className="text-xl font-bold mt-6">History</h3>
            <ul className="list-disc pl-5 mt-2">
              {history.map((item, idx) => (
                <li key={idx} className="cursor-pointer" onClick={() => handleHistoryClick(item.url)}>
                  {item.url}
                </li>
              ))}
            </ul>

          </div>
        </div>

        {/* Right Side - Scraped Data */}
        <div className="w-1/2 space-y-6 pl-4 overflow-y-auto max-h-screen">
          <h2 className="text-2xl font-extrabold text-gray-900">
            Scraped Data
          </h2>
          <div className="text-gray-700 break-words">
            <p><strong>Title:</strong> {data.title}</p>
            <p><strong>Description:</strong> {data.description}</p>
            <p><strong>Number of Images:</strong> {data.imagesCount}</p>
            <p><strong>Page Load Time (ms):</strong> {data.pageLoadTime}</p>
            <div>
              <strong>Headings:</strong>
              <ul className="list-disc pl-5 mt-2">
                {data.headings && data.headings.map((heading, idx) => (
                  <li key={idx}>{heading}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>

  )
}
