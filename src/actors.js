/**
 * Users, Actors, and Role-Based Access Control (RBAC)
 */

const INITIAL_USERS = {
  HOUSEHOLD_A: {
    id: 'HOUSEHOLD_A',
    name: 'Household A (Solar Producer)',
    role: 'PRODUCER', // PRODUCER, CONSUMER, PROSUMER, GRID_OPERATOR, ADMIN
    address: '0xA17f864e29C4dB3412E8Bf00a5C384e9D7F491E2',
    tokenBalance: 420.50, // USD or Energy Tokens
    gridFeederId: 'FEEDER_NORTH_03',
    solarCapacityKw: 6.5,
    batteryCapacityKwh: 0,
    avatar: '☀️'
  },
  HOUSEHOLD_B: {
    id: 'HOUSEHOLD_B',
    name: 'Household B (Consumer)',
    role: 'CONSUMER',
    address: '0xB89d271cC19830Fe98B76302488a0F67A1009B82',
    tokenBalance: 250.00,
    gridFeederId: 'FEEDER_NORTH_03',
    solarCapacityKw: 0,
    batteryCapacityKwh: 0,
    avatar: '🔌'
  },
  HOUSEHOLD_C: {
    id: 'HOUSEHOLD_C',
    name: 'Household C (Prosumer & Battery)',
    role: 'PROSUMER',
    address: '0xC34e8971Bae761c5690A45330e719Fb90D6c4391',
    tokenBalance: 310.75,
    gridFeederId: 'FEEDER_WEST_01',
    solarCapacityKw: 4.5,
    batteryCapacityKwh: 13.5,
    avatar: '🔋'
  },
  GRID_OPERATOR: {
    id: 'GRID_OPERATOR',
    name: 'Municipal Grid Operator Node #04',
    role: 'GRID_OPERATOR',
    address: '0xGRID_OPERATOR_NODE_01',
    tokenBalance: 1540.00,
    gridFeederId: 'SUBSTATION_PRIMARY',
    isValidator: true,
    avatar: '⚡'
  },
  ADMIN: {
    id: 'ADMIN',
    name: 'Energy Consortium Network Admin',
    role: 'ADMIN',
    address: '0xADMIN_ROOT_CONSORTIUM_MASTER',
    tokenBalance: 9999.00,
    gridFeederId: 'CENTRAL_CONTROL',
    isValidator: true,
    avatar: '🛡️'
  }
};

const PERMISSIONS = {
  CREATE_ENERGY_OFFER: ['PRODUCER', 'PROSUMER', 'ADMIN'],
  BUY_ENERGY: ['CONSUMER', 'PROSUMER', 'ADMIN'],
  MINE_BLOCK_POA: ['GRID_OPERATOR', 'ADMIN'],
  SIMULATE_TAMPER: ['ADMIN', 'GRID_OPERATOR'],
  CONFIGURE_NETWORK: ['ADMIN'],
  VIEW_AUDIT_LOGS: ['PRODUCER', 'CONSUMER', 'PROSUMER', 'GRID_OPERATOR', 'ADMIN']
};

function hasPermission(role, action) {
  const allowedRoles = PERMISSIONS[action];
  if (!allowedRoles) return false;
  return allowedRoles.includes(role);
}

module.exports = { INITIAL_USERS, PERMISSIONS, hasPermission };
