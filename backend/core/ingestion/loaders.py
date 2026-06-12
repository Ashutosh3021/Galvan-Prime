"""
core/ingestion/loaders.py — Document loaders for PDF, URL, and plain-text sources.

Each loader returns a list of raw text strings (one per page / section).
Metadata (source name, page numbers) is returned alongside the text.
"""

from __future__ import annotations

import io
import logging
from dataclasses import dataclass
from typing import Optional

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


@dataclass
class RawPage:
    """A single extracted page / section of text with its provenance."""
    text: str
    page: Optional[int] = None       # 1-indexed; None for URL/TXT sources
    source: str = ""                  # filename or URL


# ── PDF Loader ────────────────────────────────────────────────────────────────

def load_pdf(file_bytes: bytes, filename: str) -> list[RawPage]:
    """
    Extract text from a PDF byte stream using pypdf.

    Args:
        file_bytes: Raw bytes of the uploaded PDF.
        filename:   Original filename (used as source label).

    Returns:
        List of RawPage, one per PDF page.  Pages with no extractable
        text are silently skipped.
    """
    from pypdf import PdfReader

    pages: list[RawPage] = []
    reader = PdfReader(io.BytesIO(file_bytes))

    for i, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        text = text.strip()
        if text:
            pages.append(RawPage(text=text, page=i, source=filename))

    logger.info("PDF '%s': extracted %d non-empty pages", filename, len(pages))
    return pages


# ── URL Loader ────────────────────────────────────────────────────────────────

def load_url(url: str, timeout: int = 15) -> list[RawPage]:
    """
    Fetch a URL and extract its visible text content via BeautifulSoup.

    Args:
        url:     The HTTP/HTTPS URL to fetch.
        timeout: Request timeout in seconds.

    Returns:
        Single-element list with all visible text from the page.

    Raises:
        ValueError: If the HTTP request fails or returns a non-200 status.
    """
    try:
        resp = requests.get(url, timeout=timeout, headers={"User-Agent": "GalvanRAG/1.0"})
        resp.raise_for_status()
    except requests.RequestException as exc:
        raise ValueError(f"Failed to fetch URL '{url}': {exc}") from exc

    soup = BeautifulSoup(resp.text, "html.parser")

    # Remove non-content tags
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()

    text = soup.get_text(separator="\n", strip=True)
    text = "\n".join(line for line in text.splitlines() if line.strip())

    if not text:
        raise ValueError(f"No extractable text found at '{url}'")

    logger.info("URL '%s': extracted %d characters", url, len(text))
    return [RawPage(text=text, page=None, source=url)]


# ── Plain-text Loader ─────────────────────────────────────────────────────────

def load_text(file_bytes: bytes, filename: str) -> list[RawPage]:
    """
    Decode a plain-text file (UTF-8 with fallback to latin-1).

    Args:
        file_bytes: Raw bytes of the uploaded text file.
        filename:   Original filename (used as source label).

    Returns:
        Single-element list with the full file text.
    """
    try:
        text = file_bytes.decode("utf-8")
    except UnicodeDecodeError:
        text = file_bytes.decode("latin-1")

    text = text.strip()
    if not text:
        raise ValueError(f"Text file '{filename}' is empty")

    logger.info("TXT '%s': %d characters", filename, len(text))
    return [RawPage(text=text, page=None, source=filename)]
