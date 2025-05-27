import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Use a transaction to atomically check and update the firstUsed flag
    const result = await prisma.$transaction(async (tx) => {
      // Find the redirect by slug
      const redirect = await tx.redirect.findUnique({
        where: { slug },
      });

      if (!redirect) {
        return { error: "Redirect not found" };
      }

      let redirectUrl: string;

      if (redirect.firstUsed) {
        // First redirect has already been used - redirect to nextUrl
        redirectUrl = redirect.nextUrl;
      } else {
        // This is the first visit ever - mark as used and redirect to firstUrl
        await tx.redirect.update({
          where: { id: redirect.id },
          data: { firstUsed: true },
        });
        redirectUrl = redirect.firstUrl;
      }

      return { redirectUrl };
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    // Perform the redirect
    return NextResponse.redirect(result.redirectUrl, { status: 302 });
  } catch (error) {
    console.error("Error handling redirect:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
