import {
    Column,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Auto } from './auto.entity.js';

@Entity()
export class Eigentuemer {
    @Column('int')
    @PrimaryGeneratedColumn()
    id: number | undefined;

    @Column('varchar', { unique: true, length: 50 })
    readonly eigentuemer!: string;

    @Column('date')
    readonly geburtsdatum: Date | string | undefined;

    @Column('varchar', { length: 20 })
    readonly fuehrerscheinnummer: string | undefined;

    @OneToOne(() => Auto, (auto) => auto.eigentuemer)
    @JoinColumn({ name: 'auto_id' })
    auto: Auto | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            eigentuemer: this.eigentuemer,
            geburtsdatum: this.geburtsdatum,
            fuehrerscheinnummer: this.fuehrerscheinnummer,
        });
}