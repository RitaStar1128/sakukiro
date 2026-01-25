from PIL import Image
import os

# Source image path
source_path = "/home/ubuntu/kaimono-kiroku/client/public/icon_wallet_orange_2.png"
output_dir = "/home/ubuntu/kaimono-kiroku/client/public"

# Target sizes and filenames
targets = [
    {"size": (192, 192), "name": "pwa-192x192.png"},
    {"size": (512, 512), "name": "pwa-512x512.png"},
    {"size": (180, 180), "name": "apple-touch-icon.png"},
    {"size": (64, 64), "name": "favicon.ico"} # Simple ICO generation
]

try:
    img = Image.open(source_path)
    
    for target in targets:
        resized_img = img.resize(target["size"], Image.Resampling.LANCZOS)
        output_path = os.path.join(output_dir, target["name"])
        
        if target["name"].endswith(".ico"):
            # For ICO, we can save directly. Pillow handles basic ICO creation.
            resized_img.save(output_path, format='ICO')
        else:
            resized_img.save(output_path, format='PNG')
            
        print(f"Generated: {output_path}")

except Exception as e:
    print(f"Error generating icons: {e}")
