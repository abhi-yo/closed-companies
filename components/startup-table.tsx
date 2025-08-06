"use client"

import { useState, useEffect, useMemo } from "react"
import { type Startup } from "@/lib/data"
import { ExternalLink, Search } from "lucide-react"
import { StartupDetailDialog } from "./startup-detail-dialog"

export function StartupTable() {
  const [startups, setStartups] = useState<Startup[]>([])
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStartups() {
      try {
        setLoading(true)
        const res = await fetch("/api/startups")
        const data = await res.json()
        // Handle API response format
        if (data.startups) {
          setStartups(data.startups)
        } else {
          setStartups([])
        }
      } catch (error) {
        console.error('Failed to fetch startups:', error)
        setStartups([])
      } finally {
        setLoading(false)
      }
    }
    fetchStartups()
  }, [])

  // Get unique years from data
  const availableYears = useMemo(() => {
    const years = [...new Set(startups.map(s => s.shutDown))].sort((a, b) => b - a)
    return years
  }, [startups])

  // Filter startups based on year and search
  const filteredStartups = useMemo(() => {
    let filtered = startups

    // Filter by year
    if (selectedYear !== "all") {
      filtered = filtered.filter(s => s.shutDown === parseInt(selectedYear))
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.country.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Sort by shutdown year (most recent first), then by name
    filtered = filtered.sort((a, b) => {
      if (a.shutDown !== b.shutDown) {
        return b.shutDown - a.shutDown // Most recent year first
      }
      return a.name.localeCompare(b.name) // Then alphabetically by name
    })

    return filtered
  }, [startups, selectedYear, searchQuery])

  // Calculate stats for filtered data
  const stats = useMemo(() => {
    const totalFunding = filteredStartups.reduce((acc: number, s: Startup) => {
      if (s.funding === "Undisclosed" || s.funding === "Internal" || s.funding === "Seed") return acc
      
      const match = s.funding.match(/\$?([0-9.]+)([BMK]?)/)
      if (!match) return acc
      
      const amount = parseFloat(match[1])
      const multiplier = match[2] === 'B' ? 1e9 : match[2] === 'M' ? 1e6 : match[2] === 'K' ? 1e3 : 1
      return acc + (amount * multiplier)
    }, 0)

    const avgYears = filteredStartups.length > 0 
      ? filteredStartups.reduce((acc: number, s: Startup) => acc + (s.shutDown - s.founded), 0) / filteredStartups.length 
      : 0

    return {
      count: filteredStartups.length,
      totalFunding,
      avgYears
    }
  }, [filteredStartups])

  const handleStartupClick = (startup: Startup) => {
    setSelectedStartup(startup)
    setDialogOpen(true)
  }

  const formatFunding = (amount: number) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(1)}K`
    return `$${amount.toFixed(0)}`
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
        <div className="neumorphic-card p-4 md:p-6 text-center">
          <div className="text-2xl md:text-3xl font-doto font-bold text-white mb-2">{stats.count}</div>
          <div className="text-white/70 font-dm-sans text-sm md:text-base">Failed Startups</div>
        </div>
        <div className="neumorphic-card p-4 md:p-6 text-center">
          <div className="text-2xl md:text-3xl font-doto font-bold text-white mb-2">{formatFunding(stats.totalFunding)}</div>
          <div className="text-white/70 font-dm-sans text-sm md:text-base">Total Funding Lost</div>
        </div>
        <div className="neumorphic-card p-4 md:p-6 text-center">
          <div className="text-2xl md:text-3xl font-doto font-bold text-white mb-2">{stats.avgYears.toFixed(0)}</div>
          <div className="text-white/70 font-dm-sans text-sm md:text-base">Avg Years Active</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Year Filter */}
        <div className="flex-1">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full bg-[#181818] border border-white/20 rounded-lg px-3 py-2 text-white font-dm-sans text-sm focus:outline-none focus:border-white/40 transition-colors"
          >
            <option value="all">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year.toString()}>{year}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
          <input
            type="text"
            placeholder="Search startups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#181818] border border-white/20 rounded-lg pl-10 pr-3 py-2 text-white font-dm-sans text-sm placeholder:text-white/40 focus:outline-none focus:border-white/40 transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="neumorphic-card p-4 md:p-6 space-y-4 animate-pulse">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="grid grid-cols-7 gap-4">
              <div className="h-4 bg-gray-700 rounded col-span-1"></div>
              <div className="h-4 bg-gray-700 rounded col-span-1"></div>
              <div className="h-4 bg-gray-700 rounded col-span-1"></div>
              <div className="h-4 bg-gray-700 rounded col-span-1"></div>
              <div className="h-4 bg-gray-700 rounded col-span-1"></div>
              <div className="h-4 bg-gray-700 rounded col-span-1"></div>
              <div className="h-4 bg-gray-700 rounded col-span-1"></div>
            </div>
          ))}
        </div>
      ) : (
      <div className="neumorphic-card p-4 md:p-6 overflow-x-auto">
        <div className="min-w-[800px]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 md:py-4 px-2 font-dm-sans font-semibold text-white/70 text-sm md:text-base">
                  Name
                </th>
                <th className="text-left py-3 md:py-4 px-2 font-dm-sans font-semibold text-white/70 text-sm md:text-base">
                  Shut Down
                </th>
                <th className="text-left py-3 md:py-4 px-2 font-dm-sans font-semibold text-white/70 text-sm md:text-base">
                  Industry
                </th>
                <th className="text-left py-3 md:py-4 px-2 font-dm-sans font-semibold text-white/70 text-sm md:text-base">
                  Country
                </th>
                <th className="text-left py-3 md:py-4 px-2 font-dm-sans font-semibold text-white/70 text-sm md:text-base">
                  Funding
                </th>
                <th className="text-left py-3 md:py-4 px-2 font-dm-sans font-semibold text-white/70 text-sm md:text-base">
                  Cause of Shutdown
                </th>
                <th className="text-left py-3 md:py-4 px-2 font-dm-sans font-semibold text-white/70 text-sm md:text-base">
                  Link
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStartups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-white/50 font-dm-sans">
                    {searchQuery ? `No startups found matching "${searchQuery}"` : "No startups found"}
                  </td>
                </tr>
              ) : (
                filteredStartups.map((startup) => (
                  <tr key={startup.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-3 md:py-4 px-2">
                      <button
                        onClick={() => handleStartupClick(startup)}
                        className="font-medium text-white hover:text-white/80 transition-colors text-left text-sm md:text-base underline decoration-dotted underline-offset-2"
                      >
                        {startup.name}
                      </button>
                    </td>
                    <td className="py-3 md:py-4 px-2 text-white/70 text-sm md:text-base">
                      {startup.shutDown}
                    </td>
                    <td className="py-3 md:py-4 px-2 text-white/70 text-sm md:text-base">{startup.industry}</td>
                    <td className="py-3 md:py-4 px-2 text-white/70 text-sm md:text-base">{startup.country}</td>
                    <td className="py-3 md:py-4 px-2 text-white/70 text-sm md:text-base">{startup.funding}</td>
                    <td className="py-3 md:py-4 px-2 text-white/70 text-sm md:text-base max-w-[200px] md:max-w-xs truncate">
                      {startup.causeOfShutdown}
                    </td>
                    <td className="py-3 md:py-4 px-2">
                      {startup.articleUrl && (
                        <a
                          href={startup.articleUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-white/80 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={14} className="md:w-4 md:h-4" />
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      <StartupDetailDialog startup={selectedStartup} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  )
}
