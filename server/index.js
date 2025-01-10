import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cron from 'node-cron';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import cors from 'cors';
import connectDB from "./db/db.js";
import compression from 'compression';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Setup Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'tech-news-extractor' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});


// Define schemas
const TechTipSchema = new mongoose.Schema({
  title: String,
  content: String,
  url: String,
  author: String,
  source: String,
  createdAt: { type: Date, default: Date.now }
});

const NewsArticleSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
  source: String,
  publishedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

TechTipSchema.index({ title: 1, source: 1 }, { unique: true });
NewsArticleSchema.index({ title: 1, source: 1 }, { unique: true });

const TechTip = mongoose.model('TechTip', TechTipSchema);
const NewsArticle = mongoose.model('NewsArticle', NewsArticleSchema);

// Middleware
app.use(express.json());
app.use(cors());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.get('/api/news', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const articles = await NewsArticle.find()
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await NewsArticle.countDocuments();

    console.log(`Fetched ${articles.length} news articles`);
    res.json({
      articles,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalArticles: total
    });
  } catch (error) {
    logger.error('Error fetching news:', error);
    console.error('Error fetching news:', error);
    res.status(500).json({ message: 'Error fetching news' });
  }
});

app.get('/api/tips', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tips = await TechTip.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await TechTip.countDocuments();

    console.log(`Fetched ${tips.length} tech tips`);
    res.json({
      tips,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTips: total
    });
  } catch (error) {
    logger.error('Error fetching tips:', error);
    console.error('Error fetching tips:', error);
    res.status(500).json({ message: 'Error fetching tips' });
  }
});

app.get('/api/refresh', async (req, res) => {
  try {
    console.log('Manually refreshing data...');
    await scrapeTechTips();
    await fetchNewsArticles();
    res.json({ message: 'Data refresh completed' });
  } catch (error) {
    console.error('Error refreshing data:', error);
    res.status(500).json({ message: 'Error refreshing data' });
  }
});

// Function to scrape tech tips from DEV
async function scrapeTechTips() {
  const url = 'https://dev.to/t/javascript/top/week';
  try {
    console.log('Starting to scrape tech tips from DEV...');
    const response = await axios.get(url, {
      headers: { 'User-Agent': 'TechTipsBot/1.0 (https://yourdomain.com)' }
    });
    const $ = cheerio.load(response.data);
    
    const tips = [];

    $('.crayons-story').each((i, element) => {
      const title = $(element).find('.crayons-story__title').text().trim();
      const content = $(element).find('.crayons-story__snippet').text().trim();
    //   const url = 'https://dev.to' + $(element).find('.crayons-story__title a').attr('href');
      const author = $(element).find('.crayons-story__meta a').first().text().trim();
      
      const relativeUrl = $(element).find('.crayons-story__title a').attr('href');
      if (relativeUrl) {
        const url = new URL(relativeUrl, 'https://dev.to').href; // Ensures a valid absolute URL
        tips.push({
          title,
          content,
          url,
          author,
          source: 'DEV Community',
        });
        console.log(`Scraped URL: ${url}`);

      } else {
        console.error('Missing href for a tech tip, skipping...');
      }
      
    });

    console.log(`Scraped ${tips.length} tech tips from DEV`);

    // Save scraped tips to the database
    for (let tip of tips) {
      try {
        await TechTip.findOneAndUpdate(
          { title: tip.title, source: tip.source },
          tip,
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error('Error saving tip:', error);
        logger.error('Error saving tip:', error);
      }
    }

    logger.info(`Scraped and saved ${tips.length} tips from DEV`);
    console.log(`Scraped and saved ${tips.length} tips from DEV`);
  } catch (error) {
    logger.error('Error scraping tips from DEV:', error);
    console.error('Error scraping tips from DEV:', error);
  }
}

// Function to fetch news articles
async function fetchNewsArticles() {
  try {
    console.log('Starting to fetch news articles...');
    const response = await axios.get(`https://newsapi.org/v2/top-headlines?country=us&category=technology&apiKey=${process.env.NEWS_API_KEY}`);
    const articles = response.data.articles;

    console.log(`Fetched ${articles.length} news articles from NewsAPI`);

    for (let article of articles) {
      try {
        await NewsArticle.findOneAndUpdate(
          { title: article.title, source: article.source.name },
          {
            title: article.title,
            description: article.description,
            url: article.url,
            source: article.source.name,
            publishedAt: new Date(article.publishedAt)
          },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error('Error saving article:', error);
        logger.error('Error saving article:', error);
      }
    }

    logger.info(`Fetched and saved ${articles.length} news articles`);
    console.log(`Fetched and saved ${articles.length} news articles`);
  } catch (error) {
    logger.error('Error fetching news articles:', error);
    console.error('Error fetching news articles:', error);
  }
}

// Schedule scraping and fetching jobs
cron.schedule('0 */6 * * *', async () => {
  logger.info('Running scheduled scraping and fetching jobs...');
  console.log('Running scheduled scraping and fetching jobs...');
  await scrapeTechTips();
  await fetchNewsArticles();
});

app.get("/", (req, res) => {
  res.send("api working");
});

// Connect to the database and start the server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err);
  });
// Initial scrape and fetch on server start
console.log('Initiating initial scrape and fetch...');
scrapeTechTips();
fetchNewsArticles();

console.log('Server is set up and ready to handle requests!');

