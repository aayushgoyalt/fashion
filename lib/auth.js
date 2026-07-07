import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

/**
 * Retrieves the current logged-in user session from NextAuth, connects to the database,
 * and returns the Mongoose User document.
 * 
 * @returns {Promise<Object|null>} The Mongoose user document or null if not authenticated
 */
export async function getDbUser() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return null;
    }
    
    await connectToDatabase();
    
    const user = await User.findOne({ email: session.user.email });
    return user;
  } catch (error) {
    console.error("Error retrieving DB user via session:", error);
    return null;
  }
}

/**
 * Server-side check to see if the user is an admin.
 * 
 * @returns {Promise<boolean>} True if user is admin, false otherwise
 */
export async function isAdmin() {
  const user = await getDbUser();
  return user?.role === "admin";
}
