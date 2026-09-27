import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateWheel,
  calculateLightbulbEnergy,
  calculateStairIncline,
  calculateMirrorReflection,
  calculatePlantPhotosynthesis
} from './calculations.ts'

test('calculateWheel calculates correct circumference and distance', () => {
  // Radius = 30 cm (0.3m), Rotations = 10
  // C = 2 * PI * 0.3 = 1.88495... -> 1.88 m
  // Total distance = 1.88495... * 10 = 18.8495... -> 18.85 m
  const result = calculateWheel(30, 10)
  assert.equal(result.radiusM, 0.3)
  assert.equal(result.circumferenceM, 1.88)
  assert.equal(result.totalDistanceM, 18.85)
})

test('calculateLightbulbEnergy calculates correct energy and cost', () => {
  // 60W bulb, 5 hours/day, 30 days
  // Daily kWh = 60 * 5 / 1000 = 0.3 kWh
  // Total kWh = 0.3 * 30 = 9 kWh
  // Cost = 9 * 3000 = 27,000 VND
  const result = calculateLightbulbEnergy(60, 5, 30)
  assert.equal(result.kWhPerDay, 0.3)
  assert.equal(result.totalKWh, 9)
  assert.equal(result.estimatedCostVND, 27000)
})

test('calculateStairIncline calculates correct slope and angle', () => {
  // Height = 100 cm, Length = 100 cm -> Slope 100%, Angle 45 deg
  const result = calculateStairIncline(100, 100)
  assert.equal(result.slopePercent, 100)
  assert.equal(result.angleDegrees, 45)
})

test('calculateMirrorReflection returns law of reflection', () => {
  // Incident angle 30 deg -> Reflection angle 30 deg
  const result = calculateMirrorReflection(30)
  assert.equal(result.reflectionAngleDeg, 30)
  assert.equal(result.deviationAngleDeg, 120)
})

test('calculatePlantPhotosynthesis calculates efficiency index', () => {
  const result = calculatePlantPhotosynthesis(15000, 8)
  assert.equal(result.efficiencyPercent, 50)
  assert.equal(result.energyIndex, 40)
})
