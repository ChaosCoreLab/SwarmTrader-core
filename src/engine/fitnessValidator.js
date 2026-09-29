/** @see ../../docs/architecture/simulator-overview.md#components */
const VALID_STATES = new Set(['NW', 'N', 'NE', 'W', 'C', 'E', 'SW', 'S', 'SE']);
const VALID_REASONS = new Set(['signal', 'sell', 'take profit', 'stop loss']);

export class FitnessValidator {
  validate(trace) {
    const errors = [];
    const warnings = [];
    let openQuantity = 0;
    let previousTime = '';
    let operationCount = 0;

    if (!Array.isArray(trace) || trace.length === 0) {
      return { valid: false, checkedBars: 0, checkedOperations: 0, errors: ['Trace is empty.'], warnings };
    }

    for (const frame of trace) {
      if (!frame || typeof frame.time !== 'string' || (previousTime && frame.time <= previousTime)) {
        errors.push(`Invalid or unordered frame at ${frame?.time ?? 'unknown date'}.`);
        continue;
      }
      previousTime = frame.time;
      if (!VALID_STATES.has(frame.state)) errors.push(`Unknown algorithm state at ${frame.time}.`);
      if (![frame.iirPrice1, frame.iirPrice2, frame.iirVolume1, frame.iirVolume2].every(Number.isFinite)) {
        errors.push(`Non-finite IIR value at ${frame.time}.`);
      }

      for (const operation of frame.operations ?? []) {
        operationCount++;
        if (operation.time !== frame.time) errors.push(`Operation timestamp mismatch at ${frame.time}.`);
        if (!['buy', 'sell'].includes(operation.side)) errors.push(`Invalid operation side at ${frame.time}.`);
        if (!VALID_REASONS.has(operation.reason)) errors.push(`Invalid operation reason at ${frame.time}.`);
        if (!Number.isFinite(operation.price) || operation.price <= 0) errors.push(`Invalid operation price at ${frame.time}.`);
        if (!Number.isFinite(operation.quantity) || operation.quantity <= 0) errors.push(`Invalid operation quantity at ${frame.time}.`);

        const bar = frame.bar;
        if (!bar) errors.push(`Operation has no OHLC bar at ${frame.time}.`);
        if (operation.side === 'buy') {
          if (operation.price < bar.low || operation.price > bar.high) errors.push(`Buy price is outside its OHLC range at ${frame.time}.`);
          if (Math.abs(operation.price - bar.open) > 1e-8) errors.push(`Buy price differs from Consilium open at ${frame.time}.`);
          openQuantity += operation.quantity;
        } else {
          if (operation.reason === 'take profit' && bar.high < operation.price) {
            errors.push(`Take-profit threshold was not reached at ${frame.time}.`);
          }
          if (operation.reason === 'stop loss' && bar.low > operation.price) {
            errors.push(`Stop-loss threshold was not reached at ${frame.time}.`);
          }
          if (operation.reason === 'sell' && (operation.price < bar.low || operation.price > bar.high)) {
            errors.push(`Signal sell price is outside its OHLC range at ${frame.time}.`);
          }
          if (operation.quantity > openQuantity) errors.push(`Sell quantity exceeds open quantity at ${frame.time}.`);
          else openQuantity -= operation.quantity;
        }
      }
    }

    if (openQuantity > 0) warnings.push(`${openQuantity} shares remain open at the end of the snapshot; no forced liquidation was added.`);

    return {
      valid: errors.length === 0,
      checkedBars: trace.length,
      checkedOperations: operationCount,
      errors,
      warnings,
    };
  }
}