import { prisma } from "../../../../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Endpoint to retrieve only entries
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;

  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        entries: {
          include: {
            aliases: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const entries = category.entries.map(entry => ({
      label: entry.label,
      norm: entry.norm,
      url: entry.url,
      aliases: entry.aliases.map(a => ({ label: a.label, norm: a.norm }))
    }));

    return NextResponse.json({ ok: true, entries });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

// Endpoint to post an entry
export async function POST(req: NextRequest) {
  try {
    const { prismaAdmin } = await import("../../../../../../lib/prisma-admin");
    const body = await req.json();
    const { categoryId, label, norm, url } = body

    const entry = await prismaAdmin.entry.create({
      data: {
        categoryId,
        label,
        norm,
        url
      }
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (e) {
    return NextResponse.json({
      message: 'Could not add entry', e
    }, { status: 409 })
  }
}
