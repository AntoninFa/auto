/**
 * Das Modul besteht aus der Entity-Klasse Ausstattung
 * @packageDocumentation
 */

import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Auto } from './auto.entity.js';
import { DecimalTransformer } from './decimal-transformer.js';

@Entity()
export class Ausstattung {
    /**
     * Sequence of id-numbers.
     */
    @Column('int')
    @PrimaryGeneratedColumn()
    id: number | undefined;

    /**
     * Bezeichnung der Ausstattungsauswahl.
     */
    @Column('varchar', { unique: true, length: 32 })
    readonly bezeichnung!: string;

    /**
     * Preis des Ausstattungsstücks
     */
    @Column('decimal', {
        precision: 8,
        scale: 2,
        transformer: new DecimalTransformer(),
    })
    @ApiProperty({ example: 1, type: Number })
    readonly preis!: number;

    /**
     * Boolean Abfrage, ob ein Ausstattungsstück verfuegbar ist.
     */
    @Column('boolean')
    @ApiProperty({ example: true, type: Boolean })
    readonly verfuegbar: boolean | undefined;

    /**
     * 1:n Beziehung zu Ausstattung
     */
    @ManyToOne(() => Auto, (auto) => auto.ausstattungen)
    @JoinColumn({ name: 'auto_id' })
    auto: Auto | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            bezeichnung: this.bezeichnung,
            preis: this.preis,
            verfuegbar: this.verfuegbar,
        });
}
