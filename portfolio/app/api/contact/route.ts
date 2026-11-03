import { NextResponse } from "next/server";

interface ContactRequestBody {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  botcheck?: string;
}

export async function GET() {
  const rawKey =
    process.env.WEB3FORMS_ACCESS_KEY ||
    process.env.NEXT_PUBLIC_WEB3FORMS_KEY ||
    process.env.WEB3FORMS_KEY ||
    "";
  return NextResponse.json({ key: rawKey.trim() });
}

export async function POST(request: Request) {
  try {
    const body: ContactRequestBody = await request.json();
    const { name, email, subject, message, botcheck } = body;

    // Spam honeypot detection
    if (botcheck) {
      return NextResponse.json({ success: true, message: "Message received." });
    }

    if (!name || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "Name, subject, and message are required." },
        { status: 400 }
      );
    }

    // Access key can be set in .env.local as WEB3FORMS_ACCESS_KEY or NEXT_PUBLIC_WEB3FORMS_KEY
    const rawKey =
      process.env.WEB3FORMS_ACCESS_KEY ||
      process.env.NEXT_PUBLIC_WEB3FORMS_KEY ||
      process.env.WEB3FORMS_KEY ||
      "";
    const accessKey = rawKey.trim();

    // If no key is configured yet, signal client to use mailto fallback
    if (!accessKey) {
      return NextResponse.json(
        {
          success: false,
          fallbackMailto: true,
          message:
            "Web3Forms access key not found. Please add WEB3FORMS_ACCESS_KEY in .env.local.",
        },
        { status: 200 }
      );
    }

    // Forward to Web3Forms API
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: accessKey,
        name: name.trim(),
        email: email ? email.trim() : "no-reply@meetkapadia.dev",
        subject: `[Portfolio Contact] ${subject.trim()}`,
        message: message.trim(),
        from_name: `${name.trim()} via Meet's Portfolio`,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return NextResponse.json({
        success: true,
        message: "Message delivered successfully! I will get back to you soon.",
      });
    }

    return NextResponse.json(
      {
        success: false,
        fallbackMailto: true,
        message: data.message || "Failed to submit message to Web3Forms.",
      },
      { status: 502 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        fallbackMailto: true,
        message: error instanceof Error ? error.message : "Internal server error.",
      },
      { status: 500 }
    );
  }
}

