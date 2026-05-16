import gql from "graphql-tag";

export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  # ──── Enums ────
  enum UserRole { CLIENT BARBER ADMIN SELLER }
  enum BookingStatus { PENDING CONFIRMED IN_PROGRESS COMPLETED CANCELLED NO_SHOW }
  enum SubscriptionTier { FREE PRO PREMIUM }
  enum ClientTier { FREE PLUS }
  enum PaymentStatus { PENDING SUCCEEDED FAILED REFUNDED }

  # ──── User ────
  type User {
    id: ID!
    email: String
    phone: String!
    role: UserRole!
    name: String!
    avatarUrl: String
    locationLat: Float
    locationLng: Float
    city: String
    preferredLang: String!
    createdAt: DateTime!
    barber: Barber
    client: Client
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  # ──── Barber ────
  type Barber {
    id: ID!
    user: User!
    bio: String
    isVerified: Boolean!
    subscriptionTier: SubscriptionTier!
    isAvailable: Boolean!
    avgRating: Float!
    totalReviews: Int!
    totalBookings: Int!
    services: [Service!]!
    schedule: [Schedule!]!
    portfolio: [PortfolioItem!]!
    aiCredits: Int!
    distance: Float  # calculated field (km)
  }

  type Service {
    id: ID!
    name: String!
    price: Float!
    duration: Int!
    category: String
    isActive: Boolean!
  }

  type Schedule {
    id: ID!
    dayOfWeek: Int!
    startTime: String!
    endTime: String!
    isActive: Boolean!
  }

  type PortfolioItem {
    id: ID!
    imageUrl: String!
    title: String
    style: String
  }

  # ──── Client ────
  type Client {
    id: ID!
    user: User!
    tier: ClientTier!
    aiCredits: Int!
    preferences: JSON
  }

  # ──── Booking ────
  type Booking {
    id: ID!
    client: User!
    barber: Barber!
    status: BookingStatus!
    startTime: DateTime!
    endTime: DateTime!
    totalPrice: Float!
    platformFee: Float!
    services: [BookingService!]!
    payment: Payment
    review: Review
    notes: String
    createdAt: DateTime!
  }

  type BookingService {
    service: Service!
    priceAtBooking: Float!
  }

  # ──── Review ────
  type Review {
    id: ID!
    author: User!
    rating: Int!
    comment: String
    createdAt: DateTime!
  }

  # ──── Payment ────
  type Payment {
    id: ID!
    amount: Float!
    currency: String!
    status: PaymentStatus!
    type: String!
    createdAt: DateTime!
  }

  # ──── Subscription ────
  type Subscription {
    id: ID!
    tier: String!
    role: String!
    status: String!
    currentPeriodEnd: DateTime!
    autoRenew: Boolean!
  }

  # ──── Marketplace ────
  type MarketItem {
    id: ID!
    seller: Barber!
    title: String!
    description: String
    price: Float!
    currency: String!
    category: String!
    brand: String
    images: JSON
    stock: Int!
    isActive: Boolean!
    aiGenerated: Boolean!
  }

  type MarketOrder {
    id: ID!
    status: String!
    totalPrice: Float!
    currency: String!
    items: [MarketOrderItem!]!
    createdAt: DateTime!
  }

  type MarketOrderItem {
    item: MarketItem!
    quantity: Int!
    priceAtOrder: Float!
  }

  # ──── AI ────
  type AISession {
    id: ID!
    type: String!
    messages: JSON!
    tokensUsed: Int!
    costCredits: Int!
    createdAt: DateTime!
  }

  type AIResponse {
    reply: String!
    creditsUsed: Int!
    creditsRemaining: Int!
  }

  type StyleAdvice {
    recommendedStyle: String!
    confidence: Float!
    explanation: String!
    compatibleBarbers: [Barber!]!
  }

  # ──── Analytics ────
  type BarberAnalytics {
    totalBookings: Int!
    totalRevenue: Float!
    avgRating: Float!
    occupancyRate: Float!
    topServices: [Service!]!
    revenueTrend: JSON!
  }

  type PlatformMetrics {
    totalUsers: Int!
    totalBarbers: Int!
    totalBookings: Int!
    gmv: Float!
    platformRevenue: Float!
    activeSubscriptions: Int!
    aiRevenue: Float!
  }

  # ──── Inputs ────
  input RegisterInput {
    phone: String!
    password: String!
    name: String!
    role: UserRole!
    email: String
    city: String
  }

  input LoginInput {
    phone: String!
    password: String!
  }

  input UpdateProfileInput {
    name: String
    avatarUrl: String
    city: String
    locationLat: Float
    locationLng: Float
  }

  input BarberProfileInput {
    bio: String
    isAvailable: Boolean
  }

  input ServiceInput {
    name: String!
    price: Float!
    duration: Int!
    category: String
  }

  input ScheduleInput {
    dayOfWeek: Int!
    startTime: String!
    endTime: String!
    isActive: Boolean!
  }

  input BookingInput {
    barberId: ID!
    serviceIds: [ID!]!
    startTime: DateTime!
    notes: String
  }

  input BarberSearchInput {
    lat: Float
    lng: Float
    radius: Int       # km, default 10
    minRating: Float
    maxPrice: Float
    serviceCategory: String
    availableAfter: DateTime
    subscriptionTier: SubscriptionTier
    sortBy: String    # rating, price, distance, availability
  }

  input AIChatInput {
    message: String!
  }

  input AIStyleInput {
    imageUrl: String
    description: String
  }

  input MarketItemInput {
    title: String!
    description: String
    price: Float!
    category: String!
    brand: String
    images: [String!]
    stock: Int!
  }

  # ──── Query ────
  type Query {
    me: User

    # Barbers
    barber(id: ID!): Barber
    searchBarbers(input: BarberSearchInput!): [Barber!]!
    featuredBarbers(limit: Int): [Barber!]!

    # Bookings
    myBookings(status: BookingStatus): [Booking!]!
    booking(id: ID!): Booking
    barberBookings(barberId: ID!, status: BookingStatus, date: DateTime): [Booking!]!
    availableSlots(barberId: ID!, date: DateTime!): [DateTime!]!

    # Marketplace
    marketItems(category: String, search: String, minPrice: Float, maxPrice: Float): [MarketItem!]!
    marketItem(id: ID!): MarketItem

    # AI
    myAISessions: [AISession!]!

    # Analytics
    myBarberAnalytics: BarberAnalytics
    platformMetrics: PlatformMetrics

    # Subscription
    mySubscription: Subscription
  }

  # ──── Mutation ────
  type Mutation {
    # Auth
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!

    # Profile
    updateProfile(input: UpdateProfileInput!): User!
    setupBarberProfile(input: BarberProfileInput!): Barber!

    # Services & Schedule
    addService(input: ServiceInput!): Service!
    updateService(id: ID!, input: ServiceInput!): Service!
    deleteService(id: ID!): Boolean!
    setSchedule(schedule: [ScheduleInput!]!): [Schedule!]!

    # Bookings
    createBooking(input: BookingInput!): Booking!
    confirmBooking(bookingId: ID!): Booking!
    cancelBooking(bookingId: ID!, reason: String): Booking!
    completeBooking(bookingId: ID!): Booking!

    # Reviews
    submitReview(bookingId: ID!, rating: Int!, comment: String): Review!

    # Payments
    createPaymentIntent(bookingId: ID!): String!  # returns clientSecret
    createSubscriptionCheckout(tier: String!, role: String!): String!

    # AI
    aiChat(input: AIChatInput!): AIResponse!
    aiStyleAdvice(input: AIStyleInput!): StyleAdvice!
    aiOptimizePrice(barberId: ID!): JSON!

    # Marketplace
    createMarketItem(input: MarketItemInput!): MarketItem!
    createMarketOrder(items: [MarketOrderItemInput!]!, address: String): MarketOrder!

    # Admin
    verifyBarber(barberId: ID!): Barber!
    updateCommission(barberId: ID!, pct: Float!): Barber!
  }

  input MarketOrderItemInput {
    itemId: ID!
    quantity: Int!
  }
`;
