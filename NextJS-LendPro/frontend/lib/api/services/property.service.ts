import apiClient from '../api-client';

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
  isFavorited?: boolean;
}

export interface PropertySearchParams {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  propertyType?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'price' | 'date' | 'size';
  sortOrder?: 'asc' | 'desc';
}

export interface PropertySearchResponse {
  properties: Property[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Location {
  city: string;
  state: string;
  count: number;
}

export const propertyService = {
  async searchProperties(params: PropertySearchParams): Promise<PropertySearchResponse> {
    const response = await apiClient.get<PropertySearchResponse>('/properties/search', { params });
    return response.data;
  },

  async getPropertyById(id: number): Promise<Property> {
    const response = await apiClient.get<Property>(`/properties/${id}`);
    return response.data;
  },

  async toggleFavorite(propertyId: number): Promise<{ isFavorited: boolean }> {
    const response = await apiClient.post<{ isFavorited: boolean }>(`/properties/${propertyId}/favorite`);
    return response.data;
  },

  async getFavoriteProperties(): Promise<Property[]> {
    const response = await apiClient.get<Property[]>('/properties/favorites');
    return response.data;
  },

  async getLocations(): Promise<Location[]> {
    const response = await apiClient.get<Location[]>('/properties/locations');
    return response.data;
  }
};