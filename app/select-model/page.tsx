import { ModelSelectionForm } from "@/components/ModelSelectionForm";

export default function SelectModel() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Select an AI Model</h1>
      <ModelSelectionForm />
    </div>
  );
}
