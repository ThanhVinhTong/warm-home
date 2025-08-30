# Warm Home

Warm Home is a Next.js application for analyzing house prices in Australian suburbs, helping users find houses using Domain APIs, and providing a chatbot for users with technology disadvantages.

## Features

- **Overall Price Analysis**: Dashboard with charts and summaries of suburb median house prices, growth rates, and more.
- **Find House**: Search and view properties based on sample data or integrated Domain APIs.
- **Chatbot**: A user-friendly chatbot to assist those less familiar with technology in navigating the app.
- **Database Integration**: Uses MongoDB Atlas for storing and fetching suburb and property data.

## Prerequisites

- Node.js (v18+ recommended)
- PNPM (or NPM) for package management
- MongoDB Atlas account (free tier works)
- Optional: Domain API key for real property data (from [developer.domain.com.au](https://developer.domain.com.au/))

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/warm-home.git
   cd warm-home
   ```

2. Install dependencies:
   ```
   pnpm install
   ```
   (If using NPM: `npm install`)

3. Set up environment variables: Create a `.env.local` file in the root directory and add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
   ```
   - Replace placeholders with your Atlas details.
   - For Domain API integration, add `DOMAIN_API_KEY=your-key` (implement in relevant files as needed).

## Running the App

1. Start the development server:
   ```
   pnpm dev
   ```
   (Or `npm run dev`)

2. Open [http://localhost:3000](http://localhost:3000) in your browser.

3. Navigate to the dashboard at `/dashboard` to view price overviews, properties, and more.

## Seeding Data

The app uses sample data from `app/lib/placeholder-data.ts`. To populate your MongoDB database:

1. Ensure the app is running.
2. Visit [http://localhost:3000/seed](http://localhost:3000/seed) in your browser.
   - This inserts sample suburbs (e.g., Sydney CBD) and properties into the database.
   - Response: `{ "message": "Database seeded successfully" }`
   - Re-run as needed; it's idempotent (avoids duplicates).

If seeding fails, check console logs for errors (e.g., connection issues) and verify your MongoDB setup.

## Usage

- **Dashboard (/dashboard)**: View summaries, price charts, and latest properties.
- **Overall Price (/dashboard/overall-price)**: Detailed suburb price analysis (expand as needed).
- **Find House (/dashboard/find-house)**: Property search interface (integrate Domain APIs here).
- **Chatbot (/dashboard/chatbot)**: Chat interface for simplified assistance.

To integrate real Domain APIs:
- Sign up at [developer.domain.com.au](https://developer.domain.com.au/).
- Use packages like Properties & Locations in your fetch functions (e.g., in `app/lib/data.ts`).

## Contributing

1. Fork the repo.
2. Create a feature branch: `git checkout -b feature/new-feature`.
3. Commit changes: `git commit -m 'Add new feature'`.
4. Push: `git push origin feature/new-feature`.
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

For questions, open an issue or contact the maintainer.