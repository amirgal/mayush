// Import the Convex client creation function
import { ConvexClient } from "convex/browser";

// Create a Convex client
// This URL should be replaced with your actual Convex deployment URL
// For development, we use a default URL that will be replaced when running 'npx convex dev'
export const convexClient = new ConvexClient(import.meta.env.VITE_CONVEX_URL as string);
