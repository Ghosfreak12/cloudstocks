const https = require('https');
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_API_KEY;

const fetchStockPrice = (symbol) => {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=${Y40XKL904QT19YSB}`;

  return new Promise((resolve, reject) => {
    https.get(url, (resp) => {
      let data = '';
      resp.on('data', chunk => data += chunk);
      resp.on('end', () => {
        try {
          const json = JSON.parse(data);
          const times = json['Time Series (1min)'];
          if (!times) throw new Error("Invalid symbol or limit hit");
          const [latest] = Object.keys(times);
          resolve({ time: latest, price: times[latest]['1. open'] });
        } catch (e) {
          reject(e.message);
        }
      });
    }).on("error", err => reject(err.message));
  });
};

exports.handler = async (event) => {
  const symbol = event.queryStringParameters?.symbol || "AAPL";
  try {
    const { time, price } = await fetchStockPrice(symbol);
    return {
      statusCode: 200,
      body: JSON.stringify({ symbol, time, price }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err }),
    };
  }
};