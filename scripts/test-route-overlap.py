#!/usr/bin/env python3
"""Run: python3 scripts/test-route-overlap.py"""
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('overlap', Path(__file__).with_name('check-route-overlap.py'))
overlap = importlib.util.module_from_spec(spec)
spec.loader.exec_module(overlap)


class OverlapTests(unittest.TestCase):
    def coverage(self, candidate, existing=None):
        corridor = overlap.Corridor(existing or [[(0, 0), (1000, 0)]], 25)
        points = list(overlap.samples(candidate))
        return sum(w for p,w in points if corridor.contains(p)) / sum(w for p,w in points)

    def test_reverse_and_subset_are_duplicates(self):
        self.assertEqual(self.coverage([[(1000,0),(0,0)]]), 1)
        self.assertEqual(self.coverage([[(200,0),(800,0)]]), 1)

    def test_gps_offset_is_tolerated(self):
        self.assertEqual(self.coverage([[(0,20),(1000,20)]]), 1)
        self.assertEqual(self.coverage([[(0,100),(1000,100)]]), 0)

    def test_crossing_is_not_a_duplicate(self):
        self.assertAlmostEqual(self.coverage([[(500,-500),(500,500)]]), .06, delta=.011)

    def test_track_segment_gap_is_not_connected(self):
        self.assertEqual(self.coverage([[(400,0),(600,0)]],
                                      [[(0,0),(100,0)],[(900,0),(1000,0)]]), 0)

    def test_length_weighting_not_point_density(self):
        existing = [[(0,0),(100,0)]]
        sparse = [[(0,0),(1000,0)]]
        dense_start = [[(i,0) for i in range(101)] + [(1000,0)]]
        self.assertAlmostEqual(self.coverage(sparse, existing),
                               self.coverage(dense_start, existing), delta=.011)

    def test_out_and_back_is_fully_shared_with_outbound(self):
        self.assertEqual(self.coverage([[(0,0),(1000,0),(0,0)]]), 1)

if __name__ == '__main__':
    unittest.main()
