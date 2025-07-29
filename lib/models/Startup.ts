import mongoose from 'mongoose'

export interface IStartup {
  id: number
  name: string
  description: string
  founded: number
  shutDown: number
  country: string
  industry: string
  funding: string
  causeOfShutdown: string
  articleUrl?: string
}

const StartupSchema = new mongoose.Schema<IStartup>({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  founded: {
    type: Number,
    required: true
  },
  shutDown: {
    type: Number,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  funding: {
    type: String,
    required: true
  },
  causeOfShutdown: {
    type: String,
    required: true
  },
  articleUrl: {
    type: String,
    required: false
  }
}, {
  timestamps: true
})

// Create indexes for better query performance
StartupSchema.index({ name: 'text', industry: 'text', country: 'text' })
StartupSchema.index({ shutDown: -1 })
StartupSchema.index({ industry: 1 })
StartupSchema.index({ country: 1 })

export default mongoose.models.Startup || mongoose.model<IStartup>('Startup', StartupSchema)
