import os
import sys
import io
from pathlib import Path
from PIL import Image, ImageOps

MEDIA_DIR = Path(__file__).resolve().parent / 'media'
MAX_DIMENSION = 1920
QUALITY = 82

def optimize_image(file_path: Path, dry_run: bool = False):
    try:
        orig_size = file_path.stat().st_size
        if orig_size < 120 * 1024:  # Skip already small images (< 120KB)
            return None

        ext = file_path.suffix.lower()
        if ext not in ['.jpg', '.jpeg', '.png']:
            return None

        with Image.open(file_path) as img:
            try:
                img = ImageOps.exif_transpose(img)
            except Exception:
                pass

            orig_w, orig_h = img.size
            needs_resize = orig_w > MAX_DIMENSION or orig_h > MAX_DIMENSION

            if needs_resize:
                img.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.Resampling.LANCZOS)

            output_io = io.BytesIO()

            if ext in ['.jpg', '.jpeg']:
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                img.save(output_io, format='JPEG', quality=QUALITY, optimize=True, progressive=True)
            elif ext == '.png':
                if orig_size > 250 * 1024:
                    # Quantize heavy PNGs to 256 colors for 80%+ size reduction
                    try:
                        q_img = img.quantize(colors=256, method=Image.Quantize.FASTOCTREE)
                        q_img.save(output_io, format='PNG', optimize=True)
                    except Exception:
                        img.save(output_io, format='PNG', optimize=True)
                else:
                    img.save(output_io, format='PNG', optimize=True)

            new_bytes = output_io.getvalue()
            new_size = len(new_bytes)

            if new_size < orig_size:
                savings = (orig_size - new_size) / orig_size * 100
                if not dry_run:
                    with open(file_path, 'wb') as f:
                        f.write(new_bytes)
                return {
                    'path': str(file_path.relative_to(MEDIA_DIR)),
                    'orig_size': orig_size,
                    'new_size': new_size,
                    'savings': savings,
                    'dims': f"{orig_w}x{orig_h} -> {img.size[0]}x{img.size[1]}"
                }
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
    return None

def main():
    dry_run = '--dry-run' in sys.argv
    print(f"Scanning media directory: {MEDIA_DIR} (dry_run={dry_run})...")

    if not MEDIA_DIR.exists():
        print("Media directory not found!")
        return

    total_orig = 0
    total_new = 0
    count = 0

    for root, _, files in os.walk(MEDIA_DIR):
        for f in files:
            p = Path(root) / f
            result = optimize_image(p, dry_run=dry_run)
            if result:
                count += 1
                total_orig += result['orig_size']
                total_new += result['new_size']
                orig_mb = result['orig_size'] / (1024 * 1024)
                new_kb = result['new_size'] / 1024
                print(f"[{count}] {result['path']} ({result['dims']}): {orig_mb:.2f}MB -> {new_kb:.1f}KB ({result['savings']:.1f}% saved)")

    saved_mb = (total_orig - total_new) / (1024 * 1024)
    print("\n--------------------------------------------------")
    print(f"Total optimized files: {count}")
    print(f"Original total size: {total_orig / (1024 * 1024):.2f} MB")
    print(f"New total size:      {total_new / (1024 * 1024):.2f} MB")
    print(f"Total saved:         {saved_mb:.2f} MB")
    print("--------------------------------------------------")

if __name__ == '__main__':
    main()
