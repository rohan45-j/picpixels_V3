import io
import os
from pathlib import Path
from PIL import Image, ImageOps
from django.core.files.base import ContentFile

def compress_uploaded_image(file_obj, max_dimension=1920, quality=82):
    """
    Takes an uploaded file object (e.g. from an ImageField),
    downscales if > max_dimension, and compresses with Pillow.
    Returns a ContentFile if optimized, or None if no optimization needed/possible.
    """
    if not file_obj or not hasattr(file_obj, 'file'):
        return None

    filename = getattr(file_obj, 'name', '')
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png']:
        return None

    try:
        file_obj.seek(0)
        orig_size = getattr(file_obj, 'size', 0)
        if orig_size and orig_size < 150 * 1024:
            return None

        with Image.open(file_obj) as img:
            try:
                img = ImageOps.exif_transpose(img)
            except Exception:
                pass

            orig_w, orig_h = img.size
            needs_resize = orig_w > max_dimension or orig_h > max_dimension

            if not needs_resize and orig_size and orig_size < 300 * 1024:
                return None

            if needs_resize:
                img.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)

            output = io.BytesIO()

            if ext in ['.jpg', '.jpeg']:
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                img.save(output, format='JPEG', quality=quality, optimize=True, progressive=True)
            elif ext == '.png':
                if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                    try:
                        q_img = img.quantize(colors=256, method=Image.Quantize.FASTOCTREE)
                        q_img.save(output, format='PNG', optimize=True)
                    except Exception:
                        img.save(output, format='PNG', optimize=True)
                else:
                    img.save(output, format='PNG', optimize=True)

            optimized_data = output.getvalue()
            if not orig_size or len(optimized_data) < orig_size:
                return ContentFile(optimized_data, name=filename)
    except Exception as e:
        print(f"[ImageOptimizer] Warning: failed to compress {filename}: {e}")

    return None
