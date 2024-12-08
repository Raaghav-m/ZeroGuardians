import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  console.log("API Route - Request received");
  const { endpoint, model, prompt, headers } = await request.json();

  try {
    const openai = new OpenAI({
      baseURL: endpoint,
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
      dangerouslyAllowBrowser: true,
    });

    const completion = await openai.chat.completions.create(
      {
        messages: [{ role: "system", content: prompt }],
        model: model,
      },
      {
        headers: {
          ...headers,
        },
      }
    );
    console.log(completion.choices[0].message.content);

    return NextResponse.json(completion);
  } catch (error: any) {
    if (error.message?.includes("Please use 'settleFee'")) {
      const feeMatch = error.message?.match(/expected ([\d.]+) A0GI/);
      const requiredFee = feeMatch ? feeMatch[1] : null;
      console.log(requiredFee);
      return NextResponse.json(
        {
          error: "Failed to settle fee",
          requiredFee: requiredFee, // Pass the extracted fee
        },
        { status: 402 }
      );
    }
    console.error("API Route - OpenAI error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // Extract fee amount from error message

    return NextResponse.json(
      { error: "Failed to get completion" },
      { status: 500 }
    );
  }
}
