import { apolloClient } from '@/lib/apollo-client';
import { gql } from '@apollo/client';
import {
  SEARCH_PROPERTIES_QUERY,
  GET_PROPERTY_QUERY,
  GET_FAVORITE_PROPERTIES_QUERY,
  GET_LOCATIONS_QUERY,
  TOGGLE_FAVORITE_MUTATION
} from '../queries';

export interface Property {
  id: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  propertyType: string;
  description: string;
  imageUrl?: string;
  listedDate: string;
  isActive: boolean;
  isFavorite?: boolean;
}

export interface PropertySearchParams {
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  propertyType?: string;
}

export interface PropertySearchResponse {
  properties: Property[];
  hasNextPage: boolean;
  endCursor?: string;
}

export interface LocationsResponse {
  states: string[];
  cities: string[];
}

export const propertyService = {
  async searchProperties(
    params: PropertySearchParams = {},
    first: number = 20,
    after?: string
  ): Promise<PropertySearchResponse> {
    const { data } = await apolloClient.query({
      query: SEARCH_PROPERTIES_QUERY,
      variables: {
        first,
        after,
        search: {
          city: params.city,
          state: params.state,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          minBedrooms: params.minBedrooms,
          maxBedrooms: params.maxBedrooms,
          minBathrooms: params.minBathrooms,
          maxBathrooms: params.maxBathrooms,
          propertyType: params.propertyType
        }
      },
      fetchPolicy: 'cache-first'
    });

    return {
      properties: data.properties.edges.map((edge: { node: Property }) => edge.node),
      hasNextPage: data.properties.pageInfo.hasNextPage,
      endCursor: data.properties.pageInfo.endCursor
    };
  },

  async getPropertyById(id: number): Promise<Property> {
    const { data } = await apolloClient.query({
      query: GET_PROPERTY_QUERY,
      variables: { id },
      fetchPolicy: 'cache-first'
    });

    if (!data.property) {
      throw new Error('Property not found');
    }

    return data.property;
  },

  async toggleFavorite(propertyId: number): Promise<{ isFavorite: boolean }> {
    const { data } = await apolloClient.mutate({
      mutation: TOGGLE_FAVORITE_MUTATION,
      variables: { propertyId },
      update: (cache, { data }) => {
        if (data?.toggleFavoriteProperty?.property) {
          const isFavorite = data.toggleFavoriteProperty.isFavorite;
          
          // Update the specific property in cache
          cache.modify({
            id: `Property:${propertyId}`,
            fields: {
              isFavorite: () => isFavorite
            }
          });

          // Update favorite properties query cache
          if (isFavorite) {
            // Property was added to favorites, add it to the favorites query if we have the property data
            try {
              const propertyData = cache.readFragment({
                id: `Property:${propertyId}`,
                fragment: gql`
                  fragment PropertyData on Property {
                    id
                    address
                    city
                    state
                    zipCode
                    price
                    bedrooms
                    bathrooms
                    squareFeet
                    propertyType
                    description
                    imageUrl
                    listedDate
                    isActive
                  }
                `
              });
              
              if (propertyData) {
                cache.updateQuery({ query: GET_FAVORITE_PROPERTIES_QUERY }, (data) => {
                  if (data && !data.favoriteProperties.some((p: any) => p.id === propertyId)) {
                    return {
                      ...data,
                      favoriteProperties: [...data.favoriteProperties, { ...propertyData, isFavorite: true }]
                    };
                  }
                  return data;
                });
              }
            } catch (e) {
              // Property might not be in cache, that's ok
            }
          } else {
            // Property was removed from favorites
            cache.updateQuery({ query: GET_FAVORITE_PROPERTIES_QUERY }, (data) => {
              if (data) {
                return {
                  ...data,
                  favoriteProperties: data.favoriteProperties.filter((p: any) => p.id !== propertyId)
                };
              }
              return data;
            });
          }
        }
      }
    });

    if (data.toggleFavoriteProperty.errors?.length > 0) {
      throw new Error(data.toggleFavoriteProperty.errors[0].message);
    }

    return { isFavorite: data.toggleFavoriteProperty.isFavorite };
  },

  async getFavoriteProperties(): Promise<Property[]> {
    try {
      const { data } = await apolloClient.query({
        query: GET_FAVORITE_PROPERTIES_QUERY,
        fetchPolicy: 'network-only', // Always fetch fresh data
        errorPolicy: 'all'
      });

      // Add isFavorite: true to all properties since they come from favoriteProperties
      return (data?.favoriteProperties || []).map((property: Property) => ({
        ...property,
        isFavorite: true
      }));
    } catch (error: any) {
      // If there's an authentication error or network error, return empty array
      console.error('Error fetching favorite properties:', error);
      if (error.graphQLErrors?.some((e: any) => e.extensions?.code === 'AUTH_NOT_AUTHENTICATED')) {
        return [];
      }
      throw error;
    }
  },

  async getLocations(): Promise<LocationsResponse> {
    const { data } = await apolloClient.query({
      query: GET_LOCATIONS_QUERY,
      fetchPolicy: 'cache-first'
    });

    return data.locations;
  }
};