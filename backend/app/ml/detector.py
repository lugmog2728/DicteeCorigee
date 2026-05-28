import cv2
import numpy as np
from PIL import Image
from pathlib import Path
from app.ml.roi_extractor import extract_rois, roi_to_emnist

MODEL_PATH = Path(__file__).parent / 'weights' / 'best.pt'
CONFIDENCE = 0.35

_model = None


def get_model():
    global _model
    if _model is None:
        from ultralytics import YOLO
        _model = YOLO(str(MODEL_PATH))
    return _model


def _classify(model, img: np.ndarray, x: int, y: int, w: int, h: int, target_hsv=None):
    pad = max(10, int(max(w, h) * 0.2))
    h_img, w_img = img.shape[:2]
    x1, y1 = max(0, x - pad), max(0, y - pad)
    x2, y2 = min(w_img, x + w + pad), min(h_img, y + h + pad)

    roi = img[y1:y2, x1:x2]
    roi_pil = Image.fromarray(cv2.cvtColor(roi_to_emnist(roi, target_hsv=target_hsv), cv2.COLOR_BGR2RGB))

    results = model(roi_pil, verbose=False)
    probs = results[0].probs
    conf = probs.top1conf.item()
    cls_name = results[0].names[probs.top1]

    if conf < CONFIDENCE:
        return None, conf
    return cls_name, conf


def detect_letters(image_bytes: bytes, target_hsv: tuple | None = None) -> list[dict]:
    arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Image illisible")

    model = get_model()
    rois = extract_rois(img, target_hsv=target_hsv)
    results = []

    for (x, y, w, h) in rois:
        letter, conf = _classify(model, img, x, y, w, h, target_hsv=target_hsv)
        if letter:
            results.append({
                'letter': letter,
                'confidence': round(conf, 3),
                'x': x, 'y': y, 'w': w, 'h': h,
            })

    return results
