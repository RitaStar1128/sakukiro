from PIL import Image
import numpy as np

def crop_border(input_path, output_path):
    img = Image.open(input_path).convert("RGB")
    width, height = img.size
    pixels = img.load()

    # 中心点の色（背景色と仮定）
    center_x, center_y = width // 2, height // 2
    bg_color = pixels[center_x, center_y]
    
    print(f"Center color: {bg_color}")

    # 枠線の色（黒に近い色と仮定）
    # しきい値を設定して黒を判定
    def is_black(color):
        return sum(color) < 50  # RGBの和が小さい＝黒

    # 内側のコンテンツ領域（枠線の内側）を探す
    # 中心から外側に向かって、黒い枠線に当たるまで探索するのが確実か？
    # いや、枠線の中に黒い要素（稲妻の縁取りなど）があるかもしれない。
    
    # 外側から内側へ探索する
    # 構造：[外側余白(オレンジ)] -> [黒枠] -> [内側背景(オレンジ)] -> [アイコン]
    # 目標：[黒枠]の内側の境界を見つけること

    # 左端の特定
    left = 0
    # まず外側の余白をスキップ（もしあれば）
    for x in range(center_x):
        if is_black(pixels[x, center_y]):
            # 黒枠に入った
            # 黒枠が終わるまで進む
            for x2 in range(x, center_x):
                if not is_black(pixels[x2, center_y]):
                    left = x2
                    break
            break
    
    # 右端の特定
    right = width - 1
    for x in range(width - 1, center_x, -1):
        if is_black(pixels[x, center_y]):
            for x2 in range(x, center_x, -1):
                if not is_black(pixels[x2, center_y]):
                    right = x2
                    break
            break

    # 上端の特定
    top = 0
    for y in range(center_y):
        if is_black(pixels[center_x, y]):
            for y2 in range(y, center_y):
                if not is_black(pixels[center_x, y2]):
                    top = y2
                    break
            break

    # 下端の特定
    bottom = height - 1
    for y in range(height - 1, center_y, -1):
        if is_black(pixels[center_x, y]):
            for y2 in range(y, center_y, -1):
                if not is_black(pixels[center_x, y2]):
                    bottom = y2
                    break
            break
            
    print(f"Crop coords: left={left}, top={top}, right={right}, bottom={bottom}")
    
    # クロップ実行
    # 少し余裕を持たせるか、ギリギリにするか。
    # 枠線を完全に消したいので、検出された境界そのままで良いはず。
    if left < right and top < bottom:
        cropped_img = img.crop((left, top, right + 1, bottom + 1))
        cropped_img.save(output_path)
        print(f"Saved cropped image to {output_path}")
    else:
        print("Failed to detect border properly.")

if __name__ == "__main__":
    input_path = "/home/ubuntu/kaimono-kiroku/client/public/images/original-icon.png"
    output_path = "/home/ubuntu/kaimono-kiroku/client/public/images/icon-sakukiro.png"
    crop_border(input_path, output_path)
    
    # ダークモード用にもコピー
    output_path_dark = "/home/ubuntu/kaimono-kiroku/client/public/images/icon-sakukiro-dark.png"
    crop_border(input_path, output_path_dark)
