// brokerStore.ts
import { ZgServingUserBrokerConfig } from "@0glabs/0g-serving-broker";

// Add flag to check if we're on client side
const isClient = typeof window !== "undefined";

let globalBroker: ZgServingUserBrokerConfig | null = null;

export function setGlobalBroker(broker: ZgServingUserBrokerConfig) {
  globalBroker = broker;
  // Store broker in localStorage for persistence
  if (isClient) {
    // Store necessary broker data
    const brokerData = {
      address: broker.address,
      // Add other necessary broker data
    };
    localStorage.setItem("broker", JSON.stringify(brokerData));
  }
}

export function getBroker() {
  if (globalBroker) return globalBroker;

  // Try to get from localStorage if on client
  if (isClient) {
    const storedBroker = localStorage.getItem("broker");
    if (storedBroker) {
      return JSON.parse(storedBroker);
    }
  }
  return null;
}
