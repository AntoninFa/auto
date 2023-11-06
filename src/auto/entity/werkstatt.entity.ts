import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Auto } from './auto.entity.js';

@Entity()
export class Abbildung {
    @Column('int')
    // https://typeorm.io/entities#primary-columns
    // CAVEAT: zuerst @Column() und erst dann @PrimaryGeneratedColumn()
    @PrimaryGeneratedColumn()
    id: number | undefined;

    @Column('varchar', { unique: true, length: 32 })
    readonly nameUnternehmen!: string;

    @Column('varchar', { length: 16 })
    readonly reperatur: string | undefined;

    @ManyToOne(() => Auto, (auto : Auto) : Werkstatt[] | undefined => auto.werkstatt)
    @JoinColumn({ name: 'auto_id' })
    auto: Auto | undefined;

    public toString = (): string =>
        JSON.stringify({
            id: this.id,
            nameUnternehmen: this.nameUnternehmen,
            reperatur: this.reperatur,
        });
}
