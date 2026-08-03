import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName!: string;

  @Column({ name: 'hashed_password', type: 'varchar', length: 255 })
  hashedPassword!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;
  @Column({ name: 'is_email_verified', type: 'boolean', default: false })
  isEmailVerified!: boolean;
  @Column({ type: 'varchar', length: 10, default: 'es' })
  locale!: string
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;
 @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;
}