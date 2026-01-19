from PIL import Image
import os

input_path = "/home/ubuntu/kaimono-kiroku/client/public/images/original-icon.webp"
output_path = "/home/ubuntu/kaimono-kiroku/client/public/images/original-icon.png"

try:
    img = Image.open(input_path)
    img.save(output_path, "PNG")
    print(f"Converted {input_path} to {output_path}")
except Exception as e:
    print(f"Error converting image: {e}")
