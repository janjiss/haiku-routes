#!/usr/bin/env python3
"""Length-weighted GPX overlap against source/, including reversed/subset routes.

Uses midpoint samples <=10 m apart and point-to-segment distance (25 m default).
A corridor is a conservative proximity test, not proof that parallel paths match.
Track segment boundaries are respected; no artificial connections are measured.
"""
import argparse
import json
import math
from pathlib import Path
import xml.etree.ElementTree as ET


def read_gpx(path):
    root = ET.parse(path).getroot()
    tracks = root.findall('.//{*}trk')
    name = tracks[0].findtext('{*}name') if tracks else path.stem
    lines = []
    for segment in root.findall('.//{*}trkseg'):
        points = [(float(p.attrib['lon']), float(p.attrib['lat']))
                  for p in segment.findall('{*}trkpt')]
        if not all(math.isfinite(x) and math.isfinite(y) and -180 <= x <= 180
                   and -90 <= y <= 90 for x, y in points):
            raise ValueError(f'Invalid coordinate: {path}')
        if len(points) > 1:
            lines.append(points)
    if not lines:
        raise ValueError(f'No track segments: {path}')
    return name or path.stem, lines


def project(lines, origin):
    lon, lat = origin
    sx = 6371000 * math.pi / 180 * math.cos(math.radians(lat))
    sy = 6371000 * math.pi / 180
    return [[((x-lon)*sx, (y-lat)*sy) for x, y in line] for line in lines]


def segments(lines):
    return [(a, b) for line in lines for a, b in zip(line, line[1:]) if a != b]


def samples(lines, spacing=10):
    for a, b in segments(lines):
        length = math.dist(a, b)
        count = math.ceil(length / spacing)
        for i in range(count):
            t = (i + .5) / count
            yield (a[0]+t*(b[0]-a[0]), a[1]+t*(b[1]-a[1])), length/count


def distance_squared(p, a, b):
    dx, dy = b[0]-a[0], b[1]-a[1]
    t = max(0, min(1, ((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)))
    return (p[0]-a[0]-t*dx)**2 + (p[1]-a[1]-t*dy)**2


class Corridor:
    def __init__(self, lines, tolerance):
        self.tolerance = tolerance
        self.grid = {}
        for a, b in segments(lines):
            for x in range(math.floor((min(a[0], b[0])-tolerance)/100),
                           math.floor((max(a[0], b[0])+tolerance)/100)+1):
                for y in range(math.floor((min(a[1], b[1])-tolerance)/100),
                               math.floor((max(a[1], b[1])+tolerance)/100)+1):
                    self.grid.setdefault((x, y), []).append((a, b))

    def contains(self, point):
        return any(distance_squared(point, a, b) <= self.tolerance**2
                   for a, b in self.grid.get((math.floor(point[0]/100), math.floor(point[1]/100)), []))


def bbox(lines):
    p = [p for line in lines for p in line]
    return min(x for x,y in p), min(y for x,y in p), max(x for x,y in p), max(y for x,y in p)


def nearby(a, b, tolerance):
    return not (a[2]+tolerance < b[0] or b[2]+tolerance < a[0]
                or a[3]+tolerance < b[1] or b[3]+tolerance < a[1])


def audit(candidate, catalog, tolerance=25):
    name, raw = read_gpx(candidate)
    origin = raw[0][0]
    lines = project(raw, origin)
    points = list(samples(lines))
    length = sum(w for p,w in points)
    bounds = bbox(lines)
    union = set()
    matches = []
    for other in catalog:
        if other.resolve() == candidate.resolve():
            continue
        other_name, other_raw = read_gpx(other)
        other_lines = project(other_raw, origin)
        if not nearby(bounds, bbox(other_lines), tolerance):
            continue
        corridor = Corridor(other_lines, tolerance)
        hit = {i for i,(p,w) in enumerate(points) if corridor.contains(p)}
        if not hit:
            continue
        union.update(hit)
        shared = sum(points[i][1] for i in hit)
        reverse_corridor = Corridor(lines, tolerance)
        reverse_points = list(samples(other_lines))
        reverse_total = sum(w for p,w in reverse_points)
        reverse_shared = sum(w for p,w in reverse_points if reverse_corridor.contains(p))
        matches.append(dict(file=str(other), name=other_name, sharedMeters=round(shared,1),
                            candidateOverlapPercent=round(100*shared/length,2),
                            existingOverlapPercent=round(100*reverse_shared/reverse_total,2)))
    union_length = sum(points[i][1] for i in union)
    return dict(file=str(candidate), name=name, toleranceMeters=tolerance, sampleSpacingMeters=10,
                distanceMeters=round(length,1), overlapWithCatalogMeters=round(union_length,1),
                overlapWithCatalogPercent=round(100*union_length/length,2),
                matches=sorted(matches,key=lambda m:-m['sharedMeters']))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('candidates', type=Path, nargs='+')
    parser.add_argument('--catalog', type=Path, default=Path('source'))
    parser.add_argument('--tolerance', type=float, default=25)
    args = parser.parse_args()
    if args.tolerance <= 0:
        parser.error('tolerance must be positive')
    catalog = sorted(args.catalog.glob('*.gpx'))
    print(json.dumps([audit(p,catalog,args.tolerance) for p in args.candidates],indent=2,ensure_ascii=False))

if __name__ == '__main__':
    main()
