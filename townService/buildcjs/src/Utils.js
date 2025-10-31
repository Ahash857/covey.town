"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logError = exports.removeThisFunctionCallWhenYouImplementThis = void 0;
/**
 * This function exists solely to help satisfy the linter + typechecker when it looks over the
 * stubbed (not yet implemented by you) functions. Remove calls to it as you go.
 *
 * @param _args
 */
// eslint-disable-next-line
function removeThisFunctionCallWhenYouImplementThis(_args1, _args2) {
    return new Error('Unimplemented');
}
exports.removeThisFunctionCallWhenYouImplementThis = removeThisFunctionCallWhenYouImplementThis;
// eslint-disable-next-line
function logError(err) {
    // eslint-disable-next-line no-console
    console.trace(err);
}
exports.logError = logError;
