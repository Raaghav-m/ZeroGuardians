import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  console.log("API Route - Request received");
  const { endpoint, model, input, headers } = await request.json();

  console.log("API Route - Request details:", {
    endpoint,
    model,
    input,
    headers: { ...headers },
  });

  const openai = new OpenAI({
    baseURL: endpoint,
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
    dangerouslyAllowBrowser: true,
    defaultHeaders: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });

  try {
    const completion = await openai.chat.completions.create(
      {
        messages: [{ role: "system", content: input }],
        model: model,
      },
      {
        headers: {
          ...headers,
        },
      }
    );

    console.log(
      "API Route - OpenAI response:",
      completion.choices[0].message.content
    );
    return NextResponse.json(completion);
  } catch (error) {
    console.error("API Route - OpenAI error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { error: "Failed to get completion" },
      { status: 500 }
    );
  }
}
