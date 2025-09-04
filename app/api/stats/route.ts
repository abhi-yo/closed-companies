import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Startup from '@/lib/models/Startup'

export async function GET() {
  try {
    await connectDB()
    
    const startups = await Startup.find({}).lean()
    
    // Calculate total funding (same logic as frontend)
    const totalFunding = startups.reduce((acc: number, s: any) => {
      if (s.funding === "Undisclosed" || s.funding === "Internal" || s.funding === "Seed") return acc
      
      const match = s.funding.match(/\$?([0-9.]+)([BMK]?)/)
      if (!match) return acc
      
      const amount = parseFloat(match[1])
      const multiplier = match[2] === 'B' ? 1e9 : match[2] === 'M' ? 1e6 : match[2] === 'K' ? 1e3 : 1
      return acc + (amount * multiplier)
    }, 0)

    // Calculate average years (same logic as frontend)
    const avgYears = startups.length > 0 
      ? startups.reduce((acc: number, s: any) => {
          const years = s.shutDown - s.founded
          return acc + years
        }, 0) / startups.length 
      : 0

    // Also get individual years for debugging
    const allYears = startups.map((s: any) => ({
      name: s.name,
      founded: s.founded,
      shutDown: s.shutDown,
      years: s.shutDown - s.founded
    }))

    return NextResponse.json({
      count: startups.length,
      totalFunding,
      totalFundingFormatted: totalFunding >= 1e9 ? `$${(totalFunding / 1e9).toFixed(1)}B` : `$${(totalFunding / 1e6).toFixed(1)}M`,
      avgYears,
      avgYearsRounded: Math.round(avgYears),
      sampleYears: allYears.slice(0, 10), // First 10 for debugging
      yearsSummary: {
        min: Math.min(...allYears.map(s => s.years)),
        max: Math.max(...allYears.map(s => s.years)),
        median: allYears.sort((a, b) => a.years - b.years)[Math.floor(allYears.length / 2)]?.years
      }
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to calculate stats' }, { status: 500 })
  }
}
