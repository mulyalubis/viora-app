# Viora App

The official mobile shopping app for **Viora Cosmetic**. Customers can browse and buy cosmetic products from their phone instead of visiting the store, and customers who live nearby get **free delivery** with real-time order tracking.

> Companion project: **Viora Admin Dashboard**, the web dashboard the shop uses to manage products, orders, and notifications for this app.

## Why Viora?

Many of the products sold at Viora Cosmetic are not yet widely known in the local area. Customers often have to come to the store just to ask what a product is for and to buy it. Viora moves that experience into an app, so the shop can reach more local customers directly instead of relying on large marketplaces and social commerce platforms:

- Browse and buy products without going to the store
- Free delivery for customers near the shop
- Follow the order on a map in real time
- Pay online through a local payment gateway

## Features

- **Authentication**: sign up and sign in
- **Product browsing and management**: product listing and details
- **Maps**: location-based features for delivery
- **Real-time tracking**: follow the delivery status live
- **Online payment**: integrated with Midtrans
- **Free local delivery**: for customers within the shop's nearby area

## Tech Stack

| Area | Technology |
| --- | --- |
| Mobile app | React Native, Expo (Expo Router) |
| Language | TypeScript |
| Backend and real-time data | Convex |
| Payment | Midtrans |
| Build and deployment | EAS (Expo Application Services) |

## Screenshots

<!-- Replace with your own screenshots, e.g. put images in assets/screenshots/ -->

| Home | Product detail | Order tracking |
| --- | --- | --- |
| ![Home](https://res.cloudinary.com/he0pd9rd/image/upload/v1790059529/implementasi_beranda_yfurg9.jpg) | ![Product](https://res.cloudinary.com/he0pd9rd/image/upload/v1790059525/implementasi_detail_product_ceo1wa.jpg) | ![Tracking](https://res.cloudinary.com/he0pd9rd/image/upload/v1790059527/implementasi_tracking_delivery_zy6hsc.jpg) |

## Project Structure

```
app/            Screens and navigation (Expo Router, file-based routing)
components/     Reusable UI components
constant/       App-wide constants
convex/         Convex backend: schema, queries, and mutations
lib/            Helpers and shared configuration
src/services/   Service layer (e.g. API and payment integration)
store/          Client-side state management
utils/          Utility functions
assets/images/  Images and static assets
```

## Getting Started

### Prerequisites

- Node.js (LTS)
- npm
- A [Convex](https://www.convex.dev/) project
- A [Midtrans](https://midtrans.com/) sandbox account (for testing payments)
- Expo Go, or an Android/iOS emulator

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/mulyalubis/viora-app.git
   cd viora-app
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Set up environment variables

   Create a `.env` file in the project root and fill in your own values:

   ```env
   EXPO_PUBLIC_CONVEX_URL=your_convex_deployment_url
   # Add your Midtrans keys and any other required keys here
   ```

4. Start the Convex backend (in a separate terminal)

   ```bash
   npx convex dev
   ```

5. Start the app

   ```bash
   npx expo start
   ```

   Then open it in Expo Go, an Android emulator, or an iOS simulator.

## Build

The project is configured for EAS Build (see `eas.json`):

```bash
eas build --platform android
```

## Roadmap

- [ ] Order history and push notifications
- [ ] More payment options
- [ ] Ratings and reviews

## Author

**Mulya Yustisio Lubis**
[GitHub](https://github.com/mulyalubis) · [LinkedIn](https://www.linkedin.com/in/mulyalubis)