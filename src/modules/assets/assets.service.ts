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

  public async relayToPara(data: TransferExtrinsicDto): Promise<any> {
    const { api, specName, safeXcmVersion } = await constructApiPromise(data.network);
    const assetApi = new AssetTransferApi(api, specName, safeXcmVersion);
    let callInfo: TxResult<'submittable'>;
    try {
      callInfo = await assetApi.createTransferTransaction(
        '1000',
        data.wallet_address,
        ['XON'],
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
