"""
Filename-based matching for Before/After image pairs.

Supports common patterns:
- name-before.jpg / name-after.jpg
- name_before.jpg / name_after.jpg
- name-before-01.jpg / name-after-01.jpg
- name_before_01.jpg / name_after_01.jpg
"""

import re
from dataclasses import dataclass
from typing import List, Tuple, Optional
from collections import defaultdict


@dataclass
class MatchedPair:
    """A matched before/after pair with confidence level."""
    before_file: str
    after_file: str
    confidence: str  # 'high' | 'medium' | 'low'
    base_name: str


@dataclass
class MatchResult:
    """Result of matching before and after files."""
    matched_pairs: List[MatchedPair]
    unmatched_before: List[str]
    unmatched_after: List[str]


# Patterns to identify before/after in filenames
BEFORE_PATTERNS = [
    r'-before\b',
    r'_before\b',
    r'-before-\d+',
    r'_before_\d+',
    r'before-\d+',
    r'before_\d+',
]

AFTER_PATTERNS = [
    r'-after\b',
    r'_after\b',
    r'-after-\d+',
    r'_after_\d+',
    r'after-\d+',
    r'after_\d+',
]

# Compiled regex for extracting base name
BEFORE_REGEX = re.compile(r'(' + '|'.join(BEFORE_PATTERNS) + r')', re.IGNORECASE)
AFTER_REGEX = re.compile(r'(' + '|'.join(AFTER_PATTERNS) + r')', re.IGNORECASE)


def extract_base_name(filename: str) -> Tuple[Optional[str], str]:
    """
    Extract the base name by removing before/after markers.
    
    Returns: (base_name, marker_type) where marker_type is 'before', 'after', or None
    """
    name = filename
    
    # Check for before patterns
    before_match = BEFORE_REGEX.search(name)
    if before_match:
        base = BEFORE_REGEX.sub('', name)
        # Clean up any double separators or trailing separators
        base = re.sub(r'[-_]{2,}', '-', base)
        base = re.sub(r'[-_]+$', '', base)
        base = re.sub(r'^[-_]+', '', base)
        return base if base else None, 'before'
    
    # Check for after patterns
    after_match = AFTER_REGEX.search(name)
    if after_match:
        base = AFTER_REGEX.sub('', name)
        base = re.sub(r'[-_]{2,}', '-', base)
        base = re.sub(r'[-_]+$', '', base)
        base = re.sub(r'^[-_]+', '', base)
        return base if base else None, 'after'
    
    return None, 'unknown'


def normalize_base_name(base: str) -> str:
    """Normalize base name for comparison (lowercase, strip extensions)."""
    # Remove file extension
    base = re.sub(r'\.[^.]+$', '', base)
    return base.lower()


def match_before_after(before_files: List[str], after_files: List[str]) -> MatchResult:
    """
    Match before and after files based on filename patterns.
    
    Args:
        before_files: List of before image filenames
        after_files: List of after image filenames
        
    Returns:
        MatchResult with matched pairs and unmatched files
    """
    # Build lookup: normalized_base_name -> list of (filename, original_index)
    before_by_base = defaultdict(list)
    for i, fname in enumerate(before_files):
        base, marker = extract_base_name(fname)
        if base:
            norm_base = normalize_base_name(base)
            before_by_base[norm_base].append((fname, i))
    
    after_by_base = defaultdict(list)
    for i, fname in enumerate(after_files):
        base, marker = extract_base_name(fname)
        if base:
            norm_base = normalize_base_name(base)
            after_by_base[norm_base].append((fname, i))
    
    matched_pairs = []
    used_before = set()
    used_after = set()
    
    # First pass: high confidence matches (exact base name match)
    all_bases = set(before_by_base.keys()) | set(after_by_base.keys())
    
    for base in all_bases:
        before_list = before_by_base.get(base, [])
        after_list = after_by_base.get(base, [])
        
        if before_list and after_list:
            # Take first available from each (in order)
            for b_fname, b_idx in before_list:
                if b_idx in used_before:
                    continue
                for a_fname, a_idx in after_list:
                    if a_idx in used_after:
                        continue
                    
                    # Determine confidence
                    # High: both have clear before/after markers
                    b_base, b_marker = extract_base_name(b_fname)
                    a_base, a_marker = extract_base_name(a_fname)
                    
                    if b_marker == 'before' and a_marker == 'after':
                        confidence = 'high'
                    elif b_marker != 'unknown' and a_marker != 'unknown':
                        confidence = 'medium'
                    else:
                        confidence = 'low'
                    
                    matched_pairs.append(MatchedPair(
                        before_file=b_fname,
                        after_file=a_fname,
                        confidence=confidence,
                        base_name=base
                    ))
                    used_before.add(b_idx)
                    used_after.add(a_idx)
                    break  # Move to next before file
    
    # Collect unmatched
    unmatched_before = [fname for i, fname in enumerate(before_files) if i not in used_before]
    unmatched_after = [fname for i, fname in enumerate(after_files) if i not in used_after]
    
    # Second pass: if counts match exactly and no markers found, use sequential fallback
    if (not matched_pairs and len(before_files) == len(after_files) and 
        all(extract_base_name(f)[1] == 'unknown' for f in before_files + after_files)):
        # All files have unknown markers but counts match - use sequential
        for i, (b_fname, a_fname) in enumerate(zip(before_files, after_files)):
            matched_pairs.append(MatchedPair(
                before_file=b_fname,
                after_file=a_fname,
                confidence='low',
                base_name=f'pair_{i+1}'
            ))
        unmatched_before = []
        unmatched_after = []
    
    return MatchResult(
        matched_pairs=matched_pairs,
        unmatched_before=unmatched_before,
        unmatched_after=unmatched_after
    )


def validate_image_file(filename: str, max_size_mb: int = 10) -> Tuple[bool, Optional[str]]:
    """
    Validate an uploaded image file.
    
    Args:
        filename: Original filename
        max_size_mb: Maximum file size in MB
        
    Returns:
        (is_valid, error_message)
    """
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
    ext = filename.lower().rsplit('.', 1)[-1] if '.' in filename else ''
    
    if f'.{ext}' not in allowed_extensions:
        return False, f'Unsupported format: .{ext}. Allowed: JPG, PNG, WebP, GIF'
    
    return True, None
