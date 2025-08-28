declare module "@0glabs/0g-serving-broker" {
  export type { ZGComputeNetworkBroker };
  export function createZGComputeNetworkBroker(
    signer: JsonRpcSigner
  ): Promise<ZGComputeNetworkBroker>;
}
