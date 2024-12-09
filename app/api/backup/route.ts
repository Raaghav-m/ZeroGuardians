import { NextResponse } from "next/server";
import { Indexer, Blob, getFlowContract, ZgFile } from "@0glabs/0g-ts-sdk";
import { ethers } from "ethers";
import { writeFileSync, readFileSync, mkdirSync, existsSync } from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const evmRpc =
      process.env.NEXT_PUBLIC_EVM_RPC || "https://evmrpc-testnet.0g.ai";
    const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;
    const flowAddr =
      process.env.NEXT_PUBLIC_FLOW_ADDR ||
      "0x0460aA47b41a66694c0a73f667a1b795A5ED3556";
    const indRpc =
      process.env.NEXT_PUBLIC_IND_RPC ||
      "https://indexer-storage-testnet-standard.0g.ai";

    if (!privateKey) {
      throw new Error("Private key is required");
    }

    const provider = new ethers.JsonRpcProvider(evmRpc);
    const indexer = new Indexer(indRpc);
    const signer = new ethers.Wallet(privateKey, provider);
    const flowContract = getFlowContract(flowAddr, signer);
    const json = await request.json();
    const jsonString = JSON.stringify(json);

    // Ensure temp directory exists
    const tempDir = path.join(process.cwd(), "temp");
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }

    const tempPath = path.join(tempDir, "backup.json");
    writeFileSync(tempPath, jsonString);

    // Read file back
    const file = await ZgFile.fromFilePath(tempPath);

    const [tree, err] = await file.merkleTree();
    const [tx, error] = await indexer.upload(file, evmRpc, signer);

    if (error === null) {
      console.log("File uploaded successfully, tx: ", tx);
    } else {
      console.log("Error uploading file: ", error);
    }

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      success: true,
      rootHash: tree?.rootHash(),
    });
  } catch (error: any) {
    console.error("Backup Error:", error);
    return NextResponse.json(
      { error: "Failed to backup chat", details: error.message },
      { status: 500 }
    );
  }
}
