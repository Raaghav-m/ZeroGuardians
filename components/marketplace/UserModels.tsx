"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function UserModels() {
  return (
    <Card className="bg-white/10 backdrop-blur-xl border border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Your Models</CardTitle>
        <CardDescription className="text-gray-300">
          Models you own or created (coming soon)
        </CardDescription>
      </CardHeader>
      <CardContent className="text-gray-300">
        This section will show models owned by your connected wallet.
      </CardContent>
    </Card>
  );
}
