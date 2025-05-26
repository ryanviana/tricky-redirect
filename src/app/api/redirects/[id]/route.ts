import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if redirect exists
    const existingRedirect = await prisma.redirect.findUnique({
      where: { id },
    });

    if (!existingRedirect) {
      return NextResponse.json(
        { error: "Redirect not found" },
        { status: 404 }
      );
    }

    // Delete the redirect (this will cascade delete visits due to the schema)
    await prisma.redirect.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Redirect deleted successfully",
      slug: existingRedirect.slug,
    });
  } catch (error) {
    console.error("Error deleting redirect:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
