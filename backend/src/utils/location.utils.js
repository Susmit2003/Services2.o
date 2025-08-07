import axios from 'axios';
import { LRUCache } from 'lru-cache';

// In-memory cache to avoid repeated API calls for the same pincode
const cache = new LRUCache({
    max: 500, // cache up to 500 pincodes
    ttl: 1000 * 60 * 60 * 24, // cache for 24 hours
});

/**
 * Geocodes a pincode to latitude and longitude using OpenStreetMap Nominatim API.
 * @param {string} pincode The postal code to geocode.
 * @param {string} country The country code (e.g., 'IN' for India).
 * @returns {object|null} An object with longitude and latitude, or null if not found.
 */
export const getCoordsForPincode = async (pincode, country = 'IN') => {
    const cacheKey = `${pincode},${country}`;
    if (cache.has(cacheKey)) {
        console.log(`[Cache] HIT for pincode: ${pincode}`);
        return cache.get(cacheKey);
    }

    console.log(`[API] Geocoding pincode: ${pincode}`);
    try {
        const url = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(
            pincode
        )}&country=${encodeURIComponent(country)}&format=json&limit=1`;

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'OurServicesApp/1.0 (dev@ourservices.app)',
            },
        });

        if (data && data.length > 0) {
            const location = {
                longitude: parseFloat(data[0].lon),
                latitude: parseFloat(data[0].lat),
            };
            cache.set(cacheKey, location);
            return location;
        }

        console.warn(`No geocoding result found for pincode: ${pincode}`);
        return null;
    } catch (error) {
        if (error.response) {
            console.error(`Nominatim API failed with status: ${error.response.status}`, error.response.data);
        } else {
            console.error('Error geocoding pincode:', error.message);
        }
        return null;
    }
};