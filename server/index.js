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

// Logger setup remains the same
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

// Modified TechTip schema to include geographic category
const TechTipSchema = new mongoose.Schema({
  title: String,
  content: String,
  url: String,
  author: String,
  source: String,
  category: {
    type: String,
    enum: ['ghana', 'africa', 'world'],
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

// Modified NewsArticle schema to include geographic category
const NewsArticleSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
  source: String,
  category: {
    type: String,
    enum: ['ghana', 'africa', 'world'],
    required: true
  },
  publishedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

// Updated indexes to include category
TechTipSchema.index({ title: 1, source: 1, category: 1 }, { unique: true });
NewsArticleSchema.index({ title: 1, source: 1, category: 1 }, { unique: true });

const TechTip = mongoose.model('TechTip', TechTipSchema);
const NewsArticle = mongoose.model('NewsArticle', NewsArticleSchema);

// Middleware setup remains the same
app.use(express.json());
app.use(cors());
app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Modified routes to handle categories
app.get('/api/news/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (!['ghana', 'africa', 'world'].includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const articles = await NewsArticle.find({ category })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await NewsArticle.countDocuments({ category });

    res.json({
      articles,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalArticles: total
    });
  } catch (error) {
    logger.error('Error fetching news:', error);
    res.status(500).json({ message: 'Error fetching news' });
  }
});

app.get('/api/tips/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!['ghana', 'africa', 'world'].includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const tips = await TechTip.find({ category })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await TechTip.countDocuments({ category });

    res.json({
      tips,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTips: total
    });
  } catch (error) {
    logger.error('Error fetching tips:', error);
    res.status(500).json({ message: 'Error fetching tips' });
  }
});

// Modified scraping function to categorize tech tips
async function scrapeTechTips() {
  const sources = {
    ghana: ['https://dev.to/t/ghana', 'https://dev.to/search?q=ghana+tech'],
    africa: ['https://dev.to/t/africa', 'https://dev.to/search?q=africa+tech'],
    world: ['https://dev.to/t/javascript/top/week', 'https://dev.to/t/technology/top/week']
  };

  for (const [category, urls] of Object.entries(sources)) {
    for (const url of urls) {
      try {
        const response = await axios.get(url, {
          headers: { 'User-Agent': 'TechTipsBot/1.0' }
        });
        const $ = cheerio.load(response.data);
        
        const tips = [];
        $('.crayons-story').each((i, element) => {
          const title = $(element).find('.crayons-story__title').text().trim();
          const content = $(element).find('.crayons-story__snippet').text().trim();
          const author = $(element).find('.crayons-story__meta a').first().text().trim();
          const relativeUrl = $(element).find('.crayons-story__title a').attr('href');

          if (relativeUrl) {
            const url = new URL(relativeUrl, 'https://dev.to').href;
            tips.push({
              title,
              content,
              url,
              author,
              source: 'DEV Community',
              category
            });
          }
        });
        // Save tips
        for (let tip of tips) {
          try {
            const savedTip = await TechTip.findOneAndUpdate(
              { title: tip.title, source: tip.source, category: tip.category },
              tip,
              { upsert: true, new: true }
            );
       
          } catch (error) {
            logger.error(`Error saving tip: ${tip.title} - ${error.message}`);
          }
        }
      } catch (error) {
        logger.error(`Error scraping ${category} tips from ${url}: ${error.message}`);
      }
    }
  }
}


// Modified news fetching function to handle categories
async function fetchNewsArticles() {
  const queries = {
    ghana: 'technology AND (Ghana OR "Ghanaian tech")',
    africa: 'technology AND Africa NOT Ghana',
    world: 'technology'
  };

  for (const [category, query] of Object.entries(queries)) {
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&apiKey=${process.env.NEWS_API_KEY}`
      );

      const articles = response.data.articles;

      for (let article of articles) {
        try {
          await NewsArticle.findOneAndUpdate(
            { title: article.title, source: article.source.name, category },
            {
              title: article.title,
              description: article.description,
              url: article.url,
              source: article.source.name,
              category,
              publishedAt: new Date(article.publishedAt)
            },
            { upsert: true, new: true }
          );
        } catch (error) {
          logger.error(`Error saving ${category} article:`, error);
        }
      }
    } catch (error) {
      logger.error(`Error fetching ${category} news articles:`, error);
    }
  }
}

// Schedule and initialization remain the same
cron.schedule('0 */6 * * *', async () => {
  await scrapeTechTips();
  await fetchNewsArticles();
});

app.get('/api/refresh', async (req, res) => {
  try {
    await scrapeTechTips();
    await fetchNewsArticles();
    res.json({ message: 'Data refresh completed' });
  } catch (error) {
    logger.error('Error refreshing data:', error);
    res.status(500).json({ message: 'Error refreshing data' });
  }
});

app.get("/", (req, res) => {
  res.send("api working");
});

// Server startup
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
    // Initial scrape and fetch
    scrapeTechTips();
    fetchNewsArticles();
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err);
  });