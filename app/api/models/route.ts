import { NextResponse } from "next/server";
import { JsonRpcSigner } from "ethers";
import { createZGServingNetworkBroker } from "@0glabs/0g-serving-broker";

const models = [
  {
    id: "gpt-4",
    name: "GPT-4",
    fee: 0.01,
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    fee: 0.005,
  },
];

export async function POST(request: Request) {
  try {
    const { signer } = await request.json();

    if (!signer) {
      return NextResponse.json(
        { error: "Signer is required" },
        { status: 400 }
      );
    }

    try {
      const newProcessor = await createZGServingNetworkBroker(signer);
      console.log("Created processor:", newProcessor);
    } catch (processorError) {
      console.error("Processor creation error:", processorError);
      return NextResponse.json(
        {
          error: "Failed to create processor",
          details: processorError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(models);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch models", details: error.message },
      { status: 500 }
    );
  }
}
