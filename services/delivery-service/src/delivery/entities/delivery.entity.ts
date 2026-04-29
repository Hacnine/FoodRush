import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum DeliveryStatus {
  ASSIGNED = 'assigned',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  FAILED = 'failed',
}

@Entity('deliveries')
export class Delivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderId: string;

  @Column()
  userId: string;

  @Column({ nullable: true })
  driverId: string;

  @Column({ nullable: true })
  driverName: string;

  @Column({ nullable: true })
  driverPhone: string;

  @Column({ type: 'enum', enum: DeliveryStatus, default: DeliveryStatus.ASSIGNED })
  status: DeliveryStatus;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  currentLatitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  currentLongitude: number;

  @Column({ type: 'jsonb', nullable: true })
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    latitude?: number;
    longitude?: number;
  };

  @Column({ nullable: true })
  estimatedArrival: Date;

  @Column({ nullable: true })
  deliveredAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
