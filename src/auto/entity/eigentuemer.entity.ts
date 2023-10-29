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
    readonly name!: string;

    @Column('date')
    readonly geburtsdatum: Date | string | undefined;

    @Column('varchar', { length: 20 })
    readonly führerscheinnummer: string | undefined;

    @OneToOne(() => Auto, (auto) => auto.eigentuemer)
    @JoinColumn({ name: 'auto_id' })
    auto: Auto | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            name: this.name,
            geburtsdatum: this.geburtsdatum,
            führerscheinnummer: this.führerscheinnummer,
        });
}