import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Startup from '@/lib/models/Startup'

export async function GET(request: Request) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '1000')
    const page = parseInt(searchParams.get('page') || '1')
    
    // Build query object
    let query: any = {}
    
    // Filter by year if provided
    if (year && year !== 'all') {
      query.shutDown = parseInt(year)
    }
    
    // Add text search if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } }
      ]
    }
    
    // Execute query with pagination and sorting
    const startups = await Startup.find(query)
      .sort({ shutDown: -1, name: 1 }) // Most recent year first, then alphabetical
      .limit(limit)
      .skip((page - 1) * limit)
      .lean() // Returns plain objects instead of Mongoose documents
    
    // Get total count for pagination
    const total = await Startup.countDocuments(query)
    
    return NextResponse.json({
      startups,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('MongoDB connection failed:', error)
    return NextResponse.json(
      { 
        error: 'Database connection failed. Please check MongoDB connection.',
        startups: [],
        pagination: { total: 0, page: 1, limit: 0, pages: 0 }
      },
      { status: 500 }
    )
  }
}
