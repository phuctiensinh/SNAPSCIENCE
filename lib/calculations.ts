/**
 * Pure calculation functions for SnapScience interactive calculators and experiments.
 * All formulas use standard SI or specified units.
 */

/**
 * Calculates wheel circumference and total distance traveled.
 * @param radiusCm - Wheel radius in centimeters
 * @param rotations - Number of rotations
 * @returns object containing circumference in meters and total distance in meters
 */
export function calculateWheel(radiusCm: number, rotations: number) {
  const radiusM = radiusCm / 100
  const circumferenceM = 2 * Math.PI * radiusM
  const totalDistanceM = circumferenceM * rotations

  return {
    radiusM: Number(radiusM.toFixed(4)),
    circumferenceM: Number(circumferenceM.toFixed(2)),
    totalDistanceM: Number(totalDistanceM.toFixed(2)),
    formula: 'C = 2πr | S = C × n'
  }
}

/**
 * Calculates energy consumption for an electrical device/lightbulb.
 * @param powerWatts - Power rating in Watts
 * @param hoursPerDay - Operating hours per day
 * @param days - Number of days (default 30)
 */
export function calculateLightbulbEnergy(powerWatts: number, hoursPerDay: number, days = 30) {
  const kWhPerDay = (powerWatts * hoursPerDay) / 1000
  const totalKWh = kWhPerDay * days
  // Standard electric price estimate ~3,000 VND / kWh
  const estimatedCostVND = Math.round(totalKWh * 3000)

  return {
    powerWatts,
    hoursPerDay,
    kWhPerDay: Number(kWhPerDay.toFixed(3)),
    totalKWh: Number(totalKWh.toFixed(2)),
    estimatedCostVND,
    formula: 'E (kWh) = (P (W) × t (h)) / 1000'
  }
}

/**
 * Calculates stair incline slope percentage and steepness angle.
 * @param heightCm - Total vertical rise in cm
 * @param lengthCm - Total horizontal run in cm
 */
export function calculateStairIncline(heightCm: number, lengthCm: number) {
  if (lengthCm <= 0) {
    return { slopePercent: 0, angleDegrees: 0, formula: 'Slope = Rise / Run' }
  }
  const slopeRatio = heightCm / lengthCm
  const slopePercent = slopeRatio * 100
  const angleRadians = Math.atan(slopeRatio)
  const angleDegrees = (angleRadians * 180) / Math.PI

  return {
    slopePercent: Number(slopePercent.toFixed(1)),
    angleDegrees: Number(angleDegrees.toFixed(1)),
    formula: 'Slope = (Rise / Run) × 100% | θ = arctan(Rise / Run)'
  }
}

/**
 * Calculates light reflection angle on a mirror surface.
 * According to the Law of Reflection: Angle of Incidence = Angle of Reflection.
 * @param incidentAngleDeg - Angle of incidence in degrees
 */
export function calculateMirrorReflection(incidentAngleDeg: number) {
  const reflectionAngleDeg = incidentAngleDeg
  const deviationAngleDeg = 180 - 2 * incidentAngleDeg

  return {
    incidentAngleDeg,
    reflectionAngleDeg,
    deviationAngleDeg,
    formula: 'θ_r = θ_i | θ_đổi hướng = 180° - 2θ_i'
  }
}

/**
 * Calculates relative photosynthesis activity index based on light intensity and duration.
 * @param lightIntensityLux - Light intensity in lux (e.g. 1,000 to 50,000)
 * @param exposureHours - Hours of light per day
 */
export function calculatePlantPhotosynthesis(lightIntensityLux: number, exposureHours: number) {
  // Photosynthesis saturation model approximation
  const maxLux = 30000
  const efficiency = Math.min(lightIntensityLux / maxLux, 1.0)
  const energyIndex = Math.round(efficiency * exposureHours * 10)

  return {
    lightIntensityLux,
    exposureHours,
    efficiencyPercent: Math.round(efficiency * 100),
    energyIndex,
    formula: 'Chỉ số quang hợp = Hiệu suất quang hợp × Thời gian chiếu sáng'
  }
}
