import { gql } from "@apollo/client";

export const SEARCH_BARBERS = gql`
  query SearchBarbers($input: BarberSearchInput!) {
    searchBarbers(input: $input) {
      id
      bio
      isVerified
      avgRating
      totalReviews
      totalBookings
      distance
      user {
        id
        name
        avatarUrl
        city
      }
      services {
        id
        name
        price
        duration
        category
      }
      portfolio {
        id
        imageUrl
        title
      }
    }
  }
`;

export const FEATURED_BARBERS = gql`
  query FeaturedBarbers($limit: Int) {
    featuredBarbers(limit: $limit) {
      id
      bio
      isVerified
      avgRating
      totalReviews
      totalBookings
      user {
        id
        name
        avatarUrl
        city
      }
      services {
        id
        name
        price
        duration
        category
      }
      portfolio {
        id
        imageUrl
        title
      }
    }
  }
`;