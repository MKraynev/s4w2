import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { CreateDeviceDto } from "../Dtos/devices.dto.create";

export type DeviceDocument = HydratedDocument<DeviceDto>

@Schema({
    timestamps: true,
    toObject: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
})
export class DeviceDto extends CreateDeviceDto{
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    ip: string;

    createdAt: Date;

    updatedAt: Date;

    constructor(deviceInfo: CreateDeviceDto) {
        super(deviceInfo.name, deviceInfo.ip)
    }
}

export const DeviceSchema = SchemaFactory.createForClass(DeviceDto);