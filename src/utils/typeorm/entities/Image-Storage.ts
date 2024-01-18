import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('image-storages')
export class ImageStorage {
  @PrimaryGeneratedColumn()
  id: number;
}
