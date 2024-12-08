// import { NextResponse } from "next/server";
// import { getBroker } from "@/lib/broker";
// import { createZGServingNetworkBroker } from "@0glabs/0g-serving-broker";
// import { ethers } from "ethers";
// import { JsonRpcSigner } from "ethers";
// // Add export for allowed methods
// export const dynamic = "force-dynamic";
// export const runtime = "nodejs";

// // Add OPTIONS method handler
// export async function OPTIONS() {
//   return new NextResponse(null, {
//     status: 204,
//     headers: {
//       Allow: "POST",
//       "Access-Control-Allow-Methods": "POST",
//       "Access-Control-Allow-Headers": "Content-Type, Authorization",
//     },
//   });
// }

// export async function POST(request: Request) {
//   try {
//     const { providerAddress, serviceName, fee, client } = await request.json();
//     console.log(client);

//     console.log(providerAddress);
//     console.log(serviceName);
//     console.log(fee);
//     const { account, chain, transport } = client;
//     const provider = new ethers.JsonRpcProvider("https://evmrpc-testnet.0g.ai");
//     const signer = new ethers.JsonRpcSigner(
//       provider,
//       "0x5d0655b8D44A7FA3a8fc7ff3846d971397eA21B1"
//     );
//     console.log(signer);
//     console.log(createZGServingNetworkBroker);

//     const broker = await createZGServingNetworkBroker(signer);
//     console.log("Broker created:", broker);

//     await broker.settleFee(providerAddress, serviceName, fee);
//     return NextResponse.json({ success: true });
//   } catch (error: any) {
//     console.error("Settle Fee Route - Error:", error);
//     return NextResponse.json(
//       { error: "Failed to settle fee", details: error.message },
//       { status: 500 }
//     );
//   }
// }
