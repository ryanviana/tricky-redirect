import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

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

    let redirectUrl: string;

    if (redirect.firstUsed) {
      // First redirect has already been used - redirect to nextUrl
      redirectUrl = redirect.nextUrl;
    } else {
      // This is the first visit ever - mark as used and redirect to firstUrl
      await prisma.redirect.update({
        where: { id: redirect.id },
        data: { firstUsed: true },
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
