import hashlib
import json
import shutil
import sys
from pathlib import Path

import numpy as np
import onnxruntime as ort
from huggingface_hub import hf_hub_download
from ultralytics import YOLO


ROOT = Path(__file__).resolve().parent
MODEL_DIR = ROOT / "frontend" / "public" / "models"
MODEL_DEST = MODEL_DIR / "lunar_crater_detector.onnx"

REPO_ID = "huseyincavus/lunar-trn-ft-real"
WEIGHT_NAME = "best.pt"
EXPECTED_SHA256 = "9ac00b954522f64752cae30b5c1eee3a9a1fcd287f9324e8976068d08f3a6d6d"

IMAGE_SIZE = 1024


def sha256_file(path):
    digest = hashlib.sha256()

    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)

    return digest.hexdigest()


def main():
    print(f"Downloading checkpoint: {REPO_ID}/{WEIGHT_NAME}")

    checkpoint = Path(
        hf_hub_download(
            repo_id=REPO_ID,
            filename=WEIGHT_NAME
        )
    )

    actual_hash = sha256_file(checkpoint)

    if actual_hash.lower() != EXPECTED_SHA256:
        raise RuntimeError(
            f"Checkpoint SHA-256 mismatch.\n"
            f"Expected: {EXPECTED_SHA256}\n"
            f"Received: {actual_hash}"
        )

    print(f"Checkpoint verified: {checkpoint.stat().st_size / (1024 * 1024):.1f} MiB")

    model = YOLO(str(checkpoint))
    names = model.names
    class_names = list(names.values()) if isinstance(names, dict) else list(names)

    if len(class_names) != 1:
        raise RuntimeError(f"Expected one crater class, received: {class_names}")

    print(f"Classes: {class_names}")
    print(f"Exporting ONNX at {IMAGE_SIZE}x{IMAGE_SIZE}")

    exported = model.export(
        format="onnx",
        imgsz=IMAGE_SIZE,
        dynamic=False,
        simplify=True,
        opset=18,
        nms=False
    )

    exported_path = Path(exported)

    if not exported_path.is_file():
        raise FileNotFoundError(f"ONNX export not found: {exported_path}")

    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    if exported_path.resolve() != MODEL_DEST.resolve():
        shutil.copy2(exported_path, MODEL_DEST)

    session = ort.InferenceSession(
        str(MODEL_DEST),
        providers=["CPUExecutionProvider"]
    )

    inputs = session.get_inputs()
    outputs = session.get_outputs()

    if not inputs or not outputs:
        raise RuntimeError("ONNX model has no input or output tensors")

    input_shape = inputs[0].shape
    output_shapes = [output.shape for output in outputs]

    if len(input_shape) != 4 or input_shape[1:] != [3, IMAGE_SIZE, IMAGE_SIZE]:
        raise RuntimeError(f"Unexpected ONNX input shape: {input_shape}")

    if len(output_shapes[0]) != 3:
        raise RuntimeError(f"Unexpected output shape: {output_shapes}")

    feature_axis_ok = (
        output_shapes[0][1] in (5, 6)
        or output_shapes[0][2] in (5, 6)
    )

    if not feature_axis_ok:
        raise RuntimeError(f"Unexpected crater output: {output_shapes[0]}")

    dummy = np.zeros(
        (1, 3, IMAGE_SIZE, IMAGE_SIZE),
        dtype=np.float32
    )

    results = session.run(
        None,
        {inputs[0].name: dummy}
    )

    if not results or not np.isfinite(results[0]).all():
        raise RuntimeError("ONNX smoke test failed")

    manifest = {
        "model_id": REPO_ID,
        "model_name": "Lunar TRN Real-Domain Crater Detector",
        "architecture": "YOLO26s",
        "task": "Single-class crater object detection",
        "class_names": class_names,
        "input_size": IMAGE_SIZE,
        "input_shape": input_shape,
        "output_shapes": output_shapes,
        "confidence_threshold": 0.25,
        "nms_iou_threshold": 0.7,
        "max_detections": 300,
        "checkpoint_sha256": actual_hash,
        "onnx_file": "frontend/public/models/lunar_crater_detector.onnx",
        "weights_license": "MIT (as stated by model card)",
        "model_card": "https://huggingface.co/huseyincavus/lunar-trn-ft-real",
        "source_repository": "https://github.com/huseyincavusbi/lunar-trn"
    }

    manifest_path = ROOT / "frontend" / "public" / "vision" / "crater_model_manifest.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)

    manifest_path.write_text(
        json.dumps(manifest, indent=2) + "\n",
        encoding="utf-8"
    )

    print("\nCrater model exported and validated successfully.")
    print(f"Model: {MODEL_DEST}")
    print(f"Size: {MODEL_DEST.stat().st_size / (1024 * 1024):.1f} MiB")
    print(f"Input: {input_shape}")
    print(f"Output: {output_shapes}")
    print(f"Manifest: {manifest_path}")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"\nCrater model setup failed: {exc}", file=sys.stderr)
        raise SystemExit(1)
