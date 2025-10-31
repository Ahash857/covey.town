"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const twilio_1 = __importDefault(require("twilio"));
const Utils_1 = require("../Utils");
dotenv_1.default.config();
// 1 hour: each client will time out after 1 hour of video and need to refresh
const MAX_ALLOWED_SESSION_DURATION = 3600;
const MISSING_TOKEN_NAME = 'missing';
class TwilioVideo {
    constructor(twilioAccountSid, twilioAPIKeySID, twilioAPIKeySecret) {
        this._twilioAccountSid = twilioAccountSid;
        this._twilioApiKeySID = twilioAPIKeySID;
        this._twilioApiKeySecret = twilioAPIKeySecret;
    }
    static getInstance() {
        if (!TwilioVideo._instance) {
            TwilioVideo._instance = new TwilioVideo(process.env.TWILIO_ACCOUNT_SID || MISSING_TOKEN_NAME, process.env.TWILIO_API_KEY_SID || MISSING_TOKEN_NAME, process.env.TWILIO_API_KEY_SECRET || MISSING_TOKEN_NAME);
        }
        return TwilioVideo._instance;
    }
    async getTokenForTown(coveyTownID, clientIdentity) {
        if (this._twilioAccountSid === MISSING_TOKEN_NAME ||
            this._twilioApiKeySID === MISSING_TOKEN_NAME ||
            this._twilioApiKeySecret === MISSING_TOKEN_NAME) {
            (0, Utils_1.logError)('Twilio tokens missing. Video chat will be disabled, and viewing areas will not work. Please be sure to configure the variables in the townService .env file as described in the README');
            return MISSING_TOKEN_NAME;
        }
        const token = new twilio_1.default.jwt.AccessToken(this._twilioAccountSid, this._twilioApiKeySID, this._twilioApiKeySecret, {
            ttl: MAX_ALLOWED_SESSION_DURATION,
        });
        token.identity = clientIdentity;
        const videoGrant = new twilio_1.default.jwt.AccessToken.VideoGrant({ room: coveyTownID });
        token.addGrant(videoGrant);
        return token.toJwt();
    }
}
exports.default = TwilioVideo;
