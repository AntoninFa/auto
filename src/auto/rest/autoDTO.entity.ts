/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

// eslint-disable-next-line max-classes-per-file
import {
    type GetriebeType,
    type HerstellerType,
} from '../entity/auto.entity.js';
import {
    IsAlphanumeric,
    IsArray,
    IsBoolean,
    IsISO8601,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    Length,
    Matches,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { AusstattungDTO } from './ausstattungDTO.entity.js';
import { EigentuemerDTO } from './eigentuemerDTO.entity.js';
import { Type } from 'class-transformer';

/**
 * Entity-Klasse für Autos ohne TypeORM und ohne Referenzen.
 */
export class AutoDtoOhneRef {
    @IsString()
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    @MaxLength(40)
    @ApiProperty({ example: 'Mustang' })
    readonly modellbezeichnung!: string;

    @Matches(/^VOLKSWAGEN$|^AUDI$|^DAIMLER$|^RENAULT$/u)
    @IsOptional()
    @ApiProperty({ example: 'AUDI', type: String })
    readonly hersteller: HerstellerType | undefined;

    @IsString()
    @IsAlphanumeric()
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    @Length(17)
    @ApiProperty({ example: '1HGCM82633A400195' })
    readonly fin!: string;

    @IsNumber()
    @Min(0)
    @ApiProperty({ example: 50_000, type: Number })
    readonly kilometerstand: number | undefined;

    @IsISO8601({ strict: true })
    @IsOptional()
    @ApiProperty({ example: '2023-12-15' })
    readonly auslieferungstag: Date | string | undefined;

    @IsPositive()
    @ApiProperty({ example: 50_000.5, type: Number })
    readonly grundpreis!: number;

    @IsBoolean()
    @ApiProperty({ example: true, type: Boolean })
    readonly istAktuellesModell: boolean | undefined;

    @Matches(/^MANUELL$|^AUTOMATIK$/u)
    @IsOptional()
    @ApiProperty({ example: 'MANUELL', type: String })
    readonly getriebeArt: GetriebeType | undefined;
}

/**
 * Entity-Klasse für Autos ohne TypeORM.
 */
export class AutoDTO extends AutoDtoOhneRef {
    @ValidateNested()
    @Type(() => EigentuemerDTO)
    @ApiProperty({ type: EigentuemerDTO })
    readonly eigentuemer!: EigentuemerDTO; // NOSONAR

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AusstattungDTO)
    @ApiProperty({ type: [AusstattungDTO] })
    readonly ausstattungen: AusstattungDTO[] | undefined;
}
