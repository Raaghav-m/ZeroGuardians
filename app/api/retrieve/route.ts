import { NextResponse } from "next/server";
import { Indexer } from "@0glabs/0g-ts-sdk";
import { readFileSync, mkdirSync, existsSync, unlinkSync } from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { hashes } = await request.json();
    const backups = [];

    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), "temp");
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }

    // Initialize indexer with correct RPC URL
    const indRpc = "https://indexer-storage-testnet-standard.0g.ai";
    const evmRpc = "https://evmrpc-testnet.0g.ai";
    const indexer = new Indexer(indRpc);

    for (const hash of hashes) {
      try {
        // Download file to temp location
        const tempPath = path.join(tempDir, `${hash}.json`);
        const err = await indexer.download(hash, tempPath, false);

        if (err) {
          console.error(`Error downloading hash ${hash}:`, err);
          continue;
        }

        // Read and parse content
        const fileContent = readFileSync(tempPath, "utf-8");
        console.log("Retrieved content:", fileContent);
        const parsedContent = JSON.parse(fileContent);

        backups.push({
          hash,
          content: parsedContent,
        });

        // Delete temp file
        unlinkSync(tempPath);
      } catch (error) {
        console.error(`Error retrieving hash ${hash}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      backups: backups.filter((b) => b.content),
    });
  } catch (error: any) {
    console.error("Retrieve Error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve backups", details: error.message },
      { status: 500 }
    );
  }
}
