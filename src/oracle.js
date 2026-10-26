/**
 * Smart Meter & Grid Oracle Engine
 * Feeds verified real-world telemetry (generation, consumption, irradiance, grid frequency) into Smart Contracts
 */

class SmartMeterOracle {
  constructor() {
    this.weatherCondition = 'SUNNY'; // SUNNY, PARTLY_CLOUDY, OVERCAST, NIGHT
    this.solarIrradiance = 850; // W/m^2
    this.gridFrequency = 50.01; // Hz
    this.gridVoltage = 230.4; // Volts
    this.utilityGridPrice = 0.24; // $/kWh (Utility baseline comparison)

    // Telemetry per Household
    this.meters = {
      HOUSEHOLD_A: {
        id: 'METER_SOLAR_001',
        owner: 'HOUSEHOLD_A',
        name: 'Household A (Solar Producer)',
        panelCapacityKw: 6.5,
        currentGenerationKw: 4.8,
        currentConsumptionKw: 1.2,
        batteryStorageKwh: 0,
        batteryMaxKwh: 0,
        netExcessKwh: 24.6,
        totalGeneratedKwh: 312.4,
        totalConsumedKwh: 120.8,
        activeAppliances: ['Lighting (0.2kW)', 'Fridge (0.3kW)', 'Computers (0.7kW)'],
        lastUpdated: Date.now()
      },
      HOUSEHOLD_B: {
        id: 'METER_CONS_002',
        owner: 'HOUSEHOLD_B',
        name: 'Household B (Consumer)',
        panelCapacityKw: 0,
        currentGenerationKw: 0,
        currentConsumptionKw: 3.4,
        batteryStorageKwh: 0,
        batteryMaxKwh: 0,
        netExcessKwh: 0,
        totalGeneratedKwh: 0,
        totalConsumedKwh: 285.0,
        activeAppliances: ['HVAC Air Conditioning (2.0kW)', 'EV Charger (8.0kW - Standby)', 'Appliances (1.4kW)'],
        lastUpdated: Date.now()
      },
      HOUSEHOLD_C: {
        id: 'METER_PROS_003',
        owner: 'HOUSEHOLD_C',
        name: 'Household C (Prosumer & Storage)',
        panelCapacityKw: 4.5,
        currentGenerationKw: 3.2,
        currentConsumptionKw: 2.1,
        batteryStorageKwh: 9.8,
        batteryMaxKwh: 13.5,
        netExcessKwh: 14.2,
        totalGeneratedKwh: 240.2,
        totalConsumedKwh: 198.5,
        activeAppliances: ['Heat Pump (1.5kW)', 'Lighting & Entertainment (0.6kW)'],
        lastUpdated: Date.now()
      }
    };

    this.oracleUpdateHistory = [];
  }

  setWeather(condition) {
    this.weatherCondition = condition;
    let factor = 1.0;
    if (condition === 'SUNNY') {
      this.solarIrradiance = 920;
      factor = 1.0;
    } else if (condition === 'PARTLY_CLOUDY') {
      this.solarIrradiance = 520;
      factor = 0.58;
    } else if (condition === 'OVERCAST') {
      this.solarIrradiance = 210;
      factor = 0.22;
    } else if (condition === 'NIGHT') {
      this.solarIrradiance = 0;
      factor = 0.0;
    }

    // Update solar generation dynamically across prosumers
    for (const key of Object.keys(this.meters)) {
      const meter = this.meters[key];
      if (meter.panelCapacityKw > 0) {
        meter.currentGenerationKw = Number((meter.panelCapacityKw * factor * 0.85).toFixed(2));
      }
      meter.lastUpdated = Date.now();
    }

    this.recordOracleEvent(`Weather updated to ${condition}. Irradiance: ${this.solarIrradiance} W/m²`);
  }

  toggleApplianceLoad(householdId, applianceName, loadKw) {
    const meter = this.meters[householdId];
    if (!meter) return;

    const existingIndex = meter.activeAppliances.findIndex(a => a.startsWith(applianceName));
    if (existingIndex >= 0) {
      meter.activeAppliances.splice(existingIndex, 1);
      meter.currentConsumptionKw = Math.max(0.5, Number((meter.currentConsumptionKw - loadKw).toFixed(2)));
    } else {
      meter.activeAppliances.push(`${applianceName} (${loadKw}kW)`);
      meter.currentConsumptionKw = Number((meter.currentConsumptionKw + loadKw).toFixed(2));
    }

    meter.lastUpdated = Date.now();
    this.recordOracleEvent(`Appliance toggled for ${meter.name}: ${applianceName} (${loadKw} kW)`);
  }

  recordEnergyTransfer(producerId, consumerId, kwh) {
    if (this.meters[producerId]) {
      this.meters[producerId].netExcessKwh = Math.max(0, Number((this.meters[producerId].netExcessKwh - kwh).toFixed(2)));
      this.meters[producerId].lastUpdated = Date.now();
    }
    if (this.meters[consumerId]) {
      this.meters[consumerId].totalConsumedKwh = Number((this.meters[consumerId].totalConsumedKwh + kwh).toFixed(2));
      this.meters[consumerId].lastUpdated = Date.now();
    }
    this.recordOracleEvent(`Meter reading verified transfer: ${kwh} kWh from ${producerId} to ${consumerId}`);
  }

  recordOracleEvent(detail) {
    const entry = {
      timestamp: Date.now(),
      time: new Date().toLocaleTimeString(),
      detail,
      oracleSignature: `ORACLE_SIG_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };
    this.oracleUpdateHistory.unshift(entry);
    if (this.oracleUpdateHistory.length > 30) this.oracleUpdateHistory.pop();
  }

  getHouseholdMeter(householdId) {
    return this.meters[householdId] || null;
  }

  getAllMeters() {
    return this.meters;
  }

  getGridTelemetry() {
    // Add realistic micro-variations
    const jitter = (Math.random() - 0.5) * 0.04;
    this.gridFrequency = Number((50.0 + jitter).toFixed(2));
    return {
      weather: this.weatherCondition,
      irradiance: this.solarIrradiance,
      frequency: this.gridFrequency,
      voltage: this.gridVoltage,
      utilityBaselinePrice: this.utilityGridPrice,
      gridStatus: this.gridFrequency >= 49.95 && this.gridFrequency <= 50.05 ? 'OPTIMAL / BALANCED' : 'FLUCTUATION_DETECTED'
    };
  }
}

module.exports = { SmartMeterOracle };
