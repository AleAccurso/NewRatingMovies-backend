const availableRequestTypes = ["min", "admin", "full"] as const

export type requestType = typeof availableRequestTypes[number];