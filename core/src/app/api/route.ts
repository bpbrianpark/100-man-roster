import { createClient } from "../../../lib/supabase/server";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return NextResponse.json({ authenticated: !!user, user });
};
