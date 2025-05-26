import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const redirects = await prisma.redirect.findMany({
      include: {
        _count: {
          select: {
            visits: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(redirects);
  } catch (error) {
    console.error("Error fetching redirects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, firstUrl, nextUrl } = body;

    // Validate required fields
    if (!slug || !firstUrl || !nextUrl) {
      return NextResponse.json(
        { error: "Missing required fields: slug, firstUrl, nextUrl" },
        { status: 400 }
      );
    }

    // Validate URLs
    try {
      new URL(firstUrl);
      new URL(nextUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingRedirect = await prisma.redirect.findUnique({
      where: { slug },
    });

    if (existingRedirect) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 }
      );
    }

    // Create the redirect
    const redirect = await prisma.redirect.create({
      data: {
        slug,
        firstUrl,
        nextUrl,
      },
    });

    // Get the base URL for the response
    const baseUrl = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const link = `${protocol}://${baseUrl}/${slug}`;

    return NextResponse.json({
      slug: redirect.slug,
      link,
    });
  } catch (error) {
    console.error("Error creating redirect:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
