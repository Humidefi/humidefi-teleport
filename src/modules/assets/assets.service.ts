import { Injectable, Logger } from '@nestjs/common';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { stringToHex, stringToU8a, u8aToHex, u8aToString, hexToString, hexToBigInt } from '@polkadot/util';
import { AssetEntity } from './entities/asset.entity';
import { AssetMetadataEntity } from './entities/asset-metadata.entity';
import { TransferExtrinsicDto } from './dto/transfer-extrinsic.dto';
import { ExecuteExtrinsicsDto } from './dto/execute-extrinsics.dto';
import { ExecuteExtrinsicsStatusEntity } from './entities/execute-extrinsincs-status.entity';
import { AssetTransferApi, constructApiPromise, TxResult } from '@substrate/asset-transfer-api'
import { cryptoWaitReady } from '@polkadot/util-crypto';

@Injectable()
export class AssetsService {
  public async assetHubToRelay(data: TransferExtrinsicDto): Promise<any> {
    const { api, safeXcmVersion } = await constructApiPromise(data.network);
    const assetApi = new AssetTransferApi(api, 'asset-hub-rococo', safeXcmVersion);
    let callInfo: TxResult<'submittable'>;
    try {
      callInfo = await assetApi.createTransferTransaction(
        '0',
        data.wallet_address,
        ['ROC'],
        [data.amount],
        {
          format: 'submittable',
          xcmVersion: 2,
        },
      );
      console.log(JSON.stringify(callInfo, null, 4));
      return callInfo.tx;
    } catch (error) {
      throw error;
    }
  }

  public async relayToAssetHub(data: TransferExtrinsicDto): Promise<any> {
    const { api, specName, safeXcmVersion } = await constructApiPromise(data.network);
    const assetApi = new AssetTransferApi(api, specName, safeXcmVersion);
    let callInfo: TxResult<'submittable'>;
    try {
      callInfo = await assetApi.createTransferTransaction(
        '1000',
        data.wallet_address,
        ['ROC'],
        [data.amount],
        {
          format: 'submittable',
          xcmVersion: 2,
        },
      );
      console.log(JSON.stringify(callInfo, null, 4));
      return callInfo.tx;
    } catch (error) {
      throw error;
    }
  }

  // Asset Hub to XODE testnet transfer API
  // https://substrate.stackexchange.com/questions/3104/sending-assets-from-parachain-to-relaychain-resulting-in-asset-not-found
  public async assethubToPara(data: TransferExtrinsicDto): Promise<any> {
    const { api, specName, safeXcmVersion } = await constructApiPromise('wss://rococo-asset-hub-rpc.polkadot.io');
    const assetApi = new AssetTransferApi(api, 'asset-hub-rococo', safeXcmVersion);
    let callInfo: TxResult<'call'>;
    try {
      callInfo = await assetApi.createTransferTransaction(
        '4389', // Parachain ID of XODE testnet
        data.wallet_address,
        ['ROC'], // Native token of origin
        [data.amount],
        {
          format: 'call',
          xcmVersion: 2,
        },
      );
      console.log(JSON.stringify(callInfo, null, 4));
      return callInfo.tx;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  // XODE testnet to Asset Hub transfer API
  public async paraToAssetHub(data: TransferExtrinsicDto): Promise<any> {
    const { api, specName, safeXcmVersion } = await constructApiPromise(data.network);
    const assetApi = new AssetTransferApi(api, specName, safeXcmVersion);
    let callInfo: TxResult<'submittable'>;
    try {
      callInfo = await assetApi.createTransferTransaction(
        '1000', // Relay's Asset Hub parachain ID by default is 1000
        data.wallet_address,
        ['XON'], // Use the native token from the origin of asset to be transferred
        [data.amount],
        {
          format: 'submittable',
          xcmVersion: 2,
        },
      );
      console.log(JSON.stringify(callInfo, null, 4));
      return callInfo.tx;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async executeExtrinsics(extrinsics: ExecuteExtrinsicsDto): Promise<ExecuteExtrinsicsStatusEntity> {
    try {
      await cryptoWaitReady();
      const { api } = await constructApiPromise(extrinsics.network);
      const executeExtrinsic = api.tx(extrinsics.signedExtrincs);

      const sendTransaction = await new Promise<ExecuteExtrinsicsStatusEntity>((resolve, reject) => {
        executeExtrinsic.send(async result => {
          let message: ExecuteExtrinsicsStatusEntity = {
            message: "",
            isError: true
          };

          if (result.isError) {
            message = {
              message: "Something went wrong!",
              isError: true
            };
            resolve(message);
          }

          if (result.dispatchError) {
            if (result.dispatchError.isModule) {
              const decoded = api.registry.findMetaError(result.dispatchError.asModule);
              const { docs, name, section } = decoded;

              message = {
                message: "Dispatch Error: " + name,
                isError: true
              };
              reject(message);
            }
          }

          if (result.status.isInBlock) { }

          if (result.status.isFinalized) {
            message = {
              message: "Execution Complete",
              isError: false
            };
            resolve(message);
          }
        }).catch(error => {
          reject(error);
        });
      });

      return sendTransaction;
    } catch (error) {
      throw error;
    }
  }
}
