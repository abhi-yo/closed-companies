export interface Startup {
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

// This is now just for local fallback or testing
export const startups: Startup[] = [
  {
    id: 1,
    name: "Quibi",
    description: "Short-form mobile video streaming platform that failed to find its audience.",
    founded: 2018,
    shutDown: 2020,
    country: "USA",
    industry: "Streaming",
    funding: "$1.75B",
    causeOfShutdown: "Poor user adoption, COVID-19 impact",
    articleUrl: "https://www.wsj.com/articles/quibi-is-shutting-down-what-went-wrong-11603320319",
  },
  {
    id: 2,
    name: "Fast",
    description: "One-click checkout startup that burned through cash too quickly.",
    founded: 2019,
    shutDown: 2022,
    country: "USA",
    industry: "Fintech",
    funding: "$124M",
    causeOfShutdown: "High burn rate, low revenue",
    articleUrl: "https://www.forbes.com/sites/davidjeans/2022/04/05/fast-shuts-down-checkout-startup/",
  },
  {
    id: 3,
    name: "Arrivo",
    description: "Hyperloop-inspired transportation startup.",
    founded: 2017,
    shutDown: 2018,
    country: "USA",
    industry: "Transportation",
    funding: "$1B (projected)",
    causeOfShutdown: "Failed to secure Series A funding",
    articleUrl: "https://www.theverge.com/2018/12/14/18141299/arrivo-hyperloop-brogan-bambrogan-shut-down-layoffs",
  },
  {
    id: 4,
    name: "Anki",
    description: "Creator of popular consumer robots Cozmo and Vector.",
    founded: 2010,
    shutDown: 2019,
    country: "USA",
    industry: "Robotics",
    funding: "$182M",
    causeOfShutdown: "Failed to secure a critical round of funding",
    articleUrl: "https://www.theverge.com/2019/4/29/18522967/anki-shutting-down-cozmo-vector-robot-toy-company",
  },
  {
    id: 5,
    name: "Loon",
    description: "Alphabet's project to provide internet via stratospheric balloons.",
    founded: 2011,
    shutDown: 2021,
    country: "USA",
    industry: "Telecommunications",
    funding: "Alphabet-backed",
    causeOfShutdown: "Not commercially viable",
    articleUrl: "https://blog.x.company/loon-off-136ab10332ce",
  },
]
