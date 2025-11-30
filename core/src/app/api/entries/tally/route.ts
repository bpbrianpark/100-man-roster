import { NextRequest, NextResponse } from "next/server";
import { EntryPayload, dedupeEntryPayloads } from "../../../../lib/entry-utils";
import { prismaAdmin as prisma } from "../../../../../lib/prisma-admin";
import { normalize } from "../../../../../lib/normalize";

type TallyRequestBody = {
  slug?: string;
  entries?: EntryPayload[];
};

export async function POST(req: NextRequest) {
  try {
    const body: TallyRequestBody = await req.json();
    const { slug, entries } = body;

    console.log("[/api/entries/tally] Incoming request", {
      slug,
      entriesCount: Array.isArray(entries) ? entries.length : 0,
    });

    if (!slug || !Array.isArray(entries) || entries.length === 0) {
      console.warn("[/api/entries/tally] Missing payload; aborting", {
        slug,
      });

      return NextResponse.json(
        { error: "Missing required payload" },
        { status: 400 },
      );
    }

    const deduped = dedupeEntryPayloads(entries);

    console.log("[/api/entries/tally] Deduped entries", {
      originalCount: entries.length,
      dedupedCount: deduped.length,
    });

    if (deduped.length === 0) {
      console.log("[/api/entries/tally] Nothing to process after dedupe");
      return NextResponse.json({ ok: true });
    }

    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await prisma.$transaction(async (tx) => {
          const category = await tx.category.findUnique({
            where: { slug },
          });

          if (!category) {
            console.error("[/api/entries/tally] Category not found for slug", slug);
            throw new Error("Category not found");
          }

          const categoryId = category.id;

          for (const entry of deduped) {
            const url = entry.url;
            const label = entry.label;
            const normValue = entry.norm ?? (label ? normalize(label) : undefined);

            if (!url || !label || !normValue) {
              console.warn("[/api/entries/tally] Skipping incomplete entry", entry);
              continue;
            }

            console.log("[/api/entries/tally] Upserting entry", {
              url,
              label,
              normValue,
            });

            await tx.entry.upsert({
              where: { url },
              update: {
                count: { increment: 1 },
                norm: normValue,
                label,
              } as any,
              create: {
                categoryId,
                label,
                norm: normValue,
                url,
                count: 1,
              } as any,
            } as any);
          }
        });
        return NextResponse.json({ ok: true });
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`[/api/entries/tally] Attempt ${attempt + 1} failed:`, lastError);

        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error("Unknown error");
  } catch (error) {
    console.error("[/api/entries/tally] Failed to increment entries", error);
    return NextResponse.json(
      {
        error: "Failed to increment entries",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
