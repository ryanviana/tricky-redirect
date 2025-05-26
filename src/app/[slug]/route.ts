import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getClientIP(request: NextRequest): string {
  // Try to get IP from various headers (for different hosting providers)
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback to a default IP for development
  return "127.0.0.1";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const clientIP = getClientIP(request);

    // Find the redirect by slug
    const redirect = await prisma.redirect.findUnique({
      where: { slug },
    });

    if (!redirect) {
      return NextResponse.json(
        { error: "Redirect not found" },
        { status: 404 }
      );
    }

    // Check if this IP has visited this slug before
    const existingVisit = await prisma.redirectVisit.findUnique({
      where: {
        slugId_visitorIp: {
          slugId: redirect.id,
          visitorIp: clientIP,
        },
      },
    });

    let redirectUrl: string;

    if (existingVisit) {
      // Subsequent visit - redirect to nextUrl
      redirectUrl = redirect.nextUrl;
    } else {
      // First visit - record the visit and redirect to firstUrl
      await prisma.redirectVisit.create({
        data: {
          slugId: redirect.id,
          visitorIp: clientIP,
        },
      });
      redirectUrl = redirect.firstUrl;
    }

    // Perform the redirect
    return NextResponse.redirect(redirectUrl, { status: 302 });
  } catch (error) {
    console.error("Error handling redirect:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
