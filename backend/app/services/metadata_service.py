import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

def fetch_website_metadata(url: str) -> Dict[str, Optional[str]]:
    """
    Fetch website metadata including title, description, and favicon.
    Returns a dict with title, description, and favicon_url.
    """
    metadata = {
        "title": None,
        "description": None,
        "favicon_url": None
    }
    
    try:
        # Add protocol if missing
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        # Set headers to mimic a real browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Fetch the webpage with timeout
        response = requests.get(url, headers=headers, timeout=10, allow_redirects=True)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract title
        title_tag = soup.find('title')
        if title_tag:
            metadata["title"] = title_tag.get_text().strip()
        
        # Try Open Graph title first, then regular title
        og_title = soup.find('meta', property='og:title')
        if og_title and og_title.get('content'):
            metadata["title"] = og_title['content'].strip()
        
        # Extract description
        # Try meta description first
        desc_tag = soup.find('meta', attrs={'name': 'description'})
        if desc_tag and desc_tag.get('content'):
            metadata["description"] = desc_tag['content'].strip()
        
        # Try Open Graph description
        og_desc = soup.find('meta', property='og:description')
        if og_desc and og_desc.get('content'):
            metadata["description"] = og_desc['content'].strip()
        
        # Extract favicon
        favicon_url = extract_favicon_url(soup, url)
        if favicon_url:
            metadata["favicon_url"] = favicon_url
            
        # Truncate fields if too long
        if metadata["title"] and len(metadata["title"]) > 200:
            metadata["title"] = metadata["title"][:197] + "..."
            
        if metadata["description"] and len(metadata["description"]) > 500:
            metadata["description"] = metadata["description"][:497] + "..."
            
    except requests.exceptions.RequestException as e:
        logger.warning(f"Failed to fetch metadata for {url}: {e}")
    except Exception as e:
        logger.error(f"Unexpected error fetching metadata for {url}: {e}")
    
    return metadata

def extract_favicon_url(soup: BeautifulSoup, base_url: str) -> Optional[str]:
    """Extract favicon URL from HTML"""
    try:
        # Try different favicon link types in order of preference
        favicon_selectors = [
            'link[rel="apple-touch-icon"]',
            'link[rel="shortcut icon"]',
            'link[rel="icon"]',
            'link[rel="favicon"]'
        ]
        
        for selector in favicon_selectors:
            favicon_tag = soup.select_one(selector)
            if favicon_tag and favicon_tag.get('href'):
                favicon_url = favicon_tag['href']
                # Convert relative URL to absolute
                return urljoin(base_url, favicon_url)
        
        # Fallback to /favicon.ico
        parsed_url = urlparse(base_url)
        return f"{parsed_url.scheme}://{parsed_url.netloc}/favicon.ico"
        
    except Exception as e:
        logger.warning(f"Failed to extract favicon for {base_url}: {e}")
        return None