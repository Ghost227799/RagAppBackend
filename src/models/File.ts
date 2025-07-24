import mongoose, { Document, Schema } from "mongoose";

export interface File extends Document {
  fileName: string;
  userId: string;
}

const UserSchema = new Schema<File>({
  fileName: { type: String, required: true },
  userId: { type: String, required: true, unique: true },
});

export default mongoose.model<File>("User", UserSchema);
