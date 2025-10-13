const WCA_API_BASE = 'https://www.worldcubeassociation.org/api/v0';
const CORS_PROXIES = [
  'https://api.allorigins.win/get?url=',
  'https://corsproxy.io/?',
  'https://cors.sh/'
];

// Competition data cache
let competitionCache = {
  data: null,
  timestamp: null,
  isLoading: false
};

// Cache duration: 1 hour (3600000 ms)
const CACHE_DURATION = 60 * 60 * 1000;

/**
 * Check if cached data is still valid
 */
function isCacheValid() {
  return competitionCache.data &&
         competitionCache.timestamp &&
         (Date.now() - competitionCache.timestamp) < CACHE_DURATION;
}

/**
 * Fetch competitions from API and cache the result
 */
async function fetchAndCacheCompetitions() {
  const today = new Date().toISOString().split('T')[0];
  const apiUrl = `${WCA_API_BASE}/competitions?sort=start_date&start=${today}`;

  console.log('Fetching fresh competition data from WCA API...');

  // Try direct API first (will work in production)
  try {
    const response = await fetch(apiUrl);
    if (response.ok) {
      const competitions = await response.json();
      const formattedCompetitions = formatOfficialCompetitions(competitions);

      // Cache the data
      competitionCache = {
        data: formattedCompetitions,
        timestamp: Date.now(),
        isLoading: false
      };

      console.log(`Cached ${formattedCompetitions.length} competitions`);
      return formattedCompetitions;
    }
  } catch (error) {
    console.warn('Direct API failed due to CORS:', error.message);
  }

  // Try CORS proxies
  for (const proxy of CORS_PROXIES) {
    try {
      console.log(`Trying CORS proxy: ${proxy}`);
      let proxyUrl, response, data;

      if (proxy.includes('allorigins.win')) {
        proxyUrl = `${proxy}${encodeURIComponent(apiUrl)}`;
        response = await fetch(proxyUrl);
        if (response.ok) {
          const result = await response.json();
          data = JSON.parse(result.contents);
        }
      } else {
        proxyUrl = `${proxy}${apiUrl}`;
        response = await fetch(proxyUrl);
        if (response.ok) {
          data = await response.json();
        }
      }

      if (data) {
        console.log('Successfully fetched from CORS proxy');
        const formattedCompetitions = formatOfficialCompetitions(data);

        // Cache the data
        competitionCache = {
          data: formattedCompetitions,
          timestamp: Date.now(),
          isLoading: false
        };

        console.log(`Cached ${formattedCompetitions.length} competitions`);
        return formattedCompetitions;
      }
    } catch (proxyError) {
      console.warn(`CORS proxy ${proxy} failed:`, proxyError.message);
    }
  }

  console.error('All API methods failed to fetch competitions');
  throw new Error('Unable to fetch competitions. Please check your internet connection or try again later.');
}

/**
 * Fetch upcoming competitions from official WCA API with caching
 */
export async function getUpcomingCompetitions(limit = 50) {
  // Check if we have valid cached data
  if (isCacheValid()) {
    console.log('Using cached competition data');
    return competitionCache.data.slice(0, limit);
  }

  // If already loading, wait for the current request
  if (competitionCache.isLoading) {
    console.log('Competition data is already being fetched, waiting...');
    // Wait for loading to complete by polling every 100ms
    while (competitionCache.isLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (competitionCache.data) {
      return competitionCache.data.slice(0, limit);
    }
  }

  // Mark as loading and fetch new data
  competitionCache.isLoading = true;

  try {
    const competitions = await fetchAndCacheCompetitions();
    return competitions.slice(0, limit);
  } catch (error) {
    competitionCache.isLoading = false;
    throw error;
  }
}

/**
 * Format official WCA API competitions data
 */
function formatOfficialCompetitions(competitions) {
  return competitions
    .filter(comp => {
      const startDate = new Date(comp.start_date);
      const today = new Date();
      return startDate >= today;
    })
    .map(comp => ({
      id: comp.id,
      name: comp.name,
      city: comp.city,
      country: comp.country_iso2,
      startDate: comp.start_date,
      endDate: comp.end_date,
      venue: comp.venue || '',
      website: comp.website || comp.url || '',
      registrationOpen: comp.registration_open,
      registrationClose: comp.registration_close,
      displayName: `${comp.name} - ${comp.city}, ${comp.country_iso2}`,
      dateRange: formatDateRange(comp.start_date, comp.end_date)
    }))
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
}


/**
 * Search competitions by name or location using cached data for better performance
 */
export async function searchCompetitions(query, limit = 20) {
  // If no query, get all upcoming competitions
  if (!query || query.trim().length < 2) {
    return await getUpcomingCompetitions(limit);
  }

  const searchTerm = query.trim().toLowerCase();

  // First, try to search using cached data for instant results
  if (isCacheValid()) {
    console.log('Using cached data for search');
    const filtered = competitionCache.data.filter(comp =>
      comp.name.toLowerCase().includes(searchTerm) ||
      comp.city.toLowerCase().includes(searchTerm) ||
      comp.country.toLowerCase().includes(searchTerm)
    );

    if (filtered.length > 0 || searchTerm.length < 3) {
      // Return cached results if found, or for short queries
      return filtered.slice(0, limit);
    }
  }

  // For longer searches with no cached results, try API search
  if (searchTerm.length >= 3) {
    const today = new Date().toISOString().split('T')[0];
    const apiUrl = `${WCA_API_BASE}/competitions?sort=start_date&start=${today}&q=${encodeURIComponent(searchTerm)}`;

    // Try direct API first
    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        const competitions = await response.json();
        return formatOfficialCompetitions(competitions).slice(0, limit);
      }
    } catch (error) {
      console.warn('Direct search API failed due to CORS:', error.message);
    }

    // Try CORS proxies for search
    for (const proxy of CORS_PROXIES) {
      try {
        let proxyUrl, response, data;

        if (proxy.includes('allorigins.win')) {
          proxyUrl = `${proxy}${encodeURIComponent(apiUrl)}`;
          response = await fetch(proxyUrl);
          if (response.ok) {
            const result = await response.json();
            data = JSON.parse(result.contents);
          }
        } else {
          proxyUrl = `${proxy}${apiUrl}`;
          response = await fetch(proxyUrl);
          if (response.ok) {
            data = await response.json();
          }
        }

        if (data) {
          return formatOfficialCompetitions(data).slice(0, limit);
        }
      } catch (proxyError) {
        console.warn(`Search CORS proxy ${proxy} failed:`, proxyError.message);
      }
    }
  }

  // Fallback to client-side filtering with all competitions
  try {
    console.log('Using client-side search fallback');
    const competitions = await getUpcomingCompetitions(200); // Get more for better search results

    return competitions
      .filter(comp =>
        comp.name.toLowerCase().includes(searchTerm) ||
        comp.city.toLowerCase().includes(searchTerm) ||
        comp.country.toLowerCase().includes(searchTerm)
      )
      .slice(0, limit);
  } catch (error) {
    console.error('Error searching competitions:', error);
    throw error;
  }
}

/**
 * Manually refresh the competition cache (useful for debugging)
 */
export async function refreshCompetitionCache() {
  console.log('Manually refreshing competition cache...');
  competitionCache.isLoading = true;
  try {
    const competitions = await fetchAndCacheCompetitions();
    return competitions;
  } catch (error) {
    competitionCache.isLoading = false;
    throw error;
  }
}

/**
 * Get cache status for debugging
 */
export function getCacheStatus() {
  return {
    hasData: !!competitionCache.data,
    dataCount: competitionCache.data ? competitionCache.data.length : 0,
    timestamp: competitionCache.timestamp,
    isValid: isCacheValid(),
    isLoading: competitionCache.isLoading,
    ageMinutes: competitionCache.timestamp ? Math.floor((Date.now() - competitionCache.timestamp) / 60000) : null
  };
}

/**
 * Get competition details by ID using official WCA API
 */
export async function getCompetitionById(competitionId) {
  const apiUrl = `${WCA_API_BASE}/competitions/${competitionId}`;

  // Try direct API first
  try {
    const response = await fetch(apiUrl);
    if (response.ok) {
      const competition = await response.json();
      return formatSingleOfficialCompetition(competition);
    }
  } catch (error) {
    console.warn('Direct competition API failed due to CORS:', error.message);
  }

  // Try CORS proxies
  for (const proxy of CORS_PROXIES) {
    try {
      let proxyUrl, response, data;

      if (proxy.includes('allorigins.win')) {
        proxyUrl = `${proxy}${encodeURIComponent(apiUrl)}`;
        response = await fetch(proxyUrl);
        if (response.ok) {
          const result = await response.json();
          data = JSON.parse(result.contents);
        }
      } else {
        proxyUrl = `${proxy}${apiUrl}`;
        response = await fetch(proxyUrl);
        if (response.ok) {
          data = await response.json();
        }
      }

      if (data) {
        return formatSingleOfficialCompetition(data);
      }
    } catch (proxyError) {
      console.warn(`Competition CORS proxy ${proxy} failed:`, proxyError.message);
    }
  }

  throw new Error('Competition not found');
}

/**
 * Format single competition from official WCA API
 */
function formatSingleOfficialCompetition(competition) {
  return {
    id: competition.id,
    name: competition.name,
    city: competition.city,
    country: competition.country_iso2,
    startDate: competition.start_date,
    endDate: competition.end_date,
    venue: competition.venue || '',
    website: competition.website || competition.url || '',
    registrationOpen: competition.registration_open,
    registrationClose: competition.registration_close,
    displayName: `${competition.name} - ${competition.city}, ${competition.country_iso2}`,
    dateRange: formatDateRange(competition.start_date, competition.end_date)
  };
}

/**
 * Get competitions by country using official WCA API
 */
export async function getCompetitionsByCountry(countryCode, limit = 50) {
  try {
    const competitions = await getUpcomingCompetitions(100);

    return competitions
      .filter(comp => comp.country.toLowerCase() === countryCode.toLowerCase())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching competitions by country:', error);
    throw error;
  }
}

/**
 * Format date range for display
 */
function formatDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString('en-US', options);
  } else if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${end.getDate()}, ${start.getFullYear()}`;
  } else {
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  }
}

/**
 * Check if a competition is still accepting registrations
 */
export function isRegistrationOpen(competition) {
  const now = new Date();
  const registrationClose = new Date(competition.registrationClose);
  return now < registrationClose;
}

/**
 * Get days until competition starts
 */
export function getDaysUntilCompetition(competition) {
  const now = new Date();
  const startDate = new Date(competition.startDate);
  const diffTime = startDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}