import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event, { IEvent } from '@/database/event.model';

// Type for route params in Next.js App Router
interface RouteParams {
  params: Promise<{ slug: string }>;
}

// Standardized API response type
interface ApiResponse<T = null> {
  message: string;
  event?: T;
  error?: string;
}

// Slug validation regex: allows lowercase letters, numbers, and hyphens
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Validates the slug parameter
 * @param slug - The slug to validate
 * @returns Error message if invalid, null if valid
 */
function validateSlug(slug: string | undefined): string | null {
  if (!slug || typeof slug !== 'string') {
    return 'Slug parameter is required';
  }

  const trimmedSlug = slug.trim();

  if (trimmedSlug.length === 0) {
    return 'Slug cannot be empty';
  }

  if (trimmedSlug.length > 200) {
    return 'Slug exceeds maximum length of 200 characters';
  }

  if (!SLUG_REGEX.test(trimmedSlug)) {
    return 'Invalid slug format. Use only lowercase letters, numbers, and hyphens';
  }

  return null;
}

/**
 * GET /api/events/[slug]
 * Fetches a single event by its unique slug
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<IEvent>>> {
  try {
    // Await params (required in Next.js 15+)
    const { slug } = await params;

    // Validate slug parameter
    const validationError = validateSlug(slug);
    if (validationError) {
      return NextResponse.json(
        { message: validationError },
        { status: 400 }
      );
    }

    // Establish database connection
    await connectDB();

    // Query event by slug (already lowercase from schema)
    const event = await Event.findOne({ slug: slug.toLowerCase().trim() }).lean<IEvent>();

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { message: `Event with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    // Return successful response
    return NextResponse.json(
      { message: 'Event fetched successfully', event },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging (server-side only)
    console.error('Error fetching event by slug:', error);

    // Return generic error response (avoid leaking internal details)
    return NextResponse.json(
      {
        message: 'Failed to fetch event',
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
