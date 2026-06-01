import mongoose from 'mongoose'

const modiWearDesignSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    kind: { type: String, enum: ['saved', 'sample'], required: true },
    name: { type: String, required: true },
    productType: { type: String, required: true },
    color: { type: String },
    text: { type: String },
    textColor: { type: String },
    textSize: { type: Number },
    textPosX: { type: Number },
    textPosY: { type: Number },
    textRotate: { type: Number },
    textBoxWidth: { type: Number },
    textBoxHeight: { type: Number },
    textFontFamily: { type: String },
    pngDesign: { type: mongoose.Schema.Types.Mixed },
    size: { type: String },
    publishedBy: { type: String }
  },
  { timestamps: true, collection: 'ModiWearDesign' }
)

const ModiWearDesign = mongoose.model('ModiWearDesign', modiWearDesignSchema)

export default ModiWearDesign