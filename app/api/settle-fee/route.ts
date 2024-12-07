import { NextResponse } from "next/server";
import { createZGServingNetworkBroker } from "@0glabs/0g-serving-broker";
import { JsonRpcSigner } from "ethers";

export async function POST(request: Request) {
  console.log("Settle Fee API Route - Request received");
  const { providerAddress, serviceName, price, signer } = await request.json();

  try {
    const broker = await createZGServingNetworkBroker(signer);
    await broker.settleFee(providerAddress, serviceName, price);

    console.log("Settle Fee API Route - Success");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settle Fee API Route - Error:", error);
    return NextResponse.json(
      { error: "Failed to settle fee" },
      { status: 500 }
    );
  }
}
