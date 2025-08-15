import connectDB from '../lib/mongodb'
import Startup from '../lib/models/Startup'
import * as fs from 'fs'
import * as path from 'path'

async function uploadStartupData() {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await connectDB()
    console.log('✅ Connected to MongoDB')

    // Read the JSON file
    const jsonPath = path.join(process.cwd(), 'public', 'startup-graveyard.startups.json')
    const jsonData = fs.readFileSync(jsonPath, 'utf8')
    const startups = JSON.parse(jsonData)

    console.log(`📊 Found ${startups.length} startups in JSON file`)

    // Clear existing data (optional - remove this if you want to keep existing data)
    console.log('🗑️ Clearing existing startup data...')
    await Startup.deleteMany({})
    console.log('✅ Existing data cleared')

    // Process and insert startups
    const processedStartups = startups.map((startup: any) => ({
      id: startup.id || startup._id,
      name: startup.name,
      description: startup.description,
      founded: startup.founded,
      shutDown: startup.shutDown,
      country: startup.country,
      industry: startup.industry,
      funding: startup.funding,
      causeOfShutdown: startup.causeOfShutdown,
      articleUrl: startup.articleUrl || undefined
    }))

    console.log('📤 Uploading startups to MongoDB...')
    const result = await Startup.insertMany(processedStartups, { ordered: false })
    console.log(`✅ Successfully uploaded ${result.length} startups to MongoDB`)

    // Show some stats
    const totalCount = await Startup.countDocuments()
    const latestShutdowns = await Startup.find().sort({ shutDown: -1 }).limit(5)
    const topFunded = await Startup.find({ funding: { $regex: /\$\d+/ } }).sort({ shutDown: -1 }).limit(5)

    console.log('\n📈 Database Stats:')
    console.log(`Total startups: ${totalCount}`)
    console.log('\n🕐 Latest shutdowns:')
    latestShutdowns.forEach(startup => {
      console.log(`  ${startup.name} (${startup.shutDown}) - ${startup.funding}`)
    })

    console.log('\n💰 Recently funded failures:')
    topFunded.forEach(startup => {
      console.log(`  ${startup.name} (${startup.shutDown}) - ${startup.funding}`)
    })

    process.exit(0)

  } catch (error) {
    console.error('❌ Error uploading startup data:', error)
    process.exit(1)
  }
}

// Run the upload if this script is executed directly
if (require.main === module) {
  uploadStartupData()
}

export default uploadStartupData