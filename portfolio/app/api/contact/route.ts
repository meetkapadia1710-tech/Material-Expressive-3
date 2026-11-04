import { NextResponse } from "next/server";
import { normalizeContact, validateContact } from "@/lib/contact-validation";

const maxRequestBytes = 64 * 1024;

function getAccessKey() {
  return process.env.WEB3FORMS_ACCESS_KEY?.trim() || process.env.WEB3FORMS_KEY?.trim() || "";
}

export async function GET() {
  return NextResponse.json({ configured: Boolean(getAccessKey()) }, {
    headers: { "Cache-Control": "no-store" },
  });
}

function requestTooLarge() {
  return NextResponse.json({ success: false, message: "Contact request is too large." }, { status: 413 });
}

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length")) > maxRequestBytes) return requestTooLarge();
  const reader = request.body?.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let body: unknown = null;
  try {
    let size = 0;
    let json = "";
    if (reader) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxRequestBytes) {
          void reader.cancel().catch(() => {});
          return requestTooLarge();
        }
        json += decoder.decode(value, { stream: true });
      }
      body = JSON.parse(json + decoder.decode());
    }
  } catch {
    void reader?.cancel().catch(() => {});
  } finally {
    reader?.releaseLock();
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ success: false, message: "Invalid contact request." }, { status: 400 });
  }

  const { name, email, subject, message, botcheck } = body as Record<string, unknown>;
  if (botcheck) {
    return NextResponse.json({ success: true, message: "Message received." });
  }

  if (typeof name !== "string" || typeof email !== "string" || typeof subject !== "string" || typeof message !== "string") {
    return NextResponse.json({ success: false, message: "Name, email, subject and message are required." }, { status: 400 });
  }

  const fields = normalizeContact({ name, email, subject, message });
  const errors = validateContact(fields);
  if (Object.keys(errors).length) {
    return NextResponse.json({ success: false, message: "Check the contact form fields.", errors }, { status: 400 });
  }

  const accessKey = getAccessKey();
  if (!accessKey) {
    return NextResponse.json(
      { success: false, fallbackMailto: true, message: "Message delivery is currently unavailable." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        access_key: accessKey,
        ...fields,
        subject: `[Portfolio Contact] ${fields.subject}`,
        from_name: `${fields.name} via Meet's Portfolio`,
      }),
    });

    if (response.ok && (await response.json())?.success === true) {
      return NextResponse.json({
        success: true,
        message: "Message delivered successfully! I will get back to you soon.",
      });
    }
  } catch {
    // Provider failures use the same public response as a provider rejection.
  }

  return NextResponse.json(
    { success: false, fallbackMailto: true, message: "Unable to deliver the message. Please try again." },
    { status: 502 },
  );
}

