import json
import sys
from pathlib import Path

import numpy as np
import de421
from jplephem import Ephemeris

AU_KM = 149597870.700
C_KM_S = 299792.458
ARCSEC = np.pi / 648000.0
JD_START, JD_END, STEP_DAYS = 2439126.5, 2469807.5, 0.5

ROOT = Path(__file__).resolve().parent
DEFAULT_OUT = ROOT / "frontend" / "public" / "data"


def rx(a):
    c, s = np.cos(a), np.sin(a)
    o, z = np.ones_like(c), np.zeros_like(c)
    return np.array([[o, z, z], [z, c, s], [z, -s, c]])


def ry(a):
    c, s = np.cos(a), np.sin(a)
    o, z = np.ones_like(c), np.zeros_like(c)
    return np.array([[c, z, -s], [z, o, z], [s, z, c]])


def rz(a):
    c, s = np.cos(a), np.sin(a)
    o, z = np.ones_like(c), np.zeros_like(c)
    return np.array([[c, s, z], [-s, c, z], [z, z, o]])


PA_TO_ME = rx(np.float64(-0.30 * ARCSEC)) @ ry(np.float64(-78.56 * ARCSEC)) @ rz(np.float64(-67.92 * ARCSEC))


def moon_vectors(eph, jd_tdb, frame="ME"):
    jd = np.atleast_1d(np.asarray(jd_tdb, dtype=np.float64))
    emb, mgeo = eph.position("earthmoon", jd), eph.position("moon", jd)
    earth = emb - mgeo * eph.earth_share
    moon = earth + mgeo
    lt = np.linalg.norm(eph.position("sun", jd) - moon, axis=0) / C_KM_S / 86400.0
    sun = eph.position("sun", jd - lt)
    s_icrf, e_icrf = sun - moon, earth - moon
    phi, theta, psi = eph.position("librations", jd)
    R = np.einsum("ijn,jkn,kln->iln", rz(psi), rx(theta), rz(phi))
    if frame == "ME":
        R = np.einsum("ij,jkn->ikn", PA_TO_ME, R)
    s = np.einsum("ijn,jn->in", R, s_icrf) / AU_KM
    e = np.einsum("ijn,jn->in", R, e_icrf)
    return s, e


def build_ephemeris(out_dir):
    eph = Ephemeris(de421)
    count = int(round((JD_END - JD_START) / STEP_DAYS)) + 1
    jd = JD_START + STEP_DAYS * np.arange(count)
    output = np.empty((count, 6), dtype=np.float32)

    for start in range(0, count, 4096):
        end = min(start + 4096, count)
        sun, earth = moon_vectors(eph, jd[start:end])
        output[start:end, :3], output[start:end, 3:] = sun.T, earth.T

    out_dir.mkdir(parents=True, exist_ok=True)
    output.tofile(out_dir / "ephemeris.bin")

    metadata = {
        "format": "float32 little-endian, 6 values per sample: sunX,sunY,sunZ (AU), earthX,earthY,earthZ (km)",
        "origin": "Moon centre",
        "frame": "MOON_ME (DE421 mean Earth / polar axis)",
        "ephemeris": "JPL DE421 (PyPI de421 2008.1)",
        "timeScale": "TT (treated as TDB; difference < 2 ms)",
        "jdStart": JD_START,
        "stepDays": STEP_DAYS,
        "count": count,
        "corrections": {"sunLightTime": True, "stellarAberration": False, "earthLightTime": False},
        "interpolation": "Catmull-Rom cubic between samples; never extrapolate",
        "references": [
            "Folkner, Williams & Boggs (2009), JPL IPN PR 42-178 (DE421)",
            "Williams, Boggs & Folkner (2008), DE421 Lunar Orbit, Physical Librations, and Surface Coordinates"
        ]
    }

    with open(out_dir / "ephemeris.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"Generated {count:,} samples | {output.nbytes:,} bytes")
    print(f"Output: {out_dir}")


if __name__ == "__main__":
    destination = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_OUT
    build_ephemeris(destination)
