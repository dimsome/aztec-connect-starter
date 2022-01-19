import { ethers, network } from "hardhat";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { DefiBridgeProxy, AztecAssetType } from "./defi_bridge_proxy";

import abi from "../artifacts/contracts/mStableBridge.sol/mStableBridge.json";

import {
  IMasset,
  IMasset__factory,
  InitializableERC20Detailed,
  InitializableERC20Detailed__factory,
} from "@mstable/protocol/dist/types/generated";

const mUsdContractAddress = "0xe2f2a5c287993345a840db3b0845fbc70f5935a5";

describe("DeFi bridge for mStable", async () => {
  let bridgeProxy: DefiBridgeProxy;
  let signer: Signer;
  let signerAddress: string;
  let mStableBridgeAddress: string;

  let mUsdContract: IMasset;
  let mUsdToken: InitializableERC20Detailed;

  const setup = async (blockNumber: number) => {
    await network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            jsonRpcUrl: process.env.NODE_URL,
            blockNumber,
          },
        },
      ],
    });
  };

  before(async () => {
    await setup(14029493);

    [signer] = await ethers.getSigners();
    signerAddress = await signer.getAddress();

    bridgeProxy = await DefiBridgeProxy.deploy(signer);
    // TODO: See if we need args
    mStableBridgeAddress = await bridgeProxy.deployBridge(signer, abi, []);

    // Bridge proxy can be thought of as the rollup contract. Fund it.
    await signer.sendTransaction({
      to: bridgeProxy.address,
      value: 10000n,
    });

    mUsdContract = IMasset__factory.connect(mUsdContractAddress, signer);
    mUsdToken = InitializableERC20Detailed__factory.connect(
      mUsdContractAddress,
      signer
    );
  });

  it("should deploy successfully", async () => {
    expect(bridgeProxy.address).to.be.properAddress;
    expect(mStableBridgeAddress).to.be.properAddress;
    expect(await mUsdContract.getBassets()).to.not.eq(null);
    expect(await mUsdToken.symbol()).to.eq("mUSD");
  });

  it("should deposit mUSD into Save", async () => {
    // Call convert to swap ETH to ERC20 tokens and return them to caller.
    // const { isAsync, outputValueA, outputValueB } = await bridgeProxy.convert(
    //   signer,
    //   mStableBridgeAddress,
    //   {
    //     assetType: AztecAssetType.ERC20,
    //     id: 0,
    //   },
    //   {},
    //   {
    //     assetType: AztecAssetType.ERC20,
    //     id: 1,
    //     erc20Address: erc20.address,
    //   },
    //   {},
    //   1000n,
    //   1n,
    //   0n,
    // );
    // const proxyBalance = BigInt((await erc20.balanceOf(bridgeProxy.address)).toString());
    // expect(proxyBalance).toBe(outputValueA);
    // expect(outputValueB).toBe(0n);
    // expect(isAsync).toBe(false);
  });
});
