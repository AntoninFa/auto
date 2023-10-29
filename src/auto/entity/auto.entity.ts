//TODO package doc

import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    VersionColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { dbType } from '../../config/dbtype.js';

/**
 * Alias-Typ, definiert gültige Arten von Getrieben.
 * Erlaubte Arten sind Schalt- oder Automatikgetriebe.
 */
export type GetriebeType = 'MANUELL' | 'AUTOMATIK';

/**
 *  Entity Klasse zu einer relationalen Tabelle.
 *  Modelliert ein Auto.
 */
@Entity()
export class Auto {

    @Column('int')
    @PrimaryGeneratedColumn()
    id: number | undefined;

    @VersionColumn()
    readonly version: number | undefined;

    @Column('varchar', { unique: true, length: 40 })
    @ApiProperty({ example: 'Volkswagen Golf' })
    readonly modellbezeichnung!: string;

    @Column('varchar', { unique: true, length: 40 })
    @ApiProperty({ example: '1HGCM82633A123456' })
    readonly fin: string | undefined;

    @Column('int')
    @ApiProperty({ example: 1000, type: Number })
    readonly kilometerstand: number | undefined;

    @Column('date')
    @ApiProperty({ example: '2001-01-01' })
    readonly auslieferungstag: Date | string | undefined;

    @Column('decimal', {
        precision: 8,
        scale: 2,
        transformer: new DecimalTransformer(),
    })
    @ApiProperty({ example: 1, type: Number })
    readonly grundpreis!: number;

    @Column('boolean')
    @ApiProperty({ example: true, type: Boolean })
    readonly istAktuellesModell: boolean | undefined;

    @Column('varchar', { length: 9 })
    @ApiProperty({ example: 'MANUELL', type: String })
    readonly getriebeArt: GetriebeType | undefined;

    @CreateDateColumn({
        type: dbType === 'sqlite' ? 'datetime' : 'timestamp',
    })
    readonly erzeugt: Date | undefined;

    @UpdateDateColumn({
        type: dbType === 'sqlite' ? 'datetime' : 'timestamp',
    })
    // SQLite:
    // @UpdateDateColumn({ type: 'datetime' })
    readonly aktualisiert: Date | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            version: this.version,
            modellbezeichnung: this.modellbezeichnung,
            fin: this.fin,
            kilometerstand: this.kilometerstand,
            auslieferungstag: this.auslieferungstag,
            grundpreis: this.grundpreis,
            istAktuellesModell: this.istAktuellesModell,
            getriebeArt: this.getriebeArt,
        });
}
