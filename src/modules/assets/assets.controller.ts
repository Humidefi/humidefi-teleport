import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiCreatedResponse, ApiResponse } from '@nestjs/swagger';
import { AssetsService } from './assets.service';
import { AssetEntity } from './entities/asset.entity';
import { TransferExtrinsicDto } from './dto/transfer-extrinsic.dto';
import { ExecuteExtrinsicsDto } from './dto/execute-extrinsics.dto';
import { ExecuteExtrinsicsStatusEntity } from './entities/execute-extrinsincs-status.entity';

@Controller('api/assets')
@ApiTags('assets')
export class AssetsController {
  constructor(
    private readonly assetsService: AssetsService
  ) { }

  @Post('/extrinsic/transfer/assethub-relay')
  @ApiResponse({ status: 200, description: 'The assets "transfer" extrinsic has been successfully generated.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async assetHubToRelay(@Body() data: TransferExtrinsicDto): Promise<any> {
    try {
      return await this.assetsService.assetHubToRelay(data);
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.toString() || 'Internal server error',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('/extrinsic/transfer/relay-assethub')
  @ApiResponse({ status: 200, description: 'The assets "transfer" extrinsic has been successfully generated.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async relayToAssetHub(@Body() data: TransferExtrinsicDto): Promise<any> {
    try {
      return await this.assetsService.relayToAssetHub(data);
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.toString() || 'Internal server error',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('/extrinsic/transfer/assethub-para')
  @ApiResponse({ status: 200, description: 'The assets "transfer" extrinsic has been successfully generated.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async assethubToPara(@Body() data: TransferExtrinsicDto): Promise<any> {
    try {
      return await this.assetsService.assethubToPara(data);
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.toString() || 'Internal server error',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('/extrinsic/transfer/para-assethub')
  @ApiResponse({ status: 200, description: 'The assets "transfer" extrinsic has been successfully generated.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async paraToAssetHub(@Body() data: TransferExtrinsicDto): Promise<any> {
    try {
      return await this.assetsService.paraToAssetHub(data);
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.toString() || 'Internal server error',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('/extrinsics/execute')
  @ApiResponse({ status: 200, description: 'The assets extrinsic has been successfully executed.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async FexecuteExtrinsics(@Body() data: ExecuteExtrinsicsDto): Promise<ExecuteExtrinsicsStatusEntity> {
    try {
      return await this.assetsService.executeExtrinsics(data);
    } catch (error) {
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.toString() || 'Internal server error',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
