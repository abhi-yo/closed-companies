# Closed Companies

A public archive documenting startup failures from 2016-2025.

## Overview

This project maintains a database of failed startups, tracking their founding dates, shutdown dates, funding amounts, industries, and causes of failure. The data spans the funding winter period and provides insights into common startup failure patterns.

## Tech Stack

- Next.js with TypeScript
- MongoDB Atlas for data storage
- Tailwind CSS for styling
- Mongoose ODM for database operations

## Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables in `.env.local`:
   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   ```
4. Start the development server: `pnpm dev`

## Data Structure

Each startup record includes:
- Company name and description
- Founded and shutdown years
- Country and industry
- Total funding raised
- Primary cause of shutdown
- Reference article URL (where available)

## Features

- Year-based filtering (2016-2025)
- Search across company names, industries, and countries
- Responsive table with detailed company information
- Real-time statistics on failed startups and funding lost

## Sources

Data compiled from TechCrunch, Forbes, Business Insider, and other tech industry publications. All entries include founding/shutdown dates and funding information where publicly available.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
