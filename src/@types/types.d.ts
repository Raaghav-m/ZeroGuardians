declare module "@0glabs/0g-serving-broker" {
  export type { ZgServingUserBrokerConfig };
  export function createZGServingNetworkBroker(
    signer: JsonRpcSigner
  ): Promise<ZgServingUserBrokerConfig>;
}
