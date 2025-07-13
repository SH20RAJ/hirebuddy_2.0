// Company Logo Service
// Provides company logos with multiple fallback options

export interface LogoResult {
  url: string;
  isInitials: boolean;
  source: 'getlogo' | 'logo.dev' | 'logotypes' | 'initials';
}

export class CompanyLogoService {
  private static logoCache = new Map<string, LogoResult>();
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private static cacheTimestamps = new Map<string, number>();

  /**
   * Get company logo with multiple fallback strategies
   */
  static async getCompanyLogo(companyName: string): Promise<LogoResult> {
    if (!companyName) {
      console.log('❌ No company name provided, using default initials');
      return this.generateInitialsLogo(companyName || 'Unknown');
    }

    const cacheKey = companyName.toLowerCase().trim();
    
    // Check cache first
    if (this.isCacheValid(cacheKey)) {
      console.log(`🎯 Using cached logo for ${companyName}`);
      return this.logoCache.get(cacheKey)!;
    }

    console.log(`🔍 Fetching logo for ${companyName}...`);
    
    try {
      // Try different logo sources in order of preference
      let result = await this.tryGetLogoFromSources(companyName);
      
      if (!result) {
        console.log(`❌ No external logo found for ${companyName}, generating initials`);
        result = this.generateInitialsLogo(companyName);
      }

      // Cache the result
      this.logoCache.set(cacheKey, result);
      this.cacheTimestamps.set(cacheKey, Date.now());
      
      console.log(`✅ Final logo result for ${companyName}:`, result);
      return result;
    } catch (error) {
      console.warn(`❌ Error fetching company logo for ${companyName}:`, error);
      return this.generateInitialsLogo(companyName);
    }
  }

  /**
   * Try to get logo from various sources
   */
  private static async tryGetLogoFromSources(companyName: string): Promise<LogoResult | null> {
    const cleanCompanyName = this.cleanCompanyName(companyName);
    console.log(`Trying to fetch logo for: ${companyName} (cleaned: ${cleanCompanyName})`);
    
    // Try a simple favicon approach first for well-known companies
    const domain = this.guessDomainFromCompany(cleanCompanyName);
    if (domain) {
      try {
        const faviconResult = await this.tryFavicon(domain);
        if (faviconResult) {
          console.log(`Found favicon for ${companyName}: ${faviconResult}`);
          return {
            url: faviconResult,
            isInitials: false,
            source: 'getlogo'
          };
        }
      } catch (error) {
        console.warn('Favicon failed:', error);
      }
    }

    // Try Logo.dev (requires domain, free tier available)
    if (domain) {
      try {
        const logoDevResult = await this.tryLogoDev(domain);
        if (logoDevResult) {
          console.log(`Found logo.dev logo for ${companyName}: ${logoDevResult}`);
          return {
            url: logoDevResult,
            isInitials: false,
            source: 'logo.dev'
          };
        }
      } catch (error) {
        console.warn('Logo.dev API failed:', error);
      }
    }

    // Try GetLogo API (free, no API key required)
    if (domain) {
      try {
        const getLogoResult = await this.tryGetLogo(cleanCompanyName);
        if (getLogoResult) {
          console.log(`Found GetLogo result for ${companyName}: ${getLogoResult}`);
          return {
            url: getLogoResult,
            isInitials: false,
            source: 'getlogo'
          };
        }
      } catch (error) {
        console.warn('GetLogo API failed:', error);
      }
    }

    // Try Logotypes.dev (open source)
    try {
      const logotypesResult = await this.tryLogotypes(cleanCompanyName);
      if (logotypesResult) {
        console.log(`Found Logotypes.dev result for ${companyName}: ${logotypesResult}`);
        return {
          url: logotypesResult,
          isInitials: false,
          source: 'logotypes'
        };
      }
    } catch (error) {
      console.warn('Logotypes.dev API failed:', error);
    }

    console.log(`No logo found for ${companyName}, will use initials`);
    return null;
  }

  /**
   * Try simple favicon approach
   */
  private static async tryFavicon(domain: string): Promise<string | null> {
    // Try different favicon approaches with better reliability
    const faviconUrls = [
      `https://www.google.com/s2/favicons?domain=${domain}&sz=128`, // Higher resolution
      `https://logo.clearbit.com/${domain}`, // Clearbit has good logo coverage
      `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      `https://${domain}/favicon.ico`,
      `https://favicons.githubusercontent.com/${domain}`,
    ];

    for (const faviconUrl of faviconUrls) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        // Use GET instead of HEAD for better compatibility
        const response = await fetch(faviconUrl, { 
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LogoFetcher/1.0)',
          }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok && response.status === 200) {
          const contentType = response.headers.get('content-type');
          const contentLength = response.headers.get('content-length');
          
          // Check if it's actually an image and has reasonable size
          if (contentType && (contentType.startsWith('image/') || contentType.includes('icon'))) {
            // Make sure it's not too small (likely a placeholder)
            if (!contentLength || parseInt(contentLength) > 500) {
              console.log(`✅ Found favicon for ${domain}: ${faviconUrl}`);
              return faviconUrl;
            }
          }
        }
      } catch (error) {
        console.warn(`❌ Favicon failed for ${faviconUrl}:`, error);
        continue;
      }
    }
    return null;
  }

  /**
   * Try GetLogo API
   */
  private static async tryGetLogo(companyName: string): Promise<string | null> {
    const domain = this.guessDomainFromCompany(companyName);
    if (!domain) {
      console.log(`❌ No domain found for ${companyName}`);
      return null;
    }

    try {
      console.log(`🔍 Trying GetLogo API for ${companyName} (${domain})`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`https://getlogo.pushowl.com/api/${domain}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; LogoFetcher/1.0)',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        console.log(`GetLogo API response for ${domain}:`, data);
        
        if (data.url && this.isValidImageUrl(data.url)) {
          // Test if the image actually loads
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              console.log(`✅ GetLogo image loaded for ${companyName}: ${data.url}`);
              resolve(data.url);
            };
            img.onerror = () => {
              console.warn(`❌ GetLogo image failed to load for ${companyName}: ${data.url}`);
              resolve(null);
            };
            img.src = data.url;
            // Timeout after 3 seconds
            setTimeout(() => {
              console.warn(`⏰ GetLogo image timeout for ${companyName}: ${data.url}`);
              resolve(null);
            }, 3000);
          });
        } else {
          console.warn(`❌ Invalid URL from GetLogo for ${companyName}: ${data.url}`);
        }
      } else {
        console.warn(`❌ GetLogo API failed for ${domain}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.warn(`❌ GetLogo API error for ${companyName}:`, error);
    }
    return null;
  }

  /**
   * Try Logo.dev API
   */
  private static async tryLogoDev(domain: string): Promise<string | null> {
    // Logo.dev provides logos via CDN without API key for basic usage
    const logoUrl = `https://img.logo.dev/${domain}`;
    
    // Test if the logo exists by trying to fetch it
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(logoUrl, { 
        method: 'HEAD',
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok && response.status === 200) {
        // Additional check: make sure it's actually an image
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.startsWith('image/')) {
          return logoUrl;
        }
      }
    } catch (error) {
      console.warn('Logo.dev API error:', error);
    }
    return null;
  }

  /**
   * Try Logotypes.dev API
   */
  private static async tryLogotypes(companyName: string): Promise<string | null> {
    const slugifiedName = this.slugifyCompanyName(companyName);
    if (!slugifiedName) return null;
    
    const logoUrl = `https://www.logotypes.dev/${slugifiedName}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
      
      const response = await fetch(logoUrl, { 
        method: 'HEAD',
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok && response.status === 200) {
        const contentType = response.headers.get('content-type');
        if (contentType && (contentType.startsWith('image/') || contentType.includes('svg'))) {
          return logoUrl;
        }
      }
    } catch (error) {
      console.warn('Logotypes.dev API error:', error);
    }
    return null;
  }

  /**
   * Generate initials-based logo as fallback
   */
  private static generateInitialsLogo(companyName: string): LogoResult {
    const initials = this.getCompanyInitials(companyName);
    const colors = this.getConsistentColors(companyName);
    
    // Create a data URL for SVG logo
    const svg = `
      <svg width="60" height="60" xmlns="http://www.w3.org/2000/svg">
        <rect width="60" height="60" rx="8" fill="${colors.background}"/>
        <text x="30" y="40" font-family="system-ui, -apple-system, sans-serif" 
              font-size="24" font-weight="600" text-anchor="middle" 
              fill="${colors.text}">${initials}</text>
      </svg>
    `;
    
    // Use URL encoding instead of btoa to handle Unicode characters properly
    const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    
    return {
      url: dataUrl,
      isInitials: true,
      source: 'initials'
    };
  }

  /**
   * Get company initials (1-2 characters)
   */
  private static getCompanyInitials(companyName: string): string {
    if (!companyName) return 'C';
    
    const cleaned = companyName
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\b(inc|llc|ltd|corp|corporation|company|co)\b/gi, '') // Remove common suffixes
      .trim();
    
    const words = cleaned.split(/\s+/).filter(word => word.length > 0);
    
    if (words.length === 0) {
      return companyName.charAt(0).toUpperCase();
    } else if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    } else {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
  }

  /**
   * Get consistent colors for a company based on name hash
   */
  private static getConsistentColors(companyName: string): { background: string; text: string } {
    const colorPairs = [
      { background: '#3B82F6', text: '#FFFFFF' }, // Blue
      { background: '#10B981', text: '#FFFFFF' }, // Green
      { background: '#8B5CF6', text: '#FFFFFF' }, // Purple
      { background: '#F59E0B', text: '#FFFFFF' }, // Orange
      { background: '#EF4444', text: '#FFFFFF' }, // Red
      { background: '#06B6D4', text: '#FFFFFF' }, // Cyan
      { background: '#84CC16', text: '#FFFFFF' }, // Lime
      { background: '#EC4899', text: '#FFFFFF' }, // Pink
      { background: '#6366F1', text: '#FFFFFF' }, // Indigo
      { background: '#14B8A6', text: '#FFFFFF' }, // Teal
    ];

    let hash = 0;
    for (let i = 0; i < companyName.length; i++) {
      const char = companyName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }

    return colorPairs[Math.abs(hash) % colorPairs.length];
  }

  /**
   * Clean company name for API calls
   */
  private static cleanCompanyName(companyName: string): string {
    return companyName
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove special characters
      .replace(/\b(inc|llc|ltd|corp|corporation|company|co)\b/g, '') // Remove common suffixes
      .trim();
  }

  /**
   * Guess domain from company name
   */
  private static guessDomainFromCompany(companyName: string): string | null {
    const cleaned = this.cleanCompanyName(companyName);
    if (!cleaned) return null;
    
    // Handle common company name to domain mappings
    const commonMappings: Record<string, string> = {
      // Tech Giants
      'google': 'google.com',
      'microsoft': 'microsoft.com',
      'apple': 'apple.com',
      'amazon': 'amazon.com',
      'facebook': 'facebook.com',
      'meta': 'meta.com',
      'netflix': 'netflix.com',
      'spotify': 'spotify.com',
      'uber': 'uber.com',
      'airbnb': 'airbnb.com',
      'tesla': 'tesla.com',
      'twitter': 'twitter.com',
      'linkedin': 'linkedin.com',
      'instagram': 'instagram.com',
      'youtube': 'youtube.com',
      'github': 'github.com',
      'slack': 'slack.com',
      'zoom': 'zoom.us',
      'adobe': 'adobe.com',
      'salesforce': 'salesforce.com',
      'oracle': 'oracle.com',
      'ibm': 'ibm.com',
      'intel': 'intel.com',
      'nvidia': 'nvidia.com',
      'paypal': 'paypal.com',
      'stripe': 'stripe.com',
      'shopify': 'shopify.com',
      'dropbox': 'dropbox.com',
      'reddit': 'reddit.com',
      'pinterest': 'pinterest.com',
      'snapchat': 'snapchat.com',
      'tiktok': 'tiktok.com',
      'discord': 'discord.com',
      'whatsapp': 'whatsapp.com',
      'telegram': 'telegram.org',
      
      // Major Corporations & Financial Services
      'autodesk': 'autodesk.com',
      'goldman sachs': 'goldmansachs.com',
      'goldman': 'goldmansachs.com',
      'walmart': 'walmart.com',
      'jpmorgan': 'jpmorgan.com',
      'jp morgan': 'jpmorgan.com',
      'morgan stanley': 'morganstanley.com',
      'bank of america': 'bankofamerica.com',
      'wells fargo': 'wellsfargo.com',
      'citigroup': 'citigroup.com',
      'citi': 'citigroup.com',
      'american express': 'americanexpress.com',
      'amex': 'americanexpress.com',
      'visa': 'visa.com',
      'mastercard': 'mastercard.com',
      'blackrock': 'blackrock.com',
      'vanguard': 'vanguard.com',
      'fidelity': 'fidelity.com',
      'charles schwab': 'schwab.com',
      'schwab': 'schwab.com',
      
      // Fortune 500 Companies
      'berkshire hathaway': 'berkshirehathaway.com',
      'exxon mobil': 'exxonmobil.com',
      'exxon': 'exxonmobil.com',
      'unitedhealth': 'unitedhealthgroup.com',
      'mckesson': 'mckesson.com',
      'cvs health': 'cvshealth.com',
      'cvs': 'cvs.com',
      'at&t': 'att.com',
      'att': 'att.com',
      'general motors': 'gm.com',
      'gm': 'gm.com',
      'ford': 'ford.com',
      'verizon': 'verizon.com',
      'chevron': 'chevron.com',
      'kroger': 'kroger.com',
      'general electric': 'ge.com',
      'ge': 'ge.com',
      'walgreens': 'walgreens.com',
      'target': 'target.com',
      'home depot': 'homedepot.com',
      'boeing': 'boeing.com',
      'pfizer': 'pfizer.com',
      'johnson & johnson': 'jnj.com',
      'jnj': 'jnj.com',
      'procter & gamble': 'pg.com',
      'pg': 'pg.com',
      'coca cola': 'coca-cola.com',
      'coca-cola': 'coca-cola.com',
      'pepsico': 'pepsico.com',
      'pepsi': 'pepsi.com',
      'nike': 'nike.com',
      'mcdonalds': 'mcdonalds.com',
      'starbucks': 'starbucks.com',
      'disney': 'disney.com',
      'comcast': 'comcast.com',
      'lowes': 'lowes.com',
      'fedex': 'fedex.com',
      'ups': 'ups.com',
      'caterpillar': 'caterpillar.com',
      '3m': '3m.com',
      'honeywell': 'honeywell.com',
      'lockheed martin': 'lockheedmartin.com',
      'raytheon': 'raytheon.com',
      'abbott': 'abbott.com',
      'merck': 'merck.com',
      'bristol myers squibb': 'bms.com',
      'eli lilly': 'lilly.com',
      'lilly': 'lilly.com',
      'abbvie': 'abbvie.com',
      'gilead': 'gilead.com',
      'amgen': 'amgen.com',
      'biogen': 'biogen.com',
      'regeneron': 'regeneron.com',
      'moderna': 'modernatx.com',
      'biontech': 'biontech.de',
      
      // Consulting & Professional Services
      'mckinsey': 'mckinsey.com',
      'bcg': 'bcg.com',
      'boston consulting group': 'bcg.com',
      'bain': 'bain.com',
      'deloitte': 'deloitte.com',
      'pwc': 'pwc.com',
      'pricewaterhousecoopers': 'pwc.com',
      'ernst & young': 'ey.com',
      'ey': 'ey.com',
      'kpmg': 'kpmg.com',
      'accenture': 'accenture.com',
      
      // Real Estate & Construction
      'blackstone': 'blackstone.com',
      'brookfield': 'brookfield.com',
      'simon property': 'simon.com',
      'prologis': 'prologis.com',
      'american tower': 'americantower.com',
      'crown castle': 'crowncastle.com',
      'realty income': 'realtyincome.com',
      'digital realty': 'digitalrealty.com',
      'equinix': 'equinix.com',
      
      // Energy & Utilities
      'nextera energy': 'nexteraenergy.com',
      'duke energy': 'duke-energy.com',
      'southern company': 'southerncompany.com',
      'dominion energy': 'dominionenergy.com',
      'american electric power': 'aep.com',
      'aep': 'aep.com',
      'exelon': 'exeloncorp.com',
      'xcel energy': 'xcelenergy.com',
      'consolidated edison': 'conedison.com',
      'coned': 'conedison.com',
      'sempra energy': 'sempra.com',
      'kinder morgan': 'kindermorgan.com',
      'enterprise products': 'enterpriseproducts.com',
      'enbridge': 'enbridge.com',
      'tc energy': 'tcenergy.com',
      'conocophillips': 'conocophillips.com',
      'marathon petroleum': 'marathonpetroleum.com',
      'valero': 'valero.com',
      'phillips 66': 'phillips66.com',
      
      // Telecommunications
      'tmobile': 't-mobile.com',
      't-mobile': 't-mobile.com',
      'sprint': 'sprint.com',
      'charter communications': 'charter.com',
      'charter': 'charter.com',
      'dish network': 'dish.com',
      'dish': 'dish.com',
      'frontier communications': 'frontier.com',
      'frontier': 'frontier.com',
      'centurylink': 'lumen.com',
      'lumen': 'lumen.com',
      
      // Media & Entertainment
      'warner bros': 'warnerbros.com',
      'paramount': 'paramount.com',
      'universal': 'universalstudios.com',
      'sony': 'sony.com',
      'fox': 'fox.com',
      'cbs': 'cbs.com',
      'nbc': 'nbc.com',
      'abc': 'abc.com',
      'espn': 'espn.com',
      'cnn': 'cnn.com',
      'discovery': 'discovery.com',
      'hbo': 'hbo.com',
      'showtime': 'showtime.com',
      'hulu': 'hulu.com',
      'paramount+': 'paramountplus.com',
      'peacock': 'peacocktv.com',
      'max': 'max.com',
      
      // Retail & E-commerce
      'costco': 'costco.com',
      'sams club': 'samsclub.com',
      'bjs': 'bjs.com',
      'macys': 'macys.com',
      'nordstrom': 'nordstrom.com',
      'kohls': 'kohls.com',
      'jcpenney': 'jcpenney.com',
      'tj maxx': 'tjmaxx.com',
      'marshalls': 'marshalls.com',
      'ross': 'rossstores.com',
      'bed bath beyond': 'bedbathandbeyond.com',
      'best buy': 'bestbuy.com',
      'staples': 'staples.com',
      'office depot': 'officedepot.com',
      'petco': 'petco.com',
      'petsmart': 'petsmart.com',
      'gamestop': 'gamestop.com',
      'barnes noble': 'barnesandnoble.com',
      'whole foods': 'wholefoodsmarket.com',
      'trader joes': 'traderjoes.com',
      'wegmans': 'wegmans.com',
      'publix': 'publix.com',
      'safeway': 'safeway.com',
      'albertsons': 'albertsons.com',
      'rite aid': 'riteaid.com',
      
      // Airlines & Transportation
      'american airlines': 'aa.com',
      'delta': 'delta.com',
      'united airlines': 'united.com',
      'united': 'united.com',
      'southwest': 'southwest.com',
      'jetblue': 'jetblue.com',
      'alaska airlines': 'alaskaair.com',
      'spirit airlines': 'spirit.com',
      'frontier airlines': 'flyfrontier.com',
      'hawaiian airlines': 'hawaiianairlines.com',
      'allegiant': 'allegiantair.com',
      'sun country': 'suncountry.com',
      
      // Hotels & Hospitality
      'marriott': 'marriott.com',
      'hilton': 'hilton.com',
      'hyatt': 'hyatt.com',
      'intercontinental': 'ihg.com',
      'ihg': 'ihg.com',
      'choice hotels': 'choicehotels.com',
      'wyndham': 'wyndham.com',
      'best western': 'bestwestern.com',
      'la quinta': 'lq.com',
      'extended stay': 'extendedstayamerica.com',
      'red roof': 'redroof.com',
      'motel 6': 'motel6.com',
      'super 8': 'super8.com',
      'days inn': 'daysinn.com',
      'holiday inn': 'holidayinn.com',
      'hampton inn': 'hamptoninn.com',
      'courtyard': 'marriott.com',
      'residence inn': 'marriott.com',
      'springhill suites': 'marriott.com',
      'fairfield inn': 'marriott.com',
      'doubletree': 'hilton.com',
      'embassy suites': 'hilton.com',
      'homewood suites': 'hilton.com',
      'hampton': 'hilton.com',
      'garden inn': 'hilton.com',
      'home2 suites': 'hilton.com',
      'tru': 'hilton.com',
      'canopy': 'hilton.com',
      'tapestry': 'hilton.com',
      'curio': 'hilton.com',
      'waldorf astoria': 'hilton.com',
      'conrad': 'hilton.com',
      'lxr': 'hilton.com',
      'motto': 'hilton.com',
      'signia': 'hilton.com',
      'tempo': 'hilton.com',
      'spark': 'hilton.com',
      
      // Generic fallbacks for common tech terms
      'techcorp': 'techcorp.com',
      'startupxyz': 'startupxyz.com',
      'innovate': 'innovate.com',
      'datatech': 'datatech.com',
      'cloudware': 'cloudware.com',
      'fintech': 'fintech.com',
      'healthtech': 'healthtech.com',
      'edtech': 'edtech.com',
      'gamedev': 'gamedev.com',
      'webdev': 'webdev.com',
      'devops': 'devops.com',
      'cybersec': 'cybersec.com',
      'biotech': 'biotech.com',
      'greentech': 'greentech.com',
      'autotech': 'autotech.com',
      'robotics': 'robotics.com',
      'blockchain': 'blockchain.com',
      'crypto': 'crypto.com',
      'defi': 'defi.com',
      'nft': 'nft.com',
      'metaverse': 'metaverse.com',
      'vr': 'vr.com',
      'ar': 'ar.com',
      'iot': 'iot.com',
      'ai': 'ai.com',
      'ml': 'ml.com',
      'saas': 'saas.com',
      'paas': 'paas.com',
      'iaas': 'iaas.com',
    };

    if (commonMappings[cleaned]) {
      return commonMappings[cleaned];
    }

    // For other companies, try simple domain guess
    const words = cleaned.split(/\s+/);
    const firstWord = words[0];
    
    if (firstWord && firstWord.length > 2) {
      return `${firstWord}.com`;
    }

    return null;
  }

  /**
   * Slugify company name for logotypes.dev
   */
  private static slugifyCompanyName(companyName: string): string {
    return this.cleanCompanyName(companyName)
      .replace(/\s+/g, '-')
      .toLowerCase();
  }

  /**
   * Check if URL is a valid image URL
   */
  private static isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Check if cache is valid
   */
  private static isCacheValid(cacheKey: string): boolean {
    if (!this.logoCache.has(cacheKey) || !this.cacheTimestamps.has(cacheKey)) {
      return false;
    }
    
    const timestamp = this.cacheTimestamps.get(cacheKey)!;
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  /**
   * Clear expired cache entries
   */
  static clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, timestamp] of this.cacheTimestamps.entries()) {
      if (now - timestamp >= this.CACHE_DURATION) {
        this.logoCache.delete(key);
        this.cacheTimestamps.delete(key);
      }
    }
  }

  /**
   * Clear all cached logos (useful for testing)
   */
  static clearAllCache(): void {
    this.logoCache.clear();
    this.cacheTimestamps.clear();
    console.log('🧹 All logo cache cleared');
  }

  /**
   * Preload logos for multiple companies
   */
  static async preloadLogos(companyNames: string[]): Promise<void> {
    const promises = companyNames.map(name => 
      this.getCompanyLogo(name).catch(error => {
        console.warn(`Failed to preload logo for ${name}:`, error);
        return this.generateInitialsLogo(name);
      })
    );
    
    await Promise.allSettled(promises);
  }
} 