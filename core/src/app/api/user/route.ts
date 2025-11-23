import { createClient } from "../../../../lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";
import { prisma } from "../../../../lib/prisma";

const userSchema = z.object({
  username: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, username, password } = userSchema.parse(body);

    const supabase = await createClient();

    // Check if username exists
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUserByUsername) {
      return NextResponse.json(
        { user: null, message: "Username already exists" },
        { status: 409 }
      );
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.error("Supabase signup error:", authError);
      return NextResponse.json(
        {
          user: null,
          message: authError?.message || "Registration failed",
          error: authError,
        },
        { status: 400 }
      );
    }

    // Create user profile with username
    try {
      const user = await prisma.user.create({
        data: {
          id: authData.user.id,
          email: authData.user.email!,
          username,
          password: "",
        },
      });

      // Check if session was returned (email confirmation disabled or already confirmed)
      if (authData.session) {
        // User is already signed in, return session
        return NextResponse.json(
          {
            user: { id: user.id, username: user.username, email: user.email },
            session: authData.session,
            requiresConfirmation: false,
          },
          { status: 201 }
        );
      }

      // No session = email confirmation required
      return NextResponse.json(
        {
          user: { id: user.id, username: user.username, email: user.email },
          requiresConfirmation: true,
          message:
            "Please check your email to confirm your account before signing in.",
        },
        { status: 201 }
      );
    } catch (dbError) {
      console.error("Database error:", dbError);
      // If user profile creation fails, we should clean up the auth user
      // For now, just return the error
      return NextResponse.json(
        {
          message: "Failed to create user profile",
          error: dbError instanceof Error ? dbError.message : String(dbError),
        },
        { status: 500 }
      );
    }
  } catch (e) {
    console.error("Request error:", e);
    return NextResponse.json(
      {
        message: "User was not created",
        error: e instanceof Error ? e.message : String(e),
      },
      { status: 500 }
    );
  }
}
