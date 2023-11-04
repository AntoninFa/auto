/**
 * Dieses Modul enthält die DTO Entity-Klasse Eigentuemer ohne TypeORM.
 * @packageDocumentation
 */

import { IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
/**
 * Entity-Klasse für einen Eigentuemer ohne TypeORM.
 */
export class EigentuemerDTO {
    @MaxLength(40)
    @ApiProperty({ example: 'Edsger Dijkstra', type: String })
    readonly name!: string;

    @IsOptional()
    @ApiProperty({ example: '2001-01-01' })
    readonly geburtsdatum: Date | string | undefined;

    @IsOptional()
    @MaxLength(20)
    @ApiProperty({ example: '1234567890' })
    readonly fuehrerscheinnummer: string | undefined;
}