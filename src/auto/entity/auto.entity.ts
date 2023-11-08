/**
 * Dieses Modul enthält die Entity-Klasse Auto.
 * @packageDocumentation
 */

import {
    Column,
    PrimaryGeneratedColumn,
    Entity,
    OneToOne,
    OneToMany,
    VersionColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Ausstattung } from './ausstattung.entity.js';
import { DecimalTransformer } from './decimal-transformer.js';
import { Eigentuemer } from './eigentuemer.entity.js';

/**
 * Alias-Typ, definiert gültige Arten von Getrieben.
 * Erlaubte Arten sind Schalt- oder Automatikgetriebe.
 */
export type GetriebeType = 'MANUELL' | 'AUTOMATIK';

/**
 * Alias-Typ, definiert Arten von Autoherstellern.
 */
export type HerstellerType = 'VOLKSWAGEN' | 'AUDI' | 'DAIMLER' | 'RENAULT';

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
    @ApiProperty({ example: 'Golf' })
    readonly modellbezeichnung!: string;

    @Column('varchar', {length: 10})
    @ApiProperty({ example: 'Audi'})
    readonly hersteller! : HerstellerType | undefined; 

    @Column('varchar', { unique: true, length: 17 })
    @ApiProperty({ example: '1HGCM82633A123456' })
    readonly fin!: string;

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
        type: 'timestamp',
    })
    readonly erzeugt: Date | undefined;

    @UpdateDateColumn({
        type: 'timestamp',
    })
    readonly aktualisiert: Date | undefined;

    @OneToOne(() => Eigentuemer, (eigentuemer) => eigentuemer.auto, {
        cascade: ['insert', 'remove'],
    })
    readonly eigentuemer: Eigentuemer | undefined;

    @OneToMany(() => Ausstattung, (ausstattung) => ausstattung.auto, {
        cascade: ['insert', 'remove'],
    })
    readonly ausstattungen: Ausstattung[] | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            version: this.version,
            modellbezeichnung: this.modellbezeichnung,
            hersteller: this.hersteller,
            fin: this.fin,
            kilometerstand: this.kilometerstand,
            auslieferungstag: this.auslieferungstag,
            grundpreis: this.grundpreis,
            istAktuellesModell: this.istAktuellesModell,
            getriebeArt: this.getriebeArt,
        });
}
