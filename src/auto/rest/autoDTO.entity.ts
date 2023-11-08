/**
 * Das Modul besteht aus der Entity-Klasse.
 * @packageDocumentation
 */

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
    Min,
    ValidateNested,
} from 'class-validator';
import { AusstattungDTO } from './ausstattungDTO.entity.js';
import { ApiProperty } from '@nestjs/swagger';
import { 
    type GetriebeType, 
    type HerstellerType, 
} from '../entity/auto.entity.js';
import { EigentuemerDTO } from './eigentuemerDTO.entity.js';
import { Type } from 'class-transformer';

/**
 * Entity-Klasse für Autos ohne TypeORM und ohne Referenzen.
 */
export class AutoDtoOhneRef {
    @IsString()
    @Length(40)
    @ApiProperty({ example: 'Mustang' })
    readonly modellbezeichnung!: string;

    @Matches(/^VOLKSWAGEN$|^AUDI$|^DAIMLER$|^RENAULT$/u)
    @IsOptional()
    @ApiProperty({ example: 'AUDI', type: String})
    readonly hersteller: HerstellerType | undefined;

    @IsString()
    @IsAlphanumeric()
    @Length(17, 17)
    @ApiProperty({ example: '1HGCM82633A400195' })
    readonly fin!: string;

    @IsNumber()
    @Min(0)
    @ApiProperty({ example: 50000,  type: Number })
    readonly kilometerstand: number | undefined;

    @IsISO8601({ strict: true })
    @IsOptional()
    @ApiProperty({ example: '2023-12-15' })
    readonly auslieferungstag: Date | string | undefined;

    @IsPositive()
    @ApiProperty({ example: 50000.50, type: Number })
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
    readonly eigentuemer!: EigentuemerDTO; //NOSONAR

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AusstattungDTO)
    @ApiProperty({ type: [AusstattungDTO] })
    readonly ausstattung: AusstattungDTO[] | undefined;
}