import cv2
import numpy as np
from sklearn.cluster import DBSCAN


def build_red_mask(hsv):
    masks = [
        cv2.inRange(hsv, np.array([0,   80, 60]), np.array([5,   255, 255])),
        cv2.inRange(hsv, np.array([170, 80, 60]), np.array([180, 255, 255])),
        cv2.inRange(hsv, np.array([5,   80, 60]), np.array([25,  255, 255])),
    ]
    return cv2.bitwise_or(masks[0], cv2.bitwise_or(masks[1], masks[2]))


def build_custom_color_mask(hsv, h: float, s: float, v: float,
                            h_margin: float = 15, s_margin: float = 60, v_margin: float = 70):
    s_lo = int(max(30,  s - s_margin))
    s_hi = int(min(255, s + s_margin))
    v_lo = int(max(40,  v - v_margin))
    v_hi = int(min(255, v + v_margin))
    h_lo = h - h_margin
    h_hi = h + h_margin
    if h_lo < 0:
        m1 = cv2.inRange(hsv, np.array([0,            s_lo, v_lo]), np.array([int(h_hi), s_hi, v_hi]))
        m2 = cv2.inRange(hsv, np.array([int(h_lo+180), s_lo, v_lo]), np.array([180,       s_hi, v_hi]))
        return cv2.bitwise_or(m1, m2)
    if h_hi > 180:
        m1 = cv2.inRange(hsv, np.array([int(h_lo), s_lo, v_lo]), np.array([180,           s_hi, v_hi]))
        m2 = cv2.inRange(hsv, np.array([0,         s_lo, v_lo]), np.array([int(h_hi-180), s_hi, v_hi]))
        return cv2.bitwise_or(m1, m2)
    return cv2.inRange(hsv, np.array([int(h_lo), s_lo, v_lo]), np.array([int(h_hi), s_hi, v_hi]))


def build_red_mask_lab(img):
    lab  = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l_ch = lab[:, :, 0]
    a_ch = lab[:, :, 1]
    valid = (l_ch > 40) & (l_ch < 240)
    total = int(valid.sum())
    if total > 1000:
        clearly_red = float(((a_ch > 148) & valid).sum()) / total
        threshold = 148 if clearly_red > 0.001 else max(float(np.percentile(a_ch[valid], 99)), 138)
    else:
        threshold = 148
    return ((a_ch > threshold) & (l_ch > 40) & (l_ch < 240)).astype(np.uint8) * 255


def remove_lines(mask, w_img, h_img):
    min_horiz = max(int(w_img * 0.08), 80)
    min_vert  = max(int(h_img * 0.08), 80)
    h_ker = cv2.getStructuringElement(cv2.MORPH_RECT, (min_horiz, 1))
    horiz = cv2.morphologyEx(mask, cv2.MORPH_OPEN, h_ker, iterations=2)
    mask  = cv2.subtract(mask, horiz)
    v_ker = cv2.getStructuringElement(cv2.MORPH_RECT, (1, min_vert))
    vert  = cv2.morphologyEx(mask, cv2.MORPH_OPEN, v_ker, iterations=3)
    return cv2.subtract(mask, vert)


def _cluster_blobs(blobs):
    if len(blobs) < 2:
        return blobs
    heights  = sorted(b[3] for b in blobs)
    median_h = heights[len(heights) // 2]
    eps      = max(int(median_h * 0.8), 35)
    centroids = np.array([[b[0] + b[2] / 2, b[1] + b[3] / 2] for b in blobs])
    labels    = DBSCAN(eps=eps, min_samples=1).fit_predict(centroids)
    result = []
    for cid in set(labels):
        members = [blobs[i] for i, lbl in enumerate(labels) if lbl == cid]
        x1 = min(b[0]         for b in members)
        y1 = min(b[1]         for b in members)
        x2 = max(b[0] + b[2] for b in members)
        y2 = max(b[1] + b[3] for b in members)
        result.append([x1, y1, x2 - x1, y2 - y1])
    return result


def _filter_phrases(blobs):
    if not blobs:
        return blobs
    avg_h = sum(b[3] for b in blobs) / len(blobs)
    y_tol = max(int(avg_h * 1.2), 40)
    lines = []
    for blob in sorted(blobs, key=lambda b: b[1]):
        cy = blob[1] + blob[3] // 2
        placed = False
        for line in lines:
            lcy = sum(b[1] + b[3] // 2 for b in line) / len(line)
            if abs(cy - lcy) < y_tol:
                line.append(blob)
                placed = True
                break
        if not placed:
            lines.append([blob])
    return [b for line in lines if len(line) <= 10 for b in line]


def _filter_outliers(blobs):
    if len(blobs) <= 2:
        return blobs
    ys  = sorted(b[1] + b[3] // 2 for b in blobs)
    med = ys[len(ys) // 2]
    mad = max(sorted(abs(y - med) for y in ys)[len(ys) // 2], 40)
    return [b for b in blobs if abs((b[1] + b[3] // 2) - med) <= mad * 4]


def detect_text_zone(img):
    h, w = img.shape[:2]
    lab      = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    red_excl = (lab[:, :, 1] > 145).astype(np.uint8) * 255
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    dark = cv2.bitwise_and(
        ((gray < 180).astype(np.uint8) * 255),
        cv2.bitwise_not(red_excl)
    )
    dark = cv2.dilate(dark, np.ones((12, 12), np.uint8), iterations=2)
    sw = max(1, w // 50)
    sh = max(1, h // 50)
    col_proj = np.convolve(np.sum(dark > 0, axis=0).astype(float), np.ones(sw) / sw, mode='same')
    row_proj = np.convolve(np.sum(dark > 0, axis=1).astype(float), np.ones(sh) / sh, mode='same')
    th     = max(col_proj.max(), row_proj.max()) * 0.02
    margin = int(min(w, h) * 0.015)
    col_ok = np.where(col_proj > th)[0]
    row_ok = np.where(row_proj > th)[0]
    x1 = max(0, int(col_ok[0])  - margin) if len(col_ok) else 0
    x2 = min(w, int(col_ok[-1]) + margin) if len(col_ok) else w
    y1 = max(0, int(row_ok[0])  - margin) if len(row_ok) else 0
    y2 = min(h, int(row_ok[-1]) + margin) if len(row_ok) else h
    return x1, y1, x2, y2


def extract_rois(img, target_hsv=None, verbose=False, filter_phrases=True):
    h_img, w_img = img.shape[:2]
    tx1, ty1, tx2, ty2 = detect_text_zone(img)
    if target_hsv is not None:
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        mask_full = build_custom_color_mask(hsv, *target_hsv)
    else:
        mask_full = build_red_mask_lab(img)
    zone      = np.zeros_like(mask_full)
    zone[ty1:ty2, tx1:tx2] = 255
    mask = cv2.bitwise_and(mask_full, zone)
    mask = remove_lines(mask, w_img, h_img)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN,  np.ones((2, 2), np.uint8), iterations=1)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((4, 4), np.uint8), iterations=1)
    mask = cv2.dilate(mask, np.ones((2, 2), np.uint8), iterations=1)
    n, _, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    min_h    = h_img * 0.002
    max_h    = h_img * 0.18
    min_area = 40
    max_area = (max_h ** 2) * 2.5
    border   = int(min(w_img, h_img) * 0.01)
    raw = []
    for i in range(1, n):
        x    = stats[i, cv2.CC_STAT_LEFT]
        y    = stats[i, cv2.CC_STAT_TOP]
        w    = stats[i, cv2.CC_STAT_WIDTH]
        h    = stats[i, cv2.CC_STAT_HEIGHT]
        area = stats[i, cv2.CC_STAT_AREA]
        if not (min_area <= area <= max_area):       continue
        if not (min_h <= h <= max_h):                continue
        if not (0.2 <= w / h <= 3.0):               continue
        if area / (w * h) < 0.1:                    continue
        if x <= border or y <= border:              continue
        if x + w >= w_img - border or y + h >= h_img - border: continue
        raw.append([x, y, w, h])
    raw = _cluster_blobs(raw)
    raw = [b for b in raw if b[2] <= w_img * 0.25 and b[3] <= h_img * 0.20 and b[2] <= b[3] * 8]
    if filter_phrases:
        raw = _filter_phrases(raw)
    return _filter_outliers(raw)


def roi_to_emnist(roi_bgr, target_hsv=None):
    hsv = cv2.cvtColor(roi_bgr, cv2.COLOR_BGR2HSV)
    if target_hsv is not None:
        mask = build_custom_color_mask(hsv, *target_hsv)
    else:
        mask = build_red_mask(hsv)
    mask = cv2.dilate(mask, np.ones((2, 2), np.uint8), iterations=1)
    h, w = mask.shape[:2]
    n, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    if n > 2:
        areas    = [stats[i, cv2.CC_STAT_AREA] for i in range(1, n)]
        main_idx = int(np.argmax(areas)) + 1
        bar_mask = np.zeros_like(mask)
        for i in range(1, n):
            if i == main_idx:
                continue
            bw_c = stats[i, cv2.CC_STAT_WIDTH]
            bh_c = stats[i, cv2.CC_STAT_HEIGHT]
            cy   = stats[i, cv2.CC_STAT_TOP] + bh_c / 2
            if bw_c > bh_c * 2 and bw_c > w * 0.20 and cy < h * 0.45:
                bar_mask[labels == i] = 255
        letter_mask = cv2.subtract(mask, bar_mask)
        if cv2.countNonZero(letter_mask) > 40:
            mask = letter_mask
    canvas = np.full((h, w), 255, dtype=np.uint8)
    canvas[mask > 0] = 30
    return cv2.cvtColor(canvas, cv2.COLOR_GRAY2BGR)
