/* Shared game state: the variables that several modules reassign (position, mode, the boat's motion, the fight,
   the save object...). Read and write them as shared.name; values that only one module changes stay in that module. */
export const shared = {};
