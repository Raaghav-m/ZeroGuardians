"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export interface MarketplaceModel {
  provider: string;
  name: string;
  serviceType: string;
  url: string;
  inputPrice: bigint;
  outputPrice: bigint;
  updatedAt: bigint;
  model: string;
}

export function ModelCard({ model }: { model: MarketplaceModel }) {
  const updatedDate = new Date(Number(model.updatedAt) * 1000);
  return (
    <Card className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/15 transition-colors">
      <CardHeader>
        <CardTitle className="text-white text-base">{model.name}</CardTitle>
        <CardDescription className="text-gray-300">
          {model.serviceType} • {model.provider}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-gray-300">
        <div className="grid grid-cols-2 gap-y-1">
          <span className="text-gray-400">Model</span>
          <span className="text-white/90 truncate" title={model.model}>
            {model.model}
          </span>
          <span className="text-gray-400">Input Price</span>
          <span className="text-white/90">{model.inputPrice.toString()}</span>
          <span className="text-gray-400">Output Price</span>
          <span className="text-white/90">{model.outputPrice.toString()}</span>
          <span className="text-gray-400">Updated</span>
          <span className="text-white/90">{updatedDate.toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
