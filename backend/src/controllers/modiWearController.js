import ModiWearDesign from '../models/ModiWearDesign.js'

const toDesignResponse = (design) => ({
  id: design._id.toString(),
  _id: design._id,
  owner: design.owner,
  kind: design.kind,
  name: design.name,
  productType: design.productType,
  color: design.color,
  text: design.text,
  textColor: design.textColor,
  textSize: design.textSize,
  textPosX: design.textPosX,
  textPosY: design.textPosY,
  textRotate: design.textRotate,
  textBoxWidth: design.textBoxWidth,
  textBoxHeight: design.textBoxHeight,
  textFontFamily: design.textFontFamily,
  pngDesign: design.pngDesign || null,
  size: design.size,
  publishedBy: design.publishedBy || '',
  createdAt: design.createdAt,
  updatedAt: design.updatedAt
})

const buildDesignPayload = (body, kind, ownerId, publishedBy = '') => ({
  owner: ownerId,
  kind,
  name: body.name,
  productType: body.productType,
  color: body.color,
  text: body.text,
  textColor: body.textColor,
  textSize: body.textSize,
  textPosX: body.textPosX,
  textPosY: body.textPosY,
  textRotate: body.textRotate,
  textBoxWidth: body.textBoxWidth,
  textBoxHeight: body.textBoxHeight,
  textFontFamily: body.textFontFamily,
  pngDesign: body.pngDesign || null,
  size: body.size,
  publishedBy
})

export const getDesignCollections = async (req, res) => {
  try {
    const [savedDesigns, sampleDesigns] = await Promise.all([
      ModiWearDesign.find({ kind: 'saved', owner: req.user._id }).sort({ createdAt: -1 }),
      ModiWearDesign.find({ kind: 'sample' }).sort({ createdAt: -1 })
    ])

    res.json({
      savedDesigns: savedDesigns.map(toDesignResponse),
      sampleDesigns: sampleDesigns.map(toDesignResponse)
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const saveDesign = async (req, res) => {
  try {
    const { name, productType } = req.body
    if (!name || !productType) {
      return res.status(400).json({ message: 'Design name and product type are required' })
    }

    const design = await ModiWearDesign.create(
      buildDesignPayload(req.body, 'saved', req.user._id, req.user.email)
    )

    res.status(201).json(toDesignResponse(design))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const publishSampleDesign = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access only' })
    }

    const { name, productType } = req.body
    if (!name || !productType) {
      return res.status(400).json({ message: 'Design name and product type are required' })
    }

    const design = await ModiWearDesign.create(
      buildDesignPayload(req.body, 'sample', req.user._id, req.user.email)
    )

    res.status(201).json(toDesignResponse(design))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const deleteDesign = async (req, res) => {
  try {
    const design = await ModiWearDesign.findById(req.params.id)
    if (!design) {
      return res.status(404).json({ message: 'Design not found' })
    }

    const ownsDesign = design.owner.toString() === req.user._id.toString()
    const canDelete = req.user.role === 'admin' || ownsDesign
    if (!canDelete) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    await design.deleteOne()
    res.json({ message: 'Design deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}