import { GoogleGenAI } from "@google/genai";
import yahooFinance from 'yahoo-finance2';
import dotenv from "dotenv";
dotenv.config();


const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY });

export const getStockInsightHandler = async (req, res) => {
  const symbol = req.query.symbol;
  let data = [];


  if (!symbol) {
    return res.status(400).json({ error: 'Missing stock symbol' });
  }

  try {

    const historicalPrices = await yahooFinance.historical(symbol, {
      period1: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      period2: new Date(),
      interval: '1d'
    });

    const chartData = historicalPrices.map(item => ({
      date: item.date.toISOString().split('T')[0],
      high: item.high,
      low: item.low,
      volume: item.volume,
    }));


    const highs = historicalPrices.map(item => item.high)


    //  const highPrices = historicalPrices.map(day => day.high);

    //  console.log("High prices for the last month:", highPrices);

    const chatResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide a detailed explanation of the ${symbol} stock's historical performance and recent trends, strictly limited to 3000 characters.

Use the provided 1-month data ${highs} to form a general investment opinion, but do not mention or reference that it is based on this data. Avoid phrases like “based on the given data,” “here is your explanation,” or anything similar.

The response must:

Be written in Markdown format, suitable for React Markdown rendering on the frontend.

Bold all key insights and important keywords.

Use only the four fixed section headings listed below — no extra or custom sections allowed.

Add one empty line (padding) above and below each heading for visual clarity.

Use the following exact heading format:

<div style="padding-top: 16px;"></div>  
## <span style="color:#052841; font-size:20px; font-weight:bold">Overview</span>

[Content...]

<div style="padding-top: 16px;"></div>  
## <span style="color:#052841; font-size:20px; font-weight:bold">Historical Performance</span>

[Content...]

<div style="padding-top: 16px;"></div>  
## <span style="color:#052841; font-size:20px; font-weight:bold">Recent Trends</span>

[Content...]

<div style="padding-top: 16px;"></div>  
## <span style="color:#052841; font-size:20px; font-weight:bold">Investment Outlook</span>

[Content...]
Keep the tone objective, informative, and analytical. Do not include any unnecessary filler, transitions, or explanations outside of the structured content.`
    });
    const insights = chatResponse.text
    console.log(insights);
    return res.json({ insight: insights, chartData });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: 'Failed to fetch insights from Gemini' });
  }
};
