import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class TransferExtrinsicDto {
    @ApiProperty({ type: String, description: 'This is a required property' })
    wallet_address: string = '';

    @ApiProperty({ type: String, description: 'This is an optional property' })
    amount: string = '';

    @ApiProperty({ type: String, description: 'This is an optional property' })
    network: string = '';
}